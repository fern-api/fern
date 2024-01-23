# Contributing

Thanks for being here! Fern gives a lot of importance to being a community project, and we rely on your help as much as you rely on ours. If you have any feedback on what we could improve, please [open an issue](https://github.com/fern-api/fern-typescript/issues/new) to discuss it!

## Opening an issue

All contributions start with [an issue](https://github.com/fern-api/fern-typescript/issues/new). Even if you have a good idea of what the problem is and what the solution looks like, please open an issue. This will give us an opportunity to align on the problem and solution, and to deconflict in the case that somebody else is already working on it.

## How can you help?

Review [our documentation](https://buildwithfern.com/docs)! We appreciate any help we can get that makes our documentation more digestible.

Talk about Fern in your local meetups! Even our users aren't always aware of some of our features. Learn, then share your knowledge with your own circles.

Write code! We've got lots of open issues - feel free to volunteer for one by commenting on the issue.

## Local development

Our repo is a monorepo that relies on [Yarn workspaces](https://yarnpkg.com/features/workspaces) and [Yarn Plug'n'Play](https://yarnpkg.com/features/pnp) to run smoothly.

To get started:

**Step 1: Fork this repo**

Fork by clicking [here](https://github.com/fern-api/fern-typescript/fork).

**Step 2: Clone your fork and open in VSCode**

```
git clone <your fork>
cd fern-typescript
code .
```

**Step 3: Install dependencies**

```
yarn
```

**Step 4: Use the "workspace" vesion of Typescript**

1. Open any TypeScript file in VSCode
1. Open the Command Palette (Cmd+Shift+P on Mac) and select `Typescript: Select TypeScript Version...`
1. Choose `Use Workspace Version`

This tells VSCode to rely on the version of TypeScript that lives in `.yarn/sdks/typescript`, which
is modified to work with Yarn PNP.

### Compiling

To compile the packages in this monorepo, run `yarn compile`.

### Tests

To run the [SDK tests](packages/generators/sdk/cli/src/__test__/generate.test.ts):

```
yarn workspace @fern-typescript/sdk-generator-cli test
```

To run the [Express tests](packages/generators/express/cli/src/__test__/generate.test.ts):

```
yarn workspace @fern-typescript/express-generator-cli test
```
