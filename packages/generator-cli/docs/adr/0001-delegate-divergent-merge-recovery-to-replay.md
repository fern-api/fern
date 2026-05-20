# ADR 0001: Delegate Divergent-Merge Recovery to @fern-api/replay

## Status

Accepted — 2026-05-18.

## Context

`@fern-api/generator-cli` is the post-generation orchestrator that runs after a language generator emits SDK files. One of its jobs is to invoke `@fern-api/replay`, which preserves customer customizations across regenerations. Replay reads `.fern/replay.lock` to find the previous `[fern-generated]` commit and walks forward from there to detect what the customer changed.

A persistent class of customer-facing failures stemmed from cases where the lockfile's recorded `current_generation` SHA is no longer reachable from `HEAD`:

- **Squash-merge of a regen PR + branch deletion.** The bot's `[fern-generated]` commit lived only on the deleted PR branch. The squash-merge produced a single new commit on `main` with the post-replay tree, but the original generation commit was orphaned.
- **Force-push past a generation.** A customer or another tool force-pushes `main` to a state before the bot's commit.
- **Aggressive `git gc --prune`.** The generation object got garbage-collected before the next regen.

Generator-cli historically guarded against these by running a roughly 60-line "precondition gauntlet" in `replayPrepare` *before* delegating to the replay engine:

1. Resolve the `fern-generation-base` tag (the bot writes this on every regen as a moving pointer to the latest generation).
2. Compare the tag's parent against the lockfile's recorded `base_branch_head`.
3. Compute tree-diff distances between the tag and `HEAD`, and between the recorded base and `HEAD`.
4. If the tag was "closer" to `HEAD` than the lockfile-recorded position, infer that a squash-merge happened and call `ReplayService.syncFromDivergentMerge()` to patch up the lockfile before invoking `prepareReplay`.

This gauntlet had real bugs:

- It crashed when `git commit-tree -p <previousGenerationSha>` failed because the parent SHA was unreachable in the local clone (a hotfix shipped in generator-cli 0.9.27 caught the most common manifestation).
- It got stuck on stale `fern-generation-base` tag pointers from clean (no-conflict) replay PRs that were later closed without merging, poisoning subsequent runs.
- It mixed two responsibilities in the same code path — *detecting* an out-of-sync lockfile and *repairing* it — making both harder to reason about.

The deeper problem: this was the wrong layer for the work. The replay engine has its own complete view of the history (lockfile, `[fern-generated]` commit messages, tree hashes); the consumer was making weaker inferences over the same data and trying to short-circuit the engine's behavior. Customers sat with broken regen pipelines for weeks at a time while we iterated on edge cases in the gauntlet.

## Decision

Move all divergent-merge recovery into `@fern-api/replay` itself. The engine's `findPreviousGenerationFromHistory` now walks `git log HEAD --first-parent`, classifying each commit via `isGenerationCommit`, and re-anchors the next regen on the most recent reachable `[fern-generated]` commit. The lockfile's `current_generation` is treated as a hint, not a load-bearing invariant — if it's stale or unreachable, the walk discovers a valid anchor; if it's reachable, the walk converges on the same answer.

On the consumer side (generator-cli), `replayPrepare` no longer:

- Resolves the `fern-generation-base` tag,
- Reads the lockfile to compare `base_branch_head` against the tag,
- Computes tree-diff distances,
- Calls `syncFromDivergentMerge`.

It just calls `service.prepareReplay()` and trusts the result. The companion `baseBranchHead` field — passed through `ReplayOptions`, `CommitOptions`, `ReplayPreparation`, and recorded on `GenerationRecord.base_branch_head` — is removed from `@fern-api/replay`'s public types in 0.16.0, and from generator-cli's `PreparedReplay`, `ReplayRunResult`, `GenerationCommitStepResult`, `ReplayStepResult`, and telemetry props in 0.9.31.

Backward compatibility:

- Customer lockfiles that already have `base_branch_head` set on generation records continue to load. The engine round-trips unknown fields on existing records rather than stripping them; only new records (written by 0.16+) lack the field.
- The `[fern-generation-base]` tag is still **written** by `GithubStep` and `createReplayBranch`. Older generator-cli versions baked into already-deployed generator Docker images still **read** the tag from customer repos to drive their own gauntlets. Once the generator-cli catalog pin rolls forward across all generators and old Docker images age out, the write side can also be removed.

## Alternatives Considered

**Keep the gauntlet but harden its edge cases.** Each fix shipped to date was a real fix, but the surface kept producing new failure modes. The boundary between "consumer-side pre-check" and "engine-side recovery" was unclear: both layers held partial views of the same data, and divergence between them was the source of bugs. Continuing down this path meant accepting indefinite tactical maintenance on a code path that, by its nature, only runs on the rare and hard-to-reproduce squash-merge scenarios — exactly the worst place to carry complexity.

**Move only `syncFromDivergentMerge` into the engine, keep the consumer-side detection.** The consumer would still resolve the tag and compute distances, then ask the engine to perform the sync. Rejected because the detection logic was the part with the bugs — the actual sync was straightforward once you knew you needed it. Splitting along that line preserved the wrong half.

**Add a strict assertion that the lockfile's `current_generation` must be reachable, and fail loudly otherwise.** Rejected because "fail loudly" is bad customer UX: regen pipelines should self-heal across legitimate ops (squash-merges, force-pushes during incident response, repo rewrites) without requiring manual intervention. The whole point of replay is "do the right thing across history rewrites."

## Consequences

**Better:**

- The class of "lockfile out-of-sync" bugs that have produced several hotfixes in the last six months no longer has a place to live on the consumer side. The engine's first-parent walk is unconditional and self-validating.
- Telemetry signal is cleaner. `replayCrashed` now reflects engine failures, not consumer-side detection failures — and the engine has a much smaller set of failure modes.
- The consumer is meaningfully smaller. `replayPrepare` lost roughly 60 lines of code (the gauntlet) plus `gitRevParse`, `gitDiffNameOnly`, and `isTagMergedIntoHead` helpers and their tests.

**Trade-offs:**

- The `[fern-generation-base]` tag is now write-only from this generator-cli's perspective. We carry the write logic for backward compat with older bundled generator-cli versions, but it is otherwise dead code from this layer's point of view. There's a follow-up to remove the write side once the catalog rolls forward across all generators.
- Diagnosing replay failures now requires reading the engine's logs and the lockfile, not the consumer's pre-check trace. The engine emits enough diagnostic information for this to be net-positive, but anyone used to the previous trace shape will need to recalibrate.
- The engine's first-parent walk has a higher cost than a cached tag-resolve. In practice the walk is bounded (it stops at the first `[fern-generated]` commit) and runs on repos of bounded depth, so the difference is sub-second on real customer repos. We accept this for the correctness gain.
