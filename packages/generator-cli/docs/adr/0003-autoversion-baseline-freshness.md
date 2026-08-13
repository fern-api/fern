# ADR 0003: Autoversioning Validates Baseline Freshness, Not Just Reachability

## Status

Accepted — 2026-08-13. Supersedes part of [ADR 0002](./0002-autoversion-baseline-reanchoring.md).

## Context

ADR 0002 made `AutoVersionStep` resilient to an *unreachable* `current_generation`: probe the recorded SHA with `git cat-file -e`, and re-anchor on the most recent `[fern-generated]` commit in first-parent history when the probe fails. It claimed the result was "push-resilient and squash-merge-resilient."

The squash-merge half of that claim was wrong, and production repos demonstrate why. A reachable SHA is not necessarily the *latest* generation:

1. A release PR is squash-merged. Nothing advances `current_generation`, so it keeps pointing at the commit that preceded the release.
2. That commit is a merge commit on the default branch. It stays reachable forever, so `git cat-file -e` succeeds and the recorded SHA is used verbatim.
3. Every subsequent regeneration diffs the new SDK against the pre-release tree, re-reporting everything the release already shipped.

Observed across four SDK repos for one customer: `current_generation` sat one release behind for ten weeks. The Go SDK's autoversion computed `MAJOR: v1.2.0 → v2.0.0`, citing a field rename that had shipped in v1.2.0; the other three re-sent diffs inflated by a full release, timed out against the FAI service (HTTP 504), and fell back to a neutral PATCH bump with an empty changelog entry.

The re-anchoring escape hatch could not have rescued these repos either. `findPreviousGenerationFromHistory` matched `subject.startsWith("[fern-generated]")`, but a squash merge replaces the subject with the PR title and demotes the squashed subjects to body bullets:

```
feat: 1.3.0 alignExpr (#15)

* [fern-generated] Update SDK
* [fern-autoversion] SDK regeneration
```

So on a squash-merging repo the subject scan finds nothing, returns `null`, and the diff is treated as empty — a silent no-op release. The marker the scan needs is sitting in the commit, one field away from where it looks.

## Decision

Two changes, both in `AutoVersionStep`. Neither is sufficient alone: the first forces the question, the second answers it.

**1. Treat the recorded SHA as a freshness hint, not just a reachability hint.** `resolveReachableGenerationBase` now derives the history baseline unconditionally and prefers it over a reachable recorded SHA when — and only when — the derived commit **strictly descends** from the recorded one (`git merge-base --is-ancestor`, plus a full-SHA inequality check via `git rev-parse --verify`).

The descent requirement is what keeps this conservative. A recorded SHA may legitimately be newer than anything on the first-parent line (for example, it points at the previous run's generation commit, still reachable through the open bot branch). An unrelated or older generation commit must never displace it, or the baseline walks backwards and reintroduces the same cumulative diff.

**2. Match the generation marker against the full commit message (`%B`), not the subject.** `isGenerationCommitMessage` tests each line after stripping leading whitespace, quote markers, and a single list bullet, so a squashed `* [fern-generated] Update SDK` matches while prose that merely mentions the marker (`revert: undo the [fern-generated] commit`) does not. The `git log` format changes to `%H%x00%B%x1e` because `%B` spans lines and needs a record separator.

## Alternatives Considered

**Compare the recorded `tree_hash` against the commit's tree.** The lockfile records a tree hash alongside each generation, so a mismatch would flag staleness directly. Rejected: `previousGenerationSha` is the only field replay hands to `AutoVersionStep`, so this would widen the interface, and it detects corruption rather than staleness — a stale entry's tree hash matches its own commit perfectly.

**Always prefer history over the lockfile.** Simpler, and correct for the squash-merge case. Rejected because it regresses the case where the recorded SHA is genuinely newer than the newest first-parent generation commit, which is exactly the situation ADR 0002's re-anchor path was built to survive.

**Reconcile the lockfile after a release merges.** The real fix for the root cause — `current_generation` should not go stale in the first place. Not rejected, deferred: it requires a post-merge hook or a reconciliation pass inside replay, and it would leave every already-drifted repo broken until it ran. The consumer-side guard is a prerequisite either way, since ADR 0002's premise stands: the SHA is a hint.

**Fail loudly on a null baseline.** A missing baseline currently produces a no-op release that is indistinguishable from "nothing changed." Worth revisiting, but out of scope here and a behavior change for repos that legitimately have no generation history.

## Consequences

**Better:**

- A squash-merged release no longer pins the baseline. Repos already drifted recover on their next regeneration with no lockfile surgery.
- The marker is found wherever a merge strategy puts it: standalone subject, squash body bullet, or rebased commit.
- Both failure directions close: the over-bump (re-reporting a shipped breaking change as MAJOR) and the under-bump (null baseline → empty diff → no-op release).

**Trade-offs:**

- The history walk now runs on every generation rather than only on a reachability miss, adding one `git log` per run. It remains bounded and sub-second on real repos.
- `%B` output is larger than `%s` for the same history. `maxBuffer` stays at 64 MB, which is ample for full-message logs at customer repo sizes.
- Matching the body accepts a baseline whose tree is not *pure* generator output — a squash commit also contains hand-edited release commits. That is the correct baseline for changelog purposes (it is the released state) but can surface small version-string deltas in the next diff.
- The two re-anchoring implementations noted in ADR 0002 (replay's and generator-cli's) have now diverged: only generator-cli's matches on `%B` and checks descent. If replay's boundary definition is meant to stay in lockstep, it needs the same treatment.
