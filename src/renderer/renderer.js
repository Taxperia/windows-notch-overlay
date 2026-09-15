const elements = {
  timeCompact: document.getElementById('timeCompact'),
  dateCompact: document.getElementById('dateCompact'),
  alarmCompact: document.getElementById('alarmCompact'),
  alarmCompactName: document.getElementById('alarmCompactName'),
  alarmCompactTime: document.getElementById('alarmCompactTime'),
  timeFull: document.getElementById('timeFull'),
  dateFull: document.getElementById('dateFull'),
  contentExtras: document.getElementById('contentExtras'),
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
  videoStage: document.getElementById('videoStage'),
  videoStageStatus: document.getElementById('videoStageStatus'),
  screenVideoView: document.getElementById('screenVideoView'),
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
  toolHeaderAction: document.getElementById('toolHeaderAction'),
  alarmForm: document.getElementById('alarmForm'),
  alarmName: document.getElementById('alarmName'),
  alarmDuration: document.getElementById('alarmDuration'),
  alarmRepeat: document.getElementById('alarmRepeat'),
  alarmEnabled: document.getElementById('alarmEnabled'),
  alarmList: document.getElementById('alarmList'),
  searchForm: document.getElementById('searchForm'),
  searchInput: document.getElementById('searchInput'),
  pomodoroTime: document.getElementById('pomodoroTime'),
  pomodoroMode: document.getElementById('pomodoroMode'),
  noteForm: document.getElementById('noteForm'),
  noteInput: document.getElementById('noteInput'),
  notesList: document.getElementById('notesList'),
  brightnessSlider: document.getElementById('brightnessSlider'),
  brightnessValue: document.getElementById('brightnessValue'),
  brightnessMessage: document.getElementById('brightnessMessage'),
  ramCleanUsage: document.getElementById('ramCleanUsage'),
  ramCleanUsed: document.getElementById('ramCleanUsed'),
  ramCleanFree: document.getElementById('ramCleanFree'),
  ramCleanMessage: document.getElementById('ramCleanMessage'),
  ramCleanButton: document.getElementById('ramCleanButton'),
  audioMixerList: document.getElementById('audioMixerList'),
  focusState: document.getElementById('focusState'),
  focusDetail: document.getElementById('focusDetail'),
  notificationCenterList: document.getElementById('notificationCenterList'),
  calendarPanel: document.getElementById('calendarPanel'),
  weatherCity: document.getElementById('weatherCity'),
  weatherSummary: document.getElementById('weatherSummary'),
  weatherForecast: document.getElementById('weatherForecast'),
  batteryDetailPanel: document.getElementById('batteryDetailPanel'),
  settingsSearchInput: document.getElementById('settingsSearchInput'),
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
  appName: document.getElementById('appName'),
  appVersion: document.getElementById('appVersion'),
  appDescription: document.getElementById('appDescription'),
  appVersionStat: document.getElementById('appVersionStat'),
  appRepository: document.getElementById('appRepository'),
  updateStatus: document.getElementById('updateStatus'),
  updateAction: document.getElementById('updateAction'),
  integrationModal: document.getElementById('integrationModal'),
  integrationModalTitle: document.getElementById('integrationModalTitle'),
  integrationModalBody: document.getElementById('integrationModalBody'),
  microphoneSelect: document.getElementById('microphoneSelect'),
  cameraSelect: document.getElementById('cameraSelect'),
  primaryWidgetSelect: document.getElementById('primaryWidgetSelect'),
  screenVideoUrl: document.getElementById('screenVideoUrl'),
  screenVideoOpenHotkey: document.getElementById('screenVideoOpenHotkey'),
  screenVideoCloseHotkey: document.getElementById('screenVideoCloseHotkey'),
  screenVideoWidth: document.getElementById('screenVideoWidth'),
  screenVideoHeight: document.getElementById('screenVideoHeight')
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
  getNotifications: async () => null,
  dismissNotification: async () => null,
  getWeather: async () => null,
  clearAppCache: async () => null,
  connectIntegration: async () => null,
  disconnectIntegration: async () => null,
  getIntegrationStatus: async () => null,
  updateSettings: async () => null,
  checkForUpdates: async () => null,
  openUpdate: async () => null,
  getBrightness: async () => null,
  setBrightness: async () => null,
  getRamSnapshot: async () => null,
  cleanRam: async () => null,
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
  onScreenVideoShow: () => {},
  onScreenVideoHide: () => {},
  showSettings: () => {},
  openSettingsPreferred: () => {},
  showControls: () => {},
  showMedia: () => {},
  showAlarm: () => {},
  closeCurrentWindow: () => {},
  showScreenVideo: async () => null,
  hideScreenVideo: async () => null,
  toggleScreenVideo: async () => null,
  getNetworkExtras: async () => null,
  webSearch: async () => {}
};

const PAGE_SIZE = 8;
const ALARMS_STORAGE_KEY = 'notch-alarms';
const NOTES_STORAGE_KEY = 'notch-notes';
const POMODORO_STORAGE_KEY = 'notch-pomodoro';
const MINUTE_MS = 60 * 1000;
const ACTIVE_ALARM_MS = 60 * 1000;
const MENU_REORDER_HOLD_MS = 520;
const MENU_REORDER_EDGE_PX = 54;
const MENU_REORDER_SCROLL_MS = 720;
const MENU_REORDER_CANCEL_PX = 18;
const NOTIFICATION_TICKER_MS = 9500;
const SEARCH_PARAMS = new URLSearchParams(window.location.search);
const IS_STANDALONE_SETTINGS_WINDOW = SEARCH_PARAMS.get('settingsWindow') === '1';

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
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
  note: '<path d="M5 4h10l4 4v12H5V4Z"/><path d="M15 4v5h5M8 12h7M8 16h8"/>',
  calendar: '<path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  cloudSun: '<path d="M12 2v2M5.2 5.2l1.4 1.4M2 12h2M18.4 6.6l1.4-1.4"/><path d="M17 18a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.7A3.5 3.5 0 0 0 7.5 18H17Z"/>',
  listBell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/><path d="M3 3h2M3 7h1M20 3h1M20 7h1"/>',
  apps: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  memory: '<path d="M6 7h12v10H6z"/><path d="M9 7V5M12 7V5M15 7V5M9 19v-2M12 19v-2M15 19v-2"/>'
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
  { label: 'Pil detayı', labelKey: 'menu.battery-detail', icon: 'battery', action: 'battery-detail', stateKey: 'batterySaver' },
  { label: 'Ağ', labelKey: 'menu.network', icon: 'wifi', action: 'network', stateKey: 'network' },
  { label: 'Bildirimler', labelKey: 'menu.notification-center', icon: 'listBell', action: 'notification-center' },
  { label: 'Takvim', labelKey: 'menu.calendar', icon: 'calendar', action: 'calendar' },
  { label: 'Hava durumu', labelKey: 'menu.weather', icon: 'cloudSun', action: 'weather' },
  { label: 'Alarm', labelKey: 'menu.alarms', icon: 'alarm', action: 'alarms' },
  { label: 'Arama', labelKey: 'menu.search', icon: 'search', action: 'search' },
  { label: 'Pomodoro', labelKey: 'menu.pomodoro', icon: 'timer', action: 'pomodoro' },
  { label: 'Notlar', labelKey: 'menu.notes', icon: 'note', action: 'notes' },
  { label: 'RAM temizleyici', labelKey: 'menu.ram-cleaner', icon: 'memory', action: 'ram-cleaner' }
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
    icon: 'youtube',
    name: 'YouTube',
    accent: '#ff0033',
    description: 'Google OAuth tanımı sonrası kanal olayları ve yorum bildirimleri.',
    logoSrc: './assets/external/youtube.svg',
    connectLabel: 'Google OAuth',
    auth: {
      type: 'oauth-required',
      title: 'Google OAuth kurulumu gerekiyor',
      help: 'Gerçek YouTube bildirimleri için Google Cloud OAuth Client ID/Secret ve YouTube Data API izinleri tanımlanmalı.'
    },
    events: [
      { id: 'upload', label: 'Kanal video yükledi' },
      { id: 'commentLike', label: 'Yorum beğenildi' },
      { id: 'subscriber', label: 'Yeni takipçi' },
      { id: 'mention', label: 'Yorumda bahsetme' },
      { id: 'live', label: 'Canlı yayın başladı' }
    ],
    launchTarget: 'https://www.youtube.com/'
  },
  {
    id: 'youtube-music',
    icon: 'youtubeMusic',
    name: 'YouTube Music',
    accent: '#ff0033',
    description: 'Google OAuth tanımı sonrası yayın, liste ve sanatçı olayları.',
    logoSrc: './assets/external/youtube-music.svg',
    connectLabel: 'Google OAuth',
    auth: {
      type: 'oauth-required',
      title: 'Google OAuth kurulumu gerekiyor',
      help: 'YouTube Music bildirimleri Google tarafında resmi ayrı bildirim API sağlamadığı için YouTube Data API ve hesap izinleriyle sınırlı okunabilir.'
    },
    events: [
      { id: 'release', label: 'Yeni yayın' },
      { id: 'playlist', label: 'Liste güncellendi' },
      { id: 'artistLive', label: 'Sanatçı canlı' }
    ],
    launchTarget: 'https://music.youtube.com/'
  },
  {
    id: 'discord',
    icon: 'discord',
    name: 'Discord',
    accent: '#5865f2',
    description: 'DM, etiket ve arama bildirimlerini çentikte gösterir.',
    logoSrc: './assets/external/discord.svg',
    connectLabel: 'Discord OAuth',
    auth: {
      type: 'limited',
      title: 'Discord için gerçek DM login sınırlı',
      help: 'Discord OAuth kullanıcı DM ve arama içeriklerini uygulamalara açmaz. Gerçek akış için Windows Discord bildirimleri yakalanır veya kullanıcının sunucusuna bot eklenir.'
    },
    events: [
      { id: 'dm', label: 'DM mesajı' },
      { id: 'serverMessage', label: 'Seçili sunucu mesajı' },
      { id: 'mentionInServer', label: 'Sunucuda etiket' },
      { id: 'mentionEverywhere', label: 'Her sunucuda etiket' },
      { id: 'call', label: 'Gelen arama' }
    ],
    launchTarget: 'discord://-/channels/@me'
  },
  {
    id: 'github',
    icon: 'github',
    name: 'GitHub',
    accent: '#2f81f7',
    description: 'Kod, bildirimler ve pull request akışları.',
    logoSrc: './assets/external/github.svg',
    connectLabel: 'GitHub OAuth',
    auth: {
      type: 'github-token',
      title: 'GitHub token ile gerçek bildirim',
      help: 'Fine-grained token kullanıyorsan Notifications read-only, klasik token kullanıyorsan notifications izni ver.'
    },
    events: [
      { id: 'pullRequest', label: 'Pull request' },
      { id: 'review', label: 'Review' },
      { id: 'issue', label: 'Issue' },
      { id: 'release', label: 'Release' },
      { id: 'actionFailed', label: 'Action başarısız' }
    ],
    launchTarget: 'https://github.com/'
  }
];

const SHOW_EXTERNAL_APPS = false;

const DEFAULT_SETTINGS = {
  appearance: {
    showStatus: true,
    showMedia: true,
    compactSeconds: true,
    language: 'tr',
    settingsMode: 'advanced',
    mediaSource: 'spotify',
    transparentCompactStrip: false,
    compactIdleDelaySeconds: 5,
    compactIdleOpacity: 45,
    compactIdleFadeText: false,
    alarmTone: 'classic',
    colorTheme: 'default',
    customTheme: DEFAULT_CUSTOM_THEME,
    notchStyle: 'attached',
    cornerRadius: 18,
    compactWidth: 250,
    compactHeight: 34,
    menuOrder: DEFAULT_MENU_ORDER
  },
  system: {
    startWithWindows: false,
    softwareBrightnessLevel: 100,
    weatherCity: 'Istanbul',
    settingsOpenMode: 'overlay',
    microphoneDeviceId: 'default',
    microphoneDeviceLabel: '',
    microphoneEndpointId: '',
    cameraDeviceId: 'default',
    screenVideo: {
      enabled: false,
      url: '',
      width: 420,
      height: 236,
      openHotkey: 'PageUp',
      closeHotkey: 'PageDown'
    }
  },
  updates: {
    autoCheck: false
  },
  content: {
    primaryWidget: 'clock',
    showDownloadSpeed: false,
    showPing: false,
    showHeadphoneBattery: false
  },
  integrations: Object.fromEntries(EXTERNAL_APPS.map((app) => [app.id, {
    connected: false,
    accent: app.accent || '#2563eb',
    tintMenu: true,
    events: Object.fromEntries((app.events || []).map((event) => [event.id, true]))
  }])),
  features: Object.fromEntries(MENU_ITEMS.map((item) => [item.action, true]))
};

