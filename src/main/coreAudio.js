const koffi = require('koffi');

const ole32 = koffi.load('ole32.dll');

const CLSCTX_ALL = 0x1 | 0x2 | 0x4;
const COINIT_APARTMENTTHREADED = 0x2;
const RPC_E_CHANGED_MODE = -2147417850;
const DEVICE_STATE_ACTIVE = 0x1;
const DEVICE_STATE_ALL = 0x1 | 0x2 | 0x4 | 0x8;
const E_RENDER = 0;
const E_CAPTURE = 1;

const CLSID_MMDEVICE_ENUMERATOR = guid('BCDE0395-E52F-467C-8E3D-C4579291692E');
const CLSID_POLICY_CONFIG = guid('870AF99C-171D-4F9E-AF0D-E63DF40C2BC9');
const IID_IMMDEVICE_ENUMERATOR = guid('A95664D2-9614-4F35-A746-DE8DB63617E6');
const IID_IAUDIO_ENDPOINT_VOLUME = guid('5CDF2C82-841E-4546-9722-0CF74078229A');
const IID_IAUDIO_METER_INFORMATION = guid('C02216F6-8C67-4B5B-9D00-D008E73E0064');
const IID_IAUDIO_SESSION_CONTROL2 = guid('BFB7FF88-7239-4FC9-8FA2-07C950BE9C6D');
const IID_IAUDIO_SESSION_MANAGER2 = guid('77AA99A0-1BD6-484F-8BC7-2C654C9A9B6F');
const IID_ISIMPLE_AUDIO_VOLUME = guid('87CE5498-68D6-44E5-9215-6DA47EF883D8');
const IID_IPOLICY_CONFIG = guid('F8679F50-850A-41CF-9C72-430F290290C8');

const CoInitializeEx = ole32.func('int32_t __stdcall CoInitializeEx(void *pvReserved, uint32_t dwCoInit)');
const CoUninitialize = ole32.func('void __stdcall CoUninitialize()');
const CoCreateInstance = ole32.func('int32_t __stdcall CoCreateInstance(const void *rclsid, void *pUnkOuter, uint32_t dwClsContext, const void *riid, _Out_ void **ppv)');

