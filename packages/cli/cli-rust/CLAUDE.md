# CLI-Rust Package

Rust dispatcher for the Fern CLI. Owns the `fern` entrypoint binary, handles a static set of subcommands natively, and forwards everything else to the bundled bun-compiled cli-v2 (`fern-ts`).

This is the "core becomes Rust" wrapper. New features live here. Existing TS commands migrate one at a time by being added to `RUST_NATIVE_SUBCOMMANDS` in `src/dispatch.rs`.

## Where things live

- `src/main.rs` — process entrypoint, delegates to `dispatch::run`.
- `src/dispatch.rs` — the routing decision (Rust vs. delegate) lives here. **Adding a Rust-native subcommand means editing `RUST_NATIVE_SUBCOMMANDS` + the match arm at the bottom of this file, and adding `.subcommand(...)` in `src/cli.rs`.**
- `src/delegate.rs` — `exec_fern_ts`: replaces this process with the bundled TS binary on Unix (real `execvp`), spawn-and-wait on Windows. Argv is forwarded verbatim.
- `src/runtime.rs` — resolves which fern-ts binary to use. Resolution order: `$FERN_TS_BIN` → sibling binary → embedded payload (only with `--features embed-fern-ts`).
- `src/embed/mod.rs` — `include_bytes!`-based payload, gated behind the `embed-fern-ts` feature. `build.rs` validates `FERN_TS_EMBED_PATH` at compile time.
- `src/commands/` — one module per Rust-native subcommand. `doctor` is the seed.
- `tests/delegate_smoke.rs` — integration tests for the forward/route/exit-code behaviors.
- `tests/fixtures/fake-fern-ts.sh` — bash stand-in for the bun binary so tests don't need it.

## Conventions

- **No `unwrap()` in non-test code.** Use `anyhow::Result` and the `?` operator. Bubble errors up to `main.rs`, which renders the chain.
- **No new strings in `dispatch.rs` for command names.** Each command's module exports `pub const NAME: &str = "..."` and both `cli.rs` and `dispatch.rs` reference that constant.
- **Don't re-parse fern-ts's flags in Rust.** The dispatcher's job is to *route*, not to validate args that fern-ts already understands. Only commands that exist in `RUST_NATIVE_SUBCOMMANDS` get the clap treatment.
- **Cross-platform code lives behind `#[cfg]`**, not behind `if cfg!(...)`. The `delegate.rs` Unix/Windows split is the canonical example.

## Tests

```bash
cargo test                  # full crate test suite
cargo test --no-default-features    # exercise the "no embed" path explicitly
```

The integration test set is intentionally tiny and load-bearing — if these five tests pass, the dispatcher's contract holds. New Rust-native commands should land with their own unit tests in `src/commands/<name>.rs`; integration tests in `tests/` should focus on dispatcher behavior, not command logic.

## Releasing

Not done by this crate yet. The eventual plan is that `@fern-api/fern` (the npm wrapper added in PR #15923) replaces its `bin/fern` script with the Rust binary, and each `@fern-api/fern-<platform>` package ships a Rust binary built with `--features embed-fern-ts` so end users get a single self-extracting executable.
