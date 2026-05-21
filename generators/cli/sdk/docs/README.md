# Fern CLI SDK

**Generate a CLI for any API from an OpenAPI spec or GraphQL introspection JSON.**

The Fern CLI SDK reads a schema and dynamically builds a command-line interface — no codegen step. The schema is embedded at compile time and the CLI surface is built at startup. OpenAPI specs use `x-fern-sdk-group-name` / `x-fern-sdk-method-name` (plus a growing set of other `x-fern-*` extensions) to shape the command tree; GraphQL CLIs are derived from introspection JSON directly.

> [!IMPORTANT]
> This project is under active development. The repository ships several reference CLIs (`box`, `linear`, `square`, `bigcommerce`, `close`, `devin`, `assemblyai`, `paid`, `xero`) so you can see both protocol flavors end-to-end.

<p>
  <a href="https://github.com/fern-api/cli-sdk/blob/main/LICENSE"><img src="https://img.shields.io/github/license/fern-api/cli-sdk" alt="license"></a>
  <a href="https://github.com/fern-api/cli-sdk/actions"><img src="https://img.shields.io/github/actions/workflow/status/fern-api/cli-sdk/ci.yml?branch=main&label=CI" alt="CI status"></a>
</p>

## How it works

1. You provide an OpenAPI spec with Fern extensions
2. The spec is embedded into a Rust binary at compile time
3. At startup, the CLI parses the spec and builds a `clap` command tree
4. Each `x-fern-sdk-group-name` becomes a subcommand group (supports nesting)
5. Each `x-fern-sdk-method-name` becomes a leaf command

```yaml
# In your OpenAPI spec:
paths:
  /users/{uuid}:
    get:
      operationId: get-user
      x-fern-sdk-group-name:
        - users
      x-fern-sdk-method-name: get-user
```

```bash
# Produces:
box users getCurrent --dry-run
```

## Quick start

