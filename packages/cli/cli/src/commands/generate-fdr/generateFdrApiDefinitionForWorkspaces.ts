import { Audiences } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, stringifyLargeObject } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { convertIrToFdrApi } from "@fern-api/register";
import { convertOpenApiWorkspaceToFernWorkspace } from "@fern-api/workspace-loader";
import { writeFile } from "fs/promises";
import path from "path";
import { CliContext } from "../../cli-context/CliContext";
import { generateIrForFernWorkspace } from "../generate-ir/generateIrForFernWorkspace";

export async function generateFdrApiDefinitionForWorkspaces({
    project,
    outputFilepath,
    cliContext,
    audiences
}: {
    project: Project;
    outputFilepath: AbsoluteFilePath;
    cliContext: CliContext;
    audiences: Audiences;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const fernWorkspace =
                    workspace.type === "openapi"
                        ? await convertOpenApiWorkspaceToFernWorkspace(workspace, context)
                        : workspace;

                const intermediateRepresentation = await generateIrForFernWorkspace({
                    workspace: fernWorkspace,
                    context,
                    generationLanguage: undefined,
                    audiences,
                    disableExamples: false
                });

                const apiDefinition = convertIrToFdrApi(intermediateRepresentation, {});

                const resolvedOutputFilePath = path.resolve(outputFilepath);
                await writeFile(resolvedOutputFilePath, await stringifyLargeObject(apiDefinition, { pretty: true }));
                context.logger.info(`Wrote FDR API definition to ${resolvedOutputFilePath}`);
            });
        })
    );
}
