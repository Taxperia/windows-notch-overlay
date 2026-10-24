const path = require('node:path');
const fs = require('node:fs/promises');
const { app } = require('electron');

const DEFAULT_SETTINGS = Object.freeze({
  version: 1,
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
    customTheme: {
      panel: '#0a0c10',
      surface: '#171b22',
      text: '#f4f7fb',
      active: '#0f766e',
      connected: '#2563eb'
    },
    notchStyle: 'attached',
    cornerRadius: 18,
    compactWidth: 250,
    compactHeight: 34,
    menuOrder: [
      'focus-assist',
      'bluetooth',
      'microphone',
      'camera',
      'screenshot-full',
      'volume-mixer',
      'brightness',
      'dark-mode',
      'night-light',
      'battery',
      'battery-detail',
      'network',
      'notification-center',
      'calendar',
      'weather',
      'alarms',
      'search',
      'pomodoro',
      'notes',
      'ram-cleaner'
    ]
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
  liveActivities: {
    volume: true,
    brightness: true,
    audioOutput: true,
    power: true,
    privacy: true
  },
  integrations: {
    discord: {
      connected: false,
      account: '',
      lastConnectedAt: '',
      accent: '#5865f2',
      tintMenu: true,
      events: {
        dm: true,
        serverMessage: false,
        mentionInServer: true,
        mentionEverywhere: false,
        call: true
      }
    },
    github: {
      connected: false,
      account: '',
      lastConnectedAt: '',
      accent: '#2f81f7',
      tintMenu: true,
      events: {
        pullRequest: true,
        review: true,
        issue: true,
        release: false,
        actionFailed: true
      }
    },
    youtube: {
      connected: false,
      account: '',
      lastConnectedAt: '',
      accent: '#ff0033',
      tintMenu: true,
      events: {
        upload: true,
        commentLike: true,
        subscriber: true,
        mention: false,
        live: true
      }
    },
    'youtube-music': {
      connected: false,
      account: '',
      lastConnectedAt: '',
      accent: '#ff0033',
      tintMenu: true,
      events: {
        release: true,
        playlist: true,
        artistLive: true
      }
    }
  },
  features: {
    'focus-assist': true,
    bluetooth: true,
    microphone: true,
    camera: true,
    'screenshot-full': true,
    'volume-mixer': true,
    brightness: true,
    'dark-mode': true,
    'night-light': true,
    battery: true,
    'battery-detail': true,
    network: true,
    'notification-center': true,
    calendar: true,
    weather: true,
    alarms: true,
    search: true,
    pomodoro: true,
    notes: true,
    'ram-cleaner': true
  }
});

let cachedSettings;

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_SETTINGS_BYTES = 64 * 1024;
const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const LANGUAGE_PATTERN = /^[a-z0-9_-]{1,16}$/i;
const HOTKEY_PATTERN = /^[a-z0-9+\- ]{1,32}$/i;

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function mergeObject(base, override, schema = DEFAULT_SETTINGS) {
  const merged = clone(base);

  if (!isPlainObject(override) || !isPlainObject(schema)) {
    return merged;
  }

  Object.entries(override).forEach(([key, value]) => {
    if (BLOCKED_KEYS.has(key) || !Object.prototype.hasOwnProperty.call(schema, key)) {
      return;
    }

    const expected = schema[key];
    if (isPlainObject(expected)) {
      if (isPlainObject(value)) {
        merged[key] = mergeObject(merged[key], value, expected);
      }
      return;
    }

    if (Array.isArray(expected)) {
      if (Array.isArray(value)) {
        merged[key] = clone(value);
      }
      return;
    }

    if (typeof value === typeof expected && (typeof value !== 'number' || Number.isFinite(value))) {
      merged[key] = value;
    }
  });

  return merged;
}

function mergeSettings(base, override) {
  return normalizeSettings(mergeObject(base, override));
}

function clampInteger(value, minimum, maximum, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(minimum, Math.min(maximum, Math.round(parsed)));
}

function boundedString(value, fallback = '', maximumLength = 256) {
  return typeof value === 'string' ? value.trim().slice(0, maximumLength) : fallback;
}