const Release = koffi.proto('uint32_t __stdcall Release(void *self)');
const EnumAudioEndpoints = koffi.proto('int32_t __stdcall EnumAudioEndpoints(void *self, int dataFlow, uint32_t stateMask, _Out_ void **ppDevices)');
const GetCount = koffi.proto('int32_t __stdcall GetCount(void *self, _Out_ uint32_t *pcDevices)');
const Item = koffi.proto('int32_t __stdcall Item(void *self, uint32_t nDevice, _Out_ void **ppDevice)');
const GetId = koffi.proto('int32_t __stdcall GetId(void *self, _Out_ char16_t **ppstrId)');
const GetState = koffi.proto('int32_t __stdcall GetState(void *self, _Out_ uint32_t *pdwState)');
const GetDefaultAudioEndpoint = koffi.proto('int32_t __stdcall GetDefaultAudioEndpoint(void *self, int dataFlow, int role, _Out_ void **ppDevice)');
const Activate = koffi.proto('int32_t __stdcall Activate(void *self, const void *iid, uint32_t dwClsCtx, void *pActivationParams, _Out_ void **ppInterface)');
const SetMute = koffi.proto('int32_t __stdcall SetMute(void *self, int bMute, void *pguidEventContext)');
const GetMute = koffi.proto('int32_t __stdcall GetMute(void *self, _Out_ int *pbMute)');
const GetMasterVolumeLevelScalar = koffi.proto('int32_t __stdcall GetMasterVolumeLevelScalar(void *self, _Out_ float *pfLevel)');
const GetPeakValue = koffi.proto('int32_t __stdcall GetPeakValue(void *self, _Out_ float *pfPeak)');
const SetDefaultEndpoint = koffi.proto('int32_t __stdcall SetDefaultEndpoint(void *self, const char16_t *deviceId, int role)');
const SetEndpointVisibility = koffi.proto('int32_t __stdcall SetEndpointVisibility(void *self, const char16_t *deviceId, int visible)');
const QueryInterface = koffi.proto('int32_t __stdcall QueryInterface(void *self, const void *riid, _Out_ void **ppvObject)');
const GetSessionEnumerator = koffi.proto('int32_t __stdcall GetSessionEnumerator(void *self, _Out_ void **SessionEnum)');
const GetSession = koffi.proto('int32_t __stdcall GetSession(void *self, int SessionCount, _Out_ void **Session)');
const GetSessionState = koffi.proto('int32_t __stdcall AudioSessionGetState(void *self, _Out_ int *pRetVal)');
const GetDisplayName = koffi.proto('int32_t __stdcall AudioSessionGetDisplayName(void *self, _Out_ char16_t **pRetVal)');
const GetSessionIdentifier = koffi.proto('int32_t __stdcall AudioSessionGetSessionIdentifier(void *self, _Out_ char16_t **pRetVal)');
const GetSessionInstanceIdentifier = koffi.proto('int32_t __stdcall AudioSessionGetSessionInstanceIdentifier(void *self, _Out_ char16_t **pRetVal)');
const GetProcessId = koffi.proto('int32_t __stdcall AudioSessionGetProcessId(void *self, _Out_ uint32_t *pRetVal)');
const IsSystemSoundsSession = koffi.proto('int32_t __stdcall AudioSessionIsSystemSoundsSession(void *self)');
const SetSimpleMasterVolume = koffi.proto('int32_t __stdcall SimpleAudioSetMasterVolume(void *self, float fLevel, void *EventContext)');
const GetSimpleMasterVolume = koffi.proto('int32_t __stdcall SimpleAudioGetMasterVolume(void *self, _Out_ float *pfLevel)');
const SetSimpleMute = koffi.proto('int32_t __stdcall SimpleAudioSetMute(void *self, int bMute, void *EventContext)');
const GetSimpleMute = koffi.proto('int32_t __stdcall SimpleAudioGetMute(void *self, _Out_ int *pbMute)');

function guid(value) {
  const parts = value.replace(/[{}]/g, '').split('-');
  const buffer = Buffer.alloc(16);
  buffer.writeUInt32LE(parseInt(parts[0], 16), 0);
  buffer.writeUInt16LE(parseInt(parts[1], 16), 4);
  buffer.writeUInt16LE(parseInt(parts[2], 16), 6);
  Buffer.from(`${parts[3]}${parts[4]}`, 'hex').copy(buffer, 8);
  return buffer;
}

function failed(hr) {
  return hr < 0;
}

function checkHr(hr, operation) {
  if (failed(hr)) {
    throw new Error(`${operation} failed: 0x${(hr >>> 0).toString(16)}`);
  }
}

function callMethod(pointer, index, proto, ...args) {
  const vtable = koffi.decode(pointer, 'void *');
  const fn = koffi.decode(vtable, index * 8, 'void *');
  return koffi.call(fn, proto, pointer, ...args);
}

function release(pointer) {
  if (pointer) {
    callMethod(pointer, 2, Release);
  }
}

function queryInterface(pointer, iid) {
  if (!pointer) {
    return null;
  }

  const out = [null];
  const hr = callMethod(pointer, 0, QueryInterface, iid, out);
  return failed(hr) ? null : out[0];
}

function safeComString(callback) {
  const out = [null];
  try {
    const hr = callback(out);
    return failed(hr) ? '' : String(out[0] || '').trim();
  } catch {
    return '';
  }
}

function processNameFromSession(sessionId) {
  const match = String(sessionId || '').match(/([^\\|/:]+\.exe)(?:%|\||$)/i);
  if (!match) {
    return '';
  }

  return match[1].replace(/\.exe$/i, '');
}

