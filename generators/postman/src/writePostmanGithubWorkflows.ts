import endent from "endent";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { GeneratorConfig, GithubOutputMode } from "@fern-api/base-generator";

import { PostmanGeneratorConfigSchema } from "./config/schemas/PostmanGeneratorConfigSchema";
import { getCollectionOutputFilename } from "./writePostmanCollection";

export async function writePostmanGithubWorkflows({
    config,
    githubOutputMode
}: {
    config: GeneratorConfig;
    githubOutputMode: GithubOutputMode;
}): Promise<void> {
    if (githubOutputMode.publishInfo == null) {
        return;
    }
    if (githubOutputMode.publishInfo.type !== "postman") {
        throw new Error(
            `Expected to receive npm publish info but received ${githubOutputMode.publishInfo.type} instead`
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const postmanGeneratorConfig = config.customConfig as any as PostmanGeneratorConfigSchema;
    const collectionOutputFilename = getCollectionOutputFilename(postmanGeneratorConfig);

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
              collection-path: ${collectionOutputFilename}`;
    const githubWorkflowsDir = path.join(config.output.path, ".github", "workflows");
    await mkdir(githubWorkflowsDir, { recursive: true });
    await writeFile(`${githubWorkflowsDir}/ci.yml`, workflowYaml);
}
