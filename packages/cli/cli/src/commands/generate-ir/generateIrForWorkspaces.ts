import path from "path";

import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { Audiences, generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, streamObjectToFile, stringifyLargeObject } from "@fern-api/fs-utils";
import { migrateIntermediateRepresentationThroughVersion } from "@fern-api/ir-migrations";
import { serialization as IrSerialization } from "@fern-api/ir-sdk";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";

import { CliContext } from "../../cli-context/CliContext";
import { generateIrForFernWorkspace } from "./generateIrForFernWorkspace";

export async function generateIrForWorkspaces({
    project,
    irFilepath,
    cliContext,
    generationLanguage,
    audiences,
    version,
    keywords,
    smartCasing,
    readme
}: {
    project: Project;
    irFilepath: AbsoluteFilePath;
    cliContext: CliContext;
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
    audiences: Audiences;
    version: string | undefined;
    keywords: string[] | undefined;
    smartCasing: boolean;
    readme: generatorsYml.ReadmeSchema | undefined;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                cliContext.logger.info(`Generating IR for workspace ${workspace.workspaceName ?? "api"}`);
                const fernWorkspace = await workspace.toFernWorkspace({ context });

                const intermediateRepresentation = await getIntermediateRepresentation({
                    workspace: fernWorkspace,
                    context,
                    generationLanguage,
                    keywords,
                    smartCasing,
                    disableExamples: false,
                    audiences,
                    version,
                    readme
                });

                const irOutputFilePath = path.resolve(irFilepath);
                await streamObjectToFile(AbsoluteFilePath.of(irOutputFilePath), intermediateRepresentation);
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
    keywords,
    smartCasing,
    disableExamples,
    version,
    readme
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
    keywords: string[] | undefined;
    smartCasing: boolean;
    disableExamples: boolean;
    audiences: Audiences;
    version: string | undefined;
    readme: generatorsYml.ReadmeSchema | undefined;
}): Promise<unknown> {
    const intermediateRepresentation = await generateIrForFernWorkspace({
        workspace,
        context,
        generationLanguage,
        audiences,
        keywords,
        smartCasing,
        disableExamples,
        readme
    });

    if (version == null) {
        return IrSerialization.IntermediateRepresentation.jsonOrThrow(intermediateRepresentation, {
            unrecognizedObjectKeys: "strip"
        });
    }

    return migrateIntermediateRepresentationThroughVersion({
        intermediateRepresentation,
        version,
        context
    });
}
