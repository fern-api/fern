---
name: seed-debug
description: "Debug generator issues using seed CLI with automatic validation"
category: development
complexity: advanced
argument-hint: "<generator> [--fixture <name> | --custom <path>] [--local] [description]"
---

# /fern:seed-debug - Generator Debugging Tool

## Triggers
- Need to debug a generator issue with a specific fixture
- Reproducing and fixing generator bugs
- Manual invocation: `/fern:seed-debug <generator> [--fixture <name> | --custom <path>] [--local] [description]`

## Usage
```
/fern:seed-debug <generator> --fixture <fixture-name> [--outputFolder <folder>] [--local] [description of the issue]
/fern:seed-debug <generator> --custom <path-to-fern-folder> [--local] [description of the issue]
```

**Arguments**:
- `<generator>` (required, positional): Name of the generator to test (e.g., `ts-sdk`, `python-sdk`, `go-sdk`)
- `--fixture` (optional): Name of the test fixture to use (e.g., `imdb`, `file-download`)
- `--custom` (optional): Path to a custom Fern project folder
- `--outputFolder` (optional): Specific output folder when fixture has multiple configurations
- `--local` (optional): Run using local generator build instead of Docker (requires `test.local` config in seed.yml)
- `[description]` (optional): Any remaining text after flags is treated as context/hints about the issue

**Note**: Must provide either `--fixture` or `--custom`, not both.

## Behavioral Flow
1. **Parse Arguments**: Extract generator name, fixture/custom path, --local flag, and description
2. **Verify Local Config**: If --local flag, check seed.yml for local configuration
3. **Verify Output Folder**: For fixtures with multiple configs, prompt user to select
4. **Run Generation**: Execute seed CLI with debug logging (and --local if specified)
5. **Extract Output Path**: Parse logs to find generated code location
6. **Discover Validation Steps**: Read `.github/workflows/ci.yml` for build/test commands
7. **Run Validation**: Execute build and test commands
8. **Iterate if Needed**: On failure, edit source code and repeat cycle
9. **Report Results**: Summarize changes made

## Execution Steps

### Step 1: Parse Arguments

Extract from `$ARGUMENTS`:
- First positional argument - the generator name (required)
- `--fixture <name>` - test fixture name (mutually exclusive with --custom)
- `--custom <path>` - path to custom Fern project (mutually exclusive with --fixture)
- `--outputFolder <folder>` - specific output folder for multi-config fixtures
- `--local` - flag to use local generator build instead of Docker
- Any remaining text after all flags - treat as issue description/context

Store the description for reference during debugging. This provides hints about what to look for.

If no generator name is provided, ask the user which generator they want to debug.
If neither `--fixture` nor `--custom` is provided, ask the user which mode they want.

### Step 2: Verify Local Config (If --local Flag)

When `--local` flag is provided:

1. Read the seed.yml file for the generator:
   ```
   seed/<generator>/seed.yml
   ```

2. Check if `test.local` configuration exists. It should have structure like:
   ```yaml
   test:
     local:
       workingDirectory: generators/typescript
       buildCommand:
         - pnpm turbo run dist:cli --filter @fern-typescript/sdk-generator-cli
       runCommand: node --enable-source-maps sdk/cli/dist/cli.cjs {CONFIG_PATH}
       env:
         NODE_ENV: test
   ```

3. If `test.local` is NOT present, prompt the user:
   ```
   The generator "<generator>" does not have a local configuration in seed.yml.

   Running without --local will use Docker instead.

   Would you like to:
   1. Continue without --local (use Docker)
   2. Stop and add a local config to seed.yml first
   ```

4. If user chooses to continue without --local, remove the flag from subsequent commands

### Step 3: Verify Output Folder (Fixture Mode Only)

When using `--fixture` without `--outputFolder`:

1. Find the seed.yml file for the generator:
   ```
   seed/<generator>/seed.yml
   ```

2. Check if the fixture has multiple output folders defined

3. If multiple configurations exist for this fixture, prompt the user:
   ```
   The fixture "<fixture-name>" has multiple output configurations:
   - no-custom-config
   - custom-package-json
   - [other variants...]

   Which output folder would you like to debug?
   ```

