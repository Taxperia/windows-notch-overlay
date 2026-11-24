// Ana çentik penceresi ile ayrı medya penceresinin ortak renk temaları.
const NotchThemes = (() => {
  const DEFAULT_CUSTOM_THEME = Object.freeze({
    panel: '#0a0c10',
    surface: '#171b22',
    text: '#f4f7fb',
    active: '#0f766e',
    connected: '#2563eb'
  });

  const THEME_PRESETS = Object.freeze({
    default: {
      name: 'Gece',
      colors: DEFAULT_CUSTOM_THEME
    },
    slate: {
      name: 'Grafit',
      colors: {
        panel: '#111827',
        surface: '#2d3748',
        text: '#f8fafc',
        active: '#0f766e',
        connected: '#2563eb'
      }
    },
    contrast: {
      name: 'Kontrast',
      colors: {
        panel: '#04080d',
        surface: '#202936',
        text: '#f8fafc',
        active: '#f59e0b',
        connected: '#16a34a'
      }
    },
    light: {
      name: 'Light',
      colors: {
        panel: '#f8fafc',
        surface: '#e2e8f0',
        text: '#111827',
        active: '#2563eb',
        connected: '#059669'
      }
    },
    forest: {
      name: 'Forest',
      colors: {
        panel: '#07130f',
        surface: '#12342a',
        text: '#ecfdf5',
        active: '#10b981',
        connected: '#38bdf8'
      }
    },
    ruby: {
      name: 'Ruby',
      colors: {
        panel: '#17070c',
        surface: '#3b111d',
        text: '#fff1f2',
        active: '#e11d48',
        connected: '#f97316'
      }
    }
  });

  function hexToRgba(hex, alpha) {
    const normalized = String(hex || '#000000').replace('#', '');
    const value = Number.parseInt(normalized, 16);
    if (Number.isNaN(value)) {
      return `rgba(0, 0, 0, ${alpha})`;
    }

    const red = (value >> 16) & 255;
    const green = (value >> 8) & 255;
    const blue = value & 255;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  function themeColors(appearance) {
    const colorTheme = appearance?.colorTheme || 'default';
    if (colorTheme === 'custom') {
      return { ...DEFAULT_CUSTOM_THEME, ...(appearance?.customTheme || {}) };
    }
    return THEME_PRESETS[colorTheme]?.colors || THEME_PRESETS.default.colors;
  }

  function themeTokens(appearance) {
    const colorTheme = appearance?.colorTheme || 'default';
    const light = colorTheme === 'light';
    const colors = themeColors(appearance);
    return {
      '--panel': hexToRgba(colors.panel, light ? 0.98 : 0.985),
      '--panel-2': hexToRgba(colors.surface, light ? 0.94 : 0.92),
      '--surface': hexToRgba(colors.surface, light ? 0.92 : 0.96),
      '--surface-hover': hexToRgba(colors.surface, light ? 1 : 0.98),
      '--text': colors.text,
      '--active': colors.active,
      '--connected': colors.connected,
      '--muted': hexToRgba(colors.text, light ? 0.62 : 0.68),
      '--dim': hexToRgba(colors.text, light ? 0.45 : 0.42),
      '--line': hexToRgba(colors.text, 0.14),
      '--surface-border': hexToRgba(colors.text, light ? 0.16 : 0.12)
    };
  }

  return Object.freeze({
    DEFAULT_CUSTOM_THEME,
    THEME_PRESETS,
    hexToRgba,
    themeColors,
    themeTokens
  });
})();
