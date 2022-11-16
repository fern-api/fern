import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { SdkCustomConfig } from "./custom-config/SdkCustomConfig";

export async function writeGitHubWorkflows({
    config,
    githubOutputMode,
    customConfig,
}: {
    config: FernGeneratorExec.GeneratorConfig;
    githubOutputMode: FernGeneratorExec.GithubOutputMode;
    customConfig: SdkCustomConfig;
}): Promise<void> {
    if (githubOutputMode.publishInfo != null && githubOutputMode.publishInfo.type !== "npm") {
        throw new Error(
            `Expected to receive npm publish info but received ${githubOutputMode.publishInfo.type} instead`
        );
    }
    const workflowYaml = constructWorkflowYaml({
        publishInfo: githubOutputMode.publishInfo,
        customConfig,
    });
    const githubWorkflowsDir = path.join(config.output.path, ".github", "workflows");
    await mkdir(githubWorkflowsDir, { recursive: true });
    await writeFile(`${githubWorkflowsDir}/ci.yml`, workflowYaml);
}
function constructWorkflowYaml({
    publishInfo,
    customConfig,
}: {
    publishInfo: FernGeneratorExec.NpmGithubPublishInfo | undefined;
    customConfig: SdkCustomConfig;
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
  
  publish:
    needs: [ compile ]
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
          npm publish --ignore-scripts --access ${customConfig.isPackagePrivate ? "restricted" : "public"}
        env:
          NPM_TOKEN: \${{ secrets.${publishInfo.tokenEnvironmentVariable} }}`;
    }

    return workflowYaml;
}
