# LimitMeter

LimitMeter is a macOS menu-bar app for tracking AI coding subscription limits before they surprise you.

## Features

- Shows AI subscription usage in one menu-bar panel
- Answers "Can I code?" with a readiness summary across providers
- Marks every limit as Safe, Watch, Near Limit, or Capped
- Tracks session, weekly, credit, and quota-style limits through provider plugins
- Refreshes automatically on a configurable interval
- Supports a global shortcut for quick access
- Exposes a local read-only HTTP API at `127.0.0.1:6736`
- Keeps provider logic isolated in bundled plugins
- Runs local-first with no account required for the app itself

## License

MIT. See [LICENSE](LICENSE).
