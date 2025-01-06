# Setup

The Fern repo is primarily written in TypeScript and relies on [PnPm](https://pnpm.io/) for package management.

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
