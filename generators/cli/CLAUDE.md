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

OAuth **client-credentials** is driven entirely from the IR's `oauth`
auth scheme (`configuration.clientCredentials`), matching the SDK
generators. The generator lowers the token and refresh endpoint contracts,
including methods, request locations and paths, custom values, response
paths, scopes, token application, and environment URLs, into structured
runtime descriptors.

The interactive public-client flows are also emitted:
`configuration.authorizationCode` (Authorization Code + PKCE) lowers to a
`PkceLoginFlow` and `configuration.deviceCode` (RFC 8628) to a
`DeviceCodeLoginFlow`, each registered via `CliApp::login_flow(...)` (which
also wires the request-time `OAuth2KeyringProvider`). Only the fields the
SDK builders consume are emitted: client id, authorization / device / token
URLs, scopes, a loopback redirect port, and the extra literal parameter maps
(`authorizationParameters` / `deviceAuthorizationParameters` / `tokenParameters`
/ `refreshParameters` — e.g. an Auth0 `audience`), which are appended to the
authorize/token/refresh requests with protocol-reserved keys skipped. Still not
consumed and therefore skipped: the IR's `refreshUrl`, `tokenHeader`/`tokenPrefix`,
and environment-variable client IDs.

We deserialize through `@fern-fern/ir-sdk`'s `IrSerialization`, so
downstream code consumes typed `FernIr.IntermediateRepresentation` /
`FernIr.AuthScheme` values directly (with `visitDiscriminatedUnion` for
exhaustive dispatch). No hand-rolled IR types live in this generator.

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
| [`src/customConfig.ts`](src/customConfig.ts) | Type + boundary validator for `generators.yml`'s `config:` block. `binaryName`, `customCommands`, `rootGroup`. |
| [`src/detectAuth.ts`](src/detectAuth.ts) | Visits the IR's `auth.schemes` via `visitDiscriminatedUnion` and emits one auth binding per supported scheme, each tagged `placement: "root" \| "binding"`. Bearer, header, OAuth, and two-field basic go to root; only the `usernameOmit`/`passwordOmit` custom-provider variants stay binding-level. Synchronous — no disk reads. |
| [`src/wireTests/`](src/wireTests/) | Opt-in (`customConfig.generateWireTests`) mock-driven integration suite. `manifest.ts` reuses `@fern-api/mock-utils` `convertToWireMock` to derive one naming-independent case per endpoint example (`{method, path, params, body, response}`) and emits `wiremock/wire-test-cases.json`. `harness.ts` renders the generic `tests/wire_test.rs`. `generateWireTests.ts` wires them together after `copySpecs`. |
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
`visitDiscriminatedUnion` and produces a binding **only if the SDK's
`provider_for_binding` supports it**:

| IR variant | Emitted call | Env var source |
|---|---|---|
| `bearer` | `.auth_scheme_env("<key>", "<env>")` | `scheme.tokenEnvVar` ?? `<BIN>_TOKEN` |
| `header` | `.auth_scheme_env("<key>", "<env>")` | `scheme.headerEnvVar` ?? `<BIN>_API_KEY` |
| `basic` (both halves bound) | `.auth(BasicAuth::new("<key>").username_env(...).password_env(...))` at root, so `auth status` enumerates it [FER-11474] | `scheme.{username,password}EnvVar` ?? `<BIN>_{USERNAME,PASSWORD}` |
| `basic` (`usernameOmit`/`passwordOmit`) | `.auth_provider("<key>", BasicAuthProvider::…)` — stays binding-level; no root path for `BasicAuthProvider` | the bound half's env var; omitted half is a literal `""` |
| `oauth` (`clientCredentials`) | `.auth(OAuth2Auth::new("<key>").client_id_env(...).client_secret_env(...).token_endpoint(OAuth2Endpoint::new(...))...)` at root, with structured token/refresh request and response mappings | `scheme.clientId/clientSecretEnvVar` plus deterministic env vars for custom request properties; optional properties are omitted when unset |
| `oauth` (other config), `inferred`, `_other` | Skipped — no IR-modeled runtime provider | — |

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

### Wire tests (opt-in)

Setting `customConfig.generateWireTests: true` makes the generator emit a
mock-driven integration suite into the output:

