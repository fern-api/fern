# CLI Generator (`@fern-api/cli-generator`)

Generator that produces a Rust **command-line binary** from an OpenAPI
spec — not a Rust SDK. The user's CLI is built on the bundled
`fern-cli-sdk` library: at codegen time we copy that library's source
verbatim into the output and emit a thin `main.rs` that wires the
user's OpenAPI spec into the library's `CliApp` builder.

Different in spirit from the other generators in this tree: there is no
IR pass, no AST builder, no per-endpoint code generation. The only
codegen is `cli/<binaryName>/main.rs` (~10 lines) and a small
substitution in `Cargo.toml`. Everything else is a verbatim copy of
[`./sdk/`](./sdk/), which is a hand-authored Rust library.

## Architecture

```
                          /fern/specs/specs-manifest.json
                          (mounted by local-workspace-runner)
                                         │
                                         ▼
                           ┌─────────────────────────────┐
   parseGeneratorConfig ──►│        cli.ts (entry)       │◄── getCustomConfig
                           └──────────────┬──────────────┘
                                          ▼
                           ┌─────────────────────────────┐
                           │    runPipeline (testable)   │
                           └──────────────┬──────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        ▼                                 ▼                                 ▼
   hasOpenApiSpecs              deriveBinaryName              copySdk / patchCargoToml / copySpecs
   (early skip)             (customConfig.binaryName            ▲          ▲             ▲
                              > spec info.title                 │          │             │
                              > clear error)                    │          │             │
                                                                │          │             │
                                                          /dist/sdk      anchors      detectAuthBindings
                                                         (image-baked)   ["openapi-    (securitySchemes)
                                                                          fixture"]
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
| [`src/copySdk.ts`](src/copySdk.ts) | Recursive copy of `/dist/sdk/` → `outputDir`. |
| [`src/copySpecs.ts`](src/copySpecs.ts) | Reads `/fern/specs/specs-manifest.json`, copies each spec into `cli/<binaryName>/`, emits `main.rs`. |
| [`src/patchCargoToml.ts`](src/patchCargoToml.ts) | Two literal string replacements against the shipped `Cargo.toml`. Throws if no anchors matched. |
| [`src/identity.ts`](src/identity.ts) | `deriveBinaryName`, `toKebabCase`, `toEnvVarPrefix`. The single source of truth for "what is this CLI called". |
| [`src/customConfig.ts`](src/customConfig.ts) | Type + boundary validator for `generators.yml`'s `config:` block. Only `binaryName` for now. |
| [`src/detectAuth.ts`](src/detectAuth.ts) | Walks `components.securitySchemes` across mounted specs; emits one `.auth_scheme_env(...)` / `.auth_basic_scheme(...)` per supported scheme. |
| [`src/specCache.ts`](src/specCache.ts) | One-pipeline-scoped parsed-spec cache. Avoids re-reading + re-parsing each mounted spec when `deriveBinaryName` and `detectAuth` both want it. |
| [`build.mjs`](build.mjs) | Bundles `src/cli.ts` → `dist/cli.cjs`, copies `./sdk/` → `./dist/sdk/` with `SDK_IGNORE` (template dev files that shouldn't ship). |
| [`Dockerfile`](Dockerfile) | Bakes `dist/` into the generator image. Entrypoint reads `/fern/config.json`. |
| [`./sdk/`](./sdk/) | Hand-authored Rust SDK — the bulk of the CLI's runtime behavior. Edit this when you need to extend what `CliApp` can do. |

## Identity rules

The generator derives the user's binary name from one of:

1. `customConfig.binaryName` if set in `generators.yml`
2. else the spec's `info.title`, kebab-cased — single-spec only
3. else fail with a clear error

Multi-spec workspaces **must** set `customConfig.binaryName` — there's
no sensible auto-derivation from multiple titles. The error tells the
user exactly which field to add.

The derived name flows through three places:
- `Cargo.toml`'s `[[bin]] name = "<binaryName>"` and `[[bin]] path =
  "cli/<binaryName>/main.rs"` (via `patchCargoToml`)
- The directory `cli/<binaryName>/` (via `copySpecs`)
- The `CliApp::new("<binaryName>")` call in `main.rs` (via
  `renderMainRs`)
- Env-var prefix `<BINARYNAME>_<SCHEMENAME>_<KIND>` (via
  `toEnvVarPrefix` + `detectAuth`)

## Auth detection

Each scheme in `components.securitySchemes` (unioned across multi-spec
workspaces, first-wins per the SDK's
[`merge_security_schemes`](sdk/src/openapi/app.rs)) emits one binding
**only if the SDK's `provider_for_binding` supports it**:

| Spec scheme | Emitted call |
|------|------|
| `http: bearer` | `.auth_scheme_env("<n>", "<BIN>_<SCHEME>_TOKEN")` |
| `oauth2` | `.auth_scheme_env("<n>", "<BIN>_<SCHEME>_TOKEN")` |
| `apiKey: header` | `.auth_scheme_env("<n>", "<BIN>_<SCHEME>_API_KEY")` |
| `http: basic` | `.auth_basic_scheme(...)` with `AuthCredentialSource::from_env(_USERNAME)` + `_PASSWORD` |
| Anything else | Skipped silently (matches SDK behavior) |

Env-var names **always include the scheme name**, even for single-scheme
workspaces. This is deliberate: it means adding a second spec with a
second scheme later doesn't silently rename existing env vars from
`<BIN>_TOKEN` to `<BIN>_<SCHEME>_TOKEN` and break user setups.

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
- **One `SpecCache` per pipeline run**: parsed JSON for each mounted
  spec is held only for the duration of one `runPipeline` call. Fresh
  cache on the next invocation.
- **Generated `main.rs` is regenerated each run**: never edit it
  manually; your changes will be wiped on the next `fern generate`.
  Use the `customize/` extension surface (planned — see
  [`sdk/docs/DESIGN.md`](sdk/docs/DESIGN.md)) for user-author code.
