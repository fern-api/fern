import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

export async function writeGitHubWorkflows({
    config,
    githubOutputMode,
    isPackagePrivate,
    pathToProject,
    publishToJsr
}: {
    config: FernGeneratorExec.GeneratorConfig;
    githubOutputMode: FernGeneratorExec.GithubOutputMode;
    isPackagePrivate: boolean;
    pathToProject: AbsoluteFilePath;
    publishToJsr: boolean;
}): Promise<void> {
    if (githubOutputMode.publishInfo != null && githubOutputMode.publishInfo.type !== "npm") {
        throw new Error(
            `Expected to receive npm publish info but received ${githubOutputMode.publishInfo.type} instead`
        );
    }
    const workflowYaml = constructWorkflowYaml({
        publishInfo: githubOutputMode.publishInfo,
        isPackagePrivate,
        config,
        publishToJsr
    });
    const githubWorkflowsDir = path.join(pathToProject, ".github", "workflows");
    await mkdir(githubWorkflowsDir, { recursive: true });
    await writeFile(`${githubWorkflowsDir}/ci.yml`, workflowYaml);
}

function constructWorkflowYaml({
    config,
    publishInfo,
    isPackagePrivate,
    publishToJsr
}: {
    config: FernGeneratorExec.GeneratorConfig;
    publishInfo: FernGeneratorExec.NpmGithubPublishInfo | undefined;
    isPackagePrivate: boolean;
    publishToJsr: boolean;
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
${getTestJob({ config })}`;
    // First condition is for resilience in the event that Fiddle isn't upgraded to include the new flag
    if (
        (publishInfo != null && publishInfo?.shouldGeneratePublishWorkflow == null) ||
        publishInfo?.shouldGeneratePublishWorkflow === true
    ) {
        const access = isPackagePrivate ? "restricted" : "public";
        workflowYaml += `
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
        run: yarn build

      - name: Publish to npm
        run: |
          npm config set //registry.npmjs.org/:_authToken \${NPM_TOKEN}
          if [[ \${GITHUB_REF} == *alpha* ]]; then
            npm publish --access ${access} --tag alpha
          elif [[ \${GITHUB_REF} == *beta* ]]; then
            npm publish --access ${access} --tag beta
          else
            npm publish --access ${access}
          fi
        env:
          NPM_TOKEN: \${{ secrets.${publishInfo.tokenEnvironmentVariable} }}`;
    }

    if (publishToJsr) {
        workflowYaml += `

  publish-jsr:
    if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
    needs: [ compile, test ]
    permissions:
      contents: read
      id-token: write # The OIDC ID token is used for authentication with JSR. 
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3
      
      - name: Set up node
        uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: yarn install
      
      - name: Build
        run: yarn build

      - name: Publish to JSR
        run: npx jsr publish`;
    }

    return workflowYaml;
}

function getTestJob({ config }: { config: FernGeneratorExec.GeneratorConfig }): string {
    //     if (config.writeUnitTests) {
    //         return `
    //   test:
    //     runs-on: ubuntu-latest

    //     steps:
    //       - name: Checkout repo
    //         uses: actions/checkout@v3

    //       - name: Set up node
    //         uses: actions/setup-node@v3

    //       - name: Test
    //         run: |
    //           yarn
    //           yarn fern test --command='jest --env=node'
    //           yarn fern test --command='jest --env=jsdom'
    // `;
    //     } else {
    return `
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Set up node
        uses: actions/setup-node@v3

      - name: Compile
        run: yarn && yarn test    
`;
    // }
}
