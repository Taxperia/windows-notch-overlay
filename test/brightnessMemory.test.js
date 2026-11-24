const assert = require('node:assert/strict');
const test = require('node:test');
const { hasMemory, memoryAfterWrite, reconcileRead } = require('../src/main/brightnessMemory');

test('a monitor that reports the written value needs no memory', () => {
  assert.equal(hasMemory(memoryAfterWrite(100, 100)), false);
  assert.equal(hasMemory(memoryAfterWrite(50, 50)), false);
});

test('even a one-step difference from a stuck monitor is remembered', () => {
  assert.deepEqual(memoryAfterWrite(76, 75), { level: 76, reported: 75 });
});

test('a monitor stuck on an old value keeps the last requested level across restarts', () => {
  const memory = memoryAfterWrite(100, 75);
  assert.deepEqual(memory, { level: 100, reported: 75 });
  // The app restarts and the monitor still answers 75.
  assert.deepEqual(reconcileRead(75, memory), { level: 100, remembered: true, memory });
});

test('a failed read right after writing falls back to the reading taken before the write', () => {
  assert.deepEqual(memoryAfterWrite(100, null, 75), { level: 100, reported: 75 });
  assert.equal(hasMemory(memoryAfterWrite(75, null, 75)), false);
  assert.equal(hasMemory(memoryAfterWrite(100, null, null)), false);
});

test('a different hardware reading wins and clears the memory', () => {
  const memory = memoryAfterWrite(100, 75);
  const result = reconcileRead(40, memory);
  assert.equal(result.level, 40);
  assert.equal(result.remembered, false);
  assert.equal(hasMemory(result.memory), false);
});

test('missing or invalid memory leaves hardware readings untouched', () => {
  assert.equal(reconcileRead(75, null).level, 75);
  assert.equal(reconcileRead(75, { level: -1, reported: -1 }).level, 75);
  assert.equal(reconcileRead(75, { level: 'x', reported: 75 }).level, 75);
  assert.equal(reconcileRead(null, { level: 100, reported: 75 }).level, null);
});
