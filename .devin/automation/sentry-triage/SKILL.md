---
name: sentry-triage
description: Run Fern CLI Sentry false-positive triage for buildwithfern/cli. Use when investigating Sentry CLI issues, classifying false positives, updating the triage ledger, or creating PRs for Sentry error fixes.
---

# Sentry CLI False-Positive Triage

## Scope

- Sentry org: `buildwithfern`
- Sentry project: `cli`
- Use the repo-baked Sentry CLI: `pnpm exec sentry-cli`.
- Default query: unresolved only, unless the task explicitly says to re-check resolved issues.

## Required Files

Read these before proposing code changes:

1. `.devin/automation/sentry-triage/DESIGN_CHOICES.md` — general principles, not pre-written solutions.
2. `.devin/automation/sentry-triage/ledger/` — one JSON file per `shortId` (e.g. `ledger/CLI-2W.json`); plus `ledger/_meta.json` for repo-wide constants. Read only the rows you need.
3. `.devin/automation/sentry-triage/SUBAGENT_CONTRACT.md` — passed to every spawned subagent.

The ledger is **one file per `shortId`**. Parallel subagent branches touch disjoint files, so merge conflicts are eliminated by construction. Do not load or rewrite the whole directory unless a task explicitly requires broad record maintenance.

## Workflow Overview

