import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";
import { ScriptConfig } from "../../config/api";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";

export declare namespace ScriptRunner {
    interface RunArgs {
        taskContext: TaskContext;
        fixture: string;
        outputDir: AbsoluteFilePath;
        outputFolder: string;
    }

    type RunResponse = ScriptSuccessResponse | ScriptFailureResponse;

    interface ScriptSuccessResponse {
        type: "success";
    }

    interface ScriptFailureResponse {
        type: "failure";
        message: string;
    }
}

interface RunningScriptConfig extends ScriptConfig {
    containerId: string;
}

/**
 * Runs scripts on the generated code to verify the output.
 */
export class ScriptRunner {
    private started: boolean = false;
    private scripts: RunningScriptConfig[] = [];

    constructor(private readonly workspace: GeneratorWorkspace) {}

    public async run({ taskContext, fixture, outputDir }: ScriptRunner.RunArgs): Promise<ScriptRunner.RunResponse> {
        await this.startContainers();
        for (const script of this.scripts) {
            const result = await this.runScript({
                taskContext,
                containerId: script.containerId,
                outputDir,
                script,
                fixture,
                outputFolder: "generated"
            });
            if (result.type === "failure") {
                return result;
            }
        }
        return { type: "success" };
    }

    private async runScript({
        taskContext,
        containerId,
        outputDir,
        script,
        fixture,
        outputFolder
    }: {
        fixture: string;
        outputDir: AbsoluteFilePath;
        outputFolder: string;
        taskContext: TaskContext;
        containerId: string;
        script: ScriptConfig;
    }): Promise<ScriptRunner.RunResponse> {
        taskContext.logger.info(`Running script ${script.commands[0] ?? ""} on ${fixture}`);

        const workDir = `${fixture}_${outputFolder}`;
        const scriptFile = await tmp.file();
        await writeFile(scriptFile.path, [`cd /${workDir}/generated`, ...script.commands].join("\n"));

        // Move scripts and generated files into the container
        const mkdirCommand = await loggingExeca(
            taskContext.logger,
            "docker",
            ["exec", containerId, "mkdir", `/${workDir}`],
            {
                doNotPipeOutput: true,
                reject: false
            }
        );
        if (mkdirCommand.failed) {
            taskContext.logger.error("Failed to mkdir for scripts. See ouptut below");
            taskContext.logger.error(mkdirCommand.stdout);
            taskContext.logger.error(mkdirCommand.stderr);
            return { type: "failure", message: mkdirCommand.stdout };
        }
        const copyScriptCommand = await loggingExeca(
            undefined,
            "docker",
            ["cp", scriptFile.path, `${containerId}:/${workDir}/test.sh`],
            {
                doNotPipeOutput: true,
                reject: false
            }
        );
        if (copyScriptCommand.failed) {
            taskContext.logger.error("Failed to copy script. See ouptut below");
            taskContext.logger.error(copyScriptCommand.stdout);
            taskContext.logger.error(copyScriptCommand.stderr);
            return { type: "failure", message: copyScriptCommand.stdout };
        }
        const copyCommand = await loggingExeca(
            taskContext.logger,
            "docker",
            ["cp", `${outputDir}/.`, `${containerId}:/${workDir}/generated/`],
            {
                doNotPipeOutput: true,
                reject: false
            }
        );
        if (copyCommand.failed) {
            taskContext.logger.error("Failed to copy generated files. See ouptut below");
            taskContext.logger.error(copyCommand.stdout);
            taskContext.logger.error(copyCommand.stderr);
            return { type: "failure", message: copyCommand.stdout };
        }

        // Now actually run the test script
        const command = await loggingExeca(
            taskContext.logger,
            "docker",
            ["exec", containerId, "/bin/sh", "-c", `chmod +x /${workDir}/test.sh && /${workDir}/test.sh`],
            {
                doNotPipeOutput: true,
                reject: false
            }
        );
        if (command.failed) {
            taskContext.logger.error("Failed to run script. See ouptut below");
            taskContext.logger.error(command.stdout);
            taskContext.logger.error(command.stderr);
            return { type: "failure", message: command.stdout };
        } else {
            return { type: "success" };
        }
    }

    private async startContainers(): Promise<void> {
        if (this.started) {
            return;
        }
        // Start running a docker container for each script instance
        for (const script of this.workspace.workspaceConfig.scripts ?? []) {
            const startSeedCommand = await loggingExeca(undefined, "docker", ["run", "-dit", script.docker, "/bin/sh"]);
            const containerId = startSeedCommand.stdout;
            this.scripts.push({ ...script, containerId });
        }
        this.started = true;
    }
}
