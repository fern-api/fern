import { ContainerRunner } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import path from "path";

import { BuildTestDockerConfig } from "../../../config/api/index.js";
import { GeneratorWorkspace } from "../../../loadGeneratorWorkspaces.js";
import { ScriptRunner } from "./ScriptRunner.js";

const FERN_BUILD_SCRIPT = ".fern/build.sh";
const FERN_TEST_SCRIPT = ".fern/test.sh";

/**
 * Runs build and test scripts using the generator's own Docker container.
 * Instead of reading commands from seed.yml, this runner looks for
 * .fern/build.sh and .fern/test.sh in the generated output directory.
 * These scripts are written by the generator itself during code generation.
 * Users can override them via .fernignore.
 */
export class GeneratorScriptRunner extends ScriptRunner {
    private readonly runner: ContainerRunner;
    private readonly buildTestConfig: BuildTestDockerConfig;
    private containerId: string | undefined;
    private initializeFn: Promise<void> | undefined;

    constructor(
        workspace: GeneratorWorkspace,
        skipScripts: boolean,
        context: TaskContext,
        logLevel: LogLevel,
        buildTestConfig: BuildTestDockerConfig,
        runner?: ContainerRunner
    ) {
        super(workspace, skipScripts, context, logLevel);
        this.runner = runner ?? "docker";
        this.buildTestConfig = buildTestConfig;

        if (!skipScripts) {
            this.initializeFn = this.initialize();
        }
    }

    public async run({
        taskContext,
        id,
        outputDir,
        skipScripts
    }: ScriptRunner.RunArgs): Promise<ScriptRunner.RunResponse> {
        if (skipScripts === true) {
            taskContext.logger.info(`Skipping all scripts for ${id} (configured in fixture)`);
            return { type: "success" };
        }

        await this.initializeFn;

        if (this.containerId == null) {
            taskContext.logger.error("Build/test container was not started");
            return { type: "failure", phase: "build", message: "Build/test container was not started" };
        }

        const workDir = id.replace(":", "_");

        const copyResult = await this.copyGeneratedFiles({ taskContext, containerId: this.containerId, outputDir, workDir });
        if (copyResult.type === "failure") {
            return { type: "failure", phase: "build", message: copyResult.message };
        }

        let buildTimeMs: number | undefined;
        let testTimeMs: number | undefined;

        const hasBuildScript = await this.hasScript({ containerId: this.containerId, workDir, script: FERN_BUILD_SCRIPT });
        if (hasBuildScript) {
            taskContext.logger.info(`Running .fern/build.sh for ${id}...`);
            const buildStartTime = Date.now();
            const result = await this.runFernScript({
                taskContext,
                containerId: this.containerId,
                workDir,
                script: FERN_BUILD_SCRIPT
            });
            buildTimeMs = Date.now() - buildStartTime;
            if (result.type === "failure") {
                taskContext.logger.info(`.fern/build.sh failed for ${id}`);
                return {
                    type: "failure",
                    phase: "build",
                    message: result.message ?? "build.sh failed",
                    buildTimeMs
                };
            }
            taskContext.logger.info(`.fern/build.sh completed for ${id}`);
        } else {
            taskContext.logger.info(`No .fern/build.sh found for ${id}, skipping build phase`);
        }

        const hasTestScript = await this.hasScript({ containerId: this.containerId, workDir, script: FERN_TEST_SCRIPT });
        if (hasTestScript) {
            taskContext.logger.info(`Running .fern/test.sh for ${id}...`);
            const testStartTime = Date.now();
            const result = await this.runFernScript({
                taskContext,
                containerId: this.containerId,
                workDir,
                script: FERN_TEST_SCRIPT
            });
            testTimeMs = Date.now() - testStartTime;
            if (result.type === "failure") {
                taskContext.logger.info(`.fern/test.sh failed for ${id}`);
                return {
                    type: "failure",
                    phase: "test",
                    message: result.message ?? "test.sh failed",
                    buildTimeMs,
                    testTimeMs
                };
            }
            taskContext.logger.info(`.fern/test.sh completed for ${id}`);
        } else {
            taskContext.logger.info(`No .fern/test.sh found for ${id}, skipping test phase`);
        }

        return { type: "success", buildTimeMs, testTimeMs };
    }

    public async stop(): Promise<void> {
        if (this.containerId != null) {
            await loggingExeca(this.context.logger, this.runner, ["kill", this.containerId], {
                doNotPipeOutput: false
            });
        }
    }

