import { Audiences, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, streamObjectToFile, stringifyLargeObject } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import path from "path";
import { CliContext } from "../../cli-context/CliContext";
import { generateIrForFernWorkspace } from "../generate-ir/generateIrForFernWorkspace";
import { convertIrToDynamicSnippetsIr } from "@fern-api/dynamic-snippets";

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

                const dynamicIntermediateRepresentation = await convertIrToDynamicSnippetsIr(
                    intermediateRepresentation
                );

                const irOutputFilePath = path.resolve(irFilepath);
                await streamObjectToFile(AbsoluteFilePath.of(irOutputFilePath), dynamicIntermediateRepresentation);
                context.logger.info(`Wrote IR to ${irOutputFilePath}`);
            });
        })
    );
}
