import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

import { DockerScriptConfig } from "../../../config/api";
import { GeneratorWorkspace } from "../../../loadGeneratorWorkspaces";
import { ScriptRunner } from "./ScriptRunner";

interface RunningScriptConfig extends DockerScriptConfig {
    containerId: string;
}

/**
 * Runs scripts on the generated code to verify the output using Docker containers.
 */
export class DockerScriptRunner extends ScriptRunner {
    private startContainersFn: Promise<void> | undefined;
    private scripts: RunningScriptConfig[] = [];

    constructor(workspace: GeneratorWorkspace, skipScripts: boolean, context: TaskContext) {
        super(workspace, skipScripts, context);
        if (!skipScripts) {
            this.startContainersFn = this.initialize();
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

    public async cleanup({
        taskContext,
        id,
        outputDir
    }: {
        taskContext: TaskContext;
        id: string;
        outputDir?: AbsoluteFilePath;
    }): Promise<void> {
        if (this.skipScripts) {
            return;
        }

        await this.startContainersFn;

        const postScripts = this.workspace.workspaceConfig.postScripts ?? [];

        if (postScripts.length > 0 && this.scripts.length > 0) {
            // Run configured postScripts using existing script containers (avoids setup overhead)
            for (let i = 0; i < postScripts.length && i < this.scripts.length; i++) {
                const postScript = postScripts[i];
                const containerToUse = this.scripts[i];

                if (!postScript || !containerToUse) {
                    taskContext.logger.warn(`Skipping postScript ${i}: missing postScript or container`);
                    continue;
                }

                taskContext.logger.debug(
                    `Running postScript cleanup for fixture ${id} in container ${containerToUse.containerId}`
                );

                // Execute postScript commands directly without file copying overhead
                const postScriptCommands = postScript.commands.join(" && ");

                const cleanupCommand = await loggingExeca(
                    taskContext.logger,
                    "docker",
                    ["exec", containerToUse.containerId, "/bin/sh", "-c", postScriptCommands],
                    {
                        doNotPipeOutput: false,
                        reject: false // Don't fail if cleanup has issues
                    }
                );

                if (cleanupCommand.failed) {
                    taskContext.logger.warn(`PostScript failed for fixture ${id}: ${cleanupCommand.stderr}`);
                } else {
                    taskContext.logger.debug(`PostScript completed for fixture ${id}`);
                }
            }
        }
    }

    public async stop(): Promise<void> {
        // Stop script containers (postScripts reuse these containers)
        for (const script of this.scripts) {
            await loggingExeca(this.context.logger, "docker", ["kill", script.containerId], {
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
        // Use mkdir -p to avoid failing if directory already exists (e.g., during cleanup)
        const mkdirCommand = await loggingExeca(
            taskContext.logger,
            "docker",
            ["exec", containerId, "mkdir", "-p", `/${workDir}`],
            {
                doNotPipeOutput: false,
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
                doNotPipeOutput: false,
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
                doNotPipeOutput: false,
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
                doNotPipeOutput: false,
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
        // Note: postScripts reuse existing script containers
        for (const script of this.workspace.workspaceConfig.scripts ?? []) {
            const startSeedCommand = await loggingExeca(
                context.logger,
                "docker",
                [
                    "run",
                    "--privileged",
                    "--cgroupns=host",
                    "-v",
                    "/sys/fs/cgroup:/sys/fs/cgroup:rw",
                    "-dit",
                    "-v",
                    cliVolumeBind,
                    script.docker,
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
