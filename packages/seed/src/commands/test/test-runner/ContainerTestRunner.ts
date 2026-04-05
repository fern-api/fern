import { generatorsYml } from "@fern-api/configuration";
import { ContainerRunner } from "@fern-api/core-utils";
import {
    ReusableContainerExecutionEnvironment,
    runContainerizedGenerationForSeed
} from "@fern-api/local-workspace-runner";
import { CONSOLE_LOGGER, LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import path from "path";

import { runScript } from "../../../runScript.js";
import { ALL_AUDIENCES, DUMMY_ORGANIZATION } from "../../../utils/constants.js";
import { getGeneratorInvocation } from "../../../utils/getGeneratorInvocation.js";
import { getWorktreeSuffix } from "../../../utils/getWorktreeSuffix.js";
import { ParsedDockerName, parseDockerOrThrow } from "../../../utils/parseDockerOrThrow.js";
import { TestRunner } from "./TestRunner.js";

export class ContainerTestRunner extends TestRunner {
    private readonly runner: ContainerRunner;
    private readonly parallelism: number;
    private reusableContainer: ReusableContainerExecutionEnvironment | undefined;
    private readonly worktreeSuffix: string | undefined;

    constructor(args: TestRunner.Args & { runner?: ContainerRunner; parallelism?: number }) {
        super(args);
        this.parallelism = args.parallelism ?? 4;
        this.worktreeSuffix = getWorktreeSuffix();

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

        // Rewrite -t flags in build commands to use :local (or :local-wt-<suffix>) tags.
        // This handles direct `docker build` / `podman build` commands.
        const namespacedCommands = containerCommands.map((cmd) => this.rewriteDockerBuildTag(cmd));

        if (!this.shouldPipeOutput()) {
            CONSOLE_LOGGER.info(`Building container for ${this.generator.workspaceName}...`);
        }
        const containerBuildReturn = await runScript({
            commands: namespacedCommands,
            logger: this.shouldPipeOutput() ? CONSOLE_LOGGER : undefined,
            workingDir: path.dirname(path.dirname(this.generator.absolutePathToWorkspace)),
            doNotPipeOutput: !this.shouldPipeOutput()
        });
        if (containerBuildReturn.exitCode !== 0) {
            throw new Error(`Failed to build the container for ${this.generator.workspaceName}.`);
        }

        // For turbo-wrapped or other indirect build commands that may have built
        // the image under its original tag (e.g. :latest), create a :local alias
        // so downstream consumers can find the image.
        const originalImage = this.getOriginalImageFromConfig();
        const localImage = this.getContainerImageName();
        if (originalImage !== localImage) {
            try {
                await loggingExeca(undefined, this.runner, ["tag", originalImage, localImage], {
                    doNotPipeOutput: !this.shouldPipeOutput()
                });
            } catch (error) {
                // tag may fail if the rewrite already produced the :local image directly
                CONSOLE_LOGGER.debug(
                    `docker tag failed (expected if image was built with local tag directly): ${error}`
                );
            }
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

        // Remove the local Docker image unless the user passed --keep-docker
        if (!this.keepContainer) {
            const localImage = this.getContainerImageName();
            try {
                await loggingExeca(undefined, this.runner, ["rmi", localImage], {
                    doNotPipeOutput: !this.shouldPipeOutput()
                });
            } catch (error) {
                // Best-effort cleanup; image may already have been removed
                CONSOLE_LOGGER.debug(`Failed to remove image ${localImage}: ${error}`);
            }
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

    protected override getParsedDockerImageName(): ParsedDockerName {
        const testConfig =
            this.runner === "podman" && this.generator.workspaceConfig.test.podman != null
                ? this.generator.workspaceConfig.test.podman
                : this.generator.workspaceConfig.test.docker;
        const parsed = parseDockerOrThrow(testConfig.image);
        return {
            name: parsed.name,
            version: this.getLocalTag()
        };
    }

    protected getContainerImageName(): string {
        return `${this.getBaseImageName()}:${this.getLocalTag()}`;
    }

    /**
     * Returns the tag to use for local seed test builds.
     * `local` in a normal checkout, `local-wt-<suffix>` in a worktree.
     */
    private getLocalTag(): string {
        return this.worktreeSuffix != null ? `local-${this.worktreeSuffix}` : "local";
    }

    /**
     * Rewrites `-t <image>` flags in a docker/podman build command to use
     * `:local` (or `:local-wt-<suffix>` in worktrees) instead of `:latest`.
     * Non-build commands (including turbo-wrapped builds) are returned unchanged.
     */
    private rewriteDockerBuildTag(command: string): string {
        if (!command.includes("docker build") && !command.includes("podman build")) {
            return command;
        }

        const baseImage = this.getBaseImageName();
        const escapedBase = baseImage.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const imagePattern = new RegExp(`(${escapedBase})(:[\\w.-]+)?`, "g");
        const localTag = this.getLocalTag();
        return command.replace(imagePattern, (_match: string, name: string, _tag?: string) => {
            return `${name}:${localTag}`;
        });
    }

    /** Returns the original image string from the test config (e.g. `fernapi/fern-python-sdk:latest`). */
    private getOriginalImageFromConfig(): string {
        const testConfig =
            this.runner === "podman" && this.generator.workspaceConfig.test.podman != null
                ? this.generator.workspaceConfig.test.podman
                : this.generator.workspaceConfig.test.docker;
        return testConfig.image;
    }

    /** Returns the base image name from the test config without any tag. */
    private getBaseImageName(): string {
        const image = this.getOriginalImageFromConfig();
        const colonIndex = image.indexOf(":");
        return colonIndex >= 0 ? image.substring(0, colonIndex) : image;
    }
}
