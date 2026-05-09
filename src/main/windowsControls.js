const { execFile } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');

const {
  enumerateCaptureEndpoints,
  getCaptureMuteState,
  getDefaultCaptureEndpointIds,
  setCaptureMuted
} = require('./coreAudio');
const { broadcastSettingChange, runElevated } = require('./win32');

const CONSENT_STORE = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore';
const NOTIFICATION_SETTINGS = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings';
const PERSONALIZE_SETTINGS = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize';
const SYSTEM_ROOT = process.env.SystemRoot || 'C:\\Windows';
const PNPUTIL_PATH = path.join(SYSTEM_ROOT, 'System32', 'pnputil.exe');
const NETWORK_INTERFACE_IGNORE = ['vethernet', 'tailscale', 'loopback', 'isatap', 'teredo'];
const POWER_SAVER_SCHEME_GUID = 'a1841308-3541-4fab-bc81-f71556f20b4a';
const BALANCED_SCHEME_GUID = '381b4222-f694-41f0-9685-ff5bb260df2e';
const STATE_DIR = path.join(process.env.APPDATA || process.env.LOCALAPPDATA || process.cwd(), 'Windows Notch Overlay');
const POWER_PLAN_STATE_FILE = path.join(STATE_DIR, 'previous-power-plan.json');

const PRIVACY_CAPABILITIES = {
  camera: 'webcam',
  microphone: 'microphone'
};

const ENDPOINT_NAME_PROPERTY = '{b3f8fa53-0004-438e-9003-51a46e139bfc},6';
const ENDPOINT_FORM_PROPERTY = '{a45c254e-df1c-4efd-8020-67d146a850e0},2';

function run(command, args, timeoutMs = 3500) {
  return new Promise((resolve, reject) => {
    execFile(command, args, {
      windowsHide: true,
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024 * 4
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }

      resolve(stdout.toString());
    });
  });
}

