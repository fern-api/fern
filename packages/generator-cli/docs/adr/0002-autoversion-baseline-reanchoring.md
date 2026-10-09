# ADR 0002: Autoversioning Re-anchors Its Baseline Instead of Trusting the Recorded SHA

## Status

Accepted — 2026-07-10.

## Context

[ADR 0001](./0001-delegate-divergent-merge-recovery-to-replay.md) moved divergent-merge recovery into `@fern-api/replay` and established that the lockfile's `current_generation` SHA is a **hint, not a load-bearing invariant**. Replay's `findPreviousGenerationFromHistory` re-anchors on the most recent reachable `[fern-generated]` commit, so customization preservation is correct regardless of whether the recorded SHA is reachable.

That guarantee held for replay's own patch detection. It did **not** hold for the *other* consumer of the baseline: autoversioning.

`replayPrepare` returns a `previousGenerationSha` on the `PreparedReplay` handle. Every flow sets it directly from the raw lockfile:

```
previousGenerationSha = preLock.current_generation ?? null   // read verbatim, not reconciled
```

`AutoVersionStep` (in the post-generation pipeline) consumes that value as the base of its diff:

```
const rawDiff = this.gitDiff(previousGenerationSha, currentGenerationSha);   // throws on a bad object
```

So while replay's *correctness* stopped depending on the SHA, autoversioning still treated it as a reachable git object. That assumption broke when generator-cli's signed-commit push (`pushSignedCommit`) began recreating **every** local commit via the GitHub Git Data API — not just `HEAD` — so each commit (including `[fern-generated]`) gets a new remote SHA. The lockfile is committed inside the branch *before* the push re-SHAs the chain, so it records a pre-push local SHA that never exists on the remote. On the next regeneration's fresh clone:

- Replay's patch detection re-anchors from history and works fine.
- `AutoVersionStep.handleNormalFlow` calls `gitDiff(previousGenerationSha, …)` with the unreachable SHA → `git diff` exits with `fatal: bad object` → the exception propagates → `AutoVersioningService` never rewrites the magic version.

The visible symptom: SDK PRs ship with the placeholder version `0.0.0-fern-placeholder` instead of a computed semver. (Reported via Pylon #22120; first observed once the `[fern-replay] advance lockfile` commit began landing the recorded SHA on every regen.)

## Decision

Bring autoversioning in line with ADR 0001: **the recorded SHA is a hint for autoversion too.** `AutoVersionStep` re-anchors its diff baseline rather than trusting `previousGenerationSha` blindly.

`handleNormalFlow` resolves the diff base through `resolveReachableGenerationBase(recordedSha, currentGenerationSha)`:

1. If `recordedSha` is a reachable commit (`git cat-file -e <sha>^{commit}`), use it.
2. Otherwise walk `git log --first-parent` from the current generation commit and re-anchor on the most recent prior `[fern-generated]` commit — the same strategy replay uses (`findPreviousGenerationFromHistory`).
3. If no `[fern-generated]` baseline is reachable at all, return `null`; the diff is treated as empty and the previous version is resolved from `baseVersion` / `metadata.json` / git tags. The magic placeholder is **always** rewritten (falling through to first-generation handling if nothing else resolves), so a placeholder version can never ship.

This keeps the fix on the consumer that still relied on the SHA, and leaves replay's returned `previousGenerationSha` (a raw lockfile hint) untouched.

## Alternatives Considered

**Make `@fern-api/replay` return a reconciled, reachable `previousGenerationSha`.** Replay already derives a reachable anchor internally, so it could hand autoversion the reconciled value. Rejected as the primary fix because it makes the engine responsible for a concern (versioning's diff base) that is not its own, and it would not protect autoversion against future push/history rewrites that happen after `replayPrepare` returns. The consumer must be resilient regardless of what the hint contains. (Replay may still expose a reconciled value later as a convenience, but autoversion no longer depends on it.)

**Record the post-push SHA in `replay.lock`.** Structurally impossible: the lockfile is committed inside the branch before the push assigns the final remote SHAs, so it cannot record a value it does not yet know. This is exactly why the SHA is a hint.

**Let the failure block PR creation ("fail loudly").** Rejected for the same reason as ADR 0001: regen pipelines should self-heal across legitimate history rewrites. The correct behavior is to degrade gracefully and always produce a real version, never to open a placeholder PR *or* to abort the release.

## Consequences

**Better:**

- Autoversioning is now push-resilient and squash-merge-resilient, matching replay. An unreachable recorded SHA re-anchors from history instead of crashing.
- The magic placeholder (`0.0.0-fern-placeholder`) can no longer leak into a shipped SDK PR via an autoversion crash — every autoversion path rewrites it.
- Signing behavior is unchanged: `pushSignedCommit` still recreates every local commit so the whole chain shows as Verified. The fix adapts the consumer to that behavior rather than reverting it.

**Trade-offs:**

- `AutoVersionStep` now performs a `git cat-file -e` reachability probe and, on a miss, a bounded `git log --first-parent` walk. Both are sub-second on real customer repos (the walk stops at the first `[fern-generated]` commit).
- There are now two independent re-anchoring implementations (replay's `findPreviousGenerationFromHistory` and generator-cli's `AutoVersionStep`). They intentionally share the same `[fern-generated]` first-parent strategy; if that boundary definition changes, both must move together.
