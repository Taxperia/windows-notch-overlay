const path = require('node:path');
const fsSync = require('node:fs');
const fs = require('node:fs/promises');
const https = require('node:https');
const { execFile } = require('node:child_process');
const {
  app,
  BrowserWindow,
  desktopCapturer,
  globalShortcut,
  ipcMain,
  Menu,
  screen,
  session,
  shell
} = require('electron');

const { getSystemSnapshot } = require('./systemMetrics');
const { getCurrentMedia, sendMediaCommand } = require('./media');
const { getNotificationSnapshot } = require('./notifications');
const { getLanguage, listLanguages } = require('./i18n');
const { loadSettings, updateSettings } = require('./appSettings');
const {
  connectIntegration,
  disconnectIntegration,
  getIntegrationAuthStatus,
  getIntegrationNotifications
} = require('./integrationProviders');
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
const { cleanRam, memorySnapshot } = require('./ramCleaner');
const packageJson = require('../../package.json');

let overlayTheme = process.env.NOTCH_THEME === 'floating' ? 'floating' : 'attached';
const COLLAPSED_BOUNDS = { width: 250, height: 34 };
const BRIGHTNESS_CACHE_MS = 20000;
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
const ALLOW_SOFTWARE_DIMMER_FALLBACK = true;
const OPEN_DEVTOOLS = process.argv.includes('--devtools');
const ENABLE_EXTERNAL_INTEGRATIONS = false;
const ENABLE_SCREEN_VIDEO = false;
const DISMISSED_NOTIFICATION_LIMIT = 80;

let mainWindow;
let settingsWindow;
let metricsTimer;
let mediaTimer;
let controlsTimer;
let notificationsTimer;
let integrationNotificationsTimer;
let updatesTimer;
let lastUpdateStatus = null;
let dimmerWindow = null;
let softwareDimmerEnabled = false;
let softwareDimmerActive = false;
let softwareBrightnessLevel = 100;
let brightnessCache = { at: 0, value: null };
let overlayMode = 'collapsed';
let collapsedBounds = { ...COLLAPSED_BOUNDS };
let currentNotchStyle = 'attached';
let microphoneMutedByApp = false;
let notificationAccessRequested = false;
let notificationsPrimed = false;
let integrationNotificationsPrimed = false;
const registeredVideoShortcuts = new Set();
const knownNotificationIds = new Set();
const knownIntegrationNotificationIds = new Set();
const dismissedNotificationIds = new Set();
let lastNetworkSample = null;
let notificationHistory = [];

function isDetachedNotchStyle(style) {
  return ['floating', 'pill', 'compact'].includes(style);
}

function compactTopPad(style) {
  if (style === 'pill') {
    return 8;
  }
  if (style === 'floating' || style === 'compact') {
    return 6;
  }
  return 0;
}

function clampCompactWidth(value) {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return COLLAPSED_BOUNDS.width;
  }
  return Math.max(200, Math.min(420, Math.round(next)));
}

function clampCompactHeight(value) {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return COLLAPSED_BOUNDS.height;
  }
  return Math.max(28, Math.min(52, Math.round(next)));
}

function collapsedBoundsForSettings(settings) {
  const style = settings?.appearance?.notchStyle || 'attached';
  const baseWidth = clampCompactWidth(settings?.appearance?.compactWidth);
  const baseHeight = clampCompactHeight(settings?.appearance?.compactHeight);
  const topPad = compactTopPad(style);
  const extrasCount = (settings?.content?.showDownloadSpeed === true ? 2 : 0)
    + (settings?.content?.showPing === true ? 1 : 0)
    + (settings?.content?.showHeadphoneBattery === true ? 1 : 0);

  const extraWidth = extrasCount > 0 ? 40 + (extrasCount * 54) : 0;

  return {
    width: baseWidth + extraWidth,
    height: baseHeight + topPad + 2
  };
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

  sendToRendererWindows('updates:status', lastUpdateStatus);

  return lastUpdateStatus;
}

