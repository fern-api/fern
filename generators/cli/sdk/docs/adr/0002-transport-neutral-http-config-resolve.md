# ADR-0002: Transport-neutral `HttpConfig::resolve()` pattern

**Status:** Accepted — 2026-05-13
**Context:** FER-10523 (WebSocket bidirectional client) is the first non-reqwest transport in the SDK. Future tickets contemplate SSE, gRPC streaming, and raw sockets. All need to honor the same `<NAME>_*` env vars users already configure for the HTTP path (`<NAME>_CA_BUNDLE`, `<NAME>_INSECURE`, `<NAME>_PROXY`, timeouts).

## Decision

`HttpConfig` grows a **transport-neutral view**: a new `pub fn resolve(&self) -> Result<ResolvedTlsConfig, CliError>` that reads env vars and concatenates compile-time roots into a struct of plain Rust types — no `reqwest`, no `tungstenite`, no transport-specific imports.

```rust
pub struct ResolvedTlsConfig {
    pub extra_root_certs_pem: Vec<Vec<u8>>,    // raw PEM, owned
    pub insecure_skip_verify: bool,
    pub proxy: Option<ResolvedProxy>,
    pub connect_timeout: Option<Duration>,
    pub request_timeout: Option<Duration>,
}
```

Each transport translates `ResolvedTlsConfig` into its own connector type **inside its own module**:

- `src/http.rs::HttpConfig::build_client` → `reqwest::ClientBuilder` (existing path; reads env vars directly today, can flow through `resolve()` later)
- `src/websocket/client.rs::WebSocketClient::connect` → `tokio_tungstenite::Connector` (v1: calls `resolve()` to validate config + honor `<NAME>_CONNECT_TIMEOUT_SECS`; CA / insecure / proxy translation deferred to follow-up, but the seam is in place)
- future SSE/gRPC/raw-socket modules plug in the same way

`src/http.rs` stays **reqwest-only**. No transport-specific types leak across module boundaries.

To support this, `HttpConfig` now stores raw PEM bytes alongside parsed `reqwest::Certificate`s — both are needed (parsed for fast `build_client`, raw for non-reqwest connectors that parse via their own PEM reader).

## Consequences

**Positive.**

1. **Single source of truth for env vars.** When users configure `BOX_CA_BUNDLE=/path/to/ca.pem`, every transport — HTTP, WS, future SSE — sees the same trust roots. No transport-specific env var sprawl.
2. **Dep boundaries stay clean.** `src/http.rs` imports `reqwest`. `src/websocket/` imports `tokio_tungstenite`. Neither imports the other's TLS types.
3. **Validation centralized.** Bad PEM, missing CA-bundle path, unparseable bytes → caught in `resolve()`, surfaced as `CliError` before any transport's connect path runs. Test surface is one function, not one-per-transport.
4. **Future transports are cheap.** SSE / gRPC / raw-socket modules read `resolve()` and translate to their own connector. No need to re-read env vars or re-implement the "compile-time roots ++ env CA bundle" concatenation.

**Negative.**

1. **`HttpConfig` storage grew.** A `Vec<Vec<u8>>` for raw PEM is held alongside the existing `Vec<reqwest::Certificate>`. Memory cost is the PEM body times trust-root count — typically a few KB per process.
2. **Two writers, one truth.** The existing `build_client` continues to read env vars directly (rather than flow through `resolve()`) to minimize blast radius on the 870-test reqwest path. A "keep in sync" comment plus an `EnvGuard`-driven test cover the drift risk. A future refactor can collapse them once a second reqwest path emerges that wants `resolve()` semantics.
3. **v1 doesn't fully wire `<NAME>_CA_BUNDLE` / `<NAME>_INSECURE` / `<NAME>_PROXY` into the WS path.** They're *resolved* (so misconfiguration errors surface) but not yet translated to `tokio_tungstenite::Connector`. Translation requires picking up `native_tls::TlsConnector` / `rustls::ClientConfig` (both re-exported by tokio-tungstenite under their feature gates) — deferred to a follow-up scoped to the connector translation.

## Alternatives considered

- **(a) Duplicate env-var reading in each transport module.** Two-way drift risk; misconfigurations surface differently depending on which transport hit them first. Rejected.
- **(b) Put `tokio_tungstenite::Connector` construction in `src/http.rs` behind a feature gate.** Bleeds the WS dep into the HTTP layer. Rejected.
- **(c) Skip env-var honoring on the WS path entirely.** Most likely to surprise corporate users with self-signed mocks or proxy-mandated egress. Rejected.

## Related

- FER-10523 (WebSocket bidirectional client)
- [ADR-0001](./0001-auth-provider-no-cred-extraction.md) — the sibling decision for auth credentials
- `src/http.rs` — `HttpConfig::resolve`, `ResolvedTlsConfig`, `ResolvedProxy`
- `src/websocket/client.rs::WebSocketClient::connect` — first consumer
