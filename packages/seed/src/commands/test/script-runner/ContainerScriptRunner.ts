import { ContainerRunner } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

import { ContainerScriptConfig, ScriptCommands } from "../../../config/api";
import { GeneratorWorkspace } from "../../../loadGeneratorWorkspaces";
import { ScriptRunner } from "./ScriptRunner";

interface RunningScriptConfig extends ContainerScriptConfig {
    containerId: string;
}

interface InternalScriptResult {
    type: "success" | "failure";
    message?: string;
}

function getCommandsForPhase(commands: ScriptCommands, phase: "build" | "test"): string[] {
    if (Array.isArray(commands)) {
        return phase === "build" ? commands : [];
    }
    return commands[phase] ?? [];
}

/**
 * Runs scripts on the generated code to verify the output using container runtimes (Docker or Podman).
 */
export class ContainerScriptRunner extends ScriptRunner {
    private readonly runner: ContainerRunner;
    private startContainersFn: Promise<void> | undefined;
    private scripts: RunningScriptConfig[] = [];

    constructor(
        workspace: GeneratorWorkspace,
        skipScripts: boolean,
        context: TaskContext,
        logLevel: LogLevel,
        runner?: ContainerRunner
    ) {
        super(workspace, skipScripts, context, logLevel);

        if (runner != null) {
            this.runner = runner;
            const hasScripts =
                this.workspace.workspaceConfig.scripts != null && this.workspace.workspaceConfig.scripts.length > 0;

            if (!hasScripts) {
                throw new Error(
                    `Generator ${this.workspace.workspaceName} does not have any scripts configured in seed.yml. ` +
                        `Cannot use explicitly specified container runtime '${this.runner}' without scripts configuration.`
                );
            }
        } else {
            // Default to docker for backward compatibility (scripts don't have separate docker/podman configs)
            this.runner = "docker";
        }

        if (!skipScripts) {
            this.startContainersFn = this.initialize();
        }
    }

    public async run({
        taskContext,
        id,
        outputDir,
        skipScripts
    }: ScriptRunner.RunArgs): Promise<ScriptRunner.RunResponse> {
        // If skipScripts is true, skip all scripts for this fixture
        if (skipScripts === true) {
            taskContext.logger.info(`Skipping all scripts for ${id} (configured in fixture)`);
            return { type: "success" };
        }

        await this.startContainersFn;

        let buildTimeMs: number | undefined;
        let testTimeMs: number | undefined;
        let anyBuildCommands = false;
        let anyTestCommands = false;

        const buildStartTime = Date.now();
        for (const script of this.scripts) {
            if (Array.isArray(skipScripts) && script.name != null && skipScripts.includes(script.name)) {
                taskContext.logger.info(`Skipping script "${script.name}" for ${id} (configured in fixture)`);
                continue;
            }

            const buildCommands = getCommandsForPhase(script.commands, "build");
            if (buildCommands.length > 0) {
                if (!anyBuildCommands) {
                    taskContext.logger.info(`Running build scripts for ${id}...`);
                }
                anyBuildCommands = true;
                const result = await this.runScript({
                    taskContext,
                    containerId: script.containerId,
                    outputDir,
                    commands: buildCommands,
                    id
                });
                if (result.type === "failure") {
                    buildTimeMs = Date.now() - buildStartTime;
                    taskContext.logger.info(`Build scripts failed for ${id}`);
                    return {
                        type: "failure",
                        phase: "build",
                        message: result.message ?? "Build script failed",
                        buildTimeMs
                    };
                }
            }
        }
        if (anyBuildCommands) {
            buildTimeMs = Date.now() - buildStartTime;
            taskContext.logger.info(`Build scripts completed for ${id}`);
        }

        const testStartTime = Date.now();
        for (const script of this.scripts) {
            if (Array.isArray(skipScripts) && script.name != null && skipScripts.includes(script.name)) {
                continue;
            }

            const testCommands = getCommandsForPhase(script.commands, "test");
            if (testCommands.length > 0) {
                if (!anyTestCommands) {
                    taskContext.logger.info(`Running test scripts for ${id}...`);
                }
                anyTestCommands = true;
                const result = await this.runScript({
                    taskContext,
                    containerId: script.containerId,
                    outputDir,
                    commands: testCommands,
                    id
                });
                if (result.type === "failure") {
                    testTimeMs = Date.now() - testStartTime;
                    taskContext.logger.info(`Test scripts failed for ${id}`);
                    return {
                        type: "failure",
                        phase: "test",
                        message: result.message ?? "Test script failed",
                        buildTimeMs,
                        testTimeMs
                    };
                }
            }
        }
        if (anyTestCommands) {
            testTimeMs = Date.now() - testStartTime;
            taskContext.logger.info(`Test scripts completed for ${id}`);
        }

        return { type: "success", buildTimeMs, testTimeMs };
    }

    public async stop(): Promise<void> {
        for (const script of this.scripts) {
            await loggingExeca(this.context.logger, this.runner, ["kill", script.containerId], {
                doNotPipeOutput: false
            });
        }
    }

    protected async initialize(): Promise<void> {
        await this.startContainers(this.context);
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

        taskContext.logger.debug(`Running script on ${id}:\n${scriptContents}`);

        // Move scripts and generated files into the container
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

        // Now actually run the test script
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
            taskContext.logger.error("Failed to run script. See output below");
            taskContext.logger.error(command.stdout);
            taskContext.logger.error(command.stderr);
            return { type: "failure", message: command.stdout };
        } else {
            return { type: "success" };
        }
    }

    private async buildFernCli(context: TaskContext): Promise<AbsoluteFilePath> {
        const rootDir = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("../../.."));
        await loggingExeca(context.logger, "pnpm", ["fern:build"], { cwd: rootDir });
        return join(rootDir, RelativeFilePath.of("packages/cli/cli/dist/prod"));
    }

    private async startContainers(context: TaskContext): Promise<void> {
        const absoluteFilePathToFernCli = await this.buildFernCli(context);
        const cliVolumeBind = `${absoluteFilePathToFernCli}:/fern`;
        // Start running a container for each script instance
        for (const script of this.workspace.workspaceConfig.scripts ?? []) {
            const startSeedCommand = await loggingExeca(
                context.logger,
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
                    script.image,
                    "/bin/sh"
                ],
                {
                    doNotPipeOutput: false
                }
            );
            const containerId = startSeedCommand.stdout;
            this.scripts.push({ ...script, containerId });
        }
    }
}