function requestWeatherJson(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': `${packageJson.name || 'windows-notch-overlay'}/${packageJson.version || '0.0.0'}`
      },
      timeout: timeoutMs
    }, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`Hava durumu yanıtı başarısız: HTTP ${response.statusCode}`));
        return;
      }

      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
        if (body.length > 1024 * 1024) {
          request.destroy(new Error('Hava durumu yanıtı çok büyük.'));
        }
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error('Hava durumu yanıtı okunamadı.'));
        }
      });
    });

    request.on('timeout', () => request.destroy(new Error('Hava durumu isteği zaman aşımına uğradı.')));
    request.on('error', reject);
  });
}

function weatherCodeLabel(code) {
  if ([0].includes(code)) return 'Açık';
  if ([1, 2, 3].includes(code)) return 'Parçalı bulutlu';
  if ([45, 48].includes(code)) return 'Sisli';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Çiseleme';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Yağmurlu';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Karlı';
  if ([95, 96, 99].includes(code)) return 'Fırtına';
  return 'Bilinmiyor';
}

async function getWeatherForCity(city) {
  const query = String(city || 'Istanbul').trim() || 'Istanbul';
  const geocode = await requestWeatherJson(`https://geocoding-api.open-meteo.com/v1/search?count=1&language=tr&format=json&name=${encodeURIComponent(query)}`);
  const place = geocode?.results?.[0];
  if (!place) {
    return {
      ok: false,
      message: 'Şehir bulunamadı.'
    };
  }

  const forecast = await requestWeatherJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
  );
  const current = forecast.current || {};
  const daily = forecast.daily || {};

  return {
    ok: true,
    city: place.name,
    country: place.country_code || place.country || '',
    temperature: Math.round(Number(current.temperature_2m) || 0),
    feelsLike: Math.round(Number(current.apparent_temperature) || 0),
    humidity: Math.round(Number(current.relative_humidity_2m) || 0),
    wind: Math.round(Number(current.wind_speed_10m) || 0),
    code: Number(current.weather_code) || 0,
    label: weatherCodeLabel(Number(current.weather_code) || 0),
    daily: (daily.time || []).slice(0, 4).map((date, index) => ({
      date,
      max: Math.round(Number(daily.temperature_2m_max?.[index]) || 0),
      min: Math.round(Number(daily.temperature_2m_min?.[index]) || 0),
      label: weatherCodeLabel(Number(daily.weather_code?.[index]) || 0)
    }))
  };
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
    ? 'Donanım parlaklığı desteklenmiyor; yazılımsal karartma kapalı (100%).'
    : `Donanım parlaklığı desteklenmiyor; yazılımsal karartma ${level}%.`;
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
  if (!ALLOW_SOFTWARE_DIMMER_FALLBACK || !softwareDimmerEnabled || !softwareDimmerActive) {
    destroyDimmerWindow();
    return;
  }

  const level = clampPercent(softwareBrightnessLevel);
  if (level >= 100) {
    destroyDimmerWindow();
    softwareDimmerActive = false;
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

function deactivateSoftwareDimmer() {
  softwareDimmerEnabled = false;
  softwareDimmerActive = false;
  destroyDimmerWindow();
}

async function getEffectiveBrightnessState(options = {}) {
  const force = options.force === true;
  if (!force && brightnessCache.value && (Date.now() - brightnessCache.at) < BRIGHTNESS_CACHE_MS) {
    return brightnessCache.value;
  }

  const hardware = await getBrightnessState();
  if (hardware?.available && hardware?.writable !== false) {
    deactivateSoftwareDimmer();
    const next = {
      ...hardware,
      mode: 'hardware'
    };
    brightnessCache = { at: Date.now(), value: next };
    return next;
  }

  if (!ALLOW_SOFTWARE_DIMMER_FALLBACK) {
    deactivateSoftwareDimmer();
    const next = {
      ok: false,
      available: false,
      softwareFallback: false,
      mode: 'unavailable',
      level: null,
      message: hardware?.message || 'Monitör parlaklığı bu sistemde değiştirilemiyor.'
    };
    brightnessCache = { at: Date.now(), value: next };
    return next;
  }

  const activeLevel = softwareDimmerActive
    ? softwareBrightnessLevel
    : 100;

  const next = {
    ok: true,
    available: true,
    writable: true,
    softwareFallback: true,
    mode: 'software',
    level: activeLevel,
    message: softwareDimmerActive
      ? softwareBrightnessMessage(softwareBrightnessLevel)
      : 'Donanım parlaklığı desteklenmiyor; kaydırıcıyı kullanınca yazılımsal karartma uygulanır.',
    hardwareMessage: hardware?.message || ''
  };
  brightnessCache = { at: Date.now(), value: next };
  return next;
}

async function setEffectiveBrightnessLevel(level) {
  const nextLevel = clampPercent(level, softwareBrightnessLevel);
  brightnessCache = { at: 0, value: null };

  const hardware = await getBrightnessState();
  if (hardware?.available && hardware?.writable !== false) {
    const result = await setBrightnessLevel(nextLevel);
    if (result?.ok) {
      deactivateSoftwareDimmer();
      const next = {
        ...result,
        mode: 'hardware'
      };
      brightnessCache = { at: Date.now(), value: next };
      return next;
    }
  }

  if (!ALLOW_SOFTWARE_DIMMER_FALLBACK) {
    deactivateSoftwareDimmer();
    const next = {
      ok: false,
      available: false,
      softwareFallback: false,
      mode: 'unavailable',
      level: null,
      message: hardware?.message || 'Monitör parlaklığı bu sistemde değiştirilemiyor.'
    };
    brightnessCache = { at: Date.now(), value: next };
    return next;
  }

  softwareBrightnessLevel = nextLevel;
  softwareDimmerEnabled = true;
  softwareDimmerActive = true;
  updateSoftwareDimmer();
  await updateSettings({
    system: {
      softwareBrightnessLevel
    }
  });

  const next = {
    ok: true,
    available: true,
    writable: true,
    softwareFallback: true,
    mode: 'software',
    level: softwareBrightnessLevel,
    message: softwareBrightnessMessage(softwareBrightnessLevel)
  };
  brightnessCache = { at: Date.now(), value: next };
  return next;
}

async function getPublishedControlState() {
  const controls = await getControlState({ includeBrightness: false });
  try {
    const brightness = await getEffectiveBrightnessState();
    const isSoftware = brightness.mode === 'software';
    const labelLevel = brightness.available ? brightness.level : null;
    controls.brightness = {
      enabled: null,
      label: labelLevel == null
        ? 'Yok'
        : (isSoftware && softwareDimmerActive ? `${labelLevel}%*` : `${labelLevel}%`),
      detail: brightness.message,
      mode: brightness.mode,
      softwareFallback: brightness.softwareFallback === true,
      level: labelLevel
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

function rendererPath() {
  return path.join(__dirname, '..', 'renderer', 'index.html');
}

function loadRenderer(window, query = {}) {
  return window.loadFile(rendererPath(), {
    query: {
      theme: overlayTheme,
      ...query
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    ...getOverlayBounds(collapsedBounds),
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
      sandbox: false,
      webviewTag: true
    }
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  loadRenderer(mainWindow);
  if (OPEN_DEVTOOLS) {
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    });
  }
  mainWindow.once('ready-to-show', () => mainWindow.showInactive());

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const SETTINGS_THEME_PANELS = {
  default: '#0a0c10',
  slate: '#111827',
  contrast: '#04080d',
  light: '#f8fafc',
  forest: '#07130f',
  ruby: '#17070c'
};

function settingsWindowBackground(settings) {
  const colorTheme = settings?.appearance?.colorTheme || 'default';
  if (colorTheme === 'custom') {
    return settings?.appearance?.customTheme?.panel || SETTINGS_THEME_PANELS.default;
  }
  return SETTINGS_THEME_PANELS[colorTheme] || SETTINGS_THEME_PANELS.default;
}

function syncSettingsWindowChrome(settings) {
  if (!settingsWindow || settingsWindow.isDestroyed()) {
    return;
  }
  settingsWindow.setBackgroundColor(settingsWindowBackground(settings));
}

async function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    return settingsWindow;
  }

  const settings = await loadSettings();
  settingsWindow = new BrowserWindow({
    width: 860,
    height: 640,
    minWidth: 780,
    minHeight: 560,
    frame: false,
    autoHideMenuBar: true,
    transparent: false,
    backgroundColor: settingsWindowBackground(settings),
    resizable: true,
    maximizable: false,
    fullscreenable: false,
    show: false,
    title: 'Ayarlar',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true
    }
  });

  settingsWindow.setMenuBarVisibility(false);

  loadRenderer(settingsWindow, { settingsWindow: '1' });
  if (OPEN_DEVTOOLS) {
    settingsWindow.webContents.once('did-finish-load', () => {
      settingsWindow.webContents.openDevTools({ mode: 'detach' });
    });
  }
  settingsWindow.once('ready-to-show', () => settingsWindow.show());
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  return settingsWindow;
}

async function openSettingsByPreference() {
  const settings = await loadSettings();
  if (settings?.system?.settingsOpenMode === 'window') {
    await createSettingsWindow();
    return;
  }

  setOverlayMode('settings');
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

function panelChromePad(style) {
  if (style === 'pill') {
    return { top: 8, edge: 2 };
  }
  if (style === 'floating' || style === 'compact') {
    return { top: 6, edge: 2 };
  }
  return { top: 0, edge: 2 };
}

function withPanelChrome(bounds, style = currentNotchStyle) {
  const pad = panelChromePad(style);
  return {
    width: bounds.width + pad.edge * 2,
    height: bounds.height + pad.top + pad.edge
  };
}

function boundsForOverlayMode(mode) {
  if (mode === 'collapsed') {
    return collapsedBounds;
  }

  if (mode === 'settings') {
    return {
      width: SETTINGS_BOUNDS.width,
      height: SETTINGS_BOUNDS.height
    };
  }

  if (mode === 'controls') {
    return withPanelChrome(EXPANDED_BOUNDS);
  }

  if (mode === 'media') {
    return withPanelChrome(MEDIA_BOUNDS);
  }

  if (mode === 'alarm') {
    return withPanelChrome(ALARM_BOUNDS);
  }

  return collapsedBounds;
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
  const nextStyle = settings?.appearance?.notchStyle || 'attached';
  const nextTheme = isDetachedNotchStyle(nextStyle) ? 'floating' : 'attached';
  const shouldStartWithWindows = settings?.system?.startWithWindows === true;
  const savedSoftwareLevel = clampPercent(settings?.system?.softwareBrightnessLevel, 100);
  softwareBrightnessLevel = 100;
  deactivateSoftwareDimmer();
  if (savedSoftwareLevel < 100) {
    updateSettings({
      system: {
        softwareBrightnessLevel: 100
      }
    }).catch(() => {});
  }
  currentNotchStyle = nextStyle;
  collapsedBounds = collapsedBoundsForSettings(settings);

  app.setLoginItemSettings({
    openAtLogin: shouldStartWithWindows,
    path: process.execPath
  });
  configureAutoUpdates(settings);
  registerVideoShortcuts(settings);

  if (nextTheme !== overlayTheme) {
    overlayTheme = nextTheme;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setBounds(getOverlayBounds(boundsForOverlayMode(overlayMode)), false);
      mainWindow.webContents.send('settings:update', settings);
    }
  } else if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setBounds(getOverlayBounds(boundsForOverlayMode(overlayMode)), false);
  }
}

function sendToRendererWindows(channel, payload) {
  [mainWindow, settingsWindow].forEach((window) => {
    if (window && !window.isDestroyed()) {
      window.webContents.send(channel, payload);
    }
  });
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

  const settings = await loadSettings();
  const media = await getCurrentMedia({
    preferredSource: settings?.appearance?.mediaSource || 'spotify'
  });
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
  const settings = await loadSettings();
  syncSettingsWindowChrome(settings);
  sendToRendererWindows('settings:update', settings);
}

function notificationId(notification) {
  return notification?.id || `${notification?.app}:${notification?.title}:${notification?.createdAt}`;
}

function filterDismissedNotifications(notifications) {
  return (notifications || []).filter((notification) => !dismissedNotificationIds.has(notificationId(notification)));
}

function rememberDismissedNotification(id) {
  if (!id) {
    return;
  }

  dismissedNotificationIds.add(id);
  while (dismissedNotificationIds.size > DISMISSED_NOTIFICATION_LIMIT) {
    dismissedNotificationIds.delete(dismissedNotificationIds.values().next().value);
  }
}

function rememberNotifications(notifications) {
  const merged = [...notifications, ...notificationHistory];
  const seen = new Set();
  notificationHistory = merged
    .filter((notification) => {
      const id = notificationId(notification);
      if (!id || dismissedNotificationIds.has(id) || seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    })
    .sort((left, right) => Number(right.createdAt || 0) - Number(left.createdAt || 0))
    .slice(0, 24);
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

  const notifications = filterDismissedNotifications(snapshot.notifications);
  rememberNotifications(notifications);
  if (!notificationsPrimed) {
    notifications.forEach((notification) => knownNotificationIds.add(notification.id));
    notificationsPrimed = true;
    return;
  }

  const newest = notifications.find((notification) => !knownNotificationIds.has(notificationId(notification)));
  notifications.forEach((notification) => knownNotificationIds.add(notificationId(notification)));

  if (newest) {
    mainWindow.webContents.send('notifications:update', newest);
  }
}

async function publishIntegrationNotifications() {
  if (!ENABLE_EXTERNAL_INTEGRATIONS) {
    return;
  }

  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  const notifications = filterDismissedNotifications(await getIntegrationNotifications());
  if (!integrationNotificationsPrimed) {
    notifications.forEach((notification) => knownIntegrationNotificationIds.add(notification.id));
    integrationNotificationsPrimed = true;
    return;
  }

  const newest = notifications.find((notification) => !knownIntegrationNotificationIds.has(notification.id));
  notifications.forEach((notification) => knownIntegrationNotificationIds.add(notification.id));

  if (newest) {
    mainWindow.webContents.send('notifications:update', newest);
  }
}

function resetIntegrationNotificationState() {
  integrationNotificationsPrimed = false;
  knownIntegrationNotificationIds.clear();
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

function execFileText(command, args = [], timeout = 3000) {
  return new Promise((resolve) => {
    execFile(command, args, {
      windowsHide: true,
      timeout
    }, (error, stdout) => {
      resolve({
        ok: !error,
        stdout: String(stdout || '')
      });
    });
  });
}

function formatBytesPerSecond(bytesPerSecond) {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond < 0) {
    return '--';
  }

  if (bytesPerSecond >= 1024 * 1024) {
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  }

  if (bytesPerSecond >= 1024) {
    return `${Math.round(bytesPerSecond / 1024)} KB/s`;
  }

  return `${Math.round(bytesPerSecond)} B/s`;
}

function parseCounterNumbers(value) {
  return (String(value || '').match(/\d+/g) || [])
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
}

async function readDefaultAdapterByteTotals() {
  const script = "$route = Get-NetRoute -DestinationPrefix '0.0.0.0/0' -ErrorAction SilentlyContinue | Sort-Object RouteMetric, InterfaceMetric | Select-Object -First 1; if ($route) { $adapter = Get-NetAdapter -InterfaceIndex $route.InterfaceIndex -ErrorAction SilentlyContinue; if ($adapter) { $stats = Get-NetAdapterStatistics -Name $adapter.Name -ErrorAction SilentlyContinue; if ($stats) { Write-Output ($stats.ReceivedBytes.ToString() + ',' + $stats.SentBytes.ToString()); exit 0 } } }; Write-Output ''";
  const result = await execFileText('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], 3500);
  const numbers = parseCounterNumbers(result.stdout);
  return numbers.length >= 2
    ? { receivedBytes: numbers[0], sentBytes: numbers[1] }
    : null;
}

async function readNetstatByteTotals() {
  const result = await execFileText('netstat.exe', ['-e']);
  const line = result.stdout.split(/\r?\n/).find((entry) => /^\s*(Bytes|Bayt)\s+/i.test(entry))
    || result.stdout.split(/\r?\n/).find((entry) => (entry.match(/\d+/g) || []).length >= 2);
  const numbers = parseCounterNumbers(line);
  return numbers.length >= 2
    ? { receivedBytes: numbers[0], sentBytes: numbers[1] }
    : null;
}

async function readNetworkByteTotals() {
  return await readDefaultAdapterByteTotals().catch(() => null)
    || await readNetstatByteTotals().catch(() => null)
    || {};
}

async function readPing() {
  const result = await execFileText('ping.exe', ['-n', '1', '8.8.8.8']);
  const match = result.stdout.match(/(?:time|sure|süre)[=<]\s*(\d+)\s*ms/i)
    || result.stdout.match(/Average\s*=\s*(\d+)ms/i)
    || result.stdout.match(/Ortalama\s*=\s*(\d+)ms/i);
  return match ? `${match[1]} ms` : '--';
}

async function readHeadphoneBattery() {
  const script = "$devices = Get-PnpDevice -PresentOnly -ErrorAction SilentlyContinue | Where-Object { (($_.Class -eq 'Bluetooth') -or ($_.Class -eq 'AudioEndpoint')) -and ($_.FriendlyName -match 'headphone|headset|buds|airpods|earbuds|kulak|jbl|sony|anker|soundcore|galaxy|xiaomi') }; foreach ($device in $devices) { $battery = Get-PnpDeviceProperty -InstanceId $device.InstanceId -KeyName 'DEVPKEY_Device_Battery_Level' -ErrorAction SilentlyContinue; if ($battery -and $null -ne $battery.Data) { Write-Output ($battery.Data.ToString() + '%'); exit 0 } }; Write-Output '--'";
  const result = await execFileText('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], 5000);
  const line = result.stdout.split(/\r?\n/).map((value) => value.trim()).find(Boolean);
  return line || '--';
}

async function getNetworkExtras(options = {}) {
  const shouldReadDownload = options.downloadSpeed !== false;
  const shouldReadPing = options.ping !== false;
  const shouldReadHeadphoneBattery = options.headphoneBattery === true;
  const [networkSample, ping, headphoneBattery] = await Promise.all([
    shouldReadDownload ? readNetworkByteTotals().catch(() => ({})) : Promise.resolve({}),
    shouldReadPing ? readPing().catch(() => '--') : Promise.resolve('--'),
    shouldReadHeadphoneBattery ? readHeadphoneBattery().catch(() => '--') : Promise.resolve('--')
  ]);
  const now = Date.now();
  let downloadSpeed = '--';
  let uploadSpeed = '--';

  if (networkSample.receivedBytes !== null
    && networkSample.receivedBytes !== undefined
    && lastNetworkSample
    && lastNetworkSample.receivedBytes !== null
    && lastNetworkSample.receivedBytes !== undefined) {
    const elapsed = Math.max(1, (now - lastNetworkSample.timestamp) / 1000);
    downloadSpeed = formatBytesPerSecond((networkSample.receivedBytes - lastNetworkSample.receivedBytes) / elapsed);
    uploadSpeed = formatBytesPerSecond((networkSample.sentBytes - lastNetworkSample.sentBytes) / elapsed);
  }

  if (networkSample.receivedBytes !== null && networkSample.receivedBytes !== undefined) {
    lastNetworkSample = {
      receivedBytes: networkSample.receivedBytes,
      sentBytes: networkSample.sentBytes,
      timestamp: now
    };
  }

  return {
    downloadSpeed,
    uploadSpeed,
    ping,
    headphoneBattery
  };
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

function normalizeVideoUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (/youtube\.com$/i.test(url.hostname) && url.pathname === '/watch' && url.searchParams.get('v')) {
      url.searchParams.set('autoplay', '1');
      return url.toString();
    }

    if (/youtu\.be$/i.test(url.hostname) && url.pathname.length > 1) {
      return `https://www.youtube.com/watch?v=${encodeURIComponent(url.pathname.slice(1))}&autoplay=1`;
    }

    return url.toString();
  } catch {
    return raw;
  }
}

async function showScreenVideo() {
  if (!ENABLE_SCREEN_VIDEO) {
    return { ok: false, message: 'Ekran içi video geçici olarak devre dışı.' };
  }

  const settings = await loadSettings();
  if (settings?.system?.screenVideo?.enabled !== true) {
    return { ok: false, message: 'Ekran içi video ayarlardan kapalı.' };
  }

  const target = normalizeVideoUrl(settings.system.screenVideo.url);
  if (!target) {
    return { ok: false, message: 'Video adresi boş.' };
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('screen-video:show-inline');
    return { ok: true, message: 'Video ana panelde açıldı.' };
  }

  return { ok: false, message: 'Ana pencere hazır değil.' };
}

function hideScreenVideo() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('screen-video:hide-inline');
  }

  return { ok: true, message: 'Video kapatıldı.' };
}

async function toggleScreenVideo() {
  return showScreenVideo();
}

function unregisterVideoShortcuts() {
  registeredVideoShortcuts.forEach((accelerator) => {
    globalShortcut.unregister(accelerator);
  });
  registeredVideoShortcuts.clear();
}

function registerVideoShortcuts(settings) {
  unregisterVideoShortcuts();

  if (!ENABLE_SCREEN_VIDEO) {
    return;
  }

  if (settings?.system?.screenVideo?.enabled !== true) {
    return;
  }

  const shortcuts = [
    [settings.system.screenVideo.openHotkey, showScreenVideo],
    [settings.system.screenVideo.closeHotkey, hideScreenVideo]
  ];

  shortcuts.forEach(([accelerator, handler]) => {
    const key = String(accelerator || '').trim();
    if (!key || registeredVideoShortcuts.has(key)) {
      return;
    }

    try {
      if (globalShortcut.register(key, () => {
        Promise.resolve(handler()).catch(() => {});
      })) {
        registeredVideoShortcuts.add(key);
      }
    } catch {
      // Invalid user-supplied accelerator should not block the app.
    }
  });
}

function isMainWindowSender(event) {
  return Boolean(mainWindow && !mainWindow.isDestroyed() && event.sender === mainWindow.webContents);
}

function closeWindowFromSender(event) {
  const owner = BrowserWindow.fromWebContents(event.sender);
  if (owner && !owner.isDestroyed()) {
    owner.close();
  }
}

function registerIpc() {
  ipcMain.on('overlay:expand', (event) => {
    if (!isMainWindowSender(event)) {
      return;
    }

    if (overlayMode === 'collapsed') {
      setOverlayMode('controls');
    }
  });
  ipcMain.on('overlay:collapse', (event) => {
    if (!isMainWindowSender(event)) {
      return;
    }

    if (overlayMode !== 'settings') {
      setOverlayMode('collapsed');
    }
  });
  ipcMain.on('overlay:settings', (event) => {
    if (isMainWindowSender(event)) {
      setOverlayMode('settings');
    }
  });
  ipcMain.on('overlay:controls', (event) => {
    if (isMainWindowSender(event)) {
      setOverlayMode('controls');
    }
  });
  ipcMain.on('overlay:media', (event) => {
    if (isMainWindowSender(event)) {
      setOverlayMode('media');
    }
  });
  ipcMain.on('overlay:alarm', (event) => {
    if (isMainWindowSender(event)) {
      setOverlayMode('alarm');
    }
  });
  ipcMain.on('settings:open-preferred', (event) => {
    if (isMainWindowSender(event)) {
      openSettingsByPreference().catch(() => {});
    }
  });
  ipcMain.on('window:close-current', closeWindowFromSender);

  ipcMain.handle('metrics:get', () => getSystemSnapshot());
  ipcMain.handle('media:get', async () => {
    const settings = await loadSettings();
    return getCurrentMedia({
      preferredSource: settings?.appearance?.mediaSource || 'spotify'
    });
  });
  ipcMain.handle('controls:get', () => getPublishedControlState());
  ipcMain.handle('settings:get', () => loadSettings());
  ipcMain.handle('notifications:get', () => ({
    available: true,
    notifications: filterDismissedNotifications(notificationHistory)
  }));
  ipcMain.handle('notifications:dismiss', (_event, id) => {
    rememberDismissedNotification(String(id || ''));
    notificationHistory = filterDismissedNotifications(notificationHistory);
    return {
      ok: true,
      notifications: notificationHistory
    };
  });
  ipcMain.handle('weather:get', (_event, city) => getWeatherForCity(city));
  ipcMain.handle('app:info', () => ({
    name: packageJson.productName || packageJson.build?.productName || packageJson.name,
    version: packageJson.version,
    description: packageJson.description || '',
    homepageUrl: packageJson.homepage || '',
    repositoryUrl: `https://github.com/${UPDATE_REPOSITORY.owner}/${UPDATE_REPOSITORY.repo}`,
    releasesUrl: `https://github.com/${UPDATE_REPOSITORY.owner}/${UPDATE_REPOSITORY.repo}/releases/latest`
  }));
  ipcMain.handle('app:clear-cache', async () => {
    await session.defaultSession.clearCache();
    return { ok: true, message: 'Önbellek temizlendi.' };
  });
  ipcMain.handle('system:ram-snapshot', () => memorySnapshot());
  ipcMain.handle('system:clean-ram', () => cleanRam());
  ipcMain.handle('settings:update', async (_event, patch) => {
    const settings = await updateSettings(patch);
    applyRuntimeSettings(settings);
    await publishSettings();
    return settings;
  });
  ipcMain.handle('integration:connect', async (_event, appId, credentials) => {
    if (!ENABLE_EXTERNAL_INTEGRATIONS) {
      return { ok: false, message: 'Harici uygulamalar şimdilik devre dışı.' };
    }

    const result = await connectIntegration(appId, credentials);
    if (result?.ok) {
      resetIntegrationNotificationState();
      await publishSettings();
      publishIntegrationNotifications().catch(() => {});
    }
    return result;
  });
  ipcMain.handle('integration:disconnect', async (_event, appId) => {
    if (!ENABLE_EXTERNAL_INTEGRATIONS) {
      return { ok: true, message: 'Harici uygulamalar şimdilik devre dışı.' };
    }

    const result = await disconnectIntegration(appId);
    resetIntegrationNotificationState();
    await publishSettings();
    return result;
  });
  ipcMain.handle('integration:status', (_event, appId) => (
    ENABLE_EXTERNAL_INTEGRATIONS
      ? getIntegrationAuthStatus(appId)
      : { appId, connected: false, account: '', hasAuth: false, disabled: true }
  ));

  ipcMain.handle('brightness:get', () => getEffectiveBrightnessState({ force: true }));
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
  ipcMain.handle('screen-video:show', () => showScreenVideo());
  ipcMain.handle('screen-video:hide', () => hideScreenVideo());
  ipcMain.handle('screen-video:toggle', () => toggleScreenVideo());
  ipcMain.handle('extras:network', (_event, options) => getNetworkExtras(options));

  ipcMain.handle('media:command', async (_event, command) => {
    const settings = await loadSettings();
    const media = await sendMediaCommand(command, {
      preferredSource: settings?.appearance?.mediaSource || 'spotify'
    });
    if (media && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('media:update', media);
    } else {
      await publishMedia();
    }
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
        await openSettingsByPreference();
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
              ? 'Rahatsız etmeyin açıldı.'
              : 'Rahatsız etmeyin kapatıldı.'
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
              : `Bluetooth ${result.enabled ? 'açıldı' : 'kapatıldı'}.`
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
  Menu.setApplicationMenu(null);
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
  if (ENABLE_EXTERNAL_INTEGRATIONS) {
    publishIntegrationNotifications();
  }
  metricsTimer = setInterval(publishMetrics, 2500);
  mediaTimer = setInterval(publishMedia, 6000);
  controlsTimer = setInterval(publishControls, 10000);
  notificationsTimer = setInterval(publishNotifications, 5000);
  if (ENABLE_EXTERNAL_INTEGRATIONS) {
    integrationNotificationsTimer = setInterval(publishIntegrationNotifications, 60000);
  }
  screen.on('display-metrics-changed', updateSoftwareDimmer);
  screen.on('display-added', updateSoftwareDimmer);
  screen.on('display-removed', updateSoftwareDimmer);
});

app.on('before-quit', () => {
  restoreMicrophoneMuteIfNeeded();
  deactivateSoftwareDimmer();

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

  if (integrationNotificationsTimer) {
    clearInterval(integrationNotificationsTimer);
  }

  if (updatesTimer) {
    clearInterval(updatesTimer);
  }

  unregisterVideoShortcuts();
  destroyDimmerWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
