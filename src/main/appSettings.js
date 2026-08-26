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
  integrations: {
    discord: {
      connected: false,
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
      accent: '#ff0033',
      tintMenu: true,
      events: {
        upload: true,
        commentLike: true,
        subscriber: true,
        mention: false,
        live: true
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

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeObject(base, override) {
  const merged = clone(base);

  if (!isPlainObject(override)) {
    return merged;
  }

  Object.entries(override).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(merged[key])) {
      merged[key] = mergeObject(merged[key], value);
      return;
    }

    merged[key] = value;
  });

  return merged;
}

function mergeSettings(base, override) {
  return mergeObject(base, override);
}

async function loadSettings() {
  if (cachedSettings) {
    return clone(cachedSettings);
  }

  try {
    const raw = await fs.readFile(settingsPath(), 'utf8');
    cachedSettings = mergeSettings(DEFAULT_SETTINGS, JSON.parse(raw));
  } catch {
    cachedSettings = clone(DEFAULT_SETTINGS);
    await saveSettings(cachedSettings);
  }

  return clone(cachedSettings);
}

async function saveSettings(settings) {
  cachedSettings = mergeSettings(DEFAULT_SETTINGS, settings);
  await fs.mkdir(path.dirname(settingsPath()), { recursive: true });
  await fs.writeFile(settingsPath(), `${JSON.stringify(cachedSettings, null, 2)}\n`, 'utf8');
  return clone(cachedSettings);
}

async function updateSettings(patch) {
  const current = await loadSettings();
  return saveSettings(mergeSettings(current, patch));
}

module.exports = {
  DEFAULT_SETTINGS,
  loadSettings,
  updateSettings
};
