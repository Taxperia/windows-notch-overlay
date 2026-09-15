# Windows Notch Overlay v0.3.0

This release focuses on customization, settings usability, hardware-control reliability, and application security.

## Highlights

- Added idle transparency controls for the compact clock and date strip.
- Improved microphone controls so they target the recording device selected in the application.
- Fixed inconsistent brightness values between the compact control and the brightness panel.
- Refined the Settings window with rounded corners, corrected spacing, and improved alignment.
- Hardened Electron security and updated vulnerable dependencies.

## New Features

### Idle Transparency

- Added an option to make the compact clock and date strip more transparent after a period of inactivity.
- Added selectable inactivity delays: 3, 5, 10, or 30 seconds.
- Added an adjustable idle background visibility level.
- Added a separate option to fade the clock and date text together with the background.
- Hovering over the strip immediately restores its normal appearance.
- Active notifications and alarms are excluded from automatic fading.

### Custom Theme Navigation

- The custom theme card now opens the dedicated color customization page correctly.
- Improved navigation behavior when a Settings search is active.

## Improvements

### Settings Interface

- Added rounded corners to the Settings window.
- Removed unwanted outer spacing around the window.
- Fixed corner and content clipping inconsistencies.
- Corrected the language dropdown position and alignment.
- Centered the link icons at the bottom of the About page.
- Updated Turkish and English translations for the new settings.

### Microphone Controls

- The microphone button now controls the recording device selected in the application's audio settings.
- Added safer matching between the selected application device and its Windows audio endpoint.
- Only the selected microphone is enabled or disabled.
- Removed the confirmation dialog shown before changing microphone state.
- Removed the startup behavior that could automatically re-enable disabled recording devices.
- Added a safe failure path when the selected microphone cannot be matched, preventing another device from being changed accidentally.

### Brightness Controls

- Fixed the brightness card and detailed brightness panel showing different values.
- Serialized hardware brightness read and write operations to prevent timing conflicts.
- Improved brightness-state caching for more consistent values after restarting the application.
- Fixed a value-handling issue that could display `0%` brightness as `100%`.

## Security and Quality

- Enabled Electron renderer sandboxing.
- Restricted unsafe navigation and unauthorized new-window requests.
- Hardened WebView usage and renderer-to-main process communication.
- Updated vulnerable direct and transitive dependencies.
- Resolved all vulnerabilities reported by the local `npm audit` check at the time of this release.
- Verified JavaScript syntax, JSON files, dependency metadata, and Git diff formatting.

## Compatibility

- No known breaking changes are introduced in this release.
- Existing user settings remain compatible; new options use safe default values.

## Notes

- Hardware brightness support still depends on the capabilities exposed by the monitor and Windows through WMI or DDC/CI.
- Microphone control depends on Windows being able to match the selected recording device to an audio endpoint.

---

Thank you for using Windows Notch Overlay. Bug reports and feature suggestions are welcome in [GitHub Issues](https://github.com/Taxperia/windows-notch-overlay/issues).
