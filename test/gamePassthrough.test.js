const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

test('main process keeps every game overlay mode click-through and restores desktop hover', () => {
  const ignored = [];
  const messages = [];
  let foreground = { pid: 8, processName: 'cs2' };
  const window = {
    isDestroyed: () => false, isVisible: () => true,
    getBounds: () => ({ x: 0, y: 0, width: 500, height: 36 }),
    setBounds: () => {}, setIgnoreMouseEvents: (value) => ignored.push(value),
    webContents: { isDestroyed: () => false, isCrashed: () => false, send: (...args) => messages.push(args) }
  };
  const context = vm.createContext({
    Buffer, URL, process, console, __dirname: path.resolve('src/main'),
    setInterval: () => 1, clearInterval: () => {}, setTimeout: () => 1, clearTimeout: () => {},
    fakeWindow: window,
    require: (name) => {
      if (name.startsWith('node:')) return require(name);
      if (name === '../../package.json') return require('../package.json');
      if (name === './gameMode') return require('../src/main/gameMode');
      if (name === './win32') return { getActiveWindowInfo: () => foreground };
      if (name === './liveActivity') return { createLiveActivityMonitor: () => ({}) };
      if (name === 'electron') return {
        app: { requestSingleInstanceLock: () => true, on: () => {}, whenReady: () => new Promise(() => {}) },
        screen: { getCursorScreenPoint: () => ({ x: 125, y: 12 }), getPrimaryDisplay: () => ({ bounds: { x: 0, y: 0, width: 1000 } }) }
      };
      return {};
    }
  });
  vm.runInContext(fs.readFileSync(path.resolve('src/main/index.js'), 'utf8'), context);
  vm.runInContext(`mainWindow = fakeWindow; stripRect = { x: 100, y: 0, width: 250, height: 34 }; overlayMode = 'controls'; refreshGameState();`, context);
  assert.equal(vm.runInContext('overlayMode', context), 'collapsed');
  assert.equal(ignored.at(-1), true);
  ignored.length = 0;
  for (const mode of ['controls', 'settings', 'media', 'alarm']) {
    vm.runInContext(`setOverlayMode('${mode}'); pollOverlayPointer(); setPointerOnStrip(true);`, context);
    assert.equal(vm.runInContext('overlayMode', context), 'collapsed');
  }
  assert.ok(ignored.every((value) => value === true), 'No entry point may enable mouse events during a game');
  assert.ok(messages.some(([channel, payload]) => channel === 'gaming:update' && payload.active));
  foreground = { pid: 9, processName: 'chrome' };
  vm.runInContext('refreshGameState(); pollOverlayPointer();', context);
  assert.equal(ignored.at(-1), false, 'Desktop hover must work again after Alt+Tab');
});
