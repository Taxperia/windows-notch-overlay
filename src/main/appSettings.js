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
    colorTheme: 'default',
    customTheme: {
      panel: '#0a0c10',
      surface: '#171b22',
      text: '#f4f7fb',
      active: '#0f766e',
      connected: '#2563eb'
    },
    notchStyle: 'attached',
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
      'network',
      'alarms',
      'search'
    ]
  },
  system: {
    startWithWindows: false,
    softwareBrightnessLevel: 100
  },
  updates: {
    autoCheck: false
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
    network: true,
    alarms: true,
    search: true
  }
});

let cachedSettings;

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeSettings(base, override) {
  const merged = clone(base);

  if (!override || typeof override !== 'object') {
    return merged;
  }

  merged.appearance = {
    ...merged.appearance,
    ...(override.appearance && typeof override.appearance === 'object' ? override.appearance : {})
  };

  merged.appearance.customTheme = {
    ...base.appearance.customTheme,
    ...(override.appearance?.customTheme && typeof override.appearance.customTheme === 'object' ? override.appearance.customTheme : {})
  };

  merged.system = {
    ...merged.system,
    ...(override.system && typeof override.system === 'object' ? override.system : {})
  };

  merged.updates = {
    ...merged.updates,
    ...(override.updates && typeof override.updates === 'object' ? override.updates : {})
  };

  merged.features = {
    ...merged.features,
    ...(override.features && typeof override.features === 'object' ? override.features : {})
  };

  return merged;
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
