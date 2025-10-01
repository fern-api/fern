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

### 4. Add Migrations (if breaking)
```bash
# Add migration in CLI package
vim packages/cli/generation/ir-migrations/src/migrations/
```

## Version Release Process

### 1. Prepare Release
- Ensure `ir-types-latest` is stable
- Update `CHANGELOG.md` with changes
- Update `VERSION` file

### 2. Create New Version
- Copy `ir-types-latest` to `ir-types-v{n+1}`
- Update `packages/cli/cli/versions.yml`

### 3. Test Compatibility
- Run full test suite (`pnpm test:ete`)
- Test seed across all generators
- Validate migration logic

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