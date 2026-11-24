// Ayrı, sürüklenebilir ve boyutlandırılabilir medya penceresi.
(() => {
  const api = window.mediaWindow;
  const root = document.getElementById('mediaWindowRoot');
  if (!api || !root) {
    return;
  }

  const view = MediaPlayerView.create(root, {
    context: 'window',
    onCommand: (command, extra) => api.command(command, extra),
    onClose: () => api.close(),
    onPin: async () => {
      const state = await api.togglePin();
      view.setPinned(state?.alwaysOnTop !== false);
    }
  });

  function applySettings(settings) {
    if (!settings) {
      return;
    }
    const appearance = settings.appearance || {};
    Object.entries(NotchThemes.themeTokens(appearance)).forEach(([name, value]) => {
      document.documentElement.style.setProperty(name, value);
    });
    document.documentElement.style.colorScheme = appearance.colorTheme === 'light' ? 'light' : 'dark';
    view.setStyle(appearance.mediaPlayerStyle);
    view.setPinned(settings.system?.mediaWindow?.alwaysOnTop !== false);
  }

  api.onSettings(applySettings);
  api.onMedia((media) => view.update(media));
  api.getSettings().then(applySettings).catch(() => {});
  api.getMedia().then((media) => view.update(media)).catch(() => view.update(null));
  setInterval(() => view.tick(), 500);

  document.addEventListener('keydown', (event) => {
    if (event.target.closest?.('.mp-track')) {
      return;
    }
    if (event.code === 'Space') {
      event.preventDefault();
      view.togglePlay();
    }
  });

  // Şeffaf pencerede yerel kenar boyutlandırması güvenilir olmadığından tutamaçlar ana süreçle çalışır:
  // ana süreç imleci izleyip pencere sınırlarını günceller, fare bırakılınca durur.
  let resizing = false;
  const stopResize = () => {
    if (!resizing) {
      return;
    }
    resizing = false;
    api.resizeEnd();
  };

  document.querySelectorAll('.mw-resize').forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      handle.setPointerCapture(event.pointerId);
      resizing = true;
      api.resizeStart(handle.dataset.edge);
    });
    handle.addEventListener('pointerup', stopResize);
    handle.addEventListener('pointercancel', stopResize);
    handle.addEventListener('lostpointercapture', stopResize);
  });
  window.addEventListener('blur', stopResize);
})();
