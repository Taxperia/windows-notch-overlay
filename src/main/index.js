const path = require('node:path');
const fsSync = require('node:fs');
const fs = require('node:fs/promises');
const { execFile } = require('node:child_process');
const {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  screen,
  shell
} = require('electron');

const { getSystemSnapshot } = require('./systemMetrics');
const { getCurrentMedia, sendMediaCommand } = require('./media');
const { loadSettings, updateSettings } = require('./appSettings');
const {
  getControlState,
  releaseMicrophoneMute,
  toggleBatterySaverState,
  toggleBluetoothRadio,
  toggleDarkModeState,
  togglePrivacyState,
  toggleSilentState
} = require('./windowsControls');
const { sendHotkey } = require('./win32');

const OVERLAY_THEME = process.env.NOTCH_THEME === 'floating' ? 'floating' : 'attached';
const COLLAPSED_BOUNDS = { width: 250, height: 34 };
const EXPANDED_BOUNDS = { width: 500, height: 330 };
const MEDIA_BOUNDS = { width: 500, height: 176 };
const ALARM_BOUNDS = { width: 500, height: 172 };
const SETTINGS_BOUNDS = { width: 760, height: 520 };
const THEME_TOP_MARGIN = {
  attached: 0,
  floating: 6
};

let mainWindow;
let metricsTimer;
let mediaTimer;
let controlsTimer;
let overlayMode = 'collapsed';
let microphoneMutedByApp = false;

function getMicrophoneGuardPath() {
  return path.join(app.getPath('userData'), 'microphone-muted-by-app');
}

function setMicrophoneGuard(active) {
  microphoneMutedByApp = active;
  const guardPath = getMicrophoneGuardPath();

  try {
    if (active) {
      fsSync.mkdirSync(path.dirname(guardPath), { recursive: true });
      fsSync.writeFileSync(guardPath, String(Date.now()), 'utf8');
    } else if (fsSync.existsSync(guardPath)) {
      fsSync.rmSync(guardPath, { force: true });
    }
  } catch {
    // Guard file failure should not block the user-facing control.
  }
}

function restoreMicrophoneMuteIfNeeded() {
  const guardPath = getMicrophoneGuardPath();
  const shouldRestore = microphoneMutedByApp || fsSync.existsSync(guardPath);

  if (!shouldRestore) {
    return;
  }

  try {
    releaseMicrophoneMute();
  } catch {
    // Best-effort cleanup for a system-level mute we created.
  }

  setMicrophoneGuard(false);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    ...getOverlayBounds(COLLAPSED_BOUNDS),
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'), {
    query: { theme: OVERLAY_THEME }
  });
  mainWindow.once('ready-to-show', () => mainWindow.showInactive());

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function getOverlayBounds(size) {
  const display = screen.getPrimaryDisplay();
  const area = display.bounds;

  return {
    width: size.width,
    height: size.height,
    x: area.x + Math.round((area.width - size.width) / 2),
    y: area.y + THEME_TOP_MARGIN[OVERLAY_THEME]
  };
}

function setOverlayMode(nextMode) {
  if (!mainWindow || overlayMode === nextMode) {
    return;
  }

  overlayMode = nextMode;
  const bounds = {
    collapsed: COLLAPSED_BOUNDS,
    controls: EXPANDED_BOUNDS,
    media: MEDIA_BOUNDS,
    alarm: ALARM_BOUNDS,
    settings: SETTINGS_BOUNDS
  }[nextMode] || COLLAPSED_BOUNDS;

  mainWindow.setBounds(getOverlayBounds(bounds), false);
  mainWindow.webContents.send('overlay:mode', nextMode);
}

async function publishMetrics() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  const snapshot = await getSystemSnapshot();
  mainWindow.webContents.send('metrics:update', snapshot);
}

async function publishMedia() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  const media = await getCurrentMedia();
  mainWindow.webContents.send('media:update', media);
}

async function publishControls() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  const controls = await getControlState();
  mainWindow.webContents.send('controls:update', controls);
}

async function publishSettings() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  const settings = await loadSettings();
  mainWindow.webContents.send('settings:update', settings);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function takePrimaryScreenshot() {
  const overlay = mainWindow;
  const shouldRestoreOverlay = overlay && !overlay.isDestroyed() && overlay.isVisible();
  if (shouldRestoreOverlay) {
    overlay.hide();
    await wait(120);
  }

  const display = screen.getPrimaryDisplay();
  const size = display.size;
  const scale = display.scaleFactor || 1;
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        width: Math.round(size.width * scale),
        height: Math.round(size.height * scale)
      }
    });

    const displayId = String(display.id);
    const source = sources.find((item) => item.display_id === displayId) || sources[0];
    if (!source || source.thumbnail.isEmpty()) {
      throw new Error('Screenshot source is not available.');
    }

    const screenshotsDir = path.join(app.getPath('pictures'), 'NotchOverlayScreenshots');
    await fs.mkdir(screenshotsDir, { recursive: true });

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(screenshotsDir, `screenshot-${stamp}.png`);
    await fs.writeFile(filePath, source.thumbnail.toPNG());
    return filePath;
  } finally {
    if (shouldRestoreOverlay && overlay && !overlay.isDestroyed()) {
      overlay.showInactive();
    }
  }
}

