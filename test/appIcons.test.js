const assert = require('node:assert/strict');
const test = require('node:test');
const { createExecutableIconReader, createIconCache, isSafeIconDataUrl } = require('../src/main/appIcons');

const PNG = 'data:image/png;base64,iVBORw0KGgo=';
const fakeImage = (dataUrl) => ({ isEmpty: () => !dataUrl, toDataURL: () => dataUrl });

test('executable icons are read once per path and cached case-insensitively', async () => {
  const calls = [];
  const read = createExecutableIconReader(async (target, options) => {
    calls.push([target, options.size]);
    return fakeImage(PNG);
  });
  assert.equal(await read('C:\\Apps\\Discord.exe'), PNG);
  assert.equal(await read('c:\\apps\\discord.EXE'), PNG);
  assert.deepEqual(calls, [['C:\\Apps\\Discord.exe', 'large']]);
});

test('missing, non-executable, failing or unsafe icons fall back to an empty value', async () => {
  const read = createExecutableIconReader(async (target) => {
    if (target.includes('broken')) throw new Error('no icon');
    if (target.includes('empty')) return fakeImage('');
    return fakeImage('data:text/html;base64,PHNjcmlwdD4=');
  });
  assert.equal(await read(''), '');
  assert.equal(await read('C:\\Windows\\System32\\AudioSrv.dll'), '');
  assert.equal(await read('C:\\broken.exe'), '');
  assert.equal(await read('C:\\empty.exe'), '');
  assert.equal(await read('C:\\html.exe'), '');
});

test('icon data URLs are restricted to inline images', () => {
  assert.equal(isSafeIconDataUrl(PNG), true);
  assert.equal(isSafeIconDataUrl('data:image/x-icon;base64,AAABAA=='), true);
  assert.equal(isSafeIconDataUrl('data:image/svg+xml;base64,PHN2Zz4='), false);
  assert.equal(isSafeIconDataUrl('data:image/png;base64,AAA" onerror="x'), false);
  assert.equal(isSafeIconDataUrl('https://example.invalid/icon.png'), false);
});

test('the icon cache evicts the oldest entries beyond its limit', () => {
  const cache = createIconCache(2);
  cache.set('a', 1);
  cache.set('b', 2);
  cache.set('c', 3);
  assert.equal(cache.has('a'), false);
  assert.equal(cache.size, 2);
});

test('audio sessions get their process icon, system sounds get the mixer icon', async () => {
  const { addSessionIcons, SYSTEM_SOUNDS_ICON_SOURCE } = require('../src/main/appIcons');
  const requested = [];
  const mixer = await addSessionIcons({
    available: true,
    sessions: [
      { id: 'a', name: 'Sistem sesleri', systemSounds: true, pid: null },
      { id: 'b', name: 'Discord', pid: 42 },
      { id: 'c', name: 'Gone', pid: 77 },
      { id: 'd', name: 'Unknown', pid: null }
    ]
  }, {
    getProcessPath: (pid) => {
      if (pid === 77) throw new Error('exited');
      return pid === 42 ? 'C:\\Apps\\Discord.exe' : '';
    },
    iconForExecutable: async (source) => {
      requested.push(source);
      return source ? PNG : '';
    }
  });
  assert.deepEqual(mixer.sessions.map((session) => Boolean(session.iconDataUrl)), [true, true, false, false]);
  assert.deepEqual(requested, [SYSTEM_SOUNDS_ICON_SOURCE, 'C:\\Apps\\Discord.exe', '', '']);
  assert.deepEqual(await addSessionIcons({ available: false, sessions: [] }, {}), { available: false, sessions: [] });
});
