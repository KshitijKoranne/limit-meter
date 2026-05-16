# LimitMeter

LimitMeter is a macOS menu-bar app for tracking AI coding subscription limits before they surprise you.

It is being shaped into a limit-first assistant for Claude, Codex, Cursor, Copilot, Gemini, Windsurf, and other AI coding tools.

![LimitMeter Screenshot](screenshot.png)

## What It Does

- Shows AI subscription usage in one menu-bar panel
- Tracks session, weekly, credit, and quota-style limits through provider plugins
- Refreshes automatically on a configurable interval
- Supports a global shortcut for quick access
- Exposes a local read-only HTTP API at `127.0.0.1:6736`
- Keeps provider logic isolated in bundled plugins
- Runs local-first with no account required for the app itself

## V1 Scope

LimitMeter v1 focuses on parity with the upstream core:

- menu-bar panel
- provider list and detail views
- settings for refresh interval, theme, display mode, shortcut, and startup behavior
- bundled provider plugins
- local storage/cache
- macOS packaging through Tauri

## Next Improvements

- clearer "used vs remaining" language
- warning states for safe, caution, and near-limit usage
- reset countdowns that are easier to read at a glance
- usage history and trend charts
- "Can I keep coding?" summary score
- better onboarding for provider setup
- dedicated LimitMeter icon and screenshots

## Development

```bash
bun install
bun run bundle:plugins
bun run dev
```

Build the web frontend:

```bash
bun run build
```

Run tests:

```bash
bun run test
```

Run the Tauri app:

```bash
bun run tauri dev
```

## License

MIT. See [LICENSE](LICENSE).
