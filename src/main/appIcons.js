// Uygulama ikonları: exe dosyasının Windows'ta görünen ikonu (ses mikseri) ve
// bildirim gönderen uygulamaların logoları için ortak önbellek ve doğrulama.
const path = require('node:path');

const SYSTEM_ROOT = process.env.SystemRoot || 'C:\\Windows';
const SYSTEM_SOUNDS_ICON_SOURCE = path.join(SYSTEM_ROOT, 'System32', 'SndVol.exe');
const MAX_CACHE_ENTRIES = 200;
const MAX_ICON_DATA_URL_LENGTH = 256 * 1024;
const ICON_DATA_URL_PATTERN = /^data:image\/(?:png|jpeg|gif|bmp|webp|x-icon);base64,[A-Za-z0-9+/]+={0,2}$/;

function isSafeIconDataUrl(value) {
  return typeof value === 'string'
    && value.length <= MAX_ICON_DATA_URL_LENGTH
    && ICON_DATA_URL_PATTERN.test(value);
}

function createIconCache(limit = MAX_CACHE_ENTRIES) {
  const entries = new Map();
  return {
    has: (key) => entries.has(key),
    get: (key) => entries.get(key),
    set(key, value) {
      entries.delete(key);
      entries.set(key, value);
      while (entries.size > limit) {
        entries.delete(entries.keys().next().value);
      }
      return value;
    },
    get size() {
      return entries.size;
    }
  };
}

// getFileIcon Electron'a bağlıdır; testlerde sahte bir sürüm verilebilsin diye dışarıdan alınır.
function createExecutableIconReader(getFileIcon, cache = createIconCache()) {
  return function iconForExecutable(executablePath) {
    const target = String(executablePath || '').trim();
    if (!target || !/\.exe$/i.test(target)) {
      return Promise.resolve('');
    }

    const key = target.toLowerCase();
    if (!cache.has(key)) {
      cache.set(key, Promise.resolve()
        .then(() => getFileIcon(target, { size: 'large' }))
        .then((image) => {
          const dataUrl = image && !image.isEmpty() ? image.toDataURL() : '';
          return isSafeIconDataUrl(dataUrl) ? dataUrl : '';
        })
        .catch(() => ''));
    }
    return cache.get(key);
  };
}

// Ses mikseri oturumlarına sürecin exe ikonunu ekler; "Sistem sesleri" için Windows ses mikserinin ikonu kullanılır.
async function addSessionIcons(mixer, { getProcessPath, iconForExecutable }) {
  if (!mixer?.available || !Array.isArray(mixer.sessions)) {
    return mixer;
  }

  const sessions = await Promise.all(mixer.sessions.map(async (session) => {
    let source = '';
    if (session.systemSounds) {
      source = SYSTEM_SOUNDS_ICON_SOURCE;
    } else if (session.pid) {
      try {
        source = getProcessPath(session.pid);
      } catch {
        source = '';
      }
    }
    const iconDataUrl = await iconForExecutable(source);
    return iconDataUrl ? { ...session, iconDataUrl } : session;
  }));
  return { ...mixer, sessions };
}

module.exports = {
  SYSTEM_SOUNDS_ICON_SOURCE,
  addSessionIcons,
  createExecutableIconReader,
  createIconCache,
  isSafeIconDataUrl
};
