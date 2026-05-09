const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { getWindowsByProcessName, sendVirtualKey } = require('./win32');

const MEDIA_KEYS = {
  previous: 0xB1,
  playPause: 0xB3,
  next: 0xB0
};

async function sendMediaCommand(command) {
  const keyCode = MEDIA_KEYS[command];
  if (!keyCode) {
    throw new Error(`Unsupported media command: ${command}`);
  }

  sendVirtualKey(keyCode);
}

function run(command, args, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    execFile(command, args, {
      windowsHide: true,
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }

      resolve(stdout.toString());
    });
  });
}

function helperPath() {
  const candidates = [
    path.join(__dirname, '..', 'helpers', 'media-session', 'publish', 'MediaSessionHelper.exe'),
    path.join(process.resourcesPath || '', 'app.asar.unpacked', 'src', 'helpers', 'media-session', 'publish', 'MediaSessionHelper.exe'),
    path.join(process.resourcesPath || '', 'src', 'helpers', 'media-session', 'publish', 'MediaSessionHelper.exe')
  ];

  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) || '';
}

function runHelper(command, timeoutMs = 2500) {
  return new Promise((resolve, reject) => {
    execFile(command, [], {
      windowsHide: true,
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }

      resolve(stdout.toString());
    });
  });
}

async function getWinRtMedia() {
  const mediaHelperPath = helperPath();
  if (!mediaHelperPath) {
    return null;
  }

  const output = await runHelper(mediaHelperPath);
  const payload = JSON.parse(output);
  if (!payload?.available) {
    return null;
  }

  const status = String(payload.status || '').toLowerCase();
  const positionMs = Math.max(0, Number(payload.positionMs) || 0);
  const durationMs = Math.max(0, Number(payload.durationMs) || 0);

  return {
    available: true,
    title: payload.title || payload.app || 'Medya',
    artist: payload.artist || payload.album || '',
    album: payload.album || '',
    status,
    app: payload.app || 'Medya',
    source: payload.source || '',
    avatarText: (payload.app || 'M').slice(0, 1).toUpperCase(),
    accent: status === 'playing' ? '#1db954' : '#2563eb',
    thumbnailDataUrl: payload.thumbnailDataUrl || '',
    durationMs,
    positionMs,
    startedAt: status === 'playing' ? Date.now() - positionMs : null
  };
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === ',' && !quoted) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function parseSpotifyTitle(windowTitle) {
  const title = String(windowTitle || '').trim();
  const generic = !title
    || title === 'N/A'
    || /^Spotify/i.test(title);

  if (generic) {
    return {
      available: true,
      title: 'Spotify',
      artist: '',
      status: 'open'
    };
  }

  const [artist, ...titleParts] = title.split(' - ');
  if (titleParts.length) {
    return {
      available: true,
      title: titleParts.join(' - ').trim() || title,
      artist: artist.trim(),
      status: 'playing'
    };
  }

  return {
    available: true,
    title,
    artist: 'Spotify',
    status: 'playing'
  };
}

let lastTrackKey = '';
let trackStartedAt = Date.now();

async function getCurrentMedia() {
  try {
    const winRtMedia = await getWinRtMedia();
    if (winRtMedia) {
      return winRtMedia;
    }
  } catch {
    // Fall back to Spotify window title if WinRT metadata is unavailable.
  }

  try {
    const windows = getWindowsByProcessName('Spotify.exe');
    if (!windows.length) {
      const output = await run('tasklist.exe', ['/fo', 'csv', '/fi', 'IMAGENAME eq Spotify.exe']);
      const isRunning = output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map(parseCsvLine)
        .some((columns) => /spotify\.exe/i.test(columns[0] || ''));

      if (isRunning) {
        return {
          available: true,
          title: 'Spotify',
          artist: '',
          status: 'open',
          app: 'Spotify',
          avatarText: 'S',
          accent: '#1db954',
          durationMs: 0,
          positionMs: 0,
          startedAt: trackStartedAt
        };
      }

      return {
        available: false,
        title: '',
        artist: '',
        status: 'not-running'
      };
    }

    const candidates = windows.map((window) => parseSpotifyTitle(window.title));
    const parsed = candidates.find((candidate) => candidate.status === 'playing') || candidates[0];
    const trackKey = `${parsed.artist}::${parsed.title}::${parsed.status}`;
    if (trackKey !== lastTrackKey) {
      lastTrackKey = trackKey;
      trackStartedAt = Date.now();
    }

    const durationMs = parsed.status === 'playing' ? 180000 : 0;
    const positionMs = durationMs ? Math.min(Date.now() - trackStartedAt, durationMs) : 0;

    return {
      ...parsed,
      app: 'Spotify',
      avatarText: 'S',
      accent: '#1db954',
      durationMs,
      positionMs,
      startedAt: trackStartedAt
    };
  } catch {
    return {
      available: false,
      title: '',
      artist: '',
      status: 'unavailable'
    };
  }
}

module.exports = {
  getCurrentMedia,
  sendMediaCommand
};