1. **Parent** — fetch Sentry, ledger-filter (cheap lookup), existing-PR dedupe (script), group by call site (hypothesis from Sentry stacks), write Group Plans, spawn.
2. **Spawn** — strict 1:1: one parallel subagent per eligible group. N groups → N parallel subagents, never one subagent told to handle several groups and never sequential. See [Subagent Orchestration](#subagent-orchestration).
3. **Reconcile** — collect subagent results, sanity-check ledger, summarize, optionally open one **parent reconciliation PR**. See [Parent Reconciliation](#parent-reconciliation).

**Classification authority lives in the subagent**, not the parent. The parent does cheap, structural decisions (ledger filter, dedupe, grouping hypothesis). The subagent has the code in front of it and owns the actual disposition call — including `keep_sentry`, `ignored`, `pending_review`, and "the parent's grouping was wrong." The parent's Group Plan is a working hypothesis, not a binding classification.

## Fetch

```bash
pnpm exec sentry-cli issues list \
  --org buildwithfern \
  --project cli \
  --status unresolved

pnpm exec sentry-cli issues list \
  --org buildwithfern \
  --project cli \
  --id <ISSUE_ID>
```

If the baked CLI cannot show enough detail for a `shortId`, use the Sentry API through `pnpm exec sentry-cli` or an authenticated project-approved Sentry command. Keep payloads small.

## Ledger Filter

1. Collect current `shortId`s from Sentry.
2. Query only those rows:

```bash
for id in CLI-2W CLI-2V; do
  path=".devin/automation/sentry-triage/ledger/$id.json"
  if [[ -f "$path" ]]; then
    jq --arg shortId "$id" '{shortId: $shortId, disposition, duplicateOf, problemSignature, prOrIssue}' "$path"
  else
    jq -n --arg shortId "$id" '{shortId: $shortId, status: "unknown"}'
  fi
done
```

3. Skip exact `shortId` files with terminal disposition: `shipped`, `ignored`, `duplicate`, or `keep_sentry`.
4. Re-process `pending_review`.
5. Similar `problemSignature` text is only a hint. Never treat a similar past issue as proof the current `shortId` is fixed.
6. Listing all rows: `ls .devin/automation/sentry-triage/ledger/CLI-*.json`. `_meta.json` holds repo-wide constants and rarely changes.

## Existing-PR Dedupe Procedure

After the ledger filter, run the dedupe script for every remaining `shortId`. Do **not** run ad-hoc `gh` searches for this purpose.

```bash
gh auth status
.devin/automation/sentry-triage/scripts/find-existing-pr.sh CLI-44 CLI-4T
```

Steps the script performs, per `shortId`:

1. **Ledger lookup** — `prOrIssue` and `disposition` from `ledger/<SHORT_ID>.json`; if `prOrIssue` is a PR URL, fetch PR state (any branch).
2. **Triage-branch search** — one `gh pr list` call per run for open PRs with head branch prefix `fix/cli-sentry-triage/`; per `shortId`, match when the branch name, title, or body contains the id (case-insensitive).
3. **Verification metadata** — for each candidate, fetches `files`, `title`, `body`, `state`, `headRefName`.

PR discovery does **not** search all open PRs in the repo — only triage-shaped branches (plus ledger URLs).

Stdout is a JSON array (one object per `shortId` with `ledger` and `candidates`). For each `shortId`, judge against the boundary you identified:

- `none` — no candidate covers the boundary; eligible for a subagent.
- `covered` — a candidate PR's diff/title/body matches the group's boundary and fix; record the `prOrIssue` update for the parent reconciliation PR (do not spawn).
- `partial` — some `shortId`s covered, others not; split the group and only spawn for uncovered `shortId`s.

If the script exits non-zero (auth failure, rate limit, network), **halt the run** and ask a human to fix `gh` auth or rate before proceeding. The `--limit 100` triage-branch cap is unlikely to be hit; if exceeded, narrow the filter and re-run.

Env vars: `FERN_REPO` (default `fern-api/fern`), `LEDGER_DIR` (default `.devin/automation/sentry-triage/ledger`).

## Grouping Rule

Group by **call site**, not by title alone.

- A call-site group is a set of Sentry issues that fail from the same function, boundary, or throw/catch path and can be fixed by the same code change.
- Grouping should be rare. Most Sentry issues are unique and should become their own investigation and PR.
- Multiple `shortId`s may share one PR only when the stack proves the same function or boundary produces the same false-positive classification.
- Do not group issues just because the messages look similar, the same dependency appears, or a prior ledger row has a similar `problemSignature`.
- The parent **finalizes the group list before spawning**. Mid-stream regrouping is not allowed. If a subagent disproves a group, it stops and returns findings; the parent re-plans on the next run.

**Parent investigation scope.** Parent reads Sentry stacks and may optionally grep the codebase for the top frame. **Do not open source files** — the subagent does the source-code reading. The Group Plan is built from Sentry data and ledger context, nothing deeper.

Before spawning, write one **Group Plan** block per group. The plan is the parent's **working hypothesis**; the subagent verifies it against code and may return any disposition.

```text
Group: <call site or function — hypothesis from top stack frame>
ShortIds: <CLI-XX, CLI-YY>
Evidence:
  - top frames (>=3, with file:line where available)
  - exception type and message
  - breadcrumb tail if relevant
  - event count and lastSeen
ExistingPR: <none | PR URL and why it covers/does not cover this group>
Branch: fix/cli-sentry-triage/<YYYY-MM-DD>-<up-to-3-short-ids-kebab>
```

`Evidence` is the subagent's only window into Sentry — the subagent is forbidden from refetching, so include everything it needs to locate and verify the boundary. Paste the data as text; no need for structured JSON.

The parent does **not** propose a fix or pre-match `DESIGN_CHOICES.md` principles — the subagent owns both once it reads the code. The parent contributes only what it can reliably produce from Sentry data: the call-site hypothesis, the `ShortIds` set, the raw evidence, the dedupe result, and the branch name. The subagent surfaces any new principle worth recording via `newPrincipleProposal`.

Any group with no `ExistingPR` coverage and no terminal ledger row is eligible for a subagent. The parent **must not** pre-classify groups as `keep_sentry`, `ignored`, or `pending_review` to avoid spawning; those decisions belong to the subagent. The only parent-side shortcuts are:

- Skip when the ledger row is already terminal (`shipped`, `duplicate`, `keep_sentry`, `ignored`).
- Skip when the dedupe script confirms an existing PR fully covers the group (record `prOrIssue` for the parent reconciliation PR).

Anything else gets a subagent.

## Subagent Orchestration

**One subagent per eligible group. Strict 1:1, no exceptions.**

For every eligible group from [Grouping Rule](#grouping-rule), the parent spawns exactly one subagent. The mapping is:

| 1 Group Plan | 1 subagent | 1 branch | 1 PR | 1 disjoint set of `ShortIds` |

- N eligible groups → **N parallel subagents in the same spawn batch**. Never one subagent handed multiple Group Plans; never sequential spawning to "see how the first one goes".
- Spawn via the host's parallel-worker primitive:
  - **Devin**: managed Devins (one separate session per group).
  - **Cursor**: `Task` tool with `run_in_background: true`, called once per group within a single message.
  - Other hosts: the equivalent parallel-worker mechanism.
- Subagent rules live in [`SUBAGENT_CONTRACT.md`](SUBAGENT_CONTRACT.md). Pass only that file's path plus **one** Group Plan block. Never paste multiple Group Plans into one spawn prompt.
- Each subagent works on its own fresh branch off `main`. Branches must **not** be stacked across groups.
- Each subagent owns: its branch, its fix, its PR, and ledger files for its `ShortIds` only.

Anti-patterns (do not do these):

- Spawning one subagent with a list of Group Plans ("here are 5 groups, work through them").
- Spawning subagents sequentially across groups, even when the parent feels uncertain about parallelism.
- Letting one subagent open a second PR because it noticed another group while reading code (that's a re-plan, not a scope expansion — see [Stop and return findings](SUBAGENT_CONTRACT.md#stop-and-return-findings-no-pr-if)).
- Bundling several `ShortIds` from different call sites into one "miscellaneous" group to spawn fewer subagents.

If the parent is uncertain a group is well-formed, leave it unspawned and roll it into the next run — skipping is better than merging groups.

Parent spawn prompt (uniform for every group, one spawn per group):

```text
Read .devin/automation/sentry-triage/SUBAGENT_CONTRACT.md and follow it.

Group Plan:
<paste the single Group Plan block here>
```

## Parallel-Safety Rules

- Branch names per group are unique by the date + `shortId` scheme (each `shortId` belongs to exactly one group).
- Ledger writes are partitioned by `shortId` across separate files (`ledger/<SHORT_ID>.json`); parallel subagents never touch the same file. **This is the primary reason for the per-file layout.**
- `DESIGN_CHOICES.md` is parent-only. Subagents return `newPrincipleProposal` instead of editing it.
- `ledger/_meta.json` is parent-only and rarely edited.
- If two groups share a code path mid-investigation, both subagents stop and return findings; the parent re-plans.

## Parent Reconciliation

After all subagents finish:

1. Collect each subagent's `prUrl` (or `skipped: <reason>`), `shortIdsTouched`, `principlesApplied`, `newPrincipleProposal`.
2. **Ledger collision check** (per-file layout makes this trivial): no two open triage PRs should include the same `ledger/CLI-XX.json` file. Verify with `gh pr view <num> --json files` against each open triage PR.
3. Print a per-group summary: group label, `ShortIds`, PR URL or skip reason.
4. **Optional parent reconciliation PR** (only when there is something to write):
   - Ledger `prOrIssue` updates for groups the parent marked `covered` during dedupe.
   - 1–3 new `DESIGN_CHOICES.md` bullets surfaced via `newPrincipleProposal`, after human review.

   The reconciliation PR contains **no code changes**, only ledger pointer updates and/or `DESIGN_CHOICES.md` edits. Branch: `chore/cli-sentry-triage/<YYYY-MM-DD>-reconcile`.

## PR Rules

- One PR per call-site solution group, opened by the subagent (see [Subagent Orchestration](#subagent-orchestration)).
- A run may create multiple PRs; do not create one catch-all triage PR.
- Before creating a branch or PR, the [Existing-PR Dedupe Procedure](#existing-pr-dedupe-procedure) must have run; if an open triage PR already addresses the group, do not spawn a duplicate subagent.
- If a re-run finds the same `ShortIds` still unresolved **and** an open triage PR already exists at the right boundary, push additional commits to that branch rather than creating a new PR (host-agent convention). Most cases never reach here because terminal ledger rows are skipped at the ledger-filter step.
- Branch: `fix/cli-sentry-triage/{date}-<short-ids>` (e.g. `fix/cli-sentry-triage/2026-11-03-cli-44-cli-4t-cli-4v`).
- Use ISO date (`YYYY-MM-DD`) and at most three `shortId`s in the branch name, lowercased and kebab-cased.
- PR title must include the solved `shortId`s. If more than three, list the first three and summarize the family.
- PR description lists every solved `shortId` and a short fix note.
- Update only the per-`shortId` files under `.devin/automation/sentry-triage/ledger/` for that group, in the same PR as the code. Never touch other rows' files or `_meta.json`.
- Add `packages/cli/cli/changes/unreleased/` when CLI behavior or reporting changes.

## Ledger Records

One file per issue at `.devin/automation/sentry-triage/ledger/<SHORT_ID>.json`. Required fields:

- `title`
- `problemSignature`
- `disposition`
- `rationale`
- `fixSummary`
- `prOrIssue`
- `lastAnalyzed`
- `duplicateOf` when `disposition` is `duplicate`

The `shortId` is the filename (no `shortId` field inside the file). `ledger/_meta.json` holds repo-wide constants (`schemaVersion`, `project`) and is rarely edited.

Disposition values: `shipped`, `duplicate`, `keep_sentry`, `ignored`, `pending_review`. `pending_review` is the only non-terminal value (re-processed next run); the rest are terminal. Full decision rules live in [`SUBAGENT_CONTRACT.md`](SUBAGENT_CONTRACT.md) (`Choosing a disposition`).

## Sentry Resolution

Do not mark Sentry issues resolved unless the exact shipped CLI release is known and explicitly provided. Prefer explicit release resolution over "next release".
