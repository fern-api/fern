import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

import { ScriptCommands } from "../../../config/api";
import { GeneratorWorkspace } from "../../../loadGeneratorWorkspaces";
import { ScriptRunner } from "./ScriptRunner";

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
 * Runs scripts on the generated code to verify the output locally (without Docker).
 */
export class LocalScriptRunner extends ScriptRunner {
    constructor(workspace: GeneratorWorkspace, skipScripts: boolean, context: TaskContext, logLevel: LogLevel) {
        super(workspace, skipScripts, context, logLevel);
    }

    public async run({
        taskContext,
        id,
        outputDir,
        skipScripts
    }: ScriptRunner.RunArgs): Promise<ScriptRunner.RunResponse> {
        if (this.skipScripts) {
            return { type: "success" };
        }

        const scripts = this.workspace.workspaceConfig.scripts ?? [];

        let buildTimeMs: number | undefined;
        let testTimeMs: number | undefined;
        let anyBuildCommands = false;
        let anyTestCommands = false;

        const buildStartTime = Date.now();
        for (const script of scripts) {
            if (skipScripts != null && script.name != null && skipScripts.includes(script.name)) {
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
        for (const script of scripts) {
            if (skipScripts != null && script.name != null && skipScripts.includes(script.name)) {
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
        // No containers to stop for local execution
    }

    protected async initialize(): Promise<void> {
        // No initialization needed for local execution
    }

    private async runScript({
        taskContext,
        outputDir,
        commands,
        id
    }: {
        id: string;
        outputDir: AbsoluteFilePath;
        taskContext: TaskContext;
        commands: string[];
    }): Promise<InternalScriptResult> {
        const scriptFile = await tmp.file();
        const scriptContents = ["set -e", `cd ${outputDir}`, ...commands].join("\n");
        await writeFile(scriptFile.path, scriptContents);

        taskContext.logger.debug(`Running local script on ${id}:\n${scriptContents}`);

        // Make script executable and run it
        const chmodCommand = await loggingExeca(undefined, "chmod", ["+x", scriptFile.path], {
            doNotPipeOutput: true,
            reject: false
        });

        if (chmodCommand.failed) {
            taskContext.logger.error("Failed to make script executable. See output below");
            taskContext.logger.error(chmodCommand.stdout);
            taskContext.logger.error(chmodCommand.stderr);
            return { type: "failure", message: chmodCommand.stdout };
        }

        const command = await loggingExeca(taskContext.logger, "/bin/sh", [scriptFile.path], {
            cwd: outputDir,
            doNotPipeOutput: true,
            reject: false
        });

        if (command.failed) {
            taskContext.logger.error("Failed to run local script. See output below");
            taskContext.logger.error(command.stdout);
            taskContext.logger.error(command.stderr);
            return { type: "failure", message: command.stdout };
        } else {
            return { type: "success" };
        }
    }
}
