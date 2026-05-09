const elements = {
  timeCompact: document.getElementById('timeCompact'),
  dateCompact: document.getElementById('dateCompact'),
  alarmCompact: document.getElementById('alarmCompact'),
  alarmCompactName: document.getElementById('alarmCompactName'),
  alarmCompactTime: document.getElementById('alarmCompactTime'),
  timeFull: document.getElementById('timeFull'),
  dateFull: document.getElementById('dateFull'),
  notificationTicker: document.getElementById('notificationTicker'),
  notificationTickerText: document.getElementById('notificationTickerText'),
  alarmStage: document.getElementById('alarmStage'),
  alarmStageName: document.getElementById('alarmStageName'),
  alarmStageTime: document.getElementById('alarmStageTime'),
  alarmStageRemaining: document.getElementById('alarmStageRemaining'),
  mediaTitle: document.getElementById('mediaTitle'),
  mediaArtist: document.getElementById('mediaArtist'),
  mediaStage: document.getElementById('mediaStage'),
  mediaStageApp: document.getElementById('mediaStageApp'),
  mediaStageTitle: document.getElementById('mediaStageTitle'),
  mediaStageArtist: document.getElementById('mediaStageArtist'),
  mediaAvatar: document.getElementById('mediaAvatar'),
  mediaAvatarText: document.getElementById('mediaAvatarText'),
  mediaCover: document.getElementById('mediaCover'),
  mediaElapsed: document.getElementById('mediaElapsed'),
  mediaDuration: document.getElementById('mediaDuration'),
  mediaProgress: document.getElementById('mediaProgress'),
  mediaWaves: document.getElementById('mediaWaves'),
  cpuValue: document.getElementById('cpuValue'),
  gpuValue: document.getElementById('gpuValue'),
  ramValue: document.getElementById('ramValue'),
  activeWindow: document.getElementById('activeWindow'),
  toast: document.getElementById('toast'),
  notch: document.getElementById('notch'),
  controlCenter: document.getElementById('controlCenter'),
  settingsPanel: document.getElementById('settingsPanel'),
  toolPanel: document.getElementById('toolPanel'),
  toolTitle: document.getElementById('toolTitle'),
  toolSubtitle: document.getElementById('toolSubtitle'),
  alarmForm: document.getElementById('alarmForm'),
  alarmName: document.getElementById('alarmName'),
  alarmDuration: document.getElementById('alarmDuration'),
  alarmRepeat: document.getElementById('alarmRepeat'),
  alarmEnabled: document.getElementById('alarmEnabled'),
  alarmList: document.getElementById('alarmList'),
  searchForm: document.getElementById('searchForm'),
  searchInput: document.getElementById('searchInput'),
  brightnessSlider: document.getElementById('brightnessSlider'),
  brightnessValue: document.getElementById('brightnessValue'),
  brightnessMessage: document.getElementById('brightnessMessage'),
  audioMixerList: document.getElementById('audioMixerList'),
  focusState: document.getElementById('focusState'),
  focusDetail: document.getElementById('focusDetail'),
  languageSelect: document.getElementById('languageSelect'),
  externalAppsList: document.getElementById('externalAppsList'),
  externalAppsSettingsList: document.getElementById('externalAppsSettingsList'),
  menuPages: document.getElementById('menuPages'),
  menuDots: document.getElementById('menuDots'),
  settingsScroll: document.querySelector('.settings-scroll'),
  featureSettingsList: document.getElementById('featureSettingsList'),
  enabledFeatureCount: document.getElementById('enabledFeatureCount'),
  settingsHeading: document.getElementById('settingsHeading'),
  customThemePreview: document.getElementById('customThemePreview'),
  appVersion: document.getElementById('appVersion'),
  appVersionStat: document.getElementById('appVersionStat'),
  appRepository: document.getElementById('appRepository'),
  updateStatus: document.getElementById('updateStatus'),
  updateAction: document.getElementById('updateAction')
};

const api = window.notch || {
  expand: () => {},
  collapse: () => {},
  media: async () => {},
  quickAction: async () => {},
  getMetrics: async () => null,
  getMedia: async () => null,
  getControls: async () => null,
  getSettings: async () => null,
  getAppInfo: async () => null,
  updateSettings: async () => null,
  checkForUpdates: async () => null,
  openUpdate: async () => null,
  getBrightness: async () => null,
  setBrightness: async () => null,
  getAudioMixer: async () => null,
  setAudioSessionVolume: async () => null,
  setAudioSessionMuted: async () => null,
  openExternalApp: async () => null,
  listLanguages: async () => [],
  getLanguage: async () => null,
  onMetrics: () => {},
  onMedia: () => {},
  onControls: () => {},
  onSettings: () => {},
  onOverlayMode: () => {},
  onNotification: () => {},
  onUpdateStatus: () => {},
  showSettings: () => {},
  showControls: () => {},
  showMedia: () => {},
  showAlarm: () => {},
  webSearch: async () => {}
};

const PAGE_SIZE = 8;
const ALARMS_STORAGE_KEY = 'notch-alarms';
const MINUTE_MS = 60 * 1000;
const ACTIVE_ALARM_MS = 60 * 1000;
const MENU_REORDER_HOLD_MS = 520;
const MENU_REORDER_EDGE_PX = 54;
const MENU_REORDER_SCROLL_MS = 720;
const MENU_REORDER_CANCEL_PX = 18;
const NOTIFICATION_TICKER_MS = 9500;

const TURKISH_WEEKDAYS = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi'
];

const TURKISH_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık'
];

const ICONS = {
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  bluetooth: '<path d="m7 7 10 10-5 4V3l5 4L7 17"/>',
  moon: '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  battery: '<rect x="3" y="7" width="15" height="10" rx="2"/><path d="M21 11v2M9 10l-2 4h4l-2 4"/>',
  wifi: '<path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M12 20h.01"/>',
  camera: '<path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5Z"/><circle cx="12" cy="13" r="3"/>',
  screenshot: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M9 12h6"/>',
  gamepad: '<path d="M6 12h4l1 2h2l1-2h4a3 3 0 0 1 2.8 4.1l-.8 2A2 2 0 0 1 16.2 18l-1.2-1H9l-1.2 1a2 2 0 0 1-3.8.1l-.8-2A3 3 0 0 1 6 12Z"/><path d="M7 15h3M8.5 13.5v3M16 14h.01M18 16h.01"/>',
  task: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  alarm: '<circle cx="12" cy="13" r="7"/><path d="M12 10v4l3 2M5 3 2 6M19 3l3 3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  microphone: '<path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v4M8 22h8"/>',
  volume: '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  apps: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>'
};

const MENU_ITEMS = [
  { label: 'Odaklanma yardımı', labelKey: 'menu.focus-assist', icon: 'bell', action: 'focus-assist', stateKey: 'silent' },
  { label: 'Bluetooth', labelKey: 'menu.bluetooth', icon: 'bluetooth', action: 'bluetooth', stateKey: 'bluetooth' },
  { label: 'Mikrofon', labelKey: 'menu.microphone', icon: 'microphone', action: 'microphone', stateKey: 'microphone' },
  { label: 'Kamera', labelKey: 'menu.camera', icon: 'camera', action: 'camera', stateKey: 'camera' },
  { label: 'Ekran görüntüsü', labelKey: 'menu.screenshot-full', icon: 'screenshot', action: 'screenshot-full' },
  { label: 'Ses mikseri', labelKey: 'menu.volume-mixer', icon: 'volume', action: 'volume-mixer' },
  { label: 'Parlaklık', labelKey: 'menu.brightness', icon: 'sun', action: 'brightness', stateKey: 'brightness' },
  { label: 'Karanlık mod', labelKey: 'menu.dark-mode', icon: 'moon', action: 'dark-mode', stateKey: 'darkMode' },
  { label: 'Gece Işığı', labelKey: 'menu.night-light', icon: 'eye', action: 'night-light', stateKey: 'nightLight' },
  { label: 'Güç Tasarrufu', labelKey: 'menu.battery', icon: 'battery', action: 'battery', stateKey: 'batterySaver' },
  { label: 'Ağ', labelKey: 'menu.network', icon: 'wifi', action: 'network', stateKey: 'network' },
  { label: 'Alarm', labelKey: 'menu.alarms', icon: 'alarm', action: 'alarms' },
  { label: 'Arama', labelKey: 'menu.search', icon: 'search', action: 'search' }
];

const DEFAULT_MENU_ORDER = MENU_ITEMS.map((item) => item.action);
const DEFAULT_CUSTOM_THEME = {
  panel: '#0a0c10',
  surface: '#171b22',
  text: '#f4f7fb',
  active: '#0f766e',
  connected: '#2563eb'
};

const THEME_PRESETS = {
  default: {
    name: 'Gece',
    colors: DEFAULT_CUSTOM_THEME
  },
  slate: {
    name: 'Grafit',
    colors: {
      panel: '#111827',
      surface: '#2d3748',
      text: '#f8fafc',
      active: '#0f766e',
      connected: '#2563eb'
    }
  },
  contrast: {
    name: 'Kontrast',
    colors: {
      panel: '#04080d',
      surface: '#202936',
      text: '#f8fafc',
      active: '#f59e0b',
      connected: '#16a34a'
    }
  },
  light: {
    name: 'Light',
    colors: {
      panel: '#f8fafc',
      surface: '#e2e8f0',
      text: '#111827',
      active: '#2563eb',
      connected: '#059669'
    }
  },
  forest: {
    name: 'Forest',
    colors: {
      panel: '#07130f',
      surface: '#12342a',
      text: '#ecfdf5',
      active: '#10b981',
      connected: '#38bdf8'
    }
  },
  ruby: {
    name: 'Ruby',
    colors: {
      panel: '#17070c',
      surface: '#3b111d',
      text: '#fff1f2',
      active: '#e11d48',
      connected: '#f97316'
    }
  }
};

