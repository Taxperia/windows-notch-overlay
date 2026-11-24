// Records the README demo: npm run record:demo
// Runs the real renderer UI (notch + detached media window) inside an offscreen demo stage with sample data,
// drives it with real mouse input, pipes frames to ffmpeg and writes docs/media/demo.mp4 and docs/media/demo.gif.
// Requires ffmpeg on PATH (or FFMPEG_PATH). Nothing here touches the user's real settings or devices.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawn } = require('node:child_process');
const { app, BrowserWindow, ipcMain } = require('electron');

const root = path.join(__dirname, '..');
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'notch-demo-')));
const { DEFAULT_SETTINGS, mergeSettings } = require('../src/main/appSettings');
const { getLanguage, listLanguages } = require('../src/main/i18n');
const { SYSTEM_SOUNDS_ICON_SOURCE, createExecutableIconReader } = require('../src/main/appIcons');

const STAGE = { width: 960, height: 540 };
const ZOOM = 1.5;
const FPS = 24;
const GIF_FPS = 15;
const GIF_WIDTH = 960;
const NOTCH_LEFT = 228; // stage.css .notch-frame left
const OUTPUT_DIR = path.join(root, 'docs', 'media');
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
// Mirrors collapsedBoundsForSettings, withPanelChrome and THEME_TOP_MARGIN in src/main/index.js.
const PANEL_HEIGHTS = { controls: 330, settings: 520, alarm: 172, media: { modern: 190, theme: 176 } };
const STYLE_TOP_PAD = { attached: 0, floating: 6, compact: 6, pill: 8 };
const DETACHED_STYLES = new Set(['floating', 'pill', 'compact']);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const debugStarted = Date.now();
const debug = (...args) => {
  if (process.env.DEMO_DEBUG_DIR) console.log(`[${((Date.now() - debugStarted) / 1000).toFixed(2)}s]`, ...args);
};
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

let settings = mergeSettings(DEFAULT_SETTINGS, {
  appearance: { mediaPlayerStyle: 'modern', colorTheme: 'default', notchStyle: 'attached', language: 'tr' },
  liveActivities: { volume: true, privacy: true }
});

const minutesAgo = (minutes) => Date.now() - minutes * 60 * 1000;
// Örnek bildirimler (kurgusal içerik); logolar kayıt yapılan makinedeki uygulama ikonlarından alınır.
const notifications = [
  { id: 'n-security', app: 'Windows Güvenliği', title: 'Tarama tamamlandı', message: 'Tehdit bulunamadı.', createdAt: minutesAgo(34), source: 'security' },
  { id: 'n-edge', app: 'Microsoft Edge', title: 'İndirme tamamlandı', message: 'sunum-kasim.pdf', createdAt: minutesAgo(12), source: 'edge' },
  { id: 'n-spotify', app: 'Spotify', title: 'Haftalık keşif hazır', message: 'Bu haftanın yeni şarkıları seni bekliyor.', createdAt: minutesAgo(5), source: 'spotify' }
];
const incomingNotification = { id: 'n-discord', app: 'Discord', title: 'Mert', message: 'Akşam 9\'da oyuna var mısın?', source: 'discord' };

const media = {
  available: true,
  title: 'Neon Skyline',
  artist: 'Lumen Drive',
  album: 'Night Signals',
  status: 'paused',
  app: 'Spotify',
  avatarText: 'S',
  thumbnailDataUrl: '',
  durationMs: 214000,
  positionMs: 61000,
  startedAt: null,
  shuffle: false,
  repeat: 'none',
  canShuffle: true,
  canRepeat: true,
  canSeek: true,
  canPrevious: true,
  canNext: true
};

const controls = {
  silent: { enabled: false, label: 'Kapalı' },
  bluetooth: { enabled: true, connected: true, label: 'Bağlı' },
  microphone: { enabled: true, label: 'Açık' },
  camera: { enabled: true, label: 'Açık' },
  brightness: { enabled: null, level: 80, label: '80%' },
  darkMode: { enabled: true, label: 'Açık' },
  nightLight: { enabled: false, label: 'Kapalı' },
  batterySaver: { enabled: false, label: 'Kapalı' },
  network: { enabled: true, label: 'Wi-Fi' }
};

