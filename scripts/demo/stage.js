// Demo sahnesi: record-demo.js bu fonksiyonları executeJavaScript ile çağırır.
(() => {
  const $ = (id) => document.getElementById(id);
  const notchFrame = $('notchFrame');
  const mediaFrame = $('mediaFrame');
  const cursor = $('cursor');
  const caption = $('caption');

  function rectOf(element) {
    const rect = element.getBoundingClientRect();
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
  }

  // Örnek albüm kapağı (gün batımı + ızgara); gerçek bir sanatçının görseli değildir.
  function createCover(size = 320) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const sky = ctx.createLinearGradient(0, 0, 0, size);
    sky.addColorStop(0, '#1b0b3a');
    sky.addColorStop(0.55, '#7a1f6e');
    sky.addColorStop(1, '#ff6a3d');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, size, size);

    const sunY = size * 0.56;
    const sun = ctx.createLinearGradient(0, sunY - size * 0.3, 0, sunY + size * 0.05);
    sun.addColorStop(0, '#ffe36e');
    sun.addColorStop(1, '#ff3d7f');
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(size / 2, sunY, size * 0.27, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#7a1f6e';
    for (let index = 0; index < 5; index += 1) {
      const y = sunY - size * 0.02 - index * size * 0.045;
      ctx.fillRect(size * 0.2, y, size * 0.6, 2 + index * 0.8);
    }

    ctx.fillStyle = '#12082a';
    ctx.fillRect(0, sunY, size, size - sunY);
    ctx.strokeStyle = 'rgba(255, 90, 200, 0.75)';
    ctx.lineWidth = 2;
    for (let index = 1; index < 8; index += 1) {
      const y = sunY + (size - sunY) * Math.pow(index / 8, 1.8);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
    for (let index = -6; index <= 6; index += 1) {
      ctx.beginPath();
      ctx.moveTo(size / 2 + index * size * 0.04, sunY);
      ctx.lineTo(size / 2 + index * size * 0.22, size);
      ctx.stroke();
    }
    return canvas.toDataURL('image/jpeg', 0.92);
  }

  window.stage = {
    createCover,
    setCursor(x, y) {
      cursor.style.transform = `translate(${x - 4}px, ${y - 3}px)`;
    },
    click() {
      cursor.classList.remove('is-clicking');
      void cursor.offsetWidth;
      cursor.classList.add('is-clicking');
    },
    hideIntro() {
      $('intro').classList.add('is-hidden');
    },
    setCaption(title, detail = '') {
      if (!title) {
        caption.classList.remove('is-visible');
        return;
      }
      caption.textContent = title;
      if (detail) {
        const small = document.createElement('small');
        small.textContent = detail;
        caption.append(small);
      }
      caption.classList.add('is-visible');
    },
    // Detached styles (Floating/Pill/Compact) sit 6px below the screen edge, like the real overlay window.
    setNotchFrame({ top, height }) {
      notchFrame.style.top = `${top}px`;
      notchFrame.style.height = `${height}px`;
    },
    notchRect: () => rectOf(notchFrame),
    openMediaWindow(src, rect) {
      if (!mediaFrame.src) {
        mediaFrame.src = src;
      }
      Object.assign(mediaFrame.style, {
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
      });
      mediaFrame.hidden = false;
      requestAnimationFrame(() => mediaFrame.classList.add('is-visible'));
    },
    closeMediaWindow() {
      mediaFrame.classList.remove('is-visible');
    },
    setMediaWindowRect(rect) {
      Object.assign(mediaFrame.style, {
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
      });
    },
    mediaRect: () => rectOf(mediaFrame)
  };
})();
