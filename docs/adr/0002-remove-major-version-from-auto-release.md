# ADR 0002: Remove Major Version Bumps from Automated Release Flow

## Status

Accepted — merged [#15685](https://github.com/fern-api/fern/pull/15685) on 2026-05-06.

## Context

ADR 0001 established a unified release system where changelog entry `type` determines the version bump automatically: `fix`/`chore` → patch, `feat`/`internal` → minor, `break` → major. This worked as designed but created a dangerous footgun: any engineer merging a PR with a `type: break` changelog entry would silently trigger a major version release for that component.

This surfaced as an incident in [#15583](https://github.com/fern-api/fern/pull/15583): a `break` entry for the CLI removal of `og:background-image` caused the automated system to cut CLI v5.0.0 without any explicit human acknowledgment that a major release was happening. Major version bumps for a widely-used CLI and SDK generators are customer-visible breaking events — they break pinned installs, require migration guides, and should never happen as a side-effect of a routine changelog entry.

The root problem: major releases carry a different weight than patch or minor releases. They require deliberate human intent, not just a correctly-typed changelog entry.

## Decision

Remove `break` as a valid changelog entry type. The automated release flow can now only produce patch or minor bumps. Major releases require a direct edit to the relevant `versions.yml` file, making the major bump an explicit, reviewable code change rather than a computed side-effect.

### Changes

- **`fern-changes-yml.schema.json`**: `break` dropped from the `ChangelogType` enum. IDE autocompletion and validation no longer suggest it.
- **`scripts/release.ts`**: `break` removed from `VALID_CHANGELOG_TYPES`, `getSeverityFromType`, `ChangelogEntry`, and `Severity`. The runtime parser rejects `type: break` with a clear error: `Invalid "type" field: "break". Expected one of: fix, chore, feat, internal`.
- **`packages/seed/src/commands/validate/validateStagedChanges.ts`**: `seed validate` now fails if any file in `changes/unreleased/` has `type: break`, catching it before the release script runs.
- **All `.template.yml` files** (CLI + 10 generators): `break (major)` removed from the type comment; a note added explaining that majors require a manual `versions.yml` edit.
- **`.claude/release-versioning.md`**: documentation updated to remove `break` and explain the manual major release path.

Historical changelog files that already contain `type: break` (e.g., entries under `changes/5.0.0/`) are left unchanged — they are already shipped and recorded in `versions.yml`.

### How to ship a major release now

Edit the relevant `versions.yml` directly to set the next version to the intended major (e.g., `6.0.0`). The diff in the PR makes the major bump explicit and reviewable by teammates and the release on-call.

## Alternatives Considered

**Require an explicit confirmation flag on `break` entries** — e.g., `confirm-major: true` alongside `type: break`. Rejected because it adds friction without adding safety: anyone can write the flag without understanding the implications, and the automation still fires automatically on merge. It does not change the fundamental problem that the major bump is a side-effect rather than an intentional act.

**Require a separate approval step in the release workflow for major bumps** — add a manual CI gate (GitHub environment protection rule or a `workflow_dispatch` approval) before pushing a major release. Rejected as operationally complex: it would require configuring environment secrets per component, adds async latency to the release, and is hard to audit. A `versions.yml` edit achieves the same gate with zero infrastructure.

**Keep `break` but send an alert/notification before releasing** — notify a Slack channel or require an issue to be filed before proceeding. Rejected because notifications are easy to miss and don't prevent the release from proceeding. Hard enforcement (rejecting the changelog entry) is strictly safer.

**Rate-limit major releases** (e.g., only allow one per calendar quarter) — Rejected as overly prescriptive. The goal is explicit acknowledgment, not frequency control.

## Consequences

- **Major releases are now always intentional**: the only path to a major version bump is a `versions.yml` edit that appears in a PR diff, making the decision visible and reviewable.
- **`break` entries in historical changelogs remain valid**: the validator only rejects files in `changes/unreleased/`, so the released history is untouched.
- **Authors lose a changelog type**: engineers writing truly breaking changes must either use `feat` (if the bump should be minor) or open a separate PR that manually bumps `versions.yml`. The template files explain this.
- **`seed validate` is now the enforcement point**: the check lives in the validator so it fires in CI before any release logic runs. A misconfigured or skipped validator could let a `break` entry reach the release script, where it is also rejected — two layers of defense.
- **The original v5.0.0 incident cannot recur**: there is no code path from a changelog entry to a major version bump.
