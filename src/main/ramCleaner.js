const os = require('node:os');
const koffi = require('koffi');

const kernel32 = koffi.load('kernel32.dll');
const psapi = koffi.load('psapi.dll');

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

async function cleanRam() {
  const before = memorySnapshot();
  let trimmed = 0;

  try {
    if (EmptyWorkingSet(GetCurrentProcess())) {
      trimmed += 1;
    }
  } catch {
    // Current process trim is best-effort.
  }

  await new Promise((resolve) => setTimeout(resolve, 150));
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
        ? 'Uygulamanın çalışma kümesi sıkıştırıldı; ek boş alan görünmeyebilir.'
        : 'RAM temizleme bu oturumda sınırlı sonuç verdi.'
  };
}

module.exports = {
  cleanRam,
  memorySnapshot
};
