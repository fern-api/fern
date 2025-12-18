---
name: seed-debug
description: "Debug generator issues using seed CLI with automatic validation"
category: development
complexity: advanced
argument-hint: "<generator> [--fixture <name> | --custom <path>]"
---

# /fern:seed-debug - Generator Debugging Tool

## Triggers
- Need to debug a generator issue with a specific fixture
- Reproducing and fixing generator bugs
- Manual invocation: `/fern:seed-debug <generator> [--fixture <name> | --custom <path>]`

## Usage
```
/fern:seed-debug <generator> --fixture <fixture-name> [--outputFolder <folder>]
/fern:seed-debug <generator> --custom <path-to-fern-folder>
```

**Arguments**:
- `<generator>` (required, positional): Name of the generator to test (e.g., `ts-sdk`, `python-sdk`, `go-sdk`)
- `--fixture` (optional): Name of the test fixture to use (e.g., `imdb`, `file-download`)
- `--custom` (optional): Path to a custom Fern project folder
- `--outputFolder` (optional): Specific output folder when fixture has multiple configurations

**Note**: Must provide either `--fixture` or `--custom`, not both.

## Behavioral Flow
1. **Parse Arguments**: Extract generator name and fixture/custom path
2. **Verify Output Folder**: For fixtures with multiple configs, prompt user to select
3. **Run Generation**: Execute seed CLI with debug logging
4. **Extract Output Path**: Parse logs to find generated code location
5. **Discover Validation Steps**: Read `.github/workflows/ci.yml` for build/test commands
6. **Run Validation**: Execute build and test commands
7. **Iterate if Needed**: On failure, edit source code and repeat cycle
8. **Report Results**: Summarize changes made

## Execution Steps

### Step 1: Parse Arguments

Extract from `$ARGUMENTS`:
- First positional argument - the generator name (required)
- `--fixture <name>` - test fixture name (mutually exclusive with --custom)
- `--custom <path>` - path to custom Fern project (mutually exclusive with --fixture)
- `--outputFolder <folder>` - specific output folder for multi-config fixtures

If no generator name is provided, ask the user which generator they want to debug.
If neither `--fixture` nor `--custom` is provided, ask the user which mode they want.

### Step 2: Verify Output Folder (Fixture Mode Only)

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

### Step 3: Run Generation

First, ensure dependencies are installed:
```bash
pnpm install
```

Then run seed generation with debug logging:

**For fixture mode:**
```bash
pnpm seed:local test --log-level debug --generator <generator> --fixture <fixture> [--outputFolder <folder>]
```

**For custom mode:**
```bash
pnpm seed:local run --log-level debug --generator <generator> --path <custom-path>
```

**Important**: The `seed:local` script handles all necessary compilation, so no separate compile step is needed.

### Step 4: Extract Output Path

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

### Step 5: Discover Validation Steps

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

### Step 6: Run Validation

Navigate to the output directory and run the discovered validation commands in sequence:

```bash
cd <output-path>
# Run discovered commands, e.g.:
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

### Step 7: Iterate on Failures

If generation or validation fails:

1. **Analyze the error** - Read error messages carefully
2. **Add logging if needed** - Insert debug statements in generator/CLI code to understand the issue
3. **Make targeted edits** - Modify source code in:
   - `/generators/<language>/` - Generator implementation
   - `/packages/cli/` - CLI code
   - `/packages/` - Core packages
4. **Re-run generation** - Go back to Step 3
5. **Repeat** until all validation passes

**Remember**:
- Only edit code in the fern repository
- Never edit generated code or external project code
- Debug logs can be cleaned up later

### Step 8: Report Results

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

### Custom Project Debug
```
/fern:seed-debug python-sdk --custom ~/projects/my-api/fern
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
