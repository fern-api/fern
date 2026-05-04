import { Audiences } from "@fern-api/configuration";
import { generateFdrFromOpenApiWorkspaceV3 } from "@fern-api/docs-resolver";
import { AbsoluteFilePath, streamObjectToFile } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import path from "path";

import { CliContext } from "../../cli-context/CliContext.js";

export async function generateOpenApiToFdrApiDefinitionForWorkspaces({
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
                const fdrApiDefinition = await generateFdrFromOpenApiWorkspaceV3(workspace, context, audiences);

                const resolvedOutputFilePath = AbsoluteFilePath.of(path.resolve(outputFilepath));
                await streamObjectToFile(resolvedOutputFilePath, fdrApiDefinition, { pretty: true });
                context.logger.info(`Wrote FDR API definition to ${resolvedOutputFilePath}`);
            });
        })
    );
}
