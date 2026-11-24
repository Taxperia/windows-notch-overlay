const assert = require('node:assert/strict');
const test = require('node:test');
const { mappingLayout, fpsForProcess } = require('../src/main/rtssFormat');

function sample({ pid = 123, time0 = 1000, time1 = 2000, frames = 144 } = {}) {
  const buffer = Buffer.alloc(32 + 2 * 284);
  [0x52545353, 0x00020014, 284, 32, 2].forEach((value, index) => buffer.writeUInt32LE(value, index * 4));
  const base = 32 + 284;
  buffer.writeUInt32LE(pid, base);
  buffer.writeUInt32LE(time0, base + 268);
  buffer.writeUInt32LE(time1, base + 272);
  buffer.writeUInt32LE(frames, base + 276);
  return buffer;
}

test('RTSS FPS belongs to the foreground PID and uses measured frames', () => {
  const buffer = sample();
  assert.equal(fpsForProcess(buffer, 123, 2200), 144);
  assert.equal(fpsForProcess(buffer, 999, 2200), null);
  assert.equal(fpsForProcess(buffer, null, 2200), null);
});

test('RTSS rejects uninitialized, stale, truncated, and malformed data', () => {
  assert.equal(mappingLayout(null), null);
  assert.equal(mappingLayout(Buffer.alloc(20)), null);
  assert.equal(fpsForProcess(sample(), 123, 8000), null);
  assert.equal(fpsForProcess(sample({ time0: 0 }), 123, 2200), null);
  assert.equal(fpsForProcess(sample({ time0: 2000 }), 123, 2200), null);
  assert.equal(fpsForProcess(sample().subarray(0, 100), 123, 2200), null);
  const buffer = sample();
  buffer.writeUInt32LE(0xffffffff, 12);
  assert.equal(mappingLayout(buffer), null);
  buffer.writeUInt32LE(32, 12);
  buffer.writeUInt32LE(0xffffffff, 16);
  assert.equal(mappingLayout(buffer), null);
});

test('RTSS handles the Windows uptime counter wrapping', () => {
  assert.equal(fpsForProcess(sample({ time0: 0xffffff00, time1: 744, frames: 60 }), 123, 900), 60);
});
