# Architecture changelog

> A running log of changes to **architecture** — building blocks, decisions,
> cross-cutting concepts, runtime flows. Not a substitute for
> [`CHANGELOG.md`](../../CHANGELOG.md) (user-facing) or
> [`.changeset/`](../../.changeset/) (per-PR notes). Entry granularity should
> match: "we partitioned src/ into protocol modules" yes; "fixed a typo in
> the README" no.
>
> **Authoring guidance.** When a PR materially changes the architecture —
> adds a building block, lands an ADR, reverses a previous decision, or
> changes a cross-cutting concept — append an entry here in the same PR.
> Phase 2 automation (see [§Future automation](#future-automation)) will
> assist by drafting candidate entries from commit + PR data, but the
> human author owns the entry.

The format below is loosely modeled on
[Keep a Changelog](https://keepachangelog.com/), adapted for architecture
rather than user-facing changes.

---

## [Unreleased]

### 2026-06-03 → 2026-06-08

**6 merged PRs** in window · **3 with architectural impact** · **2 new implicit decisions** surfaced (D-Y, D-Z) · **2 new formal ADRs** (ADR-0004, ADR-0005) · **0 reversals** · **2 out-of-band signals**

> [source: Slack] #project-cli-generator — digests from prior runs, CLI reference.md/naming thread ([FER-11016](https://linear.app/buildwithfern/issue/FER-11016), [FER-11039](https://linear.app/buildwithfern/issue/FER-11039)) · [source: Notion] [PRD: CLI Generator](https://app.notion.com/p/320b23082e4c80bd8d35f56cbb467d90) · [source: Linear] FER-11027 (Done), FER-11015 (Done), FER-11008 (In Progress — parent epic), FER-11028 (Done — fern repo)

#### Shape changes

- **`allOf` flattening + nullable-union composition lowering (PR #124,
  ADR-0004, ADR-0005).** `merge_all_of_properties` walks `allOf` branches
  recursively with last-branch-wins semantics and a `MAX_ALL_OF_DEPTH = 8`
  safety cap. Nullable unions (`oneOf: [T, null]`) are promoted to the
  existing null sentinel pattern (ADR-0003). Parser `+641 LOC`,
  executor `+716 LOC`. Feature-matrix suite gains composition area:
  74 active cells (was 72), 2 gaps (was 8).
  Touches `src/openapi/parser.rs`, `src/openapi/executor.rs`,
  `tests/feature_matrix_wire.rs`.
  Sources: [PR #124](https://github.com/fern-api/cli-sdk/pull/124),
  [ADR-0004](../adr/0004-all-of-flattening-into-per-field-flags.md),
  [ADR-0005](../adr/0005-nullable-union-promotion-via-composition.md).

- **`CliExecutor` runtime bridge for SDK execution (D-Y, FER-11027,
  PR #168).** New `src/sdk_executor.rs` implements the generated SDK’s
  `RequestExecutor` trait, routing SDK-originated HTTP through the CLI’s
  transport stack with Level-2 behavioral parity (same
  `HttpConfig::build_client()`, `DynAuthProvider::apply()`,
  `decide_retry()`, global headers, base-URL override). ADR-0001
  compliant. Also exposes `block_on()` sync→async helper and
  `SdkError → CliError` bridge. Public accessors added to `AppContext`.
  Touches `src/sdk_executor.rs`, `src/lib.rs`, `src/openapi/app.rs`.
  Sources: [FER-11027](https://linear.app/buildwithfern/issue/FER-11027),
  [PR #168](https://github.com/fern-api/cli-sdk/pull/168).

- **Auth fail-closed security hardening in `CliExecutor` (PR #171).**
  `build_request` changed to return `Result` — auth errors now propagate
  instead of silently sending unauthenticated requests. Adds `Auth`
  variant to `SdkError` preserving exit code and error category.
  Touches `src/sdk_executor.rs`.
  Sources: [PR #171](https://github.com/fern-api/cli-sdk/pull/171).

#### Cross-cutting concept changes

- **Source-owned sync manifest (D-Z, FER-11015, PR #165).**
  `sync-manifest.toml` classifies every tracked file as
  `ship` / `dev-only` / `templatized` / `not-synced` for the fern vendor
  sync. CI check (`scripts/check-sync-manifest.py`) fails on any
  unclassified file, preventing layout drift. Inverts ownership: cli-sdk
  declares file classification, fern consumes it.
  Follow-up [PR #170](https://github.com/fern-api/cli-sdk/pull/170)
  reclassified `build.rs` as `not-synced`.
  Sources: [FER-11015](https://linear.app/buildwithfern/issue/FER-11015),
  [PR #165](https://github.com/fern-api/cli-sdk/pull/165),
  [PR #170](https://github.com/fern-api/cli-sdk/pull/170).

- **Feature-matrix suite at 74 active cells, 2 gaps (was 72 + 8).**
  PR #124 added composition cells (allOf, nullable-union, const-default)
  and closed 6 previously-ignored gaps via the composition lowering.
  Sources: [PR #124](https://github.com/fern-api/cli-sdk/pull/124).

#### Out-of-band signals

- **SDK co-generation pipeline landed in fern repo (FER-11025, FER-11026,
  FER-11028).** Transport seam ([FER-11025](https://linear.app/buildwithfern/issue/FER-11025)),
  co-vendor SDK crate in CLI generation pipeline
  ([FER-11026](https://linear.app/buildwithfern/issue/FER-11026)),
  and generated `sdk_client()` glue + verification suite
  ([FER-11028](https://linear.app/buildwithfern/issue/FER-11028))
  all completed. These are counterparts to PR #168’s `CliExecutor` —
  together they deliver the typed, execution-sharing SDK client for
  custom commands (parent epic [FER-11008](https://linear.app/buildwithfern/issue/FER-11008)).
  Sources: [FER-11025](https://linear.app/buildwithfern/issue/FER-11025),
  [FER-11026](https://linear.app/buildwithfern/issue/FER-11026),
  [FER-11028](https://linear.app/buildwithfern/issue/FER-11028).

- **CLI naming and reference docs (Slack, 2026-06-04–05).**
  Team discussed CLI binary naming conventions (`{org}` vs `{org}-api`,
  tracked as [FER-11039](https://linear.app/buildwithfern/issue/FER-11039)),
  generating `reference.md`
  ([FER-11016](https://linear.app/buildwithfern/issue/FER-11016)),
  CI-on-generation ([FER-11017](https://linear.app/buildwithfern/issue/FER-11017)),
  progressive-disclosure README
  ([FER-11018](https://linear.app/buildwithfern/issue/FER-11018), already landed),
  and CLI snippets in API explorer
  ([FER-11019](https://linear.app/buildwithfern/issue/FER-11019)).
  No code change in cli-sdk, but the naming decision (FER-11039) may
  eventually affect the binary-name generation logic.
  Sources: [Slack thread](https://buildwithfern.slack.com/archives/C0B2EM4Q3TN/p1780538086515969).

### 2026-06-02 → 2026-06-03

**8 merged PRs** in window · **3 with architectural impact** · **1 new implicit decision** surfaced (D-X) · **0 reversals** · **1 out-of-band signal**

> [source: Slack] 6 threads in #project-cli-generator (PR #59 review, self-serve CLI config repos, Okta demo prep, Auth0 demo share, stale-PR cleanup, autorelease question) · [source: Notion] "CLI Generator Top Priorities" page referenced by FER-10871 and FER-10875 · [source: Linear] FER-10871 (Done), FER-10875 (Done — PR in fern repo, out-of-band for this repo)

#### Shape changes

- **Object-shorthand body flags + mutually-exclusive input modes
  (D-X, PR #59).** Parser now emits a parent-level `MethodParameter`
  with `param_type: "object"` for every nested body property and GraphQL
  input type, enabling `--name '{"first":"niels"}'` alongside dot-notation
  `--name.first niels`. The three body-input modes (`--json`, leaf flags,
  object-shorthand) are mutually exclusive — mixing any two is a hard
  `CliError::Validation`. Replaces the previous merge behavior (intentional
  pre-GA breaking change). Both OpenAPI `parse_and_validate_inputs` and
  GraphQL `build_graphql_body` enforce the same rules independently.
  Touches `executor.rs`, `parser.rs` in both protocol paths.
  Sources: [PR #59](https://github.com/fern-api/cli-sdk/pull/59),
  [Slack review thread](https://buildwithfern.slack.com/archives/C0B2EM4Q3TN/p1780431938775459).

- **File/binary response handling landed (FER-10871, PR #151).**
  `executor.rs` now handles non-JSON response bodies end-to-end: `--output -`
  streams raw bytes to stdout; Content-Disposition filename hint honored
  (RFC 6266 + RFC 5987 `filename*`); audio/video MIME → extension mapping;
  aggressive filename sanitization (dotfiles, bidi-override, backslashes).
  Security: O_NOFOLLOW, hardlink nlink>1 rejection, FIFO/device refusal
  via O_NONBLOCK + `is_file()`. Driven by ElevenLabs MCP-thin-CLI use case.
  8 new feature-matrix wire cells (file-response area).
  Touches `executor.rs`, `commands.rs`, `validate.rs`.
  Sources: [FER-10871](https://linear.app/buildwithfern/issue/FER-10871),
  [PR #151](https://github.com/fern-api/cli-sdk/pull/151),
  [Notion: CLI Generator Top Priorities](https://app.notion.com/p/36eb23082e4c80aa863ccba4b4322288).

- **Autobins layout + per-binary AUTH.md (PR #132).** Relocated all CLIs
  from `cli/<name>/` to `src/bin/<name>/` for Cargo auto-discovery
  (autobins). Removes 34 `[[bin]]` blocks from `Cargo.toml`, eliminating
  a parallel-create-demo-cli merge-conflict hotspot. Auth documentation
  moved from shared table in AGENTS.md to per-binary `AUTH.md` files —
  removing the second merge-conflict hotspot.
  Touches `Cargo.toml`, `src/openapi/app.rs`, `src/openapi/overlay.rs`,
  `src/openapi/parser.rs`, `src/graphql/parser.rs`.
  Sources: [PR #132](https://github.com/fern-api/cli-sdk/pull/132).

#### Cross-cutting concept changes

- **Feature-matrix suite at 72 active cells, 8 gaps (was 64 + 8).**
  PR #151 added 8 file-response cells (5 happy-path + 3 attack-surface).
  New "file-response" area brings the total areas to 13.
  Sources: [PR #151](https://github.com/fern-api/cli-sdk/pull/151).

- **Body input mode mutual exclusivity (D-X) as a cross-cutting concept.**
  The three-mode design applies identically across OpenAPI and GraphQL
  executors (independently implemented per D-A isolation). Documented in
  ARCHITECTURE.md §8.16.
  Sources: [PR #59](https://github.com/fern-api/cli-sdk/pull/59).

#### Out-of-band signals

- **FER-10875: Emit publishing workflows in generated CLIs (Done).**
  The generator in the `fern` repo now emits npm publishing workflows into
  each customer's generated CLI project
  ([fern PR #16167](https://github.com/fern-api/fern/pull/16167)). This
  defines the distribution model for generated CLIs — customers get
  installable binaries out of the box. No code change in `cli-sdk`, but
  architecturally relevant: the runtime crate's delivery mechanism is now
  defined.
  Sources: [FER-10875](https://linear.app/buildwithfern/issue/FER-10875),
  [fern PR #16167](https://github.com/fern-api/fern/pull/16167),
  [Notion: CLI Generator Top Priorities](https://app.notion.com/p/36eb23082e4c80aa863ccba4b4322288),
  [Slack thread (autorelease question)](https://buildwithfern.slack.com/archives/C0B2EM4Q3TN/p1780418159587619).

- **Self-serve CLI config + demo repos pattern established.** Team created
  reference repos (`fern-demo/petstore-fern-config`, `fern-demo/petstore-cli`)
  showing what self-serve CLI generation looks like vs the agent-driven
  demos in this repo. Clarifies the boundary between `cli-sdk` (runtime
  library + demo CLIs) and the generator-published customer CLIs.
  Sources: [Slack thread](https://buildwithfern.slack.com/archives/C0B2EM4Q3TN/p1780418159587619).

### 2026-06-01 → 2026-06-02

**8 merged PRs** in window · **5 with architectural impact** · **1 new implicit decision** surfaced (D-W) · **0 reversals** · **1 out-of-band signal**

> [source: Slack] 1 thread (PR #151 / FER-10871 file response handling — not yet merged) · [source: Notion] no new pages in window

#### Shape changes

- **Full query-param style serialization landed (D-W, FER-10895,
  PR #144).** `serialize_query_param` now handles all OpenAPI 3.0 query
  styles: `form` explode/no-explode, `spaceDelimited`,
  `pipeDelimited`, `deepObject` (partial). A custom RFC 3986 query
  encoder (`encode_query_component` / `append_query_string`) replaces
  reqwest's `serde_urlencoded`-based `.query()` — emits `%20` (not
  `+`), keeps join delimiters literal, respects `style`/`explode`.
  `collect_params_from_flags` JSON-parses array-typed flags so the
  serializer can explode/join. 6 feature-matrix cells closed (8 gaps
  remaining). Server-supplied pagination URLs honored verbatim.
  Touches `executor.rs`, `app.rs`.
  Sources: [FER-10895](https://linear.app/buildwithfern/issue/FER-10895),
  [FER-10569](https://linear.app/buildwithfern/issue/FER-10569),
  [PR #144](https://github.com/fern-api/cli-sdk/pull/144).

- **Path-param style serialization landed (FER-10896, PR #138).**
  `render_path_template` now consults each parameter's `style`/`explode`:
  `simple` (comma-join for arrays/objects), `label` (`.` prefix),
  `matrix` (`;name=value`). Only values are percent-encoded; structural
  separators stay literal. 4 feature-matrix cells closed.
  Touches `executor.rs`, `app.rs`.
  Sources: [FER-10896](https://linear.app/buildwithfern/issue/FER-10896),
  [FER-10569](https://linear.app/buildwithfern/issue/FER-10569),
  [PR #138](https://github.com/fern-api/cli-sdk/pull/138).

- **Header-param simple style serialization landed (FER-10897,
  PR #137).** New `serialize_header_simple` in `executor.rs`: arrays →
  comma-join under one name; objects → `k,v,k2,v2` (or `k=v,k2=v2`
  with explode). Control-character injection (CR/LF) rejected via
  shared `reject_dangerous_chars`. 2 feature-matrix cells closed.
  Touches `executor.rs`.
  Sources: [FER-10897](https://linear.app/buildwithfern/issue/FER-10897),
  [FER-10569](https://linear.app/buildwithfern/issue/FER-10569),
  [PR #137](https://github.com/fern-api/cli-sdk/pull/137).

- **Multipart/form-data per-part Content-Type from OpenAPI `encoding`
  object (FER-10899, PR #145).** `MultipartField` / `MultipartPart`
  pipeline now threads per-part MIME from the spec's `encoding.<field>.contentType`
  through to `reqwest::Part::mime_str`. File parts stream from disk.
  1 feature-matrix cell closed (`upload_multipart_form_data`).
  Touches `parser.rs`, `executor.rs`.
  Sources: [FER-10899](https://linear.app/buildwithfern/issue/FER-10899),
  [FER-10569](https://linear.app/buildwithfern/issue/FER-10569),
  [PR #145](https://github.com/fern-api/cli-sdk/pull/145).

- **New demo CLI: `athena` (PR #56, hotfix PR #150).** Binary count
  ≈ 38 (was ≈ 37). Athena Intelligence API — 9 command groups. Auth:
  dual-scheme (`HTTPBearer` + `APIKeyHeader`) both bound to
  `ATHENA_API_KEY`. Initially used removed `.spec()` builder; hotfix
  #150 migrated to `app::CliApp` + `OpenApiBinding`.
  Sources: [PR #56](https://github.com/fern-api/cli-sdk/pull/56),
  [PR #150](https://github.com/fern-api/cli-sdk/pull/150).

#### Cross-cutting concept changes

- **Feature-matrix suite at 64 active cells, 8 gaps (was 50 + 14).**
  The query/path/header style PRs (#137, #138, #144) and multipart
  PR #145 together closed 13 cells. The suite now covers all three
  parameter locations with encoding-exact assertions. Gap snapshot
  regenerated.
  Sources: [PR #137](https://github.com/fern-api/cli-sdk/pull/137),
  [PR #138](https://github.com/fern-api/cli-sdk/pull/138),
  [PR #144](https://github.com/fern-api/cli-sdk/pull/144),
  [PR #145](https://github.com/fern-api/cli-sdk/pull/145).

#### Out-of-band signals

- **File/binary response handling for ElevenLabs (Slack, 2026-06-01).**
  PR #151 (FER-10871) discussed in `#project-cli-generator` — adds
  stdout streaming (`--output -`), `Content-Disposition` filename
  parsing (RFC 6266/5987), audio MIME map, symlink safety
  (`O_NOFOLLOW`). Not yet merged; expected next window.
  Sources: [Slack thread](https://fern-community.slack.com/archives/C0B2EM4Q3TN/p1780357320376329),
  [PR #151](https://github.com/fern-api/cli-sdk/pull/151).

### 2026-05-29 → 2026-06-01

**10 merged PRs** in window · **5 with architectural impact** · **2 new implicit decisions** surfaced (D-U, D-V) · **0 reversals** · **1 out-of-band signal**

> [source: Slack] no architecturally significant threads in window · [source: Notion] 1 page (priorities doc)

#### Shape changes

- **Multipart/form-data request bodies landed (FER-10727, PR #88).**
  `BodyEncoding` (D-R) gains a third variant `Multipart`. The OpenAPI
  parser now surfaces `multipart/form-data` operations instead of
  skipping them — text fields become `--<name>` string args, file fields
  (`format: binary`) accept a file path, `@path` (curl-style), or `-`
  for stdin. The executor builds `reqwest::multipart::Form` with proper
  boundary encoding. Dry-run output includes a `multipart_form_data`
  array. Retries are disabled when any multipart part is sourced from
  stdin (non-replayable). Multipart field names are checked against
  `BUILTIN_FLAG_NAMES` to prevent collision panics.
  Touches `parser.rs`, `discovery.rs`, `commands.rs`, `executor.rs`,
  `app.rs`, `binding.rs`.
  Sources: [FER-10727](https://linear.app/buildwithfern/issue/FER-10727),
  [PR #88](https://github.com/fern-api/cli-sdk/pull/88).

- **HTTP retry/backoff + auto Idempotency-Key landed (D-U, FER-10521,
  PR #86).** New cross-cutting retry infrastructure in `src/http.rs`:
  `RetryPolicy`, `decide_retry`, `parse_retry_after`,
  `compute_backoff_delay`, `generate_idempotency_key`. Both OpenAPI and
  GraphQL executors now retry transient errors (5xx, 408, 429,
  network/timeout) with exponential backoff (500 ms base × 2^attempt,
  10% jitter, 4 total attempts). Respects `Retry-After` header. Auto-
  generates `Idempotency-Key: <uuid>` on POST/PUT/PATCH — same key
  reused across retries for exactly-once semantics, skipped when the
  operation carries `x-fern-idempotent` (user-provided key). Per-
  operation opt-out via `x-fern-cli-idempotency: false`. `--no-retry`
  flag disables all retries. GraphQL executor gains full retry parity
  with OpenAPI, including fresh keys per pagination page.
  Sources: [FER-10521](https://linear.app/buildwithfern/issue/FER-10521),
  [PR #86](https://github.com/fern-api/cli-sdk/pull/86).

- **Param name sanitization landed (D-V, FER-10430, PR #87).** New
  `src/text.rs` module with a multi-pass sanitization pipeline:
  validate → NFKD transliterate → sanitize (shell-special chars to `-`)
  → tidy (collapse/trim dashes). Parameters containing `:`, `.`, `[`,
  `{`, `+`, etc. are rewritten into clean kebab-case flags while the
  original wire name is preserved in outgoing HTTP requests. Built-in
  flag collisions resolved by appending `-param`; cross-parameter
  collisions detected at load time. Help text shows the original wire
  name when the flag differs. Non-Latin scripts rejected; confusable
  codepoints rejected as a security smell.
  Touches `commands.rs`, `executor.rs`, `app.rs`.
  Sources: [FER-10430](https://linear.app/buildwithfern/issue/FER-10430),
  [PR #87](https://github.com/fern-api/cli-sdk/pull/87).

- **New demo CLI: `fathom` (PR #133).** Binary count ≈ 37 (was ≈ 36).
  Fathom External API — 7 operations across 5 groups. Auth: raw API key
  in `X-Api-Key` header (`FATHOM_API_KEY`). Includes overlay, mock
  server, smoke tests, agent skill.
  Sources: [PR #133](https://github.com/fern-api/cli-sdk/pull/133).

#### Cross-cutting concept changes

- **Feature-matrix cells aligned to retry contract (PR #134).** Three
  stale cells in the feature-matrix suite (D-T) updated from pre-
  FER-10521 contract to post-FER-10521: plain POST now carries auto-
  generated `Idempotency-Key`, 500 is retried, auto-keyed POST retries
  on 503. Suite now at 50 active cells + 14 gaps (was 44 + 14).
  Sources: [PR #134](https://github.com/fern-api/cli-sdk/pull/134).

#### Out-of-band signals

- **CLI Generator Top Priorities (Notion, 2026-05-28).** Team
  priorities document capturing customer demand signals and near-term
  roadmap decisions. Key items with architectural relevance:
  FER-10795 (cli-sdk → generator sync process — "set up copy/paste CI
  job"), FER-10875 (NPM publishing workflows for generated CLIs),
  FER-10876 (customization via macros — embed rust-model SDK outputs as
  handles). None landed in code this window; noted for future runs.
  Sources: [Notion](https://www.notion.so/36eb23082e4c80aa863ccba4b4322288),
  [FER-10795](https://linear.app/buildwithfern/issue/FER-10795),
  [FER-10875](https://linear.app/buildwithfern/issue/FER-10875),
  [FER-10876](https://linear.app/buildwithfern/issue/FER-10876).

#### In-flight (not merged; noted for next run)

- **Overlay fixture test relocation** (FER-10792, PR #126). Still in
  progress — `cargo build --tests` fails on every generated CLI because
  overlay.rs unit tests `include_str!` a fixture deleted by SDK_IGNORE.
  Sources: [FER-10792](https://linear.app/buildwithfern/issue/FER-10792),
  [PR #126](https://github.com/fern-api/cli-sdk/pull/126).

- **OAuth2Auth client-credentials fix** (FER-10745, PR #127). Still in
  progress — wires client-credentials flow instead of silently sending
  unauthenticated requests.
  Sources: [FER-10745](https://linear.app/buildwithfern/issue/FER-10745),
  [PR #127](https://github.com/fern-api/cli-sdk/pull/127).

- **Venus org-level gating** (FER-10833). Still in progress — new
  `cliGeneratorsEnabled` org flag in Venus (lives in fern-api/fern).
  Sources: [FER-10833](https://linear.app/buildwithfern/issue/FER-10833).

---

### 2026-05-25 → 2026-05-29

**25 merged PRs** in window · **4 with architectural impact** · **2 new implicit decisions** surfaced (D-S, D-T) · **1 formal ADR landed** (ADR-0003) · **0 out-of-band signals**

> [source: Slack] unavailable (timeout) · [source: Notion] unavailable (401)

#### Shape changes

- **ADR-0003: Null sentinel for nullable scalar body flags (FER-10753).**
  `--field null` becomes JSON `null` on the wire when the schema marks the
  field nullable (OpenAPI 3.0 `nullable: true` and 3.1 `type: [..., "null"]`),
  scoped to scalar types. Non-nullable fields keep today's behavior. Design
  rationale captured in
  [`docs/adr/0003-null-sentinel-on-nullable-scalar-body-flags.md`](../../adr/0003-null-sentinel-on-nullable-scalar-body-flags.md).
  Touches `discovery.rs` (`MethodParameter.nullable`), `parser.rs`
  (`is_scalar_nullable`), `app.rs` (sentinel conversion), `commands.rs`
  (value-name rendering), `executor.rs` (validator fix).
  Sources: [FER-10753](https://linear.app/buildwithfern/issue/FER-10753),
  [PR #91](https://github.com/fern-api/cli-sdk/pull/91).

- **`LayeredAuthProvider` (D-S, §8.11).** New shared-infra primitive in
  `src/auth/compose.rs`. Wraps a primary provider and layers optional
  providers on top — each layer is applied additively only when it has
  credentials, never on `security: []` endpoints. Introduced for
  Lattice (Anduril) Sandboxes multi-header auth. New `CliApp::auth_layer` /
  `auth_layer_shared` API on the OpenAPI builder.
  Sources: [PR #116](https://github.com/fern-api/cli-sdk/pull/116).

- **Binary count ≈ 36** (was ≈ 20 last window). 13 new demo CLIs added:
  `sarvam`, `coinflow`, `icepanel`, `fifteenth`, `mavenagi`, `contentful`,
  `terra`, `truefoundry`, `lattice` (renamed from `anduril`), `unleash`,
  `videogen`, `finch`, `elevenlabs`. `anduril` binary renamed to `lattice`
  (the platform name) with env vars aligned to Anduril SDK docs.
  Sources: PRs [#95](https://github.com/fern-api/cli-sdk/pull/95),
  [#98](https://github.com/fern-api/cli-sdk/pull/98),
  [#100](https://github.com/fern-api/cli-sdk/pull/100),
  [#101](https://github.com/fern-api/cli-sdk/pull/101),
  [#99](https://github.com/fern-api/cli-sdk/pull/99),
  [#105](https://github.com/fern-api/cli-sdk/pull/105),
  [#102](https://github.com/fern-api/cli-sdk/pull/102),
  [#104](https://github.com/fern-api/cli-sdk/pull/104),
  [#116](https://github.com/fern-api/cli-sdk/pull/116),
  [#109](https://github.com/fern-api/cli-sdk/pull/109),
  [#115](https://github.com/fern-api/cli-sdk/pull/115),
  [#107](https://github.com/fern-api/cli-sdk/pull/107).

#### Cross-cutting concept changes

- **Feature-matrix wire suite (D-T, §8.5).** Canonical encoding-exact
  end-to-end wire suite covering the SDK-vs-CLI feature matrix. 44 active
  cells across 12 areas + 14 honest `#[ignore]`'d gaps with descriptive text.
  `scripts/list-feature-matrix-gaps.sh` regenerates the gap snapshot.
  `docs/agents/feature-matrix.md` is the agent-facing doc.
  Sources: [FER-10569](https://linear.app/buildwithfern/issue/FER-10569),
  [PR #125](https://github.com/fern-api/cli-sdk/pull/125).

- **`AppContext.invoke()` base-url inheritance.** Custom-command handlers
  calling `ctx.invoke()` now inherit the `--base-url` / `{NAME}_BASE_URL`
  override. Previously `invoke()` always used the spec's server URL.
  Also: `to_kebab_flag()` fixes server-variable flag names (e.g. `orgId` →
  `--org-id` instead of `--orgId`).
  Sources: [PR #92](https://github.com/fern-api/cli-sdk/pull/92).

#### In-flight (not merged; noted for next run)

- **Overlay fixture test relocation** (FER-10792, PR #126). Urgent —
  `cargo build --tests` fails on every generated CLI because overlay.rs
  unit tests `include_str!` a fixture deleted by SDK_IGNORE.
  Sources: [FER-10792](https://linear.app/buildwithfern/issue/FER-10792),
  [PR #126](https://github.com/fern-api/cli-sdk/pull/126).

- **OAuth2Auth client-credentials fix** (FER-10745, PR #127). Security
  hardening — wires client-credentials flow instead of silently sending
  unauthenticated requests. Resolves risk §11 #9.
  Sources: [FER-10745](https://linear.app/buildwithfern/issue/FER-10745),
  [PR #127](https://github.com/fern-api/cli-sdk/pull/127).

- **Multipart/form-data request bodies** (FER-10727, PR #88). Extends
  `BodyEncoding` (D-R) with a third variant.
  Sources: [FER-10727](https://linear.app/buildwithfern/issue/FER-10727),
  [PR #88](https://github.com/fern-api/cli-sdk/pull/88).

- **HTTP retry/backoff + Idempotency-Key** (FER-10521, PR #86).
  Sources: [FER-10521](https://linear.app/buildwithfern/issue/FER-10521),
  [PR #86](https://github.com/fern-api/cli-sdk/pull/86).

- **Param name sanitization** (FER-10430).
  Sources: [FER-10430](https://linear.app/buildwithfern/issue/FER-10430).

- **Composition lowering** (allOf/nullable-union into flag surface).
  Active branch `patrick/openapi/composition-lowering`.

- **Venus org-level gating** (FER-10833). New `cliGeneratorsEnabled`
  org flag in Venus to gate CLI generator usage from the fern CLI.
  Sources: [FER-10833](https://linear.app/buildwithfern/issue/FER-10833).

---

### 2026-05-20 → 2026-05-25

**16 merged PRs** in window · **8 with architectural impact** · **2 new implicit decisions** surfaced (D-Q, D-R) · **1 existing decision updated** (D-P: in-flight → landed) · **0 out-of-band signals**

#### Shape changes

- **Multi-binding extension surface landed (D-P).** `CliApp::binding(name)`
  composes N specs into one CLI. Auth-at-root, binding-context custom
  commands, global-arg deduplication.
  Sources: [PR #69](https://github.com/fern-api/cli-sdk/pull/69),
  [PR #72](https://github.com/fern-api/cli-sdk/pull/72) (twilio — 39 specs),
  [Slack](https://buildwithfern.slack.com/archives/C0B2EM4Q3TN/p1779134609239829).

- **`BodyEncoding` enum (D-R).** OpenAPI `discovery.rs` now dispatches on
  `Json | FormUrlEncoded` per-operation. Enables form-encoded APIs (Twilio
  v2010).
  Sources: [FER-10700](https://linear.app/buildwithfern/issue/FER-10700),
  [PR #75](https://github.com/fern-api/cli-sdk/pull/75).

- **OpenAPI 3.1 parser support.** Handles `type: [...]` arrays, nullable
  union syntax, `oneOf`/`anyOf`/`allOf` at component-schema root.
  Sources: [FER-10528](https://linear.app/buildwithfern/issue/FER-10528),
  [PR #70](https://github.com/fern-api/cli-sdk/pull/70),
  [Slack](https://buildwithfern.slack.com/archives/C0B2EM4Q3TN/p1779308619151199).

- **New demo CLIs: `twilio`, `agentmail`.** Binary count ≈ 20. `agentmail`
  is the first demo using an operation-level OpenAPI overlay.
  Sources: [PR #72](https://github.com/fern-api/cli-sdk/pull/72),
  [PR #93](https://github.com/fern-api/cli-sdk/pull/93).

#### Cross-cutting concept changes

- **Auth error diagnostics (D-Q, §8.8).** `credential_hints()` on
  `AuthProvider` and `AuthCredentialSource` names the missing env var/flag
  in both JSON envelope and stderr.
  Sources: [FER-10702](https://linear.app/buildwithfern/issue/FER-10702),
  [PR #81](https://github.com/fern-api/cli-sdk/pull/81).

- **Scripting basics (§8.9).** `--body -` stdin, `--quiet`, `<cli> errors`
  subcommand.
  Sources: [FER-10518](https://linear.app/buildwithfern/issue/FER-10518),
  [PR #67](https://github.com/fern-api/cli-sdk/pull/67),
  [Slack](https://buildwithfern.slack.com/archives/C0B2EM4Q3TN/p1779316464596789).

- **SKILL.md generation (§8.10).** `<cli> generate-skills` subcommand
  added to early-intercept. Deterministic Rust templates.
  Sources: [FER-9863](https://linear.app/buildwithfern/issue/FER-9863),
  [PR #76](https://github.com/fern-api/cli-sdk/pull/76),
  [Slack](https://buildwithfern.slack.com/archives/C0B2EM4Q3TN/p1779316141186009).

- **Shell completion + man pages.** `<cli> completion <shell>` and
  `<cli> man` wired into both OpenAPI and GraphQL paths.
  Sources: [FER-10519](https://linear.app/buildwithfern/issue/FER-10519),
  [PR #63](https://github.com/fern-api/cli-sdk/pull/63),
  [PR #66](https://github.com/fern-api/cli-sdk/pull/66),
  [Slack](https://buildwithfern.slack.com/archives/C0B2EM4Q3TN/p1779298510148599).

#### In-flight (not merged; noted for next run)

- **Null sentinel for nullable scalar body flags** (FER-10753, branch
  `patrick/openapi/null-sentinel-for-nullable-scalars`). Introduces
  ADR-0003 on the branch.
  Sources: [FER-10753](https://linear.app/buildwithfern/issue/FER-10753),
  [Slack](https://buildwithfern.slack.com/archives/C0B2EM4Q3TN/p1779475306587109).

- **Object-shorthand body flags** (JFL-1.4, branch `feat/jfl-json-flags`).
  Sources: [PR #83 (branch)](https://github.com/fern-api/cli-sdk/pull/83).

- **HTTP retry/backoff + Idempotency-Key** (FER-10521, branch
  `tanmay/fer-10521-retry-idempotency`).

- **Param name sanitization** (FER-10430, branch
  `tanmay/fer-10430-param-sanitize`).

- **Multipart/form-data request bodies** (FER-10727, PR #88). Urgent
  priority; extends `BodyEncoding` (D-R) with a third variant.
  Sources: [FER-10727](https://linear.app/buildwithfern/issue/FER-10727),
  [PR #88](https://github.com/fern-api/cli-sdk/pull/88).

- **OAuth2Auth silent credential drop** (FER-10745, Triage). Risk surface
  signal — `OAuth2Auth` may send unauthenticated requests when
  client-credentials are missing instead of failing fast.
  Sources: [FER-10745](https://linear.app/buildwithfern/issue/FER-10745).

---

## [Bootstrap] — 2026-05-20

### Added
- `docs/architecture/ARCHITECTURE.md` — arc42-lite system architecture
  documentation, anchored on the protocol-path-isolation constraint.
- `docs/architecture/diagrams/` — C4-style Mermaid diagrams (context,
  container, two component views, sequence diagram for CLI invocation).
- `docs/architecture/decisions/INDEX.md` — aggregates the two existing
  formal ADRs and lists 16 implicit decisions with Linear-ticket
  provenance, ready for promotion to formal ADR form.
- This file — `CHANGELOG-ARCH.md` — scaffold for ongoing architecture
  history.
- `docs/architecture/automation/` — playbook + sources config for the
  scheduled multi-source agent that will keep this directory fresh.
  Devin schedule activation deferred to a follow-up.

### Context captured (no new decisions; documentation of existing state)
- **D-A** Protocol path isolation between `src/openapi/` and `src/graphql/` — established by [FER-10364](https://linear.app/buildwithfern/issue/FER-10364) PR #15.
- **D-B** Compile-time schema embedding via `include_str!` — origin in early `box` CLI; codified in [`LIBRARY_DESIGN.md`](../../LIBRARY_DESIGN.md).
- **D-C** GraphQL as reference implementation — [`AGENTS.md`](../../AGENTS.md) line 104.
- **D-D** `--audience` runtime flag → `CliApp::audiences()` compile-time preset — commit `4bba58a`.
- **D-E**, **D-F** OpenAPI Overrides + Overlay v1.0.0 deep-merge — [FER-10449](https://linear.app/buildwithfern/issue/FER-10449), PR #22.
- **D-G** `OutputPipeline` as single composable output stage — [FER-10517](https://linear.app/buildwithfern/issue/FER-10517) step 1.
- **D-H** Wire test two-tier mock model — [FER-9860](https://linear.app/buildwithfern/issue/FER-9860).
- **D-I**, **D-J** `AuthCredentialSource` precedence + `AuthStrategy::*` — `AGENTS.md` §Authentication.
- **D-K** LLM-adversarial input validation contract — `AGENTS.md` lines 108–115.
- **D-L** Two release pipelines (cargo-dist + build-cli.yml) — [FER-9854](https://linear.app/buildwithfern/issue/FER-9854), [FER-10688](https://linear.app/buildwithfern/issue/FER-10688).
- **D-M** Custom-command registry + `AppContext::execute` — [`LIBRARY_DESIGN.md`](../../LIBRARY_DESIGN.md).
- **D-N** `<NAME>_*` env-var namespace — commit `8e1fa07`.
- **D-O** OAuth2 file-on-disk + optional keyring — [FER-10692](https://linear.app/buildwithfern/issue/FER-10692).
- **D-P** Extension surface (`Binding` trait, root `CliApp`) — in flight (PRs #62, #69).

See [`decisions/INDEX.md`](./decisions/INDEX.md) for the durable list.

---

## Automation

This changelog is maintained by a **scheduled multi-source agent**. The
methodology and configuration live in
[`automation/`](./automation/) — see
[`automation/README.md`](./automation/README.md) for the TL;DR and
[`automation/PLAYBOOK.md`](./automation/PLAYBOOK.md) for the full
prompt.

Each run pulls activity from **GitHub + Linear + Slack + Notion**
(sources auto-discovered via `FER-*` ID cross-referencing), synthesizes
the four streams, and opens a draft PR with proposed updates to
[`../ARCHITECTURE.md`](../ARCHITECTURE.md),
[`../decisions/INDEX.md`](../decisions/INDEX.md), and this file. A digest
posts to `#project-cli-generator`.

The Devin schedule is **not yet activated** at the time of bootstrap —
see [`automation/README.md`](./automation/README.md) for activation
steps. Manual invocation works today via the `devin run` command in
that file.

<!-- last-run: 2026-06-08T01:01:00Z -->
<!-- The marker above is consumed by the automation playbook to compute
     the next run's window. Each successful run updates it. -->
