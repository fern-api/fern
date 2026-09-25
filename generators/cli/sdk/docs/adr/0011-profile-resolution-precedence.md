# ADR-0011: Profile resolution precedence

**Status:** Accepted — 2026-09-04. Amended 2026-09-25: a selected profile now outranks env however it was selected (see *Which value, per field*).
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
| `retries` | `RetriesConfig::max_attempts`, over `x-fern-retries` |
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
explicit flag  →  selected profile  →  env var  →  spec default (x-fern-default)
```

**A selected profile sits above env, however it was selected.** A profile is the bundle of settings the user stored *for that tenant*; once it is in play — by `-p`, by `<NAME>_PROFILE`, or as the active profile from `profiles use` — every value it carries applies, and the shell-exported global fills in only what the profile leaves unset. The user-facing rule is one sentence: *if the profile sets it, the profile's value is used; otherwise the global one is.* The three selection mechanisms behave identically, so switching from `-p prod` to `profiles use prod` never changes what a command does.

**No profile means no change.** With nothing selected the env var is the only override rung, exactly as before profiles existed. A CI job that wants env to be authoritative simply does not select a profile — and a `profiles.toml` a developer left on a shared machine only matters if that job also opts in with `<NAME>_PROFILE` or an `active` pointer in the CLI's config directory.

**Profile sits above spec defaults.** Otherwise a profile could never change a parameter the spec defaults, which is most of the interesting ones.

`SelectionSource` still records how the profile was chosen — `profiles current` reports it as `selected_by` — but it no longer affects precedence. `profiles::outranks_env()` is the single predicate every resolution point consults, and it is true whenever a profile is in play.

The clap implementation: clap resolves `CommandLine` > `EnvVariable` > `DefaultValue`, so the profile's value is installed as the arg's `default_value` in place of the spec default, and the arg's env var is *not* registered when the profile carries a value — so the flag still wins, the profile beats env, and env still fills in when the profile is silent.

*History.* The original decision (2026-09-04) put an *ambient* profile (`active`, `<NAME>_PROFILE`) below env and only an explicit `-p` above it, to keep a pipeline's exported globals from being redirected by a stored default. In practice the split was the single thing users most often got wrong: the same profile gave different answers depending on how it was selected, and `profiles show` reported values a command then ignored. The uniform rule replaces it.

### Credentials: a selector, not a rung

For credentials the profile does not extend ADR-0008's chain. It only decides **which keyring account** the existing priority-3 rung reads:

- no profile → account is `<scheme>`, byte-identical to every pre-profiles binary, so existing keychain entries keep resolving and nobody is logged out by an upgrade;
- profile → account is `<scheme>#<credential>`.

HTTP basic is the one scheme whose credential is two values. Both live in a **single** entry as `{"username": …, "password": …}`, read back field-by-field via `AuthCredentialSource::KeyringField`. One entry rather than two because the OS keychain prompts per item, and two would mean two prompts to send one request.

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

`profiles list` shows a synthetic `[env]` row when environment variables currently supply a credential, because those are what an unprofiled invocation — or a selected profile with nothing stored — authenticates with. A listing that omitted them would answer "which account am I about to hit?" wrongly whenever one is exported. `profiles current` lists the same variables as `credential_env_fallback`. It is a rendering of what `auth status` already detects, not new detection.

### Server-variable env vars

The `flag → profile → env → spec default` chain above needs an env rung to exist at each
resolution point. Server variables had none — `--region` was flag-or-spec-default only — so a
profile could set a region but a shell session could not, and the chain had a hole in the middle.
Each spec server variable now also reads `<PREFIX>_<VARIABLE>`, where `<PREFIX>` is the binary
name uppercased with `-` → `_` (`twilio` + `region` → `TWILIO_REGION`).

Prefixed, unlike `x-fern-sdk-variables`, which read the bare screaming-snake name (`gardenId` →
`GARDEN_ID`). The asymmetry is deliberate: SDK variables are named for domain entities and are
naturally specific, while server variables are overwhelmingly generic — `region`, `edge`, `env`,
`stage` — and a bare `REGION` would collide with unrelated environment settings on almost any
machine. Honoring the bare name *in addition* stays available as an additive change later;
narrowing from it would not. The existing SDK-variable spelling is left alone because changing
it would break anyone relying on it.

clap resolves `CommandLine > EnvVariable > DefaultValue`, and `apply_server_vars` treats any
source but `DefaultValue` as caller-pinned — so the rung slots in without touching the resolution
logic. When a profile carries the variable, `outranks_env()` demotes env so the profile still wins.

