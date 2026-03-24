import { ContainerRunner } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER, Logger, LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

import { ContainerScriptConfig, ScriptCommands } from "../../../config/api/index.js";
import { GeneratorWorkspace } from "../../../loadGeneratorWorkspaces.js";
import { ScriptRunner } from "./ScriptRunner.js";

interface RunningScriptConfig extends ContainerScriptConfig {
    containerId: string;
}

/**
 * A slot represents one set of running containers (one per script config).
 * Multiple slots form a pool, allowing fixtures to run scripts in parallel.
 */
interface ContainerSlot {
    scripts: RunningScriptConfig[];
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
    private readonly poolSize: number;
    private startContainersFn: Promise<void> | undefined;

    // Pool of container slots for parallel script execution
    private allSlots: ContainerSlot[] = [];
    private availableSlots: ContainerSlot[] = [];
    private waiters: Array<(slot: ContainerSlot) => void> = [];

    constructor(
        workspace: GeneratorWorkspace,
        skipScripts: boolean,
        context: TaskContext,
        logLevel: LogLevel,
        runner?: ContainerRunner,
        poolSize?: number
    ) {
        super(workspace, skipScripts, context, logLevel);
        this.poolSize = poolSize ?? 4;

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

        // No slots available (no scripts configured or skipScripts at class level)
        if (this.allSlots.length === 0) {
            return { type: "success" };
        }

        const slot = await this.acquireSlot();
        try {
            return await this.runInSlot({ slot, taskContext, id, outputDir, skipScripts });
        } finally {
            this.releaseSlot(slot);
        }
    }

    private async runInSlot({
        slot,
        taskContext,
        id,
        outputDir,
        skipScripts
    }: {
        slot: ContainerSlot;
        taskContext: TaskContext;
        id: string;
        outputDir: AbsoluteFilePath;
        skipScripts?: boolean | string[];
    }): Promise<ScriptRunner.RunResponse> {
        const workDir = id.replace(":", "_");
        try {
            return await this.executeScriptsInSlot({ slot, taskContext, id, outputDir, skipScripts });
        } finally {
            // Clean up the fixture's working directory to free disk space.
            // Package manager caches (npm, nuget, yarn, pip, etc.) live in global
            // paths (e.g. ~/.npm, ~/.nuget) and are preserved across fixtures.
            for (const script of slot.scripts) {
                await loggingExeca(undefined, this.runner, ["exec", script.containerId, "rm", "-rf", `/${workDir}`], {
                    doNotPipeOutput: true,
                    reject: false
                });
            }
        }
    }

    private async executeScriptsInSlot({
        slot,
        taskContext,
        id,
        outputDir,
        skipScripts
    }: {
        slot: ContainerSlot;
        taskContext: TaskContext;
        id: string;
        outputDir: AbsoluteFilePath;
        skipScripts?: boolean | string[];
    }): Promise<ScriptRunner.RunResponse> {
        let buildTimeMs: number | undefined;
        let testTimeMs: number | undefined;
        let anyBuildCommands = false;
        let anyTestCommands = false;

        const buildStartTime = Date.now();
        for (const script of slot.scripts) {
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
        for (const script of slot.scripts) {
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
        const logger = this.shouldStreamOutput() ? this.context.logger : undefined;
        const killPromises = this.allSlots.flatMap((slot) =>
            slot.scripts.map((script) =>
                loggingExeca(logger, this.runner, ["kill", script.containerId], {
                    doNotPipeOutput: !this.shouldStreamOutput()
                })
            )
        );
        await Promise.all(killPromises);
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
        const logger = this.shouldStreamOutput() ? context.logger : undefined;
        await loggingExeca(logger, "pnpm", ["fern:build"], {
            cwd: rootDir,
            doNotPipeOutput: !this.shouldStreamOutput()
        });
        return join(rootDir, RelativeFilePath.of("packages/cli/cli/dist/prod"));
    }

    /**
     * Acquires a container slot from the pool, waiting if all are busy.
     */
    private acquireSlot(): Promise<ContainerSlot> {
        const available = this.availableSlots.shift();
        if (available != null) {
            return Promise.resolve(available);
        }
        return new Promise<ContainerSlot>((resolve) => {
            this.waiters.push(resolve);
        });
    }

    /**
     * Releases a container slot back to the pool, waking up any waiters.
     */
    private releaseSlot(slot: ContainerSlot): void {
        const waiter = this.waiters.shift();
        if (waiter != null) {
            waiter(slot);
        } else {
            this.availableSlots.push(slot);
        }
    }

    private async startContainers(context: TaskContext): Promise<void> {
        const scriptConfigs = this.workspace.workspaceConfig.scripts ?? [];
        if (scriptConfigs.length === 0) {
            return;
        }

        const absoluteFilePathToFernCli = await this.buildFernCli(context);
        const cliVolumeBind = `${absoluteFilePathToFernCli}:/fern`;
        const logger = this.shouldStreamOutput() ? context.logger : undefined;

        if (!this.shouldStreamOutput()) {
            const imageNames = scriptConfigs.map((s) => s.image).join(", ");
            CONSOLE_LOGGER.info(`Starting ${this.poolSize} script container(s) for [${imageNames}]...`);
        }

        // Start poolSize slots in parallel, each slot has one container per script config
        const startPromises: Promise<ContainerSlot>[] = [];
        for (let i = 0; i < this.poolSize; i++) {
            startPromises.push(this.startSlot(scriptConfigs, cliVolumeBind, logger));
        }

        try {
            this.allSlots = await Promise.all(startPromises);
            this.availableSlots = [...this.allSlots];
        } catch (error) {
            // Clean up any containers that started successfully before the failure
            const settledPromises = await Promise.allSettled(startPromises);
            for (const result of settledPromises) {
                if (result.status === "fulfilled") {
                    for (const script of result.value.scripts) {
                        await loggingExeca(logger, this.runner, ["kill", script.containerId], {
                            doNotPipeOutput: true
                        }).catch((killError: unknown) => {
                            CONSOLE_LOGGER.warn(
                                `Best-effort cleanup: failed to kill container ${script.containerId}: ${killError}`
                            );
                        });
                    }
                }
            }
            this.allSlots = [];
            this.availableSlots = [];
            throw error;
        }
    }

    private async startSlot(
        scriptConfigs: ContainerScriptConfig[],
        cliVolumeBind: string,
        logger: Logger | undefined
    ): Promise<ContainerSlot> {
        const scripts: RunningScriptConfig[] = [];
        try {
            for (const script of scriptConfigs) {
                const startSeedCommand = await loggingExeca(
                    logger,
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
                        doNotPipeOutput: !this.shouldStreamOutput()
                    }
                );
                const containerId = startSeedCommand.stdout;
                scripts.push({ ...script, containerId });
            }
            return { scripts };
        } catch (error) {
            // Clean up any containers that started before the failure in this slot
            for (const script of scripts) {
                await loggingExeca(logger, this.runner, ["kill", script.containerId], {
                    doNotPipeOutput: true
                }).catch((killError: unknown) => {
                    CONSOLE_LOGGER.warn(
                        `Failed to kill container ${script.containerId} during slot cleanup: ${killError}`
                    );
                });
            }
            throw error;
        }
    }
}
