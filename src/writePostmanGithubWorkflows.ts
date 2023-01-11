import { GeneratorConfig, GithubOutputMode } from "@fern-fern/generator-exec-sdk/resources";
import endent from "endent";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { COLLECTION_OUTPUT_FILENAME } from "./writePostmanCollection";

export async function writePostmanGithubWorkflows({
    config,
    githubOutputMode,
}: {
    config: GeneratorConfig;
    githubOutputMode: GithubOutputMode;
}): Promise<void> {
    if (githubOutputMode.publishInfo == null) {
        return;
    }
    if (githubOutputMode.publishInfo.type != "postman") {
        throw new Error(
            `Expected to receive npm publish info but received ${githubOutputMode.publishInfo.type} instead`
        );
    }
    const workflowYaml = endent`name: ci
    on: [push]
    
    jobs:
      
      publish:
        if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
        runs-on: ubuntu-latest
        
        steps:
          - name: Checkout repo
            uses: actions/checkout@v3
          
          - name: Publish Postman Collection
            uses: fern-api/action-postman-sync@v1.8
            with:
              api-key: \${{ secrets.${githubOutputMode.publishInfo.apiKeyEnvironmentVariable} }}
              workspace-id: \${{ secrets.${githubOutputMode.publishInfo.workspaceIdEnvironmentVariable} }}
              collection-path: ${COLLECTION_OUTPUT_FILENAME}`;
    const githubWorkflowsDir = path.join(config.output.path, ".github", "workflows");
    await mkdir(githubWorkflowsDir, { recursive: true });
    await writeFile(`${githubWorkflowsDir}/ci.yml`, workflowYaml);
}
