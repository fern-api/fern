import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";

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