    protected async initialize(): Promise<void> {
        await this.buildImage();
        await this.startContainer();
    }

    private async buildImage(): Promise<void> {
        const repoRoot = path.dirname(path.dirname(this.workspace.absolutePathToWorkspace));

        if (this.buildTestConfig.buildCommand != null) {
            const commands =
                typeof this.buildTestConfig.buildCommand === "string"
                    ? [this.buildTestConfig.buildCommand]
                    : this.buildTestConfig.buildCommand;
            for (const cmd of commands) {
                const result = await loggingExeca(this.context.logger, "sh", ["-c", cmd], {
                    cwd: repoRoot,
                    doNotPipeOutput: false,
                    reject: false
                });
                if (result.exitCode !== 0) {
                    throw new Error(`Failed to build generator build/test image: ${result.stderr}`);
                }
            }
        } else {
            const dockerfilePath = path.resolve(repoRoot, this.buildTestConfig.dockerfile);
            const buildContext = this.buildTestConfig.context
                ? path.resolve(repoRoot, this.buildTestConfig.context)
                : repoRoot;

            const result = await loggingExeca(
                this.context.logger,
                this.runner,
                ["build", "-f", dockerfilePath, "-t", this.buildTestConfig.image, buildContext],
                {
                    doNotPipeOutput: false,
                    reject: false
                }
            );
            if (result.exitCode !== 0) {
                throw new Error(`Failed to build generator build/test image: ${result.stderr}`);
            }
        }
    }

    private async startContainer(): Promise<void> {
        const startCommand = await loggingExeca(
            this.context.logger,
            this.runner,
            [
                "run",
                "-dit",
                this.buildTestConfig.image,
                "/bin/sh"
            ],
            {
                doNotPipeOutput: false
            }
        );
        this.containerId = startCommand.stdout;
    }

    private async copyGeneratedFiles({
        taskContext,
        containerId,
        outputDir,
        workDir
    }: {
        taskContext: TaskContext;
        containerId: string;
        outputDir: AbsoluteFilePath;
        workDir: string;
    }): Promise<{ type: "success" } | { type: "failure"; message: string }> {
        const mkdirCommand = await loggingExeca(
            taskContext.logger,
            this.runner,
            ["exec", containerId, "mkdir", "-p", `/${workDir}/generated`],
            {
                doNotPipeOutput: true,
                reject: false
            }
        );
        if (mkdirCommand.failed) {
            taskContext.logger.error("Failed to mkdir for generated files. See output below");
            taskContext.logger.error(mkdirCommand.stdout);
            taskContext.logger.error(mkdirCommand.stderr);
            return { type: "failure", message: mkdirCommand.stdout };
        }

        const copyCommand = await loggingExeca(
            taskContext.logger,
            this.runner,
            ["cp", `${outputDir}/.`, `${containerId}:/${workDir}/generated/`],
            {
                doNotPipeOutput: true,
                reject: false
            }
        );
        if (copyCommand.failed) {
            taskContext.logger.error("Failed to copy generated files. See output below");
            taskContext.logger.error(copyCommand.stdout);
            taskContext.logger.error(copyCommand.stderr);
            return { type: "failure", message: copyCommand.stdout };
        }

        return { type: "success" };
    }

    private async hasScript({
        containerId,
        workDir,
        script
    }: {
        containerId: string;
        workDir: string;
        script: string;
    }): Promise<boolean> {
        const result = await loggingExeca(
            undefined,
            this.runner,
            ["exec", containerId, "test", "-f", `/${workDir}/generated/${script}`],
            {
                doNotPipeOutput: true,
                reject: false
            }
        );
        return !result.failed;
    }

    private async runFernScript({
        taskContext,
        containerId,
        workDir,
        script
    }: {
        taskContext: TaskContext;
        containerId: string;
        workDir: string;
        script: string;
    }): Promise<{ type: "success" } | { type: "failure"; message?: string }> {
        const scriptPath = `/${workDir}/generated/${script}`;
        const command = await loggingExeca(
            taskContext.logger,
            this.runner,
            ["exec", containerId, "/bin/sh", "-c", `chmod +x ${scriptPath} && cd /${workDir}/generated && ${scriptPath}`],
            {
                doNotPipeOutput: true,
                reject: false
            }
        );
        if (command.failed) {
            taskContext.logger.error(`Failed to run ${script}. See output below`);
            taskContext.logger.error(command.stdout);
            taskContext.logger.error(command.stderr);
            return { type: "failure", message: command.stdout };
        }
        return { type: "success" };
    }
}