const FEATURE_HELP = {
  'focus-assist': 'Odaklanma yardımı durumunu değiştirir.',
  bluetooth: 'Bluetooth adaptörünü aç/kapatmayı dener.',
  microphone: 'Ayarlarda seçili Windows kayıt aygıtını devre dışı bırakır veya etkinleştirir.',
  camera: 'Kamera gizlilik iznini değiştirir.',
  'screenshot-full': 'Tam ekran görüntüsünü Resimler klasörüne kaydeder.',
  'volume-mixer': 'Uygulama içi ses mikserini açar.',
  brightness: 'Çentik içinde parlaklık kaydırıcısı açar.',
  'dark-mode': 'Windows koyu/açık tema durumunu değiştirir.',
  'night-light': 'Hızlı panel açmadan Gece Işığı durumunu değiştirir.',
  battery: 'Laptopta pil tasarrufu, kasada güç tasarrufu planını yönetir.',
  'battery-detail': 'Pil veya güç tasarrufu durumunu detaylı gösterir.',
  network: 'Ayarlar yerine Windows ağ hızlı panelini açar.',
  'notification-center': 'Son Windows bildirimlerini çentik içinde listeler.',
  calendar: 'Bugünün takvim görünümünü ve günleri gösterir.',
  weather: 'Seçilen şehir için hava durumu panelini açar.',
  alarms: 'Çentik içinde alarm oluşturur.',
  search: 'Çentik içinde arama kutusu açar.',
  pomodoro: 'Odak ve mola sayacını çentikte açar.',
  notes: 'Kısa notları çentik içinde tutar.',
  'ram-cleaner': 'Kullanılmayan çalışma belleklerini temizleyerek RAM boşaltır.'
};

let collapseTimer;
let toastTimer;
let expandTimer;
let notificationTimer;
let stripTransparencyTimer;
let menuReorderScrollTimer;
let dragState = null;
let suppressMenuClick = false;
let isSettingsOpen = false;
let isToolOpen = false;
let activeToolView = '';
let activeSettingsSection = 'general';
let appSettings = normalizeSettings(null);
let lastControlState = null;
let lastMediaState = null;
let lastAppInfo = null;
let mediaMenuOverride = false;
let alarms = loadAlarms();
let activeAlarm = null;
let alarmAutoCloseTimer;
let alarmSoundTimer;
let alarmAudioContext = null;
let currentDictionary = {};
let availableLanguages = [];
let notificationCenterItems = [];
let weatherState = null;
let notes = loadNotes();
let pomodoro = loadPomodoro();
let deviceRefreshInProgress = false;
let activeIntegrationModalApp = '';
let networkExtras = {
  downloadSpeed: '--',
  uploadSpeed: '--',
  ping: '--',
  headphoneBattery: '--'
};
let lastSettingsFingerprint = '';
let settingsApplyTimer = null;

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

function normalizeCornerRadius(value) {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return DEFAULT_SETTINGS.appearance.cornerRadius;
  }
  return Math.max(0, Math.min(28, Math.round(next)));
}

function normalizeCompactWidth(value) {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return DEFAULT_SETTINGS.appearance.compactWidth;
  }
  return Math.max(200, Math.min(420, Math.round(next)));
}

function normalizeCompactHeight(value) {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return DEFAULT_SETTINGS.appearance.compactHeight;
  }
  return Math.max(28, Math.min(52, Math.round(next)));
}

function normalizeCompactIdleDelay(value) {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return DEFAULT_SETTINGS.appearance.compactIdleDelaySeconds;
  }
  return Math.max(1, Math.min(60, Math.round(next)));
}

function normalizeCompactIdleOpacity(value) {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return DEFAULT_SETTINGS.appearance.compactIdleOpacity;
  }
  return Math.max(20, Math.min(80, Math.round(next / 5) * 5));
}

function normalizeNotchAppearance(appearance) {
  let notchStyle = appearance.notchStyle;
  const hasExplicitRadius = appearance.cornerRadius !== undefined && appearance.cornerRadius !== null && appearance.cornerRadius !== '';
  let cornerRadius = normalizeCornerRadius(appearance.cornerRadius);
  const compactWidth = normalizeCompactWidth(appearance.compactWidth);
  const compactHeight = normalizeCompactHeight(appearance.compactHeight);

  if (notchStyle === 'angular') {
    if (!hasExplicitRadius) {
      cornerRadius = 0;
    }
    notchStyle = 'attached';
  } else if (notchStyle === 'slab') {
    if (!hasExplicitRadius) {
      cornerRadius = 6;
    }
    notchStyle = 'attached';
  } else if (!['attached', 'floating', 'pill', 'compact'].includes(notchStyle)) {
    notchStyle = 'attached';
  }

  cornerRadius = Math.min(cornerRadius, Math.floor(compactHeight / 2));

  return { notchStyle, cornerRadius, compactWidth, compactHeight };
}

function normalizeSettings(settings) {
  const appearance = {
    ...DEFAULT_SETTINGS.appearance,
    ...(settings?.appearance || {})
  };
  appearance.menuOrder = normalizeMenuOrder(appearance.menuOrder);
  appearance.customTheme = normalizeCustomTheme(appearance.customTheme);
  const migrated = normalizeNotchAppearance(settings?.appearance || {});
  appearance.notchStyle = migrated.notchStyle;
  appearance.cornerRadius = migrated.cornerRadius;
  appearance.compactWidth = migrated.compactWidth;
  appearance.compactHeight = migrated.compactHeight;
  appearance.compactIdleDelaySeconds = normalizeCompactIdleDelay(appearance.compactIdleDelaySeconds);
  appearance.compactIdleOpacity = normalizeCompactIdleOpacity(appearance.compactIdleOpacity);
  const system = {
    ...DEFAULT_SETTINGS.system,
    ...(settings?.system || {})
  };
  system.screenVideo = {
    ...DEFAULT_SETTINGS.system.screenVideo,
    ...(settings?.system?.screenVideo || {})
  };
  const integrations = normalizeIntegrations(settings?.integrations);

  return {
    appearance,
    system,
    updates: {
      ...DEFAULT_SETTINGS.updates,
      ...(settings?.updates || {})
    },
    content: {
      ...DEFAULT_SETTINGS.content,
      ...(settings?.content || {})
    },
    integrations,
    features: {
      ...DEFAULT_SETTINGS.features,
      ...(settings?.features || {})
    }
  };
}

function normalizeIntegrations(source) {
  const saved = source && typeof source === 'object' ? source : {};
  return Object.fromEntries(EXTERNAL_APPS.map((app) => {
    const current = saved[app.id] && typeof saved[app.id] === 'object' ? saved[app.id] : {};
    const defaultIntegration = DEFAULT_SETTINGS.integrations[app.id] || {
      connected: false,
      accent: app.accent || '#2563eb',
      tintMenu: true,
      events: {}
    };
    return [app.id, {
      ...defaultIntegration,
      ...current,
      events: {
        ...defaultIntegration.events,
        ...(current.events && typeof current.events === 'object' ? current.events : {})
      }
    }];
  }));
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
  return String(path || '').split('.').reverse().reduce((result, key) => ({
    [key]: result
  }), value);
}

