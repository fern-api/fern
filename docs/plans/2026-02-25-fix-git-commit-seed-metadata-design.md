# Fix Git Commit Metadata in Seed Outputs

**Date**: 2026-02-25
**Status**: Approved
**Problem**: `originGitCommit` shows real commit hashes in seed outputs instead of "DUMMY" like `cliVersion`, causing test instability and duplicate code implementations.

## Problem Statement

The `originGitCommit` feature added to generation metadata shows actual git commit hashes in seed test outputs, while `cliVersion` is correctly normalized to "DUMMY". This causes:

1. **Test Instability**: Seed tests have different outputs on each run due to changing commit hashes
2. **Code Duplication**: Identical `getOriginGitCommit*()` functions exist in local and remote workspace runners
3. **Inconsistent Behavior**: Different treatment of metadata fields in seed vs production

## Current State

- `cliVersion`: Controlled by seed via `"DUMMY"` parameter in `convertSeedWorkspaceToFernWorkspace.ts`
- `originGitCommit`: Set directly via `getOriginGitCommit()` calls in generation pipeline, no seed control

**Duplicate Implementations:**
- `packages/cli/generation/local-generation/local-workspace-runner/src/getOriginGitCommit.ts`
- `getOriginGitCommitHash()` in `packages/cli/generation/remote-generation/remote-workspace-runner/src/runRemoteGenerationForGenerator.ts`

## Solution Design

### Architecture

**Consolidation + Environment Variable Control**

1. **Centralize Function**: Move to `@fern-api/api-workspace-commons` following existing shared utility patterns
2. **Environment Detection**: Check `IGNORE_GIT_IN_METADATA` environment variable
3. **Seed Integration**: Seed sets environment variable before generation

### Implementation Details

#### New Shared Function
```typescript
// packages/commons/api-workspace-commons/src/getOriginGitCommit.ts
export function getOriginGitCommit(): string | undefined {
    if (process.env.IGNORE_GIT_IN_METADATA === "true") {
        return "DUMMY";
    }

    try {
        const commit = execSync("git rev-parse HEAD", {
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"]
        }).trim();

        if (/^[0-9a-f]{40}$/.test(commit)) {
            return commit;
        }
        return undefined;
    } catch {
        return undefined;
    }
}
```

#### Environment Variable
- **Name**: `IGNORE_GIT_IN_METADATA`
- **Value**: `"true"` to return "DUMMY", unset/other for normal behavior
- **Scope**: Set by seed commands before generation

#### Integration Points
- **Import Updates**: Local/remote workspace runners import from commons
- **Seed Commands**: Set environment variable in test/run commands
- **Cleanup**: Remove duplicate implementations

### Testing Strategy

**Unit Tests** (`packages/commons/api-workspace-commons/src/__test__/getOriginGitCommit.test.ts`):
- Mock `execSync` for comprehensive testing
- Test successful git execution with valid commit hash
- Test git command failures (not in repo, git unavailable)
- Test malformed output (non-40-char, invalid hex)
- Test environment variable behavior (DUMMY vs real commit)

**Test Cases:**
- ✅ Valid git repo returns 40-char hex string
- ✅ Invalid git repo returns undefined
- ✅ Git command failure returns undefined
- ✅ Malformed git output returns undefined
- ✅ `IGNORE_GIT_IN_METADATA=true` returns "DUMMY"
- ✅ Environment variable unset returns real commit

## Implementation Plan

### Phase 1: Create Shared Function
1. Create `packages/commons/api-workspace-commons/src/getOriginGitCommit.ts`
2. Implement comprehensive unit tests
3. Export from package index

### Phase 2: Update Consumers
1. Update local workspace runner imports and remove duplicate
2. Update remote workspace runner imports and remove duplicate
3. Verify all call sites use new shared function

### Phase 3: Seed Integration
1. Identify seed command entry points for setting environment variable
2. Set `IGNORE_GIT_IN_METADATA=true` before generation in seed
3. Verify seed outputs show "DUMMY" for `originGitCommit`

### Phase 4: Validation
1. Run seed tests to verify "DUMMY" output
2. Run production generation to verify real commit hashes
3. Unit test coverage for all edge cases

## Success Criteria

- ✅ Seed outputs show `"originGitCommit": "DUMMY"` consistently
- ✅ Production generation shows real commit hashes
- ✅ No code duplication between local/remote workspace runners
- ✅ All unit tests pass with comprehensive edge case coverage
- ✅ Existing generation pipeline unchanged (except import paths)

## Files Modified

**New Files:**
- `packages/commons/api-workspace-commons/src/getOriginGitCommit.ts`
- `packages/commons/api-workspace-commons/src/__test__/getOriginGitCommit.test.ts`

**Modified Files:**
- `packages/cli/generation/local-generation/local-workspace-runner/src/GenerationRunner.ts` (import update)
- `packages/cli/generation/local-generation/local-workspace-runner/src/getIntermediateRepresentation.ts` (import update)
- `packages/cli/generation/local-generation/local-workspace-runner/src/runLocalGenerationForWorkspace.ts` (import update)
- `packages/cli/generation/remote-generation/remote-workspace-runner/src/runRemoteGenerationForGenerator.ts` (import update, remove duplicate function)
- `packages/commons/api-workspace-commons/src/index.ts` (export new function)
- Seed command files (set environment variable)

**Deleted Files:**
- `packages/cli/generation/local-generation/local-workspace-runner/src/getOriginGitCommit.ts`

## Risk Assessment

**Low Risk**:
- Centralized function maintains exact same behavior
- Environment variable provides clean override mechanism
- No changes to production generation logic
- Comprehensive unit testing covers edge cases