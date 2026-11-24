// Ayrı medya penceresinin konum/boyut hesapları (Electron'a bağımlı değildir, test edilebilir).
const SCREEN_MARGIN = 24;
const MIN_VISIBLE = Object.freeze({ width: 80, height: 48 });

function clamp(value, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return minimum;
  }
  return Math.max(minimum, Math.min(maximum, Math.round(parsed)));
}

function visibleSize(rect, area) {
  const width = Math.min(rect.x + rect.width, area.x + area.width) - Math.max(rect.x, area.x);
  const height = Math.min(rect.y + rect.height, area.y + area.height) - Math.max(rect.y, area.y);
  return { width: Math.max(0, width), height: Math.max(0, height) };
}

// Kayıtlı konum hâlâ bir ekranda görünüyorsa onu, değilse birincil ekranın sağ alt köşesini kullanır.
function resolveMediaWindowBounds(saved, workAreas, primaryWorkArea, limits) {
  const width = clamp(saved?.width, limits.minWidth, limits.maxWidth);
  const height = clamp(saved?.height, limits.minHeight, limits.maxHeight);

  if (saved?.positioned === true) {
    const rect = { x: Math.round(Number(saved.x) || 0), y: Math.round(Number(saved.y) || 0), width, height };
    const onScreen = (workAreas || []).some((area) => {
      const visible = visibleSize(rect, area);
      return visible.width >= MIN_VISIBLE.width && visible.height >= MIN_VISIBLE.height;
    });
    if (onScreen) {
      return rect;
    }
  }

  return {
    x: Math.round(primaryWorkArea.x + primaryWorkArea.width - width - SCREEN_MARGIN),
    y: Math.round(primaryWorkArea.y + primaryWorkArea.height - height - SCREEN_MARGIN),
    width,
    height
  };
}

// Kenar/köşe tutamacıyla sürüklemede yeni sınırlar; sol/üst kenarda karşı kenar sabit kalır.
function resizeBounds(start, edge, dx, dy, limits) {
  const side = String(edge || '');
  let width = start.width;
  let height = start.height;

  if (side.includes('e')) width = start.width + dx;
  if (side.includes('w')) width = start.width - dx;
  if (side.includes('s')) height = start.height + dy;
  if (side.includes('n')) height = start.height - dy;

  width = clamp(width, limits.minWidth, limits.maxWidth);
  height = clamp(height, limits.minHeight, limits.maxHeight);

  return {
    x: side.includes('w') ? start.x + (start.width - width) : start.x,
    y: side.includes('n') ? start.y + (start.height - height) : start.y,
    width,
    height
  };
}

module.exports = {
  resizeBounds,
  resolveMediaWindowBounds
};
