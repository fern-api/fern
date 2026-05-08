# IR SDK Package

This file provides guidance for Claude Code when working with the Intermediate Representation (IR) SDK package.

## Overview

The IR SDK is the **central data structure** that all Fern generators consume. It serves as the canonical, normalized representation of an API containing endpoints, models, errors, authentication schemes, versions, and more.

## Architecture

- **TypeScript-based**: Generated TypeScript SDK from Fern definitions
- **Versioned Schema**: 60+ IR versions with backward compatibility
- **Generator Input**: All generators consume IR as their input format
- **Auto-generated**: Code is generated from Fern API definitions, not hand-written

## Key Directories

### packages/ir-sdk/
- `fern/apis/` - IR version definitions (ir-types-v1 through ir-types-latest)
- `src/` - Generated TypeScript SDK code
- `lib/` - Compiled JavaScript output
- `package.json` - Contains `pnpm generate` script for IR regeneration

### IR Version Structure
- `fern/apis/ir-types-latest/` - Current development version
- `fern/apis/ir-types-v58/` - Specific version (example)
- Each version contains complete Fern API definition for that IR schema

## IR Versioning System

### Version Management
- **Latest**: `ir-types-latest` contains the current development schema
- **Numbered Versions**: v1, v2, ..., v58, v59, v60 (frozen, immutable)
- **Generator Compatibility**: Each generator specifies required IR version in `versions.yml`
- **Backward Migration**: CLI migrates newer IR to older versions as needed

### Common Version Workflow
1. **Schema Changes**: Modify `ir-types-latest` definition
2. **Generate SDK**: Run `pnpm generate` to update TypeScript types
3. **Version Increment**: When ready for release, freeze current latest as new numbered version
4. **Migration Support**: Add backward migration in `/packages/cli/generation/ir-migrations/`

## Development Commands

### IR SDK Development
```bash
cd packages/ir-sdk
pnpm generate                 # Regenerate TypeScript SDK from Fern definitions
pnpm compile                  # Compile TypeScript to JavaScript
pnpm test                     # Run IR SDK tests
```

### IR Schema Modification
```bash
# After modifying fern/apis/ir-types-latest/definition/
pnpm ir:generate              # From repository root - regenerates IR SDK
pnpm compile                  # Recompile to check for breaking changes
```

## Common Issues & Debugging

### Schema Evolution Issues
- **Breaking Changes**: Adding required fields breaks older generators
- **Field Removal**: Can't remove fields due to backward compatibility
- **Type Changes**: Changing field types requires careful migration
- **Enum Values**: Adding enum values is safe, removing requires migration

### Version Compatibility Issues
- **Generator Mismatch**: Generator expects older IR version than provided
- **Migration Failures**: IR migration logic fails for specific patterns
- **New Field Access**: Older generators can't access newly added fields
- **Circular References**: Complex type relationships can cause issues

### Common Debugging Steps
1. **Check Generator Versions**: Verify required IR version in `generators/<lang>/sdk/versions.yml`
2. **Test Migrations**: Ensure IR can migrate from latest to target version
3. **Validate Schema**: Check Fern definitions compile successfully
4. **Cross-Generator Testing**: Test changes across multiple generator types

## IR Structure Patterns

### Core Components
- **Types**: Models, unions, enums, aliases
- **Services**: HTTP endpoints with requests/responses
- **Errors**: Error types and HTTP error codes
- **Auth**: Authentication schemes (bearer, basic, etc.)
- **Variables**: Environment and template variables
- **Docs**: Documentation and examples

### Type System
- **Primitives**: string, integer, double, boolean, datetime, uuid
- **Containers**: list, set, map, optional
- **Custom Types**: objects, unions, enums
- **References**: Cross-references between types

## Adding New IR Features

### 1. Schema Definition
```bash
# Edit the latest IR schema
vim packages/ir-sdk/fern/apis/ir-types-latest/definition/
```

### 2. Regenerate SDK
```bash
cd packages/ir-sdk
pnpm generate
```

### 3. Update Consumers
- Fix compilation errors in CLI packages
- Update switch statements for new union cases
- Test generator compatibility

### 4. Bump the IR version (REQUIRED)
**Every PR that modifies `ir-types-latest/definition/` must bump the IR version, otherwise no new IR package is published and consumers can't pick up the change.**

