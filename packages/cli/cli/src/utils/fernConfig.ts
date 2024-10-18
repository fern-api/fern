import { mkdir, writeFile } from "fs/promises";
import path from "path";
import simpleGit, { SimpleGit } from "simple-git";

async function writeGithubWorkflows() {
    // TODO: add the fern token to the repository secrets
    const workflow = `
name: Release SDKs

on:
  workflow_dispatch:
    inputs:
      version:
        description: "The version of the SDK that you would like to release"
        required: true
        type: string

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Setup node
        uses: actions/setup-node@v3

      - name: Download Fern
        run: npm install -g fern-api

      - name: Release Go SDK
        env:
          FERN_TOKEN: $\{\{ secrets.FERN_TOKEN \}\}
        run: |
          fern generate --version $\{\{ inputs.version \}\} --log-level debug
`;
    const filepath = `${process.cwd()}/.github/workflows/sdk.yml`;
    await mkdir(path.dirname(filepath), { recursive: true });
    await writeFile(filepath, workflow);
}

async function writeReadme(organization: string) {
    const readme = `
# ${organization}'s Fern Configuration

This repository contains your Fern configuration:

- [OpenAPI Spec](./fern/openapi/openapi.json)
- [SDK generator config](./fern/generators.yml)

## Validating your OpenAPI spec

To validate your API, run:

\`\`\`sh
npm install -g fern-api # only required once
fern check
\`\`\`

## Updating your SDKs

To update your SDKs, simply run the \`Release SDKs\` GitHub Action with the desired version for the release. Under the hood, this leverages the Fern CLI:

\`\`\`sh
npm install -g fern-api # only required once
fern generate
\`\`\`
`;
    await writeFile(`${process.cwd()}/README.md`, readme);
}

export async function writeFernConfigRepoAdditions(organization: string) {
    await writeGithubWorkflows();
    await writeReadme(organization);
}

export async function initializeAndPushRepository(remote: string, workingDirectory: string = process.cwd()) {
    const git = simpleGit(workingDirectory);
    await git.init();
    await git.branch(["-M", "main"]);
    await git.addRemote("origin", remote);
    await git.add(["-A"]);
    await git.commit("(chore): :herb: initialize Fern configuration");
    await git.push();
}