async function readRegistryValue(keyPath, valueName) {
  try {
    const output = await run('reg.exe', ['query', keyPath, '/v', valueName]);
    const match = output.match(new RegExp(`${valueName}\\s+REG_\\w+\\s+(.+)`, 'i'));
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

async function writeRegistryString(keyPath, valueName, value) {
  await run('reg.exe', ['add', keyPath, '/v', valueName, '/t', 'REG_SZ', '/d', value, '/f']);
}

async function writeRegistryDword(keyPath, valueName, value) {
  await run('reg.exe', ['add', keyPath, '/v', valueName, '/t', 'REG_DWORD', '/d', String(value), '/f']);
}

function parseRegistryDword(value) {
  if (!value) {
    return null;
  }

  const text = String(value).trim();
  if (text.toLowerCase().startsWith('0x')) {
    return Number.parseInt(text, 16);
  }

  const parsed = Number.parseInt(text, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

async function listRegistrySubkeys(keyPath) {
  try {
    const output = await run('reg.exe', ['query', keyPath]);
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith(`${keyPath}\\`));
  } catch {
    return [];
  }
}

async function writeExistingChildConsentValues(keyPath, value) {
  const subkeys = await listRegistrySubkeys(keyPath);
  await Promise.all(subkeys.map(async (subkey) => {
    const current = await readRegistryValue(subkey, 'Value');
    if (current) {
      await writeRegistryString(subkey, 'Value', value);
    }
  }));
}

function consentKey(capability, subkey = '') {
  return `${CONSENT_STORE}\\${capability}${subkey ? `\\${subkey}` : ''}`;
}

async function getPrivacyState(kind) {
  const capability = PRIVACY_CAPABILITIES[kind];
  const value = await readRegistryValue(consentKey(capability), 'Value');
  const nonPackagedValue = await readRegistryValue(consentKey(capability, 'NonPackaged'), 'Value');
  const denied = value === 'Deny' || nonPackagedValue === 'Deny';

  return {
    enabled: !denied,
    label: denied ? 'Kapalı' : 'Açık',
    source: 'Windows gizlilik'
  };
}

async function setPrivacyState(kind, enabled) {
  const capability = PRIVACY_CAPABILITIES[kind];
  const value = enabled ? 'Allow' : 'Deny';

  await writeRegistryString(consentKey(capability), 'Value', value);
  await writeRegistryString(consentKey(capability, 'NonPackaged'), 'Value', value);
  await writeExistingChildConsentValues(consentKey(capability), value);
  return getPrivacyState(kind);
}

async function togglePrivacyState(kind) {
  const current = await getPrivacyState(kind);
  return setPrivacyState(kind, !current.enabled);
}

function parsePnPDevices(output) {
  return output
    .split(/\r?\n\s*\r?\n/)
    .map((block) => {
      const instanceId = block.match(/Instance ID:\s*(.+)/i)?.[1]?.trim();
      const description = block.match(/Device Description:\s*(.+)/i)?.[1]?.trim();
      const status = block.match(/Status:\s*(.+)/i)?.[1]?.trim();
      const manufacturer = block.match(/Manufacturer Name:\s*(.+)/i)?.[1]?.trim();
      return { instanceId, description, status, manufacturer };
    })
    .filter((device) => device.description);
}

function isUserBluetoothDevice(device) {
  const text = `${device.description} ${device.manufacturer || ''}`.toLowerCase();
  const ignored = [
    'microsoft bluetooth',
    'bluetooth device',
    'adapter',
    'avrcp transport',
    'hizmeti',
    'service',
    'profil',
    'profile',
    'numaraland',
    'enumerator',
    'öznitelik',
    'oz nitelik',
    'erişim',
    'erisim'
  ];

  return device.status === 'Started' && !ignored.some((part) => text.includes(part));
}

async function getBluetoothState() {
  try {
    const output = await run('pnputil.exe', ['/enum-devices', '/connected', '/class', 'Bluetooth']);
    const devices = parsePnPDevices(output);
    const radioEnabled = devices.some((device) => device.status === 'Started');
    const connectedDevices = devices.filter(isUserBluetoothDevice);

    if (!radioEnabled) {
      return {
        enabled: false,
        connected: false,
        label: 'Kapalı',
        detail: 'Radyo yok'
      };
    }

    if (connectedDevices.length > 0) {
      return {
        enabled: true,
        connected: true,
        label: 'Bağlı',
        detail: connectedDevices[0].description,
        count: connectedDevices.length
      };
    }

    return {
      enabled: true,
      connected: false,
      label: 'Açık',
      detail: 'Bağlı aygıt yok',
      count: 0
    };
  } catch {
    return {
      enabled: null,
      connected: null,
      label: 'Bilinmiyor',
      detail: 'Windows durumu okunamadı'
    };
  }
}

function isBluetoothRadioDevice(device) {
  const text = `${device.description} ${device.manufacturer || ''}`.toLowerCase();
  const positive = [
    'wireless bluetooth',
    'bluetooth adapter',
    'bluetooth radio',
    'intel',
    'realtek',
    'mediatek',
    'broadcom',
    'qualcomm'
  ];
  const negative = [
    'avrcp',
    'hands-free',
    'handsfree',
    'le generic',
    'gatt',
    'rfcomm',
    'service',
    'profile',
    'enumerator',
    'hid',
    'jbl',
    'headset',
    'headphone'
  ];

  return Boolean(device.instanceId)
    && positive.some((part) => text.includes(part))
    && !negative.some((part) => text.includes(part));
}

async function getBluetoothRadioDevices() {
  const output = await run('pnputil.exe', ['/enum-devices', '/class', 'Bluetooth']);
  return parsePnPDevices(output).filter(isBluetoothRadioDevice);
}

function isAdminRequiredError(error) {
  const text = String(error?.message || error || '').toLowerCase();
  return text.includes('administrator')
    || text.includes('yönetici')
    || text.includes('yonetici')
    || text.includes('access is denied')
    || text.includes('denied')
    || text.includes('erişim engellendi')
    || text.includes('erisim engellendi')
    || text.includes('engellendi')
    || text.includes('failed to enable device')
    || text.includes('failed to disable device');
}

function quoteCmdArg(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function runElevatedPnPSequence(command, devices) {
  for (const device of devices) {
    runElevated(PNPUTIL_PATH, `${command} ${quoteCmdArg(device.instanceId)}`);
  }

  return {
    ok: true,
    pending: true,
    elevated: true,
    count: devices.length
  };
}

function assertPnPSuccess(output) {
  if (/failed to (enable|disable) device/i.test(output)) {
    throw new Error(output.trim());
  }
}

async function setPnPDevicesEnabled(devices, enabled) {
  const targetDevices = devices.filter((device) => (
    enabled ? device.status !== 'Started' : device.status === 'Started'
  ));

  if (!devices.length) {
    return {
      ok: false,
      message: 'Aygıt bulunamadı.'
    };
  }

  if (!targetDevices.length) {
    return {
      ok: true,
      pending: false,
      elevated: false,
      count: 0
    };
  }

  const command = enabled ? '/enable-device' : '/disable-device';
  const changed = [];

  for (const device of targetDevices) {
    try {
      const output = await run('pnputil.exe', [command, device.instanceId], 10000);
      assertPnPSuccess(output);
      changed.push(device);
    } catch (error) {
      if (isAdminRequiredError(error)) {
        const remaining = targetDevices.filter((item) => !changed.includes(item));
        return runElevatedPnPSequence(command, remaining.length ? remaining : targetDevices);
      }

      return {
        ok: false,
        message: error.message || 'Aygıt durumu değiştirilemedi.'
      };
    }
  }

  return {
    ok: true,
    pending: false,
    elevated: false,
    count: targetDevices.length
  };
}

function isAudioCaptureDevice(device) {
  return Boolean(device.instanceId)
    && device.instanceId.toUpperCase().startsWith('SWD\\MMDEVAPI\\{0.0.1.');
}

async function getAudioCaptureDevices() {
  try {
    const output = await run('pnputil.exe', ['/enum-devices', '/class', 'AudioEndpoint']);
    return parsePnPDevices(output).filter(isAudioCaptureDevice);
  } catch {
    return [];
  }
}

function endpointGuidFromId(id) {
  return String(id || '').match(/\.\{([0-9a-f-]+)\}$/i)?.[1] || '';
}

function endpointRegistryKey(id) {
  const guid = endpointGuidFromId(id);
  return guid ? `HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\MMDevices\\Audio\\Capture\\{${guid}}\\Properties` : '';
}

async function getEndpointRegistryInfo(id) {
  const key = endpointRegistryKey(id);
  if (!key) {
    return {
      id,
      name: '',
      form: ''
    };
  }

  const [name, form] = await Promise.all([
    readRegistryValue(key, ENDPOINT_NAME_PROPERTY),
    readRegistryValue(key, ENDPOINT_FORM_PROPERTY)
  ]);

  return {
    id,
    name: name || '',
    form: form || ''
  };
}

async function getAudioCaptureState() {
  const [devices, muteState] = await Promise.all([
    getAudioCaptureDevices(),
    Promise.resolve().then(() => getCaptureMuteState()).catch(() => null)
  ]);
  const defaults = Promise.resolve().then(() => getDefaultCaptureEndpointIds()).catch(() => ({}));

  if (!devices.length) {
    return {
      enabled: muteState?.available ? !muteState.allMuted : null,
      label: 'Yok',
      detail: muteState?.available ? `${muteState.activeCount} giriş aktif` : 'Mikrofon aygıtı bulunamadı',
      devices,
      muteState,
      defaults: await defaults
    };
  }

  const enabledDevices = devices.filter((device) => device.status === 'Started');
  const disabledDevices = devices.filter((device) => device.status !== 'Started');
  const coreAudioEnabled = muteState?.available ? !muteState.allMuted : null;
  const isEnabled = coreAudioEnabled !== null ? coreAudioEnabled : enabledDevices.length > 0;

  return {
    enabled: isEnabled,
    label: isEnabled ? 'Açık' : 'Kapalı',
    detail: isEnabled
      ? `${muteState?.activeCount || enabledDevices.length} giriş aktif`
      : 'Girişler sessize alındı',
    devices,
    disabledDevices,
    muteState,
    defaults: await defaults,
    count: enabledDevices.length
  };
}

async function getMicrophoneState() {
  const [privacy, capture] = await Promise.all([
    getPrivacyState('microphone'),
    getAudioCaptureState()
  ]);

  const blockedByPrivacy = privacy.enabled === false;
  const blockedByDevice = capture.enabled === false;

  if (blockedByPrivacy || blockedByDevice) {
    return {
      enabled: false,
      label: 'Kapalı',
      detail: blockedByPrivacy ? 'Gizlilik izni kapalı' : capture.detail,
      source: 'Core Audio + Windows gizlilik'
    };
  }

  return {
    enabled: true,
    label: 'Açık',
    detail: capture.detail,
    source: 'Core Audio + Windows gizlilik'
  };
}

async function setMicrophoneState(enabled) {
  if (enabled) {
    await setPrivacyState('microphone', true);
  }

  const capture = await getAudioCaptureState();
  if (capture.enabled === null && !capture.devices.length) {
    return {
      ok: false,
      message: 'Mikrofon aygıtı bulunamadı.'
    };
  }

  const muteResult = await Promise.resolve()
    .then(() => setCaptureMuted(!enabled))
    .catch((error) => ({
      ok: false,
      message: error.message || 'Mikrofon sessize alma durumu değiştirilemedi.'
    }));

  if (!muteResult.ok) {
    return muteResult;
  }

  if (enabled && capture.disabledDevices?.length) {
    const repairResult = await setPnPDevicesEnabled(capture.disabledDevices, true);
    return {
      ...repairResult,
      repairedDisabledEndpoints: true,
      enabled: true
    };
  }

  return {
    ok: true,
    pending: false,
    elevated: false,
    count: muteResult.count,
    enabled
  };
}

async function toggleMicrophoneState() {
  const current = await getMicrophoneState();
  return setMicrophoneState(!current.enabled);
}

function releaseMicrophoneMute() {
  return setCaptureMuted(false);
}

async function getDarkModeState() {
  const [appsValue, systemValue] = await Promise.all([
    readRegistryValue(PERSONALIZE_SETTINGS, 'AppsUseLightTheme'),
    readRegistryValue(PERSONALIZE_SETTINGS, 'SystemUsesLightTheme')
  ]);

  const appsLight = parseRegistryDword(appsValue);
  const systemLight = parseRegistryDword(systemValue);

  if (appsLight === null && systemLight === null) {
    return {
      enabled: null,
      label: 'Bilinmiyor',
      detail: 'Tema durumu okunamadı'
    };
  }

  const isDark = appsLight === 0 && systemLight === 0;
  return {
    enabled: isDark,
    label: isDark ? 'Açık' : 'Kapalı',
    detail: isDark ? 'Koyu tema' : 'Açık tema'
  };
}

async function setDarkModeState(enabled) {
  const value = enabled ? 0 : 1;

  await Promise.all([
    writeRegistryDword(PERSONALIZE_SETTINGS, 'AppsUseLightTheme', value),
    writeRegistryDword(PERSONALIZE_SETTINGS, 'SystemUsesLightTheme', value)
  ]);
  broadcastSettingChange('ImmersiveColorSet');
  return getDarkModeState();
}

async function toggleDarkModeState() {
  const current = await getDarkModeState();
  return setDarkModeState(current.enabled !== true);
}

async function getBatterySaverState() {
  const hasBattery = await hasSystemBattery();

  if (!hasBattery) {
    const activePlan = await getActivePowerScheme();
    const enabled = isPowerSaverScheme(activePlan);

    return {
      enabled,
      label: enabled ? 'Açık' : 'Kapalı',
      detail: activePlan.name ? `Plan: ${activePlan.name}` : 'Güç planı'
    };
  }

  try {
    const output = await run('powercfg.exe', ['/qh', 'SCHEME_CURRENT', 'SUB_ENERGYSAVER', 'ESBATTTHRESHOLD']);
    const match = output.match(/Current DC Power Setting Index:\s*0x([0-9a-f]+)/i);
    const threshold = match ? Number.parseInt(match[1], 16) : null;

    if (threshold === null || Number.isNaN(threshold)) {
      return {
        enabled: null,
        label: 'Bilinmiyor',
        detail: 'Eşik okunamadı'
      };
    }

    return {
      enabled: threshold >= 100,
      label: threshold >= 100 ? 'Açık' : 'Kapalı',
      detail: `Eşik %${threshold}`
    };
  } catch {
    return {
      enabled: null,
      label: 'Yok',
      detail: 'Bu cihazda destek yok'
    };
  }
}

async function toggleBatterySaverState() {
  const hasBattery = await hasSystemBattery();

  if (!hasBattery) {
    const activePlan = await getActivePowerScheme();
    if (isPowerSaverScheme(activePlan)) {
      const previousPlan = await readPreviousPowerPlan();
      await run('powercfg.exe', ['/setactive', previousPlan || BALANCED_SCHEME_GUID], 8000);
      return getBatterySaverState();
    }

    await rememberPowerPlan(activePlan.guid);
    await run('powercfg.exe', ['/setactive', POWER_SAVER_SCHEME_GUID], 8000);
    return getBatterySaverState();
  }

  const current = await getBatterySaverState();
  const nextThreshold = current.enabled === true ? 20 : 100;

  await run('powercfg.exe', [
    '/setdcvalueindex',
    'SCHEME_CURRENT',
    'SUB_ENERGYSAVER',
    'ESBATTTHRESHOLD',
    String(nextThreshold)
  ], 8000);
  await run('powercfg.exe', ['/setactive', 'SCHEME_CURRENT'], 8000);

  return getBatterySaverState();
}

async function hasSystemBattery() {
  try {
    const output = await run('wmic.exe', ['path', 'Win32_Battery', 'get', 'BatteryStatus', '/value'], 4000);
    return /BatteryStatus\s*=/i.test(output);
  } catch {
    return false;
  }
}

async function getActivePowerScheme() {
  const output = await run('powercfg.exe', ['/getactivescheme'], 4000);
  const match = output.match(/(?:GUID|Power Scheme GUID):\s*([0-9a-f-]+)\s*(?:\(([^)]+)\))?/i);

  return {
    guid: match?.[1]?.toLowerCase() || '',
    name: match?.[2] || ''
  };
}

function isPowerSaverScheme(plan) {
  const name = String(plan?.name || '').toLowerCase();
  return String(plan?.guid || '').toLowerCase() === POWER_SAVER_SCHEME_GUID
    || name.includes('power saver')
    || name.includes('güç tasarrufu')
    || name.includes('guc tasarrufu');
}

async function rememberPowerPlan(guid) {
  if (!guid || guid.toLowerCase() === POWER_SAVER_SCHEME_GUID) {
    return;
  }

  await fs.mkdir(STATE_DIR, { recursive: true });
  await fs.writeFile(POWER_PLAN_STATE_FILE, JSON.stringify({ guid }, null, 2), 'utf8');
}

async function readPreviousPowerPlan() {
  try {
    const parsed = JSON.parse(await fs.readFile(POWER_PLAN_STATE_FILE, 'utf8'));
    return parsed.guid || '';
  } catch {
    return '';
  }
}

function isPhysicalNetworkInterface(name) {
  const text = String(name || '').toLowerCase();
  return text && !NETWORK_INTERFACE_IGNORE.some((part) => text.includes(part));
}

async function getNetworkState() {
  try {
    const output = await run('netsh.exe', ['interface', 'show', 'interface']);
    const interfaces = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^(Enabled|Disabled)\s+/i.test(line))
      .map((line) => {
        const match = line.match(/^(Enabled|Disabled)\s+(\S+)\s+(\S+)\s+(.+)$/i);
        return match ? {
          admin: match[1],
          state: match[2],
          type: match[3],
          name: match[4].trim()
        } : null;
      })
      .filter(Boolean);
    const connected = interfaces.filter((item) => /connected|bağlı|bagli/i.test(item.state));
    const primary = connected.find((item) => isPhysicalNetworkInterface(item.name)) || connected[0] || interfaces[0];

    if (!primary) {
      return {
        enabled: false,
        label: 'Yok',
        detail: 'Ağ bulunamadı'
      };
    }

    return {
      enabled: connected.length > 0,
      label: connected.length > 0 ? 'Bağlı' : 'Kapalı',
      detail: primary.name,
      count: connected.length
    };
  } catch {
    return {
      enabled: null,
      label: 'Bilinmiyor',
      detail: 'Ağ durumu okunamadı'
    };
  }
}

async function getNightLightState() {
  return {
    enabled: null,
    label: 'Hızlı',
    detail: 'Hızlı panelden yönet'
  };
}

async function toggleBluetoothRadio() {
  try {
    const radios = await getBluetoothRadioDevices();
    if (!radios.length) {
      return {
        ok: false,
        message: 'Bluetooth adaptörü bulunamadı.'
      };
    }

    const isEnabled = radios.some((device) => device.status === 'Started');
    const result = await setPnPDevicesEnabled(radios, !isEnabled);
    return {
      ...result,
      enabled: !isEnabled
    };
  } catch (error) {
    if (isAdminRequiredError(error)) {
      return {
        ok: false,
        needsAdmin: true,
        message: 'Bluetooth adaptörünü açıp kapatmak için yönetici izni gerekiyor.'
      };
    }

    return {
      ok: false,
      message: error.message || 'Bluetooth durumu değiştirilemedi.'
    };
  }
}

async function getSilentState() {
  const value = await readRegistryValue(NOTIFICATION_SETTINGS, 'NOC_GLOBAL_SETTING_TOASTS_ENABLED');
  const enabled = parseRegistryDword(value);

  if (enabled === 0) {
    return {
      enabled: true,
      label: 'Sessiz',
      detail: 'Bildirimler kapalı'
    };
  }

  if (enabled === 1) {
    return {
      enabled: false,
      label: 'Açık',
      detail: 'Bildirimler açık'
    };
  }

  return {
    enabled: false,
    label: 'Açık',
    detail: 'Bildirimler açık'
  };
}

async function setSilentState(enabled) {
  await writeRegistryDword(NOTIFICATION_SETTINGS, 'NOC_GLOBAL_SETTING_TOASTS_ENABLED', enabled ? 0 : 1);
  broadcastSettingChange('Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings');
  return getSilentState();
}

async function toggleSilentState() {
  const current = await getSilentState();
  return setSilentState(current.enabled !== true);
}

async function getControlState() {
  const [camera, microphone, bluetooth, silent, darkMode, batterySaver, network, nightLight] = await Promise.all([
    getPrivacyState('camera'),
    getMicrophoneState(),
    getBluetoothState(),
    getSilentState(),
    getDarkModeState(),
    getBatterySaverState(),
    getNetworkState(),
    getNightLightState()
  ]);

  return {
    camera,
    microphone,
    bluetooth,
    silent,
    darkMode,
    batterySaver,
    network,
    nightLight
  };
}

module.exports = {
  getControlState,
  releaseMicrophoneMute,
  toggleBatterySaverState,
  toggleBluetoothRadio,
  toggleDarkModeState,
  toggleMicrophoneState,
  togglePrivacyState,
  toggleSilentState
};
