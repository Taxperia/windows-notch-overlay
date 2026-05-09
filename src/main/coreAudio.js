const koffi = require('koffi');

const ole32 = koffi.load('ole32.dll');

const CLSCTX_ALL = 0x1 | 0x2 | 0x4;
const COINIT_APARTMENTTHREADED = 0x2;
const RPC_E_CHANGED_MODE = -2147417850;
const DEVICE_STATE_ACTIVE = 0x1;
const DEVICE_STATE_ALL = 0x1 | 0x2 | 0x4 | 0x8;
const E_CAPTURE = 1;

const CLSID_MMDEVICE_ENUMERATOR = guid('BCDE0395-E52F-467C-8E3D-C4579291692E');
const CLSID_POLICY_CONFIG = guid('870AF99C-171D-4F9E-AF0D-E63DF40C2BC9');
const IID_IMMDEVICE_ENUMERATOR = guid('A95664D2-9614-4F35-A746-DE8DB63617E6');
const IID_IAUDIO_ENDPOINT_VOLUME = guid('5CDF2C82-841E-4546-9722-0CF74078229A');
const IID_IAUDIO_METER_INFORMATION = guid('C02216F6-8C67-4B5B-9D00-D008E73E0064');
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
  getDefaultCaptureEndpointIds,
  getCaptureMuteState,
  getCapturePeakLevels,
  setDefaultCaptureEndpoint,
  setCaptureMuted,
  setEndpointVisible
};
