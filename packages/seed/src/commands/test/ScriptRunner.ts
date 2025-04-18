import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";

import { Semaphore } from "../../Semaphore";
import { DockerScriptConfig } from "../../config/api";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";

export declare namespace ScriptRunner {
    interface RunArgs {
        taskContext: TaskContext;
        outputDir: AbsoluteFilePath;
        id: string;
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

interface RunningScriptConfig extends DockerScriptConfig {
    containerId: string;
}

/**
 * Runs scripts on the generated code to verify the output.
 */
export class ScriptRunner {
    private startContainersFn: Promise<void> | undefined;
    private scripts: RunningScriptConfig[] = [];
    private lock = new Semaphore(1);

    constructor(
        private readonly workspace: GeneratorWorkspace,
        private readonly skipScripts: boolean,
        private readonly context: TaskContext
    ) {
        if (!skipScripts) {
            this.startContainersFn = this.startContainers(context);
        }
    }

    public async run({ taskContext, id, outputDir }: ScriptRunner.RunArgs): Promise<ScriptRunner.RunResponse> {
        await this.startContainersFn;
        for (const script of this.scripts) {
            const result = await this.runScript({
                taskContext,
                containerId: script.containerId,
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
        for (const script of this.scripts) {
            await loggingExeca(undefined, "docker", ["kill", script.containerId]);
        }
    }

    private async runScript({
        taskContext,
        containerId,
        outputDir,
        script,
        id
    }: {
        id: string;
        outputDir: AbsoluteFilePath;
        taskContext: TaskContext;
        containerId: string;
        script: DockerScriptConfig;
    }): Promise<ScriptRunner.RunResponse> {
        taskContext.logger.info(`Running script ${script.commands[0] ?? ""} on ${id}`);

        const workDir = id.replace(":", "_");
        const scriptFile = await tmp.file();
        await writeFile(scriptFile.path, ["set -e", `cd /${workDir}/generated`, ...script.commands].join("\n"));

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
            taskContext.logger.error("Failed to mkdir for scripts. See output below");
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
            taskContext.logger.error("Failed to copy script. See output below");
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
            taskContext.logger.error("Failed to copy generated files. See output below");
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
        // Start running a docker container for each script instance
        for (const script of this.workspace.workspaceConfig.scripts ?? []) {
            const startSeedCommand = await loggingExeca(undefined, "docker", [
                "run",
                "-dit",
                "-v",
                cliVolumeBind,
                script.docker,
                "/bin/sh"
            ]);
            const containerId = startSeedCommand.stdout;
            this.scripts.push({ ...script, containerId });
        }
    }
}
