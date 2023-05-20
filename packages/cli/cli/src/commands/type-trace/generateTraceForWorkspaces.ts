import { Audiences } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, stringifyLargeObject } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { writeFile } from "fs/promises";
import path from "path";
import { CliContext } from "../../cli-context/CliContext";
import { convertOpenApiWorkspaceToFernWorkspace } from "../../utils/convertOpenApiWorkspaceToFernWorkspace";
import { generateIrForFernWorkspace } from "../generate-ir/generateIrForFernWorkspace";
import { generateTypeTrace } from "./generateTypeTrace";

export async function generateTraceForWorkspaces({
    project,
    typeTraceFilepath,
    cliContext,
    audiences,
}: {
    project: Project;
    typeTraceFilepath: AbsoluteFilePath;
    cliContext: CliContext;
    audiences: Audiences;
}): Promise<void> {
    await Promise.all(
        project.workspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const fernWorkspace =
                    workspace.type === "openapi"
                        ? await convertOpenApiWorkspaceToFernWorkspace(workspace, context)
                        : workspace;

                const intermediateRepresentation = await generateIrForFernWorkspace({
                    workspace: fernWorkspace,
                    context,
                    audiences,
                    generationLanguage: undefined,
                });

                const typeTrace = generateTypeTrace(intermediateRepresentation, context.logger);

                const typeTraceOutputFilePath = path.resolve(typeTraceFilepath);
                await writeFile(
                    typeTraceOutputFilePath,
                    await stringifyLargeObject(typeTrace, { pretty: true })
                );
                context.logger.info(`Wrote type trace to ${typeTraceOutputFilePath}`);
            });
        })
    );
}