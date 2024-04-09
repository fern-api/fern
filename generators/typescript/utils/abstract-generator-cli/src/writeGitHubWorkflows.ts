import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function writeGitHubWorkflows({
    githubOutputMode,
    isPackagePrivate,
    pathToProject
}: {
    githubOutputMode: FernGeneratorExec.GithubOutputMode;
    isPackagePrivate: boolean;
    pathToProject: AbsoluteFilePath;
}): Promise<void> {
    if (githubOutputMode.publishInfo != null && githubOutputMode.publishInfo.type !== "npm") {
        throw new Error(
            `Expected to receive npm publish info but received ${githubOutputMode.publishInfo.type} instead`
        );
    }
    const workflowYaml = constructWorkflowYaml({
        publishInfo: githubOutputMode.publishInfo,
        isPackagePrivate
    });
    const githubWorkflowsDir = path.join(pathToProject, ".github", "workflows");
    await mkdir(githubWorkflowsDir, { recursive: true });
    await writeFile(`${githubWorkflowsDir}/ci.yml`, workflowYaml);
}

function constructWorkflowYaml({
    publishInfo,
    isPackagePrivate
}: {
    publishInfo: FernGeneratorExec.NpmGithubPublishInfo | undefined;
    isPackagePrivate: boolean;
}) {
    let workflowYaml = `name: ci

on: [push]

jobs:
  compile:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Set up node
        uses: actions/setup-node@v3

      - name: Compile
        run: yarn && yarn build

  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Set up node
        uses: actions/setup-node@v3

      - name: Test
        run: |
          yarn
          yarn fern test --command='jest --env=node'
          yarn fern test --command='jest --env=jsdom'

  publish:
    needs: [ compile, test ]
    if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Set up node
        uses: actions/setup-node@v3

      - name: Install dependencies
        run: yarn install

      - name: Build
        run: yarn build`;

    if (publishInfo != null) {
        workflowYaml += `

      - name: Publish to npm
        run: |
          npm config set //registry.npmjs.org/:_authToken \${NPM_TOKEN}
          npm publish --access ${isPackagePrivate ? "restricted" : "public"}
        env:
          NPM_TOKEN: \${{ secrets.${publishInfo.tokenEnvironmentVariable} }}`;
    }

    return workflowYaml;
}
