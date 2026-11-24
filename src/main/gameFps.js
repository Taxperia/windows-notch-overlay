const koffi = require('koffi');
const { HEADER_BYTES, mappingLayout, fpsForProcess } = require('./rtssFormat');
const kernel32 = koffi.load('kernel32.dll');
const OpenFileMapping = kernel32.func('void* __stdcall OpenFileMappingW(uint32_t access, int inherit, const char16_t* name)');
const MapViewOfFile = kernel32.func('void* __stdcall MapViewOfFile(void* mapping, uint32_t access, uint32_t high, uint32_t low, size_t size)');
const UnmapViewOfFile = kernel32.func('int __stdcall UnmapViewOfFile(void* address)');
const CloseHandle = kernel32.func('int __stdcall CloseHandle(void* handle)');
const GetCurrentProcess = kernel32.func('void* __stdcall GetCurrentProcess()');
const GetTickCount = kernel32.func('uint32_t __stdcall GetTickCount()');
const ReadProcessMemory = kernel32.func('int __stdcall ReadProcessMemory(void* process, const void* address, _Out_ uint8_t* buffer, size_t size, _Out_ size_t* read)');
const FILE_MAP_READ = 0x0004;

function readBuffer(address, size) {
  const buffer = Buffer.alloc(size);
  const read = [0];
  return ReadProcessMemory(GetCurrentProcess(), address, buffer, size, read) && Number(read[0]) === size
    ? buffer : null;
}

function getGameFps(pid) {
  if (!pid) return null;
  let mapping;
  let view;
  try {
    mapping = OpenFileMapping(FILE_MAP_READ, 0, 'RTSSSharedMemoryV2');
    if (!mapping) return null;
    view = MapViewOfFile(mapping, FILE_MAP_READ, 0, 0, 0);
    if (!view) return null;
    const layout = mappingLayout(readBuffer(view, HEADER_BYTES));
    if (!layout) return null;
    const buffer = readBuffer(view, layout.bytes);
    return buffer ? fpsForProcess(buffer, pid, GetTickCount()) : null;
  } catch {
    return null;
  } finally {
    if (view) UnmapViewOfFile(view);
    if (mapping) CloseHandle(mapping);
  }
}

module.exports = { getGameFps };