Install [Rust](https://rustup.rs/), then:

```bash
git clone https://github.com/fern-api/cli-sdk.git
cd cli-sdk
cargo install --path .   # installs all bundled binaries

# Try one
box --help
box users getCurrent --dry-run
```

## Bundled CLIs

| Binary         | Protocol | Auth env var                                  |
| -------------- | -------- | --------------------------------------------- |
| `box`          | OpenAPI  | `BOX_API_KEY`                                 |
| `linear`       | GraphQL  | `LINEAR_API_KEY`                              |
| `square`       | GraphQL  | `SQUARE_API_KEY`                              |
| `bigcommerce`  | OpenAPI  | `BIGCOMMERCE_API_KEY` (+ `BIGCOMMERCE_STORE_HASH`) |
| `close`        | OpenAPI  | `CLOSE_API_KEY`                               |
| `devin`        | OpenAPI  | `DEVIN_API_KEY`                               |
| `assemblyai`   | OpenAPI  | `ASSEMBLYAI_API_KEY`                          |
| `paid`         | OpenAPI  | `PAID_API_KEY`                                |
| `xero`         | OpenAPI  | `XERO_ACCESS_TOKEN`                           |

Some bundled CLIs ship their own README under `cli/<name>/README.md` with demo scripts and walk-throughs. The repository also includes test-only fixture binaries (`openapi-fixture`, `graphql-fixture`, `multi-fixture`, ...) used by the wire-test suite.

## Usage

```bash
<binary> <resource> <method> [flags]
```

### Examples

```bash
# Preview a request without sending it
box users getCurrent --dry-run

# Get a Linear issue (GraphQL)
linear issue list --team-key-eq FER --number-eq 9865 --format json

# Auto-paginate through all results
box folders listItems --folder-id 0 --page-all

# Format as a table
box users list --format table

# Override the API base URL (useful for mock servers)
box users list --base-url http://localhost:8080
```

### Flags

| Flag                | Description                                       | Default |
| ------------------- | ------------------------------------------------- | ------- |
| `--dry-run`         | Validate locally without sending the request      |         |
| `--format <FMT>`    | Output format: `json`, `table`, `yaml`, `csv`     | `json`  |
| `--base-url <URL>`  | Override the API base URL (useful for mock servers) |       |
| `--params <JSON>`   | URL/query/path parameters as JSON                 |         |
| `--json <JSON>`     | Request body for POST/PATCH/PUT                   |         |
| `-o, --output <PATH>` | Write binary responses to a file                |         |
| `--page-all`        | Auto-paginate, one JSON object per page (NDJSON)  | off     |
| `--page-limit <N>`  | Max pages to fetch under `--page-all`             | 10      |
| `--page-delay <MS>` | Delay between page fetches                        | 100 ms  |
| `--no-retry`        | Disable `x-fern-retries`-driven retries on this call |      |
| `--no-extract`      | Print the full response body instead of an `x-fern-sdk-return-value` slice | |

Flags vary slightly per operation — run `<binary> <resource> <method> --help` to see the full set, including the generated `--<field>-eq` / `-neq` / `-in` / `-gt` / `-lt` / `-null` filter flags on list operations. Several `x-fern-*` extensions also add operation-level flags (e.g. `--no-stream` from `x-fern-streaming`, `--server <NAME>` from `x-fern-server-name`).

## Authentication

Each binary declares its auth schemes via the `auth_scheme_*` builder methods on `CliApp`. A scheme can pull its credential from an env var, a CLI flag, a file, a literal, or a fallback chain across all of those. The dynamically-rendered `Authentication:` section in `--help` lists every scheme and where its value will be read from.

```bash
export BOX_API_KEY=your_personal_access_token
box users getCurrent
```

Without a credential, you can still explore the CLI structure and use `--dry-run`.

## OpenAPI extensions

The CLI uses two Fern extensions to determine command structure:

### `x-fern-sdk-group-name`

A list of strings that determines the subcommand group hierarchy. Each element is converted from camelCase to kebab-case.

```yaml
x-fern-sdk-group-name:
  - scheduledEvents          # → "scheduled-events" subcommand
```

Nested groups create nested subcommands:

```yaml
x-fern-sdk-group-name:
  - scheduledEvents
  - invitees                 # → "scheduled-events invitees <method>"
```

### `x-fern-sdk-method-name`

The leaf command name (used as-is):

```yaml
x-fern-sdk-method-name: list-event-invitees
```

## Exit codes

| Code | Meaning          | Example cause                              |
| ---- | ---------------- | ------------------------------------------ |
| `0`  | Success          | Command completed normally                 |
| `1`  | API error        | Server returned a 4xx/5xx response         |
| `2`  | Auth error       | Credentials missing or invalid             |
| `3`  | Validation error | Bad arguments, unknown command, invalid JSON|
| `4`  | Discovery error  | Could not load API schema                  |
| `5`  | Internal error   | Unexpected failure                         |

## Shell completion

Every CLI built with the SDK ships a `completion` subcommand that emits shell-native completion scripts. Pipe the output into your shell's completion directory and restart (or source) your session:

```bash
# bash
<CLI> completion bash > /etc/bash_completion.d/<CLI>

# zsh
<CLI> completion zsh > "${fpath[1]}/_<CLI>"

# fish
<CLI> completion fish > ~/.config/fish/completions/<CLI>.fish
```

Supported shells: `bash`, `zsh`, `fish`, `powershell`, `elvish`.

## Manual pages

Every CLI also ships a `man` subcommand that generates a roff-formatted man page covering the full command surface (subcommands, flags, descriptions). Install it once and use `man <CLI>` for offline reference:

```bash
# macOS / Linux (user-local)
<CLI> man > ~/.local/share/man/man1/<CLI>.1

# System-wide (Linux)
<CLI> man | sudo tee /usr/local/share/man/man1/<CLI>.1

# View directly without installing
<CLI> man | groff -Tutf8 -man | less
```

## Library usage

The SDK is structured as a library (`fern_cli_sdk`) with thin binary consumers under `cli/`. You can use it to build your own CLI for any OpenAPI spec or GraphQL schema.

### Minimal CLI (~7 lines)

```rust
use fern_cli_sdk::openapi::CliApp;

fn main() {
    CliApp::new("my-api")
        .spec(include_str!("openapi.yaml"))
        .auth_scheme_env("bearerAuth", "MY_API_TOKEN")
        .run()
}
```

### With custom commands

```rust
use fern_cli_sdk::openapi::{AppContext, CliApp};
use fern_cli_sdk::formatter::OutputFormat;
use fern_cli_sdk::error::CliError;

fn main() {
    CliApp::new("my-api")
        .spec(include_str!("openapi.yaml"))
        .auth_scheme_env("bearerAuth", "MY_API_TOKEN")
        .command(whoami_cmd(), whoami_handler)
        .run()
}

fn whoami_cmd() -> clap::Command {
    clap::Command::new("whoami").about("Show the current user")
}

fn whoami_handler(_args: &clap::ArgMatches, ctx: &AppContext) -> Result<(), CliError> {
    let method = ctx
        .spec()
        .resources
        .get("users")
        .and_then(|r| r.methods.get("getCurrent"))
        .ok_or_else(|| CliError::Validation("users.getCurrent not in spec".into()))?;
    ctx.execute(method, None, None, &OutputFormat::Json)
}
```

Use `.command_under(&["webhooks"], cmd, handler)` to mount the custom command inside an existing resource group — see `cli/box/main.rs` for a worked example that adds `box webhooks verify`.

### WebSocket commands (ElevenLabs convai canonical example)

For APIs that expose long-lived bidirectional connections (AI/voice realtime, log
streams, agent-runtime control planes), `fern_cli_sdk::websocket` plugs into the
same custom-command surface as HTTP:

```rust
use clap::{Arg, ArgMatches, Command};
use fern_cli_sdk::auth::AuthCredentialSource;
use fern_cli_sdk::error::CliError;
use fern_cli_sdk::formatter::OutputPipeline;
use fern_cli_sdk::openapi::{AppContext, CliApp};
use fern_cli_sdk::websocket::{WebSocketClient, WsConfig};

fn main() {
    CliApp::new("elevenlabs")
        .spec(include_str!("openapi.yaml"))
        .auth_scheme_env("ApiKeyAuth", "ELEVENLABS_API_KEY")
        .command_under(&["convai"], conversation_cmd(), handle_conversation)
        .run()
}

fn conversation_cmd() -> Command {
    Command::new("conversation")
        .about("Stream an ElevenLabs convai/conversation session")
        .arg(Arg::new("agent-id").long("agent-id").required(true))
}

fn handle_conversation(matches: &ArgMatches, ctx: &AppContext) -> Result<(), CliError> {
    let agent_id = matches.get_one::<String>("agent-id").unwrap();
    // Percent-encode CLI-supplied values before embedding them in a URL —
    // an adversarial `--agent-id "foo&evil=bar"` would otherwise inject
    // extra query params. See AGENTS.md "Input Validation & URL Safety".
    let agent_id_enc = percent_encoding::utf8_percent_encode(
        agent_id,
        percent_encoding::NON_ALPHANUMERIC,
    );
    let url = format!(
        "wss://api.elevenlabs.io/v1/convai/conversation?agent_id={agent_id_enc}"
    );
    // The `elevenlabs_convai` preset bakes in: xi-api-key header auth,
    // the canonical ping/pong autoresponder, `strip_audio_keys =
    // ["audio_base_64"]`, and the right abnormal-close hint. Customer
    // glue is two `cfg.<field> = …` lines for the bits the preset
    // can't infer (pipeline, stdin_input).
    let mut cfg = WsConfig::elevenlabs_convai(
        url,
        AuthCredentialSource::from_env("ELEVENLABS_API_KEY"),
    );
    cfg.output_pipeline = OutputPipeline::from_matches(matches).unwrap_or_default();
    cfg.stdin_input = true;

    // Bridge sync handler → async WS loop via the same pattern AppContext::execute
    // uses internally: block_in_place + Handle::current().block_on(...).
    // Note: this requires a multi-threaded tokio runtime — `CliApp::run`
    // provides one by default. If you wrap the binary in
    // `#[tokio::main(flavor = "current_thread")]` the block_in_place
    // call will panic at runtime.
    let http_config = ctx.http_config().clone();
    tokio::task::block_in_place(|| {
        tokio::runtime::Handle::current().block_on(async move {
            let client = WebSocketClient::connect(cfg, &http_config).await?;
            client.run_recv_loop().await
        })
    })
}
```

What you get:

- **Auth**: `WsAuth::Header` / `WsAuth::QueryParam` / `WsAuth::FirstMessage` /
  `WsAuth::None` — each takes an `AuthCredentialSource` directly. See
  [ADR-0001](docs/adr/0001-auth-provider-no-cred-extraction.md).
- **Output**: each inbound JSON frame flows through `OutputPipeline::emit`
  as one NDJSON line. Compose with `--format` today; future jq / fields /
  template / no-color flags compose automatically.
- **Application-level Ping/Pong**: `AutoResponder` is a `Fn(&Value) -> Option<Value>`.
  Returning `Some(reply)` sends the reply and elides the inbound frame from
  stdout. `elevenlabs_convai_ping_pong()` is the canonical preset; write your
  own closure for Deepgram / AssemblyAI / OpenAI.
- **stdin forwarding**: pipe NDJSON in (`cat script.ndjson | my-cli convai
  conversation --agent-id X`). EOF triggers a clean `Close(1000)` and exits 0.
  Invalid JSON lines warn to stderr and are dropped without dropping the
  connection.
- **Graceful Ctrl+C**: sends `Close(1000)`, flushes output, exits 0.
- **Audio elision**: `strip_audio_keys` recursively removes named fields
  before emit so base64 audio doesn't flood your terminal. ElevenLabs:
  `vec!["audio_base_64".into()]`.

#### Other API patterns

The `WsConfig::<api>` presets bake in the right auth shape, audio
strip, and abnormal-close hint for each supported API:

```rust
// OpenAI Realtime — two-header auth (Authorization + OpenAI-Beta).
// Treats Close(1001) Going Away as a clean exit because the API uses
// 1001 for its 30-minute session cap.
let cfg = WsConfig::openai_realtime(
    url,
    AuthCredentialSource::from_env("OPENAI_API_KEY"),
);

