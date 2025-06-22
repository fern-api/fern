import { writeFile } from "fs/promises";
import yaml from "js-yaml";

import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { basename } from "@fern-api/path-utils";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";
import { convertIrToOpenApi } from "./convertIrToOpenApi";

export async function generateOpenAPIForWorkspaces({
    project,
    cliContext,
    outputPath
}: {
    project: Project;
    cliContext: CliContext;
    outputPath: string;
}) {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            if (!(workspace instanceof FernWorkspace)) {
                cliContext.failWithoutThrowing("Only Fern Definition APIs are supported for OpenAPI export.");
                return;
            }

            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const ir = await generateIntermediateRepresentation({
                    workspace,
                    audiences: { type: "all" },
                    generationLanguage: undefined,
                    keywords: undefined,
                    smartCasing: false,
                    exampleGeneration: { disabled: true },
                    readme: undefined,
                    version: undefined,
                    packageName: undefined,
                    context,
                    sourceResolver: new SourceResolverImpl(context, workspace)
                });
                const openapi = convertIrToOpenApi({
                    apiName: workspace.workspaceName ?? "api",
                    ir,
                    mode: "openapi"
                });

                const filename: string = basename(outputPath);
                if (outputPath.endsWith(".json")) {
                    await writeFile(filename, JSON.stringify(openapi, undefined, 2));
                } else {
                    await writeFile(outputPath, yaml.dump(openapi));
                }
            });
        })
    );
}
