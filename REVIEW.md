# Review Guidelines

This file provides guidance to [Devin Review](https://docs.devin.ai/work-with-devin/devin-review) when analyzing pull requests in this repository.

## Ignore

- Lock files (`pnpm-lock.yaml`) unless dependency changes are the point of the PR.
- Auto-generated files in `packages/ir-sdk/src/sdk/` -- these are generated from the Fern IR definition. Review the definition files in `packages/ir-sdk/fern/` instead.

## Critical Areas

### IR Schema Changes
- Changes to `packages/ir-sdk/fern/apis/ir-types-latest/definition/` affect all generators. Verify that corresponding IR migration entries exist in `packages/cli/generation/ir-migrations/` for backward compatibility.
- IR version bumps must be coordinated: update `irVersion` in the relevant `versions.yml` entry.

### Version Management
- CLI changes should include a `versions.yml` entry in `packages/cli/cli/versions.yml`.
- The `type` field in changelog entries should match the PR type: `fix` for bug fixes, `feat` for new features.

### Generator Template Files

## Conventions

### TypeScript
- No `any` type -- use `unknown` and narrow with type guards.
- No `as X` type assertions unless the compiler genuinely cannot infer the type.
- No default exports -- use named exports exclusively.
- No `require()` -- use ES module `import` syntax.
- Exported functions and public methods must have explicit return types.
- Prefer `const` over `let`; never use `var`.
- No `.then()` chains when `async/await` is available.
- No empty `catch` blocks -- at minimum log the error.

### PR Structure
- PR titles must follow semantic commit format: `<type>(<scope>): <description>` where both type and scope are required.
- Allowed types: `fix`, `feat`, `revert`, `break`, `chore`.
- Allowed scopes: `docs`, `changelog`, `internal`, `cli`, `typescript`, `python`, `java`, `csharp`, `go`, `php`, `ruby`, `seed`, `ci`, `lint`, `fastapi`, `spring`, `openapi`, `deps`, `deps-dev`, `pydantic`, `ai-search`, `swift`, `rust`, `generator-cli`.

### Cross-Package Type Safety
- When importing types across packages, watch for name collisions -- use namespace imports (`import * as X`) rather than direct imports when multiple packages export types with the same name.

## Performance

- Flag any unbounded loops or recursive traversals over IR nodes without depth limits.
- Watch for N+1 patterns when processing API definitions with many endpoints or types.

## Security

- Never expose or log secrets, API keys, or tokens in generated code or test fixtures.
- Generator output that handles authentication (OAuth, bearer tokens, API keys) should be reviewed for secure defaults.
