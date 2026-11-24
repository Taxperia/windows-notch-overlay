// RTSS SDK RTSSSharedMemory.h, v2 application prefix (read-only).
// https://github.com/jaxFF/RTSSTweaks/blob/master/thirdparty/rtss-sdk/Include/RTSSSharedMemory.h
const HEADER_BYTES = 20;
const APP_PREFIX_BYTES = 284;
const MAX_MAPPING_BYTES = 16 * 1024 * 1024;

function mappingLayout(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < HEADER_BYTES
    || buffer.readUInt32LE(0) !== 0x52545353
    || (buffer.readUInt32LE(4) >>> 16) !== 2) return null;
  const entrySize = buffer.readUInt32LE(8);
  const offset = buffer.readUInt32LE(12);
  const count = buffer.readUInt32LE(16);
  const bytes = offset + entrySize * count;
  if (entrySize < APP_PREFIX_BYTES || entrySize > 65536 || offset < HEADER_BYTES
    || count > 256 || bytes > MAX_MAPPING_BYTES) return null;
  return { entrySize, offset, count, bytes };
}

function fpsForProcess(buffer, pid, nowTick) {
  const layout = mappingLayout(buffer);
  if (!layout || layout.bytes > buffer.length || !Number.isInteger(pid) || pid <= 0) return null;
  for (let index = 0; index < layout.count; index += 1) {
    const base = layout.offset + index * layout.entrySize;
    if (buffer.readUInt32LE(base) !== pid) continue;
    const time0 = buffer.readUInt32LE(base + 268);
    const time1 = buffer.readUInt32LE(base + 272);
    const frames = buffer.readUInt32LE(base + 276);
    const elapsed = (time1 - time0) >>> 0;
    // RTSS entries can outlive a process or stop updating when a game is minimized.
    if (!time0 || !elapsed || elapsed > 10000 || ((nowTick - time1) >>> 0) > 5000) return null;
    const fps = 1000 * frames / elapsed;
    return Number.isFinite(fps) && fps >= 0 && fps <= 10000 ? Math.round(fps) : null;
  }
  return null;
}

module.exports = { HEADER_BYTES, mappingLayout, fpsForProcess };
