import path from "path";

import { Audiences, generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, streamObjectToFile, stringifyLargeObject } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";
import { generateIrForFernWorkspace } from "../generate-ir/generateIrForFernWorkspace";

export async function generateDynamicIrForWorkspaces({
    project,
    irFilepath,
    cliContext,
    generationLanguage,
    audiences,
    version,
    keywords,
    smartCasing
}: {
    project: Project;
    irFilepath: AbsoluteFilePath;
    cliContext: CliContext;
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
    audiences: Audiences;
    version: string | undefined;
    keywords: string[] | undefined;
    smartCasing: boolean;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                cliContext.logger.info(`Generating IR for workspace ${workspace.workspaceName ?? "api"}`);
                const fernWorkspace = await workspace.toFernWorkspace({ context });

                const intermediateRepresentation = await generateIrForFernWorkspace({
                    workspace: fernWorkspace,
                    context,
                    generationLanguage,
                    keywords,
                    smartCasing,
                    disableExamples: false,
                    audiences,
                    readme: undefined
                });

                if (intermediateRepresentation.dynamic == null) {
                    throw new Error("Internal error; dynamic IR was not generated");
                }

                const irOutputFilePath = path.resolve(irFilepath);
                await streamObjectToFile(AbsoluteFilePath.of(irOutputFilePath), intermediateRepresentation.dynamic);
                context.logger.info(`Wrote IR to ${irOutputFilePath}`);
            });
        })
    );
}