function applyTheme() {
  const params = new URLSearchParams(window.location.search);
  const urlTheme = params.get('theme') === 'floating' ? 'floating' : 'attached';
  const notchStyle = appSettings.appearance.notchStyle || urlTheme;
  const colorTheme = appSettings.appearance.colorTheme || 'default';
  const compactWidth = normalizeCompactWidth(appSettings.appearance.compactWidth);
  const compactHeight = normalizeCompactHeight(appSettings.appearance.compactHeight);
  const cornerRadius = Math.min(
    normalizeCornerRadius(appSettings.appearance.cornerRadius),
    Math.floor(compactHeight / 2)
  );
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
  elements.notch.style.setProperty('--notch-radius', `${cornerRadius}px`);
  elements.notch.style.setProperty('--notch-radius-sm', `${Math.min(cornerRadius, Math.floor(compactHeight / 2))}px`);
  elements.notch.style.setProperty('--compact-width', `${compactWidth}px`);
  elements.notch.style.setProperty('--compact-height', `${compactHeight}px`);
  const compactIdleOpacity = normalizeCompactIdleOpacity(appSettings.appearance.compactIdleOpacity);
  elements.notch.style.setProperty('--compact-idle-opacity', `${compactIdleOpacity}%`);
  elements.notch.style.setProperty('--compact-idle-text-opacity', String(compactIdleOpacity / 100));
  const themeTokens = {
    '--panel': hexToRgba(colors.panel, colorTheme === 'light' ? 0.98 : 0.985),
    '--panel-2': hexToRgba(colors.surface, colorTheme === 'light' ? 0.94 : 0.92),
    '--surface': hexToRgba(colors.surface, colorTheme === 'light' ? 0.92 : 0.96),
    '--surface-hover': hexToRgba(colors.surface, colorTheme === 'light' ? 1 : 0.98),
    '--text': colors.text,
    '--active': colors.active,
    '--connected': colors.connected,
    '--muted': hexToRgba(colors.text, colorTheme === 'light' ? 0.62 : 0.68),
    '--dim': hexToRgba(colors.text, colorTheme === 'light' ? 0.45 : 0.42),
    '--line': hexToRgba(colors.text, colorTheme === 'light' ? 0.14 : 0.14),
    '--surface-border': hexToRgba(colors.text, colorTheme === 'light' ? 0.16 : 0.12)
  };
  Object.entries(themeTokens).forEach(([name, value]) => {
    elements.notch.style.setProperty(name, value);
    document.documentElement.style.setProperty(name, value);
  });
  document.documentElement.style.colorScheme = colorTheme === 'light' ? 'light' : 'dark';
  // Overlay penceresi şeffaf kalmalı; panel rengi sadece ayrı ayarlar penceresinde boyanır.
  if (IS_STANDALONE_SETTINGS_WINDOW) {
    document.documentElement.style.background = colors.panel;
    if (document.body) {
      document.body.style.background = colors.panel;
    }
  } else {
    document.documentElement.style.background = 'transparent';
    if (document.body) {
      document.body.style.background = 'transparent';
    }
  }

  const syncRange = (id, valueId, value) => {
    const range = document.getElementById(id);
    const output = document.getElementById(valueId);
    if (range && Number(range.value) !== value) {
      range.value = String(value);
    }
    if (output) {
      output.textContent = String(value);
    }
  };
  syncRange('cornerRadiusRange', 'cornerRadiusValue', cornerRadius);
  syncRange('compactWidthRange', 'compactWidthValue', compactWidth);
  syncRange('compactHeightRange', 'compactHeightValue', compactHeight);
  syncRange('compactIdleOpacityRange', 'compactIdleOpacityValue', compactIdleOpacity);
  const compactIdleOpacityOutput = document.getElementById('compactIdleOpacityValue');
  if (compactIdleOpacityOutput) {
    compactIdleOpacityOutput.textContent = `${compactIdleOpacity}%`;
  }
  document.querySelectorAll('.corner-radius-sample').forEach((sample) => {
    sample.style.borderRadius = `${cornerRadius}px`;
    sample.style.width = `${Math.min(220, compactWidth)}px`;
    sample.style.height = `${compactHeight}px`;
  });
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

function syncCompactStripTransparency() {
  const enabled = appSettings.appearance.transparentCompactStrip === true && !IS_STANDALONE_SETTINGS_WINDOW;
  elements.notch.classList.toggle('has-transparent-compact-strip', enabled);
  elements.notch.classList.toggle(
    'fade-compact-strip-text',
    enabled && appSettings.appearance.compactIdleFadeText === true
  );
  if (!enabled) {
    clearTimeout(stripTransparencyTimer);
    elements.notch.classList.remove('is-compact-strip-opaque');
    return;
  }

  revealCompactStrip();
  if (!elements.notch.matches(':hover')) {
    scheduleCompactStripTransparency();
  }
}

function revealCompactStrip() {
  if (appSettings.appearance.transparentCompactStrip !== true || IS_STANDALONE_SETTINGS_WINDOW) {
    return;
  }

  clearTimeout(stripTransparencyTimer);
  elements.notch.classList.add('is-compact-strip-opaque');
}

function scheduleCompactStripTransparency() {
  if (appSettings.appearance.transparentCompactStrip !== true || IS_STANDALONE_SETTINGS_WINDOW) {
    return;
  }

  clearTimeout(stripTransparencyTimer);
  stripTransparencyTimer = setTimeout(() => {
    if (elements.notch.matches(':hover') || isSettingsOpen || isToolOpen || activeToolView) {
      return;
    }
    elements.notch.classList.remove('is-compact-strip-opaque');
  }, normalizeCompactIdleDelay(appSettings.appearance.compactIdleDelaySeconds) * 1000);
}

function notificationText(notification) {
  const parts = [
    notification?.app,
    notification?.title,
    notification?.message
  ].map((part) => String(part || '').trim()).filter(Boolean);

  return parts.join(' - ');
}

function notificationItemId(notification) {
  return notification?.id || `${notification?.app}:${notification?.title}:${notification?.createdAt}`;
}

function integrationForNotification(notification) {
  const source = `${notification?.app || ''} ${notification?.title || ''}`.toLowerCase();
  return EXTERNAL_APPS.find((app) => source.includes(app.name.toLowerCase()) && appSettings.integrations[app.id]?.connected);
}

function renderNotification(notification) {
  const text = notificationText(notification);
  if (!text || !elements.notificationTicker || !elements.notificationTickerText) {
    return;
  }

  notificationCenterItems = [notification, ...notificationCenterItems]
    .filter((item, index, source) => source.findIndex((candidate) => notificationItemId(candidate) === notificationItemId(item)) === index)
    .slice(0, 24);
  if (activeToolView === 'notifications') {
    renderNotificationCenter();
  }

  const integration = integrationForNotification(notification);
  clearTimeout(notificationTimer);
  elements.notificationTicker.hidden = false;
  elements.notificationTickerText.textContent = text;
  elements.notificationTickerText.style.animation = 'none';
  elements.notificationTickerText.getBoundingClientRect();
  elements.notificationTickerText.style.animation = '';
  elements.notch.classList.add('has-notification');
  elements.notch.classList.toggle('has-integration-notification', Boolean(integration?.id));
  if (integration?.id) {
    const settings = appSettings.integrations[integration.id];
    elements.notch.style.setProperty('--notification-accent', settings?.accent || integration.accent || '#2563eb');
  }

  notificationTimer = setTimeout(() => {
    elements.notch.classList.remove('has-notification', 'has-integration-notification');
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
  const usePomodoro = appSettings.content.primaryWidget === 'pomodoro' || pomodoro.running;
  const primaryTime = usePomodoro ? formatDuration(pomodoro.remainingSeconds) : compactTime;
  const primaryDate = usePomodoro ? '' : compactDate;

  if (activeAlarm) {
    renderActiveAlarm();
  } else {
    elements.timeCompact.textContent = primaryTime;
    elements.dateCompact.textContent = primaryDate;
    elements.dateCompact.hidden = usePomodoro;
  }

  elements.timeFull.textContent = usePomodoro ? formatDuration(pomodoro.remainingSeconds) : time;
  elements.dateFull.textContent = usePomodoro ? '' : date;
  elements.dateFull.hidden = usePomodoro;
  renderContentExtras();
}

function renderContentExtras() {
  if (!elements.contentExtras) {
    return;
  }

  const extras = [];
  if (appSettings.content.showDownloadSpeed) {
    extras.push(`<span class="content-extra-item" title="İndirme hızı"><span aria-hidden="true">↓</span><strong>${escapeHtml(compactExtraValue(networkExtras.downloadSpeed))}</strong></span>`);
    extras.push(`<span class="content-extra-item" title="Yükleme hızı"><span aria-hidden="true">↑</span><strong>${escapeHtml(compactExtraValue(networkExtras.uploadSpeed))}</strong></span>`);
  }
  if (appSettings.content.showPing) {
    extras.push(`<span class="content-extra-item"><span>Ping</span><strong>${escapeHtml(compactExtraValue(networkExtras.ping))}</strong></span>`);
  }
  if (appSettings.content.showHeadphoneBattery) {
    extras.push(`<span class="content-extra-item"><span>Kulaklık</span><strong>${escapeHtml(compactExtraValue(networkExtras.headphoneBattery))}</strong></span>`);
  }

  elements.notch.classList.toggle('has-content-extras', extras.length > 0);
  if (extras.length > 0) {
    elements.notch.dataset.contentExtrasCount = String(extras.length);
  } else {
    delete elements.notch.dataset.contentExtrasCount;
  }
  elements.contentExtras.hidden = extras.length === 0;
  elements.contentExtras.dataset.count = String(extras.length);
  elements.contentExtras.innerHTML = extras.join('');
}

function compactExtraValue(value) {
  return String(value || '--')
    .replace(/\s+/g, '')
    .replace(/MB\/s/i, 'MB/s')
    .replace(/KB\/s/i, 'KB/s')
    .replace(/B\/s/i, 'B/s')
    .replace(/ms/i, 'ms');
}

async function refreshNetworkExtras() {
  if (!appSettings.content.showDownloadSpeed && !appSettings.content.showPing && !appSettings.content.showHeadphoneBattery) {
    return;
  }

  try {
    const extras = await api.getNetworkExtras({
      downloadSpeed: appSettings.content.showDownloadSpeed,
      ping: appSettings.content.showPing,
      headphoneBattery: appSettings.content.showHeadphoneBattery
    });
    networkExtras = {
      downloadSpeed: extras?.downloadSpeed || '--',
      uploadSpeed: extras?.uploadSpeed || '--',
      ping: extras?.ping || '--',
      headphoneBattery: extras?.headphoneBattery || '--'
    };
    renderContentExtras();
  } catch {
    networkExtras = {
      downloadSpeed: '--',
      uploadSpeed: '--',
      ping: '--',
      headphoneBattery: '--'
    };
  }
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

function externalAppLogo(app) {
  const name = app?.icon || app?.id || '';
  const fallback = escapeHtml(app?.name?.slice(0, 2).toUpperCase() || 'AP');
  if (app?.logoSrc) {
    return `<img src="${escapeHtml(app.logoSrc)}" alt="" />`;
  }

  const logos = {
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#ff0033" stroke="none" d="M21.6 7.1a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.4a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2 12a28 28 0 0 0 .4 4.9 2.7 2.7 0 0 0 1.9 1.9c1.7.4 7.7.4 7.7.4s6 0 7.7-.4a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.9Z"/><path fill="#fff" stroke="none" d="m10 15.2 5.2-3.2L10 8.8v6.4Z"/></svg>',
    youtubeMusic: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#ff0033" stroke="none"/><circle cx="12" cy="12" r="5.2" fill="#fff" stroke="none"/><path fill="#ff0033" stroke="none" d="M10.6 9.2v5.6L15 12l-4.4-2.8Z"/></svg>',
    discord: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#5865f2" stroke="none" d="M19.5 5.6A15.9 15.9 0 0 0 15.6 4l-.5 1a14.4 14.4 0 0 0-6.2 0l-.5-1a15.9 15.9 0 0 0-3.9 1.6C2 9.3 1.3 12.9 1.6 16.5A15.7 15.7 0 0 0 6.4 19l1-1.4a10.6 10.6 0 0 1-1.6-.8l.4-.3a11.4 11.4 0 0 0 11.6 0l.4.3a10.6 10.6 0 0 1-1.6.8l1 1.4a15.7 15.7 0 0 0 4.8-2.5c.4-4.1-.7-7.7-2.9-10.9Z"/><circle cx="9" cy="12.2" r="1.2" fill="#fff" stroke="none"/><circle cx="15" cy="12.2" r="1.2" fill="#fff" stroke="none"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#f0f6fc" stroke="none" d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.2-3.5-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.3-2.3-.3-4.7-1.2-4.7-5A3.9 3.9 0 0 1 6.6 9c-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.8 1a9.5 9.5 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.7 5 .4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/></svg>'
  };

  return logos[name] || `<span>${fallback}</span>`;
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
    const label = menuLabel(item);
    const help = t(`featureHelp.${item.action}`, FEATURE_HELP[item.action] || 'Hızlı menü öğesini gösterir.');
    return `
      <article class="feature-card${enabled ? ' is-enabled' : ''}">
        <div class="feature-card-icon" aria-hidden="true">${iconSvg(item.icon)}</div>
        <div class="feature-card-copy">
          <strong>${label}</strong>
          <span>${help}</span>
        </div>
        <button class="switch${enabled ? ' is-on' : ''}" data-feature-toggle="${item.action}" aria-label="${label}"></button>
      </article>
    `;
  }).join('');

  const enabledCount = orderedMenuItems().filter((item) => isFeatureEnabled(item.action)).length;
  if (elements.enabledFeatureCount) {
    elements.enabledFeatureCount.textContent = String(enabledCount);
  }
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

  const quickRows = '<div class="menu-empty">Harici uygulamalar ayarlardan yönetilir.</div>';

  const settingsRows = EXTERNAL_APPS.map((app) => {
    const integration = appSettings.integrations[app.id] || {};
    const connectionControl = integration.connected
      ? `
        <div class="integration-connected-actions">
          <button class="icon-action" type="button" data-integration-config="${escapeHtml(app.id)}" title="${escapeHtml(app.name)} ayarları" aria-label="${escapeHtml(app.name)} ayarları">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 0 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.3 7A2 2 0 0 1 7.1 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 0 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" />
            </svg>
          </button>
          <span class="integration-state-pill">Bağlandı</span>
        </div>
      `
      : `<button class="inline-action" type="button" data-integration-connect="${escapeHtml(app.id)}">Bağla</button>`;

    return `
      <article class="external-app-row external-settings-card">
        <div class="external-app-header">
          <span class="external-app-badge external-logo" style="--app-accent:${escapeHtml(integration.accent || app.accent || '#2563eb')}">${externalAppLogo(app)}</span>
          <div>
            <strong>${escapeHtml(app.name)}</strong>
            <span>${escapeHtml(app.description)}</span>
          </div>
          ${connectionControl}
        </div>
      </article>
    `;
  }).join('');

  if (elements.externalAppsList) {
    elements.externalAppsList.innerHTML = quickRows;
  }

  if (elements.externalAppsSettingsList) {
    elements.externalAppsSettingsList.innerHTML = settingsRows;
  }
}

function renderIntegrationModalBody(appId) {
  const app = EXTERNAL_APPS.find((item) => item.id === appId);
  if (!app || !elements.integrationModalBody) {
    return;
  }

  const integration = appSettings.integrations[app.id] || {};
  const account = String(integration.account || '').trim();
  const eventToggles = (app.events || []).map((event) => {
    const enabled = integration.events?.[event.id] !== false;
    return `
      <button class="event-chip${enabled ? ' is-on' : ''}" type="button" data-integration-event="${escapeHtml(app.id)}:${escapeHtml(event.id)}">
        ${escapeHtml(event.label)}
      </button>
    `;
  }).join('');
  const authPanel = (() => {
    if (app.auth?.type === 'github-token') {
      if (integration.connected) {
        return `
          <div class="integration-auth-card is-connected">
            <div>
              <strong>Gerçek GitHub bildirimi aktif</strong>
              <span>${escapeHtml(account ? `Hesap: ${account}` : 'GitHub API bildirimi okunuyor.')}</span>
            </div>
            <button class="inline-action danger" type="button" data-integration-disconnect="${escapeHtml(app.id)}">Bağlantıyı Kes</button>
          </div>
        `;
      }

      return `
        <form class="integration-auth-card" data-integration-auth-form="${escapeHtml(app.id)}">
          <label>
            <span>${escapeHtml(app.auth.title)}</span>
            <input class="settings-input" type="password" autocomplete="off" spellcheck="false" data-integration-token placeholder="github_pat_... veya ghp_..." />
          </label>
          <p>${escapeHtml(app.auth.help)}</p>
          <button class="inline-action" type="submit">Gerçek Bağla</button>
        </form>
      `;
    }

    return `
      <div class="integration-auth-card is-limited">
        <div>
          <strong>${escapeHtml(app.auth?.title || 'OAuth uygulama bilgisi gerekiyor')}</strong>
          <span>${escapeHtml(app.auth?.help || 'Bu sağlayıcı için önce provider tarafında uygulama oluşturulmalı.')}</span>
        </div>
      </div>
    `;
  })();

  elements.integrationModalTitle.textContent = `${app.name} ayarları`;
  elements.integrationModalBody.innerHTML = `
    <div class="integration-modal-summary">
      <span class="external-app-badge external-logo" style="--app-accent:${escapeHtml(integration.accent || app.accent || '#2563eb')}">${externalAppLogo(app)}</span>
      <div>
        <strong>${escapeHtml(app.name)}</strong>
        <span>${escapeHtml(integration.connected ? 'Bağlı' : (app.connectLabel || 'OAuth bağlantısı'))}</span>
      </div>
    </div>
    ${authPanel}
    <label class="integration-color">
      <span>Mesaj rengi</span>
      <input type="color" value="${escapeHtml(integration.accent || app.accent || '#2563eb')}" data-integration-color="${escapeHtml(app.id)}" />
    </label>
    <div class="event-chip-grid">${eventToggles}</div>
  `;
}

function openIntegrationModal(appId) {
  if (!elements.integrationModal) {
    return;
  }

  activeIntegrationModalApp = appId;
  renderIntegrationModalBody(appId);
  elements.integrationModal.hidden = false;
}

function closeIntegrationModal() {
  activeIntegrationModalApp = '';
  if (elements.integrationModal) {
    elements.integrationModal.hidden = true;
  }
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

function openInlineVideoStage() {
  const target = normalizeVideoUrl(appSettings.system.screenVideo?.url);
  if (!elements.videoStage || !elements.screenVideoView) {
    return { ok: false, message: 'Video alanı bulunamadı.' };
  }

  if (appSettings.system.screenVideo?.enabled !== true) {
    return { ok: false, message: 'Ekran içi video ayarlardan kapalı.' };
  }

  if (!target) {
    return { ok: false, message: 'Video adresi boş.' };
  }

  clearTimeout(collapseTimer);
  clearTimeout(expandTimer);
  isSettingsOpen = false;
  isToolOpen = false;
  elements.toolPanel.hidden = true;
  elements.settingsPanel.hidden = true;
  elements.videoStage.hidden = false;
  elements.menuPages.closest('.menu-carousel').hidden = true;
  elements.menuDots.hidden = true;
  elements.notch.classList.add('is-expanded', 'is-video');
  elements.notch.classList.remove('is-settings', 'is-tool');
  if (elements.screenVideoView.getAttribute('src') !== target) {
    elements.screenVideoView.setAttribute('src', target);
  }
  elements.videoStageStatus.textContent = 'Oynatılıyor';
  api.showControls();
  return { ok: true, message: 'Video ana panelde açıldı.' };
}

function closeInlineVideoStage() {
  if (elements.videoStage) {
    elements.videoStage.hidden = true;
  }
  if (elements.videoStageStatus) {
    elements.videoStageStatus.textContent = 'Video hazır';
  }
  elements.menuPages.closest('.menu-carousel').hidden = false;
  elements.menuDots.hidden = false;
  elements.notch.classList.remove('is-video');
}

async function requestInlineVideoStage() {
  try {
    const result = await api.showScreenVideo();
    setToast(result?.message || 'Video ana panelde açıldı');
  } catch (error) {
    setToast(error.message || 'Video ana panelde açılamadı');
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

}

function renderThemeControls() {
  const colorTheme = appSettings.appearance.colorTheme || 'default';
  const activeAccent = String(appSettings.appearance.customTheme?.active || THEME_PRESETS[colorTheme]?.colors?.active || DEFAULT_CUSTOM_THEME.active).toLowerCase();

  document.querySelectorAll('[data-theme-preview]').forEach((preview) => {
    const theme = preview.dataset.themePreview;
    const colors = theme === 'custom'
      ? appSettings.appearance.customTheme
      : THEME_PRESETS[theme]?.colors || THEME_PRESETS.default.colors;
    preview.style.setProperty('--preview-panel', colors.panel);
    preview.style.setProperty('--preview-surface', colors.surface);
    preview.style.setProperty('--preview-active', colors.active);
    preview.style.setProperty('--preview-connected', colors.connected);
  });

  document.querySelectorAll('[data-custom-color]').forEach((input) => {
    input.value = appSettings.appearance.customTheme[input.dataset.customColor] || DEFAULT_CUSTOM_THEME[input.dataset.customColor];
  });
  document.querySelectorAll('[data-open-custom-theme]').forEach((button) => {
    button.classList.toggle('is-current', colorTheme === 'custom');
  });
  document.querySelectorAll('[data-dark-theme-toggle]').forEach((button) => {
    button.classList.toggle('is-on', colorTheme !== 'light');
  });
  document.querySelectorAll('[data-accent-preset]').forEach((button) => {
    button.classList.toggle('is-current', String(button.dataset.accentPreset || '').toLowerCase() === activeAccent);
  });
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect && [...themeSelect.options].some((option) => option.value === colorTheme)) {
    themeSelect.value = colorTheme;
  }
  applyCustomColorPreview('', '');
}

function isDetachedStyle(style) {
  return ['floating', 'pill', 'compact'].includes(style);
}

function syncFloatingVariantControls() {
  const style = appSettings.appearance.notchStyle;
  const showFloatingVariants = ['floating', 'pill', 'compact'].includes(style);
  document.querySelectorAll('[data-floating-variants]').forEach((node) => {
    node.hidden = !showFloatingVariants;
  });
  document.querySelectorAll('[data-appearance-base="floating"]').forEach((button) => {
    button.classList.toggle('is-current', showFloatingVariants);
  });
}

function renderContentSettings() {
  if (elements.primaryWidgetSelect) {
    elements.primaryWidgetSelect.value = appSettings.content.primaryWidget || 'clock';
  }

  const video = appSettings.system.screenVideo || DEFAULT_SETTINGS.system.screenVideo;
  if (elements.screenVideoUrl) {
    elements.screenVideoUrl.value = video.url || '';
  }
  if (elements.screenVideoOpenHotkey) {
    elements.screenVideoOpenHotkey.value = video.openHotkey || 'PageUp';
  }
  if (elements.screenVideoCloseHotkey) {
    elements.screenVideoCloseHotkey.value = video.closeHotkey || 'PageDown';
  }
  if (elements.screenVideoWidth) {
    elements.screenVideoWidth.value = String(video.width || 420);
  }
  if (elements.screenVideoHeight) {
    elements.screenVideoHeight.value = String(video.height || 236);
  }
}

async function saveScreenVideoSettings() {
  const width = Math.max(260, Math.min(900, Number(elements.screenVideoWidth?.value) || 420));
  const height = Math.max(160, Math.min(600, Number(elements.screenVideoHeight?.value) || 236));
  const settings = await api.updateSettings({
    system: {
      screenVideo: {
        url: elements.screenVideoUrl?.value || '',
        openHotkey: elements.screenVideoOpenHotkey?.value || 'PageUp',
        closeHotkey: elements.screenVideoCloseHotkey?.value || 'PageDown',
        width,
        height
      }
    }
  });
  applySettings(settings);
}

function renderDeviceSelections() {
  if (elements.microphoneSelect && !elements.microphoneSelect.value) {
    elements.microphoneSelect.innerHTML = '<option value="default">Varsayılan mikrofon</option>';
    elements.microphoneSelect.value = appSettings.system.microphoneDeviceId || 'default';
  }

  if (elements.cameraSelect && !elements.cameraSelect.value) {
    elements.cameraSelect.innerHTML = '<option value="default">Varsayılan kamera</option>';
    elements.cameraSelect.value = appSettings.system.cameraDeviceId || 'default';
  }
}

function renderDeviceOptions(devices = []) {
  const microphones = devices.filter((device) => device.kind === 'audioinput');
  const cameras = devices.filter((device) => device.kind === 'videoinput');

  if (elements.microphoneSelect) {
    const selectedId = appSettings.system.microphoneDeviceId || 'default';
    const selectedLabel = String(appSettings.system.microphoneDeviceLabel || '').trim();
    const microphoneOptions = [
      '<option value="default">Varsayılan mikrofon</option>',
      ...microphones.map((device, index) => (
        `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Mikrofon ${index + 1}`)}</option>`
      ))
    ];
    if (selectedId !== 'default' && !microphones.some((device) => device.deviceId === selectedId)) {
      microphoneOptions.push(
        `<option value="${escapeHtml(selectedId)}">${escapeHtml(selectedLabel || 'Seçili mikrofon')} (devre dışı)</option>`
      );
    }
    elements.microphoneSelect.innerHTML = microphoneOptions.join('');
    elements.microphoneSelect.value = selectedId;
  }

  if (elements.cameraSelect) {
    elements.cameraSelect.innerHTML = [
      '<option value="default">Varsayılan kamera</option>',
      ...cameras.map((device, index) => (
        `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Kamera ${index + 1}`)}</option>`
      ))
    ].join('');
    elements.cameraSelect.value = appSettings.system.cameraDeviceId || 'default';
  }
}

async function refreshMediaDevices({ requestLabels = false } = {}) {
  if (deviceRefreshInProgress || !navigator.mediaDevices?.enumerateDevices) {
    renderDeviceOptions([]);
    return;
  }

  deviceRefreshInProgress = true;
  try {
    let devices = await navigator.mediaDevices.enumerateDevices();
    const labelsHidden = devices.some((device) => !device.label);
    const needsSelectedMicrophoneLabel = appSettings.system.microphoneDeviceId !== 'default'
      && !appSettings.system.microphoneDeviceLabel;
    if ((requestLabels || needsSelectedMicrophoneLabel) && labelsHidden && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: requestLabels
      }).catch(() => null);
      stream?.getTracks?.().forEach((track) => track.stop());
      devices = await navigator.mediaDevices.enumerateDevices();
    }
    const selectedMicrophone = devices.find((device) => (
      device.kind === 'audioinput'
      && device.deviceId === appSettings.system.microphoneDeviceId
      && device.label
    ));
    if (selectedMicrophone && !appSettings.system.microphoneDeviceLabel) {
      const settings = await api.updateSettings({
        system: {
          microphoneDeviceLabel: selectedMicrophone.label,
          microphoneEndpointId: ''
        }
      });
      applySettings(settings);
    }
    renderDeviceOptions(devices);
  } finally {
    deviceRefreshInProgress = false;
  }
}

