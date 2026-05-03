# Testing Fern CLI Docs Generation

How to build and test the Fern CLI locally against docs generation fixtures.

## Devin Secrets Needed

- `DEV_SMOKE_TEST_FERN_TOKEN` — Token for the `smoke-test` org on dev2 endpoints. Do NOT use `SMOKE_TEST_FERN_TOKEN` (that's for production). The token value may be prefixed with `FERN_TOKEN=` — strip this prefix before use.

## Building the Dev CLI

```bash
cd /home/ubuntu/repos/fern
pnpm fern-dev:build
```

This runs `turbo run dist:cli:dev --filter=@fern-api/cli` and outputs to `packages/cli/cli/dist/dev/cli.cjs`.

The dev CLI build points to dev2 endpoints (e.g., `registry-v2-dev2.${DASHBOARD_TEST_PASSWORD}.com`), while the prod build points to production.

### Turbo Cache Staleness

Turbo caches build outputs based on source file hashes. After committing changes, the CLI might still contain OLD code from cache if the cache key matches a previous build.

**Always verify the built CLI contains your changes:**
```bash
# Check for expected strings in the bundle
grep -c "your_new_function_or_string" packages/cli/cli/dist/dev/cli.cjs
```

If the bundle is stale:
1. Try `pnpm fern-dev:build` without `--force` first — turbo will detect changed source files and rebuild affected packages while using cached results for unrelated ones.
2. If that doesn't work, try `pnpm fern-dev:build --force` to invalidate all caches. Note: this may fail if there are pre-existing compile errors in unrelated packages.
3. If `--force` fails due to unrelated packages, check if CI passes — pre-existing compile failures in packages like `php-dynamic-snippets` are unrelated to CLI changes and might block local `--force` builds.

### Pre-existing Build Issues

The monorepo occasionally has compile failures in packages unrelated to the CLI (e.g., `@fern-api/php-dynamic-snippets`). These block `--force` rebuilds but don't affect CI (which may use remote turbo cache or different build ordering). If you hit this:
- Don't use `--force` — let turbo use cached results for broken packages
- The non-force build should still rebuild your changed packages with fresh code

## Running the Dev CLI

```bash
# Set token (do NOT set FERN_SELF_HOSTED=true)
export FERN_TOKEN=$DEV_SMOKE_TEST_FERN_TOKEN

# Run from a fern project directory
cd /path/to/test-fixture
node --enable-source-maps /home/ubuntu/repos/fern/packages/cli/cli/dist/dev/cli.cjs generate --docs --preview
```

Key flags:
- `--preview`: Generates a preview URL without affecting the real domain
- `--enable-source-maps`: Shows readable stack traces on errors
- `--debug`: Shows debug-level log output (useful for verifying warn→debug changes)

## Creating Test Fixtures for Docs Generation

A minimal docs fixture needs:

```
fern/
  fern.config.json          # {"organization": "smoke-test", "version": "0.0.0"}
  docs.yml                  # instances + navigation referencing APIs
  apis/
    my-api/
      generators.yml        # api: specs: - openapi: ./openapi/openapi.yml
      openapi/
        openapi.yml         # The actual OpenAPI spec
```

### docs.yml format for multi-API projects
```yaml
instances:
  - url: my-test.docs.${DASHBOARD_TEST_PASSWORD}.com
title: My Test
navigation:
  - api: api-name-1
  - api: api-name-2
```

The `api:` value in navigation must match the directory name under `apis/`.

### generators.yml format
```yaml
api:
  specs:
    - openapi: ./openapi/openapi.yml
```

## Testing Validation/Logging Changes

For testing changes to validation or logging behavior:
1. Create fixtures that trigger specific validation rules (frontmatter `---`, parameter collisions, circular refs, etc.)
2. Use `2>&1 | tee output.txt` to capture both stdout and stderr
3. Use `grep` to verify specific patterns in the output
4. For before/after comparisons, the user's shared production logs can serve as "before" evidence if building on main is blocked

### OSS Validator Rules
The docs validator runs rules defined in `packages/cli/oss-validator/`. Key rules:
- `no-invalid-tag-names-or-frontmatter` (severity: "error") — catches `---` in endpoint descriptions
- `no-conflicting-parameter-names` (severity: "error") — catches duplicate param names that normalize to the same SDK identifier

APIs with validation errors at severity "error" or "fatal" are skipped during docs generation (not fatal to the whole process).

## Tips

- The `smoke-test` org is the standard test org for dev2 testing
- Preview URLs are generated at `smoke-test-preview-{uuid}.docs.dev.${DASHBOARD_TEST_PASSWORD}.com`
- The CLI exits 0 even when APIs are skipped — only the skipped APIs are excluded, the rest generate normally
- Example validation warnings ("Example value 'X' is not a valid enum value...") are at debug level — use `--debug` to see them
