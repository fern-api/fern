import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

import { GeneratorWorkspace } from "../../../loadGeneratorWorkspaces";
import { ScriptRunner } from "./ScriptRunner";

/**
 * Runs scripts on the generated code to verify the output locally (without Docker).
 */
export class LocalScriptRunner extends ScriptRunner {
    constructor(workspace: GeneratorWorkspace, skipScripts: boolean, context: TaskContext) {
        super(workspace, skipScripts, context);
    }

    public async run({ taskContext, id, outputDir }: ScriptRunner.RunArgs): Promise<ScriptRunner.RunResponse> {
        if (this.skipScripts) {
            return { type: "success" };
        }

        const scripts = this.workspace.workspaceConfig.scripts ?? [];

        for (const script of scripts) {
            const result = await this.runScript({
                taskContext,
                outputDir,
                script,
                id
            });
            if (result.type === "failure") {
                return result;
            }
        }
        return { type: "success" };
    }

    public async stop(): Promise<void> {
        // No containers to stop for local execution
    }

    public async cleanup({ taskContext, id }: { taskContext: TaskContext; id: string }): Promise<void> {
        if (this.skipScripts) {
            return;
        }

        taskContext.logger.debug(`Cleaning up fixture ${id} (local execution)`);

        // For local execution, clean up Poetry virtualenvs in the output directory
        // This is less critical since local runs use temporary directories that are cleaned up anyway
        // But we can still clean up Poetry caches to free space
        try {
            await loggingExeca(taskContext.logger, "poetry", ["cache", "clear", "--all", "pypi"], {
                doNotPipeOutput: false,
                reject: false
            });
            taskContext.logger.debug(`Successfully cleaned up Poetry cache for fixture ${id}`);
        } catch (error) {
            taskContext.logger.warn(`Cleanup warning for fixture ${id}: ${error}`);
        }
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
    }): Promise<ScriptRunner.RunResponse> {
        taskContext.logger.info(`Running local script ${script.commands[0] ?? ""} on ${id}`);

        const scriptFile = await tmp.file();
        await writeFile(scriptFile.path, ["set -e", `cd ${outputDir}`, ...script.commands].join("\n"));

        // Make script executable and run it
        const chmodCommand = await loggingExeca(undefined, "chmod", ["+x", scriptFile.path], {
            doNotPipeOutput: false,
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
            doNotPipeOutput: false,
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
