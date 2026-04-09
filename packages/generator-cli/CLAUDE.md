# generator-cli

Post-generation orchestration for Fern-generated SDKs. Runs after a language generator produces SDK files, handling customization preservation (Replay), documentation generation (README/reference), and GitHub delivery (commit/push/PR).

## Package Identity

- **Package**: `@fern-api/generator-cli`
- **Entry point (CLI)**: `src/cli.ts` (yargs-based, invoked as `generator-cli`)
- **Entry point (API)**: `src/api.ts` (programmatic exports consumed by generators and the Fern CLI)
- **Published to**: npm (bundled via `build.mjs` using tsup)

## Commands

```bash
pnpm compile                                          # TypeScript compilation
pnpm turbo run test --filter @fern-api/generator-cli  # Run tests
pnpm turbo run dist:cli --filter @fern-api/generator-cli  # Bundle CLI
```

## How generator-cli is Consumed

generator-cli is consumed in **two ways**:

1. **Inside generators** (via `generators/base`): `generators/base/package.json` depends on `"@fern-api/generator-cli": "catalog:"`. Every TypeScript-based generator that extends `AbstractGeneratorAgent` bundles generator-cli into its Docker image. The `GeneratorAgentClient` in `generators/base/src/GeneratorAgentClient.ts` imports `generateReadme`, `generateReference`, `githubPr`, and `githubPush` directly from `@fern-api/generator-cli`. This means both local and remote (Fiddle) generation flows use generator-cli — it's baked into the generator Docker images, Fiddle doesn't have its own implementation.

2. **Inside the Fern CLI** (for local gen with self-hosted GitHub): `packages/cli/generation/local-generation/local-workspace-runner/` imports `PostGenerationPipeline` directly via `"@fern-api/generator-cli": "workspace:*"`.

There is no subprocess invocation in either path — generator-cli is always used as a library import.

## Architecture

### Layer 1: CLI (`src/cli.ts`)

Yargs command tree. Commands: `pipeline run`, `replay init/bootstrap/status/forget/reset`, `github push/pr/release`, `generate readme/reference`. The standalone CLI exists for manual use but is not called by the main Fern CLI or generators.

### Layer 2: API Functions (`src/api/`)

Thin, typed wrappers re-exported from `src/api.ts`. Modules: `generate-readme.ts`, `generate-reference.ts`, `github-pr.ts`, `github-push.ts`, `github-release.ts`.

### Layer 3: Pipeline (`src/pipeline/`)

Sequential step orchestration. `PostGenerationPipeline` instantiates enabled steps from `PipelineConfig` and runs them in order.

**Step execution order**: ReplayStep → (FernignoreStep, Phase 2 placeholder) → GithubStep

### Key Files

Pipeline core:
- `src/pipeline/PostGenerationPipeline.ts` — Orchestrator
- `src/pipeline/types.ts` — All pipeline interfaces
- `src/pipeline/steps/ReplayStep.ts` — Thin wrapper around `replayRun()`
- `src/pipeline/steps/GithubStep.ts` — Commit/push/PR/conflict visualization
- `src/pipeline/steps/FernignoreStep.ts` — Phase 2 placeholder (not yet implemented)
- `src/pipeline/replay-summary.ts` — PR body formatting, conflict reason mapping

Replay integration:
- `src/replay/replay-run.ts` — Replay invocation + divergent merge detection

GitHub helpers (`src/pipeline/github/`):
- `createReplayBranch.ts` — Synthetic divergent commit creation
- `findExistingUpdatablePR.ts` — Find reusable fern-bot PRs
- `parseCommitMessage.ts` — PR title/body extraction
- `constants.ts` — Fern bot identity (name, email, login)

Documentation:
- `src/readme/ReadmeGenerator.ts` — Section generation, block merging, TOC
- `src/readme/ReadmeParser.ts` — Parses existing README into header + blocks
- `src/readme/BlockMerger.ts` — Preserves user edits during regeneration
- `src/reference/ReferenceGenerator.ts` — `reference.md` with endpoint docs and parameter tables

Configuration:
- `src/configuration/loadReadmeConfig.ts`, `loadReferenceConfig.ts`, `loadGitHubConfig.ts` — Config loaders
- `src/configuration/sdk/` — Generated SDK client types

## Pipeline Behavior

`PostGenerationPipeline` runs steps sequentially. Each step receives a `PipelineContext` with results from prior steps. Step failure marks the pipeline as failed but does not abort — subsequent steps still run. Replay errors return null report rather than failing generation.

**Key invariant**: `skipCommit` means replay already committed — GithubStep must NOT `commitAllChanges()` again.

## Testing

25+ test files in `src/__test__/` covering:
- **README generation**: `basic-go.test.ts`, `basic-java.test.ts`, `basic-php.test.ts`, `basic-rust.test.ts`, `basic-swift.test.ts`, `advanced.test.ts`, `cohere-go.test.ts`, `cohere-go-merged.test.ts`
- **README parsing/merging**: `block-merger.test.ts`, `readme-parser.test.ts`, `add-new-blocks.test.ts`, `custom-sections.test.ts`, `remove-disabled-sections.test.ts`, `remove-generated-sections.test.ts`, `filter-table-of-contents.test.ts`
- **Reference docs**: `basic-reference.test.ts`, `reference-generator.test.ts`, `reference-md.test.ts`
- **Replay**: `replay-core.test.ts`, `replay-advanced.test.ts`, `replay-pure.test.ts`
- **GitHub**: `pr.test.ts`, `github/` directory
- **Helpers**: `testGenerateReadme.ts`, `testGenerateReference.ts`
- **Snapshot directory**: `__snapshots__/`, `fixtures/`

## Versioning & Release Process

### Version bump process (can be one commit)

When making changes to generator-cli, update these three files together:

1. `packages/generator-cli/versions.yml` — Add new version entry (triggers npm publish via CI)
2. `pnpm-workspace.yaml` — Update the catalog pin (e.g., `"@fern-api/generator-cli": 0.8.1`)
3. `packages/cli/cli/versions.yml` — Bump CLI version (triggers CLI publish via CI)

Both CI workflows (`publish-generator-cli.yml` and `publish-cli.yml`) trigger from the same push to main.

### How generators pick up the change

Generators pick up new generator-cli versions **lazily** — the next time a generator gets its own version bump and Docker image rebuild, it naturally includes the latest catalog-pinned generator-cli. There is no automation that bumps all generator versions when generator-cli changes. For critical changes, manually bump each generator's `versions.yml` to force new Docker images.

## Dependencies

- `@fern-api/replay` — Core replay engine
- `@fern-api/github` — `ClonedRepository` for git operations
- `@fern-api/fs-utils` — Path utilities
- `@octokit/rest` — GitHub API client
- `yargs` — CLI argument parsing

## Common Gotchas

- `skipCommit` means replay already committed — GithubStep must NOT `commitAllChanges()` again
- Force push required when updating existing PR with replay commits (replay rewrites branch history)
- `baseBranchHead` is always on main's lineage (survives squash merges), unlike `previousGenerationSha` which may be on a dead branch
- Pipeline continues on step failure — replay errors return null report to not fail generation
- Generator name sanitization: `/` replaced with `--` for tag names and commit status context
