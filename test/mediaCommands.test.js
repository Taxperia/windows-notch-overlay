const assert = require('node:assert/strict');
const test = require('node:test');
const { normalizeMediaCommand, normalizeWinRtMedia } = require('../src/main/media');

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
