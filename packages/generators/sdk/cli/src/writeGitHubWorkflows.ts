import { FernGeneratorExec } from "@fern-fern/generator-exec-client";
import endent from "endent";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function writeGitHubWorkflows({
    config,
    githubOutputMode,
}: {
    config: FernGeneratorExec.GeneratorConfig;
    githubOutputMode: FernGeneratorExec.GithubOutputMode;
}): Promise<void> {
    if (githubOutputMode.publishInfo.type != "npm") {
        throw new Error(
            `Expected to receive npm publish info but received ${githubOutputMode.publishInfo.type} instead`
        );
    }
    const workflowYaml = endent`name: ci

    on: [push]
    
    jobs:
      compile:
        runs-on: ubuntu-latest
    
        steps:
          - name: Checkout repo
            uses: actions/checkout@3
    
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
    
          - name: Publish to npm
            run: |
              npm config set //registry.npmjs.org/:_authToken \${NPM_TOKEN}
              npm publish --ignore-scripts
            env:
              NPM_TOKEN: \${{ secrets.${githubOutputMode.publishInfo.tokenEnvironmentVariable} }}`;
    const githubWorkflowsDir = path.join(config.output.path, ".github", "workflows");
    await mkdir(githubWorkflowsDir, { recursive: true });
    await writeFile(`${githubWorkflowsDir}/ci.yml`, workflowYaml);
}
