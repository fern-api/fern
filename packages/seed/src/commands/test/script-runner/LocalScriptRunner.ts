import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

import { Script } from "../../../config/api";
import { GeneratorWorkspace } from "../../../loadGeneratorWorkspaces";
import { ScriptRunner } from "./ScriptRunner";

interface InternalScriptResult {
    type: "success" | "failure";
    message?: string;
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
        const buildScripts = scripts.filter((script) => !this.isTestScript(script));
        const testScripts = scripts.filter((script) => this.isTestScript(script));

        let buildTimeMs: number | undefined;
        let testTimeMs: number | undefined;

        const buildStartTime = Date.now();
        for (const script of buildScripts) {
            if (skipScripts != null && script.name != null && skipScripts.includes(script.name)) {
                taskContext.logger.info(`Skipping build script "${script.name}" for ${id} (configured in fixture)`);
                continue;
            }

            const result = await this.runScript({
                taskContext,
                outputDir,
                script,
                id
            });
            if (result.type === "failure") {
                buildTimeMs = Date.now() - buildStartTime;
                return {
                    type: "failure",
                    phase: "build",
                    message: result.message ?? "Build script failed",
                    buildTimeMs
                };
            }
        }
        buildTimeMs = Date.now() - buildStartTime;

        const testStartTime = Date.now();
        for (const script of testScripts) {
            if (skipScripts != null && script.name != null && skipScripts.includes(script.name)) {
                taskContext.logger.info(`Skipping test script "${script.name}" for ${id} (configured in fixture)`);
                continue;
            }

            const result = await this.runScript({
                taskContext,
                outputDir,
                script,
                id
            });
            if (result.type === "failure") {
                testTimeMs = Date.now() - testStartTime;
                return {
                    type: "failure",
                    phase: "test",
                    message: result.message ?? "Test script failed",
                    buildTimeMs,
                    testTimeMs
                };
            }
        }
        testTimeMs = Date.now() - testStartTime;

        return { type: "success", buildTimeMs, testTimeMs };
    }

    private isTestScript(script: Script): boolean {
        return script.name != null && script.name.toLowerCase().startsWith("test");
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
        script,
        id
    }: {
        id: string;
        outputDir: AbsoluteFilePath;
        taskContext: TaskContext;
        script: { commands: string[] };
    }): Promise<InternalScriptResult> {
        const scriptFile = await tmp.file();
        const scriptContents = ["set -e", `cd ${outputDir}`, ...script.commands].join("\n");
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
