import { generatorsYml } from "@fern-api/configuration";
import { ContainerRunner } from "@fern-api/core-utils";
import { runContainerizedGenerationForSeed } from "@fern-api/local-workspace-runner";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import path from "path";

import { runScript } from "../../../runScript";
import { ALL_AUDIENCES, DUMMY_ORGANIZATION } from "../../../utils/constants";
import { getGeneratorInvocation } from "../../../utils/getGeneratorInvocation";
import { TestRunner } from "./TestRunner";

export class DockerTestRunner extends TestRunner {
    private readonly runner: ContainerRunner;

    constructor(args: TestRunner.Args & { runner?: ContainerRunner }) {
        super(args);
        this.runner = args.runner ?? "podman";
    }

    public async build(): Promise<void> {
        const testConfig =
            this.runner === "podman" && this.generator.workspaceConfig.test.podman != null
                ? this.generator.workspaceConfig.test.podman
                : this.generator.workspaceConfig.test.docker;

        const containerCommands = typeof testConfig.command === "string" ? [testConfig.command] : testConfig.command;
        if (containerCommands == null) {
            throw new Error(`Failed. No ${this.runner} command for ${this.generator.workspaceName}`);
        }
        const containerBuildReturn = await runScript({
            commands: containerCommands,
            logger: CONSOLE_LOGGER,
            workingDir: path.dirname(path.dirname(this.generator.absolutePathToWorkspace)),
            doNotPipeOutput: false
        });
        if (containerBuildReturn.exitCode !== 0) {
            throw new Error(`Failed to build the container for ${this.generator.workspaceName}.`);
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
            dockerImage: this.getContainerImageName(),
            runner: this.runner
        });
    }

    protected getContainerImageName(): string {
        const testConfig =
            this.runner === "podman" && this.generator.workspaceConfig.test.podman != null
                ? this.generator.workspaceConfig.test.podman
                : this.generator.workspaceConfig.test.docker;
        return testConfig.image;
    }
}
