// Ayrı medya penceresi için kısıtlı köprü: yalnızca medya, tema ayarları ve pencere işlemleri.
const { contextBridge, ipcRenderer } = require('electron');

function subscribe(channel, callback) {
  const listener = (_event, payload) => callback(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('mediaWindow', {
  getMedia: () => ipcRenderer.invoke('media:get'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  command: (command, extra) => ipcRenderer.invoke('media:command', command, extra),
  onMedia: (callback) => subscribe('media:update', callback),
  onSettings: (callback) => subscribe('settings:update', callback),
  togglePin: () => ipcRenderer.invoke('media-window:toggle-pin'),
  close: () => ipcRenderer.send('media-window:close'),
  resizeStart: (edge) => ipcRenderer.send('media-window:resize-start', edge),
  resizeEnd: () => ipcRenderer.send('media-window:resize-end')
});
