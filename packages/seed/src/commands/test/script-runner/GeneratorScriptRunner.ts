import { ContainerRunner } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import { BuildTestDockerConfig } from "../../../config/api/index.js";
import { GeneratorWorkspace } from "../../../loadGeneratorWorkspaces.js";
import { ScriptRunner } from "./ScriptRunner.js";

interface InternalScriptResult {
    type: "success" | "failure";
    message?: string;
}

/**
 * Runs build and test scripts using the generator's own Docker container.
 * This replaces the external script containers (e.g. fernapi/python-seed, fernapi/ts-seed)
 * with a Dockerfile owned by the generator itself.
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

        let buildTimeMs: number | undefined;
        let testTimeMs: number | undefined;

        const buildCommands = this.buildTestConfig.buildCommands ?? [];
        if (buildCommands.length > 0) {
            taskContext.logger.info(`Running generator build scripts for ${id}...`);
            const buildStartTime = Date.now();
            const result = await this.runScript({
                taskContext,
                containerId: this.containerId,
                outputDir,
                commands: buildCommands,
                id
            });
            buildTimeMs = Date.now() - buildStartTime;
            if (result.type === "failure") {
                taskContext.logger.info(`Generator build scripts failed for ${id}`);
                return {
                    type: "failure",
                    phase: "build",
                    message: result.message ?? "Generator build script failed",
                    buildTimeMs
                };
            }
            taskContext.logger.info(`Generator build scripts completed for ${id}`);
        }

        const testCommands = this.buildTestConfig.testCommands ?? [];
        if (testCommands.length > 0) {
            taskContext.logger.info(`Running generator test scripts for ${id}...`);
            const testStartTime = Date.now();
            const result = await this.runScript({
                taskContext,
                containerId: this.containerId,
                outputDir,
                commands: testCommands,
                id
            });
            testTimeMs = Date.now() - testStartTime;
            if (result.type === "failure") {
                taskContext.logger.info(`Generator test scripts failed for ${id}`);
                return {
                    type: "failure",
                    phase: "test",
                    message: result.message ?? "Generator test script failed",
                    buildTimeMs,
                    testTimeMs
                };
            }
            taskContext.logger.info(`Generator test scripts completed for ${id}`);
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
        const absoluteFilePathToFernCli = await this.buildFernCli();
        const cliVolumeBind = `${absoluteFilePathToFernCli}:/fern`;

        const startCommand = await loggingExeca(
            this.context.logger,
            this.runner,
            [
                "run",
                "--privileged",
                "--cgroupns=host",
                "-v",
                "/sys/fs/cgroup:/sys/fs/cgroup:rw",
                "-dit",
                "-v",
                cliVolumeBind,
                this.buildTestConfig.image,
                "/bin/sh"
            ],
            {
                doNotPipeOutput: false
            }
        );
        this.containerId = startCommand.stdout;
    }

    private async buildFernCli(): Promise<AbsoluteFilePath> {
        const rootDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("../../.."));
        await loggingExeca(this.context.logger, "pnpm", ["fern:build"], { cwd: rootDir });
        return join(rootDir, RelativeFilePath.of("packages/cli/cli/dist/prod"));
    }

    private async runScript({
        taskContext,
        containerId,
        outputDir,
        commands,
        id
    }: {
        id: string;
        outputDir: AbsoluteFilePath;
        taskContext: TaskContext;
        containerId: string;
        commands: string[];
    }): Promise<InternalScriptResult> {
        const workDir = id.replace(":", "_");
        const scriptFile = await tmp.file();
        const scriptContents = ["set -e", `cd /${workDir}/generated`, ...commands].join("\n");
        await writeFile(scriptFile.path, scriptContents);

        taskContext.logger.debug(`Running generator script on ${id}:\n${scriptContents}`);

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
            taskContext.logger.error("Failed to mkdir for scripts. See output below");
            taskContext.logger.error(mkdirCommand.stdout);
            taskContext.logger.error(mkdirCommand.stderr);
            return { type: "failure", message: mkdirCommand.stdout };
        }

        const copyScriptCommand = await loggingExeca(
            undefined,
            this.runner,
            ["cp", scriptFile.path, `${containerId}:/${workDir}/test.sh`],
            {
                doNotPipeOutput: true,
                reject: false
            }
        );
        if (copyScriptCommand.failed) {
            taskContext.logger.error("Failed to copy script. See output below");
            taskContext.logger.error(copyScriptCommand.stdout);
            taskContext.logger.error(copyScriptCommand.stderr);
            return { type: "failure", message: copyScriptCommand.stdout };
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

        const command = await loggingExeca(
            taskContext.logger,
            this.runner,
            ["exec", containerId, "/bin/sh", "-c", `chmod +x /${workDir}/test.sh && /${workDir}/test.sh`],
            {
                doNotPipeOutput: true,
                reject: false
            }
        );
        if (command.failed) {
            taskContext.logger.error("Failed to run generator script. See output below");
            taskContext.logger.error(command.stdout);
            taskContext.logger.error(command.stderr);
            return { type: "failure", message: command.stdout };
        } else {
            return { type: "success" };
        }
    }
}
