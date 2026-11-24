// Demo sahnesindeki iframe'lere uygulamanın gerçek köprülerini yükler (çentik ve ayrı medya penceresi).
const href = String(globalThis.location?.href || '');

if (href.includes('/src/renderer/index.html')) {
  require('../../src/preload.js');
} else if (href.includes('/src/renderer/media-window.html')) {
  require('../../src/media-preload.js');
}
