# Contributing

Thanks for being here! Fern gives a lot of importance to being a community project, and we rely on your help as much as you rely on ours. If you have any feedback on what we could improve, please [open an issue](https://github.com/fern-api/fern/issues/new) to discuss it!

## Opening an issue

All contributions start with [an issue](https://github.com/fern-api/fern/issues/new). Even if you have a good idea of what the problem is and what the solution looks like, please open an issue. This will give us an opportunity to align on the problem and solution, and to deconflict in the case that somebody else is already working on it.

## How can you help?

Review [our documentation](https://buildwithfern.com/docs)! We appreciate any help we can get that makes our documentation more digestible.

Talk about Fern in your local meetups! Even our users aren't always aware of some of our features. Learn, then share your knowledge with your own circles.

Write code! We've got lots of open issues - feel free to volunteer for one by commenting on the issue.

## Local development

Our repo is a monorepo that relies on [Yarn workspaces](https://yarnpkg.com/features/workspaces) and [Yarn Plug'n'Play](https://yarnpkg.com/features/pnp) to run smoothly.

To get started:

**Step 1: Fork this repo**

Fork by clicking [here](https://github.com/fern-api/fern/fork).

**Step 2: Clone your fork and open in VSCode**

```
git clone <your fork>
cd fern
code .
```

**Step 3: Install dependencies**

```
yarn
```

**Step 4: Use the "workspace" version of Typescript**

1. Open any TypeScript file in VSCode
2. Open the Command Palette (Cmd+Shift+P on Mac) and select `Typescript: Select TypeScript Version...`
3. Choose `Use Workspace Version`

This tells VSCode to rely on the version of TypeScript that lives in `.yarn/sdks/typescript`, which
is modified to work with Yarn PNP.

**Step 5: Install Husky**

Run `yarn husky install` from the root of the repo and this will configure pre-commit hooks that will
lint your changes.

### Compiling

To compile the packages in this monorepo, run `yarn compile`.

### Tests

This repo contains both unit tests and integration (end-to-end) tests.

To run the unit tests: `yarn test`.

To run the integration tests: `yarn test:ete`.

Many of our tests rely on [Jest snapshot testing](https://jestjs.io/docs/snapshot-testing). To rewrite snapshots, use `-u`: `yarn test -u` and `yarn test:ete -u`.

### CLI

To build the CLI, run either:

- `yarn dist:cli:dev`. This compiles and bundles a CLI that communicates with our dev cloud environment. The CLI is outputted to `packages/cli/cli/dist/dev/cli.cjs`.

- `yarn dist:cli:prod`. This compiles and bundles a CLI that communicates with our production cloud environment. The CLI is outputted to `packages/cli/cli/dist/prod/cli.cjs`.

To run the locally-generated CLI, run:

```
FERN_NO_VERSION_REDIRECTION=true node <path to CLI> <args>
```

### Docs UI

To build and run the NextJS docs UI, run either:

- `yarn workspace @fern-api/fe-bundle dev:fern-dev`. This compiles and runs a NextJS app that communicates with our dev cloud environment.

- `yarn workspace @fern-api/fe-bundle dev:fern-prod`. This compiles and runs a NextJS app that communicates with our cloud production environment.

The frontend is served at `localhost:3000`. You can configure which docs are loaded by using `.env.local`:

```bash
# packages/ui/fe-bundle/.env.local

# uncomment the next line when targeting the production cloud environment
# NEXT_PUBLIC_DOCS_DOMAIN=proficientai.docs.buildwithfern.com

# uncomment the next line when targeting the dev cloud environment
# NEXT_PUBLIC_DOCS_DOMAIN=vellum.docs.dev.buildwithfern.com
```
