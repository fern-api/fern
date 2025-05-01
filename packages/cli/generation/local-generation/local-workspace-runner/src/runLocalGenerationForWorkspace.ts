import chalk from "chalk";
import os from "os";
import path from "path";
import tmp from "tmp-promise";

import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";
import {
    AbstractAPIWorkspace,
    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation
} from "@fern-api/workspace-loader";
import { FernToken } from "@fern-api/auth";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { writeFilesToDiskAndRunGenerator } from "./runGenerator";

export async function runLocalGenerationForWorkspace({
    token,
    projectConfig,
    workspace,
    generatorGroup,
    keepDocker,
    context
}: {
    token: FernToken | undefined,
    projectConfig: fernConfigJson.ProjectConfig;
    workspace: AbstractAPIWorkspace<unknown>;
    generatorGroup: generatorsYml.GeneratorGroup;
    keepDocker: boolean;
    context: TaskContext;
}): Promise<void> {
    const workspaceTempDir = await getWorkspaceTempDir();

    const results = await Promise.all(
        generatorGroup.generators.map(async (generatorInvocation) => {
            return context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                if (generatorInvocation.absolutePathToLocalOutput == null) {
                    if (token == null || token.) {
                        interactiveTaskContext.failWithoutThrowing(
                            "Fern token is required."
                        );
                        return;
                    }
                } 

                const fernWorkspace = await workspace.toFernWorkspace(
                    { context },
                    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(generatorInvocation)
                );

                await writeFilesToDiskAndRunGenerator({
                    organization: projectConfig.organization,
                    absolutePathToFernConfig: projectConfig._absolutePath,
                    workspace: fernWorkspace,
                    generatorInvocation,
                    absolutePathToLocalOutput: generatorInvocation.absolutePathToLocalOutput ?? AbsoluteFilePath.of(workspaceTempDir.path),
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