const CUSTOM_COLOR_FIELDS = [
  { key: 'panel', label: 'Ana panel' },
  { key: 'surface', label: 'Menü yüzeyi' },
  { key: 'text', label: 'Metin' },
  { key: 'active', label: 'Aktif renk' },
  { key: 'connected', label: 'Bağlı durum' }
];

const EXTERNAL_APPS = [
  {
    id: 'youtube',
    icon: 'YT',
    name: 'YouTube',
    description: 'Video, abonelikler ve hızlı arama.',
    actions: [
      { label: 'Ana sayfa', target: 'https://www.youtube.com/' },
      { label: 'Abonelikler', target: 'https://www.youtube.com/feed/subscriptions' },
      { label: 'Shorts', target: 'https://www.youtube.com/shorts' }
    ]
  },
  {
    id: 'youtube-music',
    icon: 'YM',
    name: 'YouTube Music',
    description: 'Müzik ana sayfası, keşif ve kütüphane.',
    actions: [
      { label: 'Ana sayfa', target: 'https://music.youtube.com/' },
      { label: 'Keşfet', target: 'https://music.youtube.com/explore' },
      { label: 'Kitaplık', target: 'https://music.youtube.com/library' }
    ]
  },
  {
    id: 'discord',
    icon: 'DC',
    name: 'Discord',
    description: 'Masaüstü protokolü ve web istemcisi.',
    actions: [
      { label: 'Uygulama', target: 'discord://-/channels/@me' },
      { label: 'Web', target: 'https://discord.com/channels/@me' }
    ]
  },
  {
    id: 'github',
    icon: 'GH',
    name: 'GitHub',
    description: 'Kod, bildirimler ve pull request akışları.',
    actions: [
      { label: 'Ana sayfa', target: 'https://github.com/' },
      { label: 'Bildirimler', target: 'https://github.com/notifications' },
      { label: 'Pull requests', target: 'https://github.com/pulls' }
    ]
  }
];

const SHOW_EXTERNAL_APPS = false;

const DEFAULT_SETTINGS = {
  appearance: {
    showStatus: true,
    showMedia: true,
    compactSeconds: true,
    language: 'tr',
    colorTheme: 'default',
    customTheme: DEFAULT_CUSTOM_THEME,
    notchStyle: 'attached',
    menuOrder: DEFAULT_MENU_ORDER
  },
  system: {
    startWithWindows: false,
    softwareBrightnessLevel: 100
  },
  updates: {
    autoCheck: false
  },
  features: Object.fromEntries(MENU_ITEMS.map((item) => [item.action, true]))
};

const FEATURE_HELP = {
  'focus-assist': 'Odaklanma yardımı durumunu değiştirir.',
  bluetooth: 'Bluetooth adaptörünü aç/kapatmayı dener.',
  microphone: 'Mikrofon durumunu gösterir; tıklayınca sadece erişimi onarır.',
  camera: 'Kamera gizlilik iznini değiştirir.',
  'screenshot-full': 'Tam ekran görüntüsünü Resimler klasörüne kaydeder.',
  'volume-mixer': 'Uygulama içi ses mikserini açar.',
  brightness: 'Çentik içinde parlaklık kaydırıcısı açar.',
  'dark-mode': 'Windows koyu/açık tema durumunu değiştirir.',
  'night-light': 'Hızlı panel açmadan Gece Işığı durumunu değiştirir.',
  battery: 'Laptopta pil tasarrufu, kasada güç tasarrufu planını yönetir.',
  network: 'Ayarlar yerine Windows ağ hızlı panelini açar.',
  alarms: 'Çentik içinde alarm oluşturur.',
  search: 'Çentik içinde arama kutusu açar.',
  'external-apps': 'Yerleşik harici servisleri çentikten açar.'
};

let collapseTimer;
let toastTimer;
let expandTimer;
let notificationTimer;
let menuReorderScrollTimer;
let dragState = null;
let suppressMenuClick = false;
let isSettingsOpen = false;
let isToolOpen = false;
let activeToolView = '';
let appSettings = normalizeSettings(null);
let lastControlState = null;
let lastMediaState = null;
let mediaMenuOverride = false;
let alarms = loadAlarms();
let activeAlarm = null;
let alarmAutoCloseTimer;
let alarmSoundTimer;
let alarmAudioContext = null;
let currentDictionary = {};
let availableLanguages = [];

function readPath(source, path) {
  return String(path || '').split('.').reduce((value, part) => (
    value && Object.prototype.hasOwnProperty.call(value, part) ? value[part] : undefined
  ), source);
}

