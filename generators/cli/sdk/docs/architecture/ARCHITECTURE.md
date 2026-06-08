# fern-cli-sdk — Architecture

> **Status:** Living document. Bootstrapped 2026-05-20.
> **Maintenance:** This file is the source of truth for the *shape* of the system.
> Module-level detail belongs in [`AGENTS.md`](../../AGENTS.md). Decisions belong in
> [`decisions/`](./decisions/INDEX.md). Diagrams (Mermaid, GitHub-rendered) live in
> [`diagrams/`](./diagrams/). Changes to the system architecture should land an
> entry in [`CHANGELOG-ARCH.md`](./CHANGELOG-ARCH.md) in the same PR.

This document follows an **arc42-lite** structure: sections 1, 3, 5, 6, 8, 9, 11.
Sections 2, 4, 7, 10, 12 are intentionally omitted — the load-bearing constraint
(protocol isolation) lives in §3 and §8; deployment is trivial (binaries); the
glossary is folded into prose.

---

## 1. Introduction and goals

`fern-cli-sdk` is a **Rust library + binary template** that turns an API schema
into a dynamic CLI at compile time. There is no codegen step: the schema is
embedded with `include_str!`, parsed at process start, and a `clap::Command`
tree is built in memory.

Two protocols are supported, side-by-side:

