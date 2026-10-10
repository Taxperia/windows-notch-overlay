const path = require('node:path');
const fs = require('node:fs/promises');
const { app, safeStorage } = require('electron');

let cachedAuth;
const VALID_APP_IDS = new Set(['discord', 'github', 'youtube', 'youtube-music']);

function assertValidAppId(appId) {
  if (!VALID_APP_IDS.has(appId)) {
    throw new Error('Bilinmeyen entegrasyon kimliği.');
  }
}

function authPath() {
  return path.join(app.getPath('userData'), 'integration-auth.json');
}

function canEncrypt() {
  try {
    return safeStorage.isEncryptionAvailable();
  } catch {
    return false;
  }
}

function encodeSecret(value) {
  const text = String(value || '');
  if (!text) {
    return null;
  }

  if (canEncrypt()) {
    return {
      encrypted: true,
      data: safeStorage.encryptString(text).toString('base64')
    };
  }

  throw new Error('Güvenli depolama kullanılamıyor; erişim anahtarı kaydedilmedi.');
}

function decodeSecret(entry) {
  if (!entry?.data) {
    return '';
  }

  try {
    const buffer = Buffer.from(entry.data, 'base64');
    if (entry.encrypted !== true || !canEncrypt()) {
      return '';
    }
    return safeStorage.decryptString(buffer);
  } catch {
    return '';
  }
}

async function readAuthFile() {
  if (cachedAuth) {
    return JSON.parse(JSON.stringify(cachedAuth));
  }

  try {
    const raw = await fs.readFile(authPath(), 'utf8');
    cachedAuth = JSON.parse(raw);
    let removedPlaintext = false;
    Object.keys(cachedAuth).forEach((appId) => {
      if (cachedAuth[appId]?.token && cachedAuth[appId].token.encrypted !== true) {
        delete cachedAuth[appId];
        removedPlaintext = true;
      }
    });
    if (removedPlaintext) {
      await writeAuthFile(cachedAuth);
    }
  } catch {
    cachedAuth = {};
  }

  return JSON.parse(JSON.stringify(cachedAuth));
}

async function writeAuthFile(auth) {
  cachedAuth = auth;
  const target = authPath();
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.mkdir(path.dirname(target), { recursive: true });
  try {
    await fs.writeFile(temporary, `${JSON.stringify(auth, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    await fs.rename(temporary, target);
  } finally {
    await fs.unlink(temporary).catch(() => {});
  }
}

async function saveIntegrationToken(appId, token) {
  assertValidAppId(appId);
  const auth = await readAuthFile();
  auth[appId] = {
    token: encodeSecret(token),
    updatedAt: new Date().toISOString()
  };
  await writeAuthFile(auth);
}

async function loadIntegrationToken(appId) {
  assertValidAppId(appId);
  const auth = await readAuthFile();
  return decodeSecret(auth[appId]?.token);
}

async function removeIntegrationAuth(appId) {
  assertValidAppId(appId);
  const auth = await readAuthFile();
  delete auth[appId];
  await writeAuthFile(auth);
}

async function hasIntegrationAuth(appId) {
  const token = await loadIntegrationToken(appId);
  return Boolean(token);
}

module.exports = {
  hasIntegrationAuth,
  loadIntegrationToken,
  removeIntegrationAuth,
  saveIntegrationToken
};
