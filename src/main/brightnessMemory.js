// Bazı DDC/CI monitörler parlaklık yazma komutunu kabul eder ama okumada hep aynı (eski) değeri
// döndürür. Böyle bir monitörde son ayarlanan değer, monitörün bildirdiği "takılı" değerle birlikte
// saklanır; monitör aynı değeri bildirmeye devam ettiği sürece kullanıcıya son ayarlanan değer gösterilir.
// Monitör yazılan değeri birebir bildirmiyorsa (yuvarlama dahil) kullanıcının seçtiği değer gösterilir.
const READBACK_TOLERANCE = 0;
const NO_MEMORY = Object.freeze({ level: -1, reported: -1 });

function toPercent(value) {
  if (value == null || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, Math.round(parsed))) : null;
}

function normalizeMemory(memory) {
  const level = toPercent(memory?.level);
  const reported = toPercent(memory?.reported);
  if (level == null || reported == null || Number(memory?.level) < 0 || Number(memory?.reported) < 0) {
    return { ...NO_MEMORY };
  }
  return { level, reported };
}

function hasMemory(memory) {
  return normalizeMemory(memory).level >= 0;
}

// Yazmadan sonra okunan değere göre saklanacak hafızayı döndürür. DDC hattı yazmanın hemen ardından
// meşgul olup okuma başarısız olabilir; o zaman yazmadan önce okunan değer monitörün bildirdiği kabul edilir.
function memoryAfterWrite(requested, readBack, previousReading = null) {
  const target = toPercent(requested);
  const reported = toPercent(readBack) ?? toPercent(previousReading);
  if (target == null || reported == null || Math.abs(target - reported) <= READBACK_TOLERANCE) {
    return { ...NO_MEMORY };
  }
  return { level: target, reported };
}

// Donanımdan okunan değeri hafızayla uzlaştırır.
function reconcileRead(hardwareLevel, memory) {
  const level = toPercent(hardwareLevel);
  const saved = normalizeMemory(memory);
  if (level == null || saved.level < 0) {
    return { level, remembered: false, memory: saved };
  }
  if (level === saved.reported) {
    return { level: saved.level, remembered: true, memory: saved };
  }
  // Monitör artık farklı bir değer bildiriyor (ör. monitör menüsünden değiştirildi): donanıma güven.
  return { level, remembered: false, memory: { ...NO_MEMORY } };
}

module.exports = {
  NO_MEMORY,
  hasMemory,
  memoryAfterWrite,
  normalizeMemory,
  reconcileRead
};
