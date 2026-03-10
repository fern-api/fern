# Claude Code Plugins Demo — Design Spec

**Date**: 2026-03-10
**Format**: Lunch & Learn, 30-45 min
**Repo**: fern (company main repo)
**Branch**: `jsklan/claude-demo`

## Concept

"Claude Code Plugins: Tools That Improve Themselves" — a meta-demo where the presentation itself is an artifact of the plugins being demonstrated. Every demo produces something real and useful for the fern repo.

## Audience

Mixed: some daily Claude Code users who haven't explored plugins, some who have heard of it but haven't gone deep.

## Presentation Flow

| # | Segment | Plugin | Time | Format | Artifact |
|---|---------|--------|------|--------|----------|
| 1 | Intro to Plugins | — | 5 min | Slides/talk (planned separately) | — |
| 2 | "I planned this talk with plugins" | superpowers | 2 min | Walk through committed plan doc | This plan doc |
| 3 | "What automations should fern have?" | claude-code-setup | 5 min | Pre-run, walk through report | Recommendation report |
| 4 | "Are our CLAUDE.md files any good?" | claude-md-management | 5 min | Pre-run, walk through report | Quality audit report |
| 5 | "Enforce our rules automatically" | hookify | 5 min | Live demo — create `any` prevention hook | Hookify rule |
| 6 | "See our architecture" | playground | 7 min | Live demo — build SDK generation flow visualizer | Interactive HTML file |
| 7 | Mentions & Wrap-up | skill-creator, plugin-dev, claude-code-guide | 3 min | Talk | — |
| 8 | Q&A / Hands-on | — | 5-10 min | Interactive | — |

## Demo Details

### Demo 1: claude-code-setup (Automation Recommender)

Run the automation recommender against fern. It analyzes the repo and recommends hooks, subagents, skills, and MCP servers. Fern is a massive monorepo — there are likely real automation gaps. The recommendations become actionable items for the team.

**Format**: Pre-run, walk through report during presentation.

### Demo 2: claude-md-management (CLAUDE.md Auditor)

Run the CLAUDE.md improver/auditor against fern. We have 7+ CLAUDE.md files across the repo (root + generator-specific). The audit checks consistency, completeness, and best practices.

**Format**: Pre-run, walk through report during presentation.

### Demo 3: hookify (TypeScript `any` Prevention)

Create a hookify rule that prevents Claude from writing TypeScript `any` — enforcing the existing CLAUDE.md rule automatically rather than relying on Claude "remembering."

**Format**: Live demo during presentation.

### Demo 4: playground (SDK Generation Flow)

Build an interactive HTML playground that visualizes the SDK generation pipeline: API definition → IR generation → version compatibility → IR migration → generation execution → output delivery. Users can step through each stage.

**Format**: Live demo during presentation. The visual output is the wow moment.

### Talking Points (not live demos)

- **superpowers** — "This plan doc you're seeing was created using the brainstorming and writing-plans skills"
- **skill-creator** — "You can build custom skills for your own workflows"
- **claude-code-guide** — "Ask Claude Code questions about itself"
- **plugin-dev** — "You can build your own plugins"

## Artifacts Produced in This Session

1. This design/plan document (superpowers artifact)
2. Automation recommendation report (claude-code-setup)
3. CLAUDE.md quality audit report (claude-md-management)
4. Hookify rule for `any` prevention (hookify)
5. SDK generation flow interactive playground (playground)

## Narrative Thread

Each demo answers: "What if Claude Code could improve how you use Claude Code?" — plugins that audit your setup, enforce your rules, and visualize your architecture.
