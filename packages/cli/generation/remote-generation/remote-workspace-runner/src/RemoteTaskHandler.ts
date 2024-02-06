import { noop } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { GeneratorInvocation } from "@fern-api/generators-configuration";
import { LogLevel } from "@fern-api/logger";
import { InteractiveTaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import axios from "axios";
import chalk from "chalk";
import decompress from "decompress";
import { createWriteStream } from "fs";
import { mkdir, rm } from "fs/promises";
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
    export interface Response {
        createdSnippets: boolean;
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

    public async processUpdate(
        remoteTask: FernFiddle.remoteGen.Task | undefined
    ): Promise<RemoteTaskHandler.Response | undefined> {
        if (remoteTask == null) {
            this.context.failAndThrow("Task is missing on job status");
        }

        const coordinates = remoteTask.packages.map((p) => {
            return p.coordinate._visit({
                npm: (npmPackage) => `${npmPackage.name}@${npmPackage.version}`,
                maven: (mavenPackage) => `${mavenPackage.group}:${mavenPackage.artifact}:${mavenPackage.version}`,
                pypi: (pypiPackage) => `${pypiPackage.name} ${pypiPackage.version}`,
                ruby: (rubyGem) => `${rubyGem.name}:${rubyGem.version}`,
                _other: () => "<unknown package>"
            });
        });

        this.context.setSubtitle(
            coordinates.length > 0
                ? coordinates
                      .map((coordinate) => {
                          return `◦ ${coordinate}`;
                      })
                      .join("\n")
                : undefined
        );

        for (const newLog of remoteTask.logs.slice(this.lengthOfLastLogs)) {
            this.context.logger.log(convertLogLevel(newLog.level), newLog.message);
        }
        this.lengthOfLastLogs = remoteTask.logs.length;

        const logS3Url = (s3Url: string) => {
            this.context.logger.debug(
                `Generated files. ${terminalLink("View here", s3Url, {
                    fallback: (text, url) => `${text}: ${url}`
                })}`
            );
        };

        await remoteTask.status._visit<void | Promise<void>>({
            notStarted: noop,
            running: noop,
            failed: ({ message, s3PreSignedReadUrl }) => {
                if (s3PreSignedReadUrl != null) {
                    logS3Url(s3PreSignedReadUrl);
                }
                this.context.failAndThrow(message);
            },
            finished: async (finishedStatus) => {
                if (finishedStatus.s3PreSignedReadUrlV2 != null) {
                    logS3Url(finishedStatus.s3PreSignedReadUrlV2);
                    if (this.generatorInvocation.absolutePathToLocalOutput != null) {
                        await downloadFilesForTask({
                            s3PreSignedReadUrl: finishedStatus.s3PreSignedReadUrlV2,
                            absolutePathToLocalOutput: this.generatorInvocation.absolutePathToLocalOutput,
                            context: this.context
                        });
                    }
                }
                for (const coordinate of coordinates) {
                    this.context.logger.info(`Published ${coordinate}`);
                }
                this.#isFinished = true;
                this.#createdSnippets = finishedStatus.createdSnippets != null ? finishedStatus.createdSnippets : false;
            },
            _other: () => {
                this.context.logger.warn("Received unknown update type: " + remoteTask.status.type);
            }
        });

        return this.#isFinished ? { createdSnippets: this.#createdSnippets } : undefined;
    }

    #isFinished = false;
    public get isFinished(): boolean {
        return this.#isFinished;
    }

    #createdSnippets = false;
    public get createdSnippets(): boolean {
        return this.#createdSnippets;
    }
}

async function downloadFilesForTask({
    s3PreSignedReadUrl,
    absolutePathToLocalOutput,
    context
}: {
    s3PreSignedReadUrl: string;
    absolutePathToLocalOutput: AbsoluteFilePath;
    context: InteractiveTaskContext;
}) {
    try {
        // initiate request
        const request = await axios.get(s3PreSignedReadUrl, {
            responseType: "stream"
        });

        // pipe to zip
        const tmpDir = await tmp.dir({ prefix: "fern", unsafeCleanup: true });
        const outputZipPath = path.join(tmpDir.path, "output.zip");
        await pipeline(request.data, createWriteStream(outputZipPath));

        // decompress to user-specified location
        if (await doesPathExist(absolutePathToLocalOutput)) {
            await rm(absolutePathToLocalOutput, { recursive: true });
        }
        await mkdir(absolutePathToLocalOutput, { recursive: true });
        await decompress(outputZipPath, absolutePathToLocalOutput);

        context.logger.info(chalk.green(`Downloaded to ${absolutePathToLocalOutput}`));
    } catch (e) {
        context.failAndThrow("Failed to download files", e);
    }
}

function convertLogLevel(logLevel: FernFiddle.LogLevel): LogLevel {
    switch (logLevel) {
        case "DEBUG":
            return LogLevel.Debug;
        case "INFO":
            return LogLevel.Info;
        case "WARN":
            return LogLevel.Warn;
        case "ERROR":
            return LogLevel.Error;
        default:
            return LogLevel.Info;
    }
}
