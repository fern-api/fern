# Contributing

Thanks for being here! This monorepo contains Fern's documentation, the Fern CLI, the Fern Definition,
the OpenAPI importer, as well as all of our generators.

Fern is open source, but many of the people working on it do so as their day job. As a potential contributor,
your changes and ideas are welcome, but we can't guarantee that they will be prioritized nor reviewed in a
timely manner (_if ever_). With that said, we generally encourage users to start with a GitHub issue to
discuss a feature or fix before writing any code. You're still welcome to include a patch as a proof-of-concept,
but please do not be offended if we rewrite your patch from scratch.

Like all open-source projects, Fern's resources are limited. If your patch isn’t a top priority, it may not
receive the attention you expect.

<br>

## Setup

The Fern repo is primarily written in TypeScript and relies on [PnPm](https://pnpm.io/) for package management.

The repo relies on git-lfs to handle large file storage, so you'll need to have git-lfs installed in order to clone the repo. If you're using homebrew, just run:
```sh
brew install git-lfs
```

### Important: Avoid Huge Clones

The Fern repository is a large monorepo with extensive test fixtures and generated code. To avoid downloading gigabytes of unnecessary files, we strongly recommend using **git sparse-checkout** when cloning the repository.

#### Recommended Clone Method

Instead of a regular `git clone`, use sparse checkout from the start:

```sh
# Clone with sparse checkout enabled
git clone --filter=blob:none --sparse https://github.com/fern-api/fern.git
cd fern

# Configure sparse checkout to exclude large directories
bash ./scripts/sparse-checkout.sh
```

This configuration:
- Includes all root files and directories
- Excludes most if not all of the large snapshot outputs used in integration tests

If you need to reset your sparse checkout configuration later, you can run:
```sh
pnpm sparse-checkout
```

#### Already Cloned Without Sparse Checkout?

If you've already cloned the repository without sparse checkout, you can configure it now to reduce the repository size:

```sh
# From the repository root
pnpm sparse-checkout
```

#### Additional Performance Tips (Optional)

For better performance with large repositories, you can also configure these git settings:

```sh
git config core.fsmonitor true
git config core.untrackedcache true
git config feature.manyFiles true
```

On macOS, installing [watchman](https://facebook.github.io/watchman/) can further improve file watching performance:
```sh
brew install watchman
```

Once you have cloned or forked the repository, run through the steps below.

### Step 1: Install dependencies

```sh
pnpm install
```

### Step 2: Compile

To compile all the packages in this monorepo, run `pnpm compile`.

To compile a single package, filter to the relevant package: `pnpm turbo run compile --filter @fern-api/openapi-parser`.

### Step 3: Testing

This repo contains both unit tests and integration (end-to-end) tests.

To run all the unit tests: `pnpm test`.

To run unit tests for a single package: `pnpm turbo run test --filter @fern-api/openapi-parser`

To run the integration tests: `pnpm test:ete`.

Many of our tests rely on [snapshot testing](https://jestjs.io/docs/snapshot-testing). To rewrite snapshots, use `pnpm test:update` or `pnpm test:ete:update`.

<br>

## Debugging

For debugging TypeScript code in tests, use the debug compilation and test scripts:

1. **Compile for debugging**: `pnpm compile:debug`
   - Required for all debug workflows
   - Uses `--sourceMap` flag to generate source maps for proper TypeScript debugging
   - Slower than standard compilation, which is why source maps are disabled by default

2. **Run tests with debugger**: `pnpm test:debug [test-file-name]`
   - Starts tests with Node.js debugger enabled
   - Optionally specify a test file name to run only that test
   - Manually attach VS Code debugger by opening Command Palette (Cmd+Shift+P) and selecting "Debug: Attach to Node Process"

**Limitations**: Debug scripts only work with vitest tests. Some -- but not all -- of the workflows they won't work with:
- Local Fern CLI builds (compiled to single executable CJS file)
- Generators (run in Docker containers, not all written in TypeScript)

<br>

## Repository Architecture

Below we talk through the large components of this monorepo and how to contribute to each one.

<br>

## Documentation

Fern's documentation is hosted live at the URL https://buildwithfern.com/learn. We appreciate any help we can get that makes our documentation more digestible.

If you find gaps within our documentation, please open an [issue](https://github.com/fern-api/fern/issues/new?assignees=&labels=documentation&projects=&template=documentation-suggestion.md&title=%5BFern%27s+Documentation%5D+)

### Editing Documentation

Our documentation is powered by Fern's Docs product. All of the configuration for the docs lives in [docs.yml](./fern/docs.yml).

To edit the docs, you can modify `docs.yml` or any of the markdown that it references.

To validate that the docs, run:

```sh
fern check
```

To preview the documentation, run:

```sh
fern docs dev
```

Finally, when you make a PR to update the docs, a PR preview link will be generated which will allow you
to test if your changes came out as intended. [Here](https://github.com/fern-api/fern/pull/4330) is a sample PR with a preview link.

<br>

## Fern CLI

The Fern CLI lives in a directory called [cli](./packages/cli/cli/) and the entrypoint is [cli.ts](./packages/cli/cli/src/cli.ts).

### Building the CLI from source

For local development and debugging, you can build an unminified version of the CLI by running `pnpm fern:build:unminified`. This compiles and builds a CLI that communicates with our production cloud environment but preserves readable code for easier debugging.

If you need a minified production build instead, you can run `pnpm fern:build`.

The CLI is outputted to `packages/cli/cli/dist/prod/cli.cjs`.

Once the CLI has been built, you can navigate to any `fern` folder and invoke it by running

```sh
FERN_NO_VERSION_REDIRECTION=true node /<path to fern git repo>/packages/cli/cli/dist/prod/cli.cjs <args>
```

### Development CLI

To build a CLI that communicates with Fern's development cloud environment, run the command `pnpm fern-dev:build`.

Once the CLI has been built, you can navigate to any `fern` folder and invoke it by running

```sh
FERN_NO_VERSION_REDIRECTION=true node /<path to fern git repo>/packages/cli/cli/dist/dev/cli.cjs <args>
```

<br>

## Generators

All of Fern's generators live in a directory called [generators](./generators/). This directory contains generators for several languages such as
[typescript](./generators/typescript/), [python](./generators/python/), [go](./generators/go).

Some of the generators are written in the language they generate (i.e. Python is written in python, Go is written in Go, and Java is written in Java).
We are moving to a world where each generator will be written in TypeScript so that we can share more utilities and enforce a consistent structure
in the generator.

### Generator Testing

**Note**: Please make sure that the docker daemon is running before running commands below.

To test our generators we have built a CLI called seed.

Seed handles building the generators from source and running them against all of the
[test definitions](./test-definitions/fern/) that are present in the repository. Generated code is then stored in a directory named
[seed](./seed/).

Each generator configures a `seed.yml`. For example, the TypeScript generator's configuration lives [here](./seed/ts-sdk/seed.yml).

Seed also handles running scripts against the generated code to make sure that the generated code compiles and works
as intended. For example, in the TypeScript generator seed runs `yarn install` and `yarn build` to compile the source code.

To build seed, simply run

```sh
pnpm seed:build
```

**Note**: If you make any changes to the seed [source code](./packages/seed/src/) then you will need to rerun `pnpm seed:build`.

To run seed, you can use the command:

```
pnpm seed test [--generator <generator-id>] [--fixture <fixture-name>] [--skip-scripts] [--local]
```

Below are some examples of using the command.

- For a single generator: `pnpm seed test --generator python-sdk`
- For a single generator and test definition: `pnpm seed test --generator python-sdk --fixture file-download`
- For a single generator, test definition, and skipping scripts: `pnpm seed test --generator python-sdk --fixture file-download --skip-scripts`
- For running the generator locally (not on docker): `pnpm seed test --generator python-sdk --local`

### Running seed against a custom fern definition

It may be valuable to run seed on a particular Fern definition or OpenAPI spec. To do this,
you can use the `seed run` command and point it at the fern folder:

```
pnpm seed run [--generator <generator-id>] [--path /path/to/fern/folder] [--output-path /path/for/sdk/output] [--audience <audience>]
```

Below are some examples of using the command.

- Pointed at a fern folder: `pnpm seed run --generator ts-sdk --path /Users/jdoe/fern --audience external`
- Pointed at a fern folder with an audience: `pnpm seed run --generator ts-sdk --path /Users/jdoe/fern`
- Pointed at a fern folder with multiple apis: `pnpm seed run --generator ts-sdk --path /Users/jdoe/fern/apis/<name-of-api>`

<br>

## Release versioning

This repository uses a **changelog-driven release system**. You never bump version numbers manually — instead, you add a small YAML changelog file describing your change, and automation handles the rest.

### How it works

Each releasable component (the CLI, each generator) has its own:

- **`versions.yml`** — the version history (automation-managed, do not hand-edit)
- **`changes/unreleased/`** — directory where you drop changelog files

When changes land on `main`, the [release workflow](/.github/workflows/release-software.yml) runs [`scripts/release.ts`](/scripts/release.ts), which:

1. Reads all YAML files in the component's `changes/unreleased/` directory
2. Determines the semver bump from the `type` fields (see below)
3. Prepends a new entry to `versions.yml` with the new version, changelog entries, date, and `irVersion`
4. Moves the unreleased changelog files into a versioned directory (e.g., `changes/5.44.6/`)
5. Commits and pushes

The mapping of components to their changelog and versions paths is defined in [`release-config.json`](/release-config.json). That file is the single source of truth.

### Adding a changelog entry

1. Find the correct `changes/unreleased/` directory for your component (see [table below](#changelog-folder-reference))
2. Copy `.template.yml` from that directory, or create a new YAML file with a descriptive name (e.g., `fix-streaming-timeout.yml`)
3. Each file is a **YAML array** of objects:

```yaml
# yaml-language-server: $schema=../../../../../fern-changes-yml.schema.json
- summary: |
    Fix global headers from generators.yml not appearing in documentation.
  type: fix
```

#### Fields

| Field | Required | Values | Description |
|-------|----------|--------|-------------|
| `summary` | yes | string | Description of the change. Multi-line `\|` allowed. |
| `type` | yes | `fix`, `chore`, `feat`, `internal` | Drives semver bump (see below). |
| `pre-release` | no | `alpha`, `beta`, `rc` | Produces a pre-release version, e.g., `1.2.0-rc.0`. |
| `irVersion` | no | positive integer | Override the IR major version for this release (CLI only — see [irVersion](#irversion-metadata)). |

The full schema is in [`fern-changes-yml.schema.json`](/fern-changes-yml.schema.json).

#### Semver bump rules

| `type` | Bump |
|--------|------|
| `fix` / `chore` | patch |
| `feat` / `internal` | minor |

**Major version bumps** are intentionally not produced by the automated release flow. To ship a major release, a human edits the relevant `versions.yml` directly so the breaking change is explicitly acknowledged in review.

### Changelog folder reference

Use the table below to find where to put your changelog file. If your PR spans multiple components, add a changelog file in **each** relevant `changes/unreleased/` directory. Always pick the narrowest matching component.

| Component | Source directory | Changelog directory |
|-----------|-----------------|---------------------|
| Fern CLI | `packages/cli/` | `packages/cli/cli/changes/unreleased/` |
| C# generator | `generators/csharp/` | `generators/csharp/sdk/changes/unreleased/` |
| Go generator | `generators/go/` | `generators/go/sdk/changes/unreleased/` |
| Java generator | `generators/java/` | `generators/java/sdk/changes/unreleased/` |
| PHP generator | `generators/php/` | `generators/php/sdk/changes/unreleased/` |
| Python generator | `generators/python/` | `generators/python/sdk/changes/unreleased/` |
| Ruby v2 generator | `generators/ruby-v2/` | `generators/ruby-v2/sdk/changes/unreleased/` |
| Rust generator | `generators/rust/` | `generators/rust/sdk/changes/unreleased/` |
| Swift generator | `generators/swift/` | `generators/swift/sdk/changes/unreleased/` |
| TypeScript generator | `generators/typescript/` | `generators/typescript/sdk/changes/unreleased/` |
| CLI generator | `generators/cli/` | `generators/cli/changes/unreleased/` |

> **If anything here disagrees with [`release-config.json`](/release-config.json), follow the file on disk.**

### `irVersion` metadata

The `irVersion` field in `versions.yml` tracks the **IR major version** the CLI can produce. The release script inherits this value from the previous `versions.yml` entry by default.

When the IR major version bumps (e.g., 66 → 67), one of the changelog entries in that release **must** include `irVersion: <new major>` to override the inherited value:

```yaml
- summary: |
    Update CLI irVersion metadata from 66 to 67.
  type: fix
  irVersion: 67
```

If this is missed, [FDR](https://github.com/fern-api/fern-platform) will think new CLI versions only support the old IR, and `fern generator upgrade` will return stale generator versions. See [PR #16210](https://github.com/fern-api/fern/pull/16210) for the fix that added `irVersion` support to changelog entries.

### The release script

[`scripts/release.ts`](/scripts/release.ts) is the core of the release system. In brief:

1. **Reads** unreleased changelog files from `{changelogFolder}/unreleased/`
2. **Validates** each entry against [`fern-changes-yml.schema.json`](/fern-changes-yml.schema.json)
3. **Determines** the next semver version from changelog `type` fields
4. **Resolves** the `irVersion` — uses the override from a changelog entry if present, otherwise inherits from the latest `versions.yml` entry
5. **Prepends** a new version entry to `versions.yml`
6. **Moves** unreleased files into `{changelogFolder}/{version}/`
7. **Commits** and pushes to the current branch

The workflow that triggers this is [`.github/workflows/release-software.yml`](/.github/workflows/release-software.yml).

### Quick reference

- **DO** add a YAML file to `changes/unreleased/` for every user-facing or internal change
- **DO NOT** hand-edit `versions.yml` (unless shipping a major version bump)
- **DO NOT** run the release script locally in normal development — the CI workflow handles releases
- **DO** check [`release-config.json`](/release-config.json) if you're unsure which changelog folder maps to your component

<br>

## Feedback

If you have any feedback on what we could improve, please [open an issue](https://github.com/fern-api/fern/issues/new) to discuss it!
