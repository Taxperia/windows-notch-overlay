// Run with: node_modules/.bin/electron scripts/check-media-ui.js [outputDir]
// Renders the detached media window and the notch media stage in both designs with sample media.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
app.disableHardwareAcceleration();
const { DEFAULT_SETTINGS, mergeSettings } = require('../src/main/appSettings');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'notch-media-check-'));
app.setPath('userData', profile);
const output = path.resolve(process.argv[2] || path.join(__dirname, '../dist/media-ui-check'));
let settings = structuredClone(DEFAULT_SETTINGS);
const commands = [];
// Pencereler sırayla açılıp kapandığından son pencere kapanınca uygulama kapanmasın.
app.on('window-all-closed', () => {});

function sampleCover() {
  const size = 96;
  const pixels = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      const glow = Math.max(0, 1 - Math.hypot(x - 62, y - 40) / 60);
      // BGRA
      pixels[offset] = Math.round(30 + 40 * glow);
      pixels[offset + 1] = Math.round(20 + 50 * glow);
      pixels[offset + 2] = Math.round(150 + 100 * glow);
      pixels[offset + 3] = 255;
    }
  }
  return nativeImage.createFromBitmap(pixels, { width: size, height: size }).toDataURL();
}

const media = {
  available: true,
  title: 'TAPA TOMA',
  artist: 'Dj Samir, DJ David MM, LOLKYE',
  status: 'playing',
  app: 'Spotify',
  avatarText: 'S',
  thumbnailDataUrl: sampleCover(),
  durationMs: 104000,
  positionMs: 1000,
  startedAt: Date.now() - 1000,
  shuffle: false,
  repeat: 'none',
  canShuffle: true,
  canRepeat: true,
  canSeek: true,
  canPrevious: true,
  canNext: true
};