// Deepgram realtime — `Authorization: Token <key>` (the `Token `
// prefix is baked into the preset, not a footgun the customer has
// to remember).
let cfg = WsConfig::deepgram_listen(
    url,
    AuthCredentialSource::from_env("DEEPGRAM_API_KEY"),
);

// AssemblyAI v3 Universal-Streaming — raw `Authorization: <key>`
// (no `Bearer ` / `Token ` prefix — different from Deepgram + OpenAI).
let cfg = WsConfig::assemblyai_v3(
    url,
    AuthCredentialSource::from_env("ASSEMBLYAI_API_KEY"),
);

// ElevenLabs TTS stream-input — `xi_api_key` merged into the BOS
// first message rather than sent as a header.
let cfg = WsConfig::elevenlabs_tts(
    url,
    AuthCredentialSource::from_env("ELEVENLABS_API_KEY"),
);
```

For APIs not covered by a preset, build a `WsConfig` directly. The
auth helpers — `WsAuth::bearer(source)`, `WsAuth::token(source)` —
prepend their respective scheme prefixes so customers don't have to
remember which APIs use `Bearer ` vs `Token ` vs raw.

**Deepgram / AssemblyAI — binary audio outbound.** Both APIs require
raw PCM bytes in WS Binary frames rather than JSON text. Send via
`client.send_binary(bytes)` from your audio-capture loop (typically a
`cpal` mic reader). The stdin forwarder stays JSON-text-only in v1;
customers who want stdin→binary should disable `stdin_input` and
drive `send_binary` from their own task. When `WsAuth::FirstMessage`
auth is configured, the first call must be `send(...)` with the
auth-bearing JSON frame — `send_binary` errors loudly otherwise so
the credential can never silently drop.

### Building blocks

For full control, all internals are accessible:

```rust
use fern_cli_sdk::openapi::commands::build_cli;
use fern_cli_sdk::openapi::executor::{execute_method, PaginationConfig};
use fern_cli_sdk::openapi::discovery::RestDescription;
use fern_cli_sdk::openapi::parser::load_openapi_spec;
use fern_cli_sdk::auth::{
    AuthCredentialSource, AuthStrategy, BearerAuthProvider, SchemeBinding,
    build_provider_from_doc,
};
```

## Architecture

The crate is both a library and several reference binaries. The library is the product; the binaries under `cli/` are consumers. `src/` is partitioned by protocol — each protocol's code is self-contained, so a downstream generator can copy only the protocol it needs.

```
src/lib.rs            → public module re-exports
src/auth/             → auth providers, credential sources, composition
src/cli_args.rs       → shared arg helpers (version, base-url, JSON help)
src/custom_commands.rs→ shared custom-command registry
src/error.rs          → structured CliError
src/formatter.rs      → output formatting (JSON, table, YAML, CSV)
src/http.rs           → reqwest client builder, TLS/proxy/CA-bundle wiring
src/logging.rs        → org-scoped tracing setup
src/validate.rs       → path-traversal & resource-name validators