function firstExisting(candidates) {
  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) || '';
}

function discordPath() {
  const base = path.join(process.env.LOCALAPPDATA || '', 'Discord');
  try {
    const versions = fs.readdirSync(base).filter((name) => /^app-/.test(name)).sort().reverse();
    return firstExisting(versions.map((name) => path.join(base, name, 'Discord.exe')));
  } catch {
    return '';
  }
}

// Microsoft Store sürümleri WindowsApps altında kurulur; konum paket adından bulunur.
function storeAppExecutable(packageName, executable) {
  if (!/^[A-Za-z0-9.]+$/.test(packageName)) return '';
  try {
    const powershell = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    const location = execFileSync(powershell, ['-NoProfile', '-Command', `(Get-AppxPackage -Name ${packageName} | Select-Object -First 1).InstallLocation`], { encoding: 'utf8', windowsHide: true, timeout: 8000 }).trim();
    return location ? path.join(location, executable) : '';
  } catch {
    return '';
  }
}

const SYSTEM32 = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32');
const iconSources = {
  system: SYSTEM_SOUNDS_ICON_SOURCE,
  security: firstExisting([path.join(SYSTEM32, 'SecurityHealthSystray.exe')]),
  spotify: firstExisting([path.join(process.env.APPDATA || '', 'Spotify', 'Spotify.exe'), storeAppExecutable('SpotifyAB.SpotifyMusic', 'Spotify.exe')]),
  discord: discordPath(),
  edge: firstExisting(['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'])
};

// Mixer rows use the real icon of each app when it is installed on the recording machine.
const mixerSessions = [
  { id: 'system', name: 'Sistem sesleri', systemSounds: true, active: false, volume: 100, peak: 0, source: iconSources.system },
  { id: 'spotify', name: 'Spotify', pid: 4120, active: true, volume: 100, peak: 0.64, source: iconSources.spotify },
  { id: 'discord', name: 'Discord', pid: 7344, active: true, volume: 80, peak: 0.22, source: iconSources.discord },
  { id: 'edge', name: 'Microsoft Edge', pid: 9132, active: false, volume: 65, peak: 0, source: iconSources.edge }
].map((session) => ({ muted: false, state: session.active ? 1 : 0, deviceName: 'Hoparlör', defaultDevice: true, ...session }));

let win;
let notchMode = 'collapsed';
let stripRect = null;
let stripHover = false;
let pointerInsideNotch = false;
let mediaWindowOpen = false;
let mouse = { x: 170, y: 440 };
const errors = [];

const stageJs = (source) => win.webContents.executeJavaScript(source);
const frameWith = (part) => win.webContents.mainFrame.framesInSubtree.find((frame) => frame.url.includes(part));
const notchFrame = () => frameWith('/src/renderer/index.html');
const mediaFrame = () => frameWith('/src/renderer/media-window.html');
const sendToFrames = (channel, payload) => [notchFrame(), mediaFrame()].forEach((frame) => frame?.send(channel, payload));

// Overlay "window" position and size for the current notch style and mode.
function notchGeometry(mode = notchMode) {
  const style = settings.appearance.notchStyle;
  const pad = STYLE_TOP_PAD[style] ?? 0;
  const top = DETACHED_STYLES.has(style) ? 6 : 0;
  if (mode === 'collapsed') {
    return { top, height: settings.appearance.compactHeight + pad + 2 };
  }
  const panel = mode === 'media'
    ? PANEL_HEIGHTS.media[settings.appearance.mediaPlayerStyle] || PANEL_HEIGHTS.media.modern
    : PANEL_HEIGHTS[mode] || PANEL_HEIGHTS.controls;
  return { top, height: panel + pad + 2 };
}

const applyNotchGeometry = () => stageJs(`stage.setNotchFrame(${JSON.stringify(notchGeometry())})`);

