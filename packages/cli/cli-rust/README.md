# `@fern-api/cli-rust` — Rust dispatcher for the Fern CLI

> **Status:** proof-of-concept. Nothing here is shipped to users yet. See PR description for the migration plan.

## What this is

A small Rust binary named `fern` that is the new entrypoint for the Fern CLI. It owns a **static registry of Rust-native subcommands** (just `doctor` today) and forwards every other invocation, unchanged, to the existing bun-compiled `cli-v2` binary (referred to here as `fern-ts`).

```
$ fern doctor              # handled in Rust
$ fern check --api foo     # delegated to fern-ts
$ fern generate            # delegated to fern-ts
$ fern --ts doctor         # forced to fern-ts even though doctor is Rust-native (debug aid)
```

The point is: **users see zero behavior change**. New features can be written in Rust from day one, and existing commands can be ported one at a time by adding their name to `RUST_NATIVE_SUBCOMMANDS` in `src/dispatch.rs`.

## How it routes

1. `fern` reads `std::env::args_os()`.
2. It walks the argv to find the first positional (skipping `-` flags).
3. If that positional is in [`RUST_NATIVE_SUBCOMMANDS`](src/dispatch.rs), `clap` parses the args and calls the matching Rust handler.
4. Otherwise the whole argv is `exec`-ed to the resolved fern-ts binary. On Unix this is a real `execvp` so signal handling and `argv[0]` introspection are identical to invoking fern-ts directly. On Windows it's spawn-and-wait with the same observable exit code.
5. `fern --ts <anything>` forces step 4 even for Rust-native subcommands, which is useful for diffing the two implementations during a port.
6. `fern completion` is **always** delegated, because the TypeScript yargs setup owns shell completion until that subsystem is also ported.

## Where the bundled `fern-ts` comes from

`src/runtime.rs` resolves fern-ts in this order:

1. `$FERN_TS_BIN` — explicit absolute path. Used by integration tests and power users.
2. A sibling executable next to the running `fern` (`./fern-ts` on Unix, `.\fern-ts.exe` on Windows).
3. An **embedded payload** baked into the Rust binary at compile time (only when the crate is built with `--features embed-fern-ts`). On first invocation the payload is self-extracted into `$XDG_CACHE_HOME/fern/runtime/<sha>/fern-ts` and re-used on every subsequent run.

That last mode is the one that produces the single-binary distribution we eventually want. See [Building with an embedded payload](#building-with-an-embedded-payload).

## Trying it out

### Plain build (no fern-ts embedded)

```bash
cd packages/cli/cli-rust
cargo build
./target/debug/fern doctor
```

This works without fern-ts being built — `doctor` is Rust-native. Trying `./target/debug/fern check` will report a clear error pointing you at the resolution steps above.

### With a sibling fern-ts

```bash
# Build the bun-compiled cli-v2 first (this is the existing pipeline,
# nothing new here):
( cd packages/cli/cli-v2 && pnpm dist:cli:dev && pnpm dist:bin:local )

# Symlink (or copy) the platform binary next to our Rust binary:
ln -sf "$(pwd)/packages/cli/cli-v2/dist/bin/fern-$(uname -s | tr 'A-Z' 'a-z')-$(uname -m | sed 's/x86_64/x64/;s/arm64/arm64/')" \
       packages/cli/cli-rust/target/debug/fern-ts

# Now both routes work:
packages/cli/cli-rust/target/debug/fern doctor       # Rust path
packages/cli/cli-rust/target/debug/fern check --help # delegated path
```

### Building with an embedded payload

```bash
cd packages/cli/cli-rust
./scripts/build-fern-ts.sh local           # stages fern-ts under src/embed/payload/
FERN_TS_EMBED_PATH="$(pwd)/src/embed/payload/fern-ts" \
  cargo build --release --features embed-fern-ts
./target/release/fern --help               # single binary, no sibling required
```

The first invocation will write the extracted fern-ts to `~/.cache/fern/runtime/<sha>/fern-ts` (or the platform equivalent); subsequent runs short-circuit.

## Tests

```bash
cargo test
```

`tests/delegate_smoke.rs` covers the four behaviors that matter most:

- Unknown subcommands and their args are forwarded verbatim.
- The dispatcher exits with the child's exit code.
- Rust-native subcommands never spawn fern-ts.
- `--ts` forces the delegated path even for Rust-native subcommands.
- A missing fern-ts produces an actionable error.

## Adding a new Rust-native command

1. Create `src/commands/<name>.rs` with a `pub const NAME: &str = "<name>";`, a `pub fn command() -> clap::Command`, and a `pub fn run(matches: &clap::ArgMatches) -> anyhow::Result<()>`.
2. Wire it into `src/commands/mod.rs` (`pub mod <name>;`), `src/cli.rs` (`.subcommand(crate::commands::<name>::command())`), and `src/dispatch.rs` (add the name to `RUST_NATIVE_SUBCOMMANDS` + a `match` arm).
3. If you are **replacing** an existing TS command, do so in two steps: ship the Rust impl behind `--rust-<name>`/`--ts` for one release, then flip the default.

## Migration playbook

| Phase | Goal | Status |
|-------|------|--------|
| 0 | Stand up the dispatcher; `doctor` Rust-native, everything else delegated. | **this PR** |
| 1 | Port `fern --version` / version-style commands to Rust (pure formatting). | future |
| 2 | Define shared schemas (`fern.config.json`, `generators.yml`) as `serde` structs with `schemars`; teach TS to consume the same JSON Schema. | future |
| 3 | Port I/O-heavy validation commands (`fern check`, `fern format`). | future |
| 4 | Port generation orchestration. Likely needs NAPI-RS to share the IR loader with TS during the transition. | future |
| 5 | Drop the bundled fern-ts. Rust is the only binary. | future |

## What this POC does NOT do (deferred)

- It does **not** wire into the npm distribution layout from PR #15923. That's the next step: replace `bin/fern` in the `@fern-api/fern` wrapper with the Rust binary, and ship the embedded fern-ts inside each `@fern-api/fern-<platform>` package.
- It does **not** publish provenance attestations for the Rust binary. CI lives elsewhere.
- It does **not** define shared schemas yet. That's Phase 2.
