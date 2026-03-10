# Claude Code Plugins Demo — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce 5 committed artifacts on branch `jsklan/claude-demo` that demonstrate Claude Code plugins working on the fern repo — each artifact is a demo segment for a lunch & learn presentation.

**Architecture:** Each task runs a plugin or creates an artifact, then commits the result. Tasks are independent and can run in parallel (except the final commit task). The playground task requires building a self-contained HTML file.

**Tech Stack:** Claude Code plugins (claude-code-setup, claude-md-management, hookify, playground), HTML/CSS/JS for playground

**Design Spec:** `docs/superpowers/specs/2026-03-10-claude-code-plugins-demo-design.md`

**Prerequisites:** Branch `jsklan/claude-demo` must exist and be checked out. Run `mkdir -p docs/superpowers/artifacts/` before any artifact tasks.

---

## Chunk 1: Plugin Artifacts

### Task 1: Commit the Plan & Design Docs

These documents are the "superpowers" demo artifact — proof that the presentation was planned using the brainstorming and writing-plans skills.

**Files:**
- Already created: `docs/superpowers/specs/2026-03-10-claude-code-plugins-demo-design.md`
- Already created: `docs/superpowers/plans/2026-03-10-claude-code-plugins-demo.md`

- [ ] **Step 1: Stage and commit the plan and design docs**

```bash
git add docs/superpowers/specs/2026-03-10-claude-code-plugins-demo-design.md \
        docs/superpowers/plans/2026-03-10-claude-code-plugins-demo.md
git commit -m "chore(internal): add presentation plan and design docs

Artifact for superpowers plugin demo — this presentation was
planned using brainstorming and writing-plans skills.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Run claude-code-setup Automation Recommender

Run the `/claude-code-setup:claude-automation-recommender` skill against the fern repo. This analyzes the codebase and recommends hooks, subagents, skills, and MCP servers.

**Files:**
- Create: `docs/superpowers/artifacts/claude-code-setup-recommendations.md` (output from the plugin)

- [ ] **Step 1: Run the automation recommender**

Invoke the skill: `/claude-code-setup:claude-automation-recommender`

The skill will analyze the fern repo and produce recommendations. Save its output to `docs/superpowers/artifacts/claude-code-setup-recommendations.md`.

- [ ] **Step 2: Commit the recommendation report**

```bash
git add docs/superpowers/artifacts/claude-code-setup-recommendations.md
git commit -m "chore(internal): add claude-code-setup automation recommendations

Artifact for claude-code-setup plugin demo — shows what automations
the recommender suggests for the fern monorepo.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Run claude-md-management Auditor

Run the `/claude-md-management:claude-md-improver` skill to audit fern's CLAUDE.md files.

The repo has 16 CLAUDE.md files across root, packages, and generators.

**Files:**
- Create: `docs/superpowers/artifacts/claude-md-audit-report.md` (output from the plugin)

- [ ] **Step 1: Run the CLAUDE.md auditor**

Invoke the skill: `/claude-md-management:claude-md-improver`

The skill will scan all CLAUDE.md files, evaluate quality, and produce a report. Save its output to `docs/superpowers/artifacts/claude-md-audit-report.md`.

Note: The auditor may suggest improvements. For the demo, we only want the report — do NOT apply changes to CLAUDE.md files.

- [ ] **Step 2: Commit the audit report**

