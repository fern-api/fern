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

### Important: Avoid Huge Clones

The Fern repository is a large monorepo with extensive test fixtures and generated code. To avoid downloading gigabytes of unnecessary files, we strongly recommend using **sparse checkout** when cloning the repository.

#### Recommended Clone Method

Instead of a regular `git clone`, use sparse checkout from the start:

```sh
# Clone with sparse checkout enabled
git clone --filter=blob:none --sparse https://github.com/fern-api/fern.git
cd fern

# Configure sparse checkout to exclude large directories
bash ./setup-sparse-checkout.sh
```

This configuration:
- Includes all root files and directories
- Excludes most if not all of the large snapshot outputs used in integration tests

If you need to reset your sparse checkout configuration later, you can run:
```sh
pnpm run setup-sparse-checkout
```

#### Already Cloned Without Sparse Checkout?

If you've already cloned the repository without sparse checkout, you can configure it now to reduce the repository size:

```sh
# From the repository root
pnpm run setup-sparse-checkout
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

The repo relies on git-lfs to handle large file storage, so you'll need to have git-lfs installed in order to clone the repo. If you're using homebrew, just run:
```sh
brew install git-lfs
```

Once you have cloned or forked the repository, run through the steps below.

### Step 1: Install dependencies

```sh
pnpm install
```

### Step 2: Compile

To compile all the packages in this monorepo, run `pnpm compile`.

To compile a single package, filter to the relevant package: `pnpm --filter @fern-api/openapi-parser compile`.

### Step 3: Testing

This repo contains both unit tests and integration (end-to-end) tests.

To run all the unit tests: `pnpm test`.

To run unit tests for a single package: `pnpm --filter @fern-api/openapi-parser test`

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
## Feedback

If you have any feedback on what we could improve, please [open an issue](https://github.com/fern-api/fern/issues/new) to discuss it!
