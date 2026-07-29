# Changelog

This file summarizes notable user-facing changes made after the previous GitHub release.

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