function normalizeSessionName(displayName, sessionId, pid, isSystemSounds) {
  if (isSystemSounds) {
    return 'Sistem sesleri';
  }

  const explicitName = String(displayName || '').trim();
  if (explicitName) {
    return explicitName;
  }

  const processName = processNameFromSession(sessionId);
  if (processName) {
    return processName;
  }

  return pid ? `Uygulama ${pid}` : 'Bilinmeyen uygulama';
}

function createRenderSessionManager() {
  const enumerator = createEnumerator();
  let device = null;
  let manager = null;

  try {
    const deviceOut = [null];
    checkHr(callMethod(enumerator, 4, GetDefaultAudioEndpoint, E_RENDER, 0, deviceOut), 'GetDefaultAudioEndpoint render');
    device = deviceOut[0];

    const managerOut = [null];
    checkHr(
      callMethod(device, 3, Activate, IID_IAUDIO_SESSION_MANAGER2, CLSCTX_ALL, null, managerOut),
      'Activate IAudioSessionManager2'
    );
    manager = managerOut[0];

    return {
      enumerator,
      device,
      manager
    };
  } catch (error) {
    release(manager);
    release(device);
    release(enumerator);
    throw error;
  }
}

function initializeCom() {
  const hr = CoInitializeEx(null, COINIT_APARTMENTTHREADED);
  if (hr === RPC_E_CHANGED_MODE) {
    return false;
  }

  checkHr(hr, 'CoInitializeEx');
  return true;
}

function createEnumerator() {
  const out = [null];
  const hr = CoCreateInstance(CLSID_MMDEVICE_ENUMERATOR, null, CLSCTX_ALL, IID_IMMDEVICE_ENUMERATOR, out);
  checkHr(hr, 'CoCreateInstance');
  return out[0];
}

function createPolicyConfig() {
  const out = [null];
  const hr = CoCreateInstance(CLSID_POLICY_CONFIG, null, CLSCTX_ALL, IID_IPOLICY_CONFIG, out);
  checkHr(hr, 'CoCreateInstance PolicyConfig');
  return out[0];
}

function decodeDeviceId(device) {
  const idOut = [null];
  checkHr(callMethod(device, 5, GetId, idOut), 'GetId');
  return String(idOut[0] || '');
}

function enumerateCaptureDevices(callback, stateMask = DEVICE_STATE_ACTIVE) {
  const didInitialize = initializeCom();
  let enumerator = null;
  let collection = null;

  try {
    enumerator = createEnumerator();
    const collectionOut = [null];
    checkHr(
      callMethod(enumerator, 3, EnumAudioEndpoints, E_CAPTURE, stateMask, collectionOut),
      'EnumAudioEndpoints'
    );
    collection = collectionOut[0];

    const count = [0];
    checkHr(callMethod(collection, 3, GetCount, count), 'GetCount');

    const results = [];
    for (let index = 0; index < count[0]; index += 1) {
      let device = null;
      let volume = null;
      let meter = null;

      try {
        const deviceOut = [null];
        checkHr(callMethod(collection, 4, Item, index, deviceOut), 'Item');
        device = deviceOut[0];

        const volumeOut = [null];
        checkHr(
          callMethod(device, 3, Activate, IID_IAUDIO_ENDPOINT_VOLUME, CLSCTX_ALL, null, volumeOut),
          'Activate IAudioEndpointVolume'
        );
        volume = volumeOut[0];

        results.push(callback({
          id: decodeDeviceId(device),
          volume
        }));
      } finally {
        release(volume);
        release(device);
      }
    }

    return results;
  } finally {
    release(collection);
    release(enumerator);
    if (didInitialize) {
      CoUninitialize();
    }
  }
}