// Plays the main process role: resize the overlay "window" and tell the renderer about the new mode.
async function setNotchMode(mode) {
  if (notchMode === mode) return;
  debug('notch mode', notchMode, '->', mode, 'mouse', Math.round(mouse.x), Math.round(mouse.y));
  notchMode = mode;
  await applyNotchGeometry();
  notchFrame()?.send('overlay:mode', mode);
}

async function withIcon(item, iconForExecutable) {
  const { source, ...rest } = item;
  const appIcon = await iconForExecutable(iconSources[source]);
  return appIcon ? { ...rest, appIcon } : rest;
}

function publishMedia() {
  sendToFrames('media:update', { ...media });
}

function mixerSnapshot() {
  return { available: true, deviceCount: 1, defaultDeviceName: 'Hoparlör', sessions: mixerSessions.map(({ source, ...session }) => session) };
}

async function mixerWithIcons(iconForExecutable) {
  const snapshot = mixerSnapshot();
  snapshot.sessions = await Promise.all(snapshot.sessions.map(async (session) => {
    const source = mixerSessions.find((item) => item.id === session.id)?.source;
    const iconDataUrl = await iconForExecutable(source);
    return iconDataUrl ? { ...session, iconDataUrl } : session;
  }));
  return snapshot;
}

const iconForExecutable = createExecutableIconReader((target, options) => app.getFileIcon(target, options));

function registerIpc() {
  const handlers = {
    'settings:get': () => settings,
    'settings:update': (_event, patch) => (settings = mergeSettings(settings, patch)),
    'i18n:list': () => listLanguages(),
    'i18n:get': (_event, code) => getLanguage(code),
    'metrics:get': () => ({ cpu: { usage: 14 }, gpu: { usage: 21 }, memory: { usage: 43 }, activeWindow: { title: 'Spotify' } }),
    'media:get': () => ({ ...media }),
    'controls:get': () => controls,
    'gaming:get': () => ({ active: false }),
    'privacy:get': () => ({ camera: [], microphone: [] }),
    'app:info': () => ({ name: 'Windows Notch Overlay', version: '0.4.0' }),
    'notifications:get': async () => ({
      available: true,
      notifications: await Promise.all([...notifications].reverse().map((item) => withIcon(item, iconForExecutable)))
    }),
    'extras:network': () => {
      const wobble = Math.sin(Date.now() / 1700);
      return {
        downloadSpeed: `${(24.6 + wobble * 3.1).toFixed(1)} MB/s`,
        uploadSpeed: `${(1.4 + wobble * 0.3).toFixed(1)} MB/s`,
        ping: `${Math.round(18 + wobble * 3)} ms`,
        headphoneBattery: '--'
      };
    },
    'brightness:get': () => ({ ok: true, available: true, level: 80, mode: 'hardware', message: 'Monitör parlaklığı 80%' }),
    'audio-mixer:get': () => mixerWithIcons(iconForExecutable),
    'audio-mixer:set-volume': async (_event, sessionId, volume) => {
      const session = mixerSessions.find((item) => item.id === sessionId);
      if (session) session.volume = Math.max(0, Math.min(100, Number(volume) || 0));
      return { ok: true, mixer: await mixerWithIcons(iconForExecutable) };
    },
    'audio-mixer:set-muted': async (_event, sessionId, muted) => {
      const session = mixerSessions.find((item) => item.id === sessionId);
      if (session) session.muted = muted === true;
      return { ok: true, mixer: await mixerWithIcons(iconForExecutable) };
    },
    'quick:action': () => ({ ok: true }),
    'media:command': (_event, command, extra) => {
      if (command === 'playPause') {
        const playing = media.status === 'playing';
        media.positionMs = playing ? Math.min(media.durationMs, Date.now() - media.startedAt) : media.positionMs;
        media.status = playing ? 'paused' : 'playing';
        media.startedAt = playing ? null : Date.now() - media.positionMs;
      } else if (command === 'seek') {
        media.positionMs = Number(extra?.positionMs) || 0;
        media.startedAt = media.status === 'playing' ? Date.now() - media.positionMs : null;
      } else if (command === 'shuffle') {
        media.shuffle = !media.shuffle;
      } else if (command === 'repeat') {
        media.repeat = media.repeat === 'none' ? 'list' : (media.repeat === 'list' ? 'track' : 'none');
      }
      publishMedia();
      return { ...media };
    },
    'media-window:get-state': () => ({ open: mediaWindowOpen, alwaysOnTop: true }),
    'media-window:toggle': async () => {
      mediaWindowOpen = !mediaWindowOpen;
      if (mediaWindowOpen) {
        // Çentiğin altında, sol tarafta açılır; sahnede sağ alta sürüklenir.
        await stageJs(`stage.openMediaWindow('../../src/renderer/media-window.html', { x: 36, y: 215, width: 420, height: 236 })`);
      } else {
        await stageJs('stage.closeMediaWindow()');
      }
      const state = { open: mediaWindowOpen, alwaysOnTop: true };
      notchFrame()?.send('media-window:state', state);
      return state;
    },
    'media-window:toggle-pin': () => ({ open: true, alwaysOnTop: true })
  };
  Object.entries(handlers).forEach(([channel, handler]) => ipcMain.handle(channel, handler));

  ipcMain.on('overlay:strip-rect', (_event, rect) => { stripRect = rect; });
  ipcMain.on('overlay:expand', () => { if (notchMode === 'collapsed') setNotchMode('controls'); });
  ipcMain.on('overlay:collapse', () => { if (notchMode !== 'settings') setNotchMode('collapsed'); });
  ipcMain.on('overlay:controls', () => setNotchMode('controls'));
  ipcMain.on('overlay:media', () => setNotchMode('media'));
  ipcMain.on('overlay:alarm', () => setNotchMode('alarm'));
  ipcMain.on('overlay:settings', () => setNotchMode('settings'));
  ['settings:open-preferred', 'window:close-current', 'media-window:close', 'media-window:resize-start', 'media-window:resize-end']
    .forEach((channel) => ipcMain.on(channel, () => {}));
}

