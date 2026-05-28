# Fern CLI SDK — Design Document

## Overview

The Fern CLI SDK generates CLIs from OpenAPI specs. A customer provides an OpenAPI spec with `x-fern-sdk-group-name` and `x-fern-sdk-method-name` extensions, and the SDK produces a self-contained Rust binary with a fully typed command surface — individual flags for each parameter, auto-pagination, structured output, and `--dry-run` support.

## Background

This repository was forked from Google's `gws` (Google Workspace CLI), which dynamically builds its entire command surface at runtime by fetching Google Discovery Documents. The key architectural insight from `gws` is that a CLI can be **entirely schema-driven** — no hand-written command definitions needed.

We adapted this approach for OpenAPI specs, with one fundamental change: instead of fetching the spec at runtime, we **embed it at compile time** via `include_str!`. This enables static shell completions, faster startup, and no runtime dependency on an API discovery service.

### Current state (prototype)

The repository currently produces a **Calendly CLI** from the bundled `openapi/openapi.yaml` spec. All 14 resource groups and 50+ methods are auto-generated. The CLI supports `--dry-run`, `--format`, auto-pagination, and bearer token authentication.

## Lessons from gws

### Why gws used `--params` instead of individual flags

Google's `gws` CLI takes all parameters as a single JSON blob (`--params '{"fileId": "abc"}'`) rather than generating individual flags (`--file-id abc`). We initially adopted this approach but identified it as a UX gap worth closing. Understanding *why* Google made this choice informs our design:

1. **Parameter volume.** Google APIs have 10-20+ parameters per method, plus global parameters (`fields`, `key`, `alt`, `prettyPrint`, `quotaUser`) applied to every endpoint. Generating flags for all of them makes `--help` a wall of text. The `--params` bag keeps help output manageable.

2. **The helpers were abstractions, not just nicer flags.** Google added hand-written "helper" commands (`+send`, `+reply`, `+upload`) for the most common workflows. These weren't just flag-to-parameter mappings — they performed transformations: constructing RFC 5322 emails, base64-encoding, handling multipart MIME, managing thread IDs for replies. This logic can't be expressed as flat parameter mapping.

3. **Two audiences.** The `--params` JSON bag is actually great for AI agents (they construct JSON programmatically). Individual flags are better for humans typing commands. Google optimized for the agent case (structured JSON in, structured JSON out) and added helpers for the human case.

### Why we can do better

For a single-API CLI with manageable parameter counts (Calendly methods have 2-6 params each), we have the information to generate proper typed flags:

```bash
# What gws does (and our current prototype):
box users get-user --params '{"uuid": "abc-123"}'

# What we should generate:
box users get-user --uuid abc-123

# With full type information from OpenAPI:
box scheduled-events list-scheduled-events \
  --user https://api.box.com/users/xxx \
  --status active \           # enum: active, canceled
  --sort created_at:desc \
  --count 50                  # number, min: 1, max: 100
```

The OpenAPI spec provides everything needed: parameter name, type, location (path/query), required/optional, enum values, defaults, and descriptions. We should use all of it.

### Design principles (derived from gws)

1. **Keep `--params` as an escape hatch.** Individual flags are the primary UX, but `--params` remains available for power users and AI agents who prefer JSON input. If both are provided, `--params` values override individual flags.

2. **Keep `--json` for request bodies.** Request bodies are often complex nested objects that don't map well to flat flags. The `--json` flag is the right abstraction here.

3. **Don't generate flags for global/framework parameters.** Pagination (`--page-all`, `--page-limit`, `--page-delay`), output (`--format`, `--output`), and debugging (`--dry-run`) flags are framework-level and should be consistent across all commands. They are not derived from the OpenAPI spec.

4. **Required path parameters could be positional.** `box users get-user abc-123` is more natural than `box users get-user --uuid abc-123`. But this is a UX choice — positional args are less discoverable. Start with flags, consider positional later.

