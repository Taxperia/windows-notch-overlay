// Run with: node_modules/.bin/electron scripts/check-overlay-ui.js
// Uses the real renderer and preload, with isolated settings and simulated system events.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { app, BrowserWindow, ipcMain } = require('electron');
app.disableHardwareAcceleration();
const { DEFAULT_SETTINGS, mergeSettings } = require('../src/main/appSettings');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'notch-ui-check-'));
app.setPath('userData', profile);
const output = path.resolve(__dirname, '../dist/ui-check');
let settings = structuredClone(DEFAULT_SETTINGS);

app.whenReady().then(async () => {
  const errors = [];
  const handlers = {
    'settings:get': () => settings,
    'settings:update': (_event, patch) => (settings = mergeSettings(settings, patch)),
    'i18n:list': () => [], 'i18n:get': () => ({}),
    'metrics:get': () => null, 'media:get': () => null, 'controls:get': () => null,
    'gaming:get': () => ({ active: false }), 'privacy:get': () => ({ camera: [], microphone: [] }),
    'app:info': () => null, 'notifications:get': () => ({ notifications: [] }),
    'extras:network': () => ({}),
    'media-window:get-state': () => ({ open: false })
  };
  Object.entries(handlers).forEach(([name, handler]) => ipcMain.handle(name, handler));
  const window = new BrowserWindow({
    width: 500, height: 70, useContentSize: true, show: false, frame: false, transparent: true,
    webPreferences: { preload: path.resolve(__dirname, '../src/preload.js'), sandbox: true, contextIsolation: true, offscreen: true }
  });
  window.webContents.on('console-message', (event) => {
    if (event.level === 'error' && !event.message.includes('frame-ancestors')) errors.push(event.message);
  });
  const evaluate = (source) => window.webContents.executeJavaScript(source);
  const settle = () => evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  const capture = async (name) => {
    await settle();
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, `${name}.png`), (await window.webContents.capturePage()).toPNG());
  };
  try {
    await window.loadFile(path.resolve(__dirname, '../src/renderer/index.html'));
    // Initialization finishes asynchronously after language and settings IPC calls.
    for (let count = 0; count < 30; count += 1) {
      if (await evaluate('Boolean(lastSettingsFingerprint) && elements.menuPages.children.length > 0')) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    await settle();
    await evaluate(`handleLiveActivity({ type: 'privacy', camera: [], microphone: ['Discord'] });`);
    assert.equal(await evaluate('activeActivity.label'), 'Discord mikrofonunu kullanıyor');
    assert.equal(await evaluate('elements.privacyMicrophoneDot.hidden'), false);
    assert.equal(await evaluate('elements.privacyMicrophoneDot.querySelectorAll("svg").length'), 1);
    assert.equal(await evaluate('elements.activityLabelText.getAnimations()[0].effect.getTiming().iterations'), 1);
    await evaluate(`handleLiveActivity({ type: 'privacy', camera: [], microphone: ['Discord'] });`);
    assert.equal(await evaluate('privacyQueue.length'), 0, 'Repeated polling must not repeat announcements');
    // Capture the moving text halfway through its one pass.
    await evaluate('elements.activityLabelText.getAnimations()[0].currentTime = 3000');
    await capture('privacy-scroll');
    await evaluate('hideLiveActivity()');
    assert.equal(await evaluate('elements.privacyMicrophoneDot.hidden'), false);
    assert.equal(await evaluate('elements.notch.classList.contains("has-live-activity")'), false);
    await capture('privacy-icon');

    await evaluate(`handleLiveActivity({ type: 'privacy', camera: [], microphone: [] });
      handleLiveActivity({ type: 'privacy', camera: ['Zoom'], microphone: ['Zoom', 'Discord'] });`);
    assert.equal(await evaluate('activeActivity.label'), 'Zoom kameranı ve mikrofonunu kullanıyor');
    assert.equal(await evaluate('privacyQueue.length'), 1);
    await evaluate('hideLiveActivity()');
    assert.equal(await evaluate('activeActivity.label'), 'Discord mikrofonunu kullanıyor');
    await evaluate(`handleLiveActivity({ type: 'privacy', camera: [], microphone: [] }); syncOverlayMode('controls');
      handleLiveActivity({ type: 'privacy', camera: ['Teams'], microphone: ['Teams'] });`);
    assert.equal(await evaluate('activeActivity'), null);
    assert.equal(await evaluate('privacyQueue.length'), 1);
    await evaluate(`syncOverlayMode('collapsed')`);
    assert.equal(await evaluate('activeActivity.label'), 'Teams kameranı ve mikrofonunu kullanıyor');
    await evaluate(`handleLiveActivity({ type: 'privacy', camera: [], microphone: [] });
      renderMetrics({cpu:{usage:34},gpu:{usage:76,temp:61},memory:{usage:48},activeWindow:{title:'Counter-Strike'},game:{processName:'cs2',fps:144}});
      syncGameState({active:true,processName:'cs2'});`);
    assert.equal(await evaluate('elements.gameCompact.textContent'), 'FPS 144CPU 34%GPU 76%');
    await evaluate(`elements.notch.dispatchEvent(new MouseEvent('mouseenter'));`);
    await new Promise((resolve) => setTimeout(resolve, 200));
    assert.equal(await evaluate('elements.notch.classList.contains("is-expanded")'), false);
    assert.equal(await evaluate('getComputedStyle(elements.notch).pointerEvents'), 'none');
    await capture('gaming');
    await evaluate(`syncGameState({active:true,processName:'eldenring'})`);
    assert.ok((await evaluate('elements.gameCompact.textContent')).startsWith('FPS —'));
    await evaluate(`syncGameState({active:true,processName:'cs2'});
      applySettings({...appSettings, gaming:{...appSettings.gaming,showGpuTemp:true,showRam:true}, appearance:{...appSettings.appearance,notchStyle:'compact'},content:{...appSettings.content,showPing:true}});
      renderPrivacyIndicator({camera:['Zoom'],microphone:['Discord']});`);
    await settle();
    const layout = await evaluate(`(() => {
      const metrics = elements.gameCompact.getBoundingClientRect();
      const icons = elements.privacyDots.getBoundingClientRect();
      const last = elements.gameCompact.lastElementChild.getBoundingClientRect();
      return {width:metrics.width, right:last.right, iconsLeft:icons.left, overflow:elements.gameCompact.scrollWidth > elements.gameCompact.clientWidth};
    })()`);
    assert.equal(layout.overflow, false, JSON.stringify(layout));
    assert.ok(layout.right <= layout.iconsLeft, JSON.stringify(layout));
    await capture('gaming-all-metrics');
    await evaluate(`syncGameState({active:false}); renderPrivacyIndicator(null);`);
    assert.equal(await evaluate('elements.gameCompact.hidden'), true);
    assert.equal(await evaluate('getComputedStyle(elements.notch).pointerEvents'), 'auto');
    await evaluate(`document.querySelector('[data-setting-toggle="gaming.showCpu"]').click()`);
    await settle();
    assert.equal(settings.gaming.showCpu, false, 'The settings switch must persist through preload IPC');
    await evaluate(`const extra = document.querySelector('[data-setting-input]'); extra.value='my-game.exe'; extra.dispatchEvent(new Event('change'));`);
    await settle();
    assert.equal(settings.gaming.customProcesses, 'my-game.exe');
    window.setContentSize(760, 520);
    await evaluate(`syncOverlayMode('settings'); showSettingsSection('content');
      document.querySelector('[data-setting-toggle="gaming.enabled"]').scrollIntoView({block:'center'});`);
    await capture('gaming-settings');
    assert.deepEqual(errors, []);
    console.log('Overlay UI verified: one-pass privacy text, persistent icons, simultaneous apps, deferred announcements, game metrics, no hover expansion, layout, and saved preferences.');
    console.log(`Previews: ${output}`);
    window.destroy();
    app.exit(0);
  } catch (error) {
    console.error(error);
    console.error('Renderer errors:', errors);
    window.destroy();
    app.exit(1);
  }
});