function t(path, fallback) {
  return readPath(currentDictionary, path) || fallback || path;
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function normalizeSettings(settings) {
  const appearance = {
    ...DEFAULT_SETTINGS.appearance,
    ...(settings?.appearance || {})
  };
  appearance.menuOrder = normalizeMenuOrder(appearance.menuOrder);
  appearance.customTheme = normalizeCustomTheme(appearance.customTheme);

  return {
    appearance,
    system: {
      ...DEFAULT_SETTINGS.system,
      ...(settings?.system || {})
    },
    updates: {
      ...DEFAULT_SETTINGS.updates,
      ...(settings?.updates || {})
    },
    features: {
      ...DEFAULT_SETTINGS.features,
      ...(settings?.features || {})
    }
  };
}

function normalizeCustomTheme(theme) {
  const source = theme && typeof theme === 'object' ? theme : {};
  return Object.fromEntries(CUSTOM_COLOR_FIELDS.map((field) => {
    const value = String(source[field.key] || DEFAULT_CUSTOM_THEME[field.key]).trim();
    return [field.key, /^#[0-9a-f]{6}$/i.test(value) ? value : DEFAULT_CUSTOM_THEME[field.key]];
  }));
}

function normalizeMenuOrder(order) {
  const knownActions = new Set(DEFAULT_MENU_ORDER);
  const result = [];
  const source = Array.isArray(order) ? order : DEFAULT_MENU_ORDER;

  source.forEach((action) => {
    if (knownActions.has(action) && !result.includes(action)) {
      result.push(action);
    }
  });

  DEFAULT_MENU_ORDER.forEach((action) => {
    if (!result.includes(action)) {
      result.push(action);
    }
  });

  return result;
}

function isFeatureEnabled(action) {
  return appSettings.features[action] !== false;
}

function menuLabel(item) {
  return t(item.labelKey, item.label);
}

function makePatch(path, value) {
  const [section, key] = path.split('.');
  return {
    [section]: {
      [key]: value
    }
  };
}

function applyTheme() {
  const params = new URLSearchParams(window.location.search);
  const urlTheme = params.get('theme') === 'floating' ? 'floating' : 'attached';
  const notchStyle = appSettings.appearance.notchStyle || urlTheme;
  const colorTheme = appSettings.appearance.colorTheme || 'default';
  const colors = colorTheme === 'custom'
    ? appSettings.appearance.customTheme
    : THEME_PRESETS[colorTheme]?.colors || THEME_PRESETS.default.colors;

  elements.notch.classList.toggle('theme-floating', notchStyle === 'floating');
  elements.notch.classList.toggle('theme-attached', notchStyle === 'attached');
  elements.notch.classList.toggle('theme-pill', notchStyle === 'pill');
  elements.notch.classList.toggle('theme-compact', notchStyle === 'compact');
  elements.notch.classList.toggle('color-slate', false);
  elements.notch.classList.toggle('color-contrast', false);
  elements.notch.classList.toggle('color-light', colorTheme === 'light');
  elements.notch.style.setProperty('--panel', hexToRgba(colors.panel, colorTheme === 'light' ? 0.98 : 0.985));
  elements.notch.style.setProperty('--panel-2', hexToRgba(colors.panel, colorTheme === 'light' ? 0.94 : 0.96));
  elements.notch.style.setProperty('--surface', hexToRgba(colors.surface, colorTheme === 'light' ? 0.92 : 0.96));
  elements.notch.style.setProperty('--surface-hover', hexToRgba(colors.surface, colorTheme === 'light' ? 1 : 0.98));
  elements.notch.style.setProperty('--text', colors.text);
  elements.notch.style.setProperty('--active', colors.active);
  elements.notch.style.setProperty('--connected', colors.connected);
}

function hexToRgba(hex, alpha) {
  const normalized = String(hex || '#000000').replace('#', '');
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function setToast(message) {
  elements.toast.textContent = message || '';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.toast.textContent = '';
  }, 3200);
}

function notificationText(notification) {
  const parts = [
    notification?.app,
    notification?.title,
    notification?.message
  ].map((part) => String(part || '').trim()).filter(Boolean);

  return parts.join(' - ');
}

function renderNotification(notification) {
  const text = notificationText(notification);
  if (!text || !elements.notificationTicker || !elements.notificationTickerText) {
    return;
  }

  clearTimeout(notificationTimer);
  elements.notificationTicker.hidden = false;
  elements.notificationTickerText.textContent = text;
  elements.notificationTickerText.style.animation = 'none';
  elements.notificationTickerText.getBoundingClientRect();
  elements.notificationTickerText.style.animation = '';
  elements.notch.classList.add('has-notification');

  notificationTimer = setTimeout(() => {
    elements.notch.classList.remove('has-notification');
    elements.notificationTicker.hidden = true;
    elements.notificationTickerText.textContent = '';
  }, NOTIFICATION_TICKER_MS);
}

function updateClock() {
  const now = new Date();
  const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
  const compactTime = appSettings.appearance.compactSeconds === false
    ? `${pad2(now.getHours())}:${pad2(now.getMinutes())}`
    : time;
  const compactDate = `${pad2(now.getDate())}.${pad2(now.getMonth() + 1)}.${now.getFullYear()}`;
  const date = `${TURKISH_WEEKDAYS[now.getDay()]}, ${pad2(now.getDate())} ${TURKISH_MONTHS[now.getMonth()]}`;

  if (activeAlarm) {
    renderActiveAlarm();
  } else {
    elements.timeCompact.textContent = compactTime;
    elements.dateCompact.textContent = compactDate;
  }

  elements.timeFull.textContent = time;
  elements.dateFull.textContent = date;
}

function renderMetrics(metrics) {
  elements.cpuValue.textContent = `CPU ${metrics.cpu.usage ?? '--'}%`;
  elements.gpuValue.textContent = `GPU ${metrics.gpu.usage ?? '--'}%`;
  elements.ramValue.textContent = `RAM ${metrics.memory.usage ?? '--'}%`;

  const title = metrics.activeWindow.title || metrics.activeWindow.processName || 'Uygulama bekleniyor';
  elements.activeWindow.textContent = title;
}

function renderMedia(media) {
  lastMediaState = media || null;

  if (!media?.available) {
    elements.mediaTitle.textContent = 'Medya kontrolleri hazır';
    elements.mediaArtist.textContent = '';
    elements.mediaStageTitle.textContent = 'Medya bekleniyor';
    elements.mediaStageArtist.textContent = '';
    elements.mediaAvatarText.textContent = 'S';
    elements.mediaCover.hidden = true;
    elements.mediaCover.removeAttribute('src');
    elements.mediaAvatar.classList.remove('has-cover');
    elements.mediaWaves.classList.remove('is-playing');
    elements.mediaElapsed.textContent = '0:00';
    elements.mediaDuration.textContent = '--:--';
    elements.mediaProgress.style.width = '0%';
    setPlayPauseButtons('open');
    updateDynamicMediaMode();
    return;
  }

  elements.mediaTitle.textContent = media.title || 'Bilinmeyen parça';
  elements.mediaArtist.textContent = [media.artist, media.status].filter(Boolean).join(' - ');
  elements.mediaStageApp.textContent = media.app || 'Medya';
  elements.mediaStageTitle.textContent = media.title || 'Bilinmeyen parça';
  elements.mediaStageArtist.textContent = media.artist || media.status || '';
  if (media.thumbnailDataUrl) {
    elements.mediaCover.src = media.thumbnailDataUrl;
    elements.mediaCover.hidden = false;
    elements.mediaAvatar.classList.add('has-cover');
  } else {
    elements.mediaAvatarText.textContent = media.avatarText || (media.app || 'M').slice(0, 1);
    elements.mediaCover.hidden = true;
    elements.mediaCover.removeAttribute('src');
    elements.mediaAvatar.classList.remove('has-cover');
  }
  elements.mediaWaves.classList.toggle('is-playing', media.status === 'playing');
  setPlayPauseButtons(media.status);
  updateMediaProgress();
  updateDynamicMediaMode();
}

function setPlayPauseButtons(status) {
  const isPlaying = status === 'playing';
  const label = isPlaying ? 'Duraklat' : 'Oynat';
  document.querySelectorAll('[data-media="playPause"]').forEach((button) => {
    button.dataset.state = isPlaying ? 'pause' : 'play';
    button.title = label;
    button.setAttribute('aria-label', label);
  });
}

function formatMediaTime(ms) {
  const totalSeconds = Math.max(0, Math.floor((ms || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${pad2(seconds)}`;
}

function currentMediaPosition(media) {
  if (!media?.durationMs) {
    return 0;
  }

  if (media.startedAt) {
    return Math.min(Date.now() - media.startedAt, media.durationMs);
  }

  return Math.min(media.positionMs || 0, media.durationMs);
}

function updateMediaProgress() {
  const media = lastMediaState;
  const duration = media?.durationMs || 0;
  const position = currentMediaPosition(media);
  const ratio = duration ? Math.max(0, Math.min(1, position / duration)) : 0;

  elements.mediaElapsed.textContent = formatMediaTime(position);
  elements.mediaDuration.textContent = duration ? formatMediaTime(duration) : '--:--';
  elements.mediaProgress.style.width = `${Math.round(ratio * 100)}%`;
}

function hasDynamicMedia() {
  return Boolean(
    appSettings.appearance.showMedia !== false
    && lastMediaState?.available
    && lastMediaState?.app === 'Spotify'
    && lastMediaState?.status === 'playing'
  );
}

function setMediaMode(enabled) {
  elements.controlCenter.classList.toggle('is-media-mode', enabled);
  elements.notch.classList.toggle('is-media', enabled);
  elements.mediaStage.hidden = !enabled;

  if (enabled) {
    api.showMedia();
  } else if (elements.notch.classList.contains('is-expanded') && !activeAlarm && !isSettingsOpen && !isToolOpen) {
    api.showControls();
  }
}

function updateDynamicMediaMode() {
  if (activeAlarm) {
    updateDynamicAlarmMode();
    setMediaMode(false);
    return;
  }

  if (isSettingsOpen || isToolOpen) {
    setMediaMode(false);
    return;
  }

  const expanded = elements.notch.classList.contains('is-expanded');
  setMediaMode(expanded && hasDynamicMedia() && !mediaMenuOverride);
}

function bindWheelScroll(node) {
  if (!node) {
    return;
  }

  node.addEventListener('wheel', (event) => {
    if (node.scrollHeight <= node.clientHeight) {
      return;
    }

    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    const atTop = node.scrollTop <= 0 && delta < 0;
    const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1 && delta > 0;
    if (atTop || atBottom) {
      return;
    }

    node.scrollTop += delta;
    event.preventDefault();
    event.stopPropagation();
  }, { passive: false });
}

function chunkItems(items, size) {
  const pages = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }

  return pages;
}

function iconSvg(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.task}</svg>`;
}

function orderedMenuItems() {
  const itemByAction = new Map(MENU_ITEMS.map((item) => [item.action, item]));
  return appSettings.appearance.menuOrder
    .map((action) => itemByAction.get(action))
    .filter(Boolean);
}

function visibleMenuItems() {
  return orderedMenuItems().filter((item) => isFeatureEnabled(item.action));
}

function renderMenu() {
  const visibleItems = visibleMenuItems();
  const pages = chunkItems(visibleItems, PAGE_SIZE);

  if (!pages.length) {
    elements.menuPages.innerHTML = '<div class="menu-empty">Hızlı menüler ayarlardan kapalı.</div>';
    elements.menuDots.innerHTML = '';
    return;
  }

  elements.menuPages.innerHTML = pages.map((page) => `
    <div class="menu-page">
      ${page.map((item) => `
        <button class="menu-tile${item.active ? ' is-active' : ''}${item.disabled ? ' is-disabled' : ''}" data-action="${item.action}" data-state-key="${item.stateKey || ''}" ${item.disabled ? 'aria-disabled="true"' : ''}>
          <span class="tile-icon">${iconSvg(item.icon)}</span>
          <span class="tile-label">${menuLabel(item)}</span>
          <span class="tile-state"></span>
        </button>
      `).join('')}
    </div>
  `).join('');

  elements.menuDots.innerHTML = pages.map((_, index) => (
    `<button class="menu-dot${index === 0 ? ' is-current' : ''}" data-page="${index}" type="button" tabindex="-1"></button>`
  )).join('');
}

function renderFeatureSettings() {
  elements.featureSettingsList.innerHTML = orderedMenuItems().map((item) => {
    const enabled = isFeatureEnabled(item.action);
    return `
      <div class="settings-row">
        <div>
          <strong>${menuLabel(item)}</strong>
          <span>${t(`featureHelp.${item.action}`, FEATURE_HELP[item.action] || 'Hızlı menü öğesini gösterir.')}</span>
        </div>
        <button class="switch${enabled ? ' is-on' : ''}" data-feature-toggle="${item.action}" aria-label="${menuLabel(item)}"></button>
      </div>
    `;
  }).join('');

  const enabledCount = orderedMenuItems().filter((item) => isFeatureEnabled(item.action)).length;
  elements.enabledFeatureCount.textContent = String(enabledCount);
}

function renderExternalApps() {
  if (!SHOW_EXTERNAL_APPS) {
    if (elements.externalAppsList) {
      elements.externalAppsList.innerHTML = '';
    }

    if (elements.externalAppsSettingsList) {
      elements.externalAppsSettingsList.innerHTML = '';
    }
    return;
  }

  const rows = EXTERNAL_APPS.map((app) => `
    <button class="external-app-row external-integration" type="button" data-external-app="${escapeHtml(app.id)}" data-external-action="0">
      <div class="external-app-header">
        <span class="external-app-badge">${escapeHtml(app.icon || app.name.slice(0, 2).toUpperCase())}</span>
        <div>
          <strong>${escapeHtml(app.name)}</strong>
          <span>${escapeHtml(app.description)}</span>
        </div>
      </div>
    </button>
  `).join('');

  if (elements.externalAppsList) {
    elements.externalAppsList.innerHTML = rows;
  }

  if (elements.externalAppsSettingsList) {
    elements.externalAppsSettingsList.innerHTML = rows;
  }
}

function syncExternalAppsVisibility() {
  document.querySelectorAll('[data-settings-section="external"], [data-section-panel="external"]').forEach((node) => {
    node.hidden = !SHOW_EXTERNAL_APPS;
  });
}

async function loadLanguage(code) {
  try {
    currentDictionary = await api.getLanguage(code || 'tr') || {};
  } catch {
    currentDictionary = {};
  }
}

async function renderLanguageOptions(selectedCode) {
  try {
    availableLanguages = await api.listLanguages();
  } catch {
    availableLanguages = [];
  }

  const languages = availableLanguages.length
    ? availableLanguages
    : [
      { code: 'tr', nativeName: 'Türkçe' },
      { code: 'en', nativeName: 'English' }
    ];

  elements.languageSelect.innerHTML = languages.map((language) => (
    `<option value="${escapeHtml(language.code)}">${escapeHtml(language.nativeName || language.name || language.code)}</option>`
  )).join('');
  elements.languageSelect.value = languages.some((language) => language.code === selectedCode) ? selectedCode : 'tr';
}

function applyCustomColorPreview(key, value) {
  const colors = {
    ...appSettings.appearance.customTheme,
    [key]: value
  };
  Object.entries(colors).forEach(([colorKey, colorValue]) => {
    document.querySelectorAll(`[data-color-preview="${colorKey}"]`).forEach((node) => {
      node.style.background = colorValue;
    });
  });
  const customPreview = document.querySelector('[data-theme-preview="custom"]');
  if (customPreview) {
    customPreview.style.setProperty('--preview-panel', colors.panel);
    customPreview.style.setProperty('--preview-active', colors.active);
    customPreview.style.setProperty('--preview-connected', colors.connected);
  }

  if (elements.customThemePreview) {
    elements.customThemePreview.style.setProperty('--preview-panel', colors.panel);
    elements.customThemePreview.style.setProperty('--preview-surface', colors.surface);
    elements.customThemePreview.style.setProperty('--preview-text', colors.text);
    elements.customThemePreview.style.setProperty('--preview-active', colors.active);
    elements.customThemePreview.style.setProperty('--preview-connected', colors.connected);
  }

  if (appSettings.appearance.colorTheme === 'custom') {
    elements.notch.style.setProperty('--panel', hexToRgba(colors.panel, 0.985));
    elements.notch.style.setProperty('--panel-2', hexToRgba(colors.panel, 0.96));
    elements.notch.style.setProperty('--surface', hexToRgba(colors.surface, 0.96));
    elements.notch.style.setProperty('--surface-hover', hexToRgba(colors.surface, 0.98));
    elements.notch.style.setProperty('--text', colors.text);
    elements.notch.style.setProperty('--active', colors.active);
    elements.notch.style.setProperty('--connected', colors.connected);
  }
}

function renderThemeControls() {
  document.querySelectorAll('[data-theme-preview]').forEach((preview) => {
    const theme = preview.dataset.themePreview;
    const colors = theme === 'custom'
      ? appSettings.appearance.customTheme
      : THEME_PRESETS[theme]?.colors || THEME_PRESETS.default.colors;
    preview.style.setProperty('--preview-panel', colors.panel);
    preview.style.setProperty('--preview-active', colors.active);
    preview.style.setProperty('--preview-connected', colors.connected);
  });

  document.querySelectorAll('[data-custom-color]').forEach((input) => {
    input.value = appSettings.appearance.customTheme[input.dataset.customColor] || DEFAULT_CUSTOM_THEME[input.dataset.customColor];
  });
  document.querySelectorAll('[data-open-custom-theme]').forEach((button) => {
    button.classList.toggle('is-current', appSettings.appearance.colorTheme === 'custom');
  });
  applyCustomColorPreview('', '');
}

function applyLanguageText() {
  document.querySelectorAll('.settings-nav[data-settings-section]').forEach((button) => {
    button.textContent = t(`settings.${button.dataset.settingsSection}`, button.textContent);
  });
}

function applySettings(settings) {
  appSettings = normalizeSettings(settings);
  applyTheme();
  applyLanguageText();
  syncExternalAppsVisibility();
  if (elements.languageSelect && elements.languageSelect.value !== appSettings.appearance.language) {
    elements.languageSelect.value = appSettings.appearance.language;
  }
  document.querySelectorAll('[data-setting-toggle]').forEach((button) => {
    const [section, key] = button.dataset.settingToggle.split('.');
    const enabled = appSettings[section]?.[key] !== false;
    button.classList.toggle('is-on', enabled);
  });

  document.querySelectorAll('[data-setting-visibility]').forEach((node) => {
    const key = node.dataset.settingVisibility;
    node.dataset.hiddenBySetting = appSettings.appearance[key] === false ? 'true' : 'false';
  });

  document.querySelectorAll('[data-setting-value]').forEach((button) => {
    const [section, key] = button.dataset.settingValue.split('.');
    button.classList.toggle('is-current', appSettings[section]?.[key] === button.dataset.value);
  });

  renderMenu();
  renderFeatureSettings();
  renderExternalApps();
  renderThemeControls();
  applyControlStates(lastControlState);
  updateMenuDots();
  updateClock();
  updateDynamicMediaMode();
}

function applyControlStates(state) {
  if (!state) {
    return;
  }

  lastControlState = state;

  document.querySelectorAll('.menu-tile[data-state-key]').forEach((tile) => {
    const stateKey = tile.dataset.stateKey;
    if (!stateKey) {
      return;
    }

    const itemState = state[stateKey];
    const stateLabel = tile.querySelector('.tile-state');
    tile.classList.remove('is-active', 'is-blocked', 'is-connected', 'is-unknown');

    if (!itemState) {
      tile.classList.add('is-unknown');
      if (stateLabel) {
        stateLabel.textContent = 'Bilinmiyor';
      }
      return;
    }

    if (stateKey === 'camera' || stateKey === 'microphone') {
      tile.classList.toggle('is-active', itemState.enabled === true);
      tile.classList.toggle('is-blocked', itemState.enabled === false);
    } else if (stateKey === 'bluetooth') {
      tile.classList.toggle('is-active', itemState.enabled === true);
      tile.classList.toggle('is-connected', itemState.connected === true);
    } else if (stateKey === 'silent') {
      tile.classList.toggle('is-active', itemState.enabled === true);
      tile.classList.toggle('is-unknown', itemState.enabled === null);
    } else {
      tile.classList.toggle('is-active', itemState.enabled === true);
      tile.classList.toggle('is-blocked', itemState.enabled === false);
      tile.classList.toggle('is-unknown', itemState.enabled === null);
    }

    if (stateLabel) {
      stateLabel.textContent = itemState.label || '';
    }
  });

  if (activeToolView === 'focusAssist') {
    renderFocusAssist();
  }
}

function refreshControls() {
  return api.getControls().then((state) => {
    applyControlStates(state);
  }).catch(() => {});
}

function updateMenuDots() {
  const currentPage = getCurrentPage();
  [...elements.menuDots.children].forEach((dot, index) => {
    dot.classList.toggle('is-current', index === currentPage);
  });
}

function getCurrentPage() {
  const width = elements.menuPages.clientWidth || 1;
  return Math.round(elements.menuPages.scrollLeft / width);
}

function scrollToPage(pageIndex) {
  const width = elements.menuPages.clientWidth || 1;
  elements.menuPages.scrollTo({
    left: pageIndex * width,
    behavior: 'smooth'
  });
}

function loadAlarms() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ALARMS_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAlarms() {
  localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
}

function formatAlarmDue(timestamp) {
  if (!timestamp) {
    return '--:--';
  }

  const date = new Date(timestamp);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function repeatLabel(value) {
  if (value === 'interval') {
    return 'Tekrarlı';
  }

  if (value === 'daily') {
    return 'Her gün';
  }

  return 'Tek sefer';
}

function formatAlarmTime(timestamp) {
  if (!timestamp) {
    return '--:--';
  }

  const date = new Date(timestamp);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function nextMinuteTimeValue() {
  const date = new Date(Date.now() + MINUTE_MS);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function setDefaultAlarmTime(force = false) {
  if (force || !elements.alarmDuration.value) {
    elements.alarmDuration.value = nextMinuteTimeValue();
  }
}

function parseTimeValue(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return {
    hours,
    minutes,
    value: `${pad2(hours)}:${pad2(minutes)}`
  };
}

function nextAtForTime(value, from = Date.now()) {
  const parsed = parseTimeValue(value);
  if (!parsed) {
    return null;
  }

  const date = new Date(from);
  date.setHours(parsed.hours, parsed.minutes, 0, 0);
  if (date.getTime() <= from) {
    date.setDate(date.getDate() + 1);
  }

  return date.getTime();
}

function nextAtForAlarm(alarm, from = Date.now()) {
  if (alarm?.time) {
    return nextAtForTime(alarm.time, from);
  }

  const duration = Math.max(1, Number.parseInt(alarm?.duration, 10) || 1);
  return from + duration * MINUTE_MS;
}

function alarmScheduleLabel(alarm) {
  if (alarm.time) {
    return `Saat ${alarm.time}`;
  }

  return `${alarm.duration || 1} dk sonra`;
}

function getAlarmAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  if (!alarmAudioContext) {
    alarmAudioContext = new AudioContextClass();
  }

  return alarmAudioContext;
}

function unlockAlarmSound() {
  const context = getAlarmAudioContext();
  if (!context?.resume) {
    return;
  }

  context.resume().catch(() => {});
}

function playAlarmPulse() {
  const context = getAlarmAudioContext();
  if (!context) {
    return;
  }

  context.resume?.().catch(() => {});
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, now);
  oscillator.frequency.setValueAtTime(660, now + 0.14);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.36);
}

function startAlarmSound() {
  stopAlarmSound();
  playAlarmPulse();
  alarmSoundTimer = setInterval(playAlarmPulse, 1200);
}

function stopAlarmSound() {
  clearInterval(alarmSoundTimer);
  alarmSoundTimer = null;
}

function renderActiveAlarm() {
  if (!activeAlarm) {
    return;
  }

  const remainingMs = Math.max(0, activeAlarm.endsAt - Date.now());
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const remainingText = `${remainingSeconds} sn sonra kapanır`;

  elements.alarmCompact.hidden = false;
  elements.alarmCompactName.textContent = activeAlarm.name;
  elements.alarmCompactTime.textContent = activeAlarm.time;
  elements.alarmStageName.textContent = activeAlarm.name;
  elements.alarmStageTime.textContent = activeAlarm.time;
  elements.alarmStageRemaining.textContent = remainingText;
  elements.notch.classList.add('has-active-alarm');
}

function setAlarmMode(enabled) {
  elements.controlCenter.classList.toggle('is-alarm-mode', enabled);
  elements.notch.classList.toggle('is-alarm', enabled);
  elements.alarmStage.hidden = !enabled;

  if (enabled) {
    api.showAlarm();
  } else if (elements.notch.classList.contains('is-expanded') && !activeAlarm && !isSettingsOpen && !isToolOpen) {
    api.showControls();
  }
}

function updateDynamicAlarmMode() {
  if (!activeAlarm || isSettingsOpen || isToolOpen) {
    setAlarmMode(false);
    return;
  }

  const expanded = elements.notch.classList.contains('is-expanded');
  setAlarmMode(expanded);
}

function dismissActiveAlarm() {
  clearTimeout(alarmAutoCloseTimer);
  alarmAutoCloseTimer = null;
  stopAlarmSound();
  activeAlarm = null;
  elements.alarmCompact.hidden = true;
  elements.notch.classList.remove('has-active-alarm');
  setAlarmMode(false);
  updateClock();
  updateDynamicMediaMode();
}

function startActiveAlarm(alarm, firedAt = Date.now()) {
  if (activeAlarm) {
    dismissActiveAlarm();
  }

  activeAlarm = {
    id: alarm.id,
    name: alarm.name || 'Alarm',
    time: formatAlarmTime(alarm.nextAt || firedAt),
    firedAt,
    endsAt: firedAt + ACTIVE_ALARM_MS
  };

  renderActiveAlarm();
  updateDynamicAlarmMode();
  setMediaMode(false);
  startAlarmSound();
  alarmAutoCloseTimer = setTimeout(dismissActiveAlarm, ACTIVE_ALARM_MS);
}

function renderAlarmList() {
  if (!elements.alarmList) {
    return;
  }

  if (!alarms.length) {
    elements.alarmList.innerHTML = '<div class="tool-empty">Kayıtlı alarm yok.</div>';
    return;
  }

  elements.alarmList.innerHTML = alarms.map((alarm) => `
    <div class="alarm-row">
      <div>
        <strong>${escapeHtml(alarm.name)}</strong>
        <span>${escapeHtml(alarmScheduleLabel(alarm))} - ${escapeHtml(repeatLabel(alarm.repeat))} - ${escapeHtml(formatAlarmDue(alarm.nextAt))}</span>
      </div>
      <button class="switch${alarm.enabled ? ' is-on' : ''}" data-alarm-toggle="${alarm.id}" aria-label="${escapeHtml(alarm.name)}"></button>
      <button class="inline-action danger" data-alarm-delete="${alarm.id}">Sil</button>
    </div>
  `).join('');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function addAlarm(formData) {
  const name = String(formData.get('name') || '').trim() || 'Alarm';
  const parsedTime = parseTimeValue(formData.get('time'));
  const repeat = String(formData.get('repeat') || 'none');
  const enabled = formData.get('enabled') === 'on';
  const now = Date.now();
  const nextAt = parsedTime ? nextAtForTime(parsedTime.value, now) : null;

  if (!parsedTime || !nextAt) {
    setToast('Geçerli bir alarm saati seç');
    return false;
  }

  alarms.unshift({
    id: `${now}-${Math.round(Math.random() * 10000)}`,
    name,
    time: parsedTime.value,
    repeat,
    enabled,
    nextAt: enabled ? nextAt : null,
    createdAt: now
  });
  alarms = alarms.slice(0, 8);
  saveAlarms();
  renderAlarmList();
  return true;
}

function checkAlarms() {
  const now = Date.now();
  let changed = false;

  alarms = alarms.map((alarm) => {
    if (!alarm.enabled || !alarm.nextAt || alarm.nextAt > now) {
      return alarm;
    }

    startActiveAlarm(alarm, now);
    changed = true;

    if (alarm.time && alarm.repeat === 'daily') {
      return {
        ...alarm,
        nextAt: nextAtForTime(alarm.time, now + MINUTE_MS)
      };
    }

    if (alarm.time) {
      return {
        ...alarm,
        enabled: false,
        nextAt: null
      };
    }

    if (alarm.repeat === 'interval') {
      let nextAt = alarm.nextAt;
      do {
        nextAt += alarm.duration * MINUTE_MS;
      } while (nextAt <= now);

      return {
        ...alarm,
        nextAt
      };
    }

    if (alarm.repeat === 'daily') {
      let nextAt = alarm.nextAt;
      do {
        nextAt += 24 * 60 * MINUTE_MS;
      } while (nextAt <= now);

      return {
        ...alarm,
        nextAt
      };
    }

    return {
      ...alarm,
      enabled: false,
      nextAt: null
    };
  });

  if (changed) {
    saveAlarms();
    renderAlarmList();
  }
}

async function refreshBrightness() {
  if (!elements.brightnessSlider) {
    return;
  }

  const state = await api.getBrightness();
  const available = state?.available === true;
  const level = available ? Math.max(0, Math.min(100, Number(state.level) || 0)) : 50;
  elements.brightnessSlider.disabled = !available;
  elements.brightnessSlider.value = String(level);
  elements.brightnessValue.textContent = available ? `%${level}` : '--%';
  elements.brightnessMessage.textContent = state?.message || 'Parlaklık durumu okunamadı.';
}

async function updateBrightness(level) {
  const result = await api.setBrightness(level);
  const available = result?.available === true || result?.ok === true;
  const nextLevel = Math.max(0, Math.min(100, Number(result?.level ?? level) || 0));
  elements.brightnessSlider.disabled = !available && result?.ok !== true;
  elements.brightnessSlider.value = String(nextLevel);
  elements.brightnessValue.textContent = available ? `%${nextLevel}` : '--%';
  elements.brightnessMessage.textContent = result?.message || (result?.ok ? 'Parlaklık değiştirildi.' : 'Parlaklık değiştirilemedi.');
}

function renderAudioMixer(mixer) {
  if (!elements.audioMixerList) {
    return;
  }

  const sessions = Array.isArray(mixer?.sessions) ? mixer.sessions : [];
  if (!mixer?.available) {
    elements.audioMixerList.innerHTML = '<div class="tool-empty">Ses mikseri kullanılamıyor.</div>';
    return;
  }

  if (!sessions.length) {
    elements.audioMixerList.innerHTML = '<div class="tool-empty">Aktif ses oturumu yok.</div>';
    return;
  }

  elements.audioMixerList.innerHTML = sessions.map((session) => {
    const id = escapeHtml(session.id);
    const volume = Math.max(0, Math.min(100, Number(session.volume) || 0));
    const peak = Math.max(0, Math.min(100, Math.round((Number(session.peak) || 0) * 100)));
    const status = [
      session.systemSounds ? 'Sistem' : (session.pid ? `PID ${session.pid}` : ''),
      session.active ? 'Aktif' : 'Boşta'
    ].filter(Boolean).join(' - ');

    return `
      <div class="audio-session-row" data-audio-session-row="${id}">
        <div class="audio-session-info">
          <strong>${escapeHtml(session.name || 'Uygulama')}</strong>
          <span>${escapeHtml(status || 'Ses oturumu')}</span>
        </div>
        <button class="mixer-mute${session.muted ? ' is-muted' : ''}" data-audio-mute="${id}" type="button" aria-label="${escapeHtml(session.name || 'Uygulama')} sesi">
          ${session.muted ? 'Kapalı' : 'Açık'}
        </button>
        <div class="audio-session-slider">
          <input type="range" min="0" max="100" step="1" value="${volume}" data-audio-volume="${id}" />
          <span class="audio-peak" style="--peak:${peak}%"></span>
        </div>
        <span class="audio-session-value">%${volume}</span>
      </div>
    `;
  }).join('');
}

async function refreshAudioMixer() {
  if (!elements.audioMixerList) {
    return;
  }

  elements.audioMixerList.innerHTML = '<div class="tool-empty">Ses oturumları okunuyor...</div>';
  try {
    renderAudioMixer(await api.getAudioMixer());
  } catch (error) {
    elements.audioMixerList.innerHTML = `<div class="tool-empty">${escapeHtml(error.message || 'Ses mikseri okunamadı.')}</div>`;
  }
}

function renderFocusAssist() {
  if (!elements.focusState || !elements.focusDetail) {
    return;
  }

  const state = lastControlState?.silent;
  if (!state) {
    elements.focusState.textContent = 'Durum bilinmiyor';
    elements.focusDetail.textContent = 'Windows bildirim durumu henüz okunmadı.';
    return;
  }

  elements.focusState.textContent = state.enabled ? 'Sessiz mod açık' : 'Bildirimler açık';
  elements.focusDetail.textContent = state.enabled
    ? 'Windows toast bildirimleri kapalı. Tekrar basınca bildirimler açılır.'
    : 'Windows toast bildirimleri açık. Tekrar basınca sessiz moda geçer.';
}

async function openExternalApp(appId, actionIndex) {
  const app = EXTERNAL_APPS.find((item) => item.id === appId);
  const action = app?.actions?.[actionIndex];
  if (!app || !action) {
    return;
  }

  const result = await api.openExternalApp(action.target);
  setToast(result?.message || (result?.ok ? `${app.name} açıldı` : `${app.name} açılamadı`));
}

function renderAppInfo(info) {
  const versionText = info?.version ? `v${info.version}` : 'v0.1.0';
  if (elements.appVersion) {
    elements.appVersion.textContent = versionText;
  }

  if (elements.appVersionStat) {
    elements.appVersionStat.textContent = versionText;
  }

  if (elements.appRepository) {
    elements.appRepository.textContent = info?.repositoryUrl || 'GitHub deposu';
  }
}

function renderUpdateStatus(status) {
  if (!elements.updateStatus) {
    return;
  }

  const message = status?.message || 'Henüz kontrol edilmedi.';
  elements.updateStatus.textContent = message;
  elements.updateStatus.dataset.status = status?.status || 'idle';

  if (elements.updateAction) {
    elements.updateAction.hidden = status?.status !== 'available';
    elements.updateAction.dataset.updatePayload = JSON.stringify({
      releaseUrl: status?.releaseUrl || '',
      downloadUrl: status?.downloadUrl || ''
    });
  }
}

async function checkForUpdates(manual = true) {
  renderUpdateStatus({ status: 'checking', message: 'Güncelleme kontrol ediliyor...' });
  const result = await api.checkForUpdates({ manual });
  renderUpdateStatus(result);
  if (manual && result?.message) {
    setToast(result.message);
  }
  return result;
}

function openToolView(viewName) {
  clearTimeout(collapseTimer);
  clearTimeout(expandTimer);
  isSettingsOpen = false;
  isToolOpen = true;
  activeToolView = viewName;
  elements.settingsPanel.hidden = true;
  elements.toolPanel.hidden = false;
  elements.notch.classList.add('is-expanded', 'is-tool');
  elements.notch.classList.remove('is-settings');
  setMediaMode(false);
  setAlarmMode(false);

  document.querySelectorAll('[data-tool-view]').forEach((view) => {
    view.hidden = view.dataset.toolView !== viewName;
  });

  if (viewName === 'alarm') {
    elements.toolTitle.textContent = 'Alarm';
    elements.toolSubtitle.textContent = 'İsim, saat ve tekrar';
    setDefaultAlarmTime(true);
    renderAlarmList();
    setTimeout(() => elements.alarmName.focus(), 80);
    return;
  }

  if (viewName === 'search') {
    elements.toolTitle.textContent = 'Arama';
    elements.toolSubtitle.textContent = 'Varsayılan tarayıcı';
    setTimeout(() => elements.searchInput.focus(), 80);
    return;
  }

  if (viewName === 'brightness') {
    elements.toolTitle.textContent = t('tools.brightness', 'Parlaklık');
    elements.toolSubtitle.textContent = 'Donanım veya yazılımsal seviye';
    refreshBrightness().catch(() => {
      elements.brightnessMessage.textContent = 'Parlaklık durumu okunamadı.';
    });
    return;
  }

  if (viewName === 'volumeMixer') {
    elements.toolTitle.textContent = 'Ses mikseri';
    elements.toolSubtitle.textContent = 'Uygulama bazlı ses';
    refreshAudioMixer();
    return;
  }

  if (viewName === 'focusAssist') {
    elements.toolTitle.textContent = 'Odaklanma yardımı';
    elements.toolSubtitle.textContent = 'Windows bildirim durumu';
    renderFocusAssist();
    refreshControls();
    return;
  }

  elements.toolTitle.textContent = t('tools.externalApps', 'Harici Uygulamalar');
  elements.toolSubtitle.textContent = t('tools.externalSubtitle', 'Yerleşik servisler ve hızlı hedefler');
  renderExternalApps();
}

function closeToolView() {
  isToolOpen = false;
  activeToolView = '';
  elements.notch.classList.remove('is-tool');
  elements.toolPanel.hidden = true;
  elements.notch.classList.add('is-expanded');
  api.showControls();
  updateDynamicMediaMode();
}

function showSettingsSection(sectionName) {
  const selected = !SHOW_EXTERNAL_APPS && sectionName === 'external'
    ? 'home'
    : sectionName || 'home';
  const titleMap = {
    home: t('settings.home', 'Giriş'),
    general: t('settings.general', 'Genel'),
    quick: t('settings.quick', 'Hızlı menüler'),
    external: t('settings.external', 'Harici Uygulamalar'),
    privacy: t('settings.privacy', 'Gizlilik'),
    system: t('settings.system', 'Sistem'),
    about: t('settings.about', 'Hakkımda'),
    'theme-custom': 'Tema Özelleştir'
  };

  document.querySelectorAll('.settings-nav[data-settings-section]').forEach((button) => {
    button.classList.toggle('is-current', button.dataset.settingsSection === selected);
  });

  document.querySelectorAll('[data-section-panel]').forEach((panel) => {
    panel.classList.toggle('is-visible', panel.dataset.sectionPanel === selected);
  });

  elements.settingsHeading.textContent = titleMap[selected] || 'Ayarlar';
  if (elements.settingsScroll) {
    elements.settingsScroll.scrollTop = 0;
  }
}

function openSettingsView() {
  clearTimeout(collapseTimer);
  clearTimeout(expandTimer);
  isSettingsOpen = true;
  isToolOpen = false;
  activeToolView = '';
  mediaMenuOverride = false;
  elements.toolPanel.hidden = true;
  elements.settingsPanel.hidden = false;
  elements.notch.classList.add('is-expanded', 'is-settings');
  elements.notch.classList.remove('is-tool');
  setMediaMode(false);
  setAlarmMode(false);
  api.showSettings();
  showSettingsSection('home');
}

function closeSettingsView() {
  isSettingsOpen = false;
  elements.notch.classList.remove('is-settings');
  elements.settingsPanel.hidden = true;
  elements.notch.classList.add('is-expanded');
  api.showControls();
  updateDynamicMediaMode();
}

function syncOverlayMode(mode) {
  if (mode === 'settings') {
    isSettingsOpen = true;
    isToolOpen = false;
    activeToolView = '';
    mediaMenuOverride = false;
    elements.toolPanel.hidden = true;
    elements.settingsPanel.hidden = false;
    elements.notch.classList.add('is-expanded', 'is-settings');
    elements.notch.classList.remove('is-tool');
    setMediaMode(false);
    setAlarmMode(false);
    showSettingsSection('home');
    return;
  }

  if (mode === 'controls') {
    isSettingsOpen = false;
    isToolOpen = false;
    activeToolView = '';
    elements.toolPanel.hidden = true;
    elements.settingsPanel.hidden = true;
    elements.notch.classList.remove('is-settings', 'is-tool');
    elements.notch.classList.add('is-expanded');
    updateDynamicMediaMode();
    return;
  }

  if (mode === 'collapsed') {
    isSettingsOpen = false;
    isToolOpen = false;
    activeToolView = '';
    mediaMenuOverride = false;
    elements.toolPanel.hidden = true;
    elements.settingsPanel.hidden = true;
    elements.notch.classList.remove('is-expanded', 'is-settings', 'is-tool');
    setMediaMode(false);
    setAlarmMode(false);
  }
}

async function updateSetting(path, nextValue) {
  const settings = await api.updateSettings(makePatch(path, nextValue));
  applySettings(settings);
}

async function toggleFeature(action) {
  const nextValue = !isFeatureEnabled(action);
  const settings = await api.updateSettings({
    features: {
      [action]: nextValue
    }
  });
  applySettings(settings);
}

async function runQuickAction(action) {
  const result = await api.quickAction(action);
  await refreshControls();
  if (result?.message) {
    setToast(result.message);
  }

  return result;
}

async function runMenuButton(button) {
  if (!button) {
    return;
  }

  if (button.classList.contains('is-disabled')) {
    setToast('Bu özellik bu cihazda desteklenmiyor');
    return;
  }

  const action = button.dataset.action;
  if (action === 'focus-assist') {
    openToolView('focusAssist');
    return;
  }

  if (action === 'alarms') {
    openToolView('alarm');
    return;
  }

  if (action === 'search') {
    openToolView('search');
    return;
  }

  if (action === 'brightness') {
    openToolView('brightness');
    return;
  }

  if (action === 'volume-mixer') {
    openToolView('volumeMixer');
    return;
  }

  button.classList.add('is-busy');
  try {
    setToast('Çalıştırılıyor...');
    await runQuickAction(action);
  } finally {
    button.classList.remove('is-busy');
  }
}

function clearMenuReorderScrollTimer() {
  clearInterval(menuReorderScrollTimer);
  menuReorderScrollTimer = null;
}

function cancelMenuReorderHold() {
  if (dragState?.holdTimer) {
    clearTimeout(dragState.holdTimer);
    dragState.holdTimer = null;
  }
}

function startMenuReorder() {
  if (!dragState?.actionButton || dragState.isReordering) {
    return;
  }

  dragState.isReordering = true;
  dragState.moved = true;
  suppressMenuClick = true;
  elements.menuPages.classList.remove('is-dragging');
  elements.menuPages.classList.add('is-reordering');
  dragState.actionButton.classList.add('is-reordering');
  setToast('Sürükleyip yeni konuma bırak');
}

function clearDropTargets() {
  document.querySelectorAll('.menu-tile.is-drop-target').forEach((tile) => {
    tile.classList.remove('is-drop-target');
  });
}

function updateDropTarget(clientX, clientY) {
  clearDropTargets();
  const target = document.elementFromPoint(clientX, clientY)?.closest?.('.menu-tile[data-action]');
  if (target && target.dataset.action !== dragState?.action) {
    target.classList.add('is-drop-target');
  }
}

function updateMenuReorderAutoScroll(clientX) {
  if (!dragState?.isReordering) {
    clearMenuReorderScrollTimer();
    return;
  }

  const rect = elements.menuPages.getBoundingClientRect();
  const direction = clientX > rect.right - MENU_REORDER_EDGE_PX
    ? 1
    : clientX < rect.left + MENU_REORDER_EDGE_PX
      ? -1
      : 0;

  if (!direction) {
    clearMenuReorderScrollTimer();
    return;
  }

  if (dragState.autoScrollDirection === direction && menuReorderScrollTimer) {
    return;
  }

  clearMenuReorderScrollTimer();
  dragState.autoScrollDirection = direction;
  menuReorderScrollTimer = setInterval(() => {
    const currentPage = getCurrentPage();
    const pages = Math.max(1, elements.menuDots.children.length);
    const nextPage = Math.max(0, Math.min(pages - 1, currentPage + direction));
    if (nextPage === currentPage) {
      clearMenuReorderScrollTimer();
      return;
    }

    scrollToPage(nextPage);
  }, MENU_REORDER_SCROLL_MS);
}

function dropIndexFromPoint(clientX, clientY) {
  const rect = elements.menuPages.getBoundingClientRect();
  const page = getCurrentPage();
  const columns = 4;
  const rows = 2;
  const localX = Math.max(0, Math.min(rect.width - 1, clientX - rect.left));
  const localY = Math.max(0, Math.min(rect.height - 1, clientY - rect.top));
  const column = Math.max(0, Math.min(columns - 1, Math.floor(localX / (rect.width / columns))));
  const row = Math.max(0, Math.min(rows - 1, Math.floor(localY / (rect.height / rows))));
  return page * PAGE_SIZE + row * columns + column;
}

async function saveMenuReorder(draggedAction, targetIndex) {
  const visibleActions = visibleMenuItems().map((item) => item.action);
  const sourceIndex = visibleActions.indexOf(draggedAction);
  if (sourceIndex < 0) {
    return;
  }

  const nextVisibleActions = visibleActions.filter((action) => action !== draggedAction);
  const boundedTarget = Math.max(0, Math.min(targetIndex, nextVisibleActions.length));
  nextVisibleActions.splice(boundedTarget, 0, draggedAction);

  if (nextVisibleActions.join('|') === visibleActions.join('|')) {
    return;
  }

  const hiddenActions = appSettings.appearance.menuOrder.filter((action) => !nextVisibleActions.includes(action));
  const menuOrder = [...nextVisibleActions, ...hiddenActions];
  const settings = await api.updateSettings({
    appearance: {
      menuOrder
    }
  });
  applySettings(settings);
  setToast('Menü sırası kaydedildi');
}

function finishMenuPointerInteraction() {
  cancelMenuReorderHold();
  clearMenuReorderScrollTimer();
  clearDropTargets();
  elements.menuPages.classList.remove('is-dragging', 'is-reordering');
  dragState?.actionButton?.classList.remove('is-reordering');
}

function bindCarouselEvents() {
  elements.menuPages.addEventListener('wheel', (event) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) {
      return;
    }

    event.preventDefault();
    elements.menuPages.scrollBy({
      left: delta,
      behavior: 'smooth'
    });
  }, { passive: false });

  elements.menuPages.addEventListener('pointerdown', (event) => {
    const actionButton = event.target.closest('[data-action]');
    if (event.button !== 0 && event.pointerType === 'mouse') {
      return;
    }

    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      startScrollLeft: elements.menuPages.scrollLeft,
      moved: false,
      actionButton,
      action: actionButton?.dataset.action || '',
      isReordering: false,
      holdTimer: actionButton ? setTimeout(startMenuReorder, MENU_REORDER_HOLD_MS) : null
    };
    elements.menuPages.setPointerCapture(event.pointerId);
    elements.menuPages.classList.add('is-dragging');
  });

  elements.menuPages.addEventListener('pointermove', (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const delta = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    dragState.currentX = event.clientX;
    dragState.currentY = event.clientY;

    if (dragState.isReordering) {
      event.preventDefault();
      updateDropTarget(event.clientX, event.clientY);
      updateMenuReorderAutoScroll(event.clientX);
      return;
    }

    const distance = Math.hypot(delta, deltaY);
    if (distance > MENU_REORDER_CANCEL_PX) {
      dragState.moved = true;
      cancelMenuReorderHold();
    }

    if (dragState.moved) {
      elements.menuPages.scrollLeft = dragState.startScrollLeft - delta;
    }
  });

  elements.menuPages.addEventListener('pointerup', async (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const moved = dragState.moved;
    const actionButton = dragState.actionButton;
    const draggedAction = dragState.action;
    const wasReordering = dragState.isReordering;
    const targetIndex = dropIndexFromPoint(event.clientX, event.clientY);
    finishMenuPointerInteraction();
    dragState = null;
    scrollToPage(getCurrentPage());

    if (wasReordering) {
      suppressMenuClick = true;
      setTimeout(() => {
        suppressMenuClick = false;
      }, 180);
      event.preventDefault();

      try {
        await saveMenuReorder(draggedAction, targetIndex);
      } catch (error) {
        setToast(error.message || 'Menü sırası kaydedilemedi');
      }
      return;
    }

    if (moved) {
      suppressMenuClick = true;
      setTimeout(() => {
        suppressMenuClick = false;
      }, 80);
      event.preventDefault();
      return;
    }

    if (actionButton) {
      suppressMenuClick = true;
      setTimeout(() => {
        suppressMenuClick = false;
      }, 120);
      event.preventDefault();

      try {
        await runMenuButton(actionButton);
      } catch (error) {
        setToast(error.message || 'Menü komutu çalışmadı');
      }
    }
  });

  elements.menuPages.addEventListener('pointercancel', () => {
    finishMenuPointerInteraction();
    dragState = null;
  });

  elements.menuDots.addEventListener('click', (event) => {
    const dot = event.target.closest('[data-page]');
    if (!dot) {
      return;
    }

    scrollToPage(Number(dot.dataset.page));
  });
}

function bindEvents() {
  elements.notch.addEventListener('mouseenter', () => {
    clearTimeout(collapseTimer);
    clearTimeout(expandTimer);
    if (isSettingsOpen || isToolOpen) {
      return;
    }

    api.expand();
    expandTimer = setTimeout(() => {
      elements.notch.classList.add('is-expanded');
      updateDynamicMediaMode();
    }, 24);
  });

  elements.notch.addEventListener('mouseleave', () => {
    if (isSettingsOpen || isToolOpen) {
      return;
    }

    clearTimeout(collapseTimer);
    clearTimeout(expandTimer);
    mediaMenuOverride = false;
    setMediaMode(false);
    setAlarmMode(false);
    elements.notch.classList.remove('is-expanded');
    collapseTimer = setTimeout(() => api.collapse(), 240);
  });

  document.querySelectorAll('[data-media]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await api.media(button.dataset.media);
      } catch (error) {
        setToast(error.message || 'Medya komutu çalışmadı');
      }
    });
  });

  elements.menuPages.addEventListener('click', async (event) => {
    if (suppressMenuClick) {
      event.preventDefault();
      return;
    }

    const button = event.target.closest('[data-action]');
    if (!button) {
      return;
    }

    try {
      await runMenuButton(button);
    } catch (error) {
      setToast(error.message || 'Menü komutu çalışmadı');
    }
  });

  document.querySelector('[data-open-settings]').addEventListener('click', () => {
    openSettingsView();
  });

  document.querySelector('[data-close-settings]').addEventListener('click', () => {
    closeSettingsView();
  });

  document.querySelector('[data-close-tool]').addEventListener('click', () => {
    closeToolView();
  });

  document.querySelector('[data-media-back]').addEventListener('click', () => {
    mediaMenuOverride = true;
    setMediaMode(false);
  });

  elements.alarmForm.addEventListener('submit', (event) => {
    event.preventDefault();
    unlockAlarmSound();
    const added = addAlarm(new FormData(elements.alarmForm));
    if (!added) {
      return;
    }

    elements.alarmForm.reset();
    elements.alarmDuration.value = nextMinuteTimeValue();
    elements.alarmEnabled.checked = true;
    elements.alarmName.focus();
    setToast('Alarm eklendi');
  });

  elements.alarmList.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-alarm-toggle]');
    if (toggle) {
      const alarm = alarms.find((item) => item.id === toggle.dataset.alarmToggle);
      if (alarm) {
        alarm.enabled = !alarm.enabled;
        alarm.nextAt = alarm.enabled ? nextAtForAlarm(alarm) : null;
        saveAlarms();
        renderAlarmList();
      }
      return;
    }

    const deleteButton = event.target.closest('[data-alarm-delete]');
    if (deleteButton) {
      if (activeAlarm?.id === deleteButton.dataset.alarmDelete) {
        dismissActiveAlarm();
      }
      alarms = alarms.filter((item) => item.id !== deleteButton.dataset.alarmDelete);
      saveAlarms();
      renderAlarmList();
      setToast('Alarm silindi');
    }
  });

  document.querySelector('[data-dismiss-alarm]').addEventListener('click', () => {
    dismissActiveAlarm();
  });

  elements.searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = elements.searchInput.value.trim();
    if (!query) {
      return;
    }

    try {
      const result = await api.webSearch(query);
      if (result?.message) {
        setToast(result.message);
      }
    } catch (error) {
      setToast(error.message || 'Arama açılamadı');
    }
  });

  elements.brightnessSlider.addEventListener('input', () => {
    elements.brightnessValue.textContent = `%${elements.brightnessSlider.value}`;
  });

  elements.brightnessSlider.addEventListener('change', async () => {
    try {
      await updateBrightness(elements.brightnessSlider.value);
    } catch (error) {
      setToast(error.message || 'Parlaklık değiştirilemedi');
    }
  });

  if (elements.audioMixerList) {
    elements.audioMixerList.addEventListener('input', (event) => {
      const slider = event.target.closest('[data-audio-volume]');
      if (!slider) {
        return;
      }

      const row = slider.closest('.audio-session-row');
      const value = row?.querySelector('.audio-session-value');
      if (value) {
        value.textContent = `%${slider.value}`;
      }
    });

    elements.audioMixerList.addEventListener('change', async (event) => {
      const slider = event.target.closest('[data-audio-volume]');
      if (!slider) {
        return;
      }

      try {
        const result = await api.setAudioSessionVolume(slider.dataset.audioVolume, slider.value);
        if (result?.mixer) {
          renderAudioMixer(result.mixer);
        }
        if (result?.message) {
          setToast(result.message);
        }
      } catch (error) {
        setToast(error.message || 'Ses seviyesi değiştirilemedi');
      }
    });

    elements.audioMixerList.addEventListener('click', async (event) => {
      const muteButton = event.target.closest('[data-audio-mute]');
      if (!muteButton) {
        return;
      }

      try {
        const nextMuted = !muteButton.classList.contains('is-muted');
        const result = await api.setAudioSessionMuted(muteButton.dataset.audioMute, nextMuted);
        if (result?.mixer) {
          renderAudioMixer(result.mixer);
        }
        if (result?.message) {
          setToast(result.message);
        }
      } catch (error) {
        setToast(error.message || 'Ses oturumu değiştirilemedi');
      }
    });
  }

  document.querySelector('[data-refresh-audio-mixer]')?.addEventListener('click', () => {
    refreshAudioMixer();
  });

  document.querySelector('[data-focus-toggle]')?.addEventListener('click', async () => {
    try {
      await runQuickAction('focus-assist');
      renderFocusAssist();
    } catch (error) {
      setToast(error.message || 'Odaklanma yardımı değiştirilemedi');
    }
  });

  document.querySelector('[data-focus-settings]')?.addEventListener('click', async () => {
    try {
      await runQuickAction('focus-settings');
    } catch (error) {
      setToast(error.message || 'Odaklanma ayarları açılamadı');
    }
  });

  [elements.externalAppsList, elements.externalAppsSettingsList].forEach((list) => {
    list.addEventListener('click', async (event) => {
      const actionButton = event.target.closest('[data-external-action]');
      if (actionButton) {
        await openExternalApp(actionButton.dataset.externalApp, Number(actionButton.dataset.externalAction));
      }
    });
  });

  elements.languageSelect.addEventListener('change', async () => {
    try {
      const settings = await api.updateSettings(makePatch('appearance.language', elements.languageSelect.value));
      await loadLanguage(settings.appearance.language);
      applySettings(settings);
    } catch (error) {
      setToast(error.message || 'Dil kaydedilemedi');
    }
  });

  document.querySelectorAll('[data-custom-color]').forEach((input) => {
    input.addEventListener('input', () => {
      applyCustomColorPreview(input.dataset.customColor, input.value);
    });
    input.addEventListener('change', async () => {
      try {
        const settings = await api.updateSettings({
          appearance: {
            colorTheme: 'custom',
            customTheme: {
              [input.dataset.customColor]: input.value
            }
          }
        });
        applySettings(settings);
      } catch (error) {
        setToast(error.message || 'Renk kaydedilemedi');
      }
    });
  });

  elements.settingsPanel.addEventListener('click', async (event) => {
    const nav = event.target.closest('[data-settings-section]');
    if (nav) {
      showSettingsSection(nav.dataset.settingsSection);
      return;
    }

    const customThemeButton = event.target.closest('[data-open-custom-theme]');
    if (customThemeButton) {
      try {
        const settings = await api.updateSettings(makePatch('appearance.colorTheme', 'custom'));
        applySettings(settings);
        showSettingsSection('theme-custom');
      } catch (error) {
        setToast(error.message || 'Tema açılmadı');
      }
      return;
    }

    const settingToggle = event.target.closest('[data-setting-toggle]');
    if (settingToggle) {
      const [section, key] = settingToggle.dataset.settingToggle.split('.');
      const nextValue = appSettings[section]?.[key] === false;
      try {
        await updateSetting(settingToggle.dataset.settingToggle, nextValue);
      } catch (error) {
        setToast(error.message || 'Ayar kaydedilemedi');
      }
      return;
    }

    const settingValue = event.target.closest('[data-setting-value]');
    if (settingValue) {
      try {
        const settings = await api.updateSettings(makePatch(settingValue.dataset.settingValue, settingValue.dataset.value));
        applySettings(settings);
      } catch (error) {
        setToast(error.message || 'Ayar kaydedilemedi');
      }
      return;
    }

    const featureToggle = event.target.closest('[data-feature-toggle]');
    if (featureToggle) {
      try {
        await toggleFeature(featureToggle.dataset.featureToggle);
      } catch (error) {
        setToast(error.message || 'Özellik ayarı kaydedilemedi');
      }
      return;
    }

    const updateCheck = event.target.closest('[data-check-updates]');
    if (updateCheck) {
      try {
        await checkForUpdates(true);
      } catch (error) {
        renderUpdateStatus({ status: 'error', message: error.message || 'Güncelleme kontrol edilemedi.' });
      }
      return;
    }

    const updateOpen = event.target.closest('[data-open-update]');
    if (updateOpen) {
      try {
        const payload = JSON.parse(updateOpen.dataset.updatePayload || '{}');
        const result = await api.openUpdate(payload);
        if (result?.message) {
          setToast(result.message);
        }
      } catch (error) {
        setToast(error.message || 'Güncelleme bağlantısı açılamadı');
      }
      return;
    }

    const actionButton = event.target.closest('[data-action]');
    if (actionButton) {
      try {
        await runQuickAction(actionButton.dataset.action);
      } catch (error) {
        setToast(error.message || 'Komut çalışmadı');
      }
    }
  });

  bindWheelScroll(elements.settingsScroll);
  bindWheelScroll(elements.featureSettingsList);
  bindWheelScroll(elements.externalAppsList);
  bindWheelScroll(elements.externalAppsSettingsList);

  elements.menuPages.addEventListener('scroll', updateMenuDots, { passive: true });
  bindCarouselEvents();
}

