# ADR-0008: Credential precedence chain and storage fallback

**Status:** Accepted — 2026-06-11
**Context:** [FER-9856](https://linear.app/buildwithfern/issue/FER-9856) — first-class OAuth + login support. Once `auth login` writes credentials to the keyring, multiple credential sources can coexist for the same scheme. The grilling session resolved the resolution order, the storage backend with its fallback path, and the on-failure UX.

## Decision

### Precedence chain

`AuthCredentialSource::Chain` resolves a scheme's value in this order, first non-empty wins:

| Priority | Source | Typical setter |
|---|---|---|
| 1 | `--<scheme>` CLI flag | per-invocation override (`-p`-style scripts) |
| 2 | `<NAME>_<SCHEME>` env var | deployment / CI secret store |
| 3 | **Keyring entry** | `auth login` populated this |
| 4 | Configured file source | legacy `--token-file` style |

Matches `gh` / `aws` / `gcloud` / `op`. Adding keyring is a new `AuthCredentialSource::Keyring { service, account }` variant slotted at priority 3 in the typed-builder default chains (`BearerAuth`, `ApiKeyAuth`, `OAuth2Auth`).

### Storage

[`keyring-rs`](https://docs.rs/keyring) is the primary backend (macOS Keychain / Windows Credential Manager / Linux secret-service). When the platform's keyring is unavailable — Linux containers, CI runners, bare SSH without secret-service — the framework **falls back silently** to `~/.config/<cli>/auth-keyring.json` (0600). The filename is intentionally distinct from the pre-existing `TokenCache` file (`credentials.json`) so the two cohabit a directory without clobbering each other: binaries already using `OAuth2TokenProvider::with_cache(...)` (e.g. `xero`) continue to read/write their existing `credentials.json` untouched. `auth status` always discloses which backend is in use.

Entry key is `(service=<cli_name>, account=<scheme_name>)`. Value is a JSON token bundle for OAuth (`{access_token, refresh_token, expires_at}`) or a plain string for `--with-token`.

### Shadowing-aware UX

Higher-priority sources mask lower-priority ones. `auth status` lists every visible source and marks shadowing explicitly. `auth login` warns at flow start when an env var would shadow the keyring entry the flow is about to write — so users discover the footgun before they're confused by it. Error messages on 401/403 disclose *which* source supplied the credential, so users know where to look when the shadow is unintended.

### Failure modes during command execution

| State | Behavior |
|---|---|
| No creds in any source | Print `Run \`<bin> auth login\` to authenticate.` to stderr; exit non-zero. **Never auto-trigger login from a non-auth command.** |
| Access token expired, refresh token cached | Silent refresh before request goes out; persist new tokens; proceed. (Existing `OAuth2TokenProvider` path, extended to keyring entries.) |
| Refresh fails / refresh token revoked | Wipe the keyring entry; print `Your session has expired. Run \`<bin> auth login\` again.`; exit non-zero. |
| 401/403 with apparently-valid token | Surface the server error verbatim. **No retry-with-refresh.** |

## Consequences

**Positive.**

1. **CI doesn't break.** Env-var precedence matches existing behavior. A developer logging in locally doesn't override `<NAME>_API_KEY` already set in CI secrets, build environments, or `.env` files.
2. **Headless / containerized environments work.** File fallback covers Linux containers, GitHub Actions runners, bare SSH sessions, and anything else without a running secret-service daemon. Matches `gh`'s posture.
3. **No infinite-loop refresh storms.** A 401 surfaces, doesn't trigger another refresh-then-retry cycle. Transient server errors stay transient.
4. **Agents and scripts don't open browsers unexpectedly.** No auto-trigger of `auth login` means a CI run that's missing creds fails fast with a clear message rather than hanging on a browser-open call.

**Negative.**

1. **The "I logged in, my session should win" instinct will bite users.** Someone with a stale `<NAME>_API_KEY` in their shell will log in, see "logged in successfully", run a command, get the old identity, be confused. Mitigation: shadow warning at login time + `auth status` disclosure. Documentation needs to call this out.
2. **File-fallback storage is not encrypted at rest.** Same posture as `gh`'s `hosts.yml`. Worth noting in security review.
3. **`auth status` is the only way to discover the active backend.** Users can't easily inspect which keyring slot holds their tokens or what's in the file fallback. We don't ship a "where are my creds" command separately — `auth status` is it.

## Alternatives considered

- **(a) Keyring beats env** — match the "logged-in identity wins" mental model. Rejected: silently overrides CI secrets when stale tokens persist on a dev's laptop. The CI footgun is worse than the shadow footgun because it's silent and remote.
- **(b) Hard-error when keyring unavailable** — force users to install `gnome-keyring` or similar. Rejected: kills the headless / container use case. Many of our target users *are* in containers.
- **(c) Retry-on-401 once with refresh** — common pattern in SDKs that don't distinguish "token we believe expired" from "token server claims invalid". Rejected: turns transient 401s into infinite loops; masks real server errors; every comparable CLI (`gh`, `aws`, `gcloud`) declines this.
- **(d) Auto-trigger `auth login` on missing creds when TTY is attached** — magical for humans, harmless for agents. Rejected: even humans get surprised when a CLI they piped into something opens a browser. Explicit invocation only.
- **(e) Opt-in file fallback (`<NAME>_AUTH_STORAGE=file`)** — strict by default, fallback on request. Rejected: most users won't know the env var exists; container users hit hard errors and file bugs.

## Related

- FER-9856
- [ADR-0001](./0001-auth-provider-no-cred-extraction.md) — credentials never leave `AuthCredentialSource` / `AuthProvider::apply`; precedence resolution stays inside `AuthCredentialSource::Chain`
- [ADR-0007](./0007-login-flows-one-shot-per-binary.md) — sibling decision on how flows are declared
- `src/auth/credential.rs` — `AuthCredentialSource` (new `Keyring` variant lands here)
- `src/auth/oauth2.rs` — existing `TokenCache` (repurposed as the file-fallback backend; existing `OAuth2TokenProvider` refresh path extended to keyring-stored tokens)
- `src/auth/error.rs` — `handle_error_response` (extended to disclose credential source on 401/403)
- `CONTEXT.md` § "Auth & login" — domain language for **credential precedence chain**, **shadowing**, **keyring entry**
