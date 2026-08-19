# ADR 0001: Unified Release Management System

## Status

Accepted — merged [#12149](https://github.com/fern-api/fern/pull/12149) on 2025-11-15.
Partially superseded by [ADR 0002](./0002-remove-major-version-from-auto-release.md): `break` type and major version bumps were removed from the automated flow.

## Context

The Fern monorepo hosts many independently-versioned software components (CLI, TypeScript SDK generator, Python SDK generator, etc.), each with its own `versions.yml`, changelog workflow, and CI validation. Over time this produced:

- Separate, bespoke CI workflows per component (`cli-release.yml`, `validate-changelog.yml`, etc.) that diverged in behavior
- Manual severity fields on changelog entries that were easy to get wrong and inconsistent
- No standard way to onboard a new component into the release system — each addition required copying and adapting existing scripts
- Release commits hardcoded to `main`, making break-glass releases from other branches impossible
- Changelog validation scattered across per-component scripts with no shared logic

The goal was a single, consistent release system that works for any component in the monorepo without per-component customization.

## Decision

Implement a TypeScript-based unified release system with a central registry:

- **`release-config.json`** — central registry mapping short identifiers (e.g., `cli`, `python-sdk`) to full component metadata (name, path to `versions.yml`, changelog folder, software directory). All CI workflows read from this file dynamically so adding a new component requires only a single config entry.

- **`pnpm release <software>`** — single entry point that routes to interactive setup (for new components) or the release workflow (for existing ones). Setup prompts for config values and creates the changelog directory structure including a `.template.yml` with a dynamic `$schema` pointer.

- **Type-derived version bumps** — changelog entries declare a `type` (`fix`, `chore`, `feat`, `internal`, `break`). Severity is computed automatically: `fix`/`chore` → patch, `feat`/`internal` → minor, `break` → major. The manual `severity` field is eliminated.

- **Branch-agnostic release script** — `release.ts` detects the current branch via `git rev-parse --abbrev-ref HEAD` rather than hardcoding `main`. The CI workflow (`release-software.yml`) controls which branch is checked out, keeping the script reusable for break-glass releases via `workflow_dispatch`.

- **Unified CI validation** — a single `validate-changelogs.yml` workflow reads `release-config.json` to discover all components, then checks only the components whose files appear in the PR diff. This replaces the per-component validation scripts.

- **Loop prevention** — `release-software.yml` matches commit subjects against `^chore\(.+\): release .+` to skip triggering on the release commits themselves, avoiding infinite CI loops.

### Key files

| File | Purpose |
|------|---------|
| `release-config.json` | Component registry |
| `release-config.schema.json` | JSON schema for IDE validation of the registry |
| `fern-changes-yml.schema.json` | JSON schema for changelog entry files |
| `scripts/release.ts` | Main entry point |
| `scripts/release-setup.ts` | Interactive setup for new components |
| `scripts/release-config.ts` | Shared config load/save utilities |
| `scripts/release-workflow.ts` | Non-interactive batch release for CI |
| `scripts/validate-changelogs.ts` | PR changelog validation |
| `.github/workflows/validate-changelogs.yml` | Unified PR validation |
| `.github/workflows/release-software.yml` | Auto-release on merge to main |

## Alternatives Considered

**Keep per-component scripts and workflows** — Rejected. Every new component (e.g., a new language SDK) would require copying and adapting 3–4 files. Divergence was already visible between the CLI workflow and prototype generator workflows; adding more components would multiply the maintenance burden.

**Use an existing release tool (semantic-release, changesets, release-please)** — Considered but rejected. The monorepo has an existing `versions.yml`-based convention tied to Fern's own changelog format and IR version compatibility checks. Adopting an external tool would require migrating all components off that convention or maintaining two parallel systems. The bespoke system is ~500 LOC and fits the existing conventions exactly.

**Store severity explicitly on changelog entries** — The original design required authors to write `severity: minor` alongside `type: feat`. Rejected because type already determines severity unambiguously, making the field redundant. Authors were regularly inconsistent (writing `type: feat, severity: patch`), and the duplication was a source of confusion. Auto-deriving severity from type removes the class of errors entirely.

**Hardcode branch to `main` in the release script** — The original implementation checked out `main` unconditionally. Rejected in favor of detecting the current branch so that the CI workflow controls the target branch. This allows future `workflow_dispatch`-triggered releases from non-main branches without changing the script.

## Consequences

- **Adding a new component to the release system** is now a single `pnpm release <new-component>` invocation that writes a config entry and creates the changelog directory — no CI workflow changes needed.
- **Changelog entries are simpler** — authors write only `summary` and `type`; severity is derived automatically.
- **`validate-changelogs.yml` now runs `pnpm install`** on every PR, adding latency to changelog validation. Mitigated by Turbo's caching, but a path filter could be added if it becomes a bottleneck.
- **Release loop prevention relies on commit subject regex** — if a release commit subject drifts from `^chore\(.+\): release .+`, the workflow could trigger itself. This is detectable and low-risk but worth monitoring.
- **`ACTIONS_PAT` secret must have main-branch bypass** — the release script pushes directly to main. If the secret is misconfigured, releases will fail silently at the push step.
- **No automated tests for `validateChangelogEntry()`** — the runtime validation logic has no unit tests. Edge cases (missing fields, invalid types) should be covered before this becomes the sole gating mechanism.