// --- Mouse -------------------------------------------------------------------------------------

function sendMouse(type, x, y, extra = {}) {
  win.webContents.sendInputEvent({ type, x: Math.round(x * ZOOM), y: Math.round(y * ZOOM), ...extra });
}

// Mirrors the main process pointer polling: strip hover while collapsed, pointer-leave while expanded.
function trackNotchPointer(x, y) {
  const geometry = notchGeometry();
  const localX = x - NOTCH_LEFT;
  const localY = y - geometry.top;
  if (notchMode === 'collapsed') {
    pointerInsideNotch = false;
    const inside = Boolean(stripRect) && localX >= stripRect.x - 4 && localX < stripRect.x + stripRect.width + 4
      && localY >= stripRect.y - 4 && localY < stripRect.y + stripRect.height + 4;
    if (inside !== stripHover) {
      stripHover = inside;
      notchFrame()?.send('overlay:strip-hover', inside);
    }
    return;
  }
  stripHover = false;
  const inside = localX >= 0 && localX < 504 && localY >= 0 && localY < geometry.height;
  if (pointerInsideNotch && !inside) {
    debug('pointer-leave at', Math.round(x), Math.round(y), 'mode', notchMode);
    notchFrame()?.send('overlay:pointer-leave');
  }
  pointerInsideNotch = inside;
}

// Hareket gerçek zamana bağlıdır: sahneyle her adımdaki iletişim süreyi uzatmaz.
async function moveMouse(x, y, ms = 600, { dragging = false, onStep } = {}) {
  const from = { ...mouse };
  const started = Date.now();
  let progress = 0;
  while (progress < 1) {
    progress = Math.min(1, (Date.now() - started) / ms);
    const t = easeInOut(progress);
    mouse = { x: from.x + (x - from.x) * t, y: from.y + (y - from.y) * t };
    sendMouse('mouseMove', mouse.x, mouse.y, dragging ? { modifiers: ['leftButtonDown'] } : {});
    trackNotchPointer(mouse.x, mouse.y);
    await Promise.all([stageJs(`stage.setCursor(${mouse.x.toFixed(1)}, ${mouse.y.toFixed(1)})`), onStep?.(t)]);
    if (progress < 1) {
      await sleep(10);
    }
  }
}

