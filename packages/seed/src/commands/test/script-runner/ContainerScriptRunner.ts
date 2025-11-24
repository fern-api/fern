import { ContainerRunner } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

import { ContainerScriptConfig } from "../../../config/api";
import { GeneratorWorkspace } from "../../../loadGeneratorWorkspaces";
import { ScriptRunner } from "./ScriptRunner";

interface RunningScriptConfig extends ContainerScriptConfig {
    containerId: string;
}

/**
 * Runs scripts on the generated code to verify the output using container runtimes (Docker or Podman).
 */
export class ContainerScriptRunner extends ScriptRunner {
    private readonly runner: ContainerRunner;
    private startContainersFn: Promise<void> | undefined;
    private scripts: RunningScriptConfig[] = [];

    constructor(workspace: GeneratorWorkspace, skipScripts: boolean, context: TaskContext, runner?: ContainerRunner) {
        super(workspace, skipScripts, context);

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
        await this.startContainersFn;
        for (const script of this.scripts) {
            // Check if this script should be skipped based on its name
            if (skipScripts != null && script.name != null && skipScripts.includes(script.name)) {
                taskContext.logger.info(`Skipping script "${script.name}" for ${id} (configured in fixture)`);
                continue;
            }

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
        script,
        id
    }: {
        id: string;
        outputDir: AbsoluteFilePath;
        taskContext: TaskContext;
        containerId: string;
        script: ContainerScriptConfig;
    }): Promise<ScriptRunner.RunResponse> {
        taskContext.logger.info(`Running script ${script.commands[0] ?? ""} on ${id}`);

        const workDir = id.replace(":", "_");
        const scriptFile = await tmp.file();
        await writeFile(scriptFile.path, ["set -e", `cd /${workDir}/generated`, ...script.commands].join("\n"));

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