## Architecture

### Spec → CLI pipeline

```
openapi/openapi.yaml
       │
       │  include_str!() at compile time
       ▼
src/openapi.rs ──► RestDescription (internal representation)
       │
       ├──► src/commands.rs ──► clap::Command tree (with typed flags per method)
       │
       ├──► src/executor.rs ──► HTTP request construction + response handling
       │
       └──► src/formatter.rs ──► JSON / table / YAML / CSV output
```

### OpenAPI extensions

#### `x-fern-sdk-group-name` (required, list of strings)

Determines the subcommand group hierarchy. Each element is converted from camelCase to kebab-case. Lists with multiple elements create nested subcommand groups.

```yaml
# Single-level group
x-fern-sdk-group-name:
  - scheduledEvents        # → box scheduled-events <method>

# Nested groups
x-fern-sdk-group-name:
  - scheduledEvents
  - invitees               # → box scheduled-events invitees <method>
```

These map directly to nested `RestResource` entries in the internal representation. The existing `commands.rs` recursive builder handles arbitrary nesting depth.

#### `x-fern-sdk-method-name` (required, string)

The leaf command name, used as-is (typically kebab-case):

```yaml
x-fern-sdk-method-name: list-event-invitees
```

#### `x-fern-bearer` (on securitySchemes)

Specifies the environment variable for bearer token authentication:

```yaml
components:
  securitySchemes:
    personal_access_token:
      type: http
      scheme: bearer
      x-fern-bearer:
        env: CALENDLY_API_TOKEN
```

### Internal representation

The OpenAPI spec is parsed into `RestDescription` / `RestResource` / `RestMethod` structs (defined in `src/discovery.rs`). This representation is API-format-agnostic — it could be populated from OpenAPI, AsyncAPI, or any other spec format.

Key types:
- `RestDescription` — top-level: name, base URL, schemas, resources, pagination config
- `RestResource` — a command group: methods + nested sub-resources
- `RestMethod` — a single command: HTTP method, path template, parameters, request/response schemas
- `MethodParameter` — a single parameter: name, type, location, required, enum values, description

### Pagination

Pagination token names are configurable per-API via `RestDescription` fields:
- `pagination_token_query_param` — the query parameter name (default: `"pageToken"`, Calendly: `"page_token"`)
- `pagination_token_response_path` — dotted path to next token in response JSON (default: `"nextPageToken"`, Calendly: `"pagination.next_page_token"`)

These are auto-detected from the OpenAPI spec's `components/parameters`.

### Authentication

Currently: simple bearer token from an environment variable. The token env var name is derived from the `x-fern-bearer` extension on the security scheme.

Future: support for API key (header or query), basic auth, and OAuth2 authorization code flow — all driven by the OpenAPI `securitySchemes` definition.

## Flag generation design (next milestone)

### Goal

Transform each OpenAPI parameter into a dedicated clap flag:

```
box scheduled-events list-scheduled-events --help

List Events

Usage: box scheduled-events list-scheduled-events [OPTIONS]

Options:
      --user <URI>          Calendly user URI (required)
      --status <STATUS>     Filter by status [possible values: active, canceled]
      --sort <SORT>         Sort order [default: created_at:asc]
      --min-start-time <T>  Lower bound for event start time (ISO 8601)
      --max-start-time <T>  Upper bound for event start time (ISO 8601)
      --count <N>           Results per page [default: 20]
      --params <JSON>       Additional parameters as JSON (overrides flags)
      --page-all            Auto-paginate through all results
  -h, --help                Print help
```

### Implementation approach

In `commands.rs`, when building method subcommands, iterate `method.parameters` and emit a `clap::Arg` for each:

