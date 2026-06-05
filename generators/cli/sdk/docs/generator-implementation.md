# Generator implementation spec

This document is for engineers building `fernapi/fern-cli` — the Fern generator that emits a customer's CLI project. It complements [DESIGN.md](../DESIGN.md), which specifies the SDK runtime that the generated CLI links against. If DESIGN.md answers *"what does the CLI do at runtime?"*, this doc answers *"how does the generator produce it?"*.

The generator's job is small and well-bounded: take the Fern IR + the customer's `generators.yml` config, emit a buildable Rust project, open a PR. Most of the cleverness lives in the SDK; the generator is a project scaffolder. Customer customizations live inline in `main.rs` and are preserved across regenerations by [Fern Replay](https://buildwithfern.com/learn/sdks/overview/custom-code#replay)'s 3-way merge — the generator itself doesn't track customer state.

## Scope

**One CLI binary per IR.** The generator runs once per Fern API (i.e., once per generator-group invocation against one API), reading one IR and producing one CLI project. A customer who declares multiple APIs in their Fern config gets multiple generator invocations and multiple CLI binaries. Multi-binding within a *single* CLI happens because one IR can contain multiple transport classes inside it (HTTP services + WebSocket channels + gRPC services) — see ["Transport-class discovery"](#transport-class-discovery).

What this document defines:

- Inputs: the Fern IR (what the generator reads) and the customer's `generators.yml` config (minimal — just `cli-name` and `display-name`).
- Outputs: every file the generator writes, when it writes them, and what's in them.
- Algorithms: how bindings are inferred from the IR, how Cargo deps are merged across regens.
- Failure modes: what the generator does on IR-level conflicts, name collisions, unsupported transports, etc.
- **IR additions needed**: two fields the IR doesn't carry today (`ServerVariable.envVar`, per-service/channel spec provenance) that the generator can fall back without but produces better output with.

What this document *doesn't* define:

- The SDK's runtime hook surface — see [DESIGN.md](../DESIGN.md#extension-surface).
- Customer-facing docs for the generated CLI — see [customize.md](customize.md).
- Distribution (cargo-dist config, npm/Homebrew packaging) — see the existing [README.md](../README.md#distribution) section.
- The Replay merge algorithm itself — see the [Replay docs](https://buildwithfern.com/learn/sdks/overview/custom-code#replay).

## Inputs

The generator runs in the Fern backend pipeline. It receives two things:

1. **The Fern IR** — a normalized, post-merge representation of *one* Fern API (built by Fern's frontend from the customer's OpenAPI / AsyncAPI / proto / OpenRPC sources for that API). One IR in, one CLI project out. The IR is the source of truth for what services and channels the API exposes, what auth it uses, and what environments / server variables it ships with. The generator never re-parses raw spec files; it walks the IR.
2. **The customer's `generators.yml` config** — minimal: just `cli-name` (and optionally `display-name`). No bindings list, no auth wiring, no overrides. Everything else is inferred from the IR.

The spec files themselves (the original `*.yml` / `*.json` the customer authored) are *separate* from the IR. They get copied verbatim into the generated repo's `specs/` directory so the generated CLI can `include_str!` them at compile time. The IR is what the *generator* reads; the spec files are what the *generated CLI* embeds.

### What the IR provides

The IR's full type definitions live in [fern-api/fern](https://github.com/fern-api/fern/tree/main/packages/ir-sdk) (`ir-types-latest`). Relevant top-level fields the generator reads:

| IR field | Type / shape | Used for |
|---|---|---|
| `apiName` | `commons.NameOrString` | Default binding name root |
| `apiDisplayName` | `optional<string>` | `display-name` default if `generators.yml` didn't set one |
| `auth.schemes` | `list<AuthScheme>` (union of `bearer` / `basic` / `header` / `oauth` / `inferred`) | What auth providers to wire on each binding |
| `auth.requirement` | `ALL` / `ANY` / `ENDPOINT_SECURITY` | What `AuthStrategy` to pass to each binding |
| `services` | `map<ServiceId, HttpService>` | The HTTP / gRPC operations the CLI exposes. Each service's `transport` field (a `Transport` union: `http: {}` or `grpc: GrpcTransport`) determines whether it goes into the HTTP binding or the gRPC binding. |
| `websocketChannels` | `optional<map<WebSocketChannelId, WebSocketChannel>>` | Drives the WebSocket binding (if any) |
| `environments` | `optional<EnvironmentsConfig>` | Base URLs, URL templates, `urlVariables` (server variables) |
| `headers` | `list<HttpHeader>` | API-wide headers — emitted as `global_headers` on each binding |
| `idempotencyHeaders` | `list<HttpHeader>` | Wired via `idempotency_header_env` |
| `subpackages` / `rootPackage` | `map<SubpackageId, Subpackage>` / `Package` | Command-tree structure — handled by the SDK at runtime; mentioned here for completeness |

#### Auth scheme inference

The IR's `AuthScheme` union maps directly onto SDK auth builders:

| `AuthScheme` variant | Relevant fields | Generator emits |
|---|---|---|
| `bearer` (`BearerAuthScheme`) | `key`, `tokenEnvVar` | `b.auth_scheme_env(key, tokenEnvVar)` (or `b.auth_scheme(...)` with no env if `tokenEnvVar` is `None`) |
| `basic` (`BasicAuthScheme`) | `key`, `usernameEnvVar`, `passwordEnvVar` | `b.auth_basic_scheme(key, AuthCredentialSource::from_env(usernameEnvVar), AuthCredentialSource::from_env(passwordEnvVar))` |
| `header` (`HeaderAuthScheme`) | `key`, `name`, `prefix`, `headerEnvVar` | `b.auth_provider(key, HeaderAuthProvider::new(key, name, AuthCredentialSource::from_env(headerEnvVar), prefix.is_some()))` |
| `oauth` (`OAuthScheme`) | `key`, `configuration` (currently `clientCredentials` only) | `b.auth_provider(key, OAuth2TokenProvider::new(...).with_cache(cli_name))` wired from `clientIdEnvVar` / `clientSecretEnvVar` / `tokenEndpoint` |
| `inferred` (`InferredAuthScheme`) | `key`, `tokenEndpoint` | Same as `oauth` — token-endpoint-based custom auth. Wired the same way `OAuth2TokenProvider` handles refresh. |

If an env-var field on a scheme is missing in the IR, the generator falls back to a name derived from the CLI name + scheme key, following these rules:

- **Single-scheme APIs**: the env var is `<CLI_NAME>_API_KEY` (for `bearer`, `header`, `oauth`, `inferred` schemes — they all carry one credential) or `<CLI_NAME>_USERNAME` / `<CLI_NAME>_PASSWORD` (for `basic`). The scheme `key` is *not* used in the fallback name when there's only one scheme — most APIs in the wild have one auth scheme and the cleaner name (`BOX_API_KEY`, `LINEAR_API_KEY`) reads better than scheme-suffixed alternatives.
- **Multi-scheme APIs**: the env var is `<CLI_NAME>_<SCHEME_KEY>` (for `bearer`, `header`, `oauth`, `inferred`) or `<CLI_NAME>_<SCHEME_KEY>_USERNAME` / `<CLI_NAME>_<SCHEME_KEY>_PASSWORD` (for `basic`). `<SCHEME_KEY>` is the `key` field on the scheme, with PascalCase split into snake_case before uppercasing (`ApiKey` → `API_KEY`, `OAuth2` → `O_AUTH_2`).

Examples:

| Scheme `key` | Schemes in API | Fallback env var on `acme` CLI |
|---|---|---|
| `ApiKey` | one | `ACME_API_KEY` |
| `bearerAuth` | one | `ACME_API_KEY` |
| `basicAuth` | one | `ACME_USERNAME` / `ACME_PASSWORD` |
| `ApiKey` | two | `ACME_API_KEY` |
| `BearerAuth` | two | `ACME_BEARER_AUTH` |

Customers who want different names set the appropriate `*EnvVar` field in their Fern config — the IR carries it through, and the generator skips the fallback. This matches the wiring today's bundled CLIs (`box`, `linear`, etc.) use, where the env var is named after the CLI plus a generic "API_KEY" suffix rather than the scheme name.

`auth.requirement` drives `b.auth_strategy(AuthStrategy::Auto | Any | All | Routing)` — see [src/auth/compose.rs](../src/auth/compose.rs) and the existing AGENTS.md auth section.

#### Transport classification

A single IR can produce bindings of multiple transport classes:

- **HTTP binding** — exists if `services` contains any service with `transport: http: {}` (or `transport` unset, which defaults to HTTP). Carries every such service.
- **gRPC binding** — exists if `services` contains any service with `transport: grpc: GrpcTransport`. Carries every such service. The `GrpcTransport.service` field gives the underlying `ProtobufService` declaration.
- **WebSocket binding** — exists if `websocketChannels` is `Some` and non-empty. Carries every channel.

A typical OAS-only API → one HTTP binding. A mixed API with REST endpoints + WebSocket subscriptions → two bindings (HTTP + WebSocket). A pure proto/gRPC API → one gRPC binding.

#### Environments and server variables

`environments.environments` is a union of `singleBaseUrl` / `multipleBaseUrls`. For each environment:

- `urlTemplate` + `urlVariables` produce the SDK's server-variable wiring.
- Each `ServerVariable` has `id`, `name`, `default`, `values` (allowed enum) — and **`envVar` once the IR addition lands; see "IR additions needed" below**.

The generator emits one `b.server_var(name, env, default, description)` call per variable. Until `ServerVariable.envVar` is on the IR, the generator falls back to `<CLI_NAME>_<VARIABLE_NAME>` (uppercase) — same convention as the existing `BIGCOMMERCE_STORE_HASH` wiring.

### IR additions needed

Two additions to the IR would let the generator produce more accurate output without the customer having to fix things by hand. Both are additive — adding them to the IR doesn't break any existing generator:

#### 1. `ServerVariable.envVar`

Today's `ServerVariable` in `environment.yml`:

```yaml
ServerVariable:
  properties:
    id: string
    name: commons.NameOrString
    default: optional<string>
    values: optional<list<string>>
```

Proposed addition:

```yaml
ServerVariable:
  properties:
    id: string
    name: commons.NameOrString
    default: optional<string>
    values: optional<list<string>>
    envVar:
      type: optional<EnvironmentVariable>
      docs: |
        The environment variable the generated CLI (and SDKs) should
        read this variable's value from at runtime. If unset, generators
        fall back to <CLI_NAME>_<VARIABLE_NAME> (uppercase).
```

Why: today's bigcommerce CLI uses `BIGCOMMERCE_STORE_HASH` for the `store_hash` server variable. That mapping lives in the hand-written `main.rs` because the IR doesn't carry it. With the addition, customers can declare the env-var binding once in their Fern config (`x-fern-server-vars` or equivalent) and every generated client picks it up.

The CLI generator uses a default fallback if `envVar` is absent, so the addition is non-breaking — it just lets customers declare the binding explicitly when the default isn't right.

#### 2. Per-service / per-channel spec source provenance

Today's IR is *post-merge*: a multi-spec API definition (BigCommerce-style, where the customer's Fern config groups 30 spec files into one API) loses the original spec file identity. The IR carries all 30 specs' services merged into one `services` map, with no way to tell which service came from which spec file.

The generator wants this information for two reasons:

- **Spec embedding strategy**: should the generator emit `Binding::new().spec(include_str!("specs/merged.yml"))` (one merged spec) or `Binding::new().specs_under_named("v3", [...]).specs_under_named("v2", [...])` (multiple specs with sub-namespacing)? The SDK supports both; bigcommerce's hand-written `main.rs` uses the latter.
- **`--help` namespacing**: when 30 specs are merged, the resulting command tree benefits from grouping commands by their source spec (`bigcommerce v3 carts list`). Today's `specs_under_named` provides this; preserving the source mapping in the IR lets the generator do it automatically.

Proposed addition: each service, channel, and subpackage gains an optional `sourceSpec` field pointing at the original spec file's identifier.

```yaml
# In http.yml HttpService:
sourceSpec:
  type: optional<SourceSpecId>
  docs: |
    Identifier of the original spec file this service was declared in.
    Set by Fern's IR pipeline when a multi-spec API definition is merged
    into one IR. Generators may use this to preserve the original spec
    structure in their output (e.g., spec-namespaced subcommands).

# In commons.yml (or a new file):
SourceSpecId: string

# In ir.yml IntermediateRepresentation, add:
sourceSpecs:
  type: optional<map<SourceSpecId, SourceSpec>>
  docs: |
    Metadata for each source spec that contributed to this merged IR.
    Keyed by SourceSpecId, referenced from individual services / channels
    via their `sourceSpec` field.

SourceSpec:
  properties:
    name: string                  # e.g., "v3-carts", "v2-orders"
    namespace: optional<string>   # e.g., "v3", "v2" — for grouping
    originalPath: string          # original filesystem path in the customer's Fern config
```

The CLI generator uses `sourceSpecs` + per-service `sourceSpec` to emit multi-spec bindings:

- If every service has the same (or no) `sourceSpec`: emit one `Binding::new().spec(include_str!(...))`.
- If services have distinct `sourceSpec` values grouped by `namespace`: emit `Binding::new().specs_under_named("<namespace>", [(<name>, include_str!(...)), ...])` per namespace.

`originalPath` tells the generator where to copy each spec file from. Today's IR has `sourceConfig` at the top level but doesn't carry per-service provenance.

For v1 the generator can ship without these fields (falling back to "one merged spec" mode) but BigCommerce-style customers won't get the spec-namespaced subcommand tree they have today until the IR additions land.

### Generator config (`generators.yml`)

The customer's `generators.yml` declares the CLI generator the same way they declare an SDK generator:

```yaml
# fern/apis/default/generators.yml
groups:
  cli:
    generators:
      - name: fernapi/fern-cli
        version: 0.1.0
        output:
          location: github
          url: github.com/acme/acme-cli
        github:
          repository: acme/acme-cli
          mode: pull-request
          license: MIT
        config:
          cli-name: acme
          display-name: "Acme CLI"
```

That's the entire config for the **default case**. No `bindings` list — those come from the IR. The generator picks reasonable defaults for every binding it discovers; the customer adjusts any default that's wrong by editing `src/main.rs` directly (see ["Overrides are not supported in v1"](#overrides-are-not-supported-in-v1) below). Replay reapplies their edits on regeneration.

`mode: pull-request` is required for Replay (see the [Replay migration guide](https://buildwithfern.com/learn/sdks/overview/replay-migration)).

### Required top-level config

| Field | Type | Purpose |
|---|---|---|
| `cli-name` | string | The binary name. Used as the `clap` root command, `<NAME>_LOG` env var prefix, default user-agent. Must be a valid Rust identifier when underscored (`my-cli` works, becomes `my_cli` for internal symbols). |
| `display-name` | string (optional) | Human-readable name used in `--help` and `README.md`. Defaults to the IR's `apiDisplayName`, then `cli-name` if that's missing too. |

### Overrides are not supported in v1

The generator does **not** accept overrides in `generators.yml` for v1. Every binding's name, transport, auth, and server variables are inferred from the IR, period. The customer's customization surface is `src/main.rs` — anything the inferred defaults get wrong is corrected there, not in the generator config.

Why no overrides:

- **Config-vs-code split stays clean.** `generators.yml` is "what CLI do I want generated"; `main.rs` is "how do I customize the generated CLI." Adding overrides muddies the boundary — the customer ends up asking "should I tweak this in `generators.yml` or in `main.rs`?"
- **One escape hatch is enough.** Customizing a binding via `main.rs` means editing the `.binding(...)` call directly — swapping auth via `b.auth_provider(...)`, adding a server variable via `b.server_var(...)`. Replay reapplies the edit on regeneration. The builder surface already covers what `generators.yml` overrides would have covered.
- **The override surface ages badly.** YAML overrides for arbitrary binding-builder methods would slowly grow to mirror the SDK's API. Better to keep the SDK API in Rust where it's type-checked and discoverable.

If the customer's IR genuinely produces wrong defaults — e.g., the IR infers `ApiKey` auth but the API actually wants `BearerAuth` — that's a Fern IR bug (or a missing `x-fern-*` extension in the customer's spec). Fix the spec, not the generator config.

This may relax in a future version if a concrete need emerges. For v1, the boundary is firm.

### Multi-spec APIs (BigCommerce-style)

A Fern API can be assembled from multiple source spec files (BigCommerce's 30 OAS files, each scoped to one resource group). Fern's IR pipeline merges these into a single IR with one combined `services` map. From the generator's perspective, this is still *one IR* and produces *one HTTP binding* — the multi-spec origin is preserved (or not) via the optional `sourceSpec` provenance fields the IR may carry.

Two modes:

- **With provenance** (after the [IR additions](#ir-additions-needed) land): the generator emits `Binding::new().specs_under_named("v3", [...]).specs_under_named("v2", [...])` and the SDK preserves spec namespacing in the command tree (`bigcommerce v3 carts list`).
- **Without provenance** (v1 fallback): the generator emits `Binding::new().spec(include_str!("specs/<api>.yml"))` with the IR's merged spec serialized as one file. Subcommands are flat under the binding (`bigcommerce carts list`). Customers wanting the namespaced tree restore it by editing `main.rs` until provenance lands.

Either way, this is *one* `.binding(...)` call, not 30. The customer doesn't declare anything special in `generators.yml`.

## Outputs: what the generator emits

The generator's filesystem footprint in the target repo is small and bounded. **Everything outside the table below is customer-owned and the generator never reads or writes it.**

| Path | Lifecycle | Format |
|---|---|---|
| `Cargo.toml` | Regenerated on every `fern generate` (Replay reapplies customer-added deps) | TOML |
| `dist-workspace.toml` | Regenerated on every `fern generate` | TOML, cargo-dist config |
| `src/main.rs` | Regenerated on every `fern generate` (Replay reapplies customer edits) | Rust |
| `specs/*.{yml,json}` | Copied verbatim from customer's Fern config | YAML/JSON |
| `.github/workflows/release.yml` | Regenerated on every `fern generate` | YAML |
| `README.md` | Regenerated on every `fern generate` | Markdown |
| `.gitignore` | Generated **once** on first generation | Text |
| `.fernignore` | Generated **once** on first generation (empty / with comment header) | Text |

The generator emits a fresh version of each "regenerated" file every run. [Fern Replay](https://buildwithfern.com/learn/sdks/overview/custom-code#replay) reapplies customer edits on top via 3-way merge — the generator itself doesn't track customer state or attempt diffing. If the generator's output and customer edits collide, the merge surfaces as a conflict in the regeneration PR and the customer resolves with `fern replay resolve`.

For files the customer wants the generator to never touch at all (hand-written helpers, custom modules), they list them in `.fernignore`. The generator respects `.fernignore` the same way today's SDK generators do.

### `src/main.rs`

The hot file. Every regen rewrites it; Replay reapplies customer customizations on top.

Template (concrete example for an IR with `apiName: "acme"`, one HTTP service, and one WebSocket channel — producing two bindings):

> **Note:** The import paths below (`binding::oas_http`, `binding::asyncapi_ws`) are the target paths for after the module restructure described in DESIGN.md. Today's working imports are `fern_cli_sdk::app::CliApp` and `fern_cli_sdk::openapi::OpenApiBinding`. The generator should emit the target paths since the restructure is expected to land before the generator ships.

```rust
// src/main.rs — generated by `fern generate`. Edit freely; Fern Replay
// reapplies your edits on regeneration.

use fern_cli_sdk::{CliApp, binding::{oas_http, asyncapi_ws}};

fn main() {
    CliApp::new("acme")
        .binding(
            oas_http::Binding::new()
                .spec(include_str!("../specs/acme.yml"))
                .auth_scheme_env("ApiKey", "ACME_API_KEY"),
        )
        .binding(
            asyncapi_ws::Binding::new()
                .spec(include_str!("../specs/acme-asyncapi.yml")),
        )
        .run()
}
```

Both bindings mount at the root and their command trees merge. A user typing `acme users get` doesn't see whether the operation is HTTP or WebSocket. See DESIGN.md's ["Command-tree namespacing"](../DESIGN.md#command-tree-namespacing) for the merge semantics.

For an HTTP-only API (no WebSocket / gRPC), the generated `main.rs` has one `.binding(...)` call. For a multi-spec API (BigCommerce-style), it has one `.binding(...)` call with multiple `.specs_under_named(...)` chained inside (once provenance lands; see [IR additions](#ir-additions-needed)).

The template is straightforward string interpolation — no proc macros. Variable parts:

- `cli-name` (from `generators.yml`) → `CliApp::new("...")` argument.
- One `.binding(...)` call per inferred binding, in the order documented in ["Multi-binding ordering"](#multi-binding-ordering).

### `Cargo.toml`

Generated wholesale; Replay reapplies customer-added `[dependencies]`. See ["Cargo.toml under Replay"](#cargotoml-under-replay) below.

Template variables:

- `package.name` → `cli-name`.
- `package.version` → managed by cargo-dist; generator emits `0.1.0` on first generation and never touches it after (Replay preserves later edits).
- `[dependencies]` → pinned `fern-cli-sdk = "<version>"` matching the generator's version.

### `specs/*`

Each binding's spec files are copied verbatim from the customer's Fern config directory into `specs/<binding_name>/` (or `specs/<spec_name>.yml` for single-spec bindings).

The generator does *not* parse, lint, or transform the spec files at copy time. The SDK parses them at build/runtime via `include_str!`. Copying preserves comments, ordering, and YAML/JSON formatting.

### `dist-workspace.toml`, `.github/workflows/release.yml`, `README.md`

Template files filled in with the binary name and display name. Identical across customers modulo those substitutions.

### `.gitignore` and `.fernignore`

Standard Rust `.gitignore` (`/target`, `.env`, etc.). Generated once.

`.fernignore` is generated once with an empty body and a comment header explaining its purpose. Customers list files there that the generator should leave alone — typically hand-written modules (`src/hooks.rs`, `src/commands/`) for projects that have grown past a single `main.rs`.

## Algorithms

### Inferring bindings from the IR

The generator walks the IR once and produces a list of `InferredBinding` records — **one record per (apiName × transport-class) pair discovered inside the IR**. Each record has everything the generator needs to emit a `.binding(...)` line in `main.rs`:

```
InferredBinding {
    binding_var: String,            // → internal variable name (cosmetic only)
    transport: TransportKind,       // → http, grpc, websocket
    sources: BindingSources,        // → embedded spec(s) for include_str!
    auth: Option<AuthBinding>,      // → resolved AuthScheme(s) → env var(s)
    server_vars: Vec<ServerVar>,    // → from environments.urlVariables
    auth_strategy: AuthStrategy,    // → from auth.requirement (Auto / Any / All / Routing)
}
```

#### Transport-class discovery

A single IR can produce up to three bindings:

| Binding emitted when | Driven by IR field |
|---|---|
| HTTP binding | `services` contains any service with `transport: http` (or `transport` unset, which defaults to HTTP) |
| gRPC binding | `services` contains any service with `transport: grpc` |
| WebSocket binding | `websocketChannels` is `Some` and non-empty |

A pure OAS-only API produces one HTTP binding. A mixed API with REST endpoints + WebSocket subscriptions produces two bindings. A pure proto/gRPC API produces one gRPC binding. An API with REST endpoints + a couple of gRPC-transcoded services produces both an HTTP and a gRPC binding.

The generator never emits a binding with zero services or channels. An IR with only webhooks (and no `services` or `websocketChannels`) produces no bindings — and the generator errors at that point, since a CLI with no commands isn't useful.

#### `sources` derivation

Where the binding's spec data comes from depends on whether the IR carries per-service / per-channel spec provenance (see [IR additions needed](#ir-additions-needed)).

**With provenance (preferred, after IR additions land):**
- Group services / channels by their `sourceSpec` namespace.
- Single namespace (or all services have the same source): emit `Binding::new().spec(include_str!("specs/<api>.yml"))`. Copy the merged spec into `specs/<api>.yml`.
- Multiple namespaces: emit one `specs_under_named(<namespace>, [...])` chain per namespace. Copy each source spec file into `specs/<api>/<namespace>/<name>.yml`.

**Without provenance (v1 fallback):**
- Emit `Binding::new().spec(include_str!("specs/<api>.yml"))` with the IR's merged-spec representation serialized to one file.
- Customers with BigCommerce-style multi-spec configs lose the spec-namespaced subcommand tree until provenance lands. They can restore it by hand-editing `main.rs` (calling `.specs_under_named(...)` instead of `.spec(...)`); Replay reapplies the edit on regen.

#### `auth` derivation

For each binding, the generator walks `auth.schemes` and emits the corresponding SDK calls.

For a *single-scheme* API (one entry in `auth.schemes`), the generator uses the table in ["Auth scheme inference"](#auth-scheme-inference) above to emit one builder call (`b.auth_scheme_env(...)`, `b.auth_basic_scheme(...)`, etc.).

For a *multi-scheme* API, the generator emits one builder call per scheme and an `auth_strategy(...)` call derived from `auth.requirement`:

| `auth.requirement` | Generator emits |
|---|---|
| `ALL` | `b.auth_strategy(AuthStrategy::All)` |
| `ANY` | `b.auth_strategy(AuthStrategy::Any)` |
| `ENDPOINT_SECURITY` | `b.auth_strategy(AuthStrategy::Routing)` |

Env-var fallback rules for fields that don't carry an explicit `*EnvVar` in the IR are documented in the [Auth scheme inference table above](#auth-scheme-inference) — single-scheme APIs get clean `<CLI_NAME>_API_KEY`-style names; multi-scheme APIs get `<CLI_NAME>_<SCHEME_KEY>`-style names with PascalCase split into snake_case. Customers who want different names set the appropriate `*EnvVar` field in their Fern config.

#### `server_vars` derivation

The generator walks `environments.environments` for the API's default environment (or every environment, with the SDK picking based on `--base-url` at runtime) and emits one `b.server_var(...)` call per `ServerVariable` in `urlVariables`.

Env var binding comes from `ServerVariable.envVar` once that field is on the IR (see ["IR additions needed"](#ir-additions-needed)). Until then, the generator falls back to `<CLI_NAME>_<VARIABLE_NAME>` (uppercase) — matching `BIGCOMMERCE_STORE_HASH` and similar.

#### Binding mount point

The generator emits **no** `.name(...)` calls on the bindings it produces. Every binding mounts at the root; their command trees merge into one user-facing tree. So `acme users get` (HTTP) and `acme events listen` (WebSocket) sit side-by-side without an `acme http` / `acme ws` subcommand prefix. The user typing on the command line doesn't see which transport handles which operation.

If two bindings define the same operation path, the **last-registered binding wins** at runtime, silently. See DESIGN.md's ["Collision diagnostics"](../DESIGN.md#collision-diagnostics) for the rationale and the `<NAME>_LOG=debug` escape hatch.

If a customer wants explicit subcommand-level segmentation (separating an admin API from a public API under `acme public ...` / `acme admin ...`, for example), they add `.name("admin")` to the relevant `Binding::new()` chain in `main.rs`. The generator itself never emits this; Replay reapplies the customer's edit.

### Regeneration: Replay handles customer edits

The generator regenerates `main.rs` from the current IR. It doesn't try to track "the previous state" or detect customer customizations — every regen emits the canonical IR-driven shape, and Replay merges customer edits on top.

What this means for the common cases:

- **Renamed API** (`apiName: v3` → `apiName: v3_public`): the canonical `main.rs` changes the internal binding variable name. Customer edits that referenced specific operations or hooks merge cleanly (operation paths are spec-defined, not binding-name-defined). If the customer wrote code that referenced the old binding name directly, they get a merge conflict or a Rust compile error — `fern replay resolve` walks them through it.
- **Transport class added** (the customer adds WebSocket channels to a previously-HTTP-only API): the canonical `main.rs` gains a second `.binding(asyncapi_ws::Binding::new()...)` call. Customer edits to the existing HTTP binding merge cleanly. They can add hooks on the new WebSocket binding by hand.
- **Transport class removed**: the canonical `main.rs` drops one `.binding(...)` call. Customer edits that lived inside the removed binding's chain become a merge conflict (the surrounding context is gone). They resolve by removing the obsolete edits.
- **Endpoint added or removed within an existing binding**: no change to the `main.rs` shape. The binding's spec changes (different `include_str!`-ed content), but the builder chain stays the same.

The generator doesn't try to detect renames automatically and migrate customer code. That's Replay's job — and its limits are honest: line-level edits merge cleanly when contexts overlap; otherwise conflicts surface in the PR and the customer resolves them. There's no clever heuristic in the generator.

For the operation-path drift case (a hook registered at `&["users", "list"]` after the spec renames `users.list`), Replay merges the edit cleanly but the hook stops matching. The SDK warns about this at runtime via `tracing::warn!`. See DESIGN.md's ["Customization and regeneration"](../DESIGN.md#customization-and-regeneration).

### Cargo.toml under Replay

The generator emits a canonical `Cargo.toml` every regen — `[package]` metadata, pinned `fern-cli-sdk` dep, standard `[profile.*]`. Customer-added `[dependencies]` are preserved by Replay's line-level merge the same way as any other file: if the customer added `hmac = "0.12"` to `[dependencies]`, Replay reapplies the addition on the next regen.

There's no separate merge logic in the generator. The previous design had a marker-comment scheme to distinguish generator-owned deps from customer-owned ones; that's unnecessary now — Replay handles the diff mechanically against the previous `[fern-generated]` commit.

If the generator changes its own `fern-cli-sdk` version pin across regens and the customer hand-edited the version, Replay will surface the conflict and `fern replay resolve` walks them through it.

### Multi-binding ordering

Within a single CLI, binding order in the generated `main.rs` is deterministic: **HTTP → gRPC → WebSocket**. The order matters for hook ordering when bindings register transport-scope hooks — see DESIGN.md's ["Hook ordering"](../DESIGN.md#hook-ordering) section. It also determines which binding wins on operation-path collisions in the merged command tree (last registered wins per DESIGN.md's ["Command-tree namespacing"](../DESIGN.md#command-tree-namespacing) section).

The generator emits a stable order so two regens against the same IR produce byte-identical `main.rs`. Within each binding, services are enumerated in `fernFilepath` order (the IR already exposes a stable order for this), so adding a new endpoint to the spec doesn't shuffle existing ones in the generated output. Stable output is important for Replay — line-level diffs only work cleanly when the generator's output doesn't churn.

### Collision diagnostics

When two bindings define the same operation path, the runtime resolves the conflict by last-registered-wins, silently. No build-time validator runs in the generated project. See DESIGN.md's ["Collision diagnostics"](../DESIGN.md#collision-diagnostics) for the rationale (and the `<NAME>_LOG=debug` escape hatch customers use when they want to see collisions).

The generator's contribution to this story is purely the registration order: HTTP → gRPC → WebSocket within `main.rs`. A customer's hand-added `.binding(...)` call registers after the generator's by default (if appended at the end of the chain), so customer-added bindings win on collision.

## Failure modes

| Condition | Generator behavior |
|---|---|
| `cli-name` is not a valid Rust identifier (after underscore conversion) | Error at config load. Print expected shape and exit non-zero. |
| IR has no `services` and no `websocketChannels` | Error before emitting `main.rs`. A CLI with no commands isn't useful; the customer's Fern config has nothing to wrap. |
| Spec sources the IR references don't exist on disk | IR-level error before the generator even runs. (The IR pipeline owns spec-existence validation.) |
| Spec file is malformed | Same as above — caught upstream in IR parsing. |
| IR shape isn't supported by any v1 transport (e.g., AsyncAPI over Kafka) | Error before emitting `main.rs`. Tell the customer that transport isn't supported yet and point at the SDK's transport roadmap. |
| Two services in the same binding have the same `fernFilepath` (logical command path) | IR-level error before the generator runs. (Fern's IR pipeline already validates this for SDK generators.) |
| Two **different** bindings define the same operation path after merging at root (e.g., HTTP + WebSocket bindings both contributing `users.get`) | **Not a failure.** Runtime resolves last-registered-wins, silently. See DESIGN.md's ["Collision diagnostics"](../DESIGN.md#collision-diagnostics) — customers debugging unexpected behavior flip `<NAME>_LOG=debug` to see which binding won. |
| Auth scheme references an `*EnvVar` that isn't set at *runtime* (not generation time) | Not a generator concern. Customer sees a `CliError::Validation` at first invocation. |
| Customer's `Cargo.toml` has a `fern-cli-sdk` dep with a different version than the generator's expected | Replay surfaces a merge conflict. Customer resolves with `fern replay resolve`. |
| Generated `main.rs` and customer edits collide on the same lines | Replay surfaces the conflict in the regeneration PR body. Customer resolves with `fern replay resolve`. |
| Generator config version mismatch (customer uses `version: 0.5.0` of `fernapi/fern-cli` but the installed generator is `0.3.0`) | Error at config load. Tell the customer to update the generator. |
| Customer uses `mode: release` or `mode: push` instead of `mode: pull-request` | Error at config load. Replay requires PR mode; point at the [Replay migration guide](https://buildwithfern.com/learn/sdks/overview/replay-migration). |

## Versioning and compatibility

The generator version (`fernapi/fern-cli@x.y.z`) and the SDK version (`fern-cli-sdk = "x.y.z"`) move together. A generator at `0.5.0` pins `fern-cli-sdk = "0.5.0"` in the emitted `Cargo.toml`.

### Generator-level breaking changes

When the generator's output shape changes in a breaking way (e.g., the canonical `main.rs` builder chain restructures):

1. Generator's *major* version bump.
2. The new generator's `main.rs` shape will cause large Replay merge conflicts for customers with hand-edits in the restructured area.
3. Migration is the customer's responsibility — they use `fern replay resolve` (or hand-edit) to reconcile their customizations against the new shape. Document the change in `CHANGELOG.md` with a worked example of the resolution.

This should be rare. The builder-chain shape is the central API customers depend on; changing it is roughly as disruptive as a breaking SDK release.

### Generator-level additive changes

Most generator changes are additive (new auth config variants, new transport, new field in `bindings`). These bump the generator's *minor* version. Existing customers regenerate at their own pace; Replay reapplies their customizations as before.

## Things the generator deliberately doesn't do

- **Parse Rust source.** The generator never reads `main.rs`, `Cargo.toml`, or any customer-authored file. It emits canonical output every regen and lets Replay handle the diff.
- **Track customer state.** No "what did the customer override last time?" bookkeeping. The generator is stateless against the customer's repo; Replay is the only component that looks at history.
- **Format the generated Rust.** The emitted `main.rs` is run through `rustfmt` as the final step. The generator doesn't worry about indentation, line wrapping, or trailing commas.
- **Run `cargo build`.** Verifying the generated project compiles is the customer's CI's job, not the generator's. Generator output should compile by construction, but the generator doesn't enforce it.
- **Detect customer renames.** Rename heuristics are out of scope. Drift between the IR and customer edits surfaces as Replay merge conflicts.
- **Manage releases.** `cargo-dist` and the generated workflow handle that. The generator writes the YAML once and doesn't track release state.

## Open questions

These are deferred until the generator implementation actually starts:

- **`generators.yml` overrides.** Deliberately out of scope for v1 (see ["Overrides are not supported in v1"](#overrides-are-not-supported-in-v1)). If a real customer case requires overriding the IR-inferred defaults at config time, revisit.
- **README.md merge.** Customers may want to edit `README.md`. Replay's 3-way merge handles line-level edits the same way as `main.rs`; the question is whether the generator should regenerate `README.md` wholesale (forcing Replay to merge every regen) or generate once and never touch it after. Pick when the first customer hits the friction.
- **Workflow file customization.** Same question as README.md — Replay can handle line-level edits, but a generator that rewrites the workflow file on every regen creates more merge work than a generator that only writes it once.
- **`build.rs` for customer build-time logic.** The generator doesn't emit a `build.rs` today. If a customer wants their own build-script logic (e.g., a `protoc` call, a `vergen`-style git-revision embedding), they create `build.rs` themselves and list it in `.fernignore`. If a future generator feature *needs* a generator-emitted `build.rs`, this design decision flips and we have to spec how customer build-time code coexists with generator-emitted code.

These can wait. The handful above is enough to ship a working v1.