```bash
git add docs/superpowers/artifacts/claude-md-audit-report.md
git commit -m "chore(internal): add CLAUDE.md quality audit report

Artifact for claude-md-management plugin demo — audits all 16
CLAUDE.md files in the fern repo for quality and consistency.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Create Hookify Rule for TypeScript `any` Prevention

Create a hookify rule that prevents Claude from writing TypeScript code containing `any`. This enforces the existing CLAUDE.md rule ("Never use `any`") as an automated hook.

**Files:**
- Modify: `.claude/settings.local.json` (hookify rules are stored here)
- Create: `docs/superpowers/artifacts/hookify-any-prevention-rule.md` (documentation of the rule for the demo)

- [ ] **Step 1: Create the hookify rule**

Invoke: `/hookify:hookify` with instruction: "Create a hook rule that prevents Claude from writing TypeScript code containing the `any` type. This enforces our CLAUDE.md rule: 'Never use `any`. If the type is truly unknown, use `unknown` and narrow it with type guards.'"

- [ ] **Step 2: Document the rule for the demo**

Write `docs/superpowers/artifacts/hookify-any-prevention-rule.md` explaining:
- What the rule does
- The CLAUDE.md rule it enforces
- How it works (PreToolUse hook on Edit/Write tools)
- Example of what it catches

- [ ] **Step 3: Commit the hookify rule and docs**

```bash
git add docs/superpowers/artifacts/hookify-any-prevention-rule.md
git commit -m "chore(internal): add hookify rule for TypeScript any prevention

Artifact for hookify plugin demo — automated enforcement of the
'never use any' rule from CLAUDE.md.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

Note: Do NOT commit `.claude/settings.local.json` — hookify rules are local configuration.

---

## Chunk 2: Playground

### Task 5: Build SDK Generation Flow Playground

Build an interactive HTML playground that visualizes fern's SDK generation pipeline. This is the visual wow moment of the presentation.

**Files:**
- Create: `docs/superpowers/artifacts/sdk-generation-flow-playground.html`

The playground should visualize this flow (from the CLAUDE.md "Production SDK Generation Flow"):

```
API Definition → CLI Version Check → Configuration Discovery → Generator Selection
→ IR Generation → Version Compatibility Check → IR Migration → Generation Execution
→ Output Delivery (registries / GitHub / local)
```

- [ ] **Step 1: Invoke the playground skill**

Invoke: `/playground:playground` with instruction: "Create an interactive playground that visualizes Fern's SDK generation pipeline. The flow has these stages:

1. **API Definition** — User writes Fern definition files or OpenAPI specs
2. **CLI Version Check** — Fern CLI checks `fern.config.json` for required version
3. **Configuration Discovery** — Locates `generators.yml` (single API or multi-API structure)
4. **Generator Selection** — Uses `--group` parameter to pick which generators to run
5. **IR Generation** — Creates Fern IR (Intermediate Representation) containing all API info
6. **Version Compatibility** — Checks generator version against required IR version via `versions.yml`
7. **IR Migration** — If needed, migrates IR backward to match generator's expected version
8. **Generation Execution** — Local (Docker) or Remote (Fiddle service, being deprecated)
9. **Output Delivery** — Package registries (npm, PyPI, Maven), GitHub (release/PR/push), or local filesystem

Make it interactive: users can click through each stage to see details, example config snippets, and how data transforms at each step. Use a horizontal pipeline visualization with clickable nodes. Include real examples from the Fern ecosystem (e.g., `typescript-node-sdk`, `python-sdk`)."

- [ ] **Step 2: Review the playground output**

Open the HTML file in a browser to verify it works. Check:
- All 9 stages are represented
- Clicking each stage shows details
- The visualization is clear and visually appealing
- It works as a standalone file (no external dependencies)

- [ ] **Step 3: Commit the playground**

```bash
git add docs/superpowers/artifacts/sdk-generation-flow-playground.html
git commit -m "chore(internal): add SDK generation flow interactive playground

Artifact for playground plugin demo — interactive visualization of
fern's SDK generation pipeline with clickable stages and real examples.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 3: Final Push

### Task 6: Push All Artifacts to Remote

- [ ] **Step 1: Verify all artifacts are committed**

```bash
git log --oneline jsklan/claude-demo --not main
```

Expected: 5 commits (plan docs, setup recommendations, CLAUDE.md audit, hookify rule, playground)

- [ ] **Step 2: Push to remote**

```bash
git push origin jsklan/claude-demo
```
