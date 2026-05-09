const { execFile } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');

const {
  enumerateCaptureEndpoints,
  getCaptureMuteState,
  getDefaultCaptureEndpointIds,
  setDefaultCaptureEndpoint,
  setCaptureMuted
} = require('./coreAudio');
const {
  getExternalBrightnessState,
  setExternalBrightnessLevel
} = require('./monitorBrightness');
const { broadcastSettingChange, runElevated } = require('./win32');

const CONSENT_STORE = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore';
const NIGHT_LIGHT_STATE_KEY = 'Software\\Microsoft\\Windows\\CurrentVersion\\CloudStore\\Store\\DefaultAccount\\Current\\default$windows.data.bluelightreduction.bluelightreductionstate\\windows.data.bluelightreduction.bluelightreductionstate';
const NOTIFICATION_SETTINGS = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings';
const PERSONALIZE_SETTINGS = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize';
const SYSTEM_ROOT = process.env.SystemRoot || 'C:\\Windows';
const PNPUTIL_PATH = path.join(SYSTEM_ROOT, 'System32', 'pnputil.exe');
const POWERSHELL_PATH = path.join(SYSTEM_ROOT, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
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
const DEVICE_STATE_ACTIVE = 0x1;

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

function runPowerShell(command, timeoutMs = 6000) {
  return run(POWERSHELL_PATH, [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    command
  ], timeoutMs);
}

function quotePowerShellLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function readRegistryBinary(keyPath, valueName) {
  const psPath = `Registry::HKEY_CURRENT_USER\\${keyPath}`;
  const command = [
    `$value = (Get-ItemProperty -LiteralPath ${quotePowerShellLiteral(psPath)} -Name ${quotePowerShellLiteral(valueName)} -ErrorAction Stop).${valueName}`,
    '[Convert]::ToBase64String([byte[]]$value)'
  ].join('; ');
  const output = await runPowerShell(command, 6000);
  return Buffer.from(output.trim(), 'base64');
}

async function writeRegistryBinary(keyPath, valueName, data) {
  const psPath = `Registry::HKEY_CURRENT_USER\\${keyPath}`;
  const base64 = Buffer.from(data).toString('base64');
  const command = [
    `$path = ${quotePowerShellLiteral(psPath)}`,
    'if (!(Test-Path -LiteralPath $path)) { New-Item -Path $path -Force | Out-Null }',
    `$bytes = [Convert]::FromBase64String(${quotePowerShellLiteral(base64)})`,
    `New-ItemProperty -LiteralPath $path -Name ${quotePowerShellLiteral(valueName)} -PropertyType Binary -Value $bytes -Force | Out-Null`
  ].join('; ');
  await runPowerShell(command, 6000);
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
      const className = block.match(/Class Name:\s*(.+)/i)?.[1]?.trim();
      return { instanceId, description, status, manufacturer, className };
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
  const className = String(device.className || '').toLowerCase();
  const instanceId = String(device.instanceId || '').toUpperCase();
  const hasBluetoothIdentity = className === 'bluetooth' && text.includes('bluetooth');
  const positive = [
    'bluetooth radio',
    'bluetooth radyo',
    'bluetooth adapt',
    'wireless bluetooth',
    'bluetooth adapter',
    'kablosuz bluetooth',
    'intel(r) wireless bluetooth',
    'realtek bluetooth',
    'mediatek bluetooth',
    'broadcom bluetooth',
    'qualcomm bluetooth'
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
    'headphone',
    'network',
    'ethernet',
    'wi-fi',
    'wifi',
    'wireless-ac',
    'wireless-ax',
    'wireless-n',
    '802.11',
    'lan',
    'wan'
  ];

  return Boolean(device.instanceId)
    && hasBluetoothIdentity
    && positive.some((part) => text.includes(part))
    && (instanceId.startsWith('USB\\') || instanceId.startsWith('PCI\\') || instanceId.startsWith('BTH\\'))
    && !negative.some((part) => text.includes(part));
}

async function getBluetoothRadioDevices() {
  const queries = [
    ['/enum-devices', '/class', 'Bluetooth'],
    ['/enum-devices', '/connected', '/class', 'Bluetooth']
  ];
  const seen = new Set();
  const radios = [];

  for (const args of queries) {
    try {
      const output = await run('pnputil.exe', args, 8000);
      parsePnPDevices(output)
        .filter(isBluetoothRadioDevice)
        .forEach((device) => {
          if (!seen.has(device.instanceId)) {
            seen.add(device.instanceId);
            radios.push(device);
          }
        });
    } catch {
      // Try the next enumeration style.
    }
  }

  return radios;
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
    enabled ? isPnPDeviceDisabled(device) : device.status === 'Started'
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

function isPnPDeviceDisabled(device) {
  const status = String(device?.status || '').toLowerCase();
  return status.includes('disabled')
    || status.includes('devre')
    || status.includes('kapalı')
    || status.includes('kapali');
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

function pnpEndpointId(device) {
  return String(device?.instanceId || '').match(/MMDEVAPI\\(\{0\.0\.1\.[^}]+\}\.\{[0-9a-f-]+\})/i)?.[1] || '';
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
  const [devices, muteState, endpoints] = await Promise.all([
    getAudioCaptureDevices(),
    Promise.resolve().then(() => getCaptureMuteState()).catch(() => null),
    Promise.resolve().then(() => enumerateCaptureEndpoints()).catch(() => [])
  ]);
  const defaults = Promise.resolve().then(() => getDefaultCaptureEndpointIds()).catch(() => ({}));
  const activeEndpointIds = new Set(
    endpoints
      .filter((endpoint) => endpoint.state === DEVICE_STATE_ACTIVE)
      .map((endpoint) => endpoint.id.toLowerCase())
  );

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
  const disabledDevices = devices.filter((device) => (
    isPnPDeviceDisabled(device)
      && !activeEndpointIds.has(pnpEndpointId(device).toLowerCase())
  ));
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
    endpoints,
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

function releaseMicrophoneMute() {
  return setCaptureMuted(false);
}

function isVirtualCaptureEndpoint(name) {
  const text = String(name || '').toLowerCase();
  return [
    'steam streaming',
    'virtual audio',
    'nvidia virtual',
    'obs',
    'voicemod',
    'vb-audio',
    'cable output',
    'virtual cable'
  ].some((part) => text.includes(part));
}

async function preferPhysicalCaptureEndpoint() {
  const endpoints = enumerateCaptureEndpoints()
    .filter((endpoint) => endpoint.state === DEVICE_STATE_ACTIVE);

  if (!endpoints.length) {
    return { ok: true, changed: false, reason: 'Aktif mikrofon yok.' };
  }

  const enriched = await Promise.all(endpoints.map(async (endpoint) => ({
    ...endpoint,
    ...(await getEndpointRegistryInfo(endpoint.id))
  })));
  const currentDefaults = await Promise.resolve()
    .then(() => getDefaultCaptureEndpointIds())
    .catch(() => ({}));
  const currentDefault = currentDefaults.communications || currentDefaults.multimedia || currentDefaults.console || '';
  const preferred = enriched.find((endpoint) => !isVirtualCaptureEndpoint(endpoint.name));

  if (!preferred || preferred.id === currentDefault) {
    return {
      ok: true,
      changed: false,
      preferred: preferred?.name || '',
      reason: preferred ? 'Varsayılan mikrofon zaten uygun.' : 'Aktif fiziksel mikrofon yok.'
    };
  }

  try {
    setDefaultCaptureEndpoint(preferred.id);
    return {
      ok: true,
      changed: true,
      preferred: preferred.name || preferred.id
    };
  } catch (error) {
    return {
      ok: false,
      changed: false,
      message: error.message || 'Varsayılan mikrofon değiştirilemedi.'
    };
  }
}

async function repairMicrophoneAccess() {
  await setPrivacyState('microphone', true);

  const capture = await getAudioCaptureState();
  const muteResult = await Promise.resolve()
    .then(() => releaseMicrophoneMute())
    .catch((error) => ({
      ok: false,
      message: error.message || 'Mikrofon sessizden çıkarılamadı.'
    }));

  if (!muteResult.ok) {
    return muteResult;
  }

  const disabledRepair = capture.disabledDevices?.length
    ? await setPnPDevicesEnabled(capture.disabledDevices, true)
    : null;
  const preferredDefault = await preferPhysicalCaptureEndpoint();

  return {
    ok: disabledRepair ? disabledRepair.ok : true,
    pending: false,
    elevated: false,
    count: muteResult.count,
    enabled: true,
    repairedDisabledEndpoints: Boolean(disabledRepair),
    disabledRepair,
    preferredDefault,
    message: disabledRepair ? 'Mikrofon erişimi onarıldı.' : 'Mikrofon erişimi açık.'
  };
}

async function setMicrophoneState(enabled) {
  if (enabled) {
    return repairMicrophoneAccess();
  }

  return {
    ok: false,
    enabled: true,
    message: 'Mikrofon kapatma devre dışı; uygulama sistem sesini değiştirmiyor.'
  };
}

async function toggleMicrophoneState() {
  return repairMicrophoneAccess();
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
  try {
    const state = parseNightLightState(await readRegistryBinary(NIGHT_LIGHT_STATE_KEY, 'Data'));
    return {
      enabled: state.enabled,
      label: state.enabled ? 'Açık' : 'Kapalı',
      detail: state.enabled ? 'Gece ışığı etkin' : 'Gece ışığı kapalı',
      source: 'Windows CloudStore'
    };
  } catch {
    return {
      enabled: null,
      label: 'Bilinmiyor',
      detail: 'Gece ışığı durumu okunamadı',
      source: 'Windows CloudStore'
    };
  }
}

function writeCompactFieldHeader(bytes, type, id) {
  if (id <= 5) {
    bytes.push(type | (id << 5));
    return;
  }

  if (id <= 0xff) {
    bytes.push(type | (0x06 << 5), id);
    return;
  }

  bytes.push(type | (0x07 << 5), id & 0xff, (id >> 8) & 0xff);
}

function writeVarUInt(bytes, value) {
  let current = BigInt(value);
  while (current >= 0x80n) {
    bytes.push(Number((current & 0x7fn) | 0x80n));
    current >>= 7n;
  }
  bytes.push(Number(current));
}

function writeZigZag32(bytes, value) {
  const parsed = Number.parseInt(value, 10) || 0;
  writeVarUInt(bytes, BigInt((parsed << 1) ^ (parsed >> 31)) & 0xffffffffn);
}

function currentUnixSeconds() {
  return Math.floor(Date.now() / 1000);
}

function currentWindowsFileTime() {
  return BigInt(Date.now()) * 10000n + 116444736000000000n;
}

function compactHeader() {
  return [0x43, 0x42, 0x01, 0x00];
}

function buildNightLightStateBytes(enabled) {
  const inner = compactHeader();
  if (enabled) {
    writeCompactFieldHeader(inner, 0x10, 0);
    writeZigZag32(inner, 0);
  }
  writeCompactFieldHeader(inner, 0x10, 10);
  writeZigZag32(inner, 1);
  writeCompactFieldHeader(inner, 0x06, 20);
  writeVarUInt(inner, currentWindowsFileTime());
  inner.push(0x00);

  const outer = compactHeader();
  writeCompactFieldHeader(outer, 0x0a, 0);
  writeCompactFieldHeader(outer, 0x02, 0);
  outer.push(0x01, 0x00);
  writeCompactFieldHeader(outer, 0x0a, 1);
  writeCompactFieldHeader(outer, 0x06, 0);
  writeVarUInt(outer, BigInt(currentUnixSeconds()));
  writeCompactFieldHeader(outer, 0x0a, 1);
  writeCompactFieldHeader(outer, 0x0b, 1);
  outer.push(0x0e);
  writeVarUInt(outer, BigInt(inner.length));
  outer.push(...inner, 0x00, 0x00, 0x00);

  return Buffer.from(outer);
}

function parseNightLightState(data) {
  const buffer = Buffer.from(data || []);
  const first = buffer.indexOf(Buffer.from(compactHeader()));
  const second = first >= 0 ? buffer.indexOf(Buffer.from(compactHeader()), first + 4) : -1;
  if (second < 0) {
    throw new Error('Night Light state payload not found.');
  }

  return {
    enabled: buffer[second + 4] === 0x10
  };
}

async function setNightLightState(enabled) {
  await writeRegistryBinary(NIGHT_LIGHT_STATE_KEY, 'Data', buildNightLightStateBytes(enabled));
  broadcastSettingChange('Software\\Microsoft\\Windows\\CurrentVersion\\CloudStore');
  return getNightLightState();
}

async function toggleNightLightState() {
  const current = await getNightLightState();
  return setNightLightState(current.enabled !== true);
}

async function getBrightnessState() {
  try {
    let output = '';
    try {
      output = await runPowerShell(
        '(Get-CimInstance -Namespace root/WMI -ClassName WmiMonitorBrightness -ErrorAction Stop | Select-Object -First 1 -ExpandProperty CurrentBrightness)',
        6000
      );
    } catch {
      output = await run('wmic.exe', [
        '/namespace:\\\\root\\wmi',
        'path',
        'WmiMonitorBrightness',
        'get',
        'CurrentBrightness',
        '/value'
      ], 5000);
    }

    const match = output.match(/(?:CurrentBrightness=)?\s*(\d+)/i);
    const level = match ? Math.max(0, Math.min(100, Number.parseInt(match[1], 10))) : null;

    if (level === null || Number.isNaN(level)) {
      return {
        available: false,
        level: null,
        message: 'Parlaklık bilgisi okunamadı.'
      };
    }

    return {
      available: true,
      level,
      source: 'Windows WMI',
      message: `Parlaklık %${level}`
    };
  } catch {
    const external = getExternalBrightnessState();
    return external.available
      ? external
      : {
        available: false,
        level: null,
        message: 'Bu ekran WMI veya DDC/CI parlaklık kontrolünü desteklemiyor.'
      };
  }
}

async function setBrightnessLevel(level) {
  const nextLevel = Math.max(0, Math.min(100, Number.parseInt(level, 10) || 0));
  try {
    try {
      await runPowerShell(
        `$level = ${nextLevel}; $methods = Get-CimInstance -Namespace root/WMI -ClassName WmiMonitorBrightnessMethods -ErrorAction Stop; foreach ($method in $methods) { Invoke-CimMethod -InputObject $method -MethodName WmiSetBrightness -Arguments @{Timeout = 1; Brightness = $level} | Out-Null }`,
        10000
      );
    } catch {
      await run('wmic.exe', [
        '/namespace:\\\\root\\wmi',
        'path',
        'WmiMonitorBrightnessMethods',
        'where',
        'Active=TRUE',
        'call',
        'WmiSetBrightness',
        '1',
        String(nextLevel)
      ], 8000);
    }

    return {
      ok: true,
      ...(await getBrightnessState())
    };
  } catch (error) {
    return setExternalBrightnessLevel(nextLevel);
  }
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
  const [camera, microphone, bluetooth, silent, darkMode, batterySaver, network, nightLight, brightness] = await Promise.all([
    getPrivacyState('camera'),
    getMicrophoneState(),
    getBluetoothState(),
    getSilentState(),
    getDarkModeState(),
    getBatterySaverState(),
    getNetworkState(),
    getNightLightState(),
    getBrightnessState()
  ]);

  return {
    camera,
    microphone,
    bluetooth,
    silent,
    darkMode,
    batterySaver,
    network,
    nightLight,
    brightness: {
      enabled: brightness.available ? true : null,
      label: brightness.available ? `%${brightness.level}` : 'Yok',
      detail: brightness.message
    }
  };
}

module.exports = {
  getBrightnessState,
  getControlState,
  releaseMicrophoneMute,
  repairMicrophoneAccess,
  setBrightnessLevel,
  toggleBatterySaverState,
  toggleBluetoothRadio,
  toggleDarkModeState,
  toggleMicrophoneState,
  toggleNightLightState,
  togglePrivacyState,
  toggleSilentState
};