function enumerateCaptureEndpoints(stateMask = DEVICE_STATE_ALL) {
  const didInitialize = initializeCom();
  let enumerator = null;
  let collection = null;

  try {
    enumerator = createEnumerator();
    const collectionOut = [null];
    checkHr(
      callMethod(enumerator, 3, EnumAudioEndpoints, E_CAPTURE, stateMask, collectionOut),
      'EnumAudioEndpoints'
    );
    collection = collectionOut[0];

    const count = [0];
    checkHr(callMethod(collection, 3, GetCount, count), 'GetCount');

    const results = [];
    for (let index = 0; index < count[0]; index += 1) {
      let device = null;
      let volume = null;
      let meter = null;

      try {
        const deviceOut = [null];
        checkHr(callMethod(collection, 4, Item, index, deviceOut), 'Item');
        device = deviceOut[0];

        const state = [0];
        checkHr(callMethod(device, 6, GetState, state), 'GetState');

        const endpoint = {
          id: decodeDeviceId(device),
          state: state[0],
          muted: null,
          level: null
        };

        if (state[0] === DEVICE_STATE_ACTIVE) {
          const volumeOut = [null];
          checkHr(
            callMethod(device, 3, Activate, IID_IAUDIO_ENDPOINT_VOLUME, CLSCTX_ALL, null, volumeOut),
            'Activate IAudioEndpointVolume'
          );
          volume = volumeOut[0];

          const mute = [0];
          const level = [0];
          checkHr(callMethod(volume, 15, GetMute, mute), 'GetMute');
          checkHr(callMethod(volume, 9, GetMasterVolumeLevelScalar, level), 'GetMasterVolumeLevelScalar');
          endpoint.muted = mute[0] !== 0;
          endpoint.level = level[0];

          const meterOut = [null];
          checkHr(
            callMethod(device, 3, Activate, IID_IAUDIO_METER_INFORMATION, CLSCTX_ALL, null, meterOut),
            'Activate IAudioMeterInformation'
          );
          meter = meterOut[0];

          const peak = [0];
          checkHr(callMethod(meter, 3, GetPeakValue, peak), 'GetPeakValue');
          endpoint.peak = peak[0];
        }

        results.push(endpoint);
      } finally {
        release(meter);
        release(volume);
        release(device);
      }
    }

    return results;
  } finally {
    release(collection);
    release(enumerator);
    if (didInitialize) {
      CoUninitialize();
    }
  }
}

function getDefaultCaptureEndpointIds() {
  const didInitialize = initializeCom();
  let enumerator = null;

  try {
    enumerator = createEnumerator();
    const roles = {
      console: 0,
      multimedia: 1,
      communications: 2
    };

    const result = {};
    for (const [name, role] of Object.entries(roles)) {
      const deviceOut = [null];
      const hr = callMethod(enumerator, 4, GetDefaultAudioEndpoint, E_CAPTURE, role, deviceOut);
      result[name] = failed(hr) || !deviceOut[0] ? '' : decodeDeviceId(deviceOut[0]);
      release(deviceOut[0]);
    }

    return result;
  } finally {
    release(enumerator);
    if (didInitialize) {
      CoUninitialize();
    }
  }
}

function setEndpointVisible(deviceId, visible) {
  const didInitialize = initializeCom();
  let policy = null;

  try {
    policy = createPolicyConfig();
    checkHr(callMethod(policy, 14, SetEndpointVisibility, deviceId, visible ? 1 : 0), 'SetEndpointVisibility');
    return { ok: true };
  } finally {
    release(policy);
    if (didInitialize) {
      CoUninitialize();
    }
  }
}

function setDefaultCaptureEndpoint(deviceId) {
  const didInitialize = initializeCom();
  let policy = null;

  try {
    policy = createPolicyConfig();
    for (const role of [0, 1, 2]) {
      checkHr(callMethod(policy, 13, SetDefaultEndpoint, deviceId, role), 'SetDefaultEndpoint');
    }

    return { ok: true };
  } finally {
    release(policy);
    if (didInitialize) {
      CoUninitialize();
    }
  }
}

