import { Audiences, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, stringifyLargeObject } from "@fern-api/fs-utils";
import { migrateIntermediateRepresentationThroughVersion } from "@fern-api/ir-migrations";
import { serialization as IrSerialization } from "@fern-api/ir-sdk";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import { convertOpenApiWorkspaceToFernWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import { writeFile } from "fs/promises";
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
    casingVersion
}: {
    project: Project;
    irFilepath: AbsoluteFilePath;
    cliContext: CliContext;
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
    audiences: Audiences;
    version: string | undefined;
    keywords: string[] | undefined;
    smartCasing: boolean;
    casingVersion: generatorsYml.CasingVersion | undefined;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                cliContext.logger.info(`Generating IR for workspace ${workspace.name}`);
                let fernWorkspace: FernWorkspace;
                if (workspace.type === "fern") {
                    cliContext.logger.info("Found a fern workspace");
                    fernWorkspace = workspace;
                } else {
                    workspace.specs = workspace.specs.map((spec) => ({
                        ...spec,
                        settings: {
                            audiences: spec.settings?.audiences ?? [],
                            shouldUseTitleAsName: spec.settings?.shouldUseTitleAsName ?? true,
                            shouldUseUndiscriminatedUnionsWithLiterals:
                                spec.settings?.shouldUseUndiscriminatedUnionsWithLiterals ?? false
                        }
                    }));
                    fernWorkspace = await convertOpenApiWorkspaceToFernWorkspace(
                        workspace,
                        context,
                        false,
                        generationLanguage
                    );
                }

                const intermediateRepresentation = await getIntermediateRepresentation({
                    workspace: fernWorkspace,
                    context,
                    generationLanguage,
                    keywords,
                    smartCasing,
                    casingVersion,
                    disableExamples: false,
                    audiences,
                    version
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
    keywords,
    smartCasing,
    casingVersion,
    disableExamples,
    version
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
    keywords: string[] | undefined;
    smartCasing: boolean;
    casingVersion: generatorsYml.CasingVersion | undefined;
    disableExamples: boolean;
    audiences: Audiences;
    version: string | undefined;
}): Promise<unknown> {
    const intermediateRepresentation = await generateIrForFernWorkspace({
        workspace,
        context,
        generationLanguage,
        audiences,
        keywords,
        smartCasing,
        casingVersion,
        disableExamples
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
