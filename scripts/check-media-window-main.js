// Run with: node_modules/.bin/electron scripts/check-media-window-main.js
// Starts the real main process with an isolated profile and exercises the detached media window end to end.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { app, BrowserWindow, screen } = require('electron');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'notch-media-main-check-'));
app.setPath('userData', profile);
require('../src/main/index.js');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitFor(check, label, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const value = await check();
    if (value) return value;
    await wait(50);
  }
  throw new Error(`Timed out waiting for ${label}`);
}
const findWindow = (page) => BrowserWindow.getAllWindows().find((window) => !window.isDestroyed() && window.webContents.getURL().includes(page));
const readSettings = () => JSON.parse(fs.readFileSync(path.join(profile, 'settings.json'), 'utf8'));

// Bazı korumalı oturumlarda Windows hiçbir pencereyi "en üstte" bildirmez; o durumda bu kontrol atlanır.
async function osReportsTopmost() {
  const probe = new BrowserWindow({ width: 80, height: 40, show: false, frame: false, skipTaskbar: true });
  await probe.loadURL('data:text/html,probe');
  probe.showInactive();
  probe.setAlwaysOnTop(true, 'floating');
  const supported = probe.isAlwaysOnTop();
  probe.destroy();
  return supported;
}

app.whenReady().then(async () => {
  try {
    const topmostSupported = await osReportsTopmost();
    if (!topmostSupported) {
      console.log('Note: this session does not report topmost windows; OS-level always-on-top assertions are skipped.');
    }
    const main = await waitFor(() => findWindow('index.html'), 'overlay window');
    await waitFor(() => !main.webContents.isLoading(), 'overlay load');
    await waitFor(() => main.webContents.executeJavaScript('Boolean(lastSettingsFingerprint)'), 'overlay init');

    const opened = await main.webContents.executeJavaScript('window.notch.toggleMediaWindow()');
    assert.equal(opened.open, true);
    const mediaWindow = await waitFor(() => findWindow('media-window.html'), 'media window');
    await waitFor(() => !mediaWindow.webContents.isLoading(), 'media window load');
    await waitFor(() => mediaWindow.isVisible(), 'media window shown');

    const area = screen.getPrimaryDisplay().workArea;
    const bounds = mediaWindow.getBounds();
    assert.deepEqual({ width: bounds.width, height: bounds.height }, { width: 420, height: 236 });
    assert.equal(bounds.x + bounds.width, area.x + area.width - 24, 'first launch sits at the bottom right');
    assert.equal((await main.webContents.executeJavaScript('window.notch.getMediaWindowState()')).alwaysOnTop, true);
    if (topmostSupported) {
      assert.equal(mediaWindow.isAlwaysOnTop(), true);
    }

    const exec = (source) => mediaWindow.webContents.executeJavaScript(source);
    assert.equal(await exec('typeof window.notch'), 'undefined', 'the media window must not get the full overlay bridge');
    const settings = await exec('window.mediaWindow.getSettings()');
    assert.equal(settings.appearance.mediaPlayerStyle, 'modern');
    const media = await exec('window.mediaWindow.getMedia()');
    assert.equal(typeof media, 'object');
    console.log(`Current media: ${media.available ? `${media.app} - ${media.title}` : media.status}`);
    assert.equal(await exec(`document.querySelector('.mp').dataset.context`), 'window');

    await waitFor(
      () => main.webContents.executeJavaScript(`document.querySelector('footer [data-toggle-media-window]').getAttribute('aria-pressed') === 'true'`),
      'overlay detach button state'
    );

    await exec(`document.querySelector('.mp-pin').click()`);
    await waitFor(() => exec(`document.querySelector('.mp-pin').getAttribute('aria-pressed') === 'false'`), 'pin button state');
    assert.equal(mediaWindow.isAlwaysOnTop(), false);
    await waitFor(() => readSettings().system.mediaWindow.alwaysOnTop === false, 'pin preference saved');

    // Resize handle protocol: without a held mouse button the main process must stop on its own.
    await exec(`window.mediaWindow.resizeStart('se')`);
    await wait(300);
    assert.deepEqual(mediaWindow.getBounds(), bounds, 'resize must stop when the mouse button is not held');

    mediaWindow.setBounds({ x: area.x + 40, y: area.y + 60, width: 520, height: 280 });
    mediaWindow.emit('moved');
    await waitFor(() => readSettings().system.mediaWindow.positioned === true, 'bounds saved', 3000);
    assert.deepEqual(
      (({ x, y, width, height }) => ({ x, y, width, height }))(readSettings().system.mediaWindow),
      { x: area.x + 40, y: area.y + 60, width: 520, height: 280 }
    );

    exec('window.mediaWindow.close()').catch(() => {});
    await waitFor(() => mediaWindow.isDestroyed(), 'media window closed');
    await waitFor(
      () => main.webContents.executeJavaScript(`document.querySelector('footer [data-toggle-media-window]').getAttribute('aria-pressed') === 'false'`),
      'overlay detach button reset'
    );

    // Reopening restores the saved position, size and pin preference.
    await main.webContents.executeJavaScript('window.notch.toggleMediaWindow()');
    const reopened = await waitFor(() => findWindow('media-window.html'), 'reopened media window');
    await waitFor(() => !reopened.webContents.isLoading(), 'reopened load');
    assert.deepEqual(reopened.getBounds(), { x: area.x + 40, y: area.y + 60, width: 520, height: 280 });
    assert.equal((await main.webContents.executeJavaScript('window.notch.getMediaWindowState()')).alwaysOnTop, false);
    const toggled = await main.webContents.executeJavaScript('window.notch.toggleMediaWindow()');
    assert.equal(toggled.open, false);

    const mixer = await main.webContents.executeJavaScript('window.notch.getAudioMixer()');
    assert.equal(typeof mixer.available, 'boolean');
    console.log(`Audio mixer: ${mixer.available ? `${mixer.sessions.length} session(s)` : mixer.message}`);

    console.log('Media window verified with the real main process: open, bridge isolation, pin, resize guard, saved bounds, reopen, close.');
    app.exit(0);
  } catch (error) {
    console.error(error);
    app.exit(1);
  }
});
