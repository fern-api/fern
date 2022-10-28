import { noop } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { GeneratorInvocation } from "@fern-api/generators-configuration";
import { LogLevel } from "@fern-api/logger";
import { InteractiveTaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-client";
import axios from "axios";
import chalk from "chalk";
import decompress from "decompress";
import { createWriteStream } from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import terminalLink from "terminal-link";
import tmp from "tmp-promise";

export declare namespace RemoteTaskHandler {
    export interface Init {
        job: FernFiddle.remoteGen.CreateJobResponse;
        taskId: FernFiddle.remoteGen.RemoteGenTaskId;
        interactiveTaskContext: InteractiveTaskContext;
        generatorInvocation: GeneratorInvocation;
    }
}

export class RemoteTaskHandler {
    private context: InteractiveTaskContext;
    private generatorInvocation: GeneratorInvocation;
    private lengthOfLastLogs = 0;

    constructor({ interactiveTaskContext, generatorInvocation }: RemoteTaskHandler.Init) {
        this.context = interactiveTaskContext;
        this.generatorInvocation = generatorInvocation;
    }

    public async processUpdate(remoteTask: FernFiddle.remoteGen.Task | undefined): Promise<void> {
        if (remoteTask == null) {
            this.context.failAndThrow("Task is missing on job status");
        }

        this.context.setSubtitle(
            remoteTask.packages.length > 0
                ? remoteTask.packages
                      .map((p) => {
                          const coordinateStr = p.coordinate._visit({
                              npm: (npmPackage) => `${npmPackage.name}@${npmPackage.version}`,
                              maven: (mavenPackage) =>
                                  `${mavenPackage.group}:${mavenPackage.artifact}:${mavenPackage.version}`,
                              pypi: (pypiPackage) => `${pypiPackage.name} ${pypiPackage.version}`,
                              _other: () => "<unknown package>",
                          });
                          return `◦ ${coordinateStr}`;
                      })
                      .join("\n")
                : undefined
        );

        for (const newLog of remoteTask.logs.slice(this.lengthOfLastLogs)) {
            const level = newLog.level.visit({
                debug: () => LogLevel.Debug,
                info: () => LogLevel.Info,
                warn: () => LogLevel.Warn,
                error: () => LogLevel.Error,
                _other: () => LogLevel.Info,
            });
            this.context.logger.log(level, newLog.message);
        }
        this.lengthOfLastLogs = remoteTask.logs.length;

        const log_s3_url = (s3Url: string) => {
            this.context.logger.debug(
                `Generated files. ${terminalLink("View here", s3Url, {
                    fallback: (text, url) => `${text}: ${url}`,
                })}`
            );
        };

        await remoteTask.status._visit<void | Promise<void>>({
            notStarted: noop,
            running: noop,
            failed: ({ message, s3PreSignedReadUrl }) => {
                if (s3PreSignedReadUrl != null) {
                    log_s3_url(s3PreSignedReadUrl);
                }
                this.context.failAndThrow(message);
            },
            finished: async (finishedStatus) => {
                await this.maybeDownloadFiles(finishedStatus);
                log_s3_url(finishedStatus.s3PreSignedReadUrl);
                this.#isFinished = true;
            },
            _other: () => {
                this.context.logger.warn("Received unknown update type: " + remoteTask.status.type);
            },
        });
    }

    #isFinished = false;
    public get isFinished(): boolean {
        return this.#isFinished;
    }

    private async maybeDownloadFiles(status: FernFiddle.remoteGen.FinishedTaskStatus): Promise<void> {
        if (this.generatorInvocation.type === "draft" && this.generatorInvocation.absolutePathToLocalOutput != null) {
            await downloadFilesForTask({
                s3PreSignedReadUrl: status.s3PreSignedReadUrl,
                absolutePathToLocalOutput: this.generatorInvocation.absolutePathToLocalOutput,
                context: this.context,
            });
        }
    }
}

async function downloadFilesForTask({
    s3PreSignedReadUrl,
    absolutePathToLocalOutput,
    context,
}: {
    s3PreSignedReadUrl: string;
    absolutePathToLocalOutput: AbsoluteFilePath;
    context: InteractiveTaskContext;
}) {
    const tmpDir = await tmp.dir({
        prefix: "fern",
        unsafeCleanup: true,
    });
    const outputZipPath = path.join(tmpDir.path, "output.zip");
    try {
        const request = await axios.get(s3PreSignedReadUrl, {
            responseType: "stream",
        });
        await pipeline(request.data, createWriteStream(outputZipPath));
        await decompress(outputZipPath, absolutePathToLocalOutput);
        context.logger.info(chalk.green(`Downloaded to ${absolutePathToLocalOutput}`));
    } catch (e) {
        context.failAndThrow("Failed to download files", e);
    }
    await tmpDir.cleanup();
}
