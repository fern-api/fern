# `docs/architecture/automation/`

The architecture docs in this directory don't keep themselves up to date.
This subdirectory describes the *automation contract* that does:

| File | What it is |
|---|---|
| [`PLAYBOOK.md`](./PLAYBOOK.md) | The methodology and prompt. Defines what the agent reads, how it synthesizes, what it writes, and what it must never touch. Runtime-neutral. |
| [`sources.yml`](./sources.yml) | Configuration: Linear project ID, GitHub repo, Slack summary channel, the architecturally-significant path list, schedule, and failure posture. |

## TL;DR

A scheduled agent runs **weekly** (Mondays, 14:00 UTC). Each run, it:

1. Pulls the last week of activity from **GitHub + Linear + Slack + Notion**
   (sources auto-discovered via `FER-*` ID cross-referencing — no
   hand-curated channel list to maintain).
2. Synthesizes the four streams into per-change packets.
3. Opens a **draft PR** with proposed updates to `ARCHITECTURE.md`,
   `decisions/INDEX.md`, and `CHANGELOG-ARCH.md`. **Every claim has a
   citation link** (PR, ticket, Slack thread, or Notion page).
4. Posts a digest to `#project-cli-generator`.

Humans review and merge. No auto-merge. The agent stays inside
`docs/architecture/**`.

## Where the schedule lives

The **playbook + sources config** lives in this repo. The **schedule**
lives in Devin (because Devin already has authenticated access to all
four data sources via the fern-api workspace integrations).

This split is deliberate:
- Editing the prompt is a **PR review** (collaborative, versioned).
- Editing the cadence is a **Devin config change** (immediate, no
  release dance).
- Swapping runtimes later (Devin → GitHub Actions → local /loop) is a
  config change, not a rewrite.

## Activation (not yet done)

The Devin schedule is **not yet activated**. To activate:

1. Upload the playbook as a Devin playbook:
   ```bash
   devin playbook create \
     --name arch-doc-refresh \
     --description "Weekly architecture-doc refresh for fern-api/cli-sdk" \
     --content "$(cat docs/architecture/automation/PLAYBOOK.md)"
   ```

2. Create the scheduled Devin session:
   ```bash
   devin schedule create \
     --playbook arch-doc-refresh \
     --cron '0 14 * * 1' \
     --tz UTC \
     --repo fern-api/cli-sdk
   ```

3. Verify on the next Monday that the digest lands in
   `#project-cli-generator` and the draft PR is opened.

> **Why not activate now?** Scheduling a recurring agent is a one-way
> door (consumes credits, opens PRs, posts to Slack). Let the playbook
> + sources be reviewed via PR first.

## Manual invocation

To run the playbook on demand (e.g., for a backfill or before a release):

```bash
devin run --playbook arch-doc-refresh --since 2026-05-01
```

Or, locally, by feeding `PLAYBOOK.md` to a Claude Code session along
with the current state of `docs/architecture/`. Useful for testing
playbook edits before they land on the schedule.

## How to update the playbook

Open a PR that modifies [`PLAYBOOK.md`](./PLAYBOOK.md) or
[`sources.yml`](./sources.yml). The Devin schedule re-reads both files
on every run, so changes apply on the next scheduled run — no schedule
restart needed.

When editing the prompt, also update the corresponding section in
`PLAYBOOK.md` (the prompt template is embedded there). The
configuration-only fields (sources, schedule, allowed paths) live in
`sources.yml`.

## How to disable temporarily

Three options, ordered by reversibility:

1. **Soft pause** — set `output.max_prs_per_run: 0` in
   [`sources.yml`](./sources.yml). The agent still runs and posts the
   digest, but opens no PRs.
2. **Schedule pause** — `devin schedule pause arch-doc-refresh`. The
   schedule stops firing; manual runs still work.
3. **Schedule delete** — `devin schedule delete arch-doc-refresh`.
   Full disable; will need re-activation.

## Observability

- **Each run** posts to `#project-cli-generator` whether or not it
  found anything. Three consecutive empty runs trigger a louder alert
  (configured in [`sources.yml`](./sources.yml) under `failure.alert_on_consecutive_empty_runs`).
- **Each run** updates the `<!-- last-run: <ISO> -->` marker at the
  bottom of [`../CHANGELOG-ARCH.md`](../CHANGELOG-ARCH.md). Use
  `git blame` on that line to see the run history.
- **Each run** opens its PR with the branch prefix `arch-doc-refresh/`
  — `gh pr list --search 'head:arch-doc-refresh/'` shows the history.

## Trust model

The agent is empowered to **propose** doc changes, never to make
architectural decisions. It cites every claim. It does not edit code,
configs, or workflows. The PR is always a draft and never
auto-merged.

The human review step is where:
- Hallucinated decisions get caught (no citation = no claim, so this
  should be rare, but adversarial sanity-checking remains).
- Stale context gets corrected (the agent doesn't know that "we
  decided last Thursday to drop X" unless someone said so in
  Slack/Notion/Linear).
- The team's editorial voice gets preserved (the agent's prose
  defaults to a specific shape — humans can rewrite freely).

## Relationship to the bootstrap

The bootstrap of `docs/architecture/` (everything outside this
subdirectory) was authored by hand from `AGENTS.md`, existing ADRs,
Linear, and commit history. The agent picks up from there — its job
is to keep the bootstrap fresh, not to redo it. If the bootstrap is
materially wrong, fix it directly in a human-authored PR; don't wait
for the agent to notice.
