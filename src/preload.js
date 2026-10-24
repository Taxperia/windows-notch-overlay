const { contextBridge, ipcRenderer } = require('electron');

function subscribe(channel, callback) {
  const listener = (_event, payload) => callback(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

function subscribeSignal(channel, callback) {
  const listener = () => callback();
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('notch', {
  onMetrics: (callback) => subscribe('metrics:update', callback),
  onMedia: (callback) => subscribe('media:update', callback),
  onControls: (callback) => subscribe('controls:update', callback),
  onSettings: (callback) => subscribe('settings:update', callback),
  onOverlayMode: (callback) => subscribe('overlay:mode', callback),
  onPointerLeave: (callback) => subscribeSignal('overlay:pointer-leave', callback),
  onStripHover: (callback) => subscribe('overlay:strip-hover', (inside) => callback(inside === true)),
  onNotification: (callback) => subscribe('notifications:update', callback),
  onUpdateStatus: (callback) => subscribe('updates:status', callback),
  onActivity: (callback) => subscribe('activity:update', callback),
  getPrivacyState: () => ipcRenderer.invoke('privacy:get'),
  onScreenVideoShow: (callback) => subscribeSignal('screen-video:show-inline', callback),
  onScreenVideoHide: (callback) => subscribeSignal('screen-video:hide-inline', callback),
  getMetrics: () => ipcRenderer.invoke('metrics:get'),
  getMedia: () => ipcRenderer.invoke('media:get'),
  getControls: () => ipcRenderer.invoke('controls:get'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  getAppInfo: () => ipcRenderer.invoke('app:info'),
  getNotifications: () => ipcRenderer.invoke('notifications:get'),
  dismissNotification: (id) => ipcRenderer.invoke('notifications:dismiss', id),
  getWeather: (city) => ipcRenderer.invoke('weather:get', city),
  clearAppCache: () => ipcRenderer.invoke('app:clear-cache'),
  connectIntegration: (appId, credentials) => ipcRenderer.invoke('integration:connect', appId, credentials),
  disconnectIntegration: (appId) => ipcRenderer.invoke('integration:disconnect', appId),
  getIntegrationStatus: (appId) => ipcRenderer.invoke('integration:status', appId),
  updateSettings: (patch) => ipcRenderer.invoke('settings:update', patch),
  checkForUpdates: (options) => ipcRenderer.invoke('updates:check', options),
  openUpdate: (updateInfo) => ipcRenderer.invoke('updates:open', updateInfo),
  expand: () => ipcRenderer.send('overlay:expand'),
  collapse: () => ipcRenderer.send('overlay:collapse'),
  setStripRect: (rect) => ipcRenderer.send('overlay:strip-rect', rect),
  showSettings: () => ipcRenderer.send('overlay:settings'),
  openSettingsPreferred: () => ipcRenderer.send('settings:open-preferred'),
  showControls: () => ipcRenderer.send('overlay:controls'),
  showMedia: () => ipcRenderer.send('overlay:media'),
  showAlarm: () => ipcRenderer.send('overlay:alarm'),
  closeCurrentWindow: () => ipcRenderer.send('window:close-current'),
  media: (command) => ipcRenderer.invoke('media:command', command),
  quickAction: (action) => ipcRenderer.invoke('quick:action', action),
  showScreenVideo: () => ipcRenderer.invoke('screen-video:show'),
  hideScreenVideo: () => ipcRenderer.invoke('screen-video:hide'),
  toggleScreenVideo: () => ipcRenderer.invoke('screen-video:toggle'),
  getNetworkExtras: (options) => ipcRenderer.invoke('extras:network', options),
  getBrightness: () => ipcRenderer.invoke('brightness:get'),
  setBrightness: (level) => ipcRenderer.invoke('brightness:set', level),
  getRamSnapshot: () => ipcRenderer.invoke('system:ram-snapshot'),
  cleanRam: () => ipcRenderer.invoke('system:clean-ram'),
  getAudioMixer: () => ipcRenderer.invoke('audio-mixer:get'),
  setAudioSessionVolume: (sessionId, volume) => ipcRenderer.invoke('audio-mixer:set-volume', sessionId, volume),
  setAudioSessionMuted: (sessionId, muted) => ipcRenderer.invoke('audio-mixer:set-muted', sessionId, muted),
  openExternalApp: (targetPath) => ipcRenderer.invoke('external-app:open', targetPath),
  listLanguages: () => ipcRenderer.invoke('i18n:list'),
  getLanguage: (code) => ipcRenderer.invoke('i18n:get', code),
  webSearch: (query) => ipcRenderer.invoke('search:web', query)
});