- `wiremock/wire-test-cases.json` — a declarative manifest, one case per
  endpoint example, built from `@fern-api/mock-utils` `convertToWireMock`
  (the same engine the SDK wire tests use). Each case is **naming
  independent**: it carries `{method, path, params, body, response}`, not a
  CLI command chain.
- `tests/wire_test.rs` — a generic harness. Per case it starts an in-process
  `wiremock::MockServer`, resolves the CLI command chain by loading the same
  baked OpenAPI spec the binary runs on (via `fern_cli_sdk::openapi::
  load_openapi_spec` — so it never reproduces the CLI's command-naming
  rules), drives the compiled binary (`--base-url` + `--params` + `--json`),
  and asserts the call succeeded and the mock saw exactly one matching request
  (`Mock::expect(1)`), mirroring the SDK wire tests' `is_ok()` +
  `verify_request_count` model. For non-streaming endpoints whose stdout parses
  to the same JSON kind as the mocked body it additionally requires a byte-exact
  render; streaming/NDJSON responses re-shape the payload, so there it only
  requires the call to produce output.

**OAuth:** for client-credentials CLIs the manifest carries an `authMock` (token
endpoint method/path + a synthesized `{access_token, expires_in}` body at the
paths the CLI reads). The harness mounts it on every server so the token
exchange — which honors `--base-url` — succeeds before the business request.
The token/refresh endpoints themselves are excluded from the case list (the CLI
consumes them internally and never exposes them as commands).

**Body-modality skips:** the harness reads each endpoint's `RestMethod` and
skips (logging why, test still passes) the ones the generic `--params`/`--json`
driver can't feed: binary/file uploads (`--file`/`--audio`/…), multipart bodies,
and bodies the CLI flattened into per-field flags (which reject a whole-body
`--json`). This mirrors the SDK generator skipping endpoints it can't synthesize
a call for. Known remaining gap: endpoints whose IR example omits a required
body property fail the CLI's client-side schema validation — a data-quality
signal, not a harness bug.

No docker, no `RUN_WIRE_TESTS` gate — `wiremock` is already a `[dev-dependencies]`
entry in `sdk/Cargo.toml`, so `seed`'s `cargo test --all-features` compiles and
runs the suite automatically. The `query-parameters-openapi:with-wire-tests`
seed variant exercises this end to end.

```bash
# Regenerate the wire-test seed fixture and run the emitted suite locally.
pnpm seed test --generator cli --fixture query-parameters-openapi --skip-scripts
cd seed/cli/query-parameters-openapi/with-wire-tests && cargo test --all-features
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

### The vendored SDK is now the canonical home (cli-sdk is archived)

The SDK at [`./sdk/`](./sdk/) is the **canonical source** for the CLI
generator runtime. **Edit it directly here.**

It was historically a one-way vendored snapshot of
[`fern-api/cli-sdk`](https://github.com/fern-api/cli-sdk), pulled in by a
daily GitHub Actions sync. As of the cli-sdk sunset (FER-11468),
**`fern-api/cli-sdk` is archived (read-only)** and development moved into
this directory. The daily sync workflow and the sync tooling
(`sync-sdk.sh`, `sync-manifest.toml`, `read-manifest.py`,
`strip-fixture-tests.py`) have been removed — there is no upstream to sync
from anymore, and edits here are no longer clobbered.

Two artifacts of the old sync remain and are now maintained by hand:

- **`sdk/.sdk-ignore.json`** — dev-only globs that `build.mjs` excludes
  from customer output (smoke tests, demo binaries, `docs/`, etc.). If you
  add a file under `./sdk/` that should **not** ship in generated CLIs, add
  its glob here.
- **`sdk/.synced-from`** — records the final `cli-sdk@<sha>` that was
  vendored, for provenance.

**Must-rebuild list** (only when `Cargo.lock` changes):

```bash
pnpm turbo run dist:cli --filter @fern-api/cli-generator
docker build --no-cache -f docker/seed/Dockerfile.cli -t fernapi/cli-seed:latest .
pnpm turbo run dist:cli --filter @fern-api/seed-cli
```

**Note on `sdk/Cargo.toml`**: it is no longer a projection of an upstream
workspace manifest — it's a plain manifest you edit directly. The
`patchCargoToml.ts` anchors (`TEMPLATE_TOP_COMMENT`, `TEMPLATE_BIN_COMMENT`,
the `strip-schema` comment) must still be present; `patchCargoToml.test.ts`
catches any mismatch at test time.

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
