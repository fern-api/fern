# CLI Generator (`@fern-api/cli-generator`)

Generator that produces a Rust **command-line binary** from an OpenAPI
spec — not a Rust SDK. The user's CLI is built on the bundled
`fern-cli-sdk` library: at codegen time we copy that library's source
verbatim into the output and emit a thin `main.rs` that wires the
user's OpenAPI spec into the library's `CliApp` builder.

Different in spirit from the other generators in this tree: there is no
AST builder, no per-endpoint code generation. The only codegen is
`cli/<binaryName>/main.rs` (~10 lines) and a small substitution in
`Cargo.toml`. Everything else is a verbatim copy of [`./sdk/`](./sdk/),
which is a hand-authored Rust library.

**Source of truth: the Fern IR.** The mounted `ir.json` is authoritative
for the user's API identity (`apiDisplayName`) and auth scheme metadata
(`auth.schemes` with resolved `usernameEnvVar`, `tokenEnvVar`, etc.,
exactly as the user declared them in `generators.yml`'s `auth-schemes`
block). The raw OpenAPI specs under `/fern/specs/` are only used for one
thing: the literal bytes baked into `main.rs` via `include_str!`. We do
**not** walk `info.title` or `components.securitySchemes` — those are
either redundant with or strictly less rich than the IR.

We deserialize through `@fern-fern/ir-sdk`'s `IrSerialization`, so
downstream code consumes typed `FernIr.IntermediateRepresentation` /
`FernIr.AuthScheme` values directly (with `_visit` for exhaustive
dispatch). No hand-rolled IR types live in this generator.

## Architecture

```
   /fern/ir.json               /fern/specs/specs-manifest.json
   (Fern IR — authoritative)   (raw specs — bytes only)
        │                                   │
        ▼                                   ▼
   ┌────────────────────────────────────────────────┐
   │              cli.ts (entry)                    │◄── getCustomConfig
   └──────────────────────┬─────────────────────────┘
                          ▼
   ┌────────────────────────────────────────────────┐
   │            runPipeline (testable)              │
   └──────────────────────┬─────────────────────────┘
                          │
   hasOpenApiSpecs ──► readIrSummary(ir.json) ──► deriveBinaryName ──► detectAuthBindings
   (early skip)                                   (customConfig         (from ir.auth.schemes:
                                                   .binaryName          tokenEnvVar /
                                                   > ir.apiDisplayName  usernameEnvVar /
                                                   > clear error)       passwordOmit / …)
                          │
                          ▼
                copySdk → patchCargoToml → patchDistWorkspaceToml → copySpecs
                (image-baked sdk template)                          (writes spec bytes +
                                                                     renders main.rs from
                                                                     authBindings)
```

The order in `runPipeline` is locked in by
[`__test__/runPipeline.test.ts`](src/__test__/runPipeline.test.ts):

1. **`copySdk(outputDir)`** lays down the SDK template (recursive copy
   of `/dist/sdk/`).