function getCaptureMuteState() {
  const devices = enumerateCaptureDevices(({ id, volume }) => {
    const mute = [0];
    checkHr(callMethod(volume, 15, GetMute, mute), 'GetMute');
    return {
      id,
      muted: mute[0] !== 0
    };
  });

  return {
    available: devices.length > 0,
    activeCount: devices.length,
    devices,
    allMuted: devices.length > 0 && devices.every((device) => device.muted),
    anyMuted: devices.some((device) => device.muted)
  };
}

function getCapturePeakLevels() {
  return enumerateCaptureEndpoints(DEVICE_STATE_ACTIVE).map((endpoint) => ({
    id: endpoint.id,
    muted: endpoint.muted,
    level: endpoint.level,
    peak: endpoint.peak || 0
  }));
}

function readAudioSession(control, index) {
  let control2 = null;
  let simpleVolume = null;
  let meter = null;

  try {
    control2 = queryInterface(control, IID_IAUDIO_SESSION_CONTROL2);
    simpleVolume = queryInterface(control, IID_ISIMPLE_AUDIO_VOLUME);
    meter = queryInterface(control, IID_IAUDIO_METER_INFORMATION);

    const state = [0];
    const level = [1];
    const muted = [0];
    const peak = [0];
    const pid = [0];

    const displayName = safeComString((out) => callMethod(control, 4, GetDisplayName, out));
    const sessionId = control2
      ? safeComString((out) => callMethod(control2, 12, GetSessionIdentifier, out))
      : '';
    const sessionInstanceId = control2
      ? safeComString((out) => callMethod(control2, 13, GetSessionInstanceIdentifier, out))
      : '';

    try {
      callMethod(control, 3, GetSessionState, state);
    } catch {
      state[0] = 0;
    }

    if (control2) {
      try {
        callMethod(control2, 14, GetProcessId, pid);
      } catch {
        pid[0] = 0;
      }
    }

    const isSystemSounds = control2 ? callMethod(control2, 15, IsSystemSoundsSession) === 0 : false;

    if (simpleVolume) {
      checkHr(callMethod(simpleVolume, 4, GetSimpleMasterVolume, level), 'GetSimpleMasterVolume');
      checkHr(callMethod(simpleVolume, 6, GetSimpleMute, muted), 'GetSimpleMute');
    }

    if (meter) {
      try {
        callMethod(meter, 3, GetPeakValue, peak);
      } catch {
        peak[0] = 0;
      }
    }

    const id = sessionInstanceId || sessionId || `session-${pid[0] || 'unknown'}-${index}`;

    return {
      id,
      pid: pid[0] || null,
      name: normalizeSessionName(displayName, sessionId, pid[0], isSystemSounds),
      displayName,
      sessionId,
      state: state[0],
      active: state[0] === 1,
      systemSounds: isSystemSounds,
      volume: Math.round(Math.max(0, Math.min(1, level[0])) * 100),
      muted: muted[0] !== 0,
      peak: Math.max(0, Math.min(1, peak[0] || 0))
    };
  } finally {
    release(meter);
    release(simpleVolume);
    release(control2);
  }
}

function withAudioSessions(callback) {
  const didInitialize = initializeCom();
  let context = null;
  let sessionEnumerator = null;

  try {
    context = createRenderSessionManager();
    const sessionEnumeratorOut = [null];
    checkHr(callMethod(context.manager, 5, GetSessionEnumerator, sessionEnumeratorOut), 'GetSessionEnumerator');
    sessionEnumerator = sessionEnumeratorOut[0];

    const count = [0];
    checkHr(callMethod(sessionEnumerator, 3, GetCount, count), 'GetCount audio sessions');

    const results = [];
    for (let index = 0; index < count[0]; index += 1) {
      let control = null;
      try {
        const controlOut = [null];
        checkHr(callMethod(sessionEnumerator, 4, GetSession, index, controlOut), 'GetSession');
        control = controlOut[0];
        results.push(callback(control, index));
      } finally {
        release(control);
      }
    }

    return results;
  } finally {
    release(sessionEnumerator);
    if (context) {
      release(context.manager);
      release(context.device);
      release(context.enumerator);
    }
    if (didInitialize) {
      CoUninitialize();
    }
  }
}

