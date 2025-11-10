# Remote vs Local Generation Testing

This directory contains snapshot outputs for comparing remote (Fiddle) vs local (Docker) SDK generation.

## Structure

```
seed-remote-local/
├── {language}-sdk/
│   ├── seed.yml          # Generator config with opt-in fixtures
│   ├── remote/
│   │   └── {fixture}/    # Snapshots from remote generation (via Fiddle)
│   └── local/
│       └── {fixture}/    # Snapshots from local generation (via Docker)
```

## Key Differences from Regular Seed Tests

1. **Opt-in fixtures**: Only fixtures listed in `seed.yml` are tested (not all fixtures)
2. **Published versions**: Both remote and local use the same published generator version
3. **GitHub mode**: All generation outputs to ephemeral GitHub repos (not local filesystem)
4. **Purpose**: Verify that remote (Fiddle) and local (Docker) produce identical output

## Generator Versions

Generator versions are resolved dynamically at runtime from Docker Hub (`:latest` tag). Both remote and local generation use the same latest published version to ensure consistency.

## Generating Baseline Snapshots

Baseline snapshots need to be generated once and committed. The test runner will regenerate and compare against these snapshots.

### Prerequisites

1. Access to a GitHub token with repo creation permissions
2. Fern CLI installed and authenticated
3. Access to Fern Fiddle service

### Process

For each generator (typescript, java, python, go):

1. **Create temporary Fern project** with generators.yml:
   ```yaml
   default-group: remote

   groups:
     remote:
       generators:
         - name: fernapi/fern-{lang}-sdk
           # Version resolved from Docker Hub :latest tag
           github:
             repository: fern-api/test-remote-local-{lang}
             mode: pull-request

     local:
       generators:
         - name: fernapi/fern-{lang}-sdk
           # Same latest version as remote
           github:
             uri: fern-api/test-remote-local-{lang}  # Note: 'uri' for local
             mode: pull-request
   ```

2. **Copy IMDB API definition** from `test-definitions/fern/apis/imdb/`

3. **Generate remote** (uses Fiddle):
   ```bash
   fern generate --group remote --api imdb
   ```

4. **Download remote output** from GitHub PR branch

5. **Generate local** (uses Docker):
   ```bash
   fern generate --group local --api imdb --local
   ```

6. **Download local output** from GitHub PR branch

7. **Copy to seed-remote-local**:
   ```bash
   cp -r /path/to/remote/output/* seed-remote-local/{lang}-sdk/remote/imdb/
   cp -r /path/to/local/output/* seed-remote-local/{lang}-sdk/local/imdb/
   ```

8. **Commit snapshots** to the repository

## Test Runner

The test runner (to be implemented in FER-7615) will:

1. Create ephemeral GitHub repos
2. Generate remote and local for each opt-in fixture
3. Download outputs from GitHub
4. Compare to committed snapshots using git diff
5. Fail if differences detected
6. Support `--update-snapshots` flag to refresh committed snapshots

## Usage

```bash
# Run all remote vs local tests
pnpm seed test-remote-vs-local

# Run specific generator
pnpm seed test-remote-vs-local --generator typescript-sdk

# Update snapshots
pnpm seed test-remote-vs-local --update-snapshots
```
