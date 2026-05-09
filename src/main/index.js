const path = require('node:path');
const fsSync = require('node:fs');
const fs = require('node:fs/promises');
const https = require('node:https');
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
const { getNotificationSnapshot } = require('./notifications');
const { getLanguage, listLanguages } = require('./i18n');
const { loadSettings, updateSettings } = require('./appSettings');
const {
  getBrightnessState,
  getControlState,
  repairMicrophoneAccess,
  releaseMicrophoneMute,
  setBrightnessLevel,
  toggleBatterySaverState,
  toggleBluetoothRadio,
  toggleDarkModeState,
  toggleNightLightState,
  togglePrivacyState,
  toggleSilentState
} = require('./windowsControls');
const {
  getAudioSessions,
  setAudioSessionMuted,
  setAudioSessionVolume
} = require('./coreAudio');
const packageJson = require('../../package.json');

let overlayTheme = process.env.NOTCH_THEME === 'floating' ? 'floating' : 'attached';
const COLLAPSED_BOUNDS = { width: 250, height: 34 };
const EXPANDED_BOUNDS = { width: 500, height: 330 };
const MEDIA_BOUNDS = { width: 500, height: 176 };
const ALARM_BOUNDS = { width: 500, height: 172 };
const SETTINGS_BOUNDS = { width: 760, height: 520 };
const THEME_TOP_MARGIN = {
  attached: 0,
  floating: 6
};
const UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const UPDATE_REPOSITORY = parseGitHubRepository(packageJson.repository?.url || packageJson.homepage)
  || { owner: 'Taxperia', repo: 'windows-notch-overlay' };
const ALLOW_SOFTWARE_DIMMER_FALLBACK = false;

let mainWindow;
let metricsTimer;
let mediaTimer;
let controlsTimer;
let notificationsTimer;
let updatesTimer;
let lastUpdateStatus = null;
let dimmerWindow = null;
let softwareDimmerEnabled = false;
let softwareBrightnessLevel = 100;
let overlayMode = 'collapsed';
let microphoneMutedByApp = false;
let notificationAccessRequested = false;
let notificationsPrimed = false;
const knownNotificationIds = new Set();

function isDetachedNotchStyle(style) {
  return ['floating', 'pill', 'compact'].includes(style);
}

function clampPercent(value, fallback = 100) {
  const parsed = Number.parseInt(value, 10);
  return Math.max(0, Math.min(100, Number.isNaN(parsed) ? fallback : parsed));
}

function parseGitHubRepository(value) {
  const match = String(value || '').match(/github\.com[:/]+([^/\s]+)\/([^/#\s.]+)(?:\.git)?/i);
  return match ? { owner: match[1], repo: match[2] } : null;
}

function parseVersionParts(version) {
  return String(version || '')
    .replace(/^v/i, '')
    .split(/[.-]/)
    .map((part) => Number.parseInt(part, 10))
    .filter((part) => !Number.isNaN(part));
}

function compareVersions(left, right) {
  const a = parseVersionParts(left);
  const b = parseVersionParts(right);
  const length = Math.max(a.length, b.length, 3);

  for (let index = 0; index < length; index += 1) {
    const diff = (a[index] || 0) - (b[index] || 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

function requestJson(url, timeoutMs = 10000, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': `${packageJson.name || 'windows-notch-overlay'}/${packageJson.version || '0.0.0'}`
      },
      timeout: timeoutMs
    }, (response) => {
      const redirect = response.headers.location;
      if ([301, 302, 307, 308].includes(response.statusCode) && redirect && redirectCount < 3) {
        response.resume();
        resolve(requestJson(new URL(redirect, url).toString(), timeoutMs, redirectCount + 1));
        return;
      }

      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`GitHub yanıtı başarısız: HTTP ${response.statusCode}`));
        return;
      }

      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
        if (body.length > 1024 * 1024) {
          request.destroy(new Error('GitHub yanıtı çok büyük.'));
        }
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error('GitHub yanıtı okunamadı.'));
        }
      });
    });

    request.on('timeout', () => request.destroy(new Error('Güncelleme kontrolü zaman aşımına uğradı.')));
    request.on('error', reject);
  });
}

