# ADR-0007: Login flows are one-shot per binary

**Status:** Accepted — 2026-06-11
**Context:** [FER-9856](https://linear.app/buildwithfern/issue/FER-9856) — first-class OAuth + login support. The grilling session for this ticket resolved how every Fern-generated CLI presents an `auth login` flow.

## Decision

Each binary declares **exactly one** login flow at generation time. Three flow types are supported:

- **PKCE** — authorization-code + PKCE, browser callback to a fixed loopback port.
- **Device code** — RFC 8628, short-code + polling.
- **Token paste** — `auth login --with-token`, reads from stdin into the keyring.

The chosen flow is declared in the OpenAPI spec via the standard OpenAPI 3.1 `flows.deviceCode` / `flows.authorizationCode` blocks for the URLs and scopes, with a sibling `x-fern-cli-auth` extension carrying the CLI-identity bits the standard vocabulary can't express:

```yaml
components:
  securitySchemes:
    OAuth2:
      type: oauth2
      flows:
        deviceCode:
          tokenUrl: https://api.elevenlabs.io/v1/oauth/token
          deviceAuthorizationUrl: https://api.elevenlabs.io/v1/oauth/device
          scopes: { … }
      x-fern-cli-auth:
        client_id: elevenlabs-cli-public          # baked-in CLI identity
        token_paste_url: https://elevenlabs.io/app/settings/api-keys
        # redirect_port: 4711                     # PKCE only, optional override
```

```rust
// main.rs — explicit, generator-emitted (or hand-written) builder calls.
// The cli-sdk runtime sees only the builder API; it does NOT re-parse
// `x-fern-cli-auth` from the embedded spec.
.auth(DeviceCodeLoginFlow::new("OAuth2")
    .client_id("elevenlabs-cli-public")
    .device_authorization_url("https://api.elevenlabs.io/v1/oauth/device")
    .token_url("https://api.elevenlabs.io/v1/oauth/token")
    .scopes(["read:voices", "read:history"]))
```

### Generation pipeline

The extension is consumed *upstream* by the Fern OpenAPI importer, lowered into `ir.json`, and translated by the upstream Fern CLI SDK generator into explicit builder calls in the emitted `main.rs`:

```
OpenAPI spec (with x-fern-cli-auth)
   ↓  Fern OpenAPI importer        (upstream — lands extension fields in IR)
ir.json  (auth.* fields capture flow type + client_id + token_paste_url + redirect_port)
   ↓  Fern CLI SDK generator       (upstream — translates IR → builder calls)
main.rs  (.auth(DeviceCodeLoginFlow::new(…).client_id(…)…))
   ↓  rustc                        (this repo)
binary   (runtime sees only the typed builder API — no spec re-parsing for auth)
```

**The cli-sdk repo's boundary is the typed builder API**, not the extension. Hand-written binaries (`xero`, `elevenlabs` today, demo binaries) call the builders directly; generator-emitted binaries call the same builders, emitted from IR. The cli-sdk's `src/openapi/parser.rs` never learns about `x-fern-cli-auth` — that knowledge lives in the Fern importer and Fern IR upstream.

The `auth login` subcommand runs that single flow non-interactively. There is **no flow-picker prompt** (`gh`'s menu is rejected). `--with-token` is a flag escape, not a menu item. `--no-browser` is a per-flow toggle for SSH / headless environments.

The `auth` subcommand (`login` / `logout` / `status`) is **always grafted** on every Fern CLI, regardless of whether the spec declares OAuth. API-key-only binaries (e.g. ElevenLabs today) get `auth login --with-token` → keyring → "no more `export NAME_API_KEY=...`" for free.

**Client_id is baked into the binary** for public-client flows (PKCE, device-code) via `x-fern-cli-auth.client_id`. Every user of the same binary sends the same client_id — it's the *CLI's* identity, not the *user's*. Per-user env vars remain only for service-to-service `clientCredentials` flows (where the existing `auth_provider` / `OAuth2TokenProvider` path applies).

## Consequences

**Positive.**

1. **Agent-friendly by default.** No interactive flow picker can hang a non-TTY caller. The framework refuses interactive flows when stdin isn't a TTY.
2. **Spec-driven.** Customers add or change their CLI's OAuth via `overlay.yaml`; no Rust code change required. Same posture as the existing `x-fern-global-headers` / `x-fern-sdk-method-name` extensions.
3. **Uniform UX across the generator's output.** Every Fern CLI ships `auth login` / `logout` / `status`. Users learn one pattern across `elevenlabs`, `xero`, `box`, etc.
4. **Universal token-paste win.** API-key-only binaries get keyring-backed credential storage without any spec change. ElevenLabs benefits immediately even though no OAuth flow is declared.
5. **Mirrors `aws sso` / `gcloud` / `op` convention.** Each does one flow per subcommand, no menu.

**Negative.**

1. **`gh` users expect a menu.** Documentation must explicitly state the design choice, otherwise newcomers assume the picker just isn't built yet.
2. **One flow per binary means no automatic fallback** between PKCE and device-code. `--no-browser` is the closest analog; pure SSH-with-no-port-forward users have to use `--with-token`.
3. **Always-graft creates collision risk.** A future spec that uses `auth` as a top-level resource group would collide. The existing `graft_subcommand` "custom wins on leaf collision" rule handles it, but the collision-naming case is a future problem (acknowledged in Q4d of the grilling).

## Alternatives considered

- **(a) `gh`-style prompted menu** — supports both browser-and-paste under the same `auth login`. Rejected: hangs in non-TTY contexts; mismatches Fern's declarative generator model.
- **(b) Conditional grafting** — only graft `auth` when the spec declares OAuth. Rejected: token-paste keyring storage is too valuable a UX win for API-key-only binaries to forgo.
- **(c) Per-user client_id env var** — same as `clientCredentials` flows today. Rejected: client_id is the CLI's identity, not the user's. No comparable tool does this.
- **(d) `gcloud`-style OOB code paste fallback** — PKCE prints a URL, user pastes the code back. Rejected: deprecated by OAuth 2.1, and `--with-token` covers the same use case more cleanly.

## Related

- FER-9856
- [ADR-0001](./0001-auth-provider-no-cred-extraction.md) — `AuthProvider` boundaries; login flows resolve credentials *into* an `AuthCredentialSource::Keyring`, not directly into `AuthProvider`
- [ADR-0008](./0008-credential-precedence-and-storage-fallback.md) — sibling decision on precedence + storage
- `src/auth/oauth2.rs` — existing client-credentials path (the new flows extend the `OAuth2Grant` enum)
- `src/auth/root_builder.rs` — typed builders (`OAuth2Auth`, etc.) — declaration entry point in `main.rs`; new `DeviceCodeLoginFlow` / `PkceLoginFlow` / `TokenPasteLoginFlow` builders land here
- `src/custom_commands.rs` — the grafting infrastructure for the `auth` subcommand
- `CONTEXT.md` § "Auth & login" — domain language for **login flow**, **baked-in client_id**, **`x-fern-cli-auth`**
- Upstream Fern IR work — see `~/reports/oauth-login-ir-spec.md` for the IR schema additions, importer changes, and generator translation rules that need to land before generator-emitted binaries can consume the new flows
