const assert = require('node:assert/strict');
const test = require('node:test');
const { resizeBounds, resolveMediaWindowBounds } = require('../src/main/mediaWindowBounds');

const limits = { minWidth: 300, maxWidth: 960, minHeight: 150, maxHeight: 640 };
const primary = { x: 0, y: 0, width: 1920, height: 1040 };
const secondary = { x: 1920, y: 0, width: 1280, height: 984 };

test('first launch places the media window at the bottom right of the primary screen', () => {
  const bounds = resolveMediaWindowBounds({ width: 420, height: 236, positioned: false }, [primary], primary, limits);
  assert.deepEqual(bounds, { x: 1920 - 420 - 24, y: 1040 - 236 - 24, width: 420, height: 236 });
});

test('a saved position on any visible screen is restored', () => {
  const saved = { x: 2100, y: 300, width: 500, height: 260, positioned: true };
  assert.deepEqual(resolveMediaWindowBounds(saved, [primary, secondary], primary, limits), {
    x: 2100, y: 300, width: 500, height: 260
  });
});

test('a position left on a disconnected screen falls back to the primary screen', () => {
  const saved = { x: 2100, y: 300, width: 500, height: 260, positioned: true };
  const bounds = resolveMediaWindowBounds(saved, [primary], primary, limits);
  assert.equal(bounds.x, 1920 - 500 - 24);
  assert.equal(bounds.width, 500);
});

test('resizing from each edge keeps the opposite edge fixed and respects limits', () => {
  const start = { x: 100, y: 100, width: 420, height: 236 };
  assert.deepEqual(resizeBounds(start, 'se', 80, 40, limits), { x: 100, y: 100, width: 500, height: 276 });
  assert.deepEqual(resizeBounds(start, 'nw', 20, 10, limits), { x: 120, y: 110, width: 400, height: 226 });
  assert.deepEqual(resizeBounds(start, 'w', 400, 0, limits), { x: 220, y: 100, width: 300, height: 236 });
  assert.deepEqual(resizeBounds(start, 'n', 0, -1000, limits), { x: 100, y: -304, width: 420, height: 640 });
  assert.deepEqual(resizeBounds(start, 'e', 5000, 0, limits).width, 960);
});
