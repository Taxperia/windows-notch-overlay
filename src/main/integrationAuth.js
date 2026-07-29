const path = require('node:path');
const fs = require('node:fs/promises');
const { app, safeStorage } = require('electron');

let cachedAuth;

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

  return {
    encrypted: false,
    data: Buffer.from(text, 'utf8').toString('base64')
  };
}

function decodeSecret(entry) {
  if (!entry?.data) {
    return '';
  }

  try {
    const buffer = Buffer.from(entry.data, 'base64');
    return entry.encrypted
      ? safeStorage.decryptString(buffer)
      : buffer.toString('utf8');
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
  } catch {
    cachedAuth = {};
  }

  return JSON.parse(JSON.stringify(cachedAuth));
}

async function writeAuthFile(auth) {
  cachedAuth = auth;
  await fs.mkdir(path.dirname(authPath()), { recursive: true });
  await fs.writeFile(authPath(), `${JSON.stringify(auth, null, 2)}\n`, 'utf8');
}

async function saveIntegrationToken(appId, token) {
  const auth = await readAuthFile();
  auth[appId] = {
    token: encodeSecret(token),
    updatedAt: new Date().toISOString()
  };
  await writeAuthFile(auth);
}

async function loadIntegrationToken(appId) {
  const auth = await readAuthFile();
  return decodeSecret(auth[appId]?.token);
}

async function removeIntegrationAuth(appId) {
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
