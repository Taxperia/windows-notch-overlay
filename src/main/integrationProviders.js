const https = require('node:https');
const { loadSettings, updateSettings } = require('./appSettings');
const {
  hasIntegrationAuth,
  loadIntegrationToken,
  removeIntegrationAuth,
  saveIntegrationToken
} = require('./integrationAuth');

const GITHUB_API = 'https://api.github.com';

function requestJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, {
      method: options.method || 'GET',
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': 'Windows-Notch-Overlay',
        ...options.headers
      },
      timeout: options.timeout || 10000
    }, (response) => {
      let raw = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        raw += chunk;
      });
      response.on('end', () => {
        let payload = null;
        try {
          payload = raw ? JSON.parse(raw) : null;
        } catch {
          payload = raw;
        }

        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve({
            headers: response.headers,
            payload
          });
          return;
        }

        const message = payload?.message || `HTTP ${response.statusCode}`;
        reject(new Error(message));
      });
    });

    request.on('timeout', () => {
      request.destroy(new Error('Bağlantı zaman aşımına uğradı.'));
    });
    request.on('error', reject);
    request.end();
  });
}

function githubHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
    'x-github-api-version': '2022-11-28'
  };
}

async function githubGet(pathname, token) {
  const url = `${GITHUB_API}${pathname}`;
  const result = await requestJson(url, {
    headers: githubHeaders(token)
  });
  return result.payload;
}

async function verifyGitHubToken(token) {
  const user = await githubGet('/user', token);
  const notifications = await githubGet('/notifications?per_page=1', token);
  return {
    login: user?.login || 'GitHub',
    unreadCount: Array.isArray(notifications) ? notifications.length : 0
  };
}

function githubEventId(thread) {
  const type = String(thread?.subject?.type || '').toLowerCase();
  const reason = String(thread?.reason || '').toLowerCase();

  if (type === 'pullrequest') {
    return reason.includes('review') ? 'review' : 'pullRequest';
  }

  if (type === 'issue') {
    return 'issue';
  }

  if (type === 'release') {
    return 'release';
  }

  if (type.includes('check') || type.includes('workflow') || reason.includes('ci')) {
    return 'actionFailed';
  }

  return 'issue';
}

function githubThreadToNotification(thread) {
  const repoName = thread?.repository?.full_name || thread?.repository?.name || 'GitHub';
  const title = thread?.subject?.title || 'Yeni bildirim';
  const eventId = githubEventId(thread);
  return {
    id: `github:${thread?.id || repoName}:${thread?.updated_at || title}`,
    app: 'GitHub',
    integrationId: 'github',
    eventId,
    title: repoName,
    message: title,
    createdAt: Number.isFinite(Date.parse(thread?.updated_at)) ? Date.parse(thread.updated_at) : Date.now()
  };
}

function eventEnabled(settings, appId, eventId) {
  return settings?.integrations?.[appId]?.events?.[eventId] !== false;
}

async function connectIntegration(appId, credentials = {}) {
  if (appId !== 'github') {
    return {
      ok: false,
      message: 'Bu sağlayıcı için OAuth uygulama bilgileri gerekli.'
    };
  }

  const token = String(credentials.token || '').trim();
  if (!token) {
    return { ok: false, message: 'GitHub token boş.' };
  }

  const account = await verifyGitHubToken(token);
  await saveIntegrationToken(appId, token);
  const settings = await updateSettings({
    integrations: {
      github: {
        connected: true,
        account: account.login,
        lastConnectedAt: new Date().toISOString()
      }
    }
  });

  return {
    ok: true,
    appId,
    account: account.login,
    settings,
    message: `${account.login} GitHub bildirimleri bağlandı.`
  };
}

async function disconnectIntegration(appId) {
  await removeIntegrationAuth(appId);
  const settings = await updateSettings({
    integrations: {
      [appId]: {
        connected: false,
        account: '',
        lastConnectedAt: ''
      }
    }
  });

  return {
    ok: true,
    appId,
    settings,
    message: 'Bağlantı kesildi.'
  };
}

async function getIntegrationAuthStatus(appId) {
  const settings = await loadSettings();
  const integration = settings.integrations?.[appId] || {};
  return {
    appId,
    connected: integration.connected === true,
    account: integration.account || '',
    hasAuth: await hasIntegrationAuth(appId)
  };
}

async function getGitHubNotifications(settings) {
  if (settings.integrations?.github?.connected !== true) {
    return [];
  }

  const token = await loadIntegrationToken('github');
  if (!token) {
    return [];
  }

  const threads = await githubGet('/notifications?all=false&participating=false&per_page=20', token);
  if (!Array.isArray(threads)) {
    return [];
  }

  return threads
    .map(githubThreadToNotification)
    .filter((notification) => eventEnabled(settings, 'github', notification.eventId));
}

async function getIntegrationNotifications() {
  const settings = await loadSettings();
  const notifications = await getGitHubNotifications(settings).catch(() => []);
  return notifications.sort((a, b) => b.createdAt - a.createdAt);
}

module.exports = {
  connectIntegration,
  disconnectIntegration,
  getIntegrationAuthStatus,
  getIntegrationNotifications
};