2. **`patchCargoToml({ outputDir, binaryName })`** rewrites the
   `[[bin]] name` and `[[bin]] path` to `<binaryName>` and
   `cli/<binaryName>/main.rs` respectively. `[package] name`,
   `[lib] name`, and the `strip-schema` `[[bin]]` are deliberately
   untouched (`[package] name = "fern-cli-sdk"` matches the shipped
   `Cargo.lock`, which cargo's `--locked` would otherwise reject).
3. **`copySpecs({ outputDir, binaryName })`** writes each mounted
   OpenAPI spec to `cli/<binaryName>/<filename>.json` and emits
   `cli/<binaryName>/main.rs` from scratch via `renderMainRs`.

If you reorder these steps, no unit test asserts on the file layout
mid-pipeline — only the final state matters — but they will break each
other (patchCargoToml needs the Cargo.toml on disk; copySpecs writes
the path the patched Cargo.toml references).

## Module map

| File | Role |
|------|------|
| [`src/cli.ts`](src/cli.ts) | Process entry: parses config, wraps `runPipeline` with `GeneratorNotificationService` updates. Thin. |
| [`src/runPipeline.ts`](src/runPipeline.ts) | The codegen orchestration. Pure-ish — takes paths + config, returns outcome. The seam for unit tests. |
| [`src/ir.ts`](src/ir.ts) | `readIrSummary` — runs the IR JSON through `@fern-fern/ir-sdk`'s `IrSerialization.IntermediateRepresentation.parse` and returns the two slices the generator touches: `apiDisplayName` and the typed `FernIr.AuthScheme[]`. |
| [`src/copySdk.ts`](src/copySdk.ts) | Recursive copy of `/dist/sdk/` → `outputDir`. |
| [`src/copySpecs.ts`](src/copySpecs.ts) | Reads `/fern/specs/specs-manifest.json`, copies each spec into `cli/<binaryName>/`, emits `main.rs` from a supplied list of auth bindings. |
| [`src/patchCargoToml.ts`](src/patchCargoToml.ts) | Literal string replacements against the shipped `Cargo.toml`. Throws if no anchors matched. |
| [`src/patchDistWorkspace.ts`](src/patchDistWorkspace.ts) | Strips Fern-specific cargo-dist metadata (npm-scope, npm-package) from the shipped `dist-workspace.toml`. |
| [`src/identity.ts`](src/identity.ts) | `deriveBinaryName`, `toKebabCase`, `toEnvVarPrefix`. Resolves `customConfig.binaryName ?? ir.apiDisplayName`. |
| [`src/customConfig.ts`](src/customConfig.ts) | Type + boundary validator for `generators.yml`'s `config:` block. `binaryName` and `customCommands` (unified flag controlling types/SDK/glue generation). |
| [`src/detectAuth.ts`](src/detectAuth.ts) | Visits the IR's `auth.schemes` (via `FernIr.AuthScheme._visit`) and emits one `.auth_scheme_env(...)` / `.auth_basic_scheme(...)` per supported scheme. Synchronous — no disk reads. |
| [`build.mjs`](build.mjs) | Bundles `src/cli.ts` → `dist/cli.cjs`, copies `./sdk/` → `./dist/sdk/` with `SDK_IGNORE` (template dev files that shouldn't ship). |
| [`Dockerfile`](Dockerfile) | Bakes `dist/` into the generator image. Entrypoint reads `/fern/config.json`. |
| [`./sdk/`](./sdk/) | Hand-authored Rust SDK — the bulk of the CLI's runtime behavior. Edit this when you need to extend what `CliApp` can do. |

## Identity rules

The generator derives the user's binary name from one of:

1. `customConfig.binaryName` if set in `generators.yml`
2. else the IR's `apiDisplayName` (Fern's canonical name for the
   workspace), kebab-cased
3. else fail with a clear error

The derived name flows through:
- `Cargo.toml`'s `[[bin]] name = "<binaryName>"` and `[[bin]] path =
  "cli/<binaryName>/main.rs"` (via `patchCargoToml`)
- The directory `cli/<binaryName>/` (via `copySpecs`)
- The `CliApp::new("<binaryName>")` call in `main.rs` (via
  `renderMainRs`)
- Env-var fallback prefix `<BIN>_TOKEN` / `<BIN>_API_KEY` /
  `<BIN>_USERNAME` / `<BIN>_PASSWORD` when the IR doesn't pin one
  (via `toEnvVarPrefix` + `detectAuth`)

## Auth detection

Each scheme in the IR's `auth.schemes` is visited via
`FernIr.AuthScheme._visit` and produces a binding **only if the SDK's
`provider_for_binding` supports it**:

| IR variant | Emitted call | Env var source |
|---|---|---|
| `bearer` | `.auth_scheme_env("<key>", "<env>")` | `scheme.tokenEnvVar` ?? `<BIN>_TOKEN` |
| `header` | `.auth_scheme_env("<key>", "<env>")` | `scheme.headerEnvVar` ?? `<BIN>_API_KEY` |
| `basic` | `.auth_basic_scheme("<key>", <user>, <pass>)` | `scheme.{username,password}EnvVar` ?? `<BIN>_{USERNAME,PASSWORD}`; `*Omit: true` becomes `AuthCredentialSource::literal("")` |
| `oauth`, `inferred`, `_other` | Skipped — the SDK has no runtime provider yet | — |

Env-var names come from the IR first because that's where the user's
`generators.yml`-declared values end up after Fern resolves them. The
fallbacks intentionally do **not** mangle in the scheme name (no more
`<BIN>_<SCHEME>_TOKEN`) — for the common single-scheme case that
produces a clean `CLOSE_API_KEY` / `ACME_TOKEN`. If a user with multiple
schemes wants per-scheme isolation, they pin env vars explicitly in
`auth-schemes`.

## Develop / test

```bash
# Build the generator (bundles TS + copies sdk/ → dist/sdk/)
cd generators/cli
node build.mjs

# Unit tests for the TS generator
node ../../node_modules/vitest/vitest.mjs --run --root .

# SDK source: edit ./sdk/ and verify it still builds + tests pass.
cd sdk
cargo build --locked --all-features --tests
cargo test --locked --all-features

# End-to-end: run the generator via seed against a real fixture.
# (from repo root, after `pnpm seed:build`)
pnpm seed test --generator cli --fixture query-parameters-openapi --skip-scripts
# Inspect the output:
ls seed/cli/query-parameters-openapi/no-custom-config/cli/
# Run cargo build inside the cached seed image:
docker run --rm \
  -v $(pwd)/seed/cli/query-parameters-openapi/no-custom-config:/workspace \
  -w /workspace --entrypoint sh fernapi/cli-seed:latest \
  -c 'cargo build --locked --all-features --tests'
```

## Common tasks

### Adding a new field to `customConfig`

1. Extend `FernCliCustomConfig` in [`src/customConfig.ts`](src/customConfig.ts)
2. Extend `validateCustomConfig` to type-check the new field
3. Thread it through `getCustomConfig → runPipeline → [consumer]`
4. Add a test in [`__test__/customConfig.test.ts`](src/__test__/customConfig.test.ts)

### Supporting a new auth scheme

The SDK has to support it first — see
[`sdk/src/auth/builder.rs#provider_for_binding`](sdk/src/auth/builder.rs).
Once the SDK can lower the scheme to a provider:

1. Add a branch to `bindingFor` in [`src/detectAuth.ts`](src/detectAuth.ts)
2. Add a unit test in [`__test__/detectAuth.test.ts`](src/__test__/detectAuth.test.ts)
3. Add a fixture or extend one with the new scheme to exercise end-to-end

### Changing the SDK template

The SDK lives at [`./sdk/`](./sdk/). It's a Rust workspace that builds
on its own with `cargo build` — treat it like any normal Rust library.
Template-author-only files (the `cli/openapi-fixture/` dev bin, the
fixture-coupled tests under `tests/cli_integration.rs` and
`tests/openapi_fixture_wire.rs`) are listed in `SDK_IGNORE` in
[`build.mjs`](build.mjs) so they never ship to user output.

If you change `sdk/Cargo.lock`, **rebuild the seed image**:

```bash
docker build --no-cache -f docker/seed/Dockerfile.cli -t fernapi/cli-seed:latest .
```

The image warms a cargo target cache against the committed
`Cargo.lock`; mounted fixtures use `cargo build --locked` and would
otherwise refuse to start when the dep tree drifts.

### Syncing the vendored SDK from cli-sdk

The SDK at [`./sdk/`](./sdk/) is a **vendored snapshot** of
[`fern-api/cli-sdk`](https://github.com/fern-api/cli-sdk). A daily
GitHub Actions workflow (`.github/workflows/sync-cli-sdk.yml`) pulls
`cli-sdk` `main` HEAD into this directory, opens a PR for human review,
and relies on seed tests + a human reviewer as the trust boundary.

**How the sync works:**

[`generators/cli/scripts/sync-sdk.sh`](scripts/sync-sdk.sh) takes a
local cli-sdk checkout and:

1. **Rsyncs source files** (`src/`, `tests/`, `cli/openapi-fixture/`)
   under the same `SDK_IGNORE` rules as `build.mjs` — template-only
   files (smoke tests, demo binaries, `.github/`, `docs/`, etc.) are
   excluded.
2. **Projects `Cargo.toml`** — the vendored manifest is a deterministic
   projection of cli-sdk's workspace manifest, **not** a copy. A naïve
   `cp` would re-introduce `[workspace]`, `version.workspace = true`,
   and ~35 `[[bin]]` entries. The projection:
   - **Drops** `[workspace]` + `[workspace.package]`
   - **Keeps only** the `openapi-fixture` and `strip-schema` `[[bin]]`
     entries
   - **Rewrites** `version.workspace = true` → literal
     `version = "<synced>"`
   - **Injects** the 3 Fern comment blocks that `patchCargoToml.ts`
     anchors on (`TEMPLATE_TOP_COMMENT`, `TEMPLATE_BIN_COMMENT`, the
     `strip-schema` "Internal tool…" comment) plus `readme = "README.md"`
     and `[package.metadata.dist] dist = false`
   - **Copies verbatim**: `[dependencies]`, `[features]`, `[lib]`,
     `[profile.dist]`, `[build-dependencies]`, `[dev-dependencies]`
3. **Regenerates `Cargo.lock`** so `cargo build --locked` is honest.
4. **Writes `.synced-from`** with `cli-sdk@<sha>` + timestamp for
   provenance tracking.

**Manual sync** (when you can't wait for the daily cron):

```bash
# From the fern repo root:
git clone --depth 1 https://github.com/fern-api/cli-sdk.git /tmp/cli-sdk
bash generators/cli/scripts/sync-sdk.sh /tmp/cli-sdk
# Review the diff, then commit.
```

**Must-rebuild list** (only when `Cargo.lock` changes):

```bash
pnpm turbo run dist:cli --filter @fern-api/cli-generator
docker build --no-cache -f docker/seed/Dockerfile.cli -t fernapi/cli-seed:latest .
pnpm turbo run dist:cli --filter @fern-api/seed-cli
```

**Key invariant**: every `patchCargoToml.ts` anchor must be present in
the projected `Cargo.toml`. If you rename a comment block in the
template, update `sync-sdk.sh`'s projection accordingly — the
`patchCargoToml.test.ts` will catch any mismatch at test time.

## Conventions

- **No TOML parser**: `patchCargoToml` uses literal string replacement
  against anchors. If the SDK Cargo.toml is ever reformatted, the
  patcher throws (caught by
  [`__test__/patchCargoToml.test.ts`](src/__test__/patchCargoToml.test.ts)
  which anchors against the real file).
- **Fail fast at the boundary**: `deriveBinaryName` and `patchCargoToml`
  throw with actionable messages rather than producing half-formed
  output. The pipeline doesn't write files until the binary name is
  resolved.
- **IR is read once per pipeline run**: `readIrSummary` parses
  `/fern/ir.json` into a narrow typed summary that flows through
  `deriveBinaryName` and `detectAuthBindings`. We don't re-read the IR
  or the raw specs anywhere else in the pipeline.
- **Generated `main.rs` is regenerated each run**: never edit it
  manually; your changes will be wiped on the next `fern generate`.
  Use the `customize/` extension surface (planned — see
  [`sdk/docs/DESIGN.md`](sdk/docs/DESIGN.md)) for user-author code.