function preferredReleaseAsset(assets = []) {
  const downloadable = assets.filter((asset) => asset?.browser_download_url);
  return downloadable.find((asset) => /\.(exe|msi)$/i.test(asset.name || ''))
    || downloadable.find((asset) => /win|windows|portable/i.test(asset.name || ''))
    || downloadable[0]
    || null;
}

function normalizeRelease(release) {
  const asset = preferredReleaseAsset(release.assets || []);
  const tagName = String(release.tag_name || '').trim();
  const latestVersion = tagName.replace(/^v/i, '') || String(release.name || '').trim();

  return {
    tagName,
    latestVersion,
    name: release.name || tagName || 'GitHub release',
    releaseUrl: release.html_url || packageJson.homepage || `https://github.com/${UPDATE_REPOSITORY.owner}/${UPDATE_REPOSITORY.repo}/releases/latest`,
    downloadUrl: asset?.browser_download_url || release.html_url || '',
    assetName: asset?.name || '',
    publishedAt: release.published_at || ''
  };
}

function updateStatusMessage(status) {
  if (status.status === 'available') {
    return `Yeni sürüm bulundu: ${status.latestVersion}`;
  }

  if (status.status === 'current') {
    return `Güncel sürüm kullanılıyor: ${status.currentVersion}`;
  }

  if (status.status === 'checking') {
    return 'Güncelleme kontrol ediliyor...';
  }

  return status.message || 'Güncelleme durumu alınamadı.';
}

function publishUpdateStatus(status) {
  lastUpdateStatus = {
    ...status,
    message: updateStatusMessage(status),
    checkedAt: status.checkedAt || new Date().toISOString()
  };

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updates:status', lastUpdateStatus);
  }

  return lastUpdateStatus;
}

async function checkForUpdates({ manual = false } = {}) {
  publishUpdateStatus({
    ok: true,
    status: 'checking',
    manual,
    currentVersion: packageJson.version
  });

  try {
    const release = await requestJson(`https://api.github.com/repos/${UPDATE_REPOSITORY.owner}/${UPDATE_REPOSITORY.repo}/releases/latest`);
    const latest = normalizeRelease(release);
    const available = compareVersions(latest.latestVersion, packageJson.version) > 0;

    return publishUpdateStatus({
      ok: true,
      status: available ? 'available' : 'current',
      manual,
      currentVersion: packageJson.version,
      ...latest
    });
  } catch (error) {
    return publishUpdateStatus({
      ok: false,
      status: 'error',
      manual,
      currentVersion: packageJson.version,
      releaseUrl: `https://github.com/${UPDATE_REPOSITORY.owner}/${UPDATE_REPOSITORY.repo}/releases/latest`,
      message: error.message || 'Güncelleme kontrol edilemedi.'
    });
  }
}

function configureAutoUpdates(settings) {
  if (updatesTimer) {
    clearInterval(updatesTimer);
    updatesTimer = null;
  }

  if (settings?.updates?.autoCheck !== true) {
    return;
  }

  checkForUpdates({ manual: false }).catch(() => {});
  updatesTimer = setInterval(() => {
    checkForUpdates({ manual: false }).catch(() => {});
  }, UPDATE_CHECK_INTERVAL_MS);
}

function softwareBrightnessMessage(level) {
  return level >= 100
    ? 'Donanım parlaklığı desteklenmiyor; yazılımsal karartma kapalı.'
    : `Donanım parlaklığı desteklenmiyor; yazılımsal karartma %${100 - level}.`;
}

function destroyDimmerWindow() {
  if (dimmerWindow && !dimmerWindow.isDestroyed()) {
    dimmerWindow.close();
  }
  dimmerWindow = null;
}

