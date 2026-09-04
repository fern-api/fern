# ADR-0011: Profile resolution precedence

**Status:** Accepted — 2026-09-04
**Context:** Multi-tenant CLIs need a way to say "run this against that account" without retyping a tenant flag on every command, exporting env vars, or maintaining shell wrappers. Twilio's subaccount model is the forcing function; the feature has to be equally correct for a CLI with no subaccounts, no regions, and a single bearer token.

Supersedes nothing. **Extends [ADR-0008](0008-credential-precedence-and-storage-fallback.md)** — read that first: this document adds a *selector* to its priority-3 rung, not a fifth rung.

## Decision

A profile is a **named bundle of request context**, resolved once per invocation and injected into places that already accept defaults. It adds no new transport. That is the whole design constraint, and it is what keeps the feature generic:

| Profile field | Existing machinery it feeds |
|---|---|
| `credential` | the `account` of `AuthCredentialSource::Keyring { service, account }` |
| `oauth_client_id` | the OAuth grant's client id |
| `parameters` | a `clap::Arg`'s `default_value` |
| `server_variables` | `server_var(...)` substitution |
| `base_url` | `cli_args::resolve_base_url_override` |
| `format` | `formatter::OutputPipeline` |

Anything not in that table is out of scope. Profiles are deliberately **not** a config file for arbitrary settings.

### Which profile

```
--profile / -p  →  <BIN>_PROFILE env  →  active in profiles.toml  →  none
```

`none` is not an error. With no profile selected, a generated CLI behaves exactly as it did before this feature existed — that is the compatibility guarantee, and `tests/profiles.rs::with_no_profile_configured_nothing_changes` pins it.

A profile that is **named but absent** is always an error, listing the known names. It is never a fallthrough to env credentials: `-p prod` silently resolving to the caller's default identity would send the request against a tenant they did not choose, and they would not find out until they read the response.

The one exception: the `profiles` group itself runs unprofiled. Otherwise a stale `active` pointer would make `profiles list` / `use` / `remove` — the only way to repair it — fail with the error the user is trying to clear. Everything else (`--help`, `--schema`, `completion`, `man`) also stays reachable, because the resolution error is raised *after* those intercepts rather than during setup.

### Which value, per field

```
explicit flag  →  env var  →  profile  →  spec default (x-fern-default)
```

**Profile sits below env.** A CI pipeline that exports `<NAME>_API_KEY` or `<NAME>_BASE_URL` must never be silently overridden by a profile a developer stored on the same machine. This is the same reasoning ADR-0008 used to put env above the keyring, applied one layer up, and it is the single decision future contributors are most likely to get wrong.

**Profile sits above spec defaults.** Otherwise a profile could never change a parameter the spec defaults, which is most of the interesting ones.

The clap implementation falls out of this for free: clap resolves `CommandLine` > `EnvVariable` > `DefaultValue`, so installing the profile's value as the arg's `default_value` — in place of the spec default — *is* the documented order, with no new arg plumbing.

### Credentials: a selector, not a rung

For credentials the profile does not extend ADR-0008's chain. It only decides **which keyring account** the existing priority-3 rung reads:

- no profile → account is `<scheme>`, byte-identical to every pre-profiles binary, so existing keychain entries keep resolving and nobody is logged out by an upgrade;
- profile → account is `<scheme>#<credential>`.

`#` is the separator because it cannot appear in an OpenAPI security scheme name, and `profiles create` rejects it in a profile name, so the two halves are always unambiguous.

### The OAuth token cache was a correctness bug

`TokenCache` persisted to `credentials.json` keyed by `token_url` **alone**. Two profiles authenticating against the same client-credentials token endpoint therefore resolved to the same entry and clobbered each other's access and refresh tokens. That is a correctness bug, not an inconvenience, and it is why the cache could not be deferred past the change that shipped profile-aware credentials.

The key is now `token_url` with no profile (unchanged, so existing caches resolve) and `<token_url>#<credential>` with one. `profiles remove` purges that profile's entries and only those — including leaving the unprofiled entry alone, so removing one tenant does not end an unrelated session.

Interactive flows (PKCE, device-code) needed no cache change: they persist through `KeyringStore`, where the `<scheme>#<credential>` account namespacing already covers them.

### Storage

`~/.config/<bin>/profiles.toml` — the same directory as `auth-keyring.json` and `credentials.json`, so a user clearing CLI state has one place to look. Written through the same `oauth_common::atomic_write` (0600, temp-file-then-rename).

**No secrets in the file, ever.** `credential = "<account>"` is a key into the existing `KeyringStore`. `oauth_client_id` is in the file because a client id is public by construction (RFC 6749 §2.2) and `profiles list` should be able to show it without unlocking the keychain; the client *secret* goes to the keychain under the profile-namespaced account.

`toml_edit` rather than serde round-tripping, so an older binary reading a file a newer one wrote does not delete the fields it does not understand — nor the comments the user wrote. `version = 1` is stamped on new files and never downgraded.

Concurrency is last-writer-wins via `atomic_write`'s rename. No lock file: the failure mode for two simultaneous `profiles use` calls is a lost switch, not a corrupt file, and a lock introduces a stale-lock failure mode that is strictly worse for an interactive CLI.

