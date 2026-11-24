const assert = require('node:assert/strict');
const Module = require('node:module');
const { mock, test } = require('node:test');

const mediaPath = require.resolve('../src/main/media');
const loadModule = Module._load;
const win32Mock = mock.method(Module, '_load', function loadWithoutWindowsBindings(request, parent, isMain) {
  if (request === './win32' && parent?.filename === mediaPath) {
    return {};
  }
  return loadModule.call(this, request, parent, isMain);
});

let mediaModule;
try {
  mediaModule = require(mediaPath);
} finally {
  win32Mock.mock.restore();
}

const { normalizeMediaCommand, normalizeWinRtMedia } = mediaModule;

test('media commands are allow-listed and seek positions are validated', () => {
  assert.deepEqual(normalizeMediaCommand('playPause'), { name: 'playPause', args: [] });
  assert.deepEqual(normalizeMediaCommand('shuffle'), { name: 'shuffle', args: [] });
  assert.deepEqual(normalizeMediaCommand('repeat'), { name: 'repeat', args: [] });
  assert.deepEqual(normalizeMediaCommand('seek', { positionMs: 61234.6 }), { name: 'seek', args: ['--position=61235'] });
  assert.throws(() => normalizeMediaCommand('seek', { positionMs: -1 }));
  assert.throws(() => normalizeMediaCommand('seek', { positionMs: 'abc' }));
  assert.throws(() => normalizeMediaCommand('seek', {}));
  assert.throws(() => normalizeMediaCommand('--command=next'));
  assert.throws(() => normalizeMediaCommand('volume'));
});

test('helper payloads expose shuffle, repeat and capability flags safely', () => {
  const media = normalizeWinRtMedia({
    app: 'Spotify',
    title: 'TAPA TOMA',
    artist: 'Dj Samir',
    status: 'Playing',
    durationMs: 104000,
    positionMs: 1000,
    shuffle: true,
    repeat: 'track',
    canShuffle: true,
    canRepeat: true,
    canSeek: true
  });
  assert.equal(media.status, 'playing');
  assert.equal(media.shuffle, true);
  assert.equal(media.repeat, 'track');
  assert.equal(media.canSeek, true);
  assert.equal(media.canPrevious, true);

  const unknown = normalizeWinRtMedia({ app: 'Other', status: 'paused', repeat: 'forever', shuffle: 'yes', canSeek: true });
  assert.equal(unknown.repeat, null);
  assert.equal(unknown.shuffle, null);
  assert.equal(unknown.canSeek, false, 'Seeking needs a known duration');
});
