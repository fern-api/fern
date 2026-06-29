# Issue tracker: Linear (system of record) + GitHub (PRs)

Issues for this repo live in **Linear** under the `FER-` prefix (e.g. `FER-10519`). GitHub Issues on `fern-api/cli-sdk` is **not** used as a primary tracker — code review and PRs happen on GitHub, but the canonical ticket lives in Linear.

Commit messages and PR titles reference the Linear ID in the conventional-commits scope: `feat(FER-10519): ...`, `fix(FER-10523): ...`.

## How to interact with Linear

Use the **Linear MCP tools** (`mcp__claude_ai_Linear__*`) — direct access for reads and writes. Common ones:

- `mcp__claude_ai_Linear__get_issue` — fetch one issue by ID
- `mcp__claude_ai_Linear__list_issues` — query (filter by team, project, label, state)
- `mcp__claude_ai_Linear__save_issue` — create or update
- `mcp__claude_ai_Linear__save_comment` — comment on an issue
- `mcp__claude_ai_Linear__list_issue_labels` / `list_issue_statuses` — discover the workspace's vocabulary before applying labels or moving state

If you don't have the Linear MCP server connected, ask the user how they'd like the issue accessed (paste, URL, manual lookup) rather than guessing.

## GitHub's role

- **Pull requests** — opened against `main` with the `FER-XXXX` ID in the title scope. Use `gh pr create`, `gh pr view`, `gh pr comment` as normal.
- **Issues** — generally not used. If GitHub Issues are present, treat them as community/triage inbound; the canonical work item still gets cut in Linear.

## When a skill says "publish to the issue tracker"

Create a Linear issue (via `mcp__claude_ai_Linear__save_issue`). Reference the resulting `FER-XXXX` ID in any follow-up commits or PRs.

## When a skill says "fetch the relevant ticket"

Fetch the Linear issue by ID (e.g. `mcp__claude_ai_Linear__get_issue` with `FER-10519`). The PR description and commit scopes will tell you which ID applies.

## Handing an issue off to Devin

There are two handoff paths. **Prefer the CLI path when credentials are present** — it scopes the session to the user's own Devin account (so it shows up in *their* [session dashboard](https://app.devin.ai), making in-flight work visible), and we've seen better performance dispatching this way. Fall back to the Linear-label path when the relevant credential isn't configured.

### Detecting which path to use

Check for the credential's **presence** only — never read or print the value:

```bash
# Issue handoff (v1 sessions API): use the CLI if this is set
[ -n "${DEVIN_API_KEY:-}" ] && echo "cli" || echo "label"

# PR review (v3 review API): use the CLI if both are set
{ [ -n "${DEVIN_SERVICE_USER_KEY:-}" ] && [ -n "${DEVIN_ORG_ID:-}" ]; } && echo "cli" || echo "label"
```

### Path 1 (preferred): the `devin-api` CLI

The bundled `devin-api` binary (see `src/bin/devin-api/README.md`) talks to the Devin API directly with the user's key.

**Issue handoff** — create a session with the agent brief as the prompt:

```bash
devin-api sessions create-session --json '{
  "prompt": "<the agent brief — issue body + acceptance criteria>",
  "title":  "FER-XXXX: <short summary>"
}'
```

The response includes a `url` for the session. **Post that URL back to the Linear issue** (`mcp__claude_ai_Linear__save_comment`) so the ticket still links to the in-flight work — the CLI path does not auto-link to Linear the way a label does.

**PR review**:

```bash
devin-api review trigger --json '{"pr_url": "https://github.com/owner/repo/pull/<N>"}'
```

### Path 2 (fallback): Linear macro labels

Devin is integrated with this Linear workspace. Hand off by applying a label — no other setup needed. Five macro labels are synced from Devin and available under the `Devin Playbooks` label group:

| Label | What Devin does |
| --- | --- |
| `!triage` | Investigates the code area, summarises the current state, raises edge cases and clarifying questions. Use when an issue is filed but not yet specified. |
| `!plan` | Produces an implementation plan in a Linear comment; does not write code. Use when you want to review the approach before any work. |
| `!implement` | Executes against an existing spec (issue body + comments). Opens a PR. Use when the issue is fully specified. |
| `!linear_plan_w_implement` | Plans and implements in one autonomous run. Use when the issue is AFK-ready and PR review is your only gate. |
| `!review` | Reviews an existing PR. Apply at PR time, not at issue time. |

Plain `devin` label (no macro) runs the default playbook.

After the label is applied, Devin posts back to Linear with a code summary, plan, edge cases/questions, confidence indicator, session link, and (once opened) the PR URL. Its todo list streams into Linear's plan UI in real time.

When a skill produces a fully-specified Linear issue that's AFK-ready, the handoff is to dispatch via the CLI (preferred) or apply `!implement` / `!linear_plan_w_implement`. See `docs/agents/triage-labels.md` for the role-to-macro mapping.