The IR carries its own semver in `packages/ir-sdk/fern/apis/ir-types-latest/VERSION` (currently `MAJOR.MINOR.PATCH`, e.g. `67.2.0`). Pick the bump based on the change:

- **Minor bump** (`67.1.0` → `67.2.0`): additive, backward-compatible changes — new optional fields, new union variants on forward-compatible enums, additive type declarations. This is the common case.
- **Patch bump** (`67.1.0` → `67.1.1`): non-schema fixes (doc-string edits, comment-only changes, internal refactors that don't alter the public type surface).
- **Major bump** (`67.x.x` → `68.0.0`): breaking changes — required-field additions, field removals/renames, type changes, removed enum values. **Major bumps are batched and done as a separate "Update IR to N+1" PR**, not per-feature; they require freezing the previous latest into `ir-types-vN/`, adding a `vN+1-to-vN` migration under `packages/cli/generation/ir-migrations/`, and re-aliasing `IrVersions.ts`.

**Per-PR checklist for additive IR changes:**

1. Edit `packages/ir-sdk/fern/apis/ir-types-latest/definition/<file>.yml`.
2. Run `pnpm ir:generate` from the repo root to regenerate `packages/ir-sdk/src/sdk/...` artifacts.
3. **Bump `packages/ir-sdk/fern/apis/ir-types-latest/VERSION`** (minor for additive, patch for non-schema).
4. **Add an entry to `packages/ir-sdk/fern/apis/ir-types-latest/changelog/CHANGELOG.md`** describing the new field/feature, dated today, under a new `## [vMAJ.MIN.PATCH] - YYYY-MM-DD` heading at the top.
5. Run `pnpm --filter @fern-api/ir-sdk compile` to confirm the workspace types still build.
6. Do **not** edit `packages/cli/cli/versions.yml`'s `irVersion` — that field tracks the IR *major* and is only updated during major-version bumps.
7. Do **not** edit `generators.yml` coordinates (`irV66`, `fern_fern_ir_v66`) — those reference the published external IR major and are stable across minor bumps.

The IR changelog is **hand-edited**, not driven by a `changes/unreleased/` directory like the CLI.

### 5. Add Migrations (only on major bump)
```bash
# Required only when freezing latest into a new numbered version
vim packages/cli/generation/ir-migrations/src/migrations/
```

## Version Release Process

### Per-PR (minor / patch) — see "Adding New IR Features" above
- Bump `packages/ir-sdk/fern/apis/ir-types-latest/VERSION`
- Append entry to `packages/ir-sdk/fern/apis/ir-types-latest/changelog/CHANGELOG.md`
- Release automation publishes a new `@fern-fern/ir-sdk` minor on merge to main

### Major-version bump (batched, separate PR)
1. Freeze current `ir-types-latest` contents into `packages/ir-sdk/fern/apis/ir-types-v{N}/`
2. Set `ir-types-latest/VERSION` to `{N+1}.0.0`
3. Add `packages/cli/generation/ir-migrations/src/migrations/v{N+1}-to-v{N}/` with backward migration logic
4. Re-alias `packages/cli/generation/ir-migrations/src/ir-versions/IrVersions.ts` so `V{N+1} = @fern-api/ir-sdk` and add a frozen `@fern-fern/ir-v{N}-sdk` import
5. Update `packages/cli/cli/versions.yml` `irVersion: {N}` → `{N+1}` for the next CLI release
6. Run full test suite (`pnpm test:ete`) and seed across all generators

## Best Practices

### Schema Design
- **Backward Compatible**: Avoid breaking changes
- **Optional Fields**: New fields should be optional
- **Descriptive Names**: Use clear, unambiguous field names
- **Documentation**: Include examples and descriptions

### Version Strategy
- **Conservative**: Only version when necessary
- **Migration Support**: Always provide migration path
- **Testing**: Thoroughly test across all generators
- **Communication**: Document breaking changes clearly

## Integration Points

### CLI Integration
- `packages/cli/generation/` - IR generation and migration logic
- `packages/cli/workspace/loader/` - Converts API definitions to IR

### Generator Integration
- All generators consume IR via Docker container
- Generator `versions.yml` specifies required IR version
- CLI automatically migrates IR to match generator requirements

### Testing Integration
- `packages/seed/` - Tests generators against IR fixtures
- `/seed/<generator>/<fixture>/` - Contains IR files for testing
