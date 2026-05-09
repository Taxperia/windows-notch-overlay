const koffi = require('koffi');

const user32 = koffi.load('user32.dll');
const dxva2 = koffi.load('dxva2.dll');

const RECT = koffi.struct('NotchBrightnessRect', {
  left: 'long',
  top: 'long',
  right: 'long',
  bottom: 'long'
});

const PHYSICAL_MONITOR = koffi.struct('NotchPhysicalMonitor', {
  hPhysicalMonitor: 'void *',
  szPhysicalMonitorDescription: koffi.array('char16_t', 128, 'String')
});

const MonitorEnumProc = koffi.proto('bool __stdcall NotchMonitorEnumProc(void *hMonitor, void *hdcMonitor, const NotchBrightnessRect *lprcMonitor, intptr_t dwData)');

const EnumDisplayMonitors = user32.func('bool __stdcall EnumDisplayMonitors(void *hdc, const NotchBrightnessRect *lprcClip, NotchMonitorEnumProc *lpfnEnum, intptr_t dwData)');
const GetNumberOfPhysicalMonitorsFromHMONITOR = dxva2.func('bool __stdcall GetNumberOfPhysicalMonitorsFromHMONITOR(void *hMonitor, _Out_ uint32_t *pdwNumberOfPhysicalMonitors)');
const GetPhysicalMonitorsFromHMONITOR = dxva2.func('bool __stdcall GetPhysicalMonitorsFromHMONITOR(void *hMonitor, uint32_t dwPhysicalMonitorArraySize, _Out_ NotchPhysicalMonitor *pPhysicalMonitorArray)');
const DestroyPhysicalMonitors = dxva2.func('bool __stdcall DestroyPhysicalMonitors(uint32_t dwPhysicalMonitorArraySize, NotchPhysicalMonitor *pPhysicalMonitorArray)');
const GetMonitorBrightness = dxva2.func('bool __stdcall GetMonitorBrightness(void *hMonitor, _Out_ uint32_t *pdwMinimumBrightness, _Out_ uint32_t *pdwCurrentBrightness, _Out_ uint32_t *pdwMaximumBrightness)');
const SetMonitorBrightness = dxva2.func('bool __stdcall SetMonitorBrightness(void *hMonitor, uint32_t dwNewBrightness)');
const GetVCPFeatureAndVCPFeatureReply = dxva2.func('bool __stdcall GetVCPFeatureAndVCPFeatureReply(void *hMonitor, uint8_t bVCPCode, _Out_ uint32_t *pvct, _Out_ uint32_t *pdwCurrentValue, _Out_ uint32_t *pdwMaximumValue)');
const SetVCPFeature = dxva2.func('bool __stdcall SetVCPFeature(void *hMonitor, uint8_t bVCPCode, uint32_t dwNewValue)');

const VCP_BRIGHTNESS = 0x10;

function clampPercent(value) {
  const parsed = Number.parseInt(value, 10);
  return Math.max(0, Math.min(100, Number.isNaN(parsed) ? 0 : parsed));
}

function enumerateMonitorHandles() {
  const handles = [];
  EnumDisplayMonitors(null, null, (hMonitor) => {
    if (hMonitor) {
      handles.push(hMonitor);
    }
    return true;
  }, 0);

  return handles;
}

function physicalMonitorsForHandle(hMonitor) {
  const countOut = [0];
  if (!GetNumberOfPhysicalMonitorsFromHMONITOR(hMonitor, countOut) || countOut[0] <= 0) {
    return {
      count: 0,
      buffer: null,
      monitors: []
    };
  }

  const count = countOut[0];
  const buffer = Buffer.alloc(koffi.sizeof(PHYSICAL_MONITOR) * count);
  if (!GetPhysicalMonitorsFromHMONITOR(hMonitor, count, buffer)) {
    return {
      count: 0,
      buffer: null,
      monitors: []
    };
  }

  return {
    count,
    buffer,
    monitors: koffi.decode(buffer, PHYSICAL_MONITOR, count)
  };
}

function withPhysicalMonitors(callback) {
  const results = [];

  for (const hMonitor of enumerateMonitorHandles()) {
    const physical = physicalMonitorsForHandle(hMonitor);
    try {
      physical.monitors.forEach((monitor, index) => {
        results.push(callback(monitor, index));
      });
    } finally {
      if (physical.buffer && physical.count > 0) {
        DestroyPhysicalMonitors(physical.count, physical.buffer);
      }
    }
  }

  return results;
}

function readMonitorBrightness(monitor) {
  const minimum = [0];
  const current = [0];
  const maximum = [0];

  let source = 'DDC/CI';
  if (!GetMonitorBrightness(monitor.hPhysicalMonitor, minimum, current, maximum)) {
    const codeType = [0];
    minimum[0] = 0;
    if (!GetVCPFeatureAndVCPFeatureReply(monitor.hPhysicalMonitor, VCP_BRIGHTNESS, codeType, current, maximum)) {
      return null;
    }
    source = 'DDC/CI VCP';
  }

  const range = Math.max(1, maximum[0] - minimum[0]);
  const level = Math.round(((current[0] - minimum[0]) / range) * 100);

  return {
    name: monitor.szPhysicalMonitorDescription || 'DDC/CI monitör',
    minimum: minimum[0],
    current: current[0],
    maximum: maximum[0],
    level: clampPercent(level),
    source
  };
}

function getExternalBrightnessState() {
  const monitors = withPhysicalMonitors((monitor) => readMonitorBrightness(monitor))
    .filter(Boolean);

  if (!monitors.length) {
    return {
      available: false,
      level: null,
      monitors: [],
      message: 'DDC/CI parlaklık destekleyen monitör bulunamadı.'
    };
  }

  const average = Math.round(monitors.reduce((sum, monitor) => sum + monitor.level, 0) / monitors.length);

  return {
    available: true,
    level: clampPercent(average),
    monitors,
    source: 'DDC/CI',
    message: monitors.length === 1
      ? `Monitör parlaklığı %${clampPercent(average)}`
      : `${monitors.length} monitör parlaklığı ortalama %${clampPercent(average)}`
  };
}

function setExternalBrightnessLevel(level) {
  const nextLevel = clampPercent(level);
  const changed = withPhysicalMonitors((monitor) => {
    const state = readMonitorBrightness(monitor);
    if (!state) {
      return null;
    }

    const target = Math.round(state.minimum + ((state.maximum - state.minimum) * (nextLevel / 100)));
    if (!SetMonitorBrightness(monitor.hPhysicalMonitor, target) && !SetVCPFeature(monitor.hPhysicalMonitor, VCP_BRIGHTNESS, target)) {
      return null;
    }

    return {
      ...state,
      current: target,
      level: nextLevel
    };
  }).filter(Boolean);

  if (!changed.length) {
    return {
      ok: false,
      available: false,
      level: null,
      message: 'DDC/CI ile monitör parlaklığı değiştirilemedi.'
    };
  }

  return {
    ok: true,
    available: true,
    level: nextLevel,
    source: 'DDC/CI',
    monitors: changed,
    message: changed.length === 1
      ? `Monitör parlaklığı %${nextLevel}`
      : `${changed.length} monitör parlaklığı %${nextLevel}`
  };
}

module.exports = {
  getExternalBrightnessState,
  setExternalBrightnessLevel
};