app.whenReady().then(async () => {
  const errors = [];
  const handlers = {
    'settings:get': () => settings,
    'settings:update': (_event, patch) => (settings = mergeSettings(settings, patch)),
    'media:get': () => media,
    'media:command': (_event, command, extra) => {
      commands.push(extra ? { command, ...extra } : { command });
      return { ...media, shuffle: command === 'shuffle' ? true : media.shuffle };
    },
    'media-window:toggle-pin': () => ({ open: true, alwaysOnTop: false }),
    'media-window:get-state': () => ({ open: false }),
    'media-window:toggle': () => ({ open: true, alwaysOnTop: true }),
    'i18n:list': () => [], 'i18n:get': () => ({}),
    'metrics:get': () => null, 'controls:get': () => null,
    'gaming:get': () => ({ active: false }), 'privacy:get': () => ({ camera: [], microphone: [] }),
    'app:info': () => null, 'notifications:get': () => ({ notifications: [] }),
    'extras:network': () => ({})
  };
  Object.entries(handlers).forEach(([name, handler]) => ipcMain.handle(name, handler));
  ['media-window:close', 'media-window:resize-start', 'media-window:resize-end'].forEach((name) => ipcMain.on(name, () => {}));

  const makeWindow = (width, height, preload) => {
    const window = new BrowserWindow({
      width, height, useContentSize: true, show: false, frame: false, transparent: true,
      webPreferences: { preload, sandbox: true, contextIsolation: true, offscreen: true }
    });
    window.webContents.on('console-message', (event) => {
      if (event.level === 'error' && !event.message.includes('frame-ancestors')) errors.push(event.message);
    });
    return window;
  };
  const settle = (window) => window.webContents.executeJavaScript('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 120))))');
  const capture = async (window, name) => {
    await settle(window);
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, `${name}.png`), (await window.webContents.capturePage()).toPNG());
  };
  const broadcast = (window, nextSettings) => window.webContents.send('settings:update', nextSettings);

  try {
    // Detached media window.
    const mediaWindow = makeWindow(420, 236, path.resolve(__dirname, '../src/media-preload.js'));
    await mediaWindow.loadFile(path.resolve(__dirname, '../src/renderer/media-window.html'));
    const evaluate = (source) => mediaWindow.webContents.executeJavaScript(source);
    for (let count = 0; count < 40; count += 1) {
      if (await evaluate(`document.querySelector('.mp-title')?.textContent === 'TAPA TOMA'`)) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    assert.equal(await evaluate(`document.querySelector('.mp').dataset.style`), 'modern');
    assert.equal(await evaluate(`document.querySelector('.mp').dataset.context`), 'window');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.mp-close')).display !== 'none'`), true);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.mp-detach')).display`), 'none');
    await capture(mediaWindow, 'window-modern-420x236');

    const layout = await evaluate(`(() => {
      const card = document.querySelector('.mp').getBoundingClientRect();
      const nodes = ['.mp-header', '.mp-line', '.mp-timeline', '.mp-controls'].map((s) => document.querySelector(s).getBoundingClientRect());
      return { card: { top: card.top, bottom: card.bottom }, nodes: nodes.map((r) => ({ top: r.top, bottom: r.bottom })) };
    })()`);
    layout.nodes.forEach((node, index) => {
      assert.ok(node.bottom <= layout.card.bottom + 0.5, `node ${index} overflows the card: ${JSON.stringify(layout)}`);
      if (index > 0) assert.ok(node.top >= layout.nodes[index - 1].bottom - 0.5, `nodes overlap: ${JSON.stringify(layout)}`);
    });

    await evaluate(`document.querySelector('[data-mp-command="shuffle"]').click()`);
    await settle(mediaWindow);
    assert.deepEqual(commands.at(-1), { command: 'shuffle' });
    assert.equal(await evaluate(`document.querySelector('.mp-shuffle').getAttribute('aria-pressed')`), 'true');

    // Seek by clicking at 50% of the track.
    await evaluate(`(() => {
      const track = document.querySelector('.mp-track');
      const rect = track.getBoundingClientRect();
      const init = { bubbles: true, pointerId: 1, button: 0, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
      track.dispatchEvent(new PointerEvent('pointerdown', init));
      track.dispatchEvent(new PointerEvent('pointerup', init));
    })()`);
    await settle(mediaWindow);
    assert.equal(commands.at(-1).command, 'seek');
    assert.ok(Math.abs(commands.at(-1).positionMs - 52000) < 1500, JSON.stringify(commands.at(-1)));

    for (const [width, height] of [[640, 360], [300, 150]]) {
      mediaWindow.setContentSize(width, height);
      await capture(mediaWindow, `window-modern-${width}x${height}`);
    }

    settings = mergeSettings(settings, { appearance: { mediaPlayerStyle: 'theme', colorTheme: 'default' } });
    broadcast(mediaWindow, settings);
    for (const [width, height] of [[420, 236], [640, 360], [300, 150]]) {
      mediaWindow.setContentSize(width, height);
      await capture(mediaWindow, `window-theme-${width}x${height}`);
    }
    assert.equal(await evaluate(`document.querySelector('.mp').dataset.style`), 'theme');
    mediaWindow.destroy();

    // Notch media stage inside the main overlay renderer.
    const notch = makeWindow(504, 196, path.resolve(__dirname, '../src/preload.js'));
    await notch.loadFile(path.resolve(__dirname, '../src/renderer/index.html'));
    const evaluateNotch = (source) => notch.webContents.executeJavaScript(source);
    for (let count = 0; count < 40; count += 1) {
      if (await evaluateNotch('Boolean(lastSettingsFingerprint) && elements.menuPages.children.length > 0')) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    for (const style of ['modern', 'theme']) {
      settings = mergeSettings(settings, { appearance: { mediaPlayerStyle: style } });
      await evaluateNotch(`applySettings(${JSON.stringify(settings)});
        syncOverlayMode('media');
        elements.notch.classList.add('is-expanded');
        mediaMenuOverride = false;
        renderMedia(${JSON.stringify(media)});`);
      assert.equal(await evaluateNotch('elements.mediaStage.hidden'), false, 'Media stage should be visible while Spotify plays');
      assert.equal(await evaluateNotch(`elements.notch.classList.contains('media-style-modern')`), style === 'modern');
      notch.setContentSize(504, style === 'modern' ? 196 : 182);
      await capture(notch, `notch-${style}`);
    }
    // Tema uyumlu görünümde ayrı pencere butonu üst satırda, ayarlar dişlisinin yanındadır.
    const visible = (selector) => evaluateNotch(`(() => { const el = document.querySelector('${selector}'); return Boolean(el) && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0; })()`);
    assert.equal(await visible('.topbar-media-window'), true);
    assert.equal(await visible('#mediaStage .mp-detach'), false);
    const bottomGap = await evaluateNotch(`document.querySelector('.expanded-panel').getBoundingClientRect().bottom - document.querySelector('#mediaStage .mp-controls').getBoundingClientRect().bottom`);
    assert.ok(bottomGap >= 10, `media controls must not touch the panel edge (gap ${bottomGap}px)`);
    await evaluateNotch(`document.querySelector('.topbar-media-window').click()`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(await evaluateNotch(`document.querySelector('#mediaStage .mp-detach').getAttribute('aria-pressed')`), 'true');
    assert.equal(await evaluateNotch(`document.querySelector('.topbar-media-window').getAttribute('aria-pressed')`), 'true');
    assert.equal(await evaluateNotch(`document.querySelector('footer [data-toggle-media-window]').getAttribute('aria-pressed')`), 'true');

    // Modern kartta üst satır gizlidir; buton kartın içindedir.
    settings = mergeSettings(settings, { appearance: { mediaPlayerStyle: 'modern' } });
    await evaluateNotch(`applySettings(${JSON.stringify(settings)})`);
    assert.equal(await visible('.topbar-media-window'), false);
    assert.equal(await visible('#mediaStage .mp-detach'), true);

    notch.destroy();
    assert.deepEqual(errors, []);
    console.log('Media UI verified: both designs in the detached window (3 sizes) and in the notch, shuffle, seek and detach.');
    console.log(`Previews: ${output}`);
    app.exit(0);
  } catch (error) {
    console.error(error);
    console.error('Renderer errors:', errors);
    app.exit(1);
  }
});
