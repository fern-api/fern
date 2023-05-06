import { Audiences } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, stringifyLargeObject } from "@fern-api/fs-utils";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { migrateIntermediateRepresentationThroughVersion } from "@fern-api/ir-migrations";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { writeFile } from "fs/promises";
import path from "path";
import { CliContext } from "../../cli-context/CliContext";
import { convertOpenApiWorkspaceToFernWorkspace } from "../generate/generateWorkspaces";
import { generateIrForFernWorkspace } from "./generateIrForFernWorkspace";

export async function generateIrForWorkspaces({
    project,
    irFilepath,
    cliContext,
    generationLanguage,
    audiences,
    version,
}: {
    project: Project;
    irFilepath: AbsoluteFilePath;
    cliContext: CliContext;
    generationLanguage: GenerationLanguage | undefined;
    audiences: Audiences;
    version: string | undefined;
}): Promise<void> {
    await Promise.all(
        project.workspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const fernWorkspace =
                    workspace.type === "openapi"
                        ? await convertOpenApiWorkspaceToFernWorkspace(workspace, context)
                        : workspace;

                const intermediateRepresentation = await getIntermediateRepresentation({
                    workspace: fernWorkspace,
                    context,
                    generationLanguage,
                    audiences,
                    version,
                });

                const irOutputFilePath = path.resolve(irFilepath);
                await writeFile(
                    irOutputFilePath,
                    await stringifyLargeObject(intermediateRepresentation, { pretty: true })
                );
                context.logger.info(`Wrote IR to ${irOutputFilePath}`);
            });
        })
    );
}

async function getIntermediateRepresentation({
    workspace,
    context,
    generationLanguage,
    audiences,
    version,
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    generationLanguage: GenerationLanguage | undefined;
    audiences: Audiences;
    version: string | undefined;
}): Promise<unknown> {
    const intermediateRepresentation = await generateIrForFernWorkspace({
        workspace,
        context,
        generationLanguage,
        audiences,
    });

    if (version == null) {
        return intermediateRepresentation;
    }

    return migrateIntermediateRepresentationThroughVersion({
        intermediateRepresentation,
        version,
        context,
    });
}
