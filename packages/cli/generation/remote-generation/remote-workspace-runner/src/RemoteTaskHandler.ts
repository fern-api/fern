import { AbsoluteFilePath, noop } from "@fern-api/core-utils";
import { GeneratorInvocation } from "@fern-api/generators-configuration";
import { LogLevel } from "@fern-api/logger";
import { Finishable, InteractiveTaskContext } from "@fern-api/task-context";
import { Fiddle } from "@fern-fern/fiddle-client-v2";
import axios from "axios";
import chalk from "chalk";
import { createWriteStream } from "fs";
import urlJoin from "url-join";
import { FIDDLE_ORIGIN } from "./service";

export declare namespace RemoteTaskHandler {
    export interface Init {
        job: Fiddle.remoteGen.CreateJobResponse;
        taskId: Fiddle.remoteGen.RemoteGenTaskId;
        interactiveTaskContext: Finishable & InteractiveTaskContext;
        generatorInvocation: GeneratorInvocation;
    }
}

export class RemoteTaskHandler {
    private job: Fiddle.remoteGen.CreateJobResponse;
    private taskId: Fiddle.remoteGen.RemoteGenTaskId;
    private context: Finishable & InteractiveTaskContext;
    private generatorInvocation: GeneratorInvocation;
    private lengthOfLastLogs = 0;

    constructor({ job, taskId, interactiveTaskContext, generatorInvocation }: RemoteTaskHandler.Init) {
        this.job = job;
        this.taskId = taskId;
        this.context = interactiveTaskContext;
        this.generatorInvocation = generatorInvocation;
    }

    public processUpdate(remoteTask: Fiddle.remoteGen.Task | undefined): void {
        if (remoteTask == null) {
            this.context.fail("Task is missing on job status");
            this.context.finish();
            return;
        }

        if (this.isFinished()) {
            return;
        }

        this.context.setSubtitle(
            remoteTask.packages.length > 0
                ? remoteTask.packages
                      .map((p) => {
                          const coordinateStr = Fiddle.remoteGen.PackageCoordinate._visit(p.coordinate, {
                              npm: (npmPackage) => `${npmPackage.name}@${npmPackage.version}`,
                              maven: (mavenPackage) =>
                                  `${mavenPackage.group}:${mavenPackage.artifact}:${mavenPackage.version}`,
                              _unknown: () => "<unknown package>",
                          });
                          return `◦ ${coordinateStr}`;
                      })
                      .join("\n")
                : undefined
        );

        for (const newLog of remoteTask.logs.slice(this.lengthOfLastLogs)) {
            const level = Fiddle.remoteGen.LogLevel._visit(newLog.level, {
                debug: () => LogLevel.Debug,
                info: () => LogLevel.Info,
                warn: () => LogLevel.Warn,
                error: () => LogLevel.Error,
                _unknown: () => LogLevel.Info,
            });
            this.context.logger.log(level, newLog.message);
        }
        this.lengthOfLastLogs = remoteTask.logs.length;

        Fiddle.remoteGen.TaskStatus._visit(remoteTask.status, {
            notStarted: noop,
            running: noop,
            failed: ({ message }) => {
                this.context.fail(message);
                this.context.finish();
            },
            finished: async (finishedStatus) => {
                await this.maybeDownloadFiles(finishedStatus);
                this.context.finish();
            },
            _unknown: () => {
                this.context.logger.warn("Received unknown update type: " + remoteTask.status._type);
                this.context.finish();
            },
        });
    }

    public isFinished(): boolean {
        return this.context.isFinished();
    }

    private async maybeDownloadFiles(status: Fiddle.remoteGen.FinishedTaskStatus): Promise<void> {
        if (this.generatorInvocation.type === "draft" && this.generatorInvocation.absolutePathToLocalOutput != null) {
            if (!status.hasFilesToDownload) {
                this.context.fail("No files available to download");
                return;
            }
            try {
                await downloadFilesForTask({
                    jobId: this.job.jobId,
                    taskId: this.taskId,
                    absolutePathToLocalOutput: this.generatorInvocation.absolutePathToLocalOutput,
                    context: this.context,
                });
            } catch {
                this.context.fail(`Failed to download ${this.generatorInvocation.absolutePathToLocalOutput}`);
            }
        }
    }
}

async function downloadFilesForTask({
    jobId,
    taskId,
    absolutePathToLocalOutput,
    context,
}: {
    jobId: Fiddle.remoteGen.RemoteGenJobId;
    taskId: Fiddle.remoteGen.RemoteGenTaskId;
    absolutePathToLocalOutput: AbsoluteFilePath;
    context: Finishable & InteractiveTaskContext;
}) {
    const writer = createWriteStream(absolutePathToLocalOutput);
    await axios
        .get(urlJoin(FIDDLE_ORIGIN, `/api/remote-gen/tasks/${taskId}/jobs/${jobId}/downloadFiles`), {
            responseType: "stream",
        })
        .then((response) => {
            response.data.pipe(writer);
            context.logger.info(chalk.green("Downloaded: " + absolutePathToLocalOutput));
        })
        .catch(() => {
            context.fail("Failed to download: " + absolutePathToLocalOutput);
        });
}
