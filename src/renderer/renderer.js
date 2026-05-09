const elements = {
  timeCompact: document.getElementById('timeCompact'),
  dateCompact: document.getElementById('dateCompact'),
  alarmCompact: document.getElementById('alarmCompact'),
  alarmCompactName: document.getElementById('alarmCompactName'),
  alarmCompactTime: document.getElementById('alarmCompactTime'),
  timeFull: document.getElementById('timeFull'),
  dateFull: document.getElementById('dateFull'),
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
  menuPages: document.getElementById('menuPages'),
  menuDots: document.getElementById('menuDots'),
  featureSettingsList: document.getElementById('featureSettingsList'),
  enabledFeatureCount: document.getElementById('enabledFeatureCount'),
  settingsHeading: document.getElementById('settingsHeading')
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
  updateSettings: async () => null,
  onMetrics: () => {},
  onMedia: () => {},
  onControls: () => {},
  onSettings: () => {},
  onOverlayMode: () => {},
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
  microphone: '<path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v4M8 22h8"/>'
};

const MENU_ITEMS = [
  { label: 'Odaklanma yardımı', icon: 'bell', action: 'focus-assist', stateKey: 'silent' },
  { label: 'Bluetooth', icon: 'bluetooth', action: 'bluetooth', stateKey: 'bluetooth' },
  { label: 'Mikrofon', icon: 'microphone', action: 'microphone', stateKey: 'microphone' },
  { label: 'Kamera', icon: 'camera', action: 'camera', stateKey: 'camera' },
  { label: 'Ekran görüntüsü', icon: 'screenshot', action: 'screenshot-full' },
  { label: 'Karanlık mod', icon: 'moon', action: 'dark-mode', stateKey: 'darkMode' },
  { label: 'Gece Işığı', icon: 'eye', action: 'night-light', stateKey: 'nightLight' },
  { label: 'Güç Tasarrufu', icon: 'battery', action: 'battery', stateKey: 'batterySaver' },
  { label: 'Ağ', icon: 'wifi', action: 'network', stateKey: 'network' },
  { label: 'Alarm', icon: 'alarm', action: 'alarms' },
  { label: 'Arama', icon: 'search', action: 'search' }
];

const DEFAULT_SETTINGS = {
  appearance: {
    showStatus: true,
    showMedia: true,
    compactSeconds: true
  },
  features: Object.fromEntries(MENU_ITEMS.map((item) => [item.action, true]))
};

const FEATURE_HELP = {
  'focus-assist': 'Odaklanma yardımı durumunu değiştirir.',
  bluetooth: 'Bluetooth adaptörünü aç/kapatmayı dener.',
  microphone: 'Mikrofon gizlilik iznini değiştirir.',
  camera: 'Kamera gizlilik iznini değiştirir.',
  'screenshot-full': 'Tam ekran görüntüsünü Resimler klasörüne kaydeder.',
  'dark-mode': 'Windows koyu/açık tema durumunu değiştirir.',
  'night-light': 'Gece Işığı hızlı erişimini açar.',
  battery: 'Laptopta pil tasarrufu, kasada güç tasarrufu planını yönetir.',
  network: 'Ayarlar yerine Windows ağ hızlı panelini açar.',
  alarms: 'Çentik içinde alarm oluşturur.',
  search: 'Çentik içinde arama kutusu açar.'
};

let collapseTimer;
let toastTimer;
let expandTimer;
let dragState = null;
let suppressMenuClick = false;
let isSettingsOpen = false;
let isToolOpen = false;
let appSettings = normalizeSettings(null);
let lastControlState = null;
let lastMediaState = null;
let mediaMenuOverride = false;
let alarms = loadAlarms();
let activeAlarm = null;
let alarmAutoCloseTimer;
let alarmSoundTimer;
let alarmAudioContext = null;

function pad2(value) {
  return String(value).padStart(2, '0');
}

function normalizeSettings(settings) {
  return {
    appearance: {
      ...DEFAULT_SETTINGS.appearance,
      ...(settings?.appearance || {})
    },
    features: {
      ...DEFAULT_SETTINGS.features,
      ...(settings?.features || {})
    }
  };
}

function isFeatureEnabled(action) {
  return appSettings.features[action] !== false;
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
  const theme = params.get('theme') === 'floating' ? 'floating' : 'attached';
  elements.notch.classList.toggle('theme-floating', theme === 'floating');
  elements.notch.classList.toggle('theme-attached', theme !== 'floating');
}

function setToast(message) {
  elements.toast.textContent = message || '';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.toast.textContent = '';
  }, 3200);
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