4. Once confirmed, include `--outputFolder <folder>` in subsequent commands

### Step 4: Run Generation

First, ensure dependencies are installed:
```bash
pnpm install
```

Then run seed generation with debug logging:

**For fixture mode:**
```bash
pnpm seed:local test --log-level debug --generator <generator> --fixture <fixture> [--outputFolder <folder>] [--local]
```

**For custom mode:**
```bash
pnpm seed:local run --log-level debug --generator <generator> --path <custom-path> [--local]
```

**Important**: The `seed:local` script handles all necessary compilation, so no separate compile step is needed.

### Step 5: Extract Output Path

Parse the generation output to find where files were written. Look for patterns like:

**Fixture output:**
```
[<generator>:<fixture>:<config>]:  Wrote files to /Users/jsklan/git/fern/seed/<generator>/<fixture>/<config>
```

**Custom output:**
```
[<generator>:custom:]:  Wrote files to /private/var/folders/.../tmp-XXXXX-XXXXXXXXXX
```

Store this path for validation steps.

### Step 6: Discover Validation Steps

Read the CI workflow file:
```
<output-path>/.github/workflows/ci.yml
```

Look for the `jobs` section, particularly:
- `compile` or `build` job
- `test` job

Extract the `run` commands from these jobs, ignoring:
- `actions/checkout@*`
- `pnpm/action-setup@*`
- `actions/setup-node@*`
- Other GitHub Actions references

Common validation commands by language:
- **TypeScript**: `pnpm install --frozen-lockfile && pnpm build && pnpm test`
- **Python**: `pip install . && pytest`
- **Go**: `go build ./... && go test ./...`
- **Java**: `./gradlew build test`

### Step 7: Run Validation

Navigate to the output directory and run the discovered validation commands in sequence:

```bash
cd <output-path>
# Run discovered commands, e.g.:
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

### Step 8: Iterate on Failures

If generation or validation fails:

1. **Analyze the error** - Read error messages carefully. Use the user-provided description/context as hints for what to look for.
2. **Add logging if needed** - Insert debug statements in generator/CLI code to understand the issue
3. **Make targeted edits** - Modify source code in:
   - `/generators/<language>/` - Generator implementation
   - `/packages/cli/` - CLI code
   - `/packages/` - Core packages
4. **Re-run generation** - Go back to Step 4
5. **Repeat** until all validation passes

**Remember**:
- Only edit code in the fern repository
- Never edit generated code or external project code
- Debug logs can be cleaned up later

### Step 9: Report Results

When all validation passes, provide a summary:

```
## Seed Debug Complete

**Generator**: <generator-name>
**Fixture/Custom**: <fixture-name or custom-path>
**Output**: <output-path>

### Changes Made
- [List of files modified]

### Validation Results
- Generation: PASSED
- Build: PASSED
- Tests: PASSED

### Summary
[Brief description of what was fixed and why]
```

## Examples

### Basic Fixture Test
```
/fern:seed-debug ts-sdk --fixture imdb
```

### Fixture with Specific Output Folder
```
/fern:seed-debug ts-sdk --fixture imdb --outputFolder no-custom-config
```

### Using Local Generator Build
```
/fern:seed-debug ts-sdk --fixture imdb --local
```

### Custom Project Debug
```
/fern:seed-debug python-sdk --custom ~/projects/my-api/fern
```

### With Issue Description
```
/fern:seed-debug ts-sdk --fixture file-download --local The generated SDK is missing the Content-Disposition header handling for file downloads
```

### Full Example with All Options
```
/fern:seed-debug go-sdk --fixture pagination --outputFolder offset --local There's an issue with cursor-based pagination where the next page token is not being properly extracted from the response
```

## Boundaries

**Will:**
- Edit generator code in `/generators/`
- Edit CLI code in `/packages/cli/`
- Edit core packages in `/packages/`
- Add debug logging to understand issues
- Run validation commands from generated CI workflow

**Will Not:**
- Edit generated code (it will be regenerated)
- Edit code in external projects (custom path targets)
- Modify test fixture definitions (unless that's the actual issue)
- Push changes or create commits automatically
