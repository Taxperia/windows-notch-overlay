# Windows Notch Overlay

Windows Notch Overlay is an Electron-based dynamic notch prototype for Windows. It stays as a compact top-center overlay and expands on hover into a control center with quick actions, system telemetry, alarms, search, and media controls.

## Features

- Transparent, frameless, always-on-top Electron overlay
- Attached and floating notch themes
- Smooth hover expansion into a compact control center
- Data-driven quick action tiles with pagination
- In-app settings panel for toggling quick actions and appearance options
- Date and time display in collapsed and expanded states
- Spotify-aware media view with cover art, timeline, play/pause, previous, and next controls
- Media view only opens automatically while Spotify is actively playing
- Alarm creation inside the notch with active alarm takeover view
- Web search inside the notch, opened through the default browser
- Full-screen screenshot capture to `Pictures/NotchOverlayScreenshots`
- CPU, RAM, NVIDIA GPU, active window, and known game process detection
- Windows privacy/status integrations for camera and microphone state
- Bluetooth, focus assist, dark mode, night light, battery saver, and network quick actions
- PowerShell-free Windows integrations through Node, Electron, Win32, Core Audio, and SMTC helper code

## Installation

Requirements:

- Windows 10/11
- Node.js 20 or newer recommended
- npm
- .NET 8 SDK if you want to rebuild the Windows Media Session helper

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm start
```

Run with the floating theme:

```powershell
$env:NOTCH_THEME="floating"; npm start
```

Build a portable Windows release:

```bash
npm run build:win
```

The build script compiles the Windows Media Session helper first, then writes the portable app to `dist/`.

## Project Notes

This project is Windows-specific. Some data, such as FPS and hardware temperature, is not available through standard Electron APIs, so the project uses Windows-native integrations where practical.

- CPU and RAM metrics use Node APIs.
- Active window and media key control use Win32 APIs through `koffi`.
- NVIDIA GPU usage and temperature use `nvidia-smi.exe` when available.
- Media metadata is read through a Windows Media Session / SMTC helper first, with Spotify window-title fallback only when needed.
- Camera and microphone status are read from Windows privacy and audio state where possible.
- Microphone toggling is conservative and avoids breaking active streams in apps such as Discord or games.
- Network and night light actions avoid opening full Settings pages when a quicker Windows surface is available.

## Attribution

Windows Notch Overlay was inspired by the idea behind [DynamicWin](https://github.com/FlorianButz/DynamicWin), a Windows dynamic-island style project by Florian Butz.

This repository is an independent implementation with a different stack, design direction, architecture, and feature set. It is not affiliated with, endorsed by, or derived from the DynamicWin codebase. The concept inspiration is acknowledged explicitly because DynamicWin helped show that a dynamic notch experience can make sense on Windows.

DynamicWin is licensed under Creative Commons Attribution-ShareAlike 4.0 International. A local copy of that license text is kept in [DYNAMICWIN_CC_BY_SA_4_0_LICENSE.md](DYNAMICWIN_CC_BY_SA_4_0_LICENSE.md) for reference, and additional attribution notes are kept in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Development

The main Electron process lives in `src/main/`, the preload bridge is `src/preload.js`, and the renderer UI is in `src/renderer/`.

Quick menu items are generated from `MENU_ITEMS` in `src/renderer/renderer.js`. Add a new item there to make it appear in the carousel automatically.

Persistent user settings are stored in Electron `userData/settings.json`.

The Windows Media Session helper source is in `src/helpers/media-session/`. Build output is generated under `src/helpers/media-session/publish/` and is intentionally not committed.

## Security

This app interacts with Windows privacy, audio, shell, screenshot, and process APIs. Review [SECURITY.md](SECURITY.md) before reporting a vulnerability.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and the GitHub issue templates before opening a pull request.

## License

Project code is licensed under the Apache License 2.0 unless a file states otherwise. See [LICENSE](LICENSE).

DynamicWin and any DynamicWin-owned material remain under their own license and ownership.
