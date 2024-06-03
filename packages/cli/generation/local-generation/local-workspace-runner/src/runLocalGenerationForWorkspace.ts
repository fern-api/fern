import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspaceMetadata } from "@fern-api/workspace-loader";
import chalk from "chalk";
import os from "os";
import path from "path";
import tmp from "tmp-promise";
import { writeFilesToDiskAndRunGenerator } from "./runGenerator";

export async function runLocalGenerationForWorkspace({
    projectConfig,
    workspaceGetter,
    keepDocker,
    context
}: {
    projectConfig: fernConfigJson.ProjectConfig;
    workspaceGetter: (
        sdkLanguage: generatorsYml.GenerationLanguage | undefined
    ) => Promise<FernWorkspaceMetadata | undefined>;
    keepDocker: boolean;
    context: TaskContext;
}): Promise<void> {
    const workspaceTempDir = await getWorkspaceTempDir();

    const toplevelWorkspaceMetadata = await workspaceGetter(undefined);
    const generatorGroup = toplevelWorkspaceMetadata?.group;

    if (generatorGroup == null) {
        context.failWithoutThrowing("Could not load workspace");
        return;
    }

    const results = await Promise.all(
        generatorGroup.generators.map(async (generatorInvocation) => {
            return context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                const workspaceMetadata = await workspaceGetter(generatorInvocation.language);
                if (workspaceMetadata == null) {
                    interactiveTaskContext.failWithoutThrowing("Could not load workspace");
                    return;
                } else {
                    if (generatorInvocation.absolutePathToLocalOutput == null) {
                        interactiveTaskContext.failWithoutThrowing(
                            "Cannot generate because output location is not local-file-system"
                        );
                    } else {
                        await writeFilesToDiskAndRunGenerator({
                            organization: projectConfig.organization,
                            absolutePathToFernConfig: projectConfig._absolutePath,
                            workspace: workspaceMetadata.workspace,
                            generatorInvocation,
                            absolutePathToLocalOutput: generatorInvocation.absolutePathToLocalOutput,
                            absolutePathToLocalSnippetJSON: undefined,
                            absolutePathToLocalSnippetTemplateJSON: undefined,
                            audiences: generatorGroup.audiences,
                            workspaceTempDir,
                            keepDocker,
                            context: interactiveTaskContext,
                            irVersionOverride: generatorInvocation.irVersionOverride,
                            outputVersionOverride: undefined,
                            writeUnitTests: false,
                            generateOauthClients: false,
                            generatePaginatedClients: false
                        });
                        interactiveTaskContext.logger.info(
                            chalk.green("Wrote files to " + generatorInvocation.absolutePathToLocalOutput)
                        );
                    }
                }
            });
        })
    );

    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }
}

export async function getWorkspaceTempDir(): Promise<tmp.DirectoryResult> {
    return tmp.dir({
        // use the /private prefix on osx so that docker can access the tmpdir
        // see https://stackoverflow.com/a/45123074
        tmpdir: os.platform() === "darwin" ? path.join("/private", os.tmpdir()) : undefined,
        prefix: "fern"
    });
}
