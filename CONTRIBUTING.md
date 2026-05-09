# Contributing

Thanks for considering a contribution to Windows Notch Overlay.

## Before You Start

- Check existing issues and pull requests to avoid duplicate work.
- Open an issue first for large UI changes, Windows integration changes, or behavior that affects privacy/audio/device state.
- Keep changes scoped. Small pull requests are easier to review.

## Local Setup

```bash
npm install
npm start
```

To build a portable Windows package:

```bash
npm run build:win
```

## Development Notes

- Main process code lives in `src/main/`.
- Renderer code lives in `src/renderer/`.
- The preload bridge is `src/preload.js`.
- The Windows Media Session helper lives in `src/helpers/media-session/`.
- Quick action tiles are generated from `MENU_ITEMS` in `src/renderer/renderer.js`.

## Pull Request Checklist

- Describe what changed and why.
- Include screenshots or short recordings for UI changes.
- Mention Windows version and hardware context when the change touches system APIs.
- Run the relevant checks before submitting.
- Avoid committing `node_modules/`, `dist/`, `release/`, helper `bin/`, or helper `obj/` output.

## Design Direction

The app should feel like a compact Windows desktop control surface, not a marketing page. Prefer dense, readable, practical UI over decorative layouts.

## Attribution

Do not copy code, assets, or documentation from DynamicWin or other projects unless the license allows it and the copied/adapted material is clearly marked. Concept inspiration is already acknowledged in the README and third-party notices.
