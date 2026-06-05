# Architecture-doc refresh playbook

> **Audience.** This is the prompt and methodology for an automated agent
> that keeps [`../ARCHITECTURE.md`](../ARCHITECTURE.md),
> [`../decisions/INDEX.md`](../decisions/INDEX.md), and
> [`../CHANGELOG-ARCH.md`](../CHANGELOG-ARCH.md) in sync with reality. The
> agent is invoked weekly (or on-demand) and opens a draft PR; humans
> review and merge. No auto-merge.
>
> **Runtime.** Currently designed for **Devin scheduled sessions** —
> Devin has authenticated access to GitHub, Linear, Slack, and Notion
> via the fern-api org integrations. The schedule is *not yet active*
> (see [README.md](./README.md) for activation steps). The playbook
> below is runtime-neutral — any model with access to those four
> sources can execute it.

---

## Goal

Each run, surface architectural changes the team made *across all
surfaces* — code, tickets, conversations, documents — and produce a PR
that:

1. Adds or updates entries in [`decisions/INDEX.md`](../decisions/INDEX.md)
   when a load-bearing choice has been made or reversed.
2. Patches sections of [`ARCHITECTURE.md`](../ARCHITECTURE.md) where the
   *shape* of the system has shifted (new building block, removed module,
   new cross-cutting concept).
3. Appends an entry to [`CHANGELOG-ARCH.md`](../CHANGELOG-ARCH.md)
   summarizing the window and listing each architectural change with
   *citation links to every source* (PR, Linear ticket, Slack thread,
   Notion page).
4. Posts a digest to `#project-cli-generator` linking to the PR.

The agent is empowered to **propose** doc changes. It is **not**
empowered to make architectural decisions, close tickets, or modify any
file outside `docs/architecture/`.

---

## Window

- **Default**: from the timestamp recorded at the bottom of
  [`CHANGELOG-ARCH.md`](../CHANGELOG-ARCH.md) as `<!-- last-run: <ISO> -->`
  to *now*. On the first run, fall back to 7 days.
- **Manual override**: invoker may specify a window in the form
  `--since 2026-05-01`. Useful for backfills.

At the end of a successful run, the agent **must** update the
`<!-- last-run: <ISO> -->` marker in `CHANGELOG-ARCH.md` to the current
timestamp.

---

## Sources (read-only)

Configured in [`sources.yml`](./sources.yml). All sources are queried in
parallel.

### 1. GitHub (`fern-api/cli-sdk`)

- **Merged PRs in window**: `gh pr list --state merged --search 'merged:>=<since>'`.
  For each PR, capture: number, title, body, merged-by, files changed,
  commit messages, the linked Linear ticket(s) (regex `FER-\d+` in title
  and body).
