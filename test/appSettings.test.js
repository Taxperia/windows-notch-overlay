const assert = require('node:assert/strict');
const test = require('node:test');
const Module = require('node:module');

const originalLoad = Module._load;
Module._load = function loadWithElectronMock(request, parent, isMain) {
  if (request === 'electron') {
    return {
      app: {
        getPath: () => 'unused-in-unit-tests'
      }
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const appSettings = require('../src/main/appSettings');
Module._load = originalLoad;

test('settings schema rejects unknown and prototype keys and normalizes unsafe values', () => {
  const malicious = JSON.parse('{"__proto__":{"polluted":true},"unknown":{"value":1},"appearance":{"customTheme":{"panel":"red;url(https://example.invalid)"}},"system":{"screenVideo":{"url":"javascript:alert(1)","width":99999}}}');
  const result = appSettings.mergeSettings(appSettings.DEFAULT_SETTINGS, malicious);

  assert.equal(Object.getPrototypeOf(result), Object.prototype);
  assert.equal(result.polluted, undefined);
  assert.equal(result.unknown, undefined);
  assert.equal(result.appearance.customTheme.panel, appSettings.DEFAULT_SETTINGS.appearance.customTheme.panel);
  assert.equal(result.system.screenVideo.url, '');
  assert.equal(result.system.screenVideo.width, 1920);
});

test('settings schema preserves supported application choices', () => {
  const result = appSettings.mergeSettings(appSettings.DEFAULT_SETTINGS, {
    appearance: {
      settingsMode: 'compact',
      mediaSource: 'any',
      alarmTone: 'soft',
      colorTheme: 'forest',
      notchStyle: 'pill'
    },
    content: {
      primaryWidget: 'pomodoro'
    }
  });

  assert.equal(result.appearance.settingsMode, 'compact');
  assert.equal(result.appearance.mediaSource, 'any');
  assert.equal(result.appearance.alarmTone, 'soft');
  assert.equal(result.appearance.colorTheme, 'forest');
  assert.equal(result.appearance.notchStyle, 'pill');
  assert.equal(result.content.primaryWidget, 'pomodoro');
});

test('live activity toggles default on and only accept booleans', () => {
  const result = appSettings.mergeSettings(appSettings.DEFAULT_SETTINGS, {
    liveActivities: {
      volume: false,
      privacy: 'yes',
      unknown: true
    }
  });

  assert.equal(result.liveActivities.volume, false);
  assert.equal(result.liveActivities.privacy, true);
  assert.equal(result.liveActivities.brightness, true);
  assert.equal(result.liveActivities.unknown, undefined);
});

test('game metric preferences persist independently and reject invalid types', () => {
  const result = appSettings.mergeSettings(appSettings.DEFAULT_SETTINGS, {
    gaming: { showFps: false, showCpu: false, showRam: true, showGpu: 'yes', customProcesses: ' custom.exe ', unknown: true }
  });
  assert.equal(result.gaming.showFps, false);
  assert.equal(result.gaming.showCpu, false);
  assert.equal(result.gaming.showRam, true);
  assert.equal(result.gaming.showGpu, true);
  assert.equal(result.gaming.customProcesses, 'custom.exe');
  assert.equal(result.gaming.unknown, undefined);
  assert.equal(appSettings.mergeSettings(appSettings.DEFAULT_SETTINGS, { gaming: { customProcesses: 'a'.repeat(3000) } }).gaming.customProcesses.length, 2048);
});

test('media player style, media window bounds and brightness memory are validated', () => {
  const defaults = appSettings.mergeSettings(appSettings.DEFAULT_SETTINGS, {});
  assert.equal(defaults.appearance.mediaPlayerStyle, 'modern');
  assert.deepEqual(defaults.system.hardwareBrightnessMemory, { level: -1, reported: -1 });
  assert.equal(defaults.system.mediaWindow.positioned, false);
  assert.equal(defaults.system.mediaWindow.alwaysOnTop, true);

  const result = appSettings.mergeSettings(appSettings.DEFAULT_SETTINGS, {
    appearance: { mediaPlayerStyle: 'theme' },
    system: {
      hardwareBrightnessMemory: { level: 100, reported: 75 },
      mediaWindow: { x: 1200, y: 40, width: 5000, height: 20, positioned: true, alwaysOnTop: false }
    }
  });
  assert.equal(result.appearance.mediaPlayerStyle, 'theme');
  assert.deepEqual(result.system.hardwareBrightnessMemory, { level: 100, reported: 75 });
  assert.equal(result.system.mediaWindow.width, appSettings.MEDIA_WINDOW_LIMITS.maxWidth);
  assert.equal(result.system.mediaWindow.height, appSettings.MEDIA_WINDOW_LIMITS.minHeight);
  assert.equal(result.system.mediaWindow.x, 1200);
  assert.equal(result.system.mediaWindow.alwaysOnTop, false);

  const invalid = appSettings.mergeSettings(appSettings.DEFAULT_SETTINGS, {
    appearance: { mediaPlayerStyle: 'neon' },
    system: { hardwareBrightnessMemory: { level: 400, reported: -50 } }
  });
  assert.equal(invalid.appearance.mediaPlayerStyle, 'modern');
  assert.deepEqual(invalid.system.hardwareBrightnessMemory, { level: 100, reported: -1 });
});
