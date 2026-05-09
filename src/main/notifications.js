const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');

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
    const output = await runHelper(notificationHelperPath, args);
    const payload = JSON.parse(output);
    return {
      available: payload?.available === true,
      status: payload?.status || 'unknown',
      notifications: Array.isArray(payload?.notifications) ? payload.notifications : []
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
