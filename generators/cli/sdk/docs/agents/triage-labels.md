# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.

## Devin handoff

When AFK execution is the next step, hand off to Devin. **Prefer the `devin` CLI when `DEVIN_API_KEY` is set** (scopes the session to the user's own Devin dashboard; better observed performance); otherwise fall back to applying one of the synced `Devin Playbooks` macro labels in Linear. See `docs/agents/issue-tracker.md` for the CLI vs. label decision and the exact commands. Mapping from canonical role to Devin macro (the label fallback):

| Canonical role | Devin macro to apply | Notes |
| --- | --- | --- |
| `needs-triage` | `!triage` | Devin does the initial investigation and asks clarifying questions. Cheaper than human triage for unknown code areas. |
| `ready-for-agent` | `!implement` _or_ `!linear_plan_w_implement` | Use `!implement` when the issue body already contains a plan. Use `!linear_plan_w_implement` when you want Devin to plan and execute in one autonomous run. |
| `ready-for-human` | (none) | Human work; do not assign to Devin. |
| `needs-info` | (none) | Waiting on reporter; no agent action. |
| `wontfix` | (none) | Closed; no agent action. |

The intermediate `!plan` macro (Devin produces a plan without writing code) isn't tied to a canonical role — apply it ad-hoc when you want to review an approach before moving an issue to `ready-for-agent`.

See `docs/agents/issue-tracker.md` for the full macro reference.