src/openapi/          → OpenAPI implementation
  app.rs, parser.rs, discovery.rs, commands.rs, executor.rs, help.rs, overlay.rs

src/graphql/          → GraphQL implementation (mirrors openapi/)
  app.rs, parser.rs, discovery.rs, commands.rs, executor.rs, help.rs

cli/<binary>/         → thin binary + embedded schema (one per CLI)
```

Neither protocol module imports from the other. Removing one directory (and its `pub mod` in `lib.rs`) leaves a working single-protocol crate — no feature flags needed.

All output — success, errors, download metadata — is structured JSON.

See [AGENTS.md](AGENTS.md) for the full source-layout reference and contributor guidance (test layers, changeset policy, input-validation rules).

## Development

```bash
cargo build                       # dev build (all binaries)
cargo clippy -- -D warnings       # lint
cargo test                        # unit + integration + wire tests
```

## Advanced

### TLS, proxies, and CA bundles

Every binary built on the SDK honors environment variables for adapting TLS and proxy behavior at runtime — useful behind a corporate proxy, when debugging traffic with Proxyman / Charles / mitmproxy, or when pinning custom trust roots in CI. No rebuild required.

Variables are scoped by binary name. `<NAME>` below is the CLI's binary name uppercased with `-` mapped to `_` (e.g. `BIGCOMMERCE`).

| Variable                       | Effect                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `<NAME>_CA_BUNDLE`             | Path to a PEM file appended to the default trust roots. Concatenated PEMs are all loaded. |
| `<NAME>_INSECURE` = `1`        | Disable TLS verification. Logs a one-time stderr warning. **Never use in production.** |
| `<NAME>_PROXY`                 | HTTP/HTTPS proxy URL. Overrides `HTTPS_PROXY` / `HTTP_PROXY` for this CLI.              |
| `<NAME>_NO_PROXY`              | Comma-separated bypass list. Scoped to this CLI; doesn't leak to other processes.      |
| `<NAME>_TIMEOUT_SECS`          | Total request timeout. None by default.                                                |
| `<NAME>_CONNECT_TIMEOUT_SECS`  | Connection-establishment timeout.                                                      |

Standard env vars (`HTTPS_PROXY` / `HTTP_PROXY` / `NO_PROXY` / `SSL_CERT_FILE`) are honored when the scoped overrides are absent.

#### Common scenarios

**Behind a MITM proxy (Proxyman, Charles, mitmproxy):**

```bash
export SSL_CERT_FILE=~/path/to/proxyman-ca.pem
export HTTPS_PROXY=http://127.0.0.1:9090
bigcommerce customers list
```

**Corporate network with a custom root CA:**

```bash
export BIGCOMMERCE_CA_BUNDLE=/etc/ssl/corp-roots.pem
bigcommerce customers list
```

**Last-resort debugging only:**

```bash
BIGCOMMERCE_INSECURE=1 bigcommerce customers list
# warning: TLS verification disabled via BIGCOMMERCE_INSECURE — ...
```

#### Compile-time trust roots

Distributing a CLI internally where every machine should trust your org's CA out of the box? Bake the cert in at build time so users don't need to set `<NAME>_CA_BUNDLE`:

```rust
CliApp::new("internal-tool")
    .spec(include_str!("openapi.yaml"))
    .extra_root_cert(include_bytes!("../certs/corp-ca.pem"))
    .run()
```

#### TLS backend

The SDK uses the OS's native TLS stack by default (Secure Transport on macOS, SChannel on Windows, OpenSSL on Linux), so the system keychain / cert store is honored automatically.

For distribution to varied Linux servers or scratch Docker images where OpenSSL isn't available, build with the rustls feature instead:

```bash
cargo build --release --no-default-features --features rustls
```

rustls produces a self-contained binary with Mozilla's root CAs bundled. It does not read the OS keychain, so users behind proxies need to set `<NAME>_CA_BUNDLE` or `SSL_CERT_FILE` explicitly.

#### Aliases

For compatibility with established conventions:

- `<NAME>_EXTRA_CA_CERTS` — alias for `<NAME>_CA_BUNDLE` (matches Node's `NODE_EXTRA_CA_CERTS`).
- `<NAME>_INSECURE_SKIP_VERIFY` — alias for `<NAME>_INSECURE` (matches Go / kubectl).

## License

Apache-2.0
