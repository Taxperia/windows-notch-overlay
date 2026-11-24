const assert = require('node:assert/strict');
const test = require('node:test');
const { isGameProcess, nextGameState } = require('../src/main/gameMode');

test('game detection matches executable names and explicit extra games', () => {
  assert.equal(isGameProcess('CS2.exe'), true);
  assert.equal(isGameProcess('leagueclient'), false);
  assert.equal(isGameProcess('javaw'), false);
  assert.equal(isGameProcess('my-game', 'other.exe, MY-GAME.exe; javaw.exe'), true);
  assert.equal(isGameProcess('game', 'my-game.exe'), false);
  assert.equal(isGameProcess(''), false);
});

test('game mode follows foreground focus, survives overlay focus, and exits on Alt+Tab', () => {
  const inactive = { active: false, processName: '' };
  const playing = nextGameState(inactive, { pid: 8, processName: 'cs2' }, { enabled: true }, 42);
  assert.deepEqual(playing, { active: true, processName: 'cs2' });
  assert.deepEqual(nextGameState(playing, { pid: 42, processName: 'electron' }, {}, 42), playing);
  assert.deepEqual(nextGameState(playing, { pid: 9, processName: 'chrome' }, {}, 42), inactive);
  assert.deepEqual(nextGameState(playing, { pid: 8, processName: 'cs2' }, { enabled: false }, 42), inactive);
});