- **Closed issues in window**: `gh issue list --state closed --search 'closed:>=<since>'`.
- **Diffstat on architecturally significant paths**: see [the path list
  below](#architecturally-significant-paths).

### 2. Linear (`Fern` team → `[SDKs] CLI Generator` project)

- All tickets that changed status to `Done` in the window.
- All tickets in `In Progress` *that mention or are linked from* a merged
  PR in the window.
- For each ticket, pull: title, description, priority, status, assignee,
  attached PRs, comment thread.

### 3. Slack (auto-discovered)

For every `FER-\d+` ID found in the GitHub / Linear data above, search
the Slack workspace for messages mentioning that ID. Include 5 messages
of surrounding context in each matching thread. The matching channels
become the *Slack source set* for this run — no hand-curated channel
list is required.

If a thread spans multiple matches, dedupe by thread URL.

Special channels to always include:
- `#project-cli-generator` (project channel; the summary goes here too)
- Any channel whose name matches `^(fern-)?cli` or `^(cli-)?sdk`

### 4. Notion

For every `FER-\d+` ID, search Notion for pages mentioning it. Also
search for pages tagged with the `cli-sdk` keyword or linked from any
of the Linear tickets in the window.

For each matching page, pull the *current* content (not historical
versions) and the `last_edited_time` metadata.

---

## Methodology

### Step 1: Collect

Run the four source queries in parallel. Time-box each to 60s; if a
source fails or times out, continue with a `[source: <name>] unavailable`
note in the final PR — *never block the run on a flaky source*.

### Step 2: Cross-reference

For each merged PR in the window, assemble a **change packet**:

```
Change packet:
  PR:        #<num> — <title>
  Linear:    FER-<id> — <title> + status
  Slack:     <threads mentioning FER-<id>>
  Notion:    <pages mentioning FER-<id>>
  Files:     <architecturally significant files changed>
```

Group orphan source records (Slack threads or Notion pages with no
corresponding merged PR) under `## Out-of-band signals`. These often
mark decisions made *before* code lands or *outside* this repo
(e.g., "we decided to deprecate X in a meeting") and are exactly the
class of decision a code-only agent would miss.

### Step 3: Classify each change packet

For each change packet, decide one of:

| Class | Action |
|---|---|
| **Shape change** | Affects `ARCHITECTURE.md` §3 (context), §5 (building blocks), or §6 (runtime view). Propose a patch. |
| **Cross-cutting concept change** | Affects `ARCHITECTURE.md` §8. Propose a patch. |
| **New formal ADR opportunity** | A load-bearing reversible decision has been made. Propose a new row in `decisions/INDEX.md` under "Implicit decisions" with provenance, and flag it as a candidate for promotion. |
| **Risk surface change** | Affects `ARCHITECTURE.md` §11. Propose a patch. |
| **No architectural impact** | Skip. Do not list in the PR. (Counted in the Slack digest as "N PRs with no arch impact".) |

### Step 4: Compose the PR

The PR contains exactly these changes:

1. Patches to `docs/architecture/*.md` (no other file paths).
2. A new entry in `docs/architecture/CHANGELOG-ARCH.md` under
   `## [Unreleased]` (or under a date heading if the human approved a
   freeze).
3. Updated `<!-- last-run: ... -->` marker.

**Citation requirement.** Every claim in the PR must link to its source.
No claim without at least one of:
- a merged PR URL
- a Linear ticket URL
- a Slack thread permalink
- a Notion page URL

If a claim depends on multiple sources, link all of them.

### Step 5: Slack digest

After the PR is opened, post to `#project-cli-generator`:

```
🏗️ Weekly architecture digest — <since> to <now>

📦 <N> merged PRs · <M> with architectural impact
🎯 <K> new implicit decisions surfaced
🔄 <R> reversals or revisions to existing entries
👻 <O> out-of-band signals (Slack/Notion without a matching PR)

PR: <github-url>
```

Keep the digest short — the PR is the destination, the Slack post is
just the notification.

---

## Architecturally significant paths

When deciding if a PR has architectural impact, give extra weight to
diffs in these paths. (This is a heuristic — a PR that touches *only*
peripheral code can still be architecturally significant if the
accompanying Slack/Notion/Linear signal says so.)

```
src/lib.rs
src/openapi/app.rs
src/openapi/parser.rs
src/openapi/discovery.rs
src/openapi/executor.rs
src/openapi/overlay.rs
src/openapi/commands.rs
src/graphql/app.rs
src/graphql/parser.rs
src/graphql/discovery.rs
src/graphql/executor.rs
src/graphql/commands.rs
src/auth/provider.rs
src/auth/credential.rs
src/auth/compose.rs
src/auth/oauth2.rs
src/http.rs
src/websocket/**
src/formatter.rs
src/validate.rs
src/error.rs
src/custom_commands.rs
src/early_intercept.rs
Cargo.toml
docs/adr/**
```

When this list needs updates (new module, removed module), it's a
candidate change itself — surface it in the PR.

---

## Quality gates and failure modes

### The agent MUST

- Cite every claim. No source = no claim.
- Stay inside `docs/architecture/**`. Never edit code, `Cargo.toml`,
  workflows, or any file elsewhere in the repo.
- Open the PR as **draft**. Never use `--auto-merge`.
- Update the `<!-- last-run: ... -->` marker before exiting.
- Distinguish *decisions* from *features*. Adding `x-fern-foo` extension
  support is a feature; deciding *not* to share extension parsing
  across protocol paths is a decision. The agent's job is to surface
  decisions.

### The agent MUST NOT

- Open more than one PR per run. If there's too much for one PR,
  prioritize the highest-priority Linear tickets and leave a `## TODO
  for next run` section in the PR body.
- Make architectural claims that aren't supported by at least one
  cited source.
- Modify or rewrite existing ADRs in `docs/adr/`. New ADRs are a
  human-authored act; the agent only proposes "promote D-X to ADR" in
  `decisions/INDEX.md`.
- Touch the bootstrap-era implicit decisions (D-A through D-P) except
  to add `**Promoted to ADR-NNNN**` notes when a human has promoted
  one, or to add reversal notes when the team has reversed one.

### Recoverable failures

- A source times out → note it, continue.
- The branch already exists from a prior failed run → push to it
  (`git push --force-with-lease`) and reopen the PR if needed.
- No architectural changes detected → still open a PR with just the
  `<!-- last-run: ... -->` bump and a `### No architectural changes in
  window` note in `CHANGELOG-ARCH.md`. (This is intentional: it gives
  the team a heartbeat that the agent ran and saw nothing.)

### Hard failures (stop and alert)

- GitHub auth failure → post `❌ arch-doc-refresh failed: auth` to
  `#project-cli-generator`, exit non-zero.
- Multiple consecutive runs find no signal across all four sources →
  the watch window is probably wrong; alert and ask a human.
- A claim cannot be cited → drop the claim. Do not invent a citation.

---

## Prompt template (for the model running this playbook)

The text below is what the model sees. Variables in `{{double-braces}}`
are substituted at invocation.

````markdown
You are the architecture-doc refresh agent for `fern-api/cli-sdk`.

## Current state of the docs

<!-- contents of docs/architecture/ARCHITECTURE.md -->
<!-- contents of docs/architecture/decisions/INDEX.md -->
<!-- contents of docs/architecture/CHANGELOG-ARCH.md -->

## Window

From: {{since-iso}}
To:   {{now-iso}}

## Source data

### GitHub merged PRs
{{github-prs}}

### Linear tickets
{{linear-tickets}}

### Slack threads (matched on FER-* IDs from above)
{{slack-threads}}

### Notion pages (matched on FER-* IDs or cli-sdk tag)
{{notion-pages}}

## Your task

Follow the methodology in `docs/architecture/automation/PLAYBOOK.md`,
specifically Steps 2–4. Output:

1. A unified diff against `docs/architecture/**` only.
2. A Slack digest in the exact format under §"Slack digest".
3. A list of `## TODO for next run` items if anything didn't fit.

Constraints:
- Every claim must cite at least one source URL.
- Stay inside `docs/architecture/**`.
- Open the PR as draft.
- Update the `<!-- last-run: -->` marker.
````

---

## How to invoke manually

```bash
# Via Devin (once the playbook is uploaded — see README.md):
devin run --playbook arch-doc-refresh --since 2026-05-13

# Locally (using Claude Code), for testing:
claude --resume-session arch-doc-refresh --since 2026-05-13
```

Manual runs are useful for backfills, after major incidents, or before
a release.

---

## How to edit this playbook

Open a PR that modifies this file. CODEOWNERS (if/when configured)
should require an architecture owner's review. The Devin schedule
will pick up the new playbook on its next run — no schedule restart
needed because the schedule references the repo path, not a frozen
snapshot.
