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
| [`src/patchDistWorkspace.ts`](src/patchDistWorkspace.ts) | Strips Fern-specific cargo-dist metadata (npm-scope, npm-package) from the shipped `dist-workspace.toml`; adds the Homebrew installer/publish-job/tap keys when `customConfig.distribution.homebrew` is set. |
| [`src/emitScoopWorkflow.ts`](src/emitScoopWorkflow.ts) | Renders the `publish-scoop` job appended to `ci.yml`. cargo-dist has no Scoop support, so this channel is hand-written: poll the release for the win64 archive, hash it, render the manifest, commit to the bucket repo. |
| [`src/identity.ts`](src/identity.ts) | `deriveBinaryName`, `toKebabCase`, `toEnvVarPrefix`. Resolves `customConfig.binaryName ?? ir.apiDisplayName`. |
| [`src/customConfig.ts`](src/customConfig.ts) | Type + boundary validator for `generators.yml`'s `config:` block. `binaryName`, `customCommands`, `rootGroup`, `packageIdentity`, `distribution`. |
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

## Package identity

By default the generated crate keeps the SDK template's Fern-owned
`[package]` block (`fern-cli-sdk`, `github.com/fern-api/cli-sdk`). Set
`customConfig.packageIdentity` to publish under the customer's own
identity instead:

```yaml
config:
  binaryName: agentmail
  packageIdentity:
    name: agentmail-cli
    description: Command-line interface for the AgentMail API.
    license: MIT
    repository: https://github.com/agentmail-to/agentmail-cli-fern
    homepage: https://agentmail.to
    authors: ["AgentMail <support@agentmail.cc>"]
    keywords: ["email", "agent"]
```

Only the fields you set are rewritten; the rest keep the template's
values. `patchCargoToml` renames the matching `Cargo.lock` entry in the
same pass — `[package] name` and the lockfile must agree or
`cargo build --locked` fails to resolve the crate.

`[lib] name = "fern_cli_sdk"` is deliberately **not** configurable: every
`use fern_cli_sdk::...` in the vendored `src/` tree resolves through it.

## Distribution channels

Every generated CLI ships GitHub Release archives plus `curl | bash` /
`irm | iex` installers (cargo-dist `release.yml`), and npm packages when
`output.location: npm` is configured (`ci.yml`). Homebrew and Scoop are
opt-in on top of that, via `customConfig.distribution`:

```yaml
config:
  binaryName: acme-cli
  distribution:
    homebrew:
      tap: acme/homebrew-tap        # required, "<owner>/<repo>"
      formula: acme                 # optional, defaults to binaryName
      tokenEnvironmentVariable: HOMEBREW_TAP_TOKEN   # optional, default
    scoop:
      bucket: acme/scoop-bucket     # required, "<owner>/<repo>"
      tokenEnvironmentVariable: SCOOP_BUCKET_TOKEN   # optional, default
```

The two channels are **not** symmetric, because cargo-dist supports one
and not the other:

| | Homebrew | Scoop |
|---|---|---|
| Mechanism | cargo-dist native installer | job we render |
| Config | `installers` / `publish-jobs` / `tap` / `formula` in `dist-workspace.toml` (`patchDistWorkspace.ts`) | none |
| Job lives in | `release.yml` (`emitReleaseWorkflow.ts`) | `release.yml` (`emitScoopWorkflow.ts`) |
| Artifact source | cargo-dist's own `dist-manifest.json` | polls the GitHub Release for the win64 zip |
| Arch coverage | every target in `targets` | `64bit` only |

Both jobs live in `release.yml`, gated on `host` and on cargo-dist's own
`announcement_is_prerelease` expression. Scoop's was briefly in `ci.yml`
to keep `release.yml` a verbatim cargo-dist artifact; that was wrong on
three counts. `ci.yml` gated it on `check`/`compile`/`test`, which
`release.yml` knows nothing about — so one flaky test published Homebrew
while the bucket silently stayed behind. It needed a 30-minute poll,
because a job in `ci.yml` cannot `needs:` a job in `release.yml`. And a
retry cost ~12 minutes of unrelated build and test before an 8-second
publish. `needs: host` removes all three.

`emitReleaseWorkflow.ts` keeps **one** cargo-dist template ending after
the `host` job; publish jobs and the terminal `announce` job are appended
by `constructReleaseWorkflowYaml`, because `announce`'s `needs` list
depends on which publish jobs are on. `emitReleaseWorkflow.test.ts`
asserts the unconfigured output is byte-identical to a committed
pre-Homebrew seed fixture, so the composition cannot drift from what
cargo-dist emits.

Enabling Homebrew also points `[package]` at the consumer
(`withDistributionDefaults` in [`patchCargoToml.ts`](src/patchCargoToml.ts)).
cargo-dist renders the `.rb` straight off that block:

| `[package]` | Where it lands in the formula |
|---|---|
| `repository` | the per-arch **release download URLs** |
| `homepage` | `homepage "..."` |
| `description` | `desc "..."` |

`repository` is load-bearing: left at the template's value the URLs
resolve to `github.com/fern-api/cli-sdk/releases/...` and every
`brew install` 404s. All three default from `repoUrl` / the API display
name when unset. Deliberately scoped to the Homebrew case — applying
them unconditionally would change every existing github-mode
`Cargo.toml`. `name` is *not* defaulted (it would rename the crate and
its `Cargo.lock` entry); it only affects archive filenames, which stay
internally consistent either way.

Three things generation cannot do, which the consumer must:

1. Create the tap (`homebrew-*`) and bucket repos, **public**.
2. Add a PAT with write access to them under the configured secret names.
   The built-in `GITHUB_TOKEN` cannot push cross-repo — `customConfig.ts`
   rejects it rather than emitting a pipeline that fails after the tag is
   cut.
