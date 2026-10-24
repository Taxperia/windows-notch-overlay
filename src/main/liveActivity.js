const { spawn } = require('node:child_process');
const path = require('node:path');
const { powerMonitor } = require('electron');

const { getDefaultRenderEndpoint } = require('./coreAudio');
const { getCapabilityUsers, getPowerStatus } = require('./win32');

const SYSTEM_ROOT = process.env.SystemRoot || 'C:\\Windows';
const POWERSHELL_PATH = path.join(SYSTEM_ROOT, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
const AUDIO_POLL_MS = 300;
const PRIVACY_POLL_MS = 2000;
const BATTERY_POLL_MS = 60 * 1000;
const LOW_BATTERY_LEVELS = [20, 10];
const BRIGHTNESS_UNSUPPORTED_EXIT_MS = 5000;
const BRIGHTNESS_RESTART_LIMIT = 3;
const BRIGHTNESS_WATCH_SCRIPT = [
  "$ErrorActionPreference = 'Stop'",
  'Register-WmiEvent -Namespace root\\wmi -Class WmiMonitorBrightnessEvent -SourceIdentifier NotchBrightness | Out-Null',
  'while ($true) { $evt = Wait-Event -SourceIdentifier NotchBrightness; [Console]::Out.WriteLine([int]$evt.SourceEventArgs.NewEvent.Brightness); [Console]::Out.Flush(); Remove-Event -EventIdentifier $evt.EventIdentifier }'
].join('; ');

const DISABLED_OPTIONS = Object.freeze({
  volume: false,
  brightness: false,
  audioOutput: false,
  power: false,
  privacy: false
});

function uniqueNames(users) {
  return [...new Set(users.map((user) => user.name).filter(Boolean))].sort((left, right) => left.localeCompare(right, 'tr'));
}

function createLiveActivityMonitor({ emit, readHeadphoneBattery, supportsBrightnessEvents }) {
  let options = { ...DISABLED_OPTIONS };
  let audioTimer = null;
  let privacyTimer = null;
  let batteryTimer = null;
  let lastEndpoint = null;
  let privacyState = { camera: [], microphone: [] };
  let privacyPrimed = false;
  let brightnessProcess = null;
  let brightnessRestarts = 0;
  let brightnessUnsupported = false;
  let brightnessSupportCheck = null;
  let brightnessSupported = false;
  let powerListenersAttached = false;
  const notifiedLowBatteryLevels = new Set();

  function emitAudioOutput(deviceId) {
    let endpoint;
    try {
      endpoint = getDefaultRenderEndpoint();
    } catch {
      return;
    }
    if (!endpoint.available || endpoint.id !== deviceId) {
      return;
    }

    emit({
      type: 'audio-output',
      deviceId,
      name: endpoint.name || 'Ses çıkışı',
      headphones: endpoint.headphones,
      level: endpoint.level,
      muted: endpoint.muted
    });

    if (endpoint.headphones && typeof readHeadphoneBattery === 'function') {
      Promise.resolve(readHeadphoneBattery())
        .then((battery) => {
          const percent = Number.parseInt(battery, 10);
          if (Number.isInteger(percent) && percent >= 0 && percent <= 100 && lastEndpoint?.id === deviceId) {
            emit({ type: 'audio-output-battery', deviceId, battery: percent });
          }
        })
        .catch(() => {});
    }
  }

  function pollAudio() {
    let endpoint;
    try {
      endpoint = getDefaultRenderEndpoint({ includeDetails: false });
    } catch {
      return;
    }

    const previous = lastEndpoint;
    lastEndpoint = endpoint.available ? endpoint : null;
    if (!previous || !lastEndpoint) {
      return;
    }

    if (endpoint.id !== previous.id) {
      if (options.audioOutput) {
        emitAudioOutput(endpoint.id);
      }
      return;
    }

    if (options.volume && (endpoint.level !== previous.level || endpoint.muted !== previous.muted)) {
      emit({ type: 'volume', level: endpoint.level, muted: endpoint.muted });
    }
  }

  function readPrivacyUsers() {
    return {
      camera: uniqueNames(getCapabilityUsers('webcam')),
      microphone: uniqueNames(getCapabilityUsers('microphone'))
    };
  }

  function pollPrivacy() {
    let next;
    try {
      next = readPrivacyUsers();
    } catch {
      return;
    }

    if (JSON.stringify(next) === JSON.stringify(privacyState)) {
      privacyPrimed = true;
      return;
    }

    const previous = privacyState;
    privacyState = next;
    emit({
      type: 'privacy',
      camera: next.camera,
      microphone: next.microphone,
      started: privacyPrimed
        ? {
          camera: next.camera.filter((name) => !previous.camera.includes(name)),
          microphone: next.microphone.filter((name) => !previous.microphone.includes(name))
        }
        : { camera: [], microphone: [] }
    });
    privacyPrimed = true;
  }

  function emitPowerChange() {
    if (!options.power) {
      return;
    }

    const status = getPowerStatus();
    if (!status.available || !status.hasBattery) {
      return;
    }

    if (status.onAc) {
      notifiedLowBatteryLevels.clear();
    }
    emit({ type: 'power', charging: status.onAc, percent: status.percent });
  }

  function checkLowBattery() {
    const status = getPowerStatus();
    if (!status.available || !status.hasBattery) {
      return;
    }

    if (status.onAc) {
      notifiedLowBatteryLevels.clear();
      return;
    }

    const level = LOW_BATTERY_LEVELS
      .filter((threshold) => status.percent <= threshold && !notifiedLowBatteryLevels.has(threshold))
      .sort((left, right) => left - right)[0];
    if (level === undefined) {
      return;
    }

    LOW_BATTERY_LEVELS
      .filter((threshold) => threshold >= level)
      .forEach((threshold) => notifiedLowBatteryLevels.add(threshold));
    emit({ type: 'battery-low', percent: status.percent });
  }

  function startBrightnessWatcher() {
    if (brightnessProcess || brightnessUnsupported || brightnessSupportCheck || !options.brightness) {
      return;
    }

    if (!brightnessSupported) {
      brightnessSupportCheck = Promise.resolve()
        .then(() => (typeof supportsBrightnessEvents === 'function' ? supportsBrightnessEvents() : true))
        .catch(() => false)
        .then((supported) => {
          brightnessSupportCheck = null;
          brightnessSupported = supported === true;
          brightnessUnsupported = !brightnessSupported;
          startBrightnessWatcher();
        });
      return;
    }

    const startedAt = Date.now();
    const child = spawn(POWERSHELL_PATH, [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      BRIGHTNESS_WATCH_SCRIPT
    ], {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'ignore']
    });
    brightnessProcess = child;

    let pending = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      const lines = `${pending}${chunk}`.split(/\r?\n/);
      pending = lines.pop().slice(-16);
      lines.forEach((line) => {
        const level = Number.parseInt(line, 10);
        if (Number.isInteger(level) && level >= 0 && level <= 100) {
          emit({ type: 'brightness', level });
        }
      });
    });
    child.on('error', () => {});
    child.on('exit', () => {
      if (brightnessProcess !== child) {
        return;
      }

      brightnessProcess = null;
      if (Date.now() - startedAt < BRIGHTNESS_UNSUPPORTED_EXIT_MS) {
        brightnessUnsupported = true;
        return;
      }
      if (options.brightness && brightnessRestarts < BRIGHTNESS_RESTART_LIMIT) {
        brightnessRestarts += 1;
        setTimeout(startBrightnessWatcher, 5000 * brightnessRestarts);
      }
    });
  }

  function stopBrightnessWatcher() {
    const child = brightnessProcess;
    brightnessProcess = null;
    if (child && child.exitCode === null) {
      child.kill();
    }
  }

  function attachPowerListeners() {
    if (powerListenersAttached) {
      return;
    }

    powerMonitor.on('on-ac', emitPowerChange);
    powerMonitor.on('on-battery', emitPowerChange);
    powerListenersAttached = true;
  }

  function configure(nextOptions = {}) {
    options = Object.fromEntries(
      Object.keys(DISABLED_OPTIONS).map((key) => [key, nextOptions[key] === true])
    );

    const needsAudio = options.volume || options.audioOutput;
    if (needsAudio && !audioTimer) {
      pollAudio();
      audioTimer = setInterval(pollAudio, AUDIO_POLL_MS);
    } else if (!needsAudio && audioTimer) {
      clearInterval(audioTimer);
      audioTimer = null;
      lastEndpoint = null;
    }

    if (options.privacy && !privacyTimer) {
      privacyPrimed = false;
      pollPrivacy();
      privacyTimer = setInterval(pollPrivacy, PRIVACY_POLL_MS);
    } else if (!options.privacy && privacyTimer) {
      clearInterval(privacyTimer);
      privacyTimer = null;
      privacyState = { camera: [], microphone: [] };
      emit({ type: 'privacy', camera: [], microphone: [], started: { camera: [], microphone: [] } });
    }

    if (options.power) {
      attachPowerListeners();
      if (!batteryTimer) {
        checkLowBattery();
        batteryTimer = setInterval(checkLowBattery, BATTERY_POLL_MS);
      }
    } else if (batteryTimer) {
      clearInterval(batteryTimer);
      batteryTimer = null;
    }

    if (options.brightness) {
      startBrightnessWatcher();
    } else {
      stopBrightnessWatcher();
    }
  }

  function getPrivacyState() {
    return {
      camera: [...privacyState.camera],
      microphone: [...privacyState.microphone]
    };
  }

  function stop() {
    configure(DISABLED_OPTIONS);
  }

  return {
    configure,
    getPrivacyState,
    stop
  };
}

module.exports = {
  createLiveActivityMonitor
};
