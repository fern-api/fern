# Contributing

Thanks for being here! Fern gives a lot of importance to being a community project, and we rely on your help as much as you rely on ours. If you have any feedback on what we could improve, please [open an issue](https://github.com/fern-api/fern/issues/new) to discuss it!

## Opening an issue

All contributions starts with [an issue](https://github.com/fern-api/fern/issues/new). Even if you have a good idea of what the problem is and what the solution looks like, please open an issue. This will give us an opportunity to align on the problem and solution, and to deconflict in the case that somebody else is already working on it.

## How can you help?

Review our documentation! Any help we can get that makes our documentation more digestible is appreciated!

Talk about Fern in your local meetups! Even our users aren't always aware of some of our features. Learn, then share your knowledge with your own circles!

Write code! We've got lots of open issues - feel free to volunteer for closing one by commenting on the issue.

## Local development

Our repo is a monorepo that relies on [Yarn workspaces](https://yarnpkg.com/features/workspaces) and [Yarn Plug'n'Play](https://yarnpkg.com/features/pnp) to run smoothly.

To get started:

**Step 1: Clone this repo and open in VSCode**

```
git clone git@github.com:fern-api/fern.git
cd fern
code .
```

**Step 2: Install dependencies**

```
yarn
```

**Step 3: Use the "workspace" vesion of Typescript**

1. Open any TypeScript file in VSCode
1. Open the Command Palette (Cmd+Shift+P on Mac) and select `Typescript: Select TypeScript Version...`
1. Choose `Use Workspace Version`

This tells VSCode to rely on the version of TypeScript that lives in `.yarn/sdks/typescript`, which
is modified to work with Yarn PNP.

### Compiling

To compile all\* the packages in this monorepo, run `yarn compile`.

Due to NextJS requiring `noEmit: true` in tsconfig.json, \* `yarn compile` doesn't compile the NextJS app (`packages/ui/fe-bundle`). If you'd like, you can compile this separately with `yarn workspace @fern-api/fe-bundle compile`.

### Tests

This repo contains both unit tests and integration (end-to-end) tests.

To run the unit tests: `yarn test`.

To run the integration tests: `yarn test:ete`.

### CLI

To build the CLI, run:

- `yarn dist:cli:dev`. This compiles and bundles a CLI that communicates with our dev cloud environment. The CLI is outputted to `packages/cli/cli/dist/dev/cli.cjs`.

- `yarn dist:cli:prod`. This compiles and bundles a CLI that communicates with our production cloud environment. The CLI is outputted to `packages/cli/cli/dist/prod/cli.cjs`.

To run the locally-generated CLI, run:

```
FERN_NO_VERSION_REDIRECTION=true node <path to CLI> <args>
```

### Docs UI

To build and run the NextJS docs UI, run:

- `yarn workspace @fern-api/fe-bundle dev:fern-dev`. This compiles and runs a NextJS app that communicates with our dev environment.

- `yarn workspace @fern-api/fe-bundle dev:fern-prod`. This compiles and runs a NextJS app that communicates with our production environment.

The frontend is served at `localhost:3000`.
