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
