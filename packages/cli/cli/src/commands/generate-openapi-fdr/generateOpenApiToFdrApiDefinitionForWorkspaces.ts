import { writeFile } from "fs/promises";
import path from "path";

import { Audiences } from "@fern-api/configuration";
import { generateFdrFromOpenApiWorkspace, generateFdrFromOpenApiWorkspaceV3 } from "@fern-api/docs-resolver";
import { AbsoluteFilePath, stringifyLargeObject } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";

export async function generateOpenApiToFdrApiDefinitionForWorkspaces({
    project,
    outputFilepath,
    cliContext,
    directFromOpenapi,
    audiences
}: {
    project: Project;
    outputFilepath: AbsoluteFilePath;
    cliContext: CliContext;
    directFromOpenapi: boolean;
    audiences: Audiences;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const fdrApiDefinition = directFromOpenapi
                    ? await generateFdrFromOpenApiWorkspaceV3(workspace, context, audiences)
                    : await generateFdrFromOpenApiWorkspace(workspace, context);

                const resolvedOutputFilePath = path.resolve(outputFilepath);
                await writeFile(resolvedOutputFilePath, await stringifyLargeObject(fdrApiDefinition, { pretty: true }));
                context.logger.info(`Wrote FDR API definition to ${resolvedOutputFilePath}`);
            });
        })
    );
}
