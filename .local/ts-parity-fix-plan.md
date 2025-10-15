# Implementation Plan: Fix Local vs Remote TypeScript Generation Parity

## Root Cause Analysis

After examining both the Fiddle server code and CLI local generation, the issue is **NOT** missing schema fields, but rather incomplete population of existing fields during local generation config construction.

**Key Finding**: The `GeneratorConfig.output.mode.registriesV2.npm` field already exists and contains all needed npm package metadata (`packageName`, `registryUrl`, `token`), but local generation doesn't populate it correctly.

## Proposed Solution

### 1. **Primary Fix: Enhance CLI Local Generation Config Construction**

**Target File**: `packages/cli/generation/local-generation/local-workspace-runner/src/getGeneratorConfig.ts`

**Changes Needed**:
- Enhance `getGithubPublishConfig()` function (lines 104-163) to properly extract npm package information from `generators.yml`
- Modify `newDummyPublishOutputConfig()` function to populate `registriesV2.npm` field
- Extract package name from `publishInfo.packageName` when available
- Use proper version extraction from output mode configuration

**Implementation Steps**:
1. Update `getGithubPublishConfig()` to handle npm configuration extraction
2. Ensure the extracted npm config flows through to the final `GeneratorConfig`
3. Add proper fallback logic for missing configuration data
4. Ensure version information is properly extracted and propagated

### 2. **Secondary Fix: Improve TypeScript Generator's Config Extraction**

**Target File**: `generators/typescript/utils/abstract-generator-cli/src/constructNpmPackage.ts`

**Changes Needed**:
- Fix the order of precedence for package name extraction
- Improve version resolution logic
- Remove project-specific hardcoded fallbacks
- Standardize repository URL format handling

**Implementation Steps**:
1. Prioritize `outputMode.registriesV2?.npm?.packageName` over fallbacks
2. Extract version from `outputMode.registriesV2?.npm` or proper config locations
3. Ensure repository URL format consistency (`github:owner/repo`)
4. Remove Anduril-specific hardcoded values

### 3. **Verification and Testing**

**Testing Strategy**:
1. Compare local vs remote generation output for the lattice-sdk-javascript project
2. Verify package.json metadata matches exactly between branches
3. Ensure README.md contains proper package name references
4. Confirm LICENSE file handling works correctly

**Success Criteria**:
- Local generation produces identical package.json as remote generation
- README.md has proper package names and installation instructions
- Repository URLs use consistent `github:owner/repo` format
- LICENSE files are included correctly

## Expected Outcome

This approach fixes the issue at the **configuration level** rather than adding generator workarounds, ensuring true local/remote parity. The TypeScript generator will receive the same rich configuration data in both scenarios, eliminating the need for fallback logic and hardcoded values.

## Implementation Priority

1. **High Priority**: CLI config construction fixes (enables proper data flow)
2. **Medium Priority**: TypeScript generator improvements (handles edge cases)
3. **Low Priority**: Testing and verification (ensures completeness)

This solution maintains backward compatibility while fixing the root cause of the local/remote generation discrepancies.

## Key Insights from Research

### Fiddle Server Architecture (How Remote Generation Works)

**Remote generation success comes from Fiddle's sophisticated configuration processing:**

1. **`RegistryConfigFactory.getNpmRegistryConfigV2()`**: Extracts npm configuration from generator output mode and creates complete `NpmRegistryConfigV2` objects
2. **`GeneratorExecConfigFactory.create()`**: Builds rich `GeneratorPublishConfig` with populated `registriesV2.npm` field containing `packageName`, `registryUrl`, and `token`
3. **Complete Data Flow**: All npm package metadata flows through the standard schema to generators

**Key Finding**: The schema already supports everything needed - the issue is incomplete population during local config construction.

### Local Generation Gap

**Local generation fails because:**
1. CLI's `getGeneratorConfig.ts` doesn't populate `registriesV2.npm` field properly
2. The `newDummyPublishOutputConfig()` function creates incomplete configurations
3. npm package information from `generators.yml` doesn't flow through to the final config

### The Current Workaround Analysis

**The existing `constructNpmPackage` function was a tactical fix to work around the CLI config gap:**
- Tries to reconstruct npm package info from incomplete generator configs
- Contains hardcoded fallbacks for specific projects
- Handles inconsistent repository URL formats
- **Problem**: Addresses symptoms rather than root cause

## Technical Details

### Schema Structure (Already Complete)
```typescript
GeneratorConfig {
  output: {
    mode: {
      type: "publish" | "github" | "downloadFiles"
      registriesV2: {
        npm: {
          packageName: string    // ✅ Field exists
          registryUrl: string    // ✅ Field exists
          token: string          // ✅ Field exists
        }
      }
    }
  }
}
```

### Fiddle vs Local Data Flow

**Remote (Fiddle)**:
`generators.yml` → `GeneratorConfigV2` → `RegistryConfigFactory` → `GeneratorPublishConfig.registriesV2.npm` → Generator

**Local (CLI)**:
`generators.yml` → `GeneratorInvocation` → `getGeneratorConfig()` → `GeneratorConfig` (incomplete registriesV2) → Generator

### Fix Strategy

Instead of generator-level workarounds, fix the CLI's local config construction to match Fiddle's approach:
1. Extract npm configuration from `generators.yml` properly
2. Populate `registriesV2.npm` field completely
3. Ensure version and repository information flows through correctly
4. Remove generator-level fallback logic since data will be complete