function createDimmerWindow() {
  if (dimmerWindow && !dimmerWindow.isDestroyed()) {
    return dimmerWindow;
  }

  const display = screen.getPrimaryDisplay();
  dimmerWindow = new BrowserWindow({
    x: display.bounds.x,
    y: display.bounds.y,
    width: display.bounds.width,
    height: display.bounds.height,
    frame: false,
    transparent: false,
    backgroundColor: '#000000',
    resizable: false,
    movable: false,
    focusable: false,
    skipTaskbar: true,
    show: false,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  dimmerWindow.setIgnoreMouseEvents(true);
  dimmerWindow.setAlwaysOnTop(true, 'pop-up-menu');
  dimmerWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  dimmerWindow.on('closed', () => {
    dimmerWindow = null;
  });
  dimmerWindow.loadURL('data:text/html,<html><body style="margin:0;background:#000"></body></html>');

  return dimmerWindow;
}

function updateSoftwareDimmer() {
  if (!ALLOW_SOFTWARE_DIMMER_FALLBACK || !softwareDimmerEnabled) {
    destroyDimmerWindow();
    return;
  }

  const level = clampPercent(softwareBrightnessLevel);
  if (level >= 100) {
    destroyDimmerWindow();
    return;
  }

  const dimmer = createDimmerWindow();
  const display = screen.getPrimaryDisplay();
  dimmer.setBounds(display.bounds, false);
  dimmer.setOpacity(Math.max(0.05, Math.min(0.85, (100 - level) / 100)));
  dimmer.showInactive();

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  }
}

async function getEffectiveBrightnessState() {
  const hardware = await getBrightnessState();
  if (hardware?.available) {
    softwareDimmerEnabled = false;
    destroyDimmerWindow();
    return {
      ...hardware,
      mode: 'hardware'
    };
  }

  if (!ALLOW_SOFTWARE_DIMMER_FALLBACK) {
    softwareDimmerEnabled = false;
    destroyDimmerWindow();
    return {
      ok: false,
      available: false,
      softwareFallback: false,
      mode: 'unavailable',
      level: hardware?.level ?? null,
      message: hardware?.message || 'Monitör parlaklığı bu sistemde değiştirilemiyor.'
    };
  }

  softwareDimmerEnabled = true;
  updateSoftwareDimmer();
  return {
    ok: true,
    available: true,
    softwareFallback: true,
    mode: 'software',
    level: softwareBrightnessLevel,
    message: softwareBrightnessMessage(softwareBrightnessLevel),
    hardwareMessage: hardware?.message || ''
  };
}

async function setEffectiveBrightnessLevel(level) {
  const nextLevel = clampPercent(level, softwareBrightnessLevel);
  const hardware = await getBrightnessState();
  if (hardware?.available) {
    destroyDimmerWindow();
    return {
      ...(await setBrightnessLevel(nextLevel)),
      mode: 'hardware'
    };
  }

  if (!ALLOW_SOFTWARE_DIMMER_FALLBACK) {
    softwareDimmerEnabled = false;
    destroyDimmerWindow();
    return {
      ok: false,
      available: false,
      softwareFallback: false,
      mode: 'unavailable',
      level: hardware?.level ?? null,
      message: hardware?.message || 'Monitör parlaklığı bu sistemde değiştirilemiyor.'
    };
  }

  softwareBrightnessLevel = nextLevel;
  softwareDimmerEnabled = true;
  updateSoftwareDimmer();
  await updateSettings({
    system: {
      softwareBrightnessLevel
    }
  });

  return {
    ok: true,
    available: true,
    softwareFallback: true,
    mode: 'software',
    level: softwareBrightnessLevel,
    message: softwareBrightnessMessage(softwareBrightnessLevel)
  };
}

async function getPublishedControlState() {
  const controls = await getControlState();
  try {
    const brightness = await getEffectiveBrightnessState();
    controls.brightness = {
      enabled: brightness.available ? true : null,
      label: brightness.available ? `%${brightness.level}` : 'Yok',
      detail: brightness.message,
      mode: brightness.mode,
      softwareFallback: brightness.softwareFallback === true
    };
  } catch {
    // Keep the lower-level control snapshot if the fallback path fails.
  }

  return controls;
}

function getMicrophoneGuardPath() {
  return path.join(app.getPath('userData'), 'microphone-muted-by-app');
}

function getMicrophoneRepairMarkerPath() {
  return path.join(app.getPath('userData'), 'microphone-repair-v2');
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

async function repairMicrophoneAccessOnce() {
  const markerPath = getMicrophoneRepairMarkerPath();
  if (fsSync.existsSync(markerPath)) {
    return;
  }

  try {
    await repairMicrophoneAccess();
    fsSync.mkdirSync(path.dirname(markerPath), { recursive: true });
    fsSync.writeFileSync(markerPath, String(Date.now()), 'utf8');
  } catch {
    // Best-effort migration for old builds that could leave capture endpoints muted.
  }
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
    query: { theme: overlayTheme }
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
    y: area.y + THEME_TOP_MARGIN[overlayTheme]
  };
}

function boundsForOverlayMode(mode) {
  return {
    collapsed: COLLAPSED_BOUNDS,
    controls: EXPANDED_BOUNDS,
    media: MEDIA_BOUNDS,
    alarm: ALARM_BOUNDS,
    settings: SETTINGS_BOUNDS
  }[mode] || COLLAPSED_BOUNDS;
}

function setOverlayMode(nextMode) {
  if (!mainWindow || overlayMode === nextMode) {
    return;
  }

  overlayMode = nextMode;
  const bounds = boundsForOverlayMode(nextMode);

  mainWindow.setBounds(getOverlayBounds(bounds), false);
  mainWindow.webContents.send('overlay:mode', nextMode);
}

function applyRuntimeSettings(settings) {
  const nextTheme = isDetachedNotchStyle(settings?.appearance?.notchStyle) ? 'floating' : 'attached';
  const shouldStartWithWindows = settings?.system?.startWithWindows === true;
  softwareBrightnessLevel = clampPercent(settings?.system?.softwareBrightnessLevel, softwareBrightnessLevel);

  app.setLoginItemSettings({
    openAtLogin: shouldStartWithWindows,
    path: process.execPath
  });
  configureAutoUpdates(settings);

  if (nextTheme !== overlayTheme) {
    overlayTheme = nextTheme;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setBounds(getOverlayBounds(boundsForOverlayMode(overlayMode)), false);
      mainWindow.webContents.send('settings:update', settings);
    }
  }
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

  const controls = await getPublishedControlState();
  mainWindow.webContents.send('controls:update', controls);
}