function applyLanguageText() {
  document.querySelectorAll('.settings-nav[data-settings-section]').forEach((button) => {
    const label = button.querySelector('.settings-nav-label');
    if (!label) {
      return;
    }
    label.textContent = t(`settings.${button.dataset.settingsSection}`, label.textContent);
  });
}

function settingsFingerprint(settings) {
  return JSON.stringify(settings);
}

function contentExtrasKey(settings) {
  return [
    settings?.content?.showDownloadSpeed === true ? 1 : 0,
    settings?.content?.showPing === true ? 1 : 0,
    settings?.content?.showHeadphoneBattery === true ? 1 : 0
  ].join(':');
}

function applySettings(settings, options = {}) {
  const previous = appSettings;
  const nextSettings = normalizeSettings(settings);
  const fingerprint = settingsFingerprint(nextSettings);
  if (!options.force && fingerprint === lastSettingsFingerprint) {
    return;
  }

  const menuChanged = JSON.stringify(previous?.appearance?.menuOrder) !== JSON.stringify(nextSettings.appearance.menuOrder)
    || JSON.stringify(previous?.features) !== JSON.stringify(nextSettings.features)
    || previous?.appearance?.language !== nextSettings.appearance.language;
  const featuresPanelChanged = menuChanged;
  const themeChanged = previous?.appearance?.colorTheme !== nextSettings.appearance.colorTheme
    || JSON.stringify(previous?.appearance?.customTheme) !== JSON.stringify(nextSettings.appearance.customTheme)
    || previous?.appearance?.notchStyle !== nextSettings.appearance.notchStyle
    || previous?.appearance?.cornerRadius !== nextSettings.appearance.cornerRadius
    || previous?.appearance?.compactWidth !== nextSettings.appearance.compactWidth
    || previous?.appearance?.compactHeight !== nextSettings.appearance.compactHeight;
  const extrasChanged = contentExtrasKey(previous) !== contentExtrasKey(nextSettings);
  const contentChanged = JSON.stringify(previous?.content) !== JSON.stringify(nextSettings.content)
    || JSON.stringify(previous?.system?.screenVideo) !== JSON.stringify(nextSettings.system?.screenVideo);

  lastSettingsFingerprint = fingerprint;
  appSettings = nextSettings;
  applyTheme();
  syncCompactStripTransparency();
  applyLanguageText();
  syncExternalAppsVisibility();
  if (elements.languageSelect && elements.languageSelect.value !== appSettings.appearance.language) {
    elements.languageSelect.value = appSettings.appearance.language;
  }
  document.querySelectorAll('[data-setting-toggle]').forEach((button) => {
    const enabled = readPath(appSettings, button.dataset.settingToggle) !== false;
    button.classList.toggle('is-on', enabled);
  });

  document.querySelectorAll('[data-setting-select]').forEach((select) => {
    select.value = readPath(appSettings, select.dataset.settingSelect) || select.value;
  });

  const idleTransparencyEnabled = appSettings.appearance.transparentCompactStrip === true;
  document.querySelectorAll('[data-idle-transparency-option]').forEach((node) => {
    node.classList.toggle('is-setting-disabled', !idleTransparencyEnabled);
    node.querySelectorAll('input, select, button').forEach((control) => {
      control.disabled = !idleTransparencyEnabled;
    });
  });

  document.querySelectorAll('[data-advanced-setting]').forEach((node) => {
    node.hidden = appSettings.appearance.settingsMode === 'compact';
  });

  document.querySelectorAll('[data-setting-visibility]').forEach((node) => {
    const key = node.dataset.settingVisibility;
    node.dataset.hiddenBySetting = appSettings.appearance[key] === false ? 'true' : 'false';
  });

  document.querySelectorAll('[data-setting-value]').forEach((button) => {
    const currentValue = readPath(appSettings, button.dataset.settingValue);
    button.classList.toggle('is-current', currentValue === button.dataset.value);
  });

  syncFloatingVariantControls();
  if (options.force || contentChanged) {
    renderContentSettings();
  }
  if (options.force || previous?.system?.microphoneDeviceId !== nextSettings.system.microphoneDeviceId
    || previous?.system?.cameraDeviceId !== nextSettings.system.cameraDeviceId) {
    renderDeviceSelections();
  }
  if (options.force || extrasChanged) {
    refreshNetworkExtras().catch(() => {});
  } else {
    renderContentExtras();
  }
  if (options.force || menuChanged) {
    renderMenu();
    applyControlStates(lastControlState);
  }
  if (options.force || featuresPanelChanged) {
    renderFeatureSettings();
  }
  if (options.force || SHOW_EXTERNAL_APPS) {
    renderExternalApps();
  }
  if (options.force || themeChanged) {
    renderThemeControls();
  }
  updateMenuDots();
  updateClock();
  updateDynamicMediaMode();
  if (activeToolView === 'batteryDetail') {
    renderBatteryDetail();
  }
  if (activeToolView === 'ramCleaner') {
    refreshRamCleaner().catch(() => {});
  }
  filterSettingsSearch();
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
    } else if (stateKey === 'brightness') {
      tile.classList.toggle('is-unknown', itemState.level == null && itemState.enabled == null);
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

function loadNotes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

function loadPomodoro() {
  try {
    const parsed = JSON.parse(localStorage.getItem(POMODORO_STORAGE_KEY) || '{}');
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid pomodoro state');
    }

    return {
      mode: parsed.mode === 'break' ? 'break' : 'focus',
      running: parsed.running === true,
      focusMinutes: Math.max(1, Math.min(120, Number(parsed.focusMinutes) || 25)),
      breakMinutes: Math.max(1, Math.min(60, Number(parsed.breakMinutes) || 5)),
      remainingSeconds: Math.max(0, Math.min(7200, Number(parsed.remainingSeconds) || 25 * 60)),
      updatedAt: Number(parsed.updatedAt) || Date.now()
    };
  } catch {
    return {
      mode: 'focus',
      running: false,
      focusMinutes: 25,
      breakMinutes: 5,
      remainingSeconds: 25 * 60,
      updatedAt: Date.now()
    };
  }
}

