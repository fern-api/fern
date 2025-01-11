import path from "path";

import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { runLocalGenerationForSeed } from "@fern-api/local-workspace-runner";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";

import { runScript } from "../../../runScript";
import { ALL_AUDIENCES, DUMMY_ORGANIZATION } from "../../../utils/constants";
import { getGeneratorInvocation } from "../../../utils/getGeneratorInvocation";
import { TestRunner } from "./TestRunner";

export class DockerTestRunner extends TestRunner {
    async build(): Promise<void> {
        const dockerCommands =
            typeof this.generator.workspaceConfig.test.docker.command === "string"
                ? [this.generator.workspaceConfig.test.docker.command]
                : this.generator.workspaceConfig.test.docker.command;
        if (dockerCommands == null) {
            throw new Error(`Failed. No docker command for ${this.generator.workspaceName}`);
        }
        const dockerBuildReturn = await runScript({
            commands: dockerCommands,
            logger: CONSOLE_LOGGER,
            workingDir: path.dirname(path.dirname(this.generator.absolutePathToWorkspace)),
            doNotPipeOutput: false
        });
        if (dockerBuildReturn.exitCode !== 0) {
            throw new Error(`Failed to build the docker container for ${this.generator.workspaceName}.`);
        }
    }

    async runGenerator({
        absolutePathToFernDefinition,
        fernWorkspace,
        outputDir,
        fixture,
        taskContext,
        selectAudiences,
        outputVersion,
        keepDocker,
        language,
        customConfig,
        publishConfig,
        outputMode,
        irVersion,
        publishMetadata,
        readme,
        shouldGenerateDynamicSnippetTests
    }: TestRunner.DoRunArgs): Promise<void> {
        const generatorGroup: generatorsYml.GeneratorGroup = {
            groupName: "test",
            reviewers: undefined,
            audiences: selectAudiences != null ? { type: "select", audiences: selectAudiences } : ALL_AUDIENCES,
            generators: [
                await getGeneratorInvocation({
                    absolutePathToOutput: outputDir,
                    docker: this.getParsedDockerName(),
                    language,
                    customConfig,
                    publishConfig,
                    outputMode,
                    fixtureName: fixture,
                    irVersion,
                    publishMetadata,
                    readme
                })
            ]
        };
        await runLocalGenerationForSeed({
            organization: DUMMY_ORGANIZATION,
            absolutePathToFernConfig: absolutePathToFernDefinition,
            workspace: fernWorkspace,
            generatorGroup,
            keepDocker: keepDocker ?? false,
            context: taskContext,
            irVersionOverride: irVersion,
            outputVersionOverride: outputVersion,
            shouldGenerateDynamicSnippetTests
        });
    }

    async runGeneratorFromGroup({
        absolutePathToFernDefinition,
        fernWorkspace,
        taskContext,
        irVersion,
        group,
        shouldGenerateDynamicSnippetTests
    }: {
        absolutePathToFernDefinition: AbsoluteFilePath;
        fernWorkspace: FernWorkspace;
        taskContext: TaskContext;
        irVersion: string;
        group: generatorsYml.GeneratorGroup;
        shouldGenerateDynamicSnippetTests: boolean | undefined;
    }): Promise<void> {
        await runLocalGenerationForSeed({
            organization: DUMMY_ORGANIZATION,
            absolutePathToFernConfig: absolutePathToFernDefinition,
            workspace: fernWorkspace,
            generatorGroup: { ...group },
            keepDocker: true,
            context: taskContext,
            irVersionOverride: irVersion,
            outputVersionOverride: undefined,
            shouldGenerateDynamicSnippetTests
        });
    }
}
