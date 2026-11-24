// Çentik içindeki medya sahnesi ile ayrı medya penceresinin ortak oynatıcı görünümü.
// İki tasarım vardır: "theme" (uygulama temasına uyan klasik görünüm) ve "modern" (kapak arka planlı kart).
const MediaPlayerView = (() => {
  const STYLES = ['theme', 'modern'];
  const FALLBACK_ACCENT = '#1db954';

  const ICONS = {
    back: '<path d="m15 18-6-6 6-6"/>',
    shuffle: '<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="m4 4 5 5"/>',
    previous: '<path d="m19 20-10-8 10-8v16Z"/><path d="M5 19V5"/>',
    play: '<path d="M8 5v14l11-7-11-7Z"/>',
    pause: '<path d="M10 4H6v16h4V4Z"/><path d="M18 4h-4v16h4V4Z"/>',
    next: '<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    detach: '<rect x="3" y="4" width="18" height="15" rx="2.5"/><rect x="11.5" y="11" width="7" height="5.5" rx="1.2"/>',
    pin: '<path d="M12 17v5"/><path d="M9 10.8a2 2 0 0 1-1.1 1.8l-1.8.9A2 2 0 0 0 5 15.2V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.8a2 2 0 0 0-1.1-1.8l-1.8-.9a2 2 0 0 1-1.1-1.8V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1Z"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    note: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    spotify: '<circle cx="12" cy="12" r="10" class="mp-glyph-fill"/><path d="M7 9.6c3.6-1 7.3-.7 10.4 1" class="mp-glyph-cut"/><path d="M7.6 12.7c2.9-.8 5.9-.5 8.4.9" class="mp-glyph-cut"/><path d="M8.2 15.5c2.2-.5 4.4-.3 6.3.7" class="mp-glyph-cut"/>'
  };

  function svg(name, className = '') {
    return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  const TEMPLATE = `
    <div class="mp" data-style="modern" data-context="notch" data-playing="false">
      <div class="mp-backdrop" aria-hidden="true"><img class="mp-backdrop-img" alt="" hidden /></div>
      <div class="mp-content">
        <header class="mp-header">
          <button class="mp-icon-btn mp-back" type="button" data-mp-action="back" title="Menülere dön" aria-label="Menülere dön">${svg('back')}</button>
          <span class="mp-device">Bu bilgisayar</span>
          <div class="mp-header-actions">
            <button class="mp-icon-btn mp-detach" type="button" data-mp-action="detach" title="Ayrı pencerede aç" aria-label="Ayrı pencerede aç" aria-pressed="false">${svg('detach')}</button>
            <button class="mp-icon-btn mp-pin" type="button" data-mp-action="pin" title="Her zaman üstte" aria-label="Her zaman üstte" aria-pressed="true">${svg('pin')}</button>
            <button class="mp-icon-btn mp-close" type="button" data-mp-action="close" title="Kapat" aria-label="Pencereyi kapat">${svg('close')}</button>
          </div>
        </header>
        <div class="mp-cover"><img class="mp-cover-img" alt="" hidden /><span class="mp-cover-text">S</span></div>
        <div class="mp-info">
          <div class="mp-app"><span class="mp-app-icon"></span><span class="mp-app-name" lang="en">Medya</span></div>
          <div class="mp-line">
            <span class="mp-app-icon mp-line-icon"></span>
            <span class="mp-title">Medya bekleniyor</span>
            <span class="mp-artist"></span>
          </div>
        </div>
        <div class="mp-waves" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div>
        <div class="mp-timeline">
          <span class="mp-elapsed">0:00</span>
          <div class="mp-track" role="slider" tabindex="0" aria-label="Çalma konumu" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <span class="mp-rail"><span class="mp-fill"></span></span>
            <span class="mp-thumb"></span>
          </div>
          <span class="mp-duration">--:--</span>
        </div>
        <div class="mp-controls">
          <button class="mp-ctrl mp-shuffle" type="button" data-mp-command="shuffle" title="Karıştır" aria-label="Karıştır" aria-pressed="false">${svg('shuffle')}</button>
          <button class="mp-ctrl" type="button" data-mp-command="previous" title="Önceki" aria-label="Önceki">${svg('previous')}</button>
          <button class="mp-ctrl mp-play" type="button" data-mp-command="playPause" data-state="play" title="Oynat" aria-label="Oynat">${svg('play', 'mp-icon-play')}${svg('pause', 'mp-icon-pause')}</button>
          <button class="mp-ctrl" type="button" data-mp-command="next" title="Sonraki" aria-label="Sonraki">${svg('next')}</button>
          <button class="mp-ctrl mp-repeat" type="button" data-mp-command="repeat" title="Tekrarla" aria-label="Tekrarla" aria-pressed="false">${svg('repeat')}<span class="mp-repeat-one">1</span></button>
        </div>
      </div>
    </div>
  `;

  // Modern kart "00:47", tema uyumlu görünüm orijinaldeki gibi "0:47" biçimini kullanır.
  function formatTime(ms, padMinutes = true) {
    const totalSeconds = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${padMinutes ? String(minutes).padStart(2, '0') : minutes}:${String(seconds).padStart(2, '0')}`;
  }

  function positionOf(media, now = Date.now()) {
    const duration = Number(media?.durationMs) || 0;
    if (!duration) {
      return 0;
    }
    if (media.startedAt && media.status === 'playing') {
      return Math.max(0, Math.min(now - media.startedAt, duration));
    }
    return Math.max(0, Math.min(Number(media.positionMs) || 0, duration));
  }

  function normalizeStyle(style) {
    return STYLES.includes(style) ? style : 'modern';
  }

  function rgbToHsl(red, green, blue) {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const light = (max + min) / 2;
    if (max === min) {
      return [0, 0, light];
    }
    const delta = max - min;
    const saturation = light > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    let hue;
    if (max === r) hue = (g - b) / delta + (g < b ? 6 : 0);
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    return [hue * 60, saturation, light];
  }

  // Kapak görselinden canlı bir vurgu rengi çıkarır (ilerleme çubuğu ve düğme vurgusu için).
  function extractAccent(dataUrl) {
    return new Promise((resolve) => {
      if (!dataUrl) {
        resolve('');
        return;
      }
      const image = new Image();
      image.onload = () => {
        try {
          const size = 24;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          context.drawImage(image, 0, 0, size, size);
          const { data } = context.getImageData(0, 0, size, size);
          const candidates = [];
          for (let index = 0; index < data.length; index += 4) {
            const [hue, saturation, light] = rgbToHsl(data[index], data[index + 1], data[index + 2]);
            if (light < 0.12 || light > 0.92) continue;
            candidates.push({ hue, saturation, score: saturation * (1 - Math.abs(light - 0.55)) });
          }
          if (!candidates.length) {
            resolve('');
            return;
          }
          candidates.sort((left, right) => right.score - left.score);
          const top = candidates.slice(0, Math.max(4, Math.round(candidates.length * 0.12)));
          // Tonların dairesel ortalaması.
          let x = 0;
          let y = 0;
          let saturationTotal = 0;
          top.forEach((item) => {
            x += Math.cos((item.hue * Math.PI) / 180);
            y += Math.sin((item.hue * Math.PI) / 180);
            saturationTotal += item.saturation;
          });
          const hue = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
          const saturation = Math.max(0.55, Math.min(0.9, saturationTotal / top.length));
          if (saturationTotal / top.length < 0.18) {
            resolve('');
            return;
          }
          resolve(`hsl(${Math.round(hue)} ${Math.round(saturation * 100)}% 58%)`);
        } catch {
          resolve('');
        }
      };
      image.onerror = () => resolve('');
      image.src = dataUrl;
    });
  }

  function create(root, options = {}) {
    root.innerHTML = TEMPLATE;
    const node = root.querySelector('.mp');
    const $ = (selector) => node.querySelector(selector);
    const parts = {
      backdropImg: $('.mp-backdrop-img'),
      coverImg: $('.mp-cover-img'),
      coverText: $('.mp-cover-text'),
      appName: $('.mp-app-name'),
      appIcons: node.querySelectorAll('.mp-app-icon'),
      title: $('.mp-title'),
      artist: $('.mp-artist'),
      elapsed: $('.mp-elapsed'),
      duration: $('.mp-duration'),
      track: $('.mp-track'),
      fill: $('.mp-fill'),
      thumb: $('.mp-thumb'),
      play: $('.mp-play'),
      shuffle: $('.mp-shuffle'),
      repeat: $('.mp-repeat'),
      previous: $('[data-mp-command="previous"]'),
      next: $('[data-mp-command="next"]'),
      detach: $('.mp-detach'),
      pin: $('.mp-pin')
    };

    let media = null;
    let coverUrl = '';
    let accentRequest = 0;
    let seekPreview = null;
    let busy = false;

    node.dataset.context = options.context === 'window' ? 'window' : 'notch';
    node.dataset.style = normalizeStyle(options.style);

    function setAppIcon(app) {
      const isSpotify = /spotify/i.test(String(app || ''));
      const markup = svg(isSpotify ? 'spotify' : 'note');
      parts.appIcons.forEach((icon) => {
        icon.innerHTML = markup;
        icon.classList.toggle('is-spotify', isSpotify);
      });
    }

    function setCover(url, fallbackText) {
      parts.coverText.textContent = fallbackText || 'M';
      if (url === coverUrl) {
        return;
      }
      coverUrl = url;
      const hasCover = Boolean(url);
      node.classList.toggle('has-cover', hasCover);
      [parts.coverImg, parts.backdropImg].forEach((img) => {
        if (hasCover) {
          img.src = url;
          img.hidden = false;
        } else {
          img.hidden = true;
          img.removeAttribute('src');
        }
      });

      const request = ++accentRequest;
      extractAccent(url).then((accent) => {
        if (request === accentRequest) {
          node.style.setProperty('--mp-cover-accent', accent || FALLBACK_ACCENT);
        }
      });
    }

    function setButtonSupport(button, supported) {
      button.disabled = !supported;
      button.dataset.supported = supported ? 'true' : 'false';
    }

    function renderProgress() {
      const duration = Number(media?.durationMs) || 0;
      const position = seekPreview != null ? seekPreview : positionOf(media);
      const ratio = duration ? Math.max(0, Math.min(1, position / duration)) : 0;
      const padMinutes = node.dataset.style === 'modern';
      parts.elapsed.textContent = formatTime(position, padMinutes);
      parts.duration.textContent = duration ? formatTime(duration, padMinutes) : '--:--';
      node.style.setProperty('--mp-progress', `${(ratio * 100).toFixed(2)}%`);
      parts.track.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
      parts.track.setAttribute('aria-valuetext', `${formatTime(position)} / ${duration ? formatTime(duration) : '--:--'}`);
    }

    function update(next) {
      media = next || null;
      const available = Boolean(media?.available);
      node.dataset.available = available ? 'true' : 'false';
      node.dataset.playing = media?.status === 'playing' ? 'true' : 'false';

      if (!available) {
        parts.appName.textContent = 'Medya';
        parts.title.textContent = 'Medya bekleniyor';
        parts.artist.textContent = '';
        setAppIcon('');
        setCover('', 'S');
      } else {
        parts.appName.textContent = media.app || 'Medya';
        parts.title.textContent = media.title || 'Bilinmeyen parça';
        parts.artist.textContent = media.artist || '';
        setAppIcon(media.app);
        setCover(media.thumbnailDataUrl || '', media.avatarText || String(media.app || 'M').slice(0, 1).toUpperCase());
      }
      node.classList.toggle('has-artist', Boolean(parts.artist.textContent));

      const playing = media?.status === 'playing';
      parts.play.dataset.state = playing ? 'pause' : 'play';
      parts.play.title = playing ? 'Duraklat' : 'Oynat';
      parts.play.setAttribute('aria-label', parts.play.title);

      setButtonSupport(parts.shuffle, available && media.canShuffle === true);
      setButtonSupport(parts.repeat, available && media.canRepeat === true);
      setButtonSupport(parts.previous, !available || media.canPrevious !== false);
      setButtonSupport(parts.next, !available || media.canNext !== false);
      parts.shuffle.setAttribute('aria-pressed', media?.shuffle === true ? 'true' : 'false');
      parts.repeat.dataset.repeat = media?.repeat || 'none';
      parts.repeat.setAttribute('aria-pressed', media?.repeat && media.repeat !== 'none' ? 'true' : 'false');
      parts.repeat.title = media?.repeat === 'track' ? 'Parçayı tekrarla' : (media?.repeat === 'list' ? 'Listeyi tekrarla' : 'Tekrarla');
      node.dataset.canSeek = available && media.canSeek === true ? 'true' : 'false';
      parts.track.setAttribute('aria-disabled', node.dataset.canSeek === 'true' ? 'false' : 'true');
      renderProgress();
    }

    async function runCommand(command, extra) {
      if (typeof options.onCommand !== 'function' || busy) {
        return;
      }
      busy = command === 'seek' ? busy : true;
      try {
        const result = await options.onCommand(command, extra);
        // Sarmadan hemen sonra uygulamanın bildirdiği konum çoğu zaman eskidir; iyimser konum korunur.
        if (command !== 'seek' && result && typeof result === 'object' && 'available' in result) {
          update(result);
        }
      } catch (error) {
        options.onError?.(error);
      } finally {
        busy = false;
      }
    }

    node.addEventListener('click', (event) => {
      const commandButton = event.target.closest('[data-mp-command]');
      if (commandButton && !commandButton.disabled) {
        runCommand(commandButton.dataset.mpCommand);
        return;
      }
      const actionButton = event.target.closest('[data-mp-action]');
      if (!actionButton) {
        return;
      }
      const handler = {
        back: options.onBack,
        detach: options.onDetach,
        pin: options.onPin,
        close: options.onClose
      }[actionButton.dataset.mpAction];
      if (typeof handler === 'function') {
        Promise.resolve(handler()).catch((error) => options.onError?.(error));
      }
    });

    function ratioFromPointer(event) {
      const rect = parts.track.getBoundingClientRect();
      return rect.width ? Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) : 0;
    }

    function commitSeek(positionMs) {
      seekPreview = null;
      if (media) {
        // İyimser güncelleme: yardımcı programın yanıtını beklemeden ilerleme çubuğunu taşı.
        media = {
          ...media,
          positionMs,
          startedAt: media.status === 'playing' ? Date.now() - positionMs : null
        };
      }
      renderProgress();
      runCommand('seek', { positionMs: Math.round(positionMs) });
    }

    parts.track.addEventListener('pointerdown', (event) => {
      if (node.dataset.canSeek !== 'true' || event.button !== 0) {
        return;
      }
      event.preventDefault();
      parts.track.setPointerCapture(event.pointerId);
      node.classList.add('is-seeking');
      seekPreview = ratioFromPointer(event) * (Number(media?.durationMs) || 0);
      renderProgress();
    });
    parts.track.addEventListener('pointermove', (event) => {
      if (seekPreview == null) {
        return;
      }
      seekPreview = ratioFromPointer(event) * (Number(media?.durationMs) || 0);
      renderProgress();
    });
    const finishSeek = (event) => {
      if (seekPreview == null) {
        return;
      }
      node.classList.remove('is-seeking');
      const target = event.type === 'pointerup'
        ? ratioFromPointer(event) * (Number(media?.durationMs) || 0)
        : seekPreview;
      commitSeek(target);
    };
    parts.track.addEventListener('pointerup', finishSeek);
    parts.track.addEventListener('pointercancel', () => {
      node.classList.remove('is-seeking');
      seekPreview = null;
      renderProgress();
    });
    parts.track.addEventListener('keydown', (event) => {
      if (node.dataset.canSeek !== 'true' || !['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        return;
      }
      event.preventDefault();
      const step = event.key === 'ArrowRight' ? 5000 : -5000;
      const duration = Number(media?.durationMs) || 0;
      commitSeek(Math.max(0, Math.min(duration, positionOf(media) + step)));
    });

    return {
      node,
      update,
      tick: renderProgress,
      getMedia: () => media,
      setStyle(style) {
        node.dataset.style = normalizeStyle(style);
        renderProgress();
      },
      setDetached(open) {
        const active = open === true;
        parts.detach.setAttribute('aria-pressed', active ? 'true' : 'false');
        parts.detach.title = active ? 'Ayrı pencereyi kapat' : 'Ayrı pencerede aç';
        parts.detach.setAttribute('aria-label', parts.detach.title);
      },
      setPinned(pinned) {
        const active = pinned !== false;
        parts.pin.setAttribute('aria-pressed', active ? 'true' : 'false');
        parts.pin.title = active ? 'Her zaman üstte: açık' : 'Her zaman üstte: kapalı';
        parts.pin.setAttribute('aria-label', parts.pin.title);
      },
      togglePlay: () => runCommand('playPause')
    };
  }

  return Object.freeze({
    STYLES,
    create,
    formatTime,
    normalizeStyle,
    positionOf
  });
})();