function renderMenu() {
  const visibleItems = MENU_ITEMS.filter((item) => isFeatureEnabled(item.action));
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
          <span class="tile-label">${item.label}</span>
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
  elements.featureSettingsList.innerHTML = MENU_ITEMS.map((item) => {
    const enabled = isFeatureEnabled(item.action);
    return `
      <div class="settings-row">
        <div>
          <strong>${item.label}</strong>
          <span>${FEATURE_HELP[item.action] || 'Hızlı menü öğesini gösterir.'}</span>
        </div>
        <button class="switch${enabled ? ' is-on' : ''}" data-feature-toggle="${item.action}" aria-label="${item.label}"></button>
      </div>
    `;
  }).join('');

  const enabledCount = MENU_ITEMS.filter((item) => isFeatureEnabled(item.action)).length;
  elements.enabledFeatureCount.textContent = String(enabledCount);
}

function applySettings(settings) {
  appSettings = normalizeSettings(settings);
  document.querySelectorAll('[data-setting-toggle]').forEach((button) => {
    const [section, key] = button.dataset.settingToggle.split('.');
    const enabled = appSettings[section]?.[key] !== false;
    button.classList.toggle('is-on', enabled);
  });

  document.querySelectorAll('[data-setting-visibility]').forEach((node) => {
    const key = node.dataset.settingVisibility;
    node.dataset.hiddenBySetting = appSettings.appearance[key] === false ? 'true' : 'false';
  });

  renderMenu();
  renderFeatureSettings();
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

function openToolView(viewName) {
  clearTimeout(collapseTimer);
  clearTimeout(expandTimer);
  isSettingsOpen = false;
  isToolOpen = true;
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

  elements.toolTitle.textContent = 'Arama';
  elements.toolSubtitle.textContent = 'Varsayılan tarayıcı';
  setTimeout(() => elements.searchInput.focus(), 80);
}

function closeToolView() {
  isToolOpen = false;
  elements.notch.classList.remove('is-tool');
  elements.toolPanel.hidden = true;
  elements.notch.classList.add('is-expanded');
  api.showControls();
  updateDynamicMediaMode();
}

function showSettingsSection(sectionName) {
  const selected = sectionName || 'home';
  const titleMap = {
    home: 'Giriş',
    general: 'Genel',
    quick: 'Hızlı menüler',
    privacy: 'Gizlilik',
    system: 'Sistem'
  };

  document.querySelectorAll('[data-settings-section]').forEach((button) => {
    button.classList.toggle('is-current', button.dataset.settingsSection === selected);
  });

  document.querySelectorAll('[data-section-panel]').forEach((panel) => {
    panel.classList.toggle('is-visible', panel.dataset.sectionPanel === selected);
  });

  elements.settingsHeading.textContent = titleMap[selected] || 'Ayarlar';
}

function openSettingsView() {
  clearTimeout(collapseTimer);
  clearTimeout(expandTimer);
  isSettingsOpen = true;
  isToolOpen = false;
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
  if (action === 'alarms') {
    openToolView('alarm');
    return;
  }

  if (action === 'search') {
    openToolView('search');
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
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: elements.menuPages.scrollLeft,
      moved: false,
      actionButton
    };
    elements.menuPages.setPointerCapture(event.pointerId);
    elements.menuPages.classList.add('is-dragging');
  });

  elements.menuPages.addEventListener('pointermove', (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const delta = event.clientX - dragState.startX;
    if (Math.abs(delta) > 4) {
      dragState.moved = true;
    }

    elements.menuPages.scrollLeft = dragState.startScrollLeft - delta;
  });

  elements.menuPages.addEventListener('pointerup', async (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const moved = dragState.moved;
    const actionButton = dragState.actionButton;
    dragState = null;
    elements.menuPages.classList.remove('is-dragging');
    scrollToPage(getCurrentPage());

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
    dragState = null;
    elements.menuPages.classList.remove('is-dragging');
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

  elements.settingsPanel.addEventListener('click', async (event) => {
    const nav = event.target.closest('[data-settings-section]');
    if (nav) {
      showSettingsSection(nav.dataset.settingsSection);
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

    const featureToggle = event.target.closest('[data-feature-toggle]');
    if (featureToggle) {
      try {
        await toggleFeature(featureToggle.dataset.featureToggle);
      } catch (error) {
        setToast(error.message || 'Özellik ayarı kaydedilemedi');
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

  elements.menuPages.addEventListener('scroll', updateMenuDots, { passive: true });
  bindCarouselEvents();
}

function start() {
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
  api.onSettings(applySettings);
  api.onOverlayMode(syncOverlayMode);

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

  api.getSettings().then((settings) => {
    if (settings) {
      applySettings(settings);
    }
  }).catch(() => {});
}

start();