function runDetached(command, args = []) {
  const child = execFile(command, args, {
    detached: true,
    windowsHide: true
  });
  child.unref();
}

function searchTarget(query) {
  const value = String(query || '').trim();
  if (!value) {
    return '';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) {
    return `https://${value}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
}

function registerIpc() {
  ipcMain.on('overlay:expand', () => {
    if (overlayMode === 'collapsed') {
      setOverlayMode('controls');
    }
  });
  ipcMain.on('overlay:collapse', () => {
    if (overlayMode !== 'settings') {
      setOverlayMode('collapsed');
    }
  });
  ipcMain.on('overlay:settings', () => setOverlayMode('settings'));
  ipcMain.on('overlay:controls', () => setOverlayMode('controls'));
  ipcMain.on('overlay:media', () => setOverlayMode('media'));
  ipcMain.on('overlay:alarm', () => setOverlayMode('alarm'));

  ipcMain.handle('metrics:get', () => getSystemSnapshot());
  ipcMain.handle('media:get', () => getCurrentMedia());
  ipcMain.handle('controls:get', () => getControlState());
  ipcMain.handle('settings:get', () => loadSettings());
  ipcMain.handle('settings:update', async (_event, patch) => {
    const settings = await updateSettings(patch);
    await publishSettings();
    return settings;
  });

  ipcMain.handle('search:web', async (_event, query) => {
    const target = searchTarget(query);
    if (!target) {
      return { ok: false, message: 'Arama metni boş.' };
    }

    await shell.openExternal(target);
    return { ok: true, message: 'Tarayıcıda açıldı.' };
  });

  ipcMain.handle('media:command', async (_event, command) => {
    await sendMediaCommand(command);
    await publishMedia();
    return { ok: true };
  });

  ipcMain.handle('quick:action', async (_event, action) => {
    switch (action) {
      case 'screenshot-full': {
        const filePath = await takePrimaryScreenshot();
        return { ok: true, message: `Kaydedildi: ${filePath}`, filePath };
      }
      case 'screenshot-snip':
        runDetached('explorer.exe', ['ms-screenclip:']);
        return { ok: true, message: 'Ekran kırpma açıldı.' };
      case 'settings':
        setOverlayMode('settings');
        return { ok: true, message: 'Uygulama ayarları açıldı.' };
      case 'focus-assist':
        await toggleSilentState();
        await publishControls();
        return { ok: true, message: 'Sessiz mod değiştirildi.' };
      case 'bluetooth':
        {
          const result = await toggleBluetoothRadio();
          if (!result?.ok) {
            await publishControls();
            return {
              ok: false,
              message: result?.message || 'Bluetooth durumu değiştirilemedi.'
            };
          }
          if (result.pending) {
            setTimeout(publishControls, 4500);
          }
          await publishControls();
          return {
            ok: true,
            message: result.pending
              ? 'Bluetooth için yönetici onayı isteniyor.'
              : 'Bluetooth durumu değiştirildi.'
          };
        }
      case 'dark-mode':
        await toggleDarkModeState();
        await publishControls();
        return { ok: true, message: 'Karanlık mod değiştirildi.' };
      case 'night-light':
        sendHotkey([0x5b], 0x41);
        await publishControls();
        return { ok: true, message: 'Hızlı işlemler açıldı.' };
      case 'battery':
        await toggleBatterySaverState();
        await publishControls();
        return { ok: true, message: 'Güç tasarrufu eşiği değiştirildi.' };
      case 'network':
        runDetached('explorer.exe', ['ms-availablenetworks:']);
        await publishControls();
        return { ok: true, message: 'Ağ hızlı paneli açıldı.' };
      case 'camera':
        await togglePrivacyState('camera');
        await publishControls();
        return { ok: true, message: 'Kamera gizlilik durumu değiştirildi.' };
      case 'microphone':
        {
          restoreMicrophoneMuteIfNeeded();
          await publishControls();
          return {
            ok: true,
            message: 'Mikrofon kontrolü sistem ses ayarlarını korumak için geçici olarak pasif.'
          };
        }
      case 'quit':
        app.quit();
        return { ok: true };
      default:
        return { ok: false, message: `Unknown action: ${action}` };
    }
  });
}

app.whenReady().then(() => {
  restoreMicrophoneMuteIfNeeded();
  registerIpc();
  createWindow();

  publishMetrics();
  publishMedia();
  publishControls();
  publishSettings();
  metricsTimer = setInterval(publishMetrics, 2000);
  mediaTimer = setInterval(publishMedia, 5000);
  controlsTimer = setInterval(publishControls, 5000);
});

app.on('before-quit', () => {
  restoreMicrophoneMuteIfNeeded();

  if (metricsTimer) {
    clearInterval(metricsTimer);
  }

  if (mediaTimer) {
    clearInterval(mediaTimer);
  }

  if (controlsTimer) {
    clearInterval(controlsTimer);
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
