import { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import { Audiences, generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, streamObjectToFile } from "@fern-api/fs-utils";
import { migrateIntermediateRepresentationThroughVersion } from "@fern-api/ir-migrations";
import { serialization as IrSerialization } from "@fern-api/ir-sdk";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import path from "path";

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
    readme,
    directFromOpenapi,
    disableExamples
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
    directFromOpenapi: boolean;
    disableExamples: boolean;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                cliContext.logger.info(`Generating IR for workspace ${workspace.workspaceName ?? "api"}`);

                const intermediateRepresentation = await getIntermediateRepresentation({
                    workspace,
                    context,
                    generationLanguage,
                    keywords,
                    smartCasing,
                    disableExamples,
                    audiences,
                    version,
                    readme,
                    directFromOpenapi
                });

                const irOutputFilePath = AbsoluteFilePath.of(path.resolve(irFilepath));
                await streamObjectToFile(irOutputFilePath, intermediateRepresentation, { pretty: true });
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
    readme,
    directFromOpenapi
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    context: TaskContext;
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
    keywords: string[] | undefined;
    smartCasing: boolean;
    disableExamples: boolean;
    audiences: Audiences;
    version: string | undefined;
    readme: generatorsYml.ReadmeSchema | undefined;
    directFromOpenapi: boolean;
}): Promise<unknown> {
    let intermediateRepresentation;
    if (directFromOpenapi && workspace instanceof OSSWorkspace) {
        intermediateRepresentation = await workspace.getIntermediateRepresentation({
            context,
            audiences,
            enableUniqueErrorsPerEndpoint: true,
            generateV1Examples: false,
            logWarnings: false
        });
    } else {
        const fernWorkspace = await workspace.toFernWorkspace({ context });

        intermediateRepresentation = await generateIrForFernWorkspace({
            workspace: fernWorkspace,
            context,
            generationLanguage,
            audiences,
            keywords,
            smartCasing,
            disableExamples,
            readme,
            disableDynamicExamples: true
        });
    }

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