function getAudioSessions() {
  const sessions = withAudioSessions((control, index) => readAudioSession(control, index))
    .filter((session) => session.name && session.state !== 2)
    .sort((left, right) => {
      if (left.systemSounds !== right.systemSounds) {
        return left.systemSounds ? -1 : 1;
      }

      if (left.active !== right.active) {
        return left.active ? -1 : 1;
      }

      return left.name.localeCompare(right.name, 'tr');
    });

  return {
    available: true,
    sessions
  };
}

function setAudioSessionVolume(sessionId, volume) {
  const target = String(sessionId || '');
  const nextVolume = Math.max(0, Math.min(100, Number.parseInt(volume, 10) || 0));
  let matched = null;

  withAudioSessions((control, index) => {
    const session = readAudioSession(control, index);
    if (session.id !== target) {
      return null;
    }

    const simpleVolume = queryInterface(control, IID_ISIMPLE_AUDIO_VOLUME);
    try {
      if (!simpleVolume) {
        throw new Error('Ses oturumu sesi desteklemiyor.');
      }

      checkHr(callMethod(simpleVolume, 3, SetSimpleMasterVolume, nextVolume / 100, null), 'SetSimpleMasterVolume');
      matched = {
        ...session,
        volume: nextVolume,
        muted: nextVolume === 0 ? session.muted : false
      };
      return matched;
    } finally {
      release(simpleVolume);
    }
  });

  if (!matched) {
    return {
      ok: false,
      message: 'Ses oturumu bulunamadı.'
    };
  }

  return {
    ok: true,
    session: matched,
    message: `${matched.name} sesi %${nextVolume}`
  };
}

function setAudioSessionMuted(sessionId, muted) {
  const target = String(sessionId || '');
  const nextMuted = muted === true;
  let matched = null;

  withAudioSessions((control, index) => {
    const session = readAudioSession(control, index);
    if (session.id !== target) {
      return null;
    }

    const simpleVolume = queryInterface(control, IID_ISIMPLE_AUDIO_VOLUME);
    try {
      if (!simpleVolume) {
        throw new Error('Ses oturumu sessize alma desteklemiyor.');
      }

      checkHr(callMethod(simpleVolume, 5, SetSimpleMute, nextMuted ? 1 : 0, null), 'SetSimpleMute');
      matched = {
        ...session,
        muted: nextMuted
      };
      return matched;
    } finally {
      release(simpleVolume);
    }
  });

  if (!matched) {
    return {
      ok: false,
      message: 'Ses oturumu bulunamadı.'
    };
  }

  return {
    ok: true,
    session: matched,
    message: nextMuted ? `${matched.name} sessize alındı` : `${matched.name} sesi açıldı`
  };
}

function setCaptureMuted(muted) {
  const devices = enumerateCaptureDevices(({ id, volume }) => {
    checkHr(callMethod(volume, 14, SetMute, muted ? 1 : 0, null), 'SetMute');
    return { id };
  });

  return {
    ok: true,
    count: devices.length,
    muted
  };
}

module.exports = {
  enumerateCaptureEndpoints,
  getAudioSessions,
  getDefaultCaptureEndpointIds,
  getCaptureMuteState,
  getCapturePeakLevels,
  setAudioSessionMuted,
  setAudioSessionVolume,
  setDefaultCaptureEndpoint,
  setCaptureMuted,
  setEndpointVisible
};