```rust
for (name, param) in &method.parameters {
    let mut arg = Arg::new(name)
        .long(name)  // OpenAPI param names are typically snake_case; consider kebab-case
        .help(param.description.as_deref().unwrap_or(""));

    if param.required {
        arg = arg.required(true);
    }
    if let Some(ref default) = param.default {
        arg = arg.default_value(default);
    }
    if let Some(ref values) = param.enum_values {
        arg = arg.value_parser(clap::builder::PossibleValuesParser::new(values));
    }

    method_cmd = method_cmd.arg(arg);
}
```

In the executor, collect individual flag values into the params map before URL construction:

```rust
// Merge individual flags into params (--params JSON overrides)
for (name, _param) in &method.parameters {
    if let Some(value) = matched_args.get_one::<String>(name) {
        if !params.contains_key(name) {
            params.insert(name.clone(), Value::String(value.clone()));
        }
    }
}
```

### Open questions

1. **Flag naming convention.** OpenAPI params use `snake_case` (`min_start_time`). Clap flags typically use `kebab-case` (`--min-start-time`). Should we convert? This creates a mapping layer between flag names and parameter names.

2. **Pagination parameters.** Params like `page_token` and `count` overlap with the framework's `--page-all` / `--page-limit`. Should they be hidden or shown?

3. **Path parameters.** Required path params could be positional (`box users get-user UUID`) or flags (`--uuid UUID`). Positional is more ergonomic but less discoverable.

## Roadmap

Prioritized list of gaps to close before this is production-ready. Informed by competitive analysis (Stainless CLI generator) and real-world API coverage needs.

### P0 — Required for production use

#### 1. Individual typed flags per parameter

**Status:** Not started. Currently all params go through `--params '{"key":"value"}'` JSON blob.

**What:** Generate a dedicated `clap::Arg` for each OpenAPI parameter with proper `required()`, `value_parser()`, `help()`, `default_value()`, and enum value constraints. Keep `--params` as an override/escape hatch for complex cases.