function savePomodoro() {
  localStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify({
    ...pomodoro,
    updatedAt: Date.now()
  }));
}

function pomodoroDurationSeconds(mode = pomodoro.mode) {
  return (mode === 'break' ? pomodoro.breakMinutes : pomodoro.focusMinutes) * 60;
}

function formatDuration(seconds) {
  const bounded = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(bounded / 60);
  const rest = bounded % 60;
  return `${pad2(minutes)}:${pad2(rest)}`;
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
  const tone = appSettings.appearance.alarmTone || 'classic';
  const toneMap = {
    classic: { first: 880, second: 660, gain: 0.18, duration: 0.36 },
    soft: { first: 523, second: 659, gain: 0.1, duration: 0.42 },
    urgent: { first: 1046, second: 784, gain: 0.22, duration: 0.28 }
  };
  const selected = toneMap[tone] || toneMap.classic;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(selected.first, now);
  oscillator.frequency.setValueAtTime(selected.second, now + 0.14);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(selected.gain, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + selected.duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + selected.duration);
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

function renderPomodoro() {
  if (elements.pomodoroTime) {
    elements.pomodoroTime.textContent = formatDuration(pomodoro.remainingSeconds);
  }

  if (elements.pomodoroMode) {
    elements.pomodoroMode.textContent = pomodoro.mode === 'break' ? 'Mola' : 'Odak';
  }

  document.querySelectorAll('[data-pomodoro-toggle]').forEach((button) => {
    button.textContent = pomodoro.running ? 'Duraklat' : 'Başlat';
  });
}

function resetPomodoro(mode = pomodoro.mode) {
  pomodoro = {
    ...pomodoro,
    mode,
    running: false,
    remainingSeconds: pomodoroDurationSeconds(mode),
    updatedAt: Date.now()
  };
  savePomodoro();
  renderPomodoro();
  updateClock();
}

function updatePomodoroTick() {
  if (!pomodoro.running) {
    renderPomodoro();
    return;
  }

  const elapsed = Math.max(1, Math.floor((Date.now() - pomodoro.updatedAt) / 1000));
  pomodoro.remainingSeconds = Math.max(0, pomodoro.remainingSeconds - elapsed);
  pomodoro.updatedAt = Date.now();

  if (pomodoro.remainingSeconds <= 0) {
    pomodoro.mode = pomodoro.mode === 'focus' ? 'break' : 'focus';
    pomodoro.remainingSeconds = pomodoroDurationSeconds(pomodoro.mode);
    pomodoro.running = false;
    setToast(pomodoro.mode === 'break' ? 'Odak tamamlandı, mola zamanı.' : 'Mola bitti, odak zamanı.');
  }

  savePomodoro();
  renderPomodoro();
  updateClock();
}

function renderNotes() {
  if (!elements.notesList) {
    return;
  }

  if (!notes.length) {
    elements.notesList.innerHTML = '<div class="tool-empty">Henüz not yok.</div>';
    return;
  }

  elements.notesList.innerHTML = notes.map((note) => `
    <div class="note-row">
      <span>${escapeHtml(note.text)}</span>
      <button type="button" data-note-delete="${escapeHtml(note.id)}" title="Sil" aria-label="Notu sil">Sil</button>
    </div>
  `).join('');
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
  const rawLevel = Number(state?.level);
  const level = Math.max(0, Math.min(100, Number.isFinite(rawLevel) ? rawLevel : 100));
  elements.brightnessSlider.disabled = !available;
  elements.brightnessSlider.value = String(level);
  elements.brightnessSlider.setAttribute('aria-valuenow', String(level));
  elements.brightnessValue.textContent = available ? `${level}%` : '--%';
  elements.brightnessMessage.textContent = state?.message || 'Parlaklık durumu okunamadı.';
}

async function updateBrightness(level) {
  if (!elements.brightnessSlider) {
    return;
  }

  const requested = Math.max(0, Math.min(100, Number(level) || 0));
  elements.brightnessValue.textContent = `${requested}%`;
  elements.brightnessSlider.value = String(requested);

  try {
    const result = await api.setBrightness(requested);
    const ok = result?.ok === true || result?.available === true;
    const nextLevel = Math.max(0, Math.min(100, Number(result?.level ?? requested) || 0));
    elements.brightnessSlider.disabled = !ok;
    elements.brightnessSlider.value = String(nextLevel);
    elements.brightnessSlider.setAttribute('aria-valuenow', String(nextLevel));
    elements.brightnessValue.textContent = ok ? `${nextLevel}%` : '--%';
    elements.brightnessMessage.textContent = result?.message
      || (ok ? 'Parlaklık değiştirildi.' : 'Parlaklık değiştirilemedi.');
  } catch (error) {
    elements.brightnessMessage.textContent = error.message || 'Parlaklık değiştirilemedi.';
  }
}

function renderRamCleaner(snapshot, message) {
  if (!elements.ramCleanUsage) {
    return;
  }

  const usage = snapshot?.usage == null ? '--%' : `${snapshot.usage}%`;
  const used = snapshot?.usedMb == null ? '-- MB' : `${snapshot.usedMb} MB`;
  const free = snapshot?.freeMb == null ? '-- MB' : `${snapshot.freeMb} MB`;
  elements.ramCleanUsage.textContent = usage;
  elements.ramCleanUsed.textContent = used;
  elements.ramCleanFree.textContent = free;
  if (elements.ramCleanMessage && message) {
    elements.ramCleanMessage.textContent = message;
  }
}

async function refreshRamCleaner() {
  try {
    const snapshot = await api.getRamSnapshot();
    renderRamCleaner(snapshot, 'Boşaltılabilir çalışma belleklerini temizler.');
  } catch (error) {
    renderRamCleaner(null, error.message || 'RAM bilgisi okunamadı.');
  }
}

async function runRamCleaner() {
  if (elements.ramCleanButton) {
    elements.ramCleanButton.disabled = true;
    elements.ramCleanButton.textContent = 'Temizleniyor...';
  }
  try {
    const result = await api.cleanRam();
    renderRamCleaner(result?.after || result?.before, result?.message || 'RAM temizleme tamamlandı.');
    setToast(result?.message || 'RAM temizlendi.');
    const metrics = await api.getMetrics();
    if (metrics) {
      renderMetrics(metrics);
    }
  } catch (error) {
    if (elements.ramCleanMessage) {
      elements.ramCleanMessage.textContent = error.message || 'RAM temizlenemedi.';
    }
    setToast(error.message || 'RAM temizlenemedi.');
  } finally {
    if (elements.ramCleanButton) {
      elements.ramCleanButton.disabled = false;
      elements.ramCleanButton.textContent = 'RAM temizle';
    }
  }
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

  elements.focusState.textContent = state.enabled ? 'Rahatsız etmeyin açık' : 'Bildirimler açık';
  elements.focusDetail.textContent = state.enabled
    ? 'Windows hızlı ayarındaki bildirim anahtarı kapalı. Tekrar basınca açılır.'
    : 'Windows hızlı ayarındaki bildirim anahtarı açık. Tekrar basınca rahatsız etmeyin açılır.';
}

function renderNotificationCenter() {
  if (!elements.notificationCenterList) {
    return;
  }

  if (!notificationCenterItems.length) {
    elements.notificationCenterList.innerHTML = '<div class="tool-empty">Henüz bildirim yok.</div>';
    return;
  }

  elements.notificationCenterList.innerHTML = notificationCenterItems.slice(0, 12).map((notification) => {
    const id = notificationItemId(notification);
    const createdAt = Number(notification.createdAt || 0);
    const time = createdAt ? new Date(createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '--:--';
    return `
      <article class="notification-row">
        <div class="notification-row-content">
          <strong>${escapeHtml(notification.title || notification.app || 'Bildirim')}</strong>
          <span>${escapeHtml(notification.message || notification.app || '')}</span>
        </div>
        <div class="notification-row-side">
          <time>${escapeHtml(time)}</time>
          <button class="notification-dismiss" type="button" data-notification-dismiss="${escapeHtml(id)}" title="Kaldır" aria-label="Bildirimi kaldır">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </article>
    `;
  }).join('');
}

async function refreshNotificationCenter() {
  try {
    const result = await api.getNotifications();
    notificationCenterItems = Array.isArray(result?.notifications) ? result.notifications : notificationCenterItems;
  } catch {
    // Keep cached notifications if the native helper is unavailable.
  }
  renderNotificationCenter();
}

function renderCalendar() {
  if (!elements.calendarPanel) {
    return;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (firstDay.getDay() + 6) % 7;
  const cells = [];

  for (let index = 0; index < leading; index += 1) {
    cells.push('<span class="is-muted"></span>');
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(`<span class="${day === today ? 'is-today' : ''}">${day}</span>`);
  }

  elements.calendarPanel.innerHTML = `
    <div class="calendar-heading">
      <strong>${TURKISH_MONTHS[month]} ${year}</strong>
      <span>${TURKISH_WEEKDAYS[now.getDay()]}, ${pad2(today)}.${pad2(month + 1)}.${year}</span>
    </div>
    <div class="calendar-weekdays">
      <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
    </div>
    <div class="calendar-grid">${cells.join('')}</div>
  `;
}

function renderBatteryDetail() {
  if (!elements.batteryDetailPanel) {
    return;
  }

  const battery = lastControlState?.batterySaver;
  elements.batteryDetailPanel.innerHTML = `
    <div class="detail-hero">
      <strong>${escapeHtml(battery?.label || 'Bilinmiyor')}</strong>
      <span>${escapeHtml(battery?.detail || 'Güç durumu okunamadı.')}</span>
    </div>
    <div class="detail-grid">
      <span>Mod</span><strong>${battery?.enabled ? 'Tasarruf' : 'Standart'}</strong>
      <span>Kaynak</span><strong>${escapeHtml(battery?.detail?.startsWith('Plan:') ? 'Güç planı' : 'Windows')}</strong>
    </div>
    <button class="primary-action" type="button" data-battery-toggle>Değiştir</button>
  `;
}

function renderWeather() {
  if (!elements.weatherSummary || !elements.weatherForecast) {
    return;
  }

  if (!weatherState) {
    elements.weatherSummary.innerHTML = '<div class="tool-empty">Hava durumu bekleniyor.</div>';
    elements.weatherForecast.innerHTML = '';
    return;
  }

  if (!weatherState.ok) {
    elements.weatherSummary.innerHTML = `<div class="tool-empty">${escapeHtml(weatherState.message || 'Hava durumu alınamadı.')}</div>`;
    elements.weatherForecast.innerHTML = '';
    return;
  }

  elements.weatherSummary.innerHTML = `
    <div class="weather-hero">
      <strong>${weatherState.temperature}°</strong>
      <div>
        <span>${escapeHtml(weatherState.city)} ${escapeHtml(weatherState.country || '')}</span>
        <small>${escapeHtml(weatherState.label)} · Hissedilen ${weatherState.feelsLike}° · Nem %${weatherState.humidity} · Rüzgar ${weatherState.wind} km/s</small>
      </div>
    </div>
  `;

  elements.weatherForecast.innerHTML = (weatherState.daily || []).map((day) => `
    <div class="weather-day">
      <strong>${new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })}</strong>
      <span>${day.max}° / ${day.min}°</span>
      <small>${escapeHtml(day.label)}</small>
    </div>
  `).join('');
}

async function refreshWeather() {
  const city = elements.weatherCity?.value?.trim() || appSettings.system.weatherCity || 'Istanbul';
  if (elements.weatherCity) {
    elements.weatherCity.value = city;
  }

  weatherState = null;
  renderWeather();
  try {
    weatherState = await api.getWeather(city);
    if (weatherState?.ok) {
      const settings = await api.updateSettings({
        system: {
          weatherCity: city
        }
      });
      appSettings = normalizeSettings(settings);
    }
  } catch (error) {
    weatherState = {
      ok: false,
      message: error.message || 'Hava durumu alınamadı.'
    };
  }
  renderWeather();
}

async function openExternalApp(appId) {
  const app = EXTERNAL_APPS.find((item) => item.id === appId);
  if (!app?.launchTarget) {
    return;
  }

  const result = await api.openExternalApp(app.launchTarget);
  setToast(result?.message || (result?.ok ? `${app.name} açıldı` : `${app.name} açılamadı`));
}

async function updateIntegration(appId, patch) {
  const settings = await api.updateSettings({
    integrations: {
      [appId]: patch
    }
  });
  applySettings(settings);
  if (activeIntegrationModalApp === appId) {
    renderIntegrationModalBody(appId);
  }
}

async function toggleIntegrationConnection(appId) {
  const app = EXTERNAL_APPS.find((item) => item.id === appId);
  const current = appSettings.integrations[appId];
  if (!app || !current) {
    return;
  }

  if (!current.connected) {
    openIntegrationModal(appId);
    return;
  }

  try {
    const result = await api.disconnectIntegration(appId);
    if (result?.settings) {
      applySettings(result.settings);
    }
    setToast(result?.message || `${app.name} bağlantısı kapatıldı.`);
  } catch (error) {
    setToast(error.message || `${app.name} bağlantısı kapatılamadı.`);
  }
}

async function toggleIntegrationEvent(appId, eventId) {
  const current = appSettings.integrations[appId];
  if (!current || !eventId) {
    return;
  }

  await updateIntegration(appId, {
    events: {
      [eventId]: current.events?.[eventId] === false
    }
  });
}

function renderAppInfo(info) {
  lastAppInfo = info || null;
  const fallbackName = 'Windows Notch Overlay';
  const fallbackVersion = '0.1.1';
  const fallbackDescription = 'Windows için dinamik çentik overlay; hızlı kontroller, sistem durumları, medya, alarm ve arama araçlarını tek panelde toplar.';

  if (elements.appName) {
    elements.appName.textContent = info?.name || fallbackName;
  }

  if (elements.appVersion) {
    elements.appVersion.textContent = `Sürüm ${info?.version || fallbackVersion}`;
  }

  if (elements.appDescription) {
    elements.appDescription.textContent = info?.description || fallbackDescription;
  }

  if (elements.appVersionStat) {
    elements.appVersionStat.textContent = `Sürüm ${info?.version || fallbackVersion}`;
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
  if (elements.toolHeaderAction) {
    elements.toolHeaderAction.hidden = true;
    delete elements.toolHeaderAction.dataset.toolHeaderAction;
  }

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

  if (viewName === 'pomodoro') {
    elements.toolTitle.textContent = 'Pomodoro';
    elements.toolSubtitle.textContent = 'Odak ve mola sayacı';
    renderPomodoro();
    return;
  }

  if (viewName === 'notes') {
    elements.toolTitle.textContent = 'Notlar';
    elements.toolSubtitle.textContent = 'Kısa not defteri';
    renderNotes();
    setTimeout(() => elements.noteInput?.focus(), 80);
    return;
  }

  if (viewName === 'brightness') {
    elements.toolTitle.textContent = t('tools.brightness', 'Parlaklık');
    elements.toolSubtitle.textContent = 'Donanım veya yazılımsal karartma';
    refreshBrightness().catch(() => {
      elements.brightnessMessage.textContent = 'Parlaklık durumu okunamadı.';
    });
    return;
  }

  if (viewName === 'ramCleaner') {
    elements.toolTitle.textContent = t('tools.ramCleaner', 'RAM temizleyici');
    elements.toolSubtitle.textContent = 'Çalışma belleğini boşalt';
    refreshRamCleaner().catch(() => {});
    return;
  }

  if (viewName === 'volumeMixer') {
    elements.toolTitle.textContent = 'Ses mikseri';
    elements.toolSubtitle.textContent = 'Uygulama bazlı ses';
    if (elements.toolHeaderAction) {
      elements.toolHeaderAction.hidden = false;
      elements.toolHeaderAction.dataset.toolHeaderAction = 'refreshAudioMixer';
    }
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

  if (viewName === 'notifications') {
    elements.toolTitle.textContent = 'Bildirim merkezi';
    elements.toolSubtitle.textContent = 'Son Windows bildirimleri';
    refreshNotificationCenter();
    return;
  }

  if (viewName === 'calendar') {
    elements.toolTitle.textContent = 'Takvim';
    elements.toolSubtitle.textContent = 'Bugün ve ay görünümü';
    renderCalendar();
    return;
  }

  if (viewName === 'weather') {
    elements.toolTitle.textContent = 'Hava durumu';
    elements.toolSubtitle.textContent = 'Şehir bazlı kısa tahmin';
    refreshWeather();
    return;
  }

  if (viewName === 'batteryDetail') {
    elements.toolTitle.textContent = 'Pil detayı';
    elements.toolSubtitle.textContent = 'Güç tasarrufu ve plan durumu';
    renderBatteryDetail();
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
  document.querySelectorAll('[data-tool-view]').forEach((view) => {
    view.hidden = true;
  });
  elements.notch.classList.add('is-expanded');
  api.showControls();
  updateDynamicMediaMode();
}

function resetOverlayUiState() {
  isSettingsOpen = false;
  isToolOpen = false;
  activeToolView = '';
  mediaMenuOverride = false;
  elements.toolPanel.hidden = true;
  elements.settingsPanel.hidden = true;
  document.querySelectorAll('[data-tool-view]').forEach((view) => {
    view.hidden = true;
  });
  elements.notch.classList.remove('is-expanded', 'is-settings', 'is-tool', 'is-collapsing', 'is-media', 'is-alarm', 'is-video');
  setMediaMode(false);
  setAlarmMode(false);
}

function showSettingsSection(sectionName) {
  const selected = sectionName === 'home' ? 'general' : (sectionName || 'general');
  activeSettingsSection = selected;
  if (elements.settingsSearchInput) {
    elements.settingsSearchInput.value = '';
  }
  const titleMap = {
    general: t('settings.general', 'Genel'),
    content: t('settings.content', 'İndirmeler'),
    theme: t('settings.theme', 'Tema Ayarları'),
    quick: t('settings.quick', 'Hızlı menüler'),
    external: t('settings.external', 'Harici Uygulamalar'),
    privacy: t('settings.privacy', 'Gizlilik'),
    system: t('settings.system', 'Sistem'),
    about: t('settings.about', 'Hakkında'),
    'theme-custom': 'Tema Özelleştir'
  };

  document.querySelectorAll('.settings-nav[data-settings-section]').forEach((button) => {
    const navSection = button.dataset.settingsSection;
    const isCurrent = navSection === selected || (selected === 'theme-custom' && navSection === 'theme');
    button.classList.toggle('is-current', isCurrent);
  });

  document.querySelectorAll('[data-section-panel]').forEach((panel) => {
    panel.classList.toggle('is-visible', panel.dataset.sectionPanel === selected);
  });

  elements.settingsHeading.textContent = titleMap[selected] || 'Ayarlar';
  if (elements.settingsScroll) {
    elements.settingsScroll.scrollTop = 0;
  }
  if (selected === 'privacy') {
    refreshMediaDevices().catch(() => {});
  }
  filterSettingsSearch();
}

function filterSettingsSearch() {
  const query = String(elements.settingsSearchInput?.value || '').trim().toLocaleLowerCase('tr-TR');
  const hasQuery = query.length > 0;

  document.querySelectorAll('[data-section-panel]').forEach((panel) => {
    panel.dataset.searchHidden = 'false';
    if (!hasQuery) {
      return;
    }

    const text = panel.textContent.toLocaleLowerCase('tr-TR');
    const matched = text.includes(query);
    panel.dataset.searchHidden = matched ? 'false' : 'true';
    panel.classList.toggle('is-visible', matched);
  });

  if (!hasQuery) {
    document.querySelectorAll('[data-section-panel]').forEach((panel) => {
      panel.classList.toggle('is-visible', panel.dataset.sectionPanel === activeSettingsSection);
    });
    elements.settingsHeading.textContent = activeSettingsSection === 'theme-custom'
      ? 'Tema Özelleştir'
      : (document.querySelector(`.settings-nav[data-settings-section="${activeSettingsSection}"] .settings-nav-label`)?.textContent || 'Ayarlar');
    return;
  }

  elements.settingsHeading.textContent = 'Arama sonuçları';
}

function openSettingsView() {
  if (!IS_STANDALONE_SETTINGS_WINDOW && appSettings.system.settingsOpenMode === 'window') {
    api.openSettingsPreferred();
    return;
  }

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
  if (!IS_STANDALONE_SETTINGS_WINDOW) {
    api.showSettings();
  }
  showSettingsSection('general');
}

function closeSettingsView() {
  if (IS_STANDALONE_SETTINGS_WINDOW) {
    api.closeCurrentWindow();
    return;
  }

  isSettingsOpen = false;
  elements.notch.classList.remove('is-settings');
  elements.settingsPanel.hidden = true;
  elements.notch.classList.add('is-expanded');
  api.showControls();
  updateDynamicMediaMode();
}

function enterStandaloneSettingsWindow() {
  isSettingsOpen = true;
  isToolOpen = false;
  elements.toolPanel.hidden = true;
  elements.settingsPanel.hidden = false;
  elements.notch.classList.add('is-expanded', 'is-settings', 'is-standalone-settings');
  elements.notch.classList.remove('is-tool');
  setMediaMode(false);
  setAlarmMode(false);
  showSettingsSection('general');
}

function syncOverlayMode(mode) {
  if (mode !== 'controls') {
    closeInlineVideoStage();
  }

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
    showSettingsSection('general');
    return;
  }

  if (mode === 'controls') {
    isSettingsOpen = false;
    if (!isToolOpen) {
      activeToolView = '';
      elements.toolPanel.hidden = true;
      elements.notch.classList.remove('is-tool');
    }
    elements.settingsPanel.hidden = true;
    elements.notch.classList.remove('is-settings');
    elements.notch.classList.add('is-expanded');
    if (isToolOpen) {
      elements.notch.classList.add('is-tool');
    }
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
    elements.notch.classList.remove('is-expanded', 'is-settings', 'is-tool', 'is-collapsing');
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

function confirmPrivacyAction(action) {
  if (action === 'camera') {
    return window.confirm('Kamera gizlilik izni değiştirilecek. Devam edilsin mi?');
  }

  return true;
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

  if (action === 'pomodoro') {
    openToolView('pomodoro');
    return;
  }

  if (action === 'notes') {
    openToolView('notes');
    return;
  }

  if (action === 'brightness') {
    openToolView('brightness');
    return;
  }

  if (action === 'ram-cleaner') {
    openToolView('ramCleaner');
    return;
  }

  if (action === 'volume-mixer') {
    openToolView('volumeMixer');
    return;
  }

  if (action === 'notification-center') {
    openToolView('notifications');
    return;
  }

  if (action === 'calendar') {
    openToolView('calendar');
    return;
  }

  if (action === 'weather') {
    openToolView('weather');
    return;
  }

  if (action === 'battery-detail') {
    openToolView('batteryDetail');
    return;
  }

  if (!confirmPrivacyAction(action)) {
    setToast('İşlem iptal edildi');
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
  const EXPAND_HOVER_DELAY_MS = 160;
  const COLLAPSE_SYNC_DELAY_MS = 40;

  elements.notch.addEventListener('mouseenter', () => {
    if (IS_STANDALONE_SETTINGS_WINDOW) {
      return;
    }

    revealCompactStrip();
    clearTimeout(collapseTimer);
    clearTimeout(expandTimer);
    if (isSettingsOpen || isToolOpen) {
      return;
    }

    // Kısa dokunuşlarda pencere büyüyüp şerit kaymasın diye hover niyeti bekle.
    expandTimer = setTimeout(() => {
      api.expand();
      requestAnimationFrame(() => {
        if (isSettingsOpen || isToolOpen) {
          return;
        }
        elements.notch.classList.add('is-expanded');
        updateDynamicMediaMode();
      });
    }, EXPAND_HOVER_DELAY_MS);
  });

  elements.notch.addEventListener('mouseleave', () => {
    if (IS_STANDALONE_SETTINGS_WINDOW) {
      return;
    }

    // Tool/ayar açıkken hover kaybı paneli kapatmasın (slider sürüklerken vb.).
    if (isSettingsOpen || isToolOpen || activeToolView || elements.notch.classList.contains('is-video')) {
      return;
    }

    clearTimeout(collapseTimer);
    clearTimeout(expandTimer);
    mediaMenuOverride = false;
    setMediaMode(false);
    setAlarmMode(false);

    const wasExpanded = elements.notch.classList.contains('is-expanded');
    if (!wasExpanded) {
      scheduleCompactStripTransparency();
      api.collapse();
      return;
    }

    elements.notch.classList.add('is-collapsing');
    api.collapse();
    collapseTimer = setTimeout(() => {
      if (isSettingsOpen || isToolOpen || activeToolView) {
        elements.notch.classList.remove('is-collapsing');
        return;
      }
      elements.notch.classList.remove('is-expanded', 'is-collapsing');
      scheduleCompactStripTransparency();
    }, COLLAPSE_SYNC_DELAY_MS);
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

  elements.noteForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = elements.noteInput.value.trim();
    if (!text) {
      return;
    }

    notes = [{
      id: String(Date.now()),
      text,
      createdAt: Date.now()
    }, ...notes].slice(0, 12);
    saveNotes();
    elements.noteInput.value = '';
    renderNotes();
  });

  elements.notesList?.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-note-delete]');
    if (!deleteButton) {
      return;
    }

    notes = notes.filter((note) => note.id !== deleteButton.dataset.noteDelete);
    saveNotes();
    renderNotes();
  });

  elements.notificationCenterList?.addEventListener('click', async (event) => {
    const dismissButton = event.target.closest('[data-notification-dismiss]');
    if (!dismissButton) {
      return;
    }

    const id = dismissButton.dataset.notificationDismiss;
    notificationCenterItems = notificationCenterItems.filter((notification) => notificationItemId(notification) !== id);
    renderNotificationCenter();
    try {
      await api.dismissNotification(id);
    } catch {
      // Local dismissal still keeps the panel tidy if the native side is unavailable.
    }
  });

  document.querySelector('[data-pomodoro-toggle]')?.addEventListener('click', () => {
    pomodoro.running = !pomodoro.running;
    pomodoro.updatedAt = Date.now();
    savePomodoro();
    renderPomodoro();
    updateClock();
  });

  document.querySelector('[data-pomodoro-reset]')?.addEventListener('click', () => {
    resetPomodoro();
  });

  document.querySelectorAll('[data-pomodoro-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      pomodoro.focusMinutes = Number(button.dataset.pomodoroPreset) || 25;
      resetPomodoro('focus');
    });
  });

  document.querySelector('[data-pomodoro-break]')?.addEventListener('click', () => {
    resetPomodoro('break');
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
    const level = Number(elements.brightnessSlider.value) || 0;
    elements.brightnessValue.textContent = `${level}%`;
    elements.brightnessSlider.setAttribute('aria-valuenow', String(level));
  });

  elements.brightnessSlider.addEventListener('change', async () => {
    try {
      await updateBrightness(elements.brightnessSlider.value);
    } catch (error) {
      setToast(error.message || 'Parlaklık değiştirilemedi');
    }
  });

  elements.ramCleanButton?.addEventListener('click', () => {
    runRamCleaner().catch(() => {});
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

  elements.toolHeaderAction?.addEventListener('click', () => {
    if (elements.toolHeaderAction.dataset.toolHeaderAction === 'refreshAudioMixer') {
      refreshAudioMixer();
    }
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

  document.querySelector('[data-weather-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    refreshWeather().catch((error) => {
      setToast(error.message || 'Hava durumu yenilenemedi');
    });
  });

  elements.batteryDetailPanel?.addEventListener('click', async (event) => {
    if (!event.target.closest('[data-battery-toggle]')) {
      return;
    }

    try {
      await runQuickAction('battery');
      renderBatteryDetail();
    } catch (error) {
      setToast(error.message || 'Güç tasarrufu değiştirilemedi');
    }
  });

  elements.settingsSearchInput?.addEventListener('input', () => {
    filterSettingsSearch();
  });

  [elements.externalAppsList, elements.externalAppsSettingsList].forEach((list) => {
    list.addEventListener('click', async (event) => {
      const configButton = event.target.closest('[data-integration-config]');
      if (configButton) {
        openIntegrationModal(configButton.dataset.integrationConfig);
        return;
      }

      const connectButton = event.target.closest('[data-integration-connect]');
      if (connectButton) {
        await toggleIntegrationConnection(connectButton.dataset.integrationConnect);
        return;
      }

      const eventButton = event.target.closest('[data-integration-event]');
      if (eventButton) {
        const [appId, eventId] = eventButton.dataset.integrationEvent.split(':');
        await toggleIntegrationEvent(appId, eventId);
        return;
      }

      const appButton = event.target.closest('[data-external-app]');
      if (appButton && appButton.classList.contains('external-integration')) {
        await openExternalApp(appButton.dataset.externalApp);
      }
    });
  });

  elements.integrationModal?.addEventListener('click', async (event) => {
    const closeButton = event.target.closest('[data-close-integration-modal]');
    if (closeButton || event.target === elements.integrationModal) {
      closeIntegrationModal();
      return;
    }

    const disconnectButton = event.target.closest('[data-integration-disconnect]');
    if (disconnectButton) {
      const appId = disconnectButton.dataset.integrationDisconnect;
      try {
        const result = await api.disconnectIntegration(appId);
        if (result?.settings) {
          applySettings(result.settings);
        }
        setToast(result?.message || 'Bağlantı kesildi.');
        renderIntegrationModalBody(appId);
      } catch (error) {
        setToast(error.message || 'Bağlantı kesilemedi.');
      }
      return;
    }

    const eventButton = event.target.closest('[data-integration-event]');
    if (eventButton) {
      const [appId, eventId] = eventButton.dataset.integrationEvent.split(':');
      await toggleIntegrationEvent(appId, eventId);
    }
  });

  elements.integrationModal?.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-integration-auth-form]');
    if (!form) {
      return;
    }

    event.preventDefault();
    const appId = form.dataset.integrationAuthForm;
    const token = form.querySelector('[data-integration-token]')?.value || '';
    try {
      setToast('Hesap bağlantısı kontrol ediliyor...');
      const result = await api.connectIntegration(appId, { token });
      if (result?.settings) {
        applySettings(result.settings);
      }
      setToast(result?.message || 'Hesap bağlandı.');
      renderIntegrationModalBody(appId);
    } catch (error) {
      setToast(error.message || 'Hesap bağlanamadı.');
    }
  });

  [elements.externalAppsSettingsList, elements.integrationModal].forEach((node) => node?.addEventListener('change', async (event) => {
    const colorInput = event.target.closest('[data-integration-color]');
    if (!colorInput) {
      return;
    }

    await updateIntegration(colorInput.dataset.integrationColor, {
      accent: colorInput.value
    });
  }));

  elements.languageSelect.addEventListener('change', async () => {
    try {
      const settings = await api.updateSettings(makePatch('appearance.language', elements.languageSelect.value));
      await loadLanguage(settings.appearance.language);
      applySettings(settings);
    } catch (error) {
      setToast(error.message || 'Dil kaydedilemedi');
    }
  });

  document.querySelectorAll('[data-setting-select]').forEach((select) => {
    select.addEventListener('change', async () => {
      try {
        const value = select.dataset.settingSelect === 'appearance.compactIdleDelaySeconds'
          ? normalizeCompactIdleDelay(select.value)
          : select.value;
        const settings = await api.updateSettings(makePatch(select.dataset.settingSelect, value));
        applySettings(settings);
        if (select.dataset.settingSelect === 'appearance.mediaSource') {
          const media = await api.getMedia();
          renderMedia(media);
        }
        if (select.dataset.settingSelect === 'appearance.colorTheme' && select.value === 'custom') {
          showSettingsSection('theme-custom');
        }
      } catch (error) {
        setToast(error.message || 'Ayar kaydedilemedi');
      }
    });
  });

  document.querySelectorAll('[data-setting-range]').forEach((range) => {
    const path = range.dataset.settingRange;
    const syncPreview = () => {
      if (path === 'appearance.cornerRadius') {
        const height = normalizeCompactHeight(appSettings.appearance.compactHeight);
        const value = Math.min(normalizeCornerRadius(range.value), Math.floor(height / 2));
        const output = document.getElementById('cornerRadiusValue');
        if (output) {
          output.textContent = String(value);
        }
        elements.notch.style.setProperty('--notch-radius', `${value}px`);
        elements.notch.style.setProperty('--notch-radius-sm', `${value}px`);
        document.querySelectorAll('.corner-radius-sample').forEach((sample) => {
          sample.style.borderRadius = `${value}px`;
        });
        return;
      }

      if (path === 'appearance.compactWidth') {
        const value = normalizeCompactWidth(range.value);
        const output = document.getElementById('compactWidthValue');
        if (output) {
          output.textContent = String(value);
        }
        elements.notch.style.setProperty('--compact-width', `${value}px`);
        document.querySelectorAll('.corner-radius-sample').forEach((sample) => {
          sample.style.width = `${Math.min(220, value)}px`;
        });
        return;
      }

      if (path === 'appearance.compactHeight') {
        const value = normalizeCompactHeight(range.value);
        const output = document.getElementById('compactHeightValue');
        if (output) {
          output.textContent = String(value);
        }
        elements.notch.style.setProperty('--compact-height', `${value}px`);
        const radius = Math.min(
          normalizeCornerRadius(appSettings.appearance.cornerRadius),
          Math.floor(value / 2)
        );
        elements.notch.style.setProperty('--notch-radius', `${radius}px`);
        elements.notch.style.setProperty('--notch-radius-sm', `${radius}px`);
        document.querySelectorAll('.corner-radius-sample').forEach((sample) => {
          sample.style.height = `${value}px`;
          sample.style.borderRadius = `${radius}px`;
        });
        return;
      }

      if (path === 'appearance.compactIdleOpacity') {
        const value = normalizeCompactIdleOpacity(range.value);
        const output = document.getElementById('compactIdleOpacityValue');
        if (output) {
          output.textContent = `${value}%`;
        }
        elements.notch.style.setProperty('--compact-idle-opacity', `${value}%`);
        elements.notch.style.setProperty('--compact-idle-text-opacity', String(value / 100));
      }
    };

    range.addEventListener('input', syncPreview);
    range.addEventListener('change', async () => {
      try {
        let value;
        if (path === 'appearance.cornerRadius') {
          value = Math.min(
            normalizeCornerRadius(range.value),
            Math.floor(normalizeCompactHeight(appSettings.appearance.compactHeight) / 2)
          );
        } else if (path === 'appearance.compactWidth') {
          value = normalizeCompactWidth(range.value);
        } else if (path === 'appearance.compactHeight') {
          value = normalizeCompactHeight(range.value);
        } else if (path === 'appearance.compactIdleOpacity') {
          value = normalizeCompactIdleOpacity(range.value);
        } else {
          return;
        }

        const settings = path === 'appearance.compactIdleOpacity'
          ? await api.updateSettings(makePatch(path, value))
          : await api.updateSettings({
            appearance: {
              notchStyle: appSettings.appearance.notchStyle,
              cornerRadius: path === 'appearance.cornerRadius' ? value : appSettings.appearance.cornerRadius,
              compactWidth: path === 'appearance.compactWidth' ? value : appSettings.appearance.compactWidth,
              compactHeight: path === 'appearance.compactHeight' ? value : appSettings.appearance.compactHeight
            }
          });
        applySettings(settings);
      } catch (error) {
        setToast(error.message || 'Görünüm ayarı kaydedilemedi');
      }
    });
  });

  elements.primaryWidgetSelect?.addEventListener('change', async () => {
    try {
      await updateSetting('content.primaryWidget', elements.primaryWidgetSelect.value);
    } catch (error) {
      setToast(error.message || 'İçerik ayarı kaydedilemedi');
    }
  });

  elements.microphoneSelect?.addEventListener('change', async () => {
    try {
      const selectedOption = elements.microphoneSelect.selectedOptions[0];
      const isDefault = elements.microphoneSelect.value === 'default';
      const settings = await api.updateSettings({
        system: {
          microphoneDeviceId: elements.microphoneSelect.value,
          microphoneDeviceLabel: isDefault ? '' : String(selectedOption?.textContent || '').replace(/ \(devre dışı\)$/i, ''),
          microphoneEndpointId: ''
        }
      });
      applySettings(settings);
    } catch (error) {
      setToast(error.message || 'Mikrofon seçimi kaydedilemedi');
    }
  });

  elements.cameraSelect?.addEventListener('change', async () => {
    try {
      await updateSetting('system.cameraDeviceId', elements.cameraSelect.value);
    } catch (error) {
      setToast(error.message || 'Kamera seçimi kaydedilemedi');
    }
  });

  document.querySelector('[data-refresh-devices]')?.addEventListener('click', async () => {
    try {
      await refreshMediaDevices({ requestLabels: true });
      setToast('Aygıtlar yenilendi');
    } catch (error) {
      setToast(error.message || 'Aygıtlar yenilenemedi');
    }
  });

  [elements.screenVideoUrl, elements.screenVideoOpenHotkey, elements.screenVideoCloseHotkey, elements.screenVideoWidth, elements.screenVideoHeight].forEach((input) => {
    input?.addEventListener('change', async () => {
      try {
        await saveScreenVideoSettings();
      } catch (error) {
        setToast(error.message || 'Video ayarı kaydedilemedi');
      }
    });
  });

  document.querySelector('[data-screen-video-toggle]')?.addEventListener('click', () => {
    requestInlineVideoStage();
  });

  document.querySelectorAll('[data-open-screen-video]').forEach((button) => {
    button.addEventListener('click', () => {
      requestInlineVideoStage();
    });
  });

  document.querySelector('[data-close-video-stage]')?.addEventListener('click', () => {
    closeInlineVideoStage();
    setToast('Video kapatıldı');
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

    const saveButton = event.target.closest('[data-save-settings]');
    if (saveButton) {
      setToast('Ayarlar kaydedildi');
      closeSettingsView();
      return;
    }

    const darkThemeToggle = event.target.closest('[data-dark-theme-toggle]');
    if (darkThemeToggle) {
      try {
        const current = appSettings.appearance.colorTheme || 'default';
        const nextTheme = current === 'light'
          ? (window.__lastDarkTheme || 'default')
          : 'light';
        if (current !== 'light') {
          window.__lastDarkTheme = current;
        }
        const settings = await api.updateSettings(makePatch('appearance.colorTheme', nextTheme));
        applySettings(settings);
      } catch (error) {
        setToast(error.message || 'Tema değiştirilemedi');
      }
      return;
    }

    const accentPreset = event.target.closest('[data-accent-preset]');
    if (accentPreset) {
      try {
        const accent = accentPreset.dataset.accentPreset;
        const colorTheme = appSettings.appearance.colorTheme || 'default';
        const baseColors = colorTheme === 'custom'
          ? appSettings.appearance.customTheme
          : (THEME_PRESETS[colorTheme]?.colors || DEFAULT_CUSTOM_THEME);
        const settings = await api.updateSettings({
          appearance: {
            colorTheme: 'custom',
            customTheme: {
              ...baseColors,
              active: accent,
              connected: accent
            }
          }
        });
        applySettings(settings);
      } catch (error) {
        setToast(error.message || 'Accent rengi kaydedilemedi');
      }
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
      const nextValue = readPath(appSettings, settingToggle.dataset.settingToggle) === false;
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
      return;
    }

    const aboutLink = event.target.closest('[data-about-link]');
    if (aboutLink) {
      const targets = {
        repository: lastAppInfo?.repositoryUrl || 'https://github.com/Taxperia/windows-notch-overlay',
        github: lastAppInfo?.repositoryUrl || 'https://github.com/Taxperia/windows-notch-overlay',
        homepage: lastAppInfo?.homepageUrl || lastAppInfo?.repositoryUrl || 'https://github.com/Taxperia/windows-notch-overlay',
        website: lastAppInfo?.homepageUrl || lastAppInfo?.repositoryUrl || 'https://github.com/Taxperia/windows-notch-overlay',
        releases: lastAppInfo?.releasesUrl || 'https://github.com/Taxperia/windows-notch-overlay/releases/latest'
      };
      const target = targets[aboutLink.dataset.aboutLink];
      if (!target) {
        setToast('Bağlantı bulunamadı.');
        return;
      }
      const result = await api.openExternalApp(target);
      setToast(result?.message || 'Bağlantı açıldı');
      return;
    }

    const aboutAction = event.target.closest('[data-about-action]');
    if (aboutAction?.dataset.aboutAction === 'clear-cache') {
      try {
        const result = await api.clearAppCache();
        setToast(result?.message || 'Önbellek temizlendi.');
      } catch (error) {
        setToast(error.message || 'Önbellek temizlenemedi.');
      }
      return;
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
  applySettings(appSettings, { force: true });
  resetOverlayUiState();
  showSettingsSection('home');
  bindEvents();
  if (IS_STANDALONE_SETTINGS_WINDOW) {
    enterStandaloneSettingsWindow();
  }
  updateClock();
  renderAlarmList();
  renderPomodoro();
  renderNotes();
  setDefaultAlarmTime();
  setInterval(updateClock, 1000);
  setInterval(updatePomodoroTick, 1000);
  setInterval(checkAlarms, 1000);
  setInterval(updateMediaProgress, 1000);
  setInterval(refreshNetworkExtras, 8000);
  refreshNetworkExtras().catch(() => {});

  api.onMetrics(renderMetrics);
  api.onMedia(renderMedia);
  api.onControls(applyControlStates);
  api.onSettings(async (settings) => {
    const nextSettings = normalizeSettings(settings);
    if (nextSettings.appearance.language !== appSettings.appearance.language) {
      await loadLanguage(nextSettings.appearance.language);
    }
    clearTimeout(settingsApplyTimer);
    settingsApplyTimer = setTimeout(() => {
      applySettings(nextSettings);
    }, 40);
  });
  api.onOverlayMode(syncOverlayMode);
  api.onNotification(renderNotification);
  api.onUpdateStatus(renderUpdateStatus);
  api.onScreenVideoShow(() => {
    const result = openInlineVideoStage();
    if (result?.message) {
      setToast(result.message);
    }
  });
  api.onScreenVideoHide(() => {
    closeInlineVideoStage();
  });

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