async function mouseDown() {
  sendMouse('mouseDown', mouse.x, mouse.y, { button: 'left', clickCount: 1 });
  await stageJs('stage.click()');
}

function mouseUp() {
  sendMouse('mouseUp', mouse.x, mouse.y, { button: 'left', clickCount: 1 });
}

async function click() {
  await mouseDown();
  await sleep(90);
  mouseUp();
}

async function centerOf(frame, selector, offset) {
  const point = await frame.executeJavaScript(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  if (!point) throw new Error(`Demo target not found: ${selector}`);
  return { x: offset.x + point.x, y: offset.y + point.y };
}

const notchPoint = (selector) => centerOf(notchFrame(), selector, { x: NOTCH_LEFT, y: notchGeometry().top });
const notchJs = (source) => notchFrame().executeJavaScript(source);

// Moves to a notch element and clicks it; returns after the click.
async function clickNotch(selector, ms = 520) {
  const point = await notchPoint(selector);
  await moveMouse(point.x, point.y, ms);
  await click();
}

// Menu tiles live on carousel pages of eight; switch to the tile's page via its dot first.
async function openMenuTile(action) {
  const page = await notchJs(`(() => {
    const tiles = [...document.querySelectorAll('.menu-tile[data-action]')];
    const index = tiles.findIndex((tile) => tile.dataset.action === ${JSON.stringify(action)});
    return index < 0 ? -1 : Math.floor(index / PAGE_SIZE);
  })()`);
  if (page < 0) throw new Error(`Menu tile not found: ${action}`);
  const current = await notchJs(`Math.round(elements.menuPages.scrollLeft / Math.max(1, elements.menuPages.clientWidth))`);
  if (current !== page) {
    await clickNotch(`.menu-dot[data-page="${page}"]`, 480);
    await sleep(650);
  }
  await clickNotch(`.menu-tile[data-action="${action}"]`, 520);
}

const isExpanded = () => notchJs(`elements.notch.classList.contains('is-expanded')`);

async function hoverNotch(ms = 900) {
  const strip = await notchPoint('.collapsed-strip');
  await moveMouse(strip.x, strip.y, ms);
  await waitFor(isExpanded, 'notch expand');
}

async function waitFor(check, label, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await check()) return;
    await sleep(50);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

function caption(title, detail = '') {
  debug('caption', title);
  return stageJs(`stage.setCaption(${JSON.stringify(title)}, ${JSON.stringify(detail)})`);
}

async function applyDemoSettings(patch) {
  settings = mergeSettings(settings, patch);
  sendToFrames('settings:update', settings);
  await applyNotchGeometry();
}

// --- Scenes ------------------------------------------------------------------------------------

async function playScenes() {
  await stageJs(`stage.setCursor(${mouse.x}, ${mouse.y})`);
  await sleep(1300);

  // Live activities in the collapsed notch.
  await caption('Live activities', 'Volume, brightness and audio device changes');
  for (const level of [38, 52, 66, 74]) {
    await notchJs(`handleLiveActivity({ type: 'volume', level: ${level}, muted: false })`);
    await sleep(300);
  }
  await sleep(1100);

  // Privacy: an app starts using the microphone; the strip announces it and keeps a dot.
  await caption('Privacy indicator', 'Shows which app is using your microphone or camera');
  await notchJs(`handleLiveActivity({ type: 'privacy', camera: [], microphone: ['Discord'] })`);
  await sleep(3300);
  await notchJs('hideLiveActivity()');
  await sleep(900);
  // Discord releases the microphone: the dot goes away and the strip is back to its default look.
  await notchJs(`handleLiveActivity({ type: 'privacy', camera: [], microphone: [] })`);
  await sleep(600);

  // Optional network stats: switched on with an animation, then back to the default strip.
  await caption('Network stats, when you want them', 'Download, upload and ping can be added to the strip');
  await applyDemoSettings({ content: { showDownloadSpeed: true, showPing: true } });
  await sleep(3200);
  await applyDemoSettings({ content: { showDownloadSpeed: false, showPing: false } });
  await sleep(900);

  // Hover to expand, then a notification arrives in the top bar.
  await stageJs('stage.hideIntro()');
  await caption('Hover the notch', 'Quick controls and tools open right where you need them');
  await hoverNotch(1000);
  await sleep(450);
  // İlk sırada kal: medya kartı açılınca çentik kısalır ve aşağıdaki imleç dışarıda kalıp çentiği kapatır.
  const bluetooth = await notchPoint('[data-action="bluetooth"]');
  await moveMouse(bluetooth.x, bluetooth.y, 520);
  await sleep(300);
  notifications.push({ ...incomingNotification, createdAt: Date.now() });
  notchFrame().send('notifications:update', await withIcon({ ...incomingNotification, createdAt: Date.now() }, iconForExecutable));
  await caption('Notifications', 'New notifications scroll across the top bar');
  await sleep(2600);

  // Notification center with app icons.
  await caption('Notification center', 'Recent notifications with each app\'s icon');
  await openMenuTile('notification-center');
  await waitFor(() => notchJs(`document.querySelectorAll('.notification-row').length >= 3`), 'notification center');
  await sleep(2200);
  await clickNotch('[data-close-tool]', 520);
  await sleep(300);
  await clickNotch('.menu-dot[data-page="0"]', 420);
  await sleep(500);
  const camera = await notchPoint('[data-action="camera"]');
  await moveMouse(camera.x, camera.y, 450);
  await sleep(250);

  // Spotify starts playing: the media card replaces the menus.
  media.status = 'playing';
  media.startedAt = Date.now() - media.positionMs;
  publishMedia();
  await caption('Spotify-aware media card', 'Cover art, seek bar, shuffle and repeat');
  await waitFor(() => notchJs('!elements.mediaStage.hidden'), 'media card');
  await sleep(500);
  await clickNotch('#mediaStage [data-mp-command="shuffle"]', 560);
  await sleep(400);
  const track = await notchJs(`(() => { const r = document.querySelector('#mediaStage .mp-track').getBoundingClientRect(); return { x: r.left, y: r.top + r.height / 2, width: r.width }; })()`);
  await moveMouse(NOTCH_LEFT + track.x + track.width * 0.62, notchGeometry().top + track.y, 480);
  await click();
  await sleep(500);

  // Pop the player out and drag it.
  await caption('Pop the player out', 'Drag it anywhere and resize it from any edge');
  await moveMouse(...Object.values(await notchPoint('#mediaStage [data-mp-action="detach"]')), 600);
  await click();
  await waitFor(async () => Boolean(mediaFrame()) && mediaFrame().executeJavaScript(`document.querySelector('.mp-title')?.textContent === 'Neon Skyline'`).catch(() => false), 'media window');
  await sleep(500);

  const start = await stageJs('stage.mediaRect()');
  await moveMouse(start.x + 120, start.y + 40, 600);
  await mouseDown();
  const target = { x: 500, y: 270 };
  const grab = { x: mouse.x - start.x, y: mouse.y - start.y };
  await moveMouse(target.x + grab.x, target.y + grab.y, 1100, {
    dragging: true,
    onStep: () => stageJs(`stage.setMediaWindowRect({ x: ${(mouse.x - grab.x).toFixed(1)}, y: ${(mouse.y - grab.y).toFixed(1)}, width: ${start.width}, height: ${start.height} })`)
  });
  mouseUp();
  await sleep(350);

  // Resize from the top-left corner.
  const placed = await stageJs('stage.mediaRect()');
  const right = placed.x + placed.width;
  const bottom = placed.y + placed.height;
  await moveMouse(placed.x + 5, placed.y + 5, 420);
  await mouseDown();
  await moveMouse(right - 500 + 5, bottom - 282 + 5, 900, {
    dragging: true,
    onStep: () => stageJs(`stage.setMediaWindowRect({ x: ${(mouse.x - 5).toFixed(1)}, y: ${(mouse.y - 5).toFixed(1)}, width: ${(right - mouse.x + 5).toFixed(1)}, height: ${(bottom - mouse.y + 5).toFixed(1)} })`)
  });
  mouseUp();
  await sleep(700);

  // Designs and themes.
  await caption('Two designs, any theme', 'Modern card or theme-matched, set once for both views');
  await moveMouse(380, 380, 700);
  await applyDemoSettings({ appearance: { mediaPlayerStyle: 'theme', colorTheme: 'ruby' } });
  await sleep(1300);
  await applyDemoSettings({ appearance: { colorTheme: 'forest' } });
  await sleep(1300);
  await applyDemoSettings({ appearance: { mediaPlayerStyle: 'modern', colorTheme: 'default' } });
  await sleep(700);

  // Volume mixer with real app icons.
  await caption('Per-app volume', 'Every app with its own icon');
  await hoverNotch(900);
  await sleep(450);
  if (await notchJs('!elements.mediaStage.hidden')) {
    await clickNotch('#mediaStage [data-mp-action="back"]', 450);
    await sleep(450);
  }
  await openMenuTile('volume-mixer');
  await waitFor(() => notchJs(`document.querySelectorAll('.audio-session-row').length > 0`), 'audio mixer');
  await sleep(500);
  const slider = await notchJs(`(() => { const r = document.querySelector('[data-audio-volume="spotify"]').getBoundingClientRect(); return { x: r.left, y: r.top + r.height / 2, width: r.width }; })()`);
  const sliderY = notchGeometry().top + slider.y;
  await moveMouse(NOTCH_LEFT + slider.x + slider.width - 7, sliderY, 550);
  await mouseDown();
  await moveMouse(NOTCH_LEFT + slider.x + slider.width * 0.55, sliderY, 750, { dragging: true });
  mouseUp();
  await sleep(700);
  await clickNotch('[data-close-tool]', 480);
  await sleep(350);

  // Pomodoro: start a focus session; the countdown replaces the clock in the strip.
  await caption('Pomodoro', 'The focus timer keeps counting down in the strip');
  if (await notchJs('!elements.mediaStage.hidden')) {
    await clickNotch('#mediaStage [data-mp-action="back"]', 450);
    await sleep(400);
  }
  await openMenuTile('pomodoro');
  await waitFor(() => notchJs(`!document.querySelector('[data-tool-view="pomodoro"]').hidden`), 'pomodoro');
  await sleep(450);
  await clickNotch('[data-pomodoro-toggle]', 520);
  await sleep(1600);
  await clickNotch('[data-close-tool]', 480);
  await sleep(250);
  await moveMouse(300, 400, 750);
  await waitFor(async () => !(await isExpanded()), 'notch collapse');
  await sleep(1300);

  // Notch styles: Attached plus the three Floating variants. A smaller corner radius (also a setting)
  // keeps Floating visibly different from Pill; the default radius is clamped to half the strip height.
  const styles = [
    { notchStyle: 'floating', cornerRadius: 10, label: 'Floating' },
    { notchStyle: 'pill', cornerRadius: 10, label: 'Pill' },
    { notchStyle: 'compact', cornerRadius: 10, label: 'Compact' },
    { notchStyle: 'attached', cornerRadius: 18, label: 'Attached' }
  ];
  for (const { label, ...appearance } of styles) {
    await caption('Four notch styles', `${label} - plus adjustable size and corner radius`);
    await applyDemoSettings({ appearance });
    await sleep(1400);
  }

  await caption('Windows Notch Overlay', 'Free and open source - download it from Releases');
  await moveMouse(250, 360, 700);
  await sleep(1800);
}

// --- Recording ---------------------------------------------------------------------------------

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr = (stderr + chunk).slice(-4000); });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}\n${stderr}`))));
  });
}

function startEncoder(size, mp4Path) {
  const encoder = spawn(FFMPEG, [
    '-y', '-loglevel', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', `${size.width}x${size.height}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    mp4Path
  ], { stdio: ['pipe', 'ignore', 'inherit'], windowsHide: true });
  const closed = new Promise((resolve, reject) => {
    encoder.on('error', reject);
    encoder.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))));
  });
  return { encoder, closed };
}

