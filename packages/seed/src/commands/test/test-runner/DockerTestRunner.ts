import { generatorsYml } from "@fern-api/configuration";
import { runContainerizedGenerationForSeed } from "@fern-api/local-workspace-runner";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import path from "path";

import { runScript } from "../../../runScript";
import { ALL_AUDIENCES, DUMMY_ORGANIZATION } from "../../../utils/constants";
import { getGeneratorInvocation } from "../../../utils/getGeneratorInvocation";
import { TestRunner } from "./TestRunner";

export class DockerTestRunner extends TestRunner {
    public async build(): Promise<void> {
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

    protected async runGenerator({
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
        shouldGenerateDynamicSnippetTests,
        inspect = false,
        license
    }: TestRunner.DoRunArgs): Promise<void> {
        const generatorGroup: generatorsYml.GeneratorGroup = {
            groupName: "test",
            reviewers: undefined,
            audiences: selectAudiences != null ? { type: "select", audiences: selectAudiences } : ALL_AUDIENCES,
            generators: [
                await getGeneratorInvocation({
                    absolutePathToOutput: outputDir,
                    docker: this.getParsedDockerImageName(),
                    language,
                    customConfig,
                    publishConfig,
                    outputMode,
                    fixtureName: fixture,
                    irVersion,
                    publishMetadata,
                    readme,
                    license
                })
            ]
        };
        await runContainerizedGenerationForSeed({
            organization: DUMMY_ORGANIZATION,
            absolutePathToFernConfig: absolutePathToFernDefinition,
            workspace: fernWorkspace,
            generatorGroup,
            context: taskContext,
            irVersionOverride: irVersion,
            outputVersionOverride: outputVersion,
            shouldGenerateDynamicSnippetTests,
            skipUnstableDynamicSnippetTests: true,
            inspect,
            keepDocker: keepDocker ?? false,
            dockerImage: this.getDockerImageName(),
            ai: undefined
        });
    }
}
