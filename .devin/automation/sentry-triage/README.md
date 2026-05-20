# .devin/automation/sentry-triage

- **Skill:** [`SKILL.md`](SKILL.md) — parent workflow (fetch, group, dedupe, spawn subagents, reconcile)
- **Subagent contract:** [`SUBAGENT_CONTRACT.md`](SUBAGENT_CONTRACT.md) — per-group parallel worker rules (self-contained; subagents do not read `SKILL.md`)
- **Principles:** [`DESIGN_CHOICES.md`](DESIGN_CHOICES.md) — general classification principles (not solutions)
- **State:** `ledger/<SHORT_ID>.json` (one file per issue, plus `ledger/_meta.json` for constants) — per-file layout avoids merge conflicts when parallel subagents update different rows
- **Scripts:** [`scripts/find-existing-pr.sh`](scripts/find-existing-pr.sh) — deterministic existing-PR lookup