app.whenReady().then(async () => {
  try {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    registerIpc();
    win = new BrowserWindow({
      width: STAGE.width * ZOOM,
      height: STAGE.height * ZOOM,
      useContentSize: true,
      show: false,
      frame: false,
      webPreferences: {
        offscreen: true,
        zoomFactor: ZOOM,
        preload: path.join(__dirname, 'demo', 'demo-preload.js'),
        nodeIntegrationInSubFrames: true,
        contextIsolation: true,
        sandbox: false
      }
    });
    win.webContents.on('console-message', (event) => {
      if (event.level === 'error' && !event.message.includes('frame-ancestors')) errors.push(event.message);
    });
    win.webContents.setFrameRate(FPS * 2);

    let latest = null;
    win.webContents.on('paint', (_event, _dirty, image) => { latest = image; });

    await win.loadFile(path.join(__dirname, 'demo', 'stage.html'));
    await waitFor(() => Boolean(notchFrame()) && notchFrame().executeJavaScript('Boolean(lastSettingsFingerprint) && elements.menuPages.children.length > 0').catch(() => false), 'notch renderer');
    await applyNotchGeometry();
    media.thumbnailDataUrl = await stageJs('stage.createCover()');
    publishMedia();
    await waitFor(() => Boolean(latest), 'first frame');
    await sleep(400);

    const size = latest.getSize();
    const mp4Path = path.join(OUTPUT_DIR, 'demo.mp4');
    const gifPath = path.join(OUTPUT_DIR, 'demo.gif');
    const { encoder, closed } = startEncoder(size, mp4Path);
    let frames = 0;
    const timer = setInterval(() => {
      const bitmap = latest.toBitmap();
      if (bitmap.length === size.width * size.height * 4) {
        encoder.stdin.write(bitmap);
        frames += 1;
      }
    }, 1000 / FPS);

    await playScenes();
    clearInterval(timer);
    encoder.stdin.end();
    await closed;
    console.log(`Recorded ${frames} frames (${(frames / FPS).toFixed(1)} s) at ${size.width}x${size.height} -> ${mp4Path}`);

    await run(FFMPEG, [
      '-y', '-loglevel', 'error', '-i', mp4Path,
      '-vf', `fps=${GIF_FPS},scale=${GIF_WIDTH}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=2:diff_mode=rectangle`,
      '-loop', '0', gifPath
    ]);
    const sizeOf = (file) => `${(fs.statSync(file).size / 1024 / 1024).toFixed(2)} MB`;
    console.log(`GIF: ${gifPath} (${sizeOf(gifPath)}), MP4: ${sizeOf(mp4Path)}`);
    if (errors.length) console.warn('Renderer errors:', errors);
    app.exit(0);
  } catch (error) {
    console.error(error);
    if (errors.length) console.error('Renderer errors:', errors);
    if (process.env.DEMO_DEBUG_DIR && win) {
      try {
        console.error('Frames:', win.webContents.mainFrame.framesInSubtree.map((frame) => frame.url));
        console.error('State:', { notchMode, mediaWindowOpen, mouse });
        fs.writeFileSync(path.join(process.env.DEMO_DEBUG_DIR, 'demo-failure.png'), (await win.webContents.capturePage()).toPNG());
      } catch (debugError) {
        console.error('Debug capture failed:', debugError.message);
      }
    }
    app.exit(1);
  }
});