async function start() {
  const initialSettings = await api.getSettings().catch(() => null);
  appSettings = normalizeSettings(initialSettings);
  await renderLanguageOptions(appSettings.appearance.language);
  await loadLanguage(appSettings.appearance.language);
  applyTheme();
  applySettings(appSettings);
  showSettingsSection('home');
  bindEvents();
  updateClock();
  renderAlarmList();
  setDefaultAlarmTime();
  setInterval(updateClock, 1000);
  setInterval(checkAlarms, 1000);
  setInterval(updateMediaProgress, 1000);

  api.onMetrics(renderMetrics);
  api.onMedia(renderMedia);
  api.onControls(applyControlStates);
  api.onSettings(async (settings) => {
    const nextSettings = normalizeSettings(settings);
    if (nextSettings.appearance.language !== appSettings.appearance.language) {
      await loadLanguage(nextSettings.appearance.language);
    }
    applySettings(nextSettings);
  });
  api.onOverlayMode(syncOverlayMode);
  api.onNotification(renderNotification);
  api.onUpdateStatus(renderUpdateStatus);

  api.getAppInfo().then(renderAppInfo).catch(() => {
    renderAppInfo(null);
  });

  api.getMetrics().then((metrics) => {
    if (metrics) {
      renderMetrics(metrics);
    }
  }).catch(() => {});

  api.getMedia().then((media) => {
    if (media) {
      renderMedia(media);
    }
  }).catch(() => {});

  refreshControls();

}

start().catch(() => {
  bindEvents();
});
