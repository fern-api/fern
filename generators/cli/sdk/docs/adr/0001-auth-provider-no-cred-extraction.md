# ADR-0001: `AuthProvider` never exposes resolved credentials

**Status:** Accepted — 2026-05-13
**Context:** FER-10523 (WebSocket bidirectional client) introduces the first non-reqwest transport. The grilling session for that ticket forced the policy choice.

## Decision

The [`AuthProvider`](../../src/auth/provider.rs) trait and the type-erased [`DynAuthProvider`](../../src/auth/provider.rs) handle exposed via [`AppContext`](../../src/openapi/app.rs) **never** return resolved credential values. The trait's only credential-shaped surface is:

```rust
fn apply(
    &self,
    request: reqwest::RequestBuilder,
    endpoint: &EndpointAuthMetadata,
) -> Result<reqwest::RequestBuilder, CliError>;
```

Credentials are applied to a request boundary and never handed back to caller code.

Consumers that need a credential value at a *different* layer than `reqwest::RequestBuilder` — WebSocket handshake headers, query-string parameters, first-frame JSON fields, future SSE / gRPC / raw-socket transports — take an [`AuthCredentialSource`](../../src/auth/credential.rs) **directly** in their config, not through the `AuthProvider` trait.

```rust
// CORRECT — WS transport takes the source directly.
WsAuth::Header(
    "xi-api-key".into(),
    AuthCredentialSource::from_env("ELEVENLABS_API_KEY"),
)

// REJECTED — would require a `credential_value(scheme) -> Option<String>`
// method on `AuthProvider`. Not added.
WsAuth::Header(
    "xi-api-key".into(),
    ctx.auth_provider().credential_value("ApiKeyAuth")?,
)
```

The `AppContext::auth_provider()` getter is **not** added. Custom-command handlers that need a credential value construct an `AuthCredentialSource` in their own glue code (the same pattern they already use for `auth_scheme_env(...)`).

## Consequences

**Positive.**

1. **Confined blast radius.** Resolved credentials only ever live inside `apply()`, which writes them to a `HeaderValue` and drops the `String` immediately. They never enter caller code where they could leak via `Debug`, `Display`, panic messages, accidental logging, or being captured in a closure that ends up in a tracing span.
2. **Layer integrity.** `AuthProvider` is shaped around the HTTP request lifecycle. Forcing it to also expose raw values muddies that contract — the trait would have to grow `expose_secret` semantics that fight with the [`secrecy::SecretString`](https://docs.rs/secrecy) machinery already protecting `AuthCredentialSource`.
3. **No public API debt.** Adding `credential_value` would be a breaking trait change to remove later. The lighter-weight `AuthCredentialSource`-in-config pattern is reversible per transport.

**Negative.**

1. **Customer redundancy.** A customer using both HTTP and WebSocket auth in the same CLI writes the credential source twice — once via `CliApp::auth_scheme_env("ApiKeyAuth", "MY_API_KEY")` and once as `AuthCredentialSource::from_env("MY_API_KEY")` for the WS config. Acceptable: the duplication is local, copy-pasteable, and matches the existing 80% pattern in [AGENTS.md](../../AGENTS.md).
2. **Trait can't unify schemes that *do* have a representable common shape.** A future "any bearer" abstraction would have to live above the trait, not inside it.

## Alternatives considered

- **(a)** Add `fn credential_value(&self, scheme: &str) -> Option<String>` to `AuthProvider`, default-implemented as `None`, overridden by leaf providers. Rejected: exposes secrets across the trait surface, requires every `impl AuthProvider` (including future ones) to make a deliberate choice about exposure.
- **(c)** Have the WS client construct a *fake* `reqwest::RequestBuilder`, call `apply()`, then introspect the resulting headers/URL. Rejected: cursed; works only for headers, fails for first-message JSON.
- **(d)** Expose `AuthCredentialSource` on `CliApp` (builder-side) rather than `AppContext` (runtime-side). Rejected: half-step toward exposing creds anyway, doesn't reach the runtime where transports live.

## Related

- FER-10523 (WebSocket bidirectional client)
- [ADR-0002](./0002-transport-neutral-http-config-resolve.md) — the sibling decision for TLS config
- `src/auth/credential.rs` — `AuthCredentialSource::resolve() -> Option<SecretString>`
- `src/auth/provider.rs` — `AuthProvider` trait