### `parameters` is free-form, and validated at write time

The framework cannot know that `AccountSid` is Twilio's tenant key — Stripe's equivalent is `account`, GitHub's is `owner`. So `parameters` is an open map. But an unvalidated map makes a typo a *silent no-op*: the profile stores `AcountSid`, nothing ever reads it, and the user concludes profiles do not work. So `profiles create --set` validates the key against the parsed operation table (in either spelling — wire name or the flag name `--help` shows) and rejects an unknown one with a near-miss suggestion.

Values are validated the same way, one step later. A profile default becomes a clap `default_value`, so an enum value the spec does not allow makes **every** command carrying that parameter fail with `invalid value 'admin' for '--user-type'` — an error naming a flag the caller never passed, from a profile they set days earlier. The accepted-value list is derived from the same `PossibleValue`s the clap `value_parser` is built from, so the check cannot be stricter or looser than the command itself.

An empty vocabulary (a binding that cannot enumerate its surface — GraphQL today) disables the check rather than rejecting everything.

### Inheritance

`parent` is single-level, resolved at read time so editing the parent propagates. Cycles and over-depth chains are rejected on load, and `profiles create` resolves the profile *before* writing so a bad `--parent` is never persisted.

Inherited: `credential`, `oauth_client_id`, `base_url`, `server_variables`, and `parameters` (per key, child wins). **Not** inherited: `format`. A subaccount profile borrowing its parent's credentials is the point of the feature; borrowing its rendering is not — output shape belongs to the invocation, and inheriting it makes a script's output depend on a profile the script never named.

A profile with no explicit `credential` anywhere in its chain keys its keyring slot by the name of the chain's **root**, not its own. That is what makes `profiles create acme --parent prod` mean "another tenant on the same credential" — the subaccount case — instead of silently giving the child an empty slot that reports "not logged in".

### The `[env]` pseudo-profile

`profiles list` shows a synthetic `[env]` row when environment variables currently supply a credential, because those outrank every profile. A listing that omitted them would answer "which account am I about to hit?" wrongly whenever one is exported. It is a rendering of what `auth status` already detects, not new detection.

### Shipping posture

Off unless `CliApp::profiles(...)` is called, wired from `config.profiles.enabled` in `generators.yml`. Adding a top-level subcommand to every existing generated CLI is a surface change and must not arrive unannounced. Flipping the default is a **separate, later** decision that requires a generator major bump plus a migration under `packages/generator-migrations/src/generators/cli/migrations/` pinning `enabled: false` for anyone who had not opted in — per the repo's breaking-changes policy. No such migration exists yet, because the default has not been flipped.

## Alternatives considered

- **Profile above env.** Matches the "I selected this tenant, it should win" instinct. Rejected for the reason ADR-0008 rejected keyring-above-env: it silently overrides CI secrets from a developer's machine, and the CI footgun is worse than the shadow footgun because it is silent and remote.
- **Threading `Option<&ResolvedProfile>` through the call graph** instead of a process-global. The eight consumers are reached through four different call graphs, several as `&self` methods on already-built structures; threading would touch ~30 signatures to carry one value that is constant for the process's lifetime. The global mirrors `keyring_store::active_store()`, which exists for the same reason.
- **Secrets in `profiles.toml`.** Simpler, and it is what a lot of tooling does. Rejected outright: the keyring already exists, and a plaintext multi-tenant credential file is a strictly worse artifact than the one `auth login` writes today.
- **Flattening `parent` on write.** Cheaper to read, and no cycle detection needed. Rejected: editing the parent would then not propagate, which is the main reason to have `parent` at all.
- **An allowlist for `parameters`.** Would let the framework validate without consulting the spec. Impossible — the framework cannot know which parameter is the tenant key, and hardcoding one would make the feature Twilio-specific.
- **Deeper `parent` chains.** Deferred behind `MAX_PARENT_DEPTH = 1`. Raising a depth cap is cheap; removing one after configurations depend on it is not, and multi-level tenant trees are speculative today.

## Consequences

**Positive.**

1. The parameter that used to be typed on every command stops being typed, which is the win customers actually feel.
2. Two tenants can hold separate credentials for one auth scheme — and separate OAuth tokens against one token endpoint, which was broken before this change regardless of profiles.
3. The stateless form (`-p` per invocation) mutates no global state, so parallel and agent-driven invocations cannot race.
4. CI is unaffected: it keeps using env vars and ignores profiles entirely.

**Negative.**

1. **A profile is invisible state that changes what a command does.** `profiles current` and the `auth status` profile line are the mitigation; `profiles list`'s `[env]` row covers the "profile selected but env wins" case specifically.
2. **`-p` is now a reserved short flag.** Safe today because spec-derived parameter args are `.long()`-only, but a future change that gives parameters short forms has to keep out of `-p`.
3. **A profile can store a value that is valid for one operation and invalid for another.** Write-time validation unions the accepted values across operations, so it catches typos but cannot catch this; the affected command fails at clap-parse time naming a flag the caller did not pass.
4. **One more file in the config directory** for users to know about when clearing CLI state.
