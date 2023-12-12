# Contributing

Thanks for being here! Fern gives a lot of importance to being a community project, and we rely on your help as much as you rely on ours. If you have any feedback on what we could improve, please [open an issue](https://github.com/fern-api/fern/issues/new) to discuss it!

## Opening an issue

All contributions start with [an issue](https://github.com/fern-api/fern/issues/new). Even if you have a good idea of what the problem is and what the solution looks like, please open an issue. This will give us an opportunity to align on the problem and solution, and to deconflict in the case that somebody else is already working on it.

## How can you help?

Review [our documentation](https://buildwithfern.com/docs)! We appreciate any help we can get that makes our documentation more digestible.

Talk about Fern in your local meetups! Even our users aren't always aware of some of our features. Learn, then share your knowledge with your own circles.

Write code! We've got lots of open issues - feel free to volunteer for one by commenting on the issue.

## Writing Documentation

Our documentation is powered by Fern's Docs product. All of the configuration for the docs lives in
[docs.yml](./fern/docs.yml).

To edit the docs, you can modify `docs.yml` or any of the markdown that it references.

To validate that the docs, run:

```
npm install -g fern-api
fern check
```

When you make a PR to update the docs, a PR preview link will be generated which will allow you
to test if your changes came out as intended.

## Local Development

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

**Note**: use Node v18 when rewriting snapshots. `node -v` will let you know what version you're on. Node v20 is incompatible. Here are instructions on [how to change your Node version](https://chat.openai.com/share/776005d1-f3a8-4ad4-8851-9783e937bd61). You'll also need to install the open package by running `yarn add open`.

### CLI

To build the CLI, run either:

- `yarn dist:cli:dev`. This compiles and bundles a CLI that communicates with our dev cloud environment. The CLI is outputted to `packages/cli/cli/dist/dev/cli.cjs`.

- `yarn dist:cli:prod`. This compiles and bundles a CLI that communicates with our production cloud environment. The CLI is outputted to `packages/cli/cli/dist/prod/cli.cjs`.

To run the locally-generated CLI, run:

```
FERN_NO_VERSION_REDIRECTION=true node <path to CLI> <args>
```

## Intermediate Representation

Fern generators read in IR (Intermediate Representation) and spit out
generated files. The IR is a JSON data structure that includes information
about your API and any additional information that may be convenient for a
code generator. For example, the IR includes all possible casings of every
string (e.g. `snake_case`, `camelCase`, `PascalCase`) so that the
generators don't need to implement this individually.

### IR Versioning

As we add more features to the API definition, we introduce new versions
of the IR. For example, if we wanted to add a new auth mechanism, we would
eventually need to add it to the IR so that the generators could generate
relevant code.

Each generator is pinned to an IR Version. Different versions of the generator,
can dependend on differnt versions of the IR. For example, the Python SDK generator released
2 months ago depends on an older IR than the one released this week.

> Note: The IR schema is modeled as a Fern Definition and you can see several
> versions of them in the `./fern` folder.

The Fern CLI should be able to run old generators so whenver we
introduce a new IR version, we write a migration. In other words if you introduce IR V20, then
you will have to write a migration from IR V20 -> IR V19 so that any generator
that depends on a lower IR version can continue to be run from our CLI.

### How to add a new IR Version?

**Step 1: Define the new IR**

1. Create a new Fern Definition for the IR version `fern/ir-types-vXXX`.
   Copy the latest IR Fern Definition as a starting point.
2. Introduce any changes you want in the new IR Fern Definition.
3. Generate a TypeScript SDK for the IR by running `fern generate --api ir-types-vXXX`
4. Update all `package.json` files to use new `ir-sdk` npm version.
   Run `yarn install`
5. Run `yarn compile`. You will see compile errors related to your schema changes.

**Step 2: Write a reverse migration**

In the `ir-migrations` package, introduce a new migration.
You can copy the latest migration as a starting point.
