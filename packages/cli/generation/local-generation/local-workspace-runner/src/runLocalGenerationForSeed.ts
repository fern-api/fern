import { generatorsYml, SNIPPET_JSON_FILENAME, SNIPPET_TEMPLATES_JSON_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { writeFilesToDiskAndRunGenerator } from "./runGenerator";
import { getWorkspaceTempDir } from "./runLocalGenerationForWorkspace";

export async function runLocalGenerationForSeed({
    organization,
    absolutePathToFernConfig,
    workspace,
    generatorGroup,
    keepDocker,
    context,
    irVersionOverride,
    outputVersionOverride
}: {
    organization: string;
    workspace: FernWorkspace;
    absolutePathToFernConfig: AbsoluteFilePath | undefined;
    generatorGroup: generatorsYml.GeneratorGroup;
    keepDocker: boolean;
    context: TaskContext;
    irVersionOverride: string;
    outputVersionOverride: string | undefined;
}): Promise<void> {
    const workspaceTempDir = await getWorkspaceTempDir();

    const results = await Promise.all(
        generatorGroup.generators.map(async (generatorInvocation) => {
            return context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                if (generatorInvocation.absolutePathToLocalOutput == null) {
                    interactiveTaskContext.failWithoutThrowing(
                        "Cannot generate because output location is not local-file-system"
                    );
                } else {
                    await writeFilesToDiskAndRunGenerator({
                        organization,
                        absolutePathToFernConfig,
                        workspace,
                        generatorInvocation,
                        absolutePathToLocalOutput: generatorInvocation.absolutePathToLocalOutput,
                        absolutePathToLocalSnippetJSON: generatorInvocation.absolutePathToLocalOutput
                            ? AbsoluteFilePath.of(
                                  join(
                                      generatorInvocation.absolutePathToLocalOutput,
                                      RelativeFilePath.of(SNIPPET_JSON_FILENAME)
                                  )
                              )
                            : undefined,
                        absolutePathToLocalSnippetTemplateJSON: generatorInvocation.absolutePathToLocalOutput
                            ? AbsoluteFilePath.of(
                                  join(
                                      generatorInvocation.absolutePathToLocalOutput,
                                      RelativeFilePath.of(SNIPPET_TEMPLATES_JSON_FILENAME)
                                  )
                              )
                            : undefined,
                        audiences: generatorGroup.audiences,
                        workspaceTempDir,
                        keepDocker,
                        context: interactiveTaskContext,
                        irVersionOverride,
                        outputVersionOverride,
                        writeUnitTests: true,
                        generateOauthClients: true,
                        generatePaginatedClients: true
                    });
                    interactiveTaskContext.logger.info(
                        chalk.green("Wrote files to " + generatorInvocation.absolutePathToLocalOutput)
                    );
                }
            });
        })
    );

    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }
}

export async function writeIrAndConfigJson({
    organization,
    absolutePathToFernConfig,
    workspace,
    generatorGroup,
    keepDocker,
    context,
    irVersionOverride,
    outputVersionOverride
}: {
    organization: string;
    workspace: FernWorkspace;
    absolutePathToFernConfig: AbsoluteFilePath | undefined;
    generatorGroup: generatorsYml.GeneratorGroup;
    keepDocker: boolean;
    context: TaskContext;
    irVersionOverride: string | undefined;
    outputVersionOverride: string | undefined;
}): Promise<void> {
    const workspaceTempDir = await getWorkspaceTempDir();

    await Promise.all(
        generatorGroup.generators.map(async (generatorInvocation) => {
            return context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                if (generatorInvocation.absolutePathToLocalOutput == null) {
                    interactiveTaskContext.failWithoutThrowing(
                        "Cannot generate because output location is not local-file-system"
                    );
                } else {
                    await writeFilesToDiskAndRunGenerator({
                        organization,
                        absolutePathToFernConfig,
                        workspace,
                        generatorInvocation,
                        absolutePathToLocalOutput: generatorInvocation.absolutePathToLocalOutput,
                        absolutePathToLocalSnippetJSON: AbsoluteFilePath.of(
                            join(
                                generatorInvocation.absolutePathToLocalOutput,
                                RelativeFilePath.of(SNIPPET_JSON_FILENAME)
                            )
                        ),
                        absolutePathToLocalSnippetTemplateJSON: AbsoluteFilePath.of(
                            join(
                                generatorInvocation.absolutePathToLocalOutput,
                                RelativeFilePath.of(SNIPPET_TEMPLATES_JSON_FILENAME)
                            )
                        ),
                        audiences: generatorGroup.audiences,
                        workspaceTempDir,
                        keepDocker,
                        context: interactiveTaskContext,
                        irVersionOverride,
                        outputVersionOverride,
                        writeUnitTests: true,
                        generateOauthClients: true,
                        generatePaginatedClients: true
                    });
                    interactiveTaskContext.logger.info(
                        chalk.green("Wrote files to " + generatorInvocation.absolutePathToLocalOutput)
                    );
                }
            });
        })
    );
}
