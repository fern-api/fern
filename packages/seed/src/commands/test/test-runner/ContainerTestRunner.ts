import { generatorsYml } from "@fern-api/configuration";
import { ContainerRunner } from "@fern-api/core-utils";
import {
    ReusableContainerExecutionEnvironment,
    runContainerizedGenerationForSeed
} from "@fern-api/local-workspace-runner";
import { CONSOLE_LOGGER, LogLevel } from "@fern-api/logger";
import path from "path";

import { runScript } from "../../../runScript.js";
import { ALL_AUDIENCES, DUMMY_ORGANIZATION } from "../../../utils/constants.js";
import { getGeneratorInvocation } from "../../../utils/getGeneratorInvocation.js";
import { TestRunner } from "./TestRunner.js";

export class ContainerTestRunner extends TestRunner {
    private readonly runner: ContainerRunner;
    private readonly parallelism: number;
    private reusableContainer: ReusableContainerExecutionEnvironment | undefined;

    constructor(args: TestRunner.Args & { runner?: ContainerRunner; parallelism?: number }) {
        super(args);
        this.parallelism = args.parallelism ?? 4;

        if (args.runner != null) {
            this.runner = args.runner;
            const hasConfig =
                this.runner === "docker"
                    ? this.generator.workspaceConfig.test.docker != null
                    : this.generator.workspaceConfig.test.podman != null;

            if (!hasConfig) {
                throw new Error(
                    `Generator ${this.generator.workspaceName} does not have a test.${this.runner} configuration in seed.yml. ` +
                        `Cannot use explicitly specified container runtime '${this.runner}' without corresponding configuration.`
                );
            }
        } else {
            // Default to docker for backward compatibility
            this.runner = "docker";
        }
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
        if (!this.shouldPipeOutput()) {
            CONSOLE_LOGGER.info(`Building container for ${this.generator.workspaceName}...`);
        }
        const containerBuildReturn = await runScript({
            commands: containerCommands,
            logger: this.shouldPipeOutput() ? CONSOLE_LOGGER : undefined,
            workingDir: path.dirname(path.dirname(this.generator.absolutePathToWorkspace)),
            doNotPipeOutput: !this.shouldPipeOutput()
        });
        if (containerBuildReturn.exitCode !== 0) {
            throw new Error(`Failed to build the container for ${this.generator.workspaceName}.`);
        }

        // Start a reusable long-lived container for generation (guard against double build() calls)
        if (this.reusableContainer != null) {
            return;
        }
        this.reusableContainer = new ReusableContainerExecutionEnvironment({
            imageName: this.getContainerImageName(),
            runner: this.runner,
            poolSize: this.parallelism
        });
        if (!this.shouldPipeOutput()) {
            CONSOLE_LOGGER.info(`Starting ${this.parallelism} container(s)...`);
        }
        await this.reusableContainer.start(CONSOLE_LOGGER, this.logLevel);
    }

    public async cleanup(): Promise<void> {
        if (this.reusableContainer != null) {
            await this.reusableContainer.stop(CONSOLE_LOGGER, this.logLevel);
            this.reusableContainer = undefined;
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
        keepContainer,
        language,
        customConfig,
        publishConfig,
        outputMode,
        irVersion,
        publishMetadata,
        readme,
        shouldGenerateDynamicSnippetTests,
        inspect = false,
        license,
        smartCasing,
        organization,
        absolutePathToFernConfig,
        skipAutogenerationIfManualExamplesExist
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
                    license,
                    smartCasing
                })
            ]
        };
        await runContainerizedGenerationForSeed({
            organization: organization ?? DUMMY_ORGANIZATION,
            absolutePathToFernConfig: absolutePathToFernConfig ?? absolutePathToFernDefinition,
            workspace: fernWorkspace,
            generatorGroup,
            context: taskContext,
            irVersionOverride: irVersion,
            outputVersionOverride: outputVersion,
            shouldGenerateDynamicSnippetTests,
            skipUnstableDynamicSnippetTests: true,
            inspect,
            keepDocker: keepContainer ?? false,
            dockerImage: this.getContainerImageName(),
            runner: this.runner,
            executionEnvironment: this.reusableContainer,
            ai: undefined,
            skipAutogenerationIfManualExamplesExist
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