function enumValue(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function normalizeSettings(settings) {
  const normalized = clone(settings);
  const appearance = normalized.appearance;
  const system = normalized.system;

  appearance.language = LANGUAGE_PATTERN.test(appearance.language)
    ? appearance.language
    : DEFAULT_SETTINGS.appearance.language;
  appearance.settingsMode = enumValue(appearance.settingsMode, ['compact', 'advanced'], DEFAULT_SETTINGS.appearance.settingsMode);
  appearance.mediaSource = enumValue(appearance.mediaSource, ['spotify', 'active', 'any'], DEFAULT_SETTINGS.appearance.mediaSource);
  appearance.alarmTone = enumValue(appearance.alarmTone, ['classic', 'soft', 'urgent'], DEFAULT_SETTINGS.appearance.alarmTone);
  appearance.colorTheme = enumValue(appearance.colorTheme, ['default', 'slate', 'contrast', 'light', 'forest', 'ruby', 'custom'], DEFAULT_SETTINGS.appearance.colorTheme);
  appearance.notchStyle = enumValue(appearance.notchStyle, ['attached', 'floating', 'pill', 'compact'], DEFAULT_SETTINGS.appearance.notchStyle);
  appearance.cornerRadius = clampInteger(appearance.cornerRadius, 0, 28, DEFAULT_SETTINGS.appearance.cornerRadius);
  appearance.compactWidth = clampInteger(appearance.compactWidth, 200, 420, DEFAULT_SETTINGS.appearance.compactWidth);
  appearance.compactHeight = clampInteger(appearance.compactHeight, 28, 52, DEFAULT_SETTINGS.appearance.compactHeight);
  appearance.compactIdleDelaySeconds = clampInteger(appearance.compactIdleDelaySeconds, 1, 60, DEFAULT_SETTINGS.appearance.compactIdleDelaySeconds);
  appearance.compactIdleOpacity = clampInteger(appearance.compactIdleOpacity, 20, 80, DEFAULT_SETTINGS.appearance.compactIdleOpacity);
  appearance.menuOrder = [...new Set(appearance.menuOrder.filter((item) => (
    typeof item === 'string' && DEFAULT_SETTINGS.appearance.menuOrder.includes(item)
  )))];
  DEFAULT_SETTINGS.appearance.menuOrder.forEach((item) => {
    if (!appearance.menuOrder.includes(item)) {
      appearance.menuOrder.push(item);
    }
  });
  Object.keys(DEFAULT_SETTINGS.appearance.customTheme).forEach((key) => {
    const value = appearance.customTheme[key];
    appearance.customTheme[key] = COLOR_PATTERN.test(value)
      ? value
      : DEFAULT_SETTINGS.appearance.customTheme[key];
  });

  system.weatherCity = boundedString(system.weatherCity, DEFAULT_SETTINGS.system.weatherCity, 80);
  system.settingsOpenMode = enumValue(system.settingsOpenMode, ['overlay', 'window'], DEFAULT_SETTINGS.system.settingsOpenMode);
  system.microphoneDeviceId = boundedString(system.microphoneDeviceId, 'default', 512);
  system.microphoneDeviceLabel = boundedString(system.microphoneDeviceLabel, '', 256);
  system.microphoneEndpointId = boundedString(system.microphoneEndpointId, '', 512);
  system.cameraDeviceId = boundedString(system.cameraDeviceId, 'default', 512);
  system.softwareBrightnessLevel = clampInteger(system.softwareBrightnessLevel, 0, 100, 100);
  system.screenVideo.width = clampInteger(system.screenVideo.width, 240, 1920, DEFAULT_SETTINGS.system.screenVideo.width);
  system.screenVideo.height = clampInteger(system.screenVideo.height, 135, 1080, DEFAULT_SETTINGS.system.screenVideo.height);
  system.screenVideo.url = normalizeHttpsUrl(system.screenVideo.url);
  system.screenVideo.openHotkey = HOTKEY_PATTERN.test(system.screenVideo.openHotkey)
    ? system.screenVideo.openHotkey
    : DEFAULT_SETTINGS.system.screenVideo.openHotkey;
  system.screenVideo.closeHotkey = HOTKEY_PATTERN.test(system.screenVideo.closeHotkey)
    ? system.screenVideo.closeHotkey
    : DEFAULT_SETTINGS.system.screenVideo.closeHotkey;

  Object.entries(normalized.integrations).forEach(([appId, integration]) => {
    const defaults = DEFAULT_SETTINGS.integrations[appId];
    integration.account = boundedString(integration.account, '', 128);
    integration.lastConnectedAt = boundedString(integration.lastConnectedAt, '', 64);
    integration.accent = COLOR_PATTERN.test(integration.accent) ? integration.accent : defaults.accent;
  });

  normalized.content.primaryWidget = enumValue(
    normalized.content.primaryWidget,
    ['clock', 'pomodoro'],
    DEFAULT_SETTINGS.content.primaryWidget
  );

  return normalized;
}

function normalizeHttpsUrl(value) {
  const raw = boundedString(value, '', 2048);
  if (!raw) {
    return '';
  }

  try {
    const target = new URL(raw);
    return target.protocol === 'https:' ? target.toString() : '';
  } catch {
    return '';
  }
}

async function loadSettings() {
  if (cachedSettings) {
    return clone(cachedSettings);
  }

  const target = settingsPath();
  try {
    const raw = await fs.readFile(target, 'utf8');
    if (Buffer.byteLength(raw, 'utf8') > MAX_SETTINGS_BYTES) {
      throw new Error('Ayar dosyası izin verilen boyutu aşıyor.');
    }
    cachedSettings = mergeSettings(DEFAULT_SETTINGS, JSON.parse(raw));
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      await fs.copyFile(target, `${target}.corrupt-${Date.now()}`).catch(() => {});
    }
    cachedSettings = clone(DEFAULT_SETTINGS);
    await saveSettings(cachedSettings);
  }

  return clone(cachedSettings);
}

async function saveSettings(settings) {
  cachedSettings = mergeSettings(DEFAULT_SETTINGS, settings);
  const target = settingsPath();
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.mkdir(path.dirname(target), { recursive: true });
  try {
    await fs.writeFile(temporary, `${JSON.stringify(cachedSettings, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    await fs.rename(temporary, target);
  } finally {
    await fs.unlink(temporary).catch(() => {});
  }
  return clone(cachedSettings);
}

async function updateSettings(patch) {
  if (!isPlainObject(patch)) {
    throw new TypeError('Ayar güncellemesi bir nesne olmalıdır.');
  }
  if (Buffer.byteLength(JSON.stringify(patch), 'utf8') > MAX_SETTINGS_BYTES) {
    throw new RangeError('Ayar güncellemesi çok büyük.');
  }
  const current = await loadSettings();
  return saveSettings(mergeSettings(current, patch));
}

module.exports = {
  DEFAULT_SETTINGS,
  loadSettings,
  mergeSettings,
  normalizeSettings,
  updateSettings
};
