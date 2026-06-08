# Architecture decisions — index

> **Where ADR files live.** Formal ADRs are kept at
> [`docs/adr/`](../../adr/) (existing convention). This index aggregates them
> alongside **implicit decisions** — load-bearing choices documented today in
> `AGENTS.md`, design docs, Linear, or commit messages, but not yet promoted
> to ADR form. The goal is to make the decision set legible without forcing
> a one-time backfill.

## Formal ADRs

| # | Title | Status | Source | Driver |
|---|---|---|---|---|
| [0001](../../adr/0001-auth-provider-no-cred-extraction.md) | `AuthProvider` never exposes resolved credentials | Accepted (2026-05-13) | [`docs/adr/0001`](../../adr/0001-auth-provider-no-cred-extraction.md) | [FER-10523](https://linear.app/buildwithfern/issue/FER-10523) (WebSocket bidirectional client) |
| [0002](../../adr/0002-transport-neutral-http-config-resolve.md) | Transport-neutral `HttpConfig::resolve()` pattern | Accepted (2026-05-13) | [`docs/adr/0002`](../../adr/0002-transport-neutral-http-config-resolve.md) | [FER-10523](https://linear.app/buildwithfern/issue/FER-10523) (WebSocket bidirectional client) |
| [0003](../../adr/0003-null-sentinel-on-nullable-scalar-body-flags.md) | Null sentinel on nullable scalar body flags | Accepted (2026-05-27) | [`docs/adr/0003`](../../adr/0003-null-sentinel-on-nullable-scalar-body-flags.md) | [FER-10753](https://linear.app/buildwithfern/issue/FER-10753) (OpenAPI 3.0/3.1 nullable scalar flags) |
| [0004](../../adr/0004-all-of-flattening-into-per-field-flags.md) | `allOf` flattening into per-field flags | Accepted (2026-05-28) | [`docs/adr/0004`](../../adr/0004-all-of-flattening-into-per-field-flags.md) | [PR #124](https://github.com/fern-api/cli-sdk/pull/124) (allOf + nullable-union composition lowering) |
| [0005](../../adr/0005-nullable-union-promotion-via-composition.md) | Nullable-union promotion via composition | Accepted (2026-05-28) | [`docs/adr/0005`](../../adr/0005-nullable-union-promotion-via-composition.md) | [PR #124](https://github.com/fern-api/cli-sdk/pull/124) (allOf + nullable-union composition lowering) |

## Implicit decisions — candidates for promotion

These are durable architectural choices already in force. Promotion to a
formal ADR is recommended when the decision is next revisited (or when
the listed risk materializes). Listed in rough priority order.

### D-A. Protocol path isolation: `src/openapi/` and `src/graphql/` share nothing

- **Where documented today:** [`AGENTS.md`](../../../AGENTS.md) lines 91–106.
- **Driver:** Code-generator delivery model — customers receive a snapshot
  of exactly one path. The two paths are never bundled.
- **Drivers in Linear:** [FER-10364](https://linear.app/buildwithfern/issue/FER-10364) (CLI generator file-hierarchy partition) — the refactor that established the boundary.
- **Implementation:** Refactor in PR #15, `refactor(FER-10364): partition src/ into openapi/ and graphql/ protocol modules`.
- **Why this should be the next ADR:** It's the load-bearing constraint of the
  whole codebase, it's referred to by every other ADR in spirit, and
  contributors regularly try to violate it.

### D-B. Schema embedded at compile time (`include_str!`), no runtime spec fetch

- **Where documented today:** [`AGENTS.md`](../../../AGENTS.md) line 56; [`LIBRARY_DESIGN.md`](../../../LIBRARY_DESIGN.md) lines 56–66; [`README.md`](../../../README.md) lines 15–22.
- **Driver:** Fast startup; reproducible builds; offline; security
  (the spec is part of the audited binary, not a fetched-at-runtime
  trust hole).
- **Trade-off:** Spec changes require a recompile + redistribution.
  Accepted because the spec is *part of the product*, not an input.

### D-C. GraphQL is the reference implementation; mirror to OpenAPI

- **Where documented today:** [`AGENTS.md`](../../../AGENTS.md) line 104.
- **Driver:** Asymmetric maturity (OpenAPI is older and larger;
  GraphQL is the cleaner playground). Standardizing the direction prevents
  accidental coupling and keeps both paths independently correct.

### D-D. `--audience` moved from runtime flag to compile-time `CliApp::audiences()` preset

- **Where documented today:** commit `4bba58a` — `refactor(audiences): move audience filter from --audience CLI flag to compile-time CliApp::audiences() preset`. Implements [FER-9864](https://linear.app/buildwithfern/issue/FER-9864) P-N.
- **Driver:** A generator-published CLI ships one audience preset; runtime
  selection conflates "what's in this build" with "what's a flag" and
  surfaces operations the publisher meant to hide.
- **Reversal:** Was originally a `--audience` flag. Documented here so
  future contributors don't re-add it.

### D-E. OpenAPI overrides apply as deep-merge pre-parse

- **Where documented today:** [FER-10449](https://linear.app/buildwithfern/issue/FER-10449) ticket and PR #22.
- **Driver:** Customer CLIs often vendor upstream specs they don't own
  (docs-team-owned). Overrides let the SDK customize spec shape without
  forking. Maps maps merge key-by-key, arrays replace wholesale, scalars
  override.

### D-F. OpenAPI Overlay v1.0.0 supported in addition to Fern overrides

- **Where documented today:** PRs #20, #22; [`src/openapi/overlay.rs`](../../../src/openapi/overlay.rs).
- **Driver:** Standards alignment for customers who already have overlays
  outside Fern's tooling.

### D-G. `OutputPipeline` is the single composable output stage

- **Where documented today:** [FER-10517](https://linear.app/buildwithfern/issue/FER-10517); commit `902f393` — `refactor(formatter): introduce OutputPipeline abstraction (FER-10517 step 1)`.
- **Driver:** Adding `--json` projection, `--jq`, `--template`, color
  handling, and TTY/CI detection without forking `formatter.rs` into
  several near-duplicates per CLI.

### D-H. Wire tests use a two-tier mock model (mapping stubs + explicit `expect(1)`)

- **Where documented today:** [`AGENTS.md`](../../../AGENTS.md) lines 30–35; [FER-9860](https://linear.app/buildwithfern/issue/FER-9860).
- **Driver:** Tier-1 catches surface regressions cheaply; tier-2 pins
  the exact bytes on the wire when correctness depends on it.

### D-I. `AuthCredentialSource` precedence: `cli` > `env` > `file`

- **Where documented today:** [`AGENTS.md`](../../../AGENTS.md) lines 262–270 (canonical pattern in `any([cli, env, file])`).
- **Driver:** Predictable for users who set both an env var and a CLI
  flag (CLI wins); file is the persisted fallback (e.g. for OAuth2
  token cache scenarios).

### D-J. Auth schemes — strategy is `Auto` by default, can be pinned

- **Where documented today:** [`AGENTS.md`](../../../AGENTS.md) lines 235–246 (`AuthStrategy::*`).
- **Driver:** Hand-written CLIs may know the spec inference is wrong;
  pinning `Any` / `All` / `Routing` is an escape hatch from `Auto`.

### D-K. CLI args are untrusted (LLM-adversarial); env vars are trusted

- **Where documented today:** [`AGENTS.md`](../../../AGENTS.md) lines 108–115; [`src/validate.rs`](../../../src/validate.rs).
- **Driver:** AI-agent invocation is a real threat model. Env vars are
  set by the user themselves and are *not* subject to the same
  validation surface.

### D-L. Two release pipelines: `cargo-dist` (fixture) + `build-cli.yml` (customer CLIs)

- **Where documented today:** [`dist-workspace.toml`](../../../dist-workspace.toml); [`.github/workflows/build-cli.yml`](../../../.github/workflows/build-cli.yml); [FER-9854](https://linear.app/buildwithfern/issue/FER-9854); [FER-10688](https://linear.app/buildwithfern/issue/FER-10688).
- **Driver:** `fern-pipeline-fixture` is the public dist target for the
  release pipeline itself; customer CLIs ship via a separate
  workflow_dispatch flow. Notable constraint: cargo-dist shell/PowerShell
  installers don't ship non-binary contents, so man pages are *not*
  bundled — [FER-10688](https://linear.app/buildwithfern/issue/FER-10688) tracks the alternative.

### D-M. Custom-command registry + `AppContext::execute(group, method)` are the binary's extension point

- **Where documented today:** [`src/custom_commands.rs`](../../../src/custom_commands.rs); [`LIBRARY_DESIGN.md`](../../../LIBRARY_DESIGN.md) lines 67–104.
- **Driver:** Binaries add domain-specific commands (e.g. `whoami`,
  `auth login` flows) without modifying library code or losing access
  to the executor.

### D-N. `<NAME>_*` env-var family is the org-scoped configuration namespace

- **Where documented today:** [`AGENTS.md`](../../../AGENTS.md) lines 281–289; [`src/http.rs`](../../../src/http.rs); [`src/logging.rs`](../../../src/logging.rs).
- **Driver:** Every binary gets a stable prefix (e.g. `BOX_CA_BUNDLE`,
  `LINEAR_LOG_FILE`) so multiple Fern CLIs can coexist without
  collisions. Set in stone by commit `8e1fa07` —
  `feat: make logging env vars org-scoped with CLI name prefix`.

### D-O. OAuth2 token cache on disk; OS keyring opt-in (`keyring` feature)

- **Where documented today:** [`src/auth/oauth2.rs`](../../../src/auth/oauth2.rs); [FER-10692](https://linear.app/buildwithfern/issue/FER-10692).
- **Driver:** Refresh-token flows and persistent client-credentials
  caches need durable storage that survives process exit. Keyring is
  the *secure-by-default* option but requires per-OS deps; on-disk
  file (mode 0600) is the universal fallback.
- **Reversal note:** File on disk was renamed `tokens.json` →
  `credentials.json` (commit `f8e6378`) for future extensibility — any
  external docs or scripts pinning the old name need an update.

### D-P. Extension surface (`Binding` trait, root `CliApp`, multi-binding hooks) — **landed**

- **Where documented today:** [PR #69](https://github.com/fern-api/cli-sdk/pull/69) (merged 2026-05-21); [`DESIGN.md`](../../../DESIGN.md); [`ARCHITECTURE.md` §8.7](../ARCHITECTURE.md#87-custom-commands-and-extension-surface).
- **Driver:** Composing multiple specs and protocols into a single CLI
  (e.g. the `twilio` demo unifying 39 OpenAPI specs —
  [PR #72](https://github.com/fern-api/cli-sdk/pull/72)).
- **Landed in window 2026-05-20 → 2026-05-23.** The surface is now
  exercised in production demos. Promote to ADR when the next
  breaking-change review occurs.

### D-Q. Auth errors must name the missing credential source

- **Where documented today:** [FER-10702](https://linear.app/buildwithfern/issue/FER-10702); [PR #81](https://github.com/fern-api/cli-sdk/pull/81); [`ARCHITECTURE.md` §8.8](../ARCHITECTURE.md#88-auth-error-diagnostics).
- **Driver:** Generic "access denied" messages were the #1 derailment
  for AI agents on first invocation. Named env vars convert a 401
  dead-end into a recoverable next action.
- **Implementation:** `credential_hints()` on `AuthProvider` trait +
  `AuthCredentialSource`. Applied across bearer, basic, header, OAuth2,
  any/all/routing compositions.

### D-S. `LayeredAuthProvider` — additive optional auth layers

- **Where documented today:** [PR #116](https://github.com/fern-api/cli-sdk/pull/116); [`src/auth/compose.rs`](../../../src/auth/compose.rs); [`ARCHITECTURE.md` §8.11](../ARCHITECTURE.md#811-auth-layering).
- **Driver:** Lattice (Anduril) Sandboxes require a second auth header
  (`Anduril-Sandbox-Authorization`) on every request, but only when a
  sandbox token is set. `AuthStrategy::All` makes every scheme mandatory;
  layers are additive and optional.
- **Implementation:** `LayeredAuthProvider` wraps a primary provider;
  `CliApp::auth_layer(provider)` registers layers. Satisfiability follows
  the primary. Each layer is applied only when it has credentials and
  never on `security: []` endpoints.
- **Why this should be promoted:** The pattern generalizes to any API
  requiring optional secondary credentials (e.g., org-scoped headers,
  impersonation tokens). First consumer: `lattice`.

### D-T. Feature-matrix wire suite as a structured test catalog

- **Where documented today:** [FER-10569](https://linear.app/buildwithfern/issue/FER-10569); [PR #125](https://github.com/fern-api/cli-sdk/pull/125); [`docs/agents/feature-matrix.md`](../../agents/feature-matrix.md); [`ARCHITECTURE.md` §8.5](../ARCHITECTURE.md#85-test-layers).
- **Driver:** Scattered wire tests made it hard to reason about what the
  CLI supported end-to-end. A catalog with one cell per matrix capability,
  encoding-exact assertions, and `#[ignore]`-based gap tracking gives a
  single source of truth.
- **Implementation:** `tests/feature_matrix_wire.rs` + dedicated
  `src/bin/feature-matrix-fixture/` binary. 44 active cells, 14 gaps.
  `scripts/list-feature-matrix-gaps.sh` regenerates the README snapshot.
- **Trade-off:** The fixture binary adds compile time (yet another
  `[[bin]]` target). Accepted because the value of structured gap
  tracking outweighs the cost.

### D-R. `BodyEncoding` enum replaces boolean for request-body format dispatch

- **Where documented today:** [FER-10700](https://linear.app/buildwithfern/issue/FER-10700); [PR #75](https://github.com/fern-api/cli-sdk/pull/75); `src/openapi/discovery.rs`.
- **Driver:** Adding `application/x-www-form-urlencoded` support for the
  Twilio demo required a clean dispatch mechanism. A boolean (`form_body`)
  was introduced first, then immediately refactored to an enum for
  extensibility (future: multipart/form-data).
- **Trade-off:** Enum variants must stay in sync with the content-type
  priority ladder in `parser.rs`.
- **Update (2026-05-29):** `Multipart` variant added in
  [FER-10727](https://linear.app/buildwithfern/issue/FER-10727) /
  [PR #88](https://github.com/fern-api/cli-sdk/pull/88). The enum now
  covers `Json | FormUrlEncoded | Multipart`.

### D-U. Retry/backoff + auto Idempotency-Key as cross-cutting middleware

- **Where documented today:** [FER-10521](https://linear.app/buildwithfern/issue/FER-10521); [PR #86](https://github.com/fern-api/cli-sdk/pull/86); `src/http.rs`; [`ARCHITECTURE.md` §8.12](../ARCHITECTURE.md#812-retry-backoff-and-idempotency).
- **Driver:** Reference CLIs (Stripe, AWS) ship retry + idempotency.
  The team decided to implement this as shared infrastructure in
  `src/http.rs` rather than per-executor, so both OpenAPI and GraphQL
  executors share the same retry logic and idempotency-key generation.
- **Implementation:** `RetryPolicy` struct (from `x-fern-retries`),
  exponential backoff with jitter, `Retry-After` header support, auto
  `Idempotency-Key: <uuid>` on POST/PUT/PATCH. `--no-retry` flag and
  per-operation `x-fern-cli-idempotency: false` opt-out.
- **Trade-off:** Retry is shared infra (in `src/http.rs`, above both
  paths) — not duplicated per protocol path. This is correct because
  retry logic is transport-level, not protocol-level.
- **Why this should be promoted:** The retry policy is a cross-SDK
  default contract (4 attempts, 500 ms base). Customers depend on it.

### D-V. Param name sanitization — shell-safe flag rewriting with wire fidelity

- **Where documented today:** [FER-10430](https://linear.app/buildwithfern/issue/FER-10430); [PR #87](https://github.com/fern-api/cli-sdk/pull/87); `src/text.rs`; [`ARCHITECTURE.md` §8.13](../ARCHITECTURE.md#813-param-name-sanitization).
- **Driver:** Real-world OpenAPI specs use parameter names containing
  shell-special characters (`:`, `.`, `[`, etc.) — e.g. BigCommerce's
  `id:in`. These break in YAML, Make, completion frameworks, and many
  shells when used as CLI flags.
- **Implementation:** Multi-pass pipeline in `src/text.rs`: validate →
  NFKD transliterate → sanitize → tidy. Wire name preserved in outgoing
  HTTP requests. Built-in flag collisions resolved with `-param` suffix;
  cross-parameter collisions detected at load time.
- **Trade-off:** `src/text.rs` sits above both protocol paths (shared
  infra). Sanitization only applies to OpenAPI today; GraphQL parameter
  names are already well-formed. If GraphQL ever needs it, the module
  is ready.

### D-W. Custom RFC 3986 query encoder over reqwest built-in

- **Where documented today:** [FER-10569](https://linear.app/buildwithfern/issue/FER-10569); [PR #144](https://github.com/fern-api/cli-sdk/pull/144); `src/openapi/executor.rs` (`encode_query_component`, `append_query_string`, `serialize_query_param`); [`ARCHITECTURE.md` §8.14](../ARCHITECTURE.md#814-parameter-style-serialization).
- **Driver:** reqwest's `.query()` uses `serde_urlencoded` internally,
  which emits form-encoding (`+` for spaces instead of `%20`) and has
  no awareness of OpenAPI `style`/`explode` semantics. Real-world APIs
  require RFC 3986 percent-encoding (literal `%20`, `%7C`, `%20` for
  pipe/space-delimited styles) and per-parameter style dispatch.
- **Implementation:** `encode_query_component` percent-encodes per
  RFC 3986 §3.4. `serialize_query_param` dispatches on `style`
  (`form`, `spaceDelimited`, `pipeDelimited`, `deepObject`) and
  `explode`. `append_query_string` assembles the final URL.
  Server-supplied pagination URLs remain honored verbatim.
- **Trade-off:** Custom encoder must stay aligned with RFC 3986. No
  standard Rust crate was adopted — the team accepted ownership of
  ~50 LOC of encoding logic for precision control over join delimiters.
- **Why this should be promoted:** Every CLI user depends on query
  encoding correctness. A bug here silently sends malformed requests.

### D-X. Mutually-exclusive body input modes (`--json` / leaf / object-shorthand)

- **Where documented today:** [PR #59](https://github.com/fern-api/cli-sdk/pull/59); `src/openapi/executor.rs` (`parse_and_validate_inputs`); `src/graphql/executor.rs` (`build_graphql_body`); [`ARCHITECTURE.md` §8.16](../ARCHITECTURE.md#816-body-input-mode-mutual-exclusivity).
- **Driver:** The previous behavior merged `--json` with per-field body flags,
  producing surprising composite bodies that neither the user nor agents
  could reason about. Pre-GA, the team chose to make the three input modes
  mutually exclusive: `--json` (whole-body), dot-notation leaf flags
  (per-field), and object-shorthand (JSON string for one field). Mixing any
  two is now a `CliError::Validation` naming both conflicting flags.
- **Reversal note:** Supersedes the merge behavior from the original `--json`
  implementation. Intentional breaking change documented in the changeset.
- **Implementation:** Both OpenAPI and GraphQL executors enforce the same
  exclusivity rules independently (per D-A isolation). Object-shorthand
  is a new parser-emitted `MethodParameter` with `param_type: "object"`.
- **Why this should be promoted:** Every agent integration depends on
  predictable body assembly. A silent merge makes it impossible to reason
  about what the CLI sends; mutual exclusivity makes body source explicit.

### D-Y. `CliExecutor` routes SDK execution through CLI transport stack (Level-2 parity)

- **Where documented today:** [FER-11027](https://linear.app/buildwithfern/issue/FER-11027); [PR #168](https://github.com/fern-api/cli-sdk/pull/168); `src/sdk_executor.rs`; [`ARCHITECTURE.md` §8.17](../ARCHITECTURE.md#817-sdk-execution-sharing-cliexecutor).
- **Driver:** Co-generated SDK crates need HTTP execution that matches
  the CLI's on-the-wire behavior exactly (auth, retries, headers, TLS).
  Level-1 (copy scalar config into a second HTTP stack) is insufficient —
  Level-2 (route through the CLI's actual transport stack) is required.
- **Implementation:** `CliExecutor` implements the SDK's `RequestExecutor`
  trait, holding references to `HttpConfig`, `DynAuthProvider`, global
  headers, and base-URL override. `execute()` builds the client via
  `HttpConfig::build_client()`, applies auth via `auth_provider.apply()`,
  and uses `decide_retry()`. ADR-0001 compliant: credentials never
  extracted.
- **Security hardening:** [PR #171](https://github.com/fern-api/cli-sdk/pull/171)
  made `build_request` return `Result` — auth errors now propagate instead
  of silently sending unauthenticated requests (fail-closed).
- **Why this should be promoted:** The execution-sharing boundary is a
  foundational contract between the CLI runtime and co-generated SDKs.
  Any drift (e.g. auth bypass, missing retry) silently breaks custom
  commands.

### D-Z. Source-owned sync manifest for vendor file classification

- **Where documented today:** [FER-11015](https://linear.app/buildwithfern/issue/FER-11015); [PR #165](https://github.com/fern-api/cli-sdk/pull/165); `sync-manifest.toml`.
- **Driver:** The fern repo's `sync-sdk.sh` and `build.mjs` hardcoded
  cli-sdk's file layout in two places that must be kept in sync by hand.
  When cli-sdk refactored its layout (autobins migration), the fern-side
  lists silently drifted.
- **Implementation:** `sync-manifest.toml` classifies every tracked file
  as `ship` / `dev-only` / `templatized` / `not-synced`. CI
  (`scripts/check-sync-manifest.py`) fails on any unclassified file,
  preventing layout changes from silently drifting the sync.
  [PR #170](https://github.com/fern-api/cli-sdk/pull/170) follow-up
  reclassified `build.rs` as `not-synced`.
- **Trade-off:** cli-sdk now owns layout knowledge that was previously
  fern-side. The fern sync script must read the manifest — coupling
  direction inverted from "fern knows cli-sdk" to "cli-sdk declares,
  fern consumes".
- **Why this should be promoted:** Drift in vendor classification is
  invisible to seed tests (which only validate generated output, not
  dev-only files). A manifest violation surfaces at the source.

---

## How to write a new ADR

Follow the format used by [`0001`](../../adr/0001-auth-provider-no-cred-extraction.md) and
[`0002`](../../adr/0002-transport-neutral-http-config-resolve.md):

```markdown
# ADR-NNNN: <Decision title>

**Status:** Accepted — YYYY-MM-DD
**Context:** <FER-XXXXX> (link) — the work that forced the choice.

## Decision
<What was decided, in code or in prose. Reference the actual symbols / paths.>

## Consequences
**Positive.** <list>
**Negative.** <list — be honest about cost>

## Alternatives considered
- **(a)** … Rejected because …
- **(b)** … Rejected because …

## Related
- <Linear tickets, related ADRs, key source files>
```

Add the new ADR file at `docs/adr/NNNN-<kebab-slug>.md`, then add a row to the
"Formal ADRs" table above and remove (or mark "Promoted to ADR-NNNN") the
corresponding implicit-decision entry.

## How to capture an implicit decision

If you make a design call without writing a full ADR, add it to the
"Implicit decisions" list above with:

- the source of truth (commit, PR, Linear ticket, or `AGENTS.md` line range);
- the **driver** (one or two sentences on *why*);
- a `**Reversal note:**` if it overrules an earlier choice.

This keeps the decision discoverable without ADR ceremony, and makes the
later promotion to formal ADR a low-friction step.
