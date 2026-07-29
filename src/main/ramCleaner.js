const os = require('node:os');
const koffi = require('koffi');

const kernel32 = koffi.load('kernel32.dll');
const psapi = koffi.load('psapi.dll');

const PROCESS_QUERY_INFORMATION = 0x0400;
const PROCESS_SET_QUOTA = 0x0100;
const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;
const TH32CS_SNAPPROCESS = 0x00000002;

const PROCESSENTRY32W = koffi.struct('RamCleanerPROCESSENTRY32W', {
  dwSize: 'uint32_t',
  cntUsage: 'uint32_t',
  th32ProcessID: 'uint32_t',
  th32DefaultHeapID: 'uintptr_t',
  th32ModuleID: 'uint32_t',
  cntThreads: 'uint32_t',
  th32ParentProcessID: 'uint32_t',
  pcPriClassBase: 'long',
  dwFlags: 'uint32_t',
  szExeFile: koffi.array('char16_t', 260, 'String')
});

const CreateToolhelp32Snapshot = kernel32.func('void * __stdcall CreateToolhelp32Snapshot(uint32_t dwFlags, uint32_t th32ProcessID)');
const Process32FirstW = kernel32.func('bool __stdcall Process32FirstW(void *hSnapshot, _Inout_ RamCleanerPROCESSENTRY32W *lppe)');
const Process32NextW = kernel32.func('bool __stdcall Process32NextW(void *hSnapshot, _Inout_ RamCleanerPROCESSENTRY32W *lppe)');
const OpenProcess = kernel32.func('void * __stdcall OpenProcess(uint32_t dwDesiredAccess, bool bInheritHandle, uint32_t dwProcessId)');
const CloseHandle = kernel32.func('bool __stdcall CloseHandle(void *hObject)');
const GetCurrentProcess = kernel32.func('void * __stdcall GetCurrentProcess()');
const EmptyWorkingSet = psapi.func('bool __stdcall EmptyWorkingSet(void *hProcess)');

function roundMegabytes(bytes) {
  return Math.round((Number(bytes) || 0) / (1024 * 1024));
}

function memorySnapshot() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = Math.max(0, total - free);
  return {
    totalMb: roundMegabytes(total),
    usedMb: roundMegabytes(used),
    freeMb: roundMegabytes(free),
    usage: total ? Math.round((used / total) * 100) : null
  };
}

function listProcessIds() {
  const ids = new Set([process.pid]);
  const snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
  if (!snapshot) {
    return [...ids];
  }

  try {
    const entry = {
      dwSize: koffi.sizeof(PROCESSENTRY32W),
      cntUsage: 0,
      th32ProcessID: 0,
      th32DefaultHeapID: 0,
      th32ModuleID: 0,
      cntThreads: 0,
      th32ParentProcessID: 0,
      pcPriClassBase: 0,
      dwFlags: 0,
      szExeFile: ''
    };

    if (!Process32FirstW(snapshot, entry)) {
      return [...ids];
    }

    do {
      if (entry.th32ProcessID > 0) {
        ids.add(entry.th32ProcessID);
      }
    } while (Process32NextW(snapshot, entry));
  } catch {
    // Snapshot enumeration is best-effort.
  } finally {
    try {
      CloseHandle(snapshot);
    } catch {
      // ignore
    }
  }

  return [...ids];
}

function trimProcessWorkingSet(pid) {
  const access = PROCESS_QUERY_INFORMATION | PROCESS_SET_QUOTA | PROCESS_QUERY_LIMITED_INFORMATION;
  const handle = OpenProcess(access, false, pid);
  if (!handle) {
    return false;
  }

  try {
    return Boolean(EmptyWorkingSet(handle));
  } finally {
    CloseHandle(handle);
  }
}

function sleepSync(ms) {
  const end = Date.now() + Math.max(0, ms);
  while (Date.now() < end) {
    // short sync pause so freemem can settle
  }
}

function cleanRam() {
  const before = memorySnapshot();
  let trimmed = 0;

  try {
    if (EmptyWorkingSet(GetCurrentProcess())) {
      trimmed += 1;
    }
  } catch {
    // Current process trim is best-effort.
  }

  for (const pid of listProcessIds()) {
    try {
      if (trimProcessWorkingSet(pid)) {
        trimmed += 1;
      }
    } catch {
      // Skip protected system processes.
    }
  }

  sleepSync(150);
  const after = memorySnapshot();
  const freedMb = Math.max(0, before.usedMb - after.usedMb);

  return {
    ok: true,
    trimmed,
    freedMb,
    before,
    after,
    message: freedMb > 0
      ? `RAM temizlendi. Yaklaşık ${freedMb} MB boşaltıldı.`
      : trimmed > 0
        ? 'Çalışma kümeleri sıkıştırıldı; ek boş alan görünmeyebilir.'
        : 'RAM temizleme bu oturumda sınırlı sonuç verdi.'
  };
}

module.exports = {
  cleanRam,
  memorySnapshot
};
