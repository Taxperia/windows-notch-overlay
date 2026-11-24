const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { createIconCache, isSafeIconDataUrl } = require('./appIcons');

function helperPath() {
  const candidates = [
    path.join(__dirname, '..', 'helpers', 'notifications', 'publish', 'NotificationHelper.exe'),
    path.join(process.resourcesPath || '', 'app.asar.unpacked', 'src', 'helpers', 'notifications', 'publish', 'NotificationHelper.exe'),
    path.join(process.resourcesPath || '', 'src', 'helpers', 'notifications', 'publish', 'NotificationHelper.exe')
  ];

  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) || '';
}

function runHelper(command, args = [], timeoutMs = 3500) {
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

// Uygulama logoları (AppUserModelId → data URL) bir kez okunur; logosu olmayan uygulamalar da boş
// değerle saklanır ki her 5 sn'lik taramada tekrar denenmesin.
const appLogoCache = createIconCache();

function appIdsWithoutLogo(notifications) {
  return [...new Set(notifications
    .map((notification) => String(notification?.appId || ''))
    .filter((appId) => appId && !appLogoCache.has(appId)))];
}

function withAppIcons(notifications) {
  return notifications.map((notification) => {
    const appIcon = appLogoCache.get(String(notification?.appId || '')) || '';
    return appIcon ? { ...notification, appIcon } : notification;
  });
}

function rememberLogos(appIds, logos) {
  appIds.forEach((appId) => {
    const logo = logos && typeof logos === 'object' ? logos[appId] : '';
    appLogoCache.set(appId, isSafeIconDataUrl(logo) ? logo : '');
  });
}

async function getNotificationSnapshot(options = {}) {
  const notificationHelperPath = helperPath();
  if (!notificationHelperPath) {
    return {
      available: false,
      status: 'missing-helper',
      notifications: []
    };
  }

  try {
    const args = options.requestAccess ? ['--request'] : [];
    let payload = JSON.parse(await runHelper(notificationHelperPath, args));
    let notifications = Array.isArray(payload?.notifications) ? payload.notifications : [];

    const missing = appIdsWithoutLogo(notifications);
    if (payload?.available === true && missing.length) {
      try {
        const withLogos = JSON.parse(await runHelper(notificationHelperPath, ['--with-logos'], 8000));
        if (withLogos?.available === true && Array.isArray(withLogos.notifications)) {
          payload = withLogos;
          notifications = withLogos.notifications;
        }
        rememberLogos(missing, withLogos?.logos);
      } catch {
        rememberLogos(missing, null);
      }
    }

    return {
      available: payload?.available === true,
      status: payload?.status || 'unknown',
      notifications: withAppIcons(notifications)
    };
  } catch {
    return {
      available: false,
      status: 'unavailable',
      notifications: []
    };
  }
}

module.exports = {
  getNotificationSnapshot
};
