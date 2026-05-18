# Sentry CLI false-positive triage — agent instructions

Read **`DESIGN_CHOICES.md`** before proposing code changes; it holds short, accumulated fix patterns. After human review changes the accepted approach, update **`DESIGN_CHOICES.md`** with **1–3 new bullets** (short phrases only) when the lesson is reusable.

## Scope

- Sentry org: `buildwithfern`
- Sentry project: `cli`
- Use the repo-baked Sentry CLI: `pnpm exec sentry-cli` (do not rely on a global `sentry` binary).
- Default: unresolved only — `pnpm exec sentry-cli issue list … --query "is:unresolved"` unless the task says to re-validate resolved issues.

## Run shape

- **One PR per solution group.** Group Sentry issues by the code change that fixes them: if one change solves multiple `shortId`s, ship those together in one PR; unrelated fixes must be separate PRs.
- **Do not create one catch-all PR for a whole run.** A run may produce multiple PRs, but each PR must correspond to exactly one solution group.
- **Defer** opening PRs until grouping and investigation are far enough along that you are not guessing which `shortId`s share a fix.

## Fetch (Sentry CLI)

```bash
pnpm exec sentry-cli issue list buildwithfern/cli \
  --json --fields shortId,title,status,lastSeen \
  --limit 100 --query "is:unresolved"

pnpm exec sentry-cli issue view buildwithfern/cli/<SHORT_ID> --json
```

Prefer `--json` and `--fields` to keep payloads small.

## Ledger-first and query-first

1. Collect `shortId` from list output.
2. Do **not** load all of `automation/sentry-triage/ledger.json` into context as it grows.
3. Targeted lookup with `jq`:

```bash
jq --argjson ids '["CLI-2W","CLI-2V"]' '
  .issues
  | to_entries
  | map(select(.key as $id | $ids | index($id)))
  | map({
      shortId: .key,
      disposition: .value.disposition,
      duplicateOf: .value.duplicateOf,
      problemSignature: .value.problemSignature,
      prOrIssue: .value.prOrIssue
    })
' automation/sentry-triage/ledger.json
```

4. **Same `shortId` only:** if this Sentry issue’s `shortId` already exists in the ledger with disposition `shipped`, `ignored`, `duplicate`, or `keep_sentry`, **skip** re-triaging that row (`keep_sentry` means do not suppress—do not reclassify as a false positive). This is **not** “similar title so skip”; it is exact `shortId` match.
5. **Re-process** `pending_review` until set to a terminal disposition.
6. `pnpm exec sentry-cli issue view` in full only for unknown or `pending_review` rows (and tight clustering follow-ups).
7. **Similar past cases (inspiration only):** for a `shortId` **not** in the ledger (or still in play), you may stream `problemSignature` + `shortId` (e.g. `jq -r '.issues | to_entries[] | "\(.key)\t\(.value.problemSignature)"' automation/sentry-triage/ledger.json`) and keyword-search using the **new** issue’s title/exception (MDX, YAML, errno, container, `generators.yml`, etc.) to find **prior fixes to learn from**. **Do not** treat a text match as proof the new issue is already solved: always confirm with current Sentry payload, stack, and code paths. A recurrence or regression still needs a normal investigation and disposition.

## Ledger shape (`issues`)

| Field | Required | Meaning |
|-------|----------|---------|
| `title` | yes | Short Sentry title. |
| `problemSignature` | yes | **1–3 short sentences:** symptom + feature surface so **future** triage can grep the ledger for **similar** past cases as **hints** (how we fixed before)—not as proof the new issue is closed. For `duplicate`, copy the canonical row’s `problemSignature` so search still hits this `shortId`. |
| `disposition` | yes | See table below. |
| `rationale` | yes | Why this disposition. |
| `fixSummary` | yes | What changed, or `—` for `duplicate` / `ignored` when not applicable. |
| `prOrIssue` | yes | PR URL, issue link, or note. |
| `lastAnalyzed` | yes | ISO date. |
| `duplicateOf` | if `duplicate` | Canonical ledger `shortId` whose `fixSummary` / PR is the source of truth. |

## Ledger disposition meanings

| Value | Meaning |
|-------|---------|
| `shipped` | Fix merged; events should stop after release or issue resolved in Sentry. |
| `ignored` | No code change; rationale recorded. |
| `keep_sentry` | Real bug; stays reportable until a product fix. |
| `duplicate` | Same **Sentry** issue family as another ledger row: `duplicateOf` points at the canonical `shortId` (one fix narrative). **Skip** re-triage for **that** `shortId` only—same as `shipped` for workload. This is unrelated to “looks like” similarity for **new** `shortId`s; those still get full analysis. |
| `pending_review` | Needs decision; resolve on next pass. |

**Why keep `duplicate`?** Sentry often opens **multiple issues** for one underlying fix. One row stays `shipped` with the full story; the rest become `duplicate` + `duplicateOf` so the next run does not re-investigate **those same ledger shortIds** and the ledger stays small. If you prefer, you can mark every follower `shipped` instead—`duplicate` is only ergonomics.

## Code and PR rules

- Follow **`DESIGN_CHOICES.md`** and nearby throw sites in this repo.
- Branch: use `FedeZara/fix/sentry-<short-id-summary>-<kebab-solution>` for each solution group (for example, `FedeZara/fix/sentry-cli-30-cli-3g-docs-yaml-parse`). Include at most three `shortId`s in the branch name.
- PR title: include the solved `shortId`s in the title. If there are more than three, list only the first three and summarize the family (for example, `fix(cli): classify CLI-30 CLI-3G CLI-Q docs YAML parse errors`).
- Changelog: `packages/cli/cli/changes/unreleased/` when the CLI behavior or reporting changes.
- PR description: explicitly list **each Sentry error solved** by the PR, including its `shortId` (for example, `CLI-2W`) and a short fix note.

## Phases (single parent agent)

Optional read-only explore subagents for search only; parent owns edits and the PR.

1. **Parent** — read this file + `DESIGN_CHOICES.md`; `jq` ledger for current `shortId`s; no PR until grouping is sound.
2. **Fetch** — `pnpm exec sentry-cli issue list` / `pnpm exec sentry-cli issue view` as above.
3. **Ledger filter** — for each **current** `shortId`, if the ledger row exists and disposition is terminal (`shipped`, `ignored`, `duplicate`, `keep_sentry`), skip that issue; keep unknown `shortId`s + `pending_review`. Similar `problemSignature` matches elsewhere do **not** skip an unknown `shortId`.
4. **Group** — by the concrete solution, not just by similar titles. Same code path / same root cause / same patch → one solution-group PR. Different patches → different PRs.
5. **Investigate** — nearest catch/throw; align with `DESIGN_CHOICES.md`.
6. **Fix** — open one PR per solution group; each PR description lists every solved Sentry error with `shortId`; changelog when needed; `keep_sentry` for confirmed real bugs.
7. **Record** — update `ledger.json` in the **same** PR as the code (and `DESIGN_CHOICES.md` when a reusable pattern is confirmed).

## Record updates after human review

When the task is to align records with **final** human decisions (no product code unless asked):

- Load `ledger.json` only (or the specific `issues.<shortId>` entries you are changing).
- Update ledger fields consistently (including `duplicateOf` if you change which row is canonical, and **`problemSignature`** if humans clarify how this issue should be found next time).
- **Update `DESIGN_CHOICES.md`** when the correction is a reusable pattern: add or replace **short** bullets only—no long narratives.
- Do **not** re-fetch Sentry unless the task requires verification.