Flag names use `kebab-case` (converted from OpenAPI's `snake_case`): `min_start_time` → `--min-start-time`.

**Before/after:**
```bash
# Before (current)
box scheduled-events list-scheduled-events --params '{"user":"...","status":"active"}'

# After
box scheduled-events list-scheduled-events --user "..." --status active
```

See "Flag generation design" section above for implementation details.

#### 2. Nested object parameters (single-level dot notation)

**Status:** Not started.

**What:** Support single-level nesting for request body fields via dot notation in flags, matching the Stainless CLI convention. Deeply nested structures fall back to `--json`.

```bash
# Single-level nesting via dot notation
acme people create --job "President" --name.full-name "Abraham Lincoln" --name.nickname "Abe"

# Equivalent to:
acme people create --json '{"job": "President", "name": {"full_name": "Abraham Lincoln", "nickname": "Abe"}}'
```

**Implementation:** When building flags from request body schema properties, if a property is an `object` type, generate flags for its immediate children using `parent.child` dot notation. Only one level deep — anything deeper requires `--json`.

The executor collects dotted flag values and assembles them into nested JSON before sending.

#### 3. Query parameter serialization styles

**Status:** Implemented via serde-qs. Supports form (explode true/false) and deepObject styles.

**What:** Support the common OpenAPI query parameter serialization styles:
- `style: form, explode: true` (default) — `tags=a&tags=b`
- `style: form, explode: false` — `tags=a,b`
- `style: deepObject` — `filter[status]=active&filter[date]=2024-01-01`
- Array params — `id=1&id=2&id=3`

**Implementation:** Read `style` and `explode` from the OpenAPI parameter definition. In `build_url`, serialize query params according to the declared style. Default to `style: form, explode: true` per OpenAPI 3.0 spec.

#### 4. Schema composition (`oneOf`/`anyOf`/`allOf`)

**Status:** Basic types only. Schema converter doesn't handle composition.

**What:** Support composed schemas for request body validation and flag generation. `allOf` merges properties from all sub-schemas. `oneOf`/`anyOf` are accepted permissively (validate against any matching variant).

#### 5. `multipart/form-data` file uploads

**Status:** Executor has Google-style `multipart/related` code but not standard `multipart/form-data`.

**What:** When an OpenAPI operation has `requestBody.content.multipart/form-data`, build a proper form-data body. The schema tells us which fields are files (`type: string, format: binary`) vs. regular form fields.

Support `@file.ext` syntax for file references (matching Stainless convention):
```bash
acme documents upload --file @report.pdf --title "Q1 Report"
```

For JSON endpoints, support file type sniffing: plain text files sent as string literals, binary files as base64. Allow explicit encoding with `@file://path` (text) and `@data://path` (base64).

**Implementation:** Use `reqwest::multipart::Form`. Each schema property becomes either a text part or a file part based on `format: binary`.

#### 6. Header parameters

**Status:** Parsed from OpenAPI but not sent. Only path and query params are wired.

**What:** Parameters with `in: header` should be sent as HTTP headers. Common use cases: API versioning (`X-Api-Version`), idempotency keys (`Idempotency-Key`).

**Implementation:** In `executor.rs`, after building the request, iterate header params and add via `request.header(name, value)`.

#### 7. Stdin/pipe input for request bodies

**Status:** Not started.

**What:** Allow piping JSON (or YAML) into commands as an alternative to `--json`:

```bash
cat person.json | acme people create
acme people create <<JSON
{"name": "Alice", "email": "alice@example.com"}
JSON
```

**Implementation:** If stdin is not a TTY and no `--json` flag is provided, read stdin as the request body. Detect JSON vs. YAML from content.

#### 8. Man pages

**Status:** Not started.

**What:** Auto-generate man pages from the OpenAPI spec. Each command group and method gets a man page with parameter docs, examples, and description text pulled from the spec. Viewable via `man acme` or `acme --help`.

**Implementation:** Use `clap_mangen` to generate man pages from the clap command tree at build time. Include compressed man pages in release artifacts.

#### 9. Shell completions

**Status:** Not started.

**What:** `acme completions bash/zsh/fish/powershell` command using `clap_complete`. Trivial since the spec is embedded at compile time. Include completion scripts in Homebrew formula and release artifacts.

### P1 — Important for broad API compatibility

#### 10. OAuth2 PKCE authentication flow

**Status:** Not started. Currently only supports static bearer tokens from env vars.

**What:** Auto-generate `auth login`, `auth logout`, `auth status` commands from the OpenAPI `securitySchemes` definition. Use PKCE (Proof Key for Code Exchange) authorization code flow — the standard for CLI "public clients."

**Flow:**
```
$ box auth login
Opening browser to https://auth.box.com/oauth/authorize?
  client_id=...&redirect_uri=http://localhost:9876/callback
  &response_type=code&code_challenge=...&code_challenge_method=S256

Waiting for authorization...
✓ Logged in as alice@example.com
Token stored at ~/.config/box/credentials.json
```

**What OpenAPI gives us:** `authorizationUrl`, `tokenUrl`, `refreshUrl`, `scopes` — all from `securitySchemes.oauth2.flows.authorizationCode`. The only customer-provided piece is `client_id`.

**CliApp builder API:**
```rust
CliApp::new("box")
    .spec(include_str!("openapi.yaml"))
    .auth_bearer_env("CALENDLY_API_TOKEN")
    .auth_oauth2_pkce(OAuth2PkceConfig {
        client_id_env: "CALENDLY_CLIENT_ID",
    })
    .run()
```

**Credential precedence:**
1. Explicit bearer token env var (highest priority)
2. Stored OAuth2 tokens from `auth login`
3. No auth (unauthenticated request)

**Headless fallback:** Device authorization flow for SSH/CI environments (if provider supports it).

#### 11. Multiple auth schemes per operation

**Status:** Single bearer token only.

**What:** OpenAPI operations can list multiple security requirements. The CLI should try them in precedence order (bearer token → OAuth2 stored token → prompt for login).

#### 12. `--base-url` override flag

**Status:** Not started.

**What:** Global flag to override the API base URL for testing against staging/local environments:
```bash
acme --base-url http://localhost:3000 users list
```

#### 13. `--debug` flag for request/response inspection

**Status:** Not started.

**What:** Global flag that prints the full HTTP request and response (method, URL, headers, body) to stderr for debugging. Similar to `curl -v`.

```bash
acme users get-user --id 123 --debug
# > GET https://api.example.com/users/123
# > Authorization: Bearer sk-...
# >
# < 200 OK
# < Content-Type: application/json
# < ...
```

### P2 — Nice to have

#### 14. Lazy pagination with system pager

Currently `--page-all` dumps all pages as NDJSON. A better UX streams results through the system pager (`$PAGER` / `less`) and lazily fetches the next page as the user scrolls. Includes 429 rate limit backoff.

#### 15. Cookie parameters (`in: cookie`)

#### 16. Multiple response content types (XML, binary detection)

#### 17. Schema introspection command (`acme schema <group.method>`)

#### 18. Request body validation improvements (pattern, min/max, format)

#### 19. Retry-After / rate limit handling per API (currently hardcoded 429 retry)

### Explicitly out of scope

The following features from competitive CLIs are intentionally excluded:

- **GJSON `--transform` flag** — powerful but niche; `jq` piping covers this use case and is more widely understood
- **YAML as input format** — JSON is the standard for API request bodies; YAML input adds parsing complexity for marginal benefit
- **Interactive TUI explorer (`--format=explore`)** — interesting but adds significant dependency weight (TUI framework) for a feature most users won't use; JSON output piped to `jq` or `fx` is sufficient
- **Go SDK dependency** — our approach generates standalone Rust binaries with no SDK dependency; this is architecturally simpler and produces smaller, faster binaries

## Future: full generator mode

The current prototype embeds a single spec at compile time. The full vision (outlined below) is a Fern generator that produces a complete, standalone Rust project for any API.

### Generator configuration

```yaml
groups:
  cli:
    generators:
      - name: fernapi/fern-cli
        version: 0.1.0
        config:
          cli-name: acme
          display-name: "Acme CLI"
```

### Generated project structure

```
acme-cli/
├── Cargo.toml
├── dist-workspace.toml          # cargo-dist for cross-platform builds
├── src/
│   ├── main.rs                  # Entry point (parameterized)
│   ├── spec.rs                  # ApiSpec structs + include_str!() loader
│   ├── commands.rs              # clap tree builder (template)
│   ├── executor.rs              # HTTP dispatch (template)
│   ├── formatter.rs             # Output formatting (template)
│   ├── auth.rs                  # Auth strategies (template)
│   ├── completions.rs           # Shell completions (template)
│   ├── validate.rs              # Input validation (template)
│   ├── error.rs                 # Error types (template)
│   ├── client.rs                # HTTP client + retry (template)
│   └── generated/
│       └── api_spec.json        # Embedded spec
├── .github/workflows/release.yml
└── README.md
```

Most files are **static templates** — identical across all generated CLIs. Only `main.rs`, `spec.rs`, and `api_spec.json` vary per customer. Bug fixes to the runtime ship to all customers on regeneration.

### Shell completions

Because the spec is embedded at compile time, static shell completions are possible:

```bash
eval "$(acme completions zsh)"
acme us<TAB>       # → acme users
acme users <TAB>   # → create  delete  get  list  update
```

This was not possible with `gws` (which fetches the spec at runtime).

### Distribution

Generated CLIs are distributed via:
- **GitHub Releases** — pre-built binaries via `cargo-dist`
- **npm** — platform-specific binary packages (same mechanism as `gws`)
- **Homebrew** — tap formula
- **Shell/PowerShell installers** — generated by `cargo-dist`
