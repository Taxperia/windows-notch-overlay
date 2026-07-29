<a id="readme-top"></a>

<div align="center">

# Windows Notch Overlay

**A compact, customizable notch-style control center for Windows 10 and 11.**

Keep system controls, media, productivity tools, notifications, and live telemetry one hover away without leaving your current task.

[![Latest Release][release-shield]][release-url]
[![Downloads][downloads-shield]][release-url]
[![Source Checks][checks-shield]][checks-url]
[![License][license-shield]][license-url]
[![Windows][windows-shield]][release-url]

[**Download the latest release »**][release-url]

[View releases][releases-url] · [Report a bug][bug-url] · [Request a feature][feature-url]

</div>

> [!IMPORTANT]
> Windows Notch Overlay is currently Windows-only. Release binaries are not signed with a commercial code-signing certificate, so Windows may display a SmartScreen warning. Download builds only from this repository's official [Releases page][releases-url].

<details>
  <summary><strong>Table of Contents</strong></summary>
  <ol>
    <li><a href="#about-the-project">About the Project</a></li>
    <li><a href="#highlights">Highlights</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#download-the-portable-app">Download the Portable App</a></li>
        <li><a href="#run-from-source">Run from Source</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#windows-integrations">Windows Integrations</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#build">Build</a></li>
    <li><a href="#current-limitations">Current Limitations</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#security">Security</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

## About the Project

Windows Notch Overlay is an Electron-based desktop overlay that sits at the top center of the screen. It stays compact while you work, then expands into a focused control center when you hover over it.

The project combines familiar Windows controls with media, productivity, notification, and telemetry tools in one consistent interface. It is designed to reduce context switching while remaining customizable enough for different workflows and display setups.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Highlights

| Area | What it includes |
| --- | --- |
| **Quick controls** | Volume mixer, brightness, Bluetooth, Focus Assist, dark mode, Night light, battery saver, network, camera, and microphone status |
| **Productivity** | Pomodoro timer, short notes, alarms, calendar, weather, search, notification center, and RAM cleaner |
| **Media** | Windows SMTC media sessions, Spotify-aware presentation, cover art, timeline, playback controls, and selectable media-source priority |
| **Inline video** | Configurable web/video URL, resizable in-notch stage, and customizable open/close hotkeys |
| **Customization** | Attached, Floating, Pill, Compact, Angular, and Slab styles; theme presets; custom colors; transparent compact strip |
| **Collapsed content** | Clock/date or Pomodoro plus optional download/upload speed, ping, and best-effort headphone battery information |
| **Telemetry** | CPU, RAM, NVIDIA GPU, active-window, known-game, network, and power information where supported |
| **Settings** | In-notch or separate settings window, compact/advanced modes, settings search, microphone/camera selection, and persistent menu ordering |

### Designed for the desktop

- Frameless, transparent, always-on-top overlay
- Smooth compact-to-expanded transitions
- Drag-and-drop quick action ordering across menu pages
- Turkish and English localization dictionaries
- Conservative Windows privacy controls that avoid disrupting active apps
- Native Windows helper processes for media sessions and notifications

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Built With

[![Electron][electron-shield]][electron-url]
[![Node.js][node-shield]][node-url]
[![.NET][dotnet-shield]][dotnet-url]
[![Koffi][koffi-shield]][koffi-url]

- **Electron** provides the desktop window, lifecycle, IPC, and packaging layers.
- **Node.js** handles application logic and system data collection.
- **Koffi** connects the app to Win32, Core Audio, and DDC/CI APIs.
- **.NET 8 / WinRT helpers** provide Windows media-session and notification access.
- **HTML, CSS, and vanilla JavaScript** power the renderer interface.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Download the Portable App

1. Open the [latest release][release-url].
2. Download <code>Windows.Notch.Overlay.0.2.0.exe</code>.
3. Run the portable executable; no installer is required.

Current release: [**Download Windows Notch Overlay v0.2.0**][download-url]