### Setting state by the name the user knows

`profiles create --with-token --scheme <name>` is the precise way to store a
credential and the wrong default. It requires knowing the scheme names, which
are spec-internal, and on a CLI whose schemes share one credential pair it has
to be run once per scheme — three times for a Twilio-shaped API, with names a
user cannot guess, or two thirds of the operations stay unauthenticated with no
indication why.

`profiles set <name> KEY=VALUE …` keys on the **environment variable name**
instead, which is already in the user's shell and the vendor's docs. One
assignment fans out to every scheme declaring that variable.

Classification is generic rather than a table of known names.
`login::expand_slots` returns one slot per required value in the same order
`scheme_credential_fields` names them, so the slot *index* yields the field:
`required[0]` is `username`, `required[1]` is `password`. Nothing in the command
knows what a scheme's halves are called, so it works for any customer's schemes.

Three rules keep it honest:

1. **Secrets to the keyring, settings to the file.** This gives the authoring
   ergonomics people want from a `.env` without putting a credential in a file
   that has no permission hardening.
2. **Classify everything before writing anything.** A run that sets two keys and
   rejects the third must not leave the first two applied.
3. **A prefixed-but-unrecognised key is an error, not a parameter.**
   `<PREFIX>_…` is unambiguously meant to be one of this CLI's own variables,
   and that surface is known exhaustively. Falling through to the parameter path
   would accept a typo on any CLI whose binding cannot enumerate parameters —
   precisely the silent no-op the validation exists to prevent.

### What the listing shows

`profiles list` had a `CREDENTIAL` column that echoed the profile name back on
every row, because `credential` is the keyring *account suffix* and defaults to
the profile's own name. True, and useless.

The listing now shows **`ACCOUNT`** — the username half of a stored basic
credential, truncated (`AC12345678…`). That answers the question a listing
exists to answer: which account is this profile? A username is not a secret, so
surfacing it is safe. The column is absent when no scheme has a username field
(bearer / API-key CLIs have no account), when nothing is stored, or when the
keyring read fails — rendering a column must never make `profiles list` error
or block on a locked keychain.

The slot name survives as **`credentials_from`**, emitted only when it differs
from the profile's own name, so it appears on exactly the row borrowing someone
else's credential. `source` became **`selected_by`**, which says what it is: why
this profile is in play, and therefore which precedence rule applies.

This follows the domain-column convention the CLIs users already run: gcloud
lists `ACCOUNT / PROJECT / REGION / ZONE`, kubectl lists
`CLUSTER / AUTHINFO / NAMESPACE`. AWS's `list-profiles` prints bare names and is
the weaker surface for it.

### Shipping posture

Off unless `CliApp::profiles(...)` is called, wired from `config.profiles.enabled` in `generators.yml`. Adding a top-level subcommand to every existing generated CLI is a surface change and must not arrive unannounced. Flipping the default is a **separate, later** decision that requires a generator major bump plus a migration under `packages/generator-migrations/src/generators/cli/migrations/` pinning `enabled: false` for anyone who had not opted in — per the repo's breaking-changes policy. No such migration exists yet, because the default has not been flipped.

## Alternatives considered

- **Ambient profile below env, explicit `-p` above it** (the original decision). Kept a pipeline's exported globals safe from a stored default, but made one profile resolve differently depending on how it was selected, and made `profiles show` report values a command then ignored. Replaced by the uniform rule; the CI property survives in weaker form — a job that selects no profile is unaffected.
- **Env above every profile.** The ADR-0008 instinct applied one layer up. Rejected: it makes `profiles set` inert for any value the shell also exports, which is exactly the case profiles exist for.
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
4. CI that selects no profile is unaffected: it keeps using env vars exactly as before.
5. One rule for every field and every selection mechanism: what `profiles show` prints is what the command uses.

**Negative.**

1. **A profile is invisible state that changes what a command does** — and an active one now also beats exported env vars. `profiles current` and the `auth status` profile line are the mitigation; a job that must be driven by env alone should not select a profile.
2. **`-p` is now a reserved short flag.** Safe today because spec-derived parameter args are `.long()`-only, but a future change that gives parameters short forms has to keep out of `-p`.
3. **A profile can store a value that is valid for one operation and invalid for another.** Write-time validation unions the accepted values across operations, so it catches typos but cannot catch this; the affected command fails at clap-parse time naming a flag the caller did not pass.
4. **One more file in the config directory** for users to know about when clearing CLI state.
