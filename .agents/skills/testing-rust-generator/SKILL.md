# Testing Rust Generator Changes

This skill covers how to test changes to the Rust SDK/model generators in `generators/rust/`.

## Devin Secrets Needed

No secrets are needed for testing the Rust generator locally.

## Key Directories

- Generator source: `generators/rust/model/src/` and `generators/rust/sdk/src/`
- Seed fixtures: `seed/rust-model/` and `seed/rust-sdk/`
- Vitest snapshots: `generators/rust/model/src/__test__/snapshots/`
- Versions tracking: `generators/rust/model/versions.yml` and `generators/rust/sdk/versions.yml`

## Running Seed Tests

Seed tests regenerate fixtures and compare output against expected snapshots.

```bash
# Run a specific fixture (fast, no compilation)
node --enable-source-maps packages/seed/dist/cli.cjs test --generator rust-model --fixture unions --skip-scripts

# Run without --skip-scripts to include compilation (if the fixture has a Cargo.toml)
node --enable-source-maps packages/seed/dist/cli.cjs test --generator rust-model --fixture unions

# Run for rust-sdk instead of rust-model
node --enable-source-maps packages/seed/dist/cli.cjs test --generator rust-sdk --fixture unions --skip-scripts
```

**Note**: Most rust-model fixtures do NOT have a `Cargo.toml` file, so removing `--skip-scripts` won't actually trigger Rust compilation. Check if the fixture directory contains a `Cargo.toml` before expecting compilation output.

## Key Fixtures for Union Types

- `unions` - Basic union types including variants with Rust keyword fields (`r#type`)
- `trace` - Complex unions with multiple optional fields per variant (good for testing multi-constructor generation)
- `nullable-optional` - Tests nullable and optional field handling
- `server-sent-event-examples` - SSE event union types
- `exhaustive` - Comprehensive type coverage

## Running Vitest Unit Tests

```bash
# Run all rust-model unit tests
pnpm --filter @fern-api/rust-model exec vitest --passWithNoTests --run

# Update snapshots if generated output changed
pnpm --filter @fern-api/rust-model exec vitest --passWithNoTests --run --update
```

Expect ~16 tests. If snapshots mismatch, run with `--update` and commit the updated snapshot files.

## Running Lint

```bash
cd ~/repos/fern && eval "$(direnv export bash)" && pnpm run check
```

## Updating versions.yml

When making generator changes, update both:
- `generators/rust/model/versions.yml`
- `generators/rust/sdk/versions.yml`

Important semver rules:
- `type: feat` requires a **minor** version bump (e.g., 0.2.x -> 0.3.0)
- `type: fix` requires a **patch** version bump (e.g., 0.2.1 -> 0.2.2)
- CI will fail if the semver bump doesn't match the changelog type

## Verifying Generated Output

After running seed tests, inspect the generated `.rs` files in the fixture output directories:
- `seed/rust-model/<fixture>/src/` for rust-model
- `seed/rust-sdk/<fixture>/src/api/types/` for rust-sdk

Key things to verify:
- Method signatures have correct parameter types (e.g., `T` not `Option<T>` for unwrapped optional params)
- Rust reserved keywords use `r#` prefix in parameter names and field assignments but NOT in method names
- Optional fields default to `None` when not the target of a convenience constructor
- Target optional fields are wrapped in `Some()` in the field assignment

## CI Checks

The PR will run ~80+ CI checks. Key ones for Rust generator changes:
- Seed tests for all affected fixtures
- Vitest unit tests
- Semver validation for versions.yml
- Lint checks