Some helper-powered features may require the [.NET 8 Desktop Runtime][dotnet-runtime-url] on the target computer.

### Run from Source

#### Prerequisites

- Windows 10 or Windows 11
- Node.js 20 or newer
- npm
- .NET 8 SDK
- Git

#### Installation

1. Clone the repository:

   ~~~powershell
   git clone https://github.com/Taxperia/windows-notch-overlay.git
   cd windows-notch-overlay
   ~~~

2. Install the locked dependencies:

   ~~~powershell
   npm ci
   ~~~

3. Start the application:

   ~~~powershell
   npm start
   ~~~

4. Start with DevTools when developing:

   ~~~powershell
   npm run dev
   ~~~

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

### Everyday controls

- Hover over the compact notch to open the main control center.
- Select a quick-action tile to open its tool or change the related Windows state.
- Long-press and drag tiles to reorder them across menu pages.
- Use the media view to control the selected Windows media session.
- Open Settings to change appearance, content, privacy, devices, and startup behavior.

### Productivity tools

- Start a Pomodoro session and optionally replace the collapsed clock with its countdown.
- Save short local notes directly inside the notch.
- Create alarms with selectable alert tones.
- View recent Windows notifications, a monthly calendar, or weather for a chosen city.

### Inline video

Enable **Screen video** in Settings, enter a web or video URL, and choose the stage size. The default shortcuts are <kbd>Page Up</kbd> to show and <kbd>Page Down</kbd> to hide the video stage.

### Local data

- Settings are stored in Electron's <code>userData/settings.json</code>.
- Notes and Pomodoro state are stored locally by the renderer.
- Screenshots are saved to <code>Pictures/NotchOverlayScreenshots</code>.
- GitHub integration tokens, when the experimental integration is enabled, use Electron <code>safeStorage</code> where available.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Windows Integrations

| Capability | Primary path | Fallback or behavior |
| --- | --- | --- |
| Media metadata and commands | Windows SMTC helper | Global media keys and Spotify window-title fallback |
| Notifications | WinRT notification helper | Feature remains unavailable until notification access is granted |
| Internal display brightness | Windows WMI | Read-only state is reported when hardware writes are unsupported |
| External monitor brightness | DDC/CI through Koffi | Availability depends on the monitor and display connection |
| Bluetooth | Windows Radio API | Carefully filtered Bluetooth PnP devices on unsupported systems |
| Per-app audio | Windows Core Audio sessions | Unsupported/protected sessions are skipped |
| NVIDIA telemetry | <code>nvidia-smi.exe</code> | Hidden when a compatible NVIDIA GPU is unavailable |
| Network extras | Windows counters and <code>ping.exe</code> | Best-effort values with safe empty states |

The application avoids disabling microphone devices or changing Windows microphone privacy to <code>Deny</code> during normal use.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Project Structure

~~~text
windows-notch-overlay/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── src/
│   ├── helpers/
│   │   ├── media-session/
│   │   └── notifications/
│   ├── main/
│   │   ├── index.js
│   │   ├── appSettings.js
│   │   ├── windowsControls.js
│   │   ├── media.js
│   │   └── ramCleaner.js
│   ├── renderer/
│   │   ├── i18n/
│   │   ├── index.html
│   │   ├── renderer.js
│   │   └── styles.css
│   └── preload.js
├── CHANGELOG.md
├── package.json
└── README.md
~~~

The main Electron process lives in <code>src/main/</code>, the isolated preload bridge is <code>src/preload.js</code>, and the UI is implemented in <code>src/renderer/</code>.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Build

Build the .NET helpers and a portable Windows executable:

~~~powershell
npm run build:win
~~~

Build the .NET helpers and an NSIS installer:

~~~powershell
npm run dist
~~~

Generated output is written to <code>dist/</code>. Helper build output under each helper's <code>bin/</code>, <code>obj/</code>, and <code>publish/</code> directories is intentionally ignored by Git.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Current Limitations