async function publishSettings() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  const settings = await loadSettings();
  mainWindow.webContents.send('settings:update', settings);
}

async function publishNotifications() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  const snapshot = await getNotificationSnapshot({
    requestAccess: !notificationAccessRequested
  });
  notificationAccessRequested = true;
  if (!snapshot.available) {
    return;
  }

  const notifications = snapshot.notifications || [];
  if (!notificationsPrimed) {
    notifications.forEach((notification) => knownNotificationIds.add(notification.id));
    notificationsPrimed = true;
    return;
  }

  const newest = notifications.find((notification) => !knownNotificationIds.has(notification.id));
  notifications.forEach((notification) => knownNotificationIds.add(notification.id));

  if (newest) {
    mainWindow.webContents.send('notifications:update', newest);
  }
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
  ipcMain.handle('controls:get', () => getPublishedControlState());
  ipcMain.handle('settings:get', () => loadSettings());
  ipcMain.handle('app:info', () => ({
    name: packageJson.productName || packageJson.name,
    version: packageJson.version,
    repositoryUrl: `https://github.com/${UPDATE_REPOSITORY.owner}/${UPDATE_REPOSITORY.repo}`,
    releasesUrl: `https://github.com/${UPDATE_REPOSITORY.owner}/${UPDATE_REPOSITORY.repo}/releases/latest`
  }));
  ipcMain.handle('settings:update', async (_event, patch) => {
    const settings = await updateSettings(patch);
    applyRuntimeSettings(settings);
    await publishSettings();
    return settings;
  });

  ipcMain.handle('brightness:get', () => getEffectiveBrightnessState());
  ipcMain.handle('brightness:set', async (_event, level) => {
    const result = await setEffectiveBrightnessLevel(level);
    await publishControls();
    return result;
  });
  ipcMain.handle('audio-mixer:get', () => getAudioSessions());
  ipcMain.handle('audio-mixer:set-volume', async (_event, sessionId, volume) => {
    const result = setAudioSessionVolume(sessionId, volume);
    return {
      ...result,
      mixer: getAudioSessions()
    };
  });
  ipcMain.handle('audio-mixer:set-muted', async (_event, sessionId, muted) => {
    const result = setAudioSessionMuted(sessionId, muted);
    return {
      ...result,
      mixer: getAudioSessions()
    };
  });

  ipcMain.handle('i18n:list', () => listLanguages());
  ipcMain.handle('i18n:get', (_event, code) => getLanguage(code));
  ipcMain.handle('updates:check', (_event, options) => checkForUpdates({
    manual: options?.manual !== false
  }));
  ipcMain.handle('updates:open', async (_event, updateInfo) => {
    const target = updateInfo?.downloadUrl || updateInfo?.releaseUrl || lastUpdateStatus?.downloadUrl || lastUpdateStatus?.releaseUrl;
    if (!target) {
      return { ok: false, message: 'Güncelleme bağlantısı yok.' };
    }

    await shell.openExternal(target);
    return { ok: true, message: 'Güncelleme sayfası açıldı.' };
  });

  ipcMain.handle('external-app:open', async (_event, targetPath) => {
    const target = String(targetPath || '').trim();
    if (!target) {
      return { ok: false, message: 'Hedef boş.' };
    }

    if (/^(https?:|discord:|spotify:)/i.test(target)) {
      await shell.openExternal(target);
      return { ok: true, message: 'Hedef açıldı.' };
    }

    const message = await shell.openPath(target);
    return message
      ? { ok: false, message }
      : { ok: true, message: 'Hedef açıldı.' };
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
        {
          const silent = await toggleSilentState();
          if (!silent || silent.enabled === null) {
            await shell.openExternal('ms-settings:quiethours');
          }
          await publishControls();
          return {
            ok: true,
            state: silent,
            message: silent?.enabled
              ? 'Odaklanma yardımı: sessiz. Windows bildirimleri kapatıldı.'
              : 'Odaklanma yardımı: açık. Windows bildirimleri açıldı.'
          };
        }
      case 'focus-settings':
        await shell.openExternal('ms-settings:quiethours');
        return { ok: true, message: 'Windows Odaklanma ayarları açıldı.' };
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
      case 'volume-mixer':
        return { ok: true, message: 'Ses mikseri çentikte açıldı.' };
      case 'brightness':
        return {
          ok: true,
          message: 'Parlaklık paneli açıldı.'
        };
      case 'dark-mode':
        await toggleDarkModeState();
        await publishControls();
        return { ok: true, message: 'Karanlık mod değiştirildi.' };
      case 'night-light':
        {
          const nightLight = await toggleNightLightState();
          await publishControls();
          return {
            ok: nightLight.enabled !== null,
            state: nightLight,
            message: nightLight.enabled === null
              ? 'Gece ışığı değiştirilemedi.'
              : `Gece ışığı ${nightLight.enabled ? 'açıldı' : 'kapatıldı'}.`
          };
        }
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
          await repairMicrophoneAccess();
          await publishControls();
          return {
            ok: true,
            message: 'Mikrofon erişimi açık tutuldu; uygulama mikrofonu kapatmıyor.'
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

app.whenReady().then(async () => {
  restoreMicrophoneMuteIfNeeded();
  await repairMicrophoneAccessOnce();
  applyRuntimeSettings(await loadSettings());
  registerIpc();
  createWindow();

  publishMetrics();
  publishMedia();
  publishControls();
  publishSettings();
  publishNotifications();
  metricsTimer = setInterval(publishMetrics, 2000);
  mediaTimer = setInterval(publishMedia, 5000);
  controlsTimer = setInterval(publishControls, 5000);
  notificationsTimer = setInterval(publishNotifications, 4000);
  screen.on('display-metrics-changed', updateSoftwareDimmer);
  screen.on('display-added', updateSoftwareDimmer);
  screen.on('display-removed', updateSoftwareDimmer);
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

  if (notificationsTimer) {
    clearInterval(notificationsTimer);
  }

  if (updatesTimer) {
    clearInterval(updatesTimer);
  }

  destroyDimmerWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
