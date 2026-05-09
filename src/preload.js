const { contextBridge, ipcRenderer } = require('electron');

const TURKISH_WEEKDAYS = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi'
];

const TURKISH_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık'
];

function pad2(value) {
  return String(value).padStart(2, '0');
}

function updateClockElements() {
  const now = new Date();
  const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
  const compactDate = `${pad2(now.getDate())}.${pad2(now.getMonth() + 1)}.${now.getFullYear()}`;
  const longDate = `${TURKISH_WEEKDAYS[now.getDay()]}, ${pad2(now.getDate())} ${TURKISH_MONTHS[now.getMonth()]}`;

  const timeCompact = document.getElementById('timeCompact');
  const dateCompact = document.getElementById('dateCompact');
  const timeFull = document.getElementById('timeFull');
  const dateFull = document.getElementById('dateFull');

  if (timeCompact) {
    timeCompact.textContent = time;
  }

  if (dateCompact) {
    dateCompact.textContent = compactDate;
  }

  if (timeFull) {
    timeFull.textContent = time;
  }

  if (dateFull) {
    dateFull.textContent = longDate;
  }
}

function startClockFallback() {
  updateClockElements();
  setInterval(updateClockElements, 1000);
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startClockFallback, { once: true });
} else {
  startClockFallback();
}

contextBridge.exposeInMainWorld('notch', {
  onMetrics: (callback) => ipcRenderer.on('metrics:update', (_event, payload) => callback(payload)),
  onMedia: (callback) => ipcRenderer.on('media:update', (_event, payload) => callback(payload)),
  onControls: (callback) => ipcRenderer.on('controls:update', (_event, payload) => callback(payload)),
  onSettings: (callback) => ipcRenderer.on('settings:update', (_event, payload) => callback(payload)),
  onOverlayMode: (callback) => ipcRenderer.on('overlay:mode', (_event, payload) => callback(payload)),
  getMetrics: () => ipcRenderer.invoke('metrics:get'),
  getMedia: () => ipcRenderer.invoke('media:get'),
  getControls: () => ipcRenderer.invoke('controls:get'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (patch) => ipcRenderer.invoke('settings:update', patch),
  expand: () => ipcRenderer.send('overlay:expand'),
  collapse: () => ipcRenderer.send('overlay:collapse'),
  showSettings: () => ipcRenderer.send('overlay:settings'),
  showControls: () => ipcRenderer.send('overlay:controls'),
  showMedia: () => ipcRenderer.send('overlay:media'),
  showAlarm: () => ipcRenderer.send('overlay:alarm'),
  media: (command) => ipcRenderer.invoke('media:command', command),
  quickAction: (action) => ipcRenderer.invoke('quick:action', action),
  webSearch: (query) => ipcRenderer.invoke('search:web', query)
});