- Hardware controls depend on Windows, driver, display, and device support.
- Headphone battery information is best-effort and may not be exposed by every device.
- GitHub notification integration groundwork exists but external integrations and background polling are disabled in the current release.
- Discord message/call content cannot be read through a regular user OAuth flow, and YouTube integration requires a configured Google OAuth/Data API application.
- Portable release binaries are currently unsigned.

See the [issue tracker][issues-url] for known problems and planned improvements.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before opening a pull request.

1. Fork the repository.
2. Create a feature branch: <code>git switch -c feature/amazing-feature</code>
3. Commit your changes.
4. Push the branch.
5. Open a pull request.

For a full list of changes, see [CHANGELOG.md](CHANGELOG.md).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Security

Windows Notch Overlay interacts with Windows privacy, audio, process, screenshot, shell, and device APIs. Review [SECURITY.md](SECURITY.md) before reporting a vulnerability.

Please use the private reporting instructions in the security policy instead of creating a public issue for sensitive findings.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgments

Windows Notch Overlay was inspired by the dynamic-island concept demonstrated by [DynamicWin](https://github.com/FlorianButz/DynamicWin), created by Florian Butz.

This repository is an independent implementation with a different technology stack, architecture, design direction, and feature set. It is not affiliated with or endorsed by DynamicWin. Additional attribution information is available in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [DYNAMICWIN_CC_BY_SA_4_0_LICENSE.md](DYNAMICWIN_CC_BY_SA_4_0_LICENSE.md).

The README layout takes structural inspiration from [Taxperia/Best-README-Template](https://github.com/Taxperia/Best-README-Template), a fork of the original Best-README-Template project.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Project code is distributed under the Apache License 2.0 unless a file states otherwise. See [LICENSE](LICENSE) for details.

DynamicWin and any DynamicWin-owned material remain under their respective license and ownership.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Reference links -->
[release-shield]: https://img.shields.io/github/v/release/Taxperia/windows-notch-overlay?style=for-the-badge&sort=semver
[release-url]: https://github.com/Taxperia/windows-notch-overlay/releases/latest
[releases-url]: https://github.com/Taxperia/windows-notch-overlay/releases
[download-url]: https://github.com/Taxperia/windows-notch-overlay/releases/download/v0.2.0/Windows.Notch.Overlay.0.2.0.exe
[downloads-shield]: https://img.shields.io/github/downloads/Taxperia/windows-notch-overlay/total?style=for-the-badge
[checks-shield]: https://img.shields.io/github/actions/workflow/status/Taxperia/windows-notch-overlay/source-checks.yml?branch=main&style=for-the-badge&label=Source%20Checks
[checks-url]: https://github.com/Taxperia/windows-notch-overlay/actions/workflows/source-checks.yml
[license-shield]: https://img.shields.io/github/license/Taxperia/windows-notch-overlay?style=for-the-badge
[license-url]: https://github.com/Taxperia/windows-notch-overlay/blob/main/LICENSE
[windows-shield]: https://img.shields.io/badge/Windows-10%20%7C%2011-0078D4?style=for-the-badge&logo=windows11&logoColor=white
[issues-url]: https://github.com/Taxperia/windows-notch-overlay/issues
[bug-url]: https://github.com/Taxperia/windows-notch-overlay/issues/new?template=bug_report.yml
[feature-url]: https://github.com/Taxperia/windows-notch-overlay/issues/new?template=feature_request.yml
[electron-shield]: https://img.shields.io/badge/Electron-42-47848F?style=for-the-badge&logo=electron&logoColor=white
[electron-url]: https://www.electronjs.org/
[node-shield]: https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[node-url]: https://nodejs.org/
[dotnet-shield]: https://img.shields.io/badge/.NET-8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white
[dotnet-url]: https://dotnet.microsoft.com/
[dotnet-runtime-url]: https://dotnet.microsoft.com/download/dotnet/8.0
[koffi-shield]: https://img.shields.io/badge/Koffi-Native%20FFI-111111?style=for-the-badge
[koffi-url]: https://koffi.dev/
