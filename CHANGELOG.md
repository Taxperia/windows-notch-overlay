# Changelog

This file summarizes notable user-facing changes made after the previous GitHub release.

## Unreleased

### Added

- Added a detached media player window: open it from the notch media view, the media row, or Settings, drag it anywhere, resize it from any edge or corner, and pin it above other windows. Its position, size, and pin state are remembered.
- Added a "Modern card" media player design (blurred album-art background, inline title and artist, seek bar, shuffle and repeat) next to the theme-matched design. The choice in Settings → Theme applies to both the notch and the detached window.
- Added seeking, shuffle, and repeat control through the Windows media helper when the playing app supports them.
- The audio mixer and notification center now show each app's own icon instead of a letter: mixer rows use the icon of the app's executable, and notifications use the sending app's registered logo (packaged app logo, toast registration icon, or Start menu icon). Letters remain as a fallback.

### Changed

- Turning download/upload speed or ping on or off now animates: the compact strip widens or narrows smoothly and the values fade in one by one (or fade out) instead of popping in. The strip no longer rewrites these values every second when they have not changed.

### Fixed

- Fixed the audio mixer failing with `GetDefaultAudioEndpoint render failed: 0x80070490` when no default output device exists (for example while Bluetooth headphones connect). It now lists sessions on every active output device, shows a clear message when there is none, and refreshes automatically when a device appears.
- Fixed brightness showing an old value after restarting on DDC/CI monitors that accept brightness changes but always report the same reading. The last chosen level is remembered until the monitor reports a different value.
- Brightness changes now retry briefly when the DDC/CI link is busy instead of falling back to software dimming on the first failure.

## 0.2.0 - 2026-07-30

### Added

- Added in-notch Pomodoro, short notes, RAM cleaner, notification center, calendar, weather, and battery detail tools.
- Added an inline video stage with configurable URL, dimensions, and open/close keyboard shortcuts.
- Added collapsed-notch content options for clock/date or Pomodoro, download/upload speed, ping, and best-effort headphone battery information.
- Added the option to open Settings inside the notch or in a separate window, plus settings search and compact/advanced settings modes.
- Added microphone and camera device selection with device-list refresh support.
- Added Angular and Slab notch styles, Floating variants, a transparent compact strip, and a custom theme editor with live preview.
- Added Spotify-first, active Windows session, or any-session media-source selection and three alarm sound profiles.

### Changed

- Improved the Windows media helper so it controls the selected media session directly and falls back to global media keys when necessary.
- Made Bluetooth control more reliable by prioritizing the Windows Radio API and retaining a carefully filtered PnP fallback.
- Made brightness control more reliable by validating WMI writes and falling back to DDC/CI for supported external monitors.
- Standardized brightness values to the <code>50%</code> format and improved reporting for displays that expose read-only brightness values.
- Reduced unnecessary settings application and menu rendering work, and relaxed media/control polling intervals.
- Moved the audio-mixer refresh action into the tool header and redesigned the About page and settings interface.

### Fixed

- Removed the preload clock fallback that caused visible switching between the clock and an active Pomodoro timer.
- Fixed the initial network-speed sample and now display download/upload values separately with correct units.
- Ensured inline video always opens in the main notch instead of a detached Settings window.
- Stabilized collapsed-notch sizing and clock/date placement when optional content indicators are enabled.
- Updated Electron Builder and related transitive dependencies to secure versions, resolving the active Dependabot alerts.
- Removed the duplicate Advanced CodeQL workflow that conflicted with GitHub's default CodeQL setup.
- Added GitHub Actions source checks for JavaScript syntax, JSON validity, and package/lockfile version consistency.

### Experimental / Disabled

- GitHub notification token validation, secure storage, and provider infrastructure are present, but the external-app UI and background polling remain disabled behind feature flags.
- Headphone battery reporting depends on Windows and device support and may remain unavailable on unsupported hardware.