- **OpenAPI** (`src/openapi/`) — YAML spec → `RestDescription` → `clap` tree.
  Shape is steered by Fern's `x-fern-*` extension family
  ([§8.1](#81-x-fern--extension-set)).
- **GraphQL** (`src/graphql/`) — introspection JSON → `GraphQLSchema` →
  `clap` tree. Command tree is derived from `Query` / `Mutation` types.

The crate also ships ~45 binary targets under `src/bin/<name>/` (autobins —
no `[[bin]]` blocks in `Cargo.toml`; adding a CLI means creating
`src/bin/<name>/` with no edit to any shared file): 32 user-facing demo CLIs
(`box`, `linear`, `square`, `bigcommerce`, `close`, `devin`, `assemblyai`,
`paid`, `xero`, `twilio`, `agentmail`, `mavenagi`, `coinflow`, `sarvam`,
`icepanel`, `fifteenth`, `contentful`, `terra`, `truefoundry`, `lattice`,
`unleash`, `videogen`, `finch`, `elevenlabs`, `fathom`, `athena`, `auth0`,
`okta`, `petstore`) plus test-only fixture binaries.

### Quality goals

| Priority | Goal | How it shows up |
|---|---|---|
| 1 | **Customer-shippable code paths** | Each customer receives `src/openapi/` *or* `src/graphql/`, never both. Drives the §8.2 isolation constraint. |
| 2 | **Schema-driven** | CLI surface is built from the spec at startup. No hardcoded endpoints anywhere in the library. |
| 3 | **Transport-extensible** | Same env-var-based config (`<NAME>_CA_BUNDLE`, etc.) must work across HTTP, WebSocket, and any future transport. See [ADR-0002](./decisions/0002-transport-neutral-http-config-resolve.md). |
| 4 | **LLM-adversarial-safe** | CLI args may come from AI agents. Input validation is mandatory at every URL-construction site (see [`src/validate.rs`](../../src/validate.rs)). |
| 5 | **Test-coverage gate** | `codecov/patch` enforces coverage on touched lines; wire tests verify the bytes on the wire, not just exit codes. |

### Stakeholders

- **Fern customers** — consume the crate (today: vendored copy; soon: published
  via the generator [FER-9852](https://linear.app/buildwithfern/issue/FER-9852)).
- **Fern internal team** — maintainers, demo authors, generator integrators.
- **End users of generated CLIs** — humans on a terminal, AI agents through
  shell tooling, CI pipelines.

---

## 3. System scope and context

See [`diagrams/01-context.mmd`](./diagrams/01-context.mmd) for the rendered view.

### Inside the system (this crate)

- The **library** (`src/`) — protocol-agnostic infra (`auth`, `http`,
  `formatter`, `validate`, `error`, `logging`, `cli_args`, `custom_commands`,
  `early_intercept`, `completions`, `man`, `output`, `text`) plus the two
  isolated protocol modules (`openapi/`, `graphql/`) and the WebSocket
  transport (`websocket/`).
- The **binaries** under `src/bin/<name>/` — thin (≤10-line) `main.rs` files,
  each embedding its own schema(s) via `include_str!`.

### Outside the system

| External actor / system | Direction | Interaction |
|---|---|---|
| **Spec authors** (customer or vendored repo) | inbound | Provide OpenAPI YAML or GraphQL introspection JSON. May supply Fern overrides (deep-merged onto base spec, [FER-10449](https://linear.app/buildwithfern/issue/FER-10449)) and OpenAPI Overlays v1.0.0. |
| **CLI users** (human, agent, CI) | inbound | Invoke `<binary> [args]`. Subset of args may come from untrusted LLM input — see §8.4. |
| **Target HTTP/GraphQL APIs** | outbound | Each binary's spec declares the base URL and auth scheme; the CLI executes operations against these. |
| **Target WebSocket endpoints** (e.g. ElevenLabs Convai) | outbound | NDJSON-framed bidirectional channel through `src/websocket/`. See [ADR-0002](./decisions/0002-transport-neutral-http-config-resolve.md) and [FER-10523](https://linear.app/buildwithfern/issue/FER-10523). |
| **Filesystem / env vars** | both | Auth credentials sources (env, file, CLI flag, literal, closure); `.env` via `dotenvy`; `<NAME>_CA_BUNDLE` / `<NAME>_INSECURE` / `<NAME>_PROXY` / `<NAME>_TIMEOUT_SECS`; `<NAME>_LOG[_FILE]`; on-disk OAuth2 token cache. |
| **Release infrastructure** | outbound | `cargo-dist` for `fern-pipeline-fixture` ([FER-9854](https://linear.app/buildwithfern/issue/FER-9854)); separate `.github/workflows/build-cli.yml` for customer CLIs (workflow_dispatch). |

---

## 5. Building block view

### 5.1 Container view

See [`diagrams/02-containers.mmd`](./diagrams/02-containers.mmd).

The crate is a single Cargo workspace member (`fern-cli-sdk`) plus
`crates/pipeline-fixture/`. The crate exposes:

- `[lib] fern_cli_sdk` — re-exports the public API surface (`CliApp`,
  `AppContext`, `HandlerFn`, plus building-block modules).
- N binary targets, auto-discovered under `src/bin/<name>/main.rs` (autobins;
  no `[[bin]]` blocks in `Cargo.toml` — [PR #132](https://github.com/fern-api/cli-sdk/pull/132)).
  Each binary is a ~7-line consumer of the library that wires a spec + auth +
  optional custom commands and calls `.run()`. See
  [`LIBRARY_DESIGN.md`](../../LIBRARY_DESIGN.md) for the design intent.

### 5.2 Component view — shared infra (above both protocol paths)

See [`diagrams/03-component-shared.mmd`](./diagrams/03-component-shared.mmd).

These modules sit above both protocol paths. They are imported by
*both* `src/openapi/` and `src/graphql/`, by the binary harness, and by
`src/websocket/`.

| Module | Responsibility |
|---|---|
| [`src/auth/`](../../src/auth/) | Auth scheme model (`provider.rs`, `schemes.rs`, `oauth2.rs`), credential sources (`credential.rs`), provider composition + routing (`compose.rs`), layered auth (`LayeredAuthProvider` — [§8.11](#811-auth-layering)), builder methods bound to `CliApp` (`builder.rs`), error mapping (`error.rs`). [ADR-0001](./decisions/0001-auth-provider-no-cred-extraction.md) forbids `AuthProvider` from returning resolved credentials. |
| [`src/http.rs`](../../src/http.rs) | reqwest client builder + shared retry infrastructure (`RetryPolicy`, `decide_retry`, `parse_retry_after`, `compute_backoff_delay`, `generate_idempotency_key` — [FER-10521](https://linear.app/buildwithfern/issue/FER-10521)); `HttpConfig::resolve() → ResolvedTlsConfig` is the transport-neutral seam. Wires `<NAME>_*` env vars (CA bundle, insecure, proxy, timeouts) and User-Agent. |
| [`src/websocket/`](../../src/websocket/) | `tokio-tungstenite` bidirectional client. NDJSON framing, app-level Ping/Pong, base64 audio extraction, graceful Ctrl+C. First non-reqwest transport. |
| [`src/formatter.rs`](../../src/formatter.rs) | `OutputFormat` enum + `OutputPipeline` ([FER-10517](https://linear.app/buildwithfern/issue/FER-10517) step 1) — JSON / table / YAML / CSV. Subsequent steps add `--json` projection, `--jq` via `jaq`, `--template`, `NO_COLOR` handling. |
| [`src/validate.rs`](../../src/validate.rs) | LLM-adversarial input validation: path traversal, control-char rejection, percent-encoding for URL path segments, resource-name validators. |
| [`src/error.rs`](../../src/error.rs) | `CliError` + JSON-on-stdout error contract. `<cli> errors` subcommand prints the table ([FER-10518](https://linear.app/buildwithfern/issue/FER-10518)). |
| [`src/logging.rs`](../../src/logging.rs) | Org-scoped `tracing` setup. `<NAME>_LOG` for stderr filter; `<NAME>_LOG_FILE` for JSON-line file with daily rotation. Off by default. |
| [`src/cli_args.rs`](../../src/cli_args.rs), [`src/early_intercept.rs`](../../src/early_intercept.rs) | Shared CLI helpers — version flag, `--base-url`, JSON-help detection, pre-parse interception for special subcommands (`completion`, `man`, `errors`, `generate-skills`). |
| [`src/custom_commands.rs`](../../src/custom_commands.rs) | Registry + dispatch for `.command(...)` / `.command_under(...)` extensions a binary author can attach. |
| [`src/sdk_executor.rs`](../../src/sdk_executor.rs) | `CliExecutor` — implements the generated SDK's `RequestExecutor` trait, routing SDK-originated HTTP requests through the CLI's transport stack (same `HttpConfig`, `DynAuthProvider`, retry logic, global headers). ADR-0001 compliant. `block_on()` helper for sync→async bridging; `SdkError → CliError` error bridge. ([FER-11027](https://linear.app/buildwithfern/issue/FER-11027), [PR #168](https://github.com/fern-api/cli-sdk/pull/168).) |
| [`src/completions.rs`](../../src/completions.rs), [`src/man.rs`](../../src/man.rs) | `clap_complete` shell completions + `clap_mangen` man pages. Wired into both OpenAPI and GraphQL CLIs ([FER-10519](https://linear.app/buildwithfern/issue/FER-10519)). |

### 5.3 Component view — OpenAPI path (`src/openapi/`)

See [`diagrams/04-component-openapi.mmd`](./diagrams/04-component-openapi.mmd).

| Module | Responsibility |
|---|---|
| `parser.rs` | OpenAPI YAML → internal `RestDescription`. Handles 3.0 and 3.1 ([FER-10528](https://linear.app/buildwithfern/issue/FER-10528); [PR #70](https://github.com/fern-api/cli-sdk/pull/70)). Lowers all `x-fern-*` extensions, form-urlencoded bodies, and `oneOf`/`anyOf`/`allOf` composition. `allOf` branches flattened consumer-side via `merge_all_of_properties` ([ADR-0004](./decisions/0004-all-of-flattening-into-per-field-flags.md)); nullable-union (`oneOf: [T, null]`) promoted to null sentinel ([ADR-0005](./decisions/0005-nullable-union-promotion-via-composition.md)). Emits object-shorthand flags for nested body properties ([PR #59](https://github.com/fern-api/cli-sdk/pull/59)). |
| `discovery.rs` | Internal representation: `RestDescription`, `RestMethod`, schemas, security, pagination metadata. `BodyEncoding` enum (`Json` \| `FormUrlEncoded` \| `Multipart`) selects per-operation wire format. |
| `overlay.rs` | OpenAPI Overlay v1.0.0 + Fern-overrides deep merge. Applied pre-parse. |
| `commands.rs` | Recursive `clap::Command` builder. Walks `x-fern-sdk-group-name` (list) → nested subcommands; `x-fern-sdk-method-name` → leaf command. |
| `executor.rs` | HTTP request construction, response handling, schema validation, retry executor (`x-fern-retries`), pagination, streaming (`x-fern-streaming`), idempotency (`x-fern-idempotent`). Supports JSON, form-urlencoded, and multipart/form-data body encoding ([FER-10700](https://linear.app/buildwithfern/issue/FER-10700), [FER-10727](https://linear.app/buildwithfern/issue/FER-10727), `BodyEncoding` enum). Full OpenAPI parameter style serialization across query/path/header locations ([FER-10569](https://linear.app/buildwithfern/issue/FER-10569), [§8.14](#814-parameter-style-serialization)). File/binary response handling: stdout streaming (`--output -`), Content-Disposition filename hint, audio/video MIME mapping, symlink/hardlink/FIFO safety ([FER-10871](https://linear.app/buildwithfern/issue/FER-10871), [§8.15](#815-file-binary-response-handling)). Mutually-exclusive body input validation ([§8.16](#816-body-input-mode-mutual-exclusivity)). |
| `app.rs` | `CliApp` builder for OpenAPI, `AppContext`, `HandlerFn` type. The high-level API a binary's `main.rs` consumes. Supports multi-binding composition ([PR #69](https://github.com/fern-api/cli-sdk/pull/69)). |
| `help.rs` | Help rendering (audience filtering, group rendering, availability badges). |

### 5.4 Component view — GraphQL path (`src/graphql/`)

See [`diagrams/05-component-graphql.mmd`](./diagrams/05-component-graphql.mmd).

| Module | Responsibility |
|---|---|
| `parser.rs` | Introspection JSON → `GraphQLSchema`. |
| `discovery.rs` | Internal representation: schema, operations (`Query`/`Mutation`), input types. |
| `commands.rs` | `clap::Command` builder from operations. Dot-notation body flags ([FER-10435](https://linear.app/buildwithfern/issue/FER-10435)). |
| `executor.rs` | GraphQL request construction (variables map, auth, response handling, `HttpConfig` honored as of [FER-10448](https://linear.app/buildwithfern/issue/FER-10448)). |
| `app.rs` | `CliApp` builder for GraphQL — mirror of the OpenAPI builder. |
| `help.rs` | Help rendering. |

> **GraphQL is the reference implementation.** When a feature applies to both
> paths, implement it in GraphQL first, then mirror it in OpenAPI as a
> separate, self-contained copy. See [§8.2](#82-protocol-path-isolation).

---

## 6. Runtime view

### 6.1 CLI invocation — happy path

See [`diagrams/06-runtime-request.mmd`](./diagrams/06-runtime-request.mmd).

1. **Bootstrap.** Binary's `main.rs` constructs a `CliApp`, attaches auth
   scheme bindings, custom commands, audience presets. Calls `.run()`.
2. **Spec parse.** Library parses the `include_str!`-embedded spec (and
   overrides/overlays if any) into the internal representation. For
   multi-binding CLIs, each binding parses independently.
3. **Command tree build.** `commands.rs` walks the spec and builds a
   `clap::Command` tree.
4. **Early intercept.** `early_intercept.rs` checks for `completion`,
   `man`, `errors`, `generate-skills` subcommands and short-circuits
   without auth/network. `--quiet` suppresses stdout on success
   ([FER-10518](https://linear.app/buildwithfern/issue/FER-10518)).
5. **Arg parse.** `clap` matches args against the dynamic tree.
6. **Auth resolution.** `compose.rs` walks the operation's `security:` (an
   OR of ANDs); first requirement all bound providers can satisfy wins;
   their headers are merged.
7. **Request execution.** `executor.rs` constructs the request — path
   segments style-serialized (simple/label/matrix), query params via a
   custom RFC 3986 encoder (`encode_query_component` / `append_query_string`)
   respecting per-parameter `style`/`explode`, header params via
   `serialize_header_simple` — then applies auth via
   `AuthProvider::apply()` and sends through the `reqwest::Client` built
   from `HttpConfig`. See [§8.14](#814-parameter-style-serialization).
8. **Body input validation.** If the user supplied body flags, enforce
   mutual exclusivity: `--json` (whole-body), dot-notation leaf flags,
   and object-shorthand JSON are three input modes — mixing any two is a
   hard validation error ([§8.16](#816-body-input-mode-mutual-exclusivity)).
9. **Retry loop.** If `x-fern-retries` declared (and `--no-retry` not set),
   retry on tightened TS-recommended status set with jittered backoff.
10. **Response dispatch.** If response `Content-Type` is non-JSON
    (audio/*, video/*, application/octet-stream, etc.), route to
    file/binary handler: honor `--output` (path or `-` for stdout),
    Content-Disposition filename hint, MIME-based extension fallback.
    Security: O_NOFOLLOW, hardlink/nlink>1 rejection, FIFO/device refusal
    ([§8.15](#815-file-binary-response-handling)).
11. **Format + emit.** JSON response → `OutputPipeline` → stdout in the
    chosen format. Errors → `CliError` JSON on stdout (machine-parseable)
    plus color-coded label on stderr.

### 6.2 WebSocket lifecycle

1. Binary calls `WebSocketClient::connect(ws_url, ws_config)`.
2. `HttpConfig::resolve()` runs first — validates CA bundle, insecure,
   proxy, connect-timeout (translation to `tokio_tungstenite::Connector`
   is partial in v1; see ADR-0002).
3. NDJSON loop: stdin line → outbound JSON frame; inbound frame → stdout
   line. App-level `{type: "ping"}` → auto `{type: "pong"}`.
4. Base64 audio frames (`{audio: "<base64>"}`) optionally extracted to
   `--output <file>`.
5. Ctrl+C → send close frame, wait for ack, exit clean.

### 6.3 Auth credential resolution

Credentials are resolved via `AuthCredentialSource` (env / CLI / file /
literal / closure / any-chain). The provider only sees the resolved
value inside `apply(request)` — it never returns it back to caller code.
This is [ADR-0001](./decisions/0001-auth-provider-no-cred-extraction.md).
Layers that need a credential value at a different transport boundary
(WS headers, first-frame JSON) take an `AuthCredentialSource` directly.

---

## 8. Cross-cutting concepts

### 8.1 `x-fern-*` extension set

OpenAPI is the surface; Fern extensions are how the spec author steers the
CLI shape. The umbrella ticket is
[FER-9864](https://linear.app/buildwithfern/issue/FER-9864).

| Extension | Effect |
|---|---|
| `x-fern-sdk-group-name` (list) | Subcommand groups; nesting supported. |
| `x-fern-sdk-method-name` | Leaf command name. |
| `x-fern-sdk-return-value` | Output shaping. |
| `x-fern-sdk-variables` / `x-fern-sdk-variable` | Top-level SDK variables — surfaced as flags. |
| `x-fern-parameter-name` | Rename CLI flag (vs default-from-parameter-name). |
| `x-fern-default` | Documentation-only default hint (does *not* send the value). |
| `x-fern-enum` | Enum value documentation on parameter enums. |
| `x-fern-ignore` | Skip operation or parameter. |
| `x-fern-availability` | `--help` badges. |
| `x-fern-audiences` | Operation visibility; binary picks a preset via `CliApp::audiences()`. |
| `x-fern-groups` | Help-output grouping (orthogonal to subcommand groups). |
| `x-fern-server-name` (`x-name` alias) | Pick a server when multiple declared. |
| `x-fern-base-path` | Prefix applied to operation paths. |
| `x-fern-global-headers` | Headers attached to every request. |
| `x-fern-streaming` | Streaming variants (`text`, SSE). |
| `x-fern-retries` | Retry policy. |
| `x-fern-idempotent` / `x-fern-idempotency-headers` | Idempotency-key plumbing. |
| `x-fern-pagination` (5 forms) | Per-operation pagination, root inheritance. |

### 8.2 Protocol path isolation

> **Do not create shared abstractions between `src/openapi/` and `src/graphql/`.
> Duplication between these two paths is intentional and correct.**
> — [`AGENTS.md`](../../AGENTS.md), line 93

`fern-cli-sdk` is a code generator. Customers receive a snapshot of
exactly one path — never both bundled. Therefore each path must be
self-contained. Three similar lines in two files is better than a
premature abstraction that couples delivery paths.

The exception: modules above both paths (`src/auth/`, `src/http.rs`,
`src/error.rs`, `src/formatter.rs`, `src/validate.rs`, `src/logging.rs`,
`src/cli_args.rs`, `src/websocket/`) are shared infrastructure for the
*binary harness*, not for the generated paths. Sharing them is fine.

When a feature applies to both paths: build it in `src/graphql/` first,
mirror it as a separate copy in `src/openapi/`.

### 8.3 Transport-neutral HTTP config

`HttpConfig::resolve() -> ResolvedTlsConfig` returns plain Rust types
(`Vec<Vec<u8>>` for raw PEM, `bool` for insecure, `Option<ResolvedProxy>`,
`Option<Duration>` for timeouts). Each transport translates this into
its own connector type *inside its own module*. `src/http.rs` stays
reqwest-only; `src/websocket/` stays tokio-tungstenite-only. See
[ADR-0002](./decisions/0002-transport-neutral-http-config-resolve.md).

### 8.4 Input validation under LLM-adversarial assumption

CLI args may come from AI agents and are treated as untrusted. Every
URL-construction site must use the helpers in `src/validate.rs`:
`validate_safe_output_dir`, `validate_safe_dir_path`,
`encode_path_segment`, `validate_resource_name`, and clap
`PossibleValuesParser` for enum flags. Environment variables are
*trusted* (set by the user themselves) and are not subject to the same
validation. See [`AGENTS.md` § Input Validation](../../AGENTS.md).

### 8.5 Test layers

| Layer | Path | When to add |
|---|---|---|
| Unit | `src/**` | Pure logic in isolation. |
| Integration | `tests/cli_integration.rs` | New flags, output format changes, pagination, base-URL override. |
| Wire (OpenAPI) | `tests/openapi_fixture_wire.rs` | HTTP contract — verifies method, path, body, query, headers. |
| Wire (GraphQL) | `tests/graphql_fixture_wire.rs` | GraphQL contract — variables map, auth, response handling. |
| Feature matrix | `tests/feature_matrix_wire.rs` | One cell per SDK-vs-CLI matrix capability, encoding-exact assertions. Unsupported cells `#[ignore]`'d with gap text; `cargo test … -- --ignored` is the living gap report. See [`docs/agents/feature-matrix.md`](../../docs/agents/feature-matrix.md). |
| Smoke (per binary) | `tests/<binary>_smoke.rs` | Bundled-binary spec or `main.rs` changes. |

Wire tests run in two tiers: tier-1 loads stubs from a mapping JSON and
verifies parse-and-exit; tier-2 sets up an explicit `MockServer` with
`expect(1)` and verifies the exact outgoing request shape. Origin:
[FER-9860](https://linear.app/buildwithfern/issue/FER-9860).

The **feature-matrix suite** ([FER-10569](https://linear.app/buildwithfern/issue/FER-10569),
[PR #125](https://github.com/fern-api/cli-sdk/pull/125)) is the canonical
catalog: one operation per cell in `src/bin/feature-matrix-fixture/openapi.yaml`,
encoding-exact assertions via `captured_raw_query` / `captured_raw_path` /
`captured_header` / `captured_body_bytes` helpers. 74 active cells across 14
areas + 2 gaps (cells aligned to post-FER-10521 retry/idempotency
contract in [PR #134](https://github.com/fern-api/cli-sdk/pull/134); query/
path/header style cells closed in PRs #137, #138, #144, #145; file-response
cells added in [PR #151](https://github.com/fern-api/cli-sdk/pull/151);
composition cells added in [PR #124](https://github.com/fern-api/cli-sdk/pull/124)).
`scripts/list-feature-matrix-gaps.sh` regenerates the gap snapshot.

### 8.6 Output pipeline

`OutputPipeline` ([FER-10517](https://linear.app/buildwithfern/issue/FER-10517))
is the single composable point between executor and stdout. It owns:
`--format json|table|yaml|csv`, projection (`--json field1,field2.nested`),
filter (`--jq <expr>`), template (`--template '{{.field}}'`), color
handling (`--no-color`, `NO_COLOR`, `FORCE_COLOR`, TTY detection,
`CI=true` → JSON default).

### 8.7 Custom commands and extension surface

A binary attaches custom commands via `.command(cmd, handler)` or
`.command_under(...)`. Handlers receive `&clap::ArgMatches` and an
`&AppContext` exposing `execute(group, method, params, body)`.

The **multi-binding extension surface** landed in [PR #69](https://github.com/fern-api/cli-sdk/pull/69):

- `CliApp::binding(name)` attaches an OpenAPI or GraphQL spec as a named
  binding. A single CLI can compose N bindings (e.g., the `twilio` binary
  unifies 39 OpenAPI specs — [PR #72](https://github.com/fern-api/cli-sdk/pull/72)).
- Auth is declared at the root `CliApp` level and shared across all
  bindings (`auth-at-root`).
- Custom commands receive a `BindingContext` for dispatching into any
  binding’s executor.
- Global args are deduplicated across bindings.

This resolves implicit decision **D-P** (previously in flight).

### 8.8 Auth error diagnostics

Auth errors surface the specific credential source names (`credential_hints()`
on `AuthProvider` and `AuthCredentialSource`) — env var, CLI flag, or file
path — in both the JSON error envelope and stderr prose. This gives agents
and users a directly actionable next step on 401.
([FER-10702](https://linear.app/buildwithfern/issue/FER-10702),
[PR #81](https://github.com/fern-api/cli-sdk/pull/81).)

### 8.9 Stdin body and scripting

`--body -` reads request body JSON from stdin; `--quiet` suppresses stdout
on success (errors still on stderr); `<cli> errors` prints exit-code
table. These make CLIs pipe-friendly for CI/CD and shell pipelines.
([FER-10518](https://linear.app/buildwithfern/issue/FER-10518),
[PR #67](https://github.com/fern-api/cli-sdk/pull/67).)

### 8.11 Auth layering

`LayeredAuthProvider` ([PR #116](https://github.com/fern-api/cli-sdk/pull/116))
wraps a primary `AuthProvider` and layers optional providers on top. Each
layer is applied additively *only when it has credentials* and never on
`security: []` (explicit anonymous) endpoints. Satisfiability and credential
hints come from the primary alone — layers don't block invocation.

Binary authors register layers via `CliApp::auth_layer(provider)` or
`auth_layer_shared(Arc<dyn AuthProvider>)`. The composed primary is wrapped
only when layers exist (zero cost otherwise). `--help` surfaces each layer
as an `(optional)` row under `Authentication:`.

Introduced for the `lattice` binary's Sandboxes multi-header auth, where a
second `Anduril-Sandbox-Authorization` bearer header is conditionally added
to every request when `SANDBOXES_TOKEN` is set.

### 8.12 Retry, backoff, and idempotency

Shared retry infrastructure in `src/http.rs`
([FER-10521](https://linear.app/buildwithfern/issue/FER-10521),
[PR #86](https://github.com/fern-api/cli-sdk/pull/86)):

- `RetryPolicy` (from `x-fern-retries` extension): `max_attempts` (default
  4), `base_delay_ms` (default 500). Both OpenAPI and GraphQL executors
  share the same retry logic.
- Retryable conditions: 5xx, 408, 429, network/timeout errors.
- Exponential backoff: `base_delay × 2^attempt` with 10% jitter.
- `Retry-After` header respected (numeric seconds or HTTP-date).
- Auto-generated `Idempotency-Key: <uuid>` on POST/PUT/PATCH — same key
  reused across retries for exactly-once semantics. Skipped when the
  operation declares `x-fern-idempotent` (user provides the key).
  Per-operation opt-out via `x-fern-cli-idempotency: false`.
- `--no-retry` CLI flag disables all retries for debugging.
- GraphQL pagination: fresh key per page, retries within a page share
  the same key.

### 8.13 Param name sanitization

`src/text.rs`
([FER-10430](https://linear.app/buildwithfern/issue/FER-10430),
[PR #87](https://github.com/fern-api/cli-sdk/pull/87)) rewrites OpenAPI
parameter names containing shell-special characters into clean kebab-case
CLI flags while preserving the original wire name in outgoing HTTP
requests.

Pipeline (in order): validate (reject control chars) → NFKD transliterate
(strip combining marks) → sanitize (non-`[A-Za-z0-9-]` → `-`) → tidy
(collapse repeated dashes, trim leading/trailing). Built-in flag
collisions (`format`, `output`, etc.) resolved by appending `-param`.
Cross-parameter collisions detected at load time. Non-Latin scripts and
confusable codepoints rejected as a security measure. Help text shows the
original wire name when the flag differs.

### 8.14 Parameter style serialization

OpenAPI 3.0 specifies per-parameter `style` / `explode` rules for query,
path, and header locations. As of [FER-10569](https://linear.app/buildwithfern/issue/FER-10569)
(PRs [#144](https://github.com/fern-api/cli-sdk/pull/144),
[#138](https://github.com/fern-api/cli-sdk/pull/138),
[#137](https://github.com/fern-api/cli-sdk/pull/137)) the executor respects
these across all three locations:

| Location | Styles implemented | Encoder |
|---|---|---|
| **Query** | `form` (explode/no-explode), `spaceDelimited`, `pipeDelimited`, `deepObject` (partial) | Custom RFC 3986: `encode_query_component` + `append_query_string`. Emits `%20` (not `+`); join delimiters stay literal. |
| **Path** | `simple` (default), `label`, `matrix` | `render_path_template` — only values are percent-encoded; structural separators (`,`, `.`, `;`, `=`) stay literal. |
| **Header** | `simple` (only permitted style) | `serialize_header_simple` — comma-join for arrays, `k,v` or `k=v` for objects. CR/LF injection rejected. |

All three locations now JSON-parse `array`-typed flags (via
`collect_params_from_flags`) so the serializer receives a `Value::Array`
it can explode/join. Invalid JSON falls back to the raw string.

**Decision (D-W):** The team chose a custom RFC 3986 query encoder over
reqwest's built-in `.query()` because the latter uses `serde_urlencoded`
(form-encoding: `+` for spaces) and has no OpenAPI style awareness. See
[`decisions/INDEX.md` — D-W](./decisions/INDEX.md#d-w-custom-rfc-3986-query-encoder-over-reqwest-built-in).

### 8.15 File/binary response handling

The OpenAPI executor handles non-JSON response bodies end-to-end
([FER-10871](https://linear.app/buildwithfern/issue/FER-10871),
[PR #151](https://github.com/fern-api/cli-sdk/pull/151)):

- **MIME dispatch:** `is_media_type` + `mime_to_extension` map Content-Type
  to file extension. Covers `audio/*`, `video/*`, `image/*`,
  `application/pdf`, `application/octet-stream`, etc.
- **`--output PATH`:** Write response body to the given path.
- **`--output -`:** Stream raw bytes to stdout (no JSON wrapper, no
  metadata), making the output pipeable to downstream programs.
- **Content-Disposition:** RFC 6266 `filename` + RFC 5987 `filename*`
  parsing; quoted-string unescaping; `filename*` takes precedence per §4.3.
  `form-data` dispositions ignored per RFC 7578 §4.2.
- **Filename sanitization:** Reject dotfiles, Unicode bidi-override chars,
  embedded backslashes, `..`/`.` components.
- **Symlink safety:** `O_NOFOLLOW` on Unix prevents planted symlink
  redirection. Parent directory canonicalized but basename left unresolved.
- **Hardlink safety:** After open (without `O_TRUNC`), `fstat` checks
  `nlink > 1`; refuses write if hardlinked.
- **FIFO/device refusal:** `O_NONBLOCK` in open flags + post-open
  `is_file()` check. Returns error for FIFOs, char devices, sockets.

### 8.16 Body input mode mutual exclusivity

Three body-input modes exist for every operation with a request body
([PR #59](https://github.com/fern-api/cli-sdk/pull/59)):

1. **`--json '{...}'`** — whole-body JSON string.
2. **Dot-notation leaf flags** — `--name.first niels --name.last swimberghe`.
3. **Object-shorthand** — `--name '{"first":"niels"}'` (JSON for one field).

These are **mutually exclusive**. Mixing any two is a `CliError::Validation`
that names both conflicting flags. This replaces the previous merge behavior
(intentional pre-GA breaking change — [D-X](./decisions/INDEX.md#d-x-mutually-exclusive-body-input-modes)).

Both OpenAPI (`parse_and_validate_inputs`) and GraphQL (`build_graphql_body`)
enforce the same rules. `coerce_graphql_value` now returns `Result` and
JSON-parses `param_type=="object"` strings (invalid JSON is a hard error).

### 8.17 SDK execution sharing (`CliExecutor`)

The `CliExecutor` ([PR #168](https://github.com/fern-api/cli-sdk/pull/168),
[FER-11027](https://linear.app/buildwithfern/issue/FER-11027)) implements the
generated Rust SDK's `RequestExecutor` trait, enabling co-generated SDK crates
to delegate HTTP execution through the CLI's existing transport stack:

- **Level-2 behavioral parity:** Routes through `HttpConfig::build_client()`,
  `DynAuthProvider::apply()`, `decide_retry()`, global-header injection, and
  base-URL override — not a second stack seeded with copied config.
- **ADR-0001 compliant:** Receives `DynAuthProvider` and calls `apply()` —
  never extracts or exposes resolved credentials.
- **`block_on()` helper:** `tokio::task::block_in_place` + `Handle::current()`
  for sync→async bridging in custom command handlers.
- **Error bridge:** `SdkError → CliError` preserving HTTP status and context.
- **Auth fail-closed:** [PR #171](https://github.com/fern-api/cli-sdk/pull/171)
  hardened `build_request` to return `Result` — auth errors propagate instead
  of silently sending unauthenticated requests.

Custom commands obtain a typed SDK client via `AppContext` accessors
(`auth_provider()`, `base_url_override()`, `global_headers()`).

Counterpart changes in `fern-api/fern`: transport seam
([FER-11025](https://linear.app/buildwithfern/issue/FER-11025)),
co-vendoring ([FER-11026](https://linear.app/buildwithfern/issue/FER-11026)),
generated glue + verification
([FER-11028](https://linear.app/buildwithfern/issue/FER-11028)).

### 8.18 `allOf` composition lowering

`allOf` composition is lowered into per-field flags consumer-side
([PR #124](https://github.com/fern-api/cli-sdk/pull/124),
[ADR-0004](./decisions/0004-all-of-flattening-into-per-field-flags.md)):

- `merge_all_of_properties(schema, component_schemas)` walks branches
  recursively, resolving `$ref`s, and returns the merged property bag +
  union of `required` arrays. Last-branch-wins on property overlap.
- Safety cap of `MAX_ALL_OF_DEPTH = 8` bounds pathological `$ref` cycles.
- `allOf` recursion does not consume from `MAX_BODY_DEPTH = 3` — it adds
  no user-visible nesting.

Nullable-union composition (`oneOf: [T, {type: null}]`) is promoted to
the null sentinel pattern
([ADR-0005](./decisions/0005-nullable-union-promotion-via-composition.md)):
`is_nullable_composition()` detects the pattern and sets
`JsonSchemaProperty.nullable = true`, reusing the existing `--field ^`
null sentinel from ADR-0003.

Both lowerings run in `parser.rs` (flag emission) and `executor.rs`
(body validation), independently per D-A isolation.

### 8.10 SKILL.md generation

`<cli> generate-skills [--out-dir PATH]` walks the parsed spec at runtime
and emits Claude Code–compatible SKILL.md files per top-level command
group. Fully deterministic (Rust templates over spec data, no LLM).
([FER-9863](https://linear.app/buildwithfern/issue/FER-9863),
[PR #76](https://github.com/fern-api/cli-sdk/pull/76).)

---

## 9. Architecture decisions

The decisions index lives in [`decisions/INDEX.md`](./decisions/INDEX.md).
Five formal ADRs to date:

- [ADR-0001](./decisions/0001-auth-provider-no-cred-extraction.md) — `AuthProvider` never exposes resolved credentials
- [ADR-0002](./decisions/0002-transport-neutral-http-config-resolve.md) — Transport-neutral `HttpConfig::resolve()` pattern
- [ADR-0003](./decisions/0003-null-sentinel-on-nullable-scalar-body-flags.md) — Null sentinel on nullable scalar body flags
- [ADR-0004](./decisions/0004-all-of-flattening-into-per-field-flags.md) — `allOf` flattening into per-field flags
- [ADR-0005](./decisions/0005-nullable-union-promotion-via-composition.md) — Nullable-union promotion via composition

The decisions index also tracks **implicit ADRs** — decisions documented
in `AGENTS.md`, commit history, and Linear that should be promoted to
ADRs over time.

---

## 11. Risks and technical debt

| # | Item | Severity | Notes |
|---|---|---|---|
| 1 | **Asymmetric protocol implementations.** `src/openapi/` is materially larger than `src/graphql/` (parser 282KB vs 36KB; executor 248KB vs 31KB). The isolation principle is correct but the surface area gap means features lag in GraphQL. | Medium | Mitigated by "implement in GraphQL first" rule. Track per-feature parity in the decisions index. |
| 2 | **`HttpConfig` two writers.** Existing `build_client` reads env vars directly; `resolve()` reads them again. Drift risk acknowledged in [ADR-0002](./decisions/0002-transport-neutral-http-config-resolve.md). `EnvGuard` test covers it. | Low | Collapse into one reader when a second reqwest path emerges. |
| 3 | **WS path under-wires `<NAME>_CA_BUNDLE` / `<NAME>_INSECURE` / `<NAME>_PROXY`.** v1 resolves them (so misconfig errors surface) but doesn't translate them to `tokio_tungstenite::Connector`. | Medium | Follow-up scoped to connector translation. |
| 4 | **Heavy in-progress feature plans.** `LIBRARY_PLAN.md`, `LIBRARY_DESIGN.md`, `DESIGN.md`, `PLAN_A_TYPED_FLAGS.md`, `ROADMAP_TRACKER.md` all describe in-flight work. The relationship between them and ARCHITECTURE.md is not yet codified. | Low | When a plan lands, distill the durable architectural outcome into this file and either delete or archive the plan. |
| 5 | **Two release paths.** `cargo-dist` for `fern-pipeline-fixture`; `build-cli.yml` (workflow_dispatch) for customer CLIs. cargo-dist installers don't ship man pages ([FER-10688](https://linear.app/buildwithfern/issue/FER-10688)). | Low | Documented; alternative `<cli> man > /path/to/man1` is the user path. |
| 6 | **Auth token-store layer is new and not yet wired into a command.** [FER-10692](https://linear.app/buildwithfern/issue/FER-10692) lands `TokenStore` / `FileTokenStore` / `KeyringTokenStore` / OpenAPI OAuth2 flow parsing as foundations only. | Low | Tracked; `auth login` / `auth use` / `auth logout` will sit on top. |
| 7 | **Verbose generated command names** when specs lack `x-fern-sdk-*` extensions (e.g. vendored Twilio specs). [FER-10449](https://linear.app/buildwithfern/issue/FER-10449) Fern-overrides addresses this but isn't wired into every demo CLI yet. | Low | Per-CLI overrides directory pattern documented. |
| 8 | **`generate-skills` validation gap.** Emitted SKILL.md references are not automatically validated against the command tree; drift is caught by manual re-generation and diff. | Low | [FER-9863](https://linear.app/buildwithfern/issue/FER-9863) acceptance criterion 6 covers this. |
| 9 | **`OAuth2Auth` silent credential drop.** When client-credentials are missing, `OAuth2Auth` may send unauthenticated requests instead of failing fast — a silent-auth-bypass risk. | Medium | [FER-10745](https://linear.app/buildwithfern/issue/FER-10745). Fix in flight ([PR #127](https://github.com/fern-api/cli-sdk/pull/127)) — wires client-credentials flow instead of silent unauth. |

---

## Appendix A — Source layout reference

Authoritative source layout reference is the table in
[`AGENTS.md`](../../AGENTS.md) ("Source Layout"). This document does not
duplicate it.