3. Keep GitHub Releases public. Both channels fetch archives from the
   release URL. This is a real asymmetry with npm, whose packages embed
   the binary bytes and so work from a private source repo.

Only honored for `output.location: github` — both channels publish *from*
a tagged release, so `runPipeline` drops the config outside github output
mode, the same gate npm publishing sits behind. Omitting `distribution`
entirely leaves output byte-identical, so no generator migration is
needed.

**Known gap — no self-update awareness.** The Rust runtime has no
installation-method detection, so `<cli> self-update` does not know to
run `brew upgrade` / `scoop update` for a brew/scoop install. That is
separate work in `sdk/src/`.

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

**Body modalities are driven, not skipped:** the harness reads each endpoint's
`RestMethod` and feeds the body the way that endpoint expects it — real temp
fixture files through the per-field upload flags for binary/multipart, and the
opaque `--json` body otherwise (including endpoints the CLI also flattened into
per-field flags). Multipart cases additionally assert the `multipart/form-data`
content type and, per part, its `Content-Disposition` name, its `Content-Type`,
and `filename=` — the latter two pinned in the same substring as the
disposition, since asserting them standalone would be satisfied by any sibling
part. Fixture files are written with a `.txt` extension on purpose: a part's
media type resolves as declared `encoding` → file extension →
`application/octet-stream`, and an extensionless fixture would only ever
exercise that last fallback.

**Case twins.** Every happy-path case is expanded into variants that share its
request shape, so one endpoint example covers several failure modes:

| Variant | Suffix | Asserts |
|---|---|---|
| positive | — | exit 0, one matching request, rendered output matches the mocked body |
| negative | `_error` | mock serves 422 with a non-empty JSON error body; CLI must exit non-zero *and* still have sent the correct request |
| optional file omitted | `_optfileomitted` | optional file flags dropped; call still succeeds and the omitted field is absent from the wire body |

Twins inherit the parent's matchers rather than re-deriving them — a negative
twin that asserted a different request shape would not be testing the same call.

**Auth assertions are per endpoint.** `requiresAuth` (from the IR's
`endpoint.auth`) gates them, matching what `mock-utils` already does for its own
auth-header matchers. Requiring a credential from an endpoint that declares none
makes its mock unmatchable — an OAuth token endpoint exposed as a normal command
authenticates via its request body and correctly sends no bearer. Under
`ENDPOINT_SECURITY` auth (`endpointSecurityAuth`) the blanket bearer assertion is
dropped entirely, since each endpoint picks its own scheme. The inverse is *not*
asserted: an endpoint declaring no auth is still allowed to send a credential.

**When a case fails**, the harness reports the command, exit code, stdout,
stderr, and the requests the server actually received next to what was expected
— so "never sent the request" is distinguishable from "sent the wrong one". Note
that a matcher miss makes the mock server answer 404, which the CLI faithfully
surfaces as a non-zero exit; the request-match assertion therefore runs *before*
the exit-code check, or the CLI gets blamed for a mock that never matched.

**Bodies are reconciled against the spec.** A case body comes from an IR
example, but the generated CLI validates request bodies against the raw spec it
embeds via `include_str!` (`validate_properties` in `sdk/src/openapi/executor.rs`
reads `required` straight off the parsed spec). Those two disagree whenever a
property is `required` in the spec but has a nullable schema — `anyOf: [{type:
array}, {type: null}]` — because the importer models that as optional and example
generation then legitimately skips it. The CLI rejects its own case with
`error[validation]: Missing required property` and exits before any request is
sent, so the case fails having never reached the mock.

[`specRequiredBody.ts`](src/wireTests/specRequiredBody.ts) fills such properties
from the spec's own schema (`null` where permitted, else a minimal typed value,
honoring `const`/`enum`), recursing so an omission inside an array element the
example *did* supply is fixed too. Properties it can't derive confidently are
left absent on purpose. Repairs are recorded on the case as
`specFilledBodyProperties` and named in failure diagnostics, so a spec-derived
value is never mistaken for an author-written one.

No seed fixture exercises this path, and can't: seed generates examples with
optional properties **included**, while `fern generate --local` does not
(`GenerationRunner` passes `includeOptionalRequestPropertyExamples: true`,
`runLocalGenerationForWorkspace` passes `false`). So the omission only occurs on
the production path — which is why this class of bug reaches customers and never
our fixtures. Coverage is the unit tests in
[`__test__/specRequiredBody.test.ts`](src/__test__/specRequiredBody.test.ts).

The repair treats a symptom. The root cause is upstream: the importer emits a
request example missing a required property, and classifies it as
*user-specified*, so it outranks the autogenerated one
(`manifest.ts` prefers `userSpecifiedExamples[0]`). Fixing it there would also
stop SDKs typing such a property as optional when the API requires it.

**Login-flow coverage** lives in `cli-oauth-login-flow:with-wire-tests` — the only
fixture whose manifest carries `loginTokenSetup`, so the only one exercising the
`auth login --with-token` seed plus request-time keyring → bearer injection. Its
spec mixes authenticated operations with `security: []` ones on purpose, so it
pins the *gate* as well as the assertion; reverting the gate fails exactly the
unauthenticated cases and leaves the authenticated ones green. Client-credentials
(the `authMock` path) is covered separately by
`oauth-client-credentials-openapi:with-wire-tests`.

Still unit-tested only: `ENDPOINT_SECURITY` auth (`endpointSecurityAuth`). The
`endpoint-security-auth` test definition exists but sits in `allowedFailures`, so
it can't host wire tests yet.

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
