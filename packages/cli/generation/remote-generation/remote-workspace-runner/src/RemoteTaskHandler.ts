import axios from "axios";
import chalk from "chalk";
import decompress from "decompress";
import { createWriteStream } from "fs";
import { mkdir, rm } from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import terminalLink from "terminal-link";
import tmp from "tmp-promise";

import { generatorsYml } from "@fern-api/configuration";
import { noop } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { InteractiveTaskContext } from "@fern-api/task-context";

import { FernFiddle } from "@fern-fern/fiddle-sdk";

export declare namespace RemoteTaskHandler {
    export interface Init {
        job: FernFiddle.remoteGen.CreateJobResponse;
        taskId: FernFiddle.remoteGen.RemoteGenTaskId;
        interactiveTaskContext: InteractiveTaskContext;
        generatorInvocation: generatorsYml.GeneratorInvocation;
        absolutePathToPreview: AbsoluteFilePath | undefined;
    }
    export interface Response {
        createdSnippets: boolean;
        snippetsS3PreSignedReadUrl: string | undefined;
    }
}

export class RemoteTaskHandler {
    private context: InteractiveTaskContext;
    private generatorInvocation: generatorsYml.GeneratorInvocation;
    private absolutePathToPreview: AbsoluteFilePath | undefined;
    private lengthOfLastLogs = 0;

    constructor({ interactiveTaskContext, generatorInvocation, absolutePathToPreview }: RemoteTaskHandler.Init) {
        this.context = interactiveTaskContext;
        this.generatorInvocation = generatorInvocation;
        this.absolutePathToPreview = absolutePathToPreview;
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
                nuget: (nugetPakcage) => `${nugetPakcage.name} ${nugetPakcage.version}`,
                _other: () => "<unknown package>"
            });
        });

        if (this.absolutePathToPreview == null) {
            this.context.setSubtitle(
                coordinates.length > 0
                    ? coordinates
                          .map((coordinate) => {
                              return `◦ ${coordinate}`;
                          })
                          .join("\n")
                    : undefined
            );
        }

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
                    const absolutePathToLocalOutput = this.getAbsolutePathToLocalOutput();
                    if (absolutePathToLocalOutput != null) {
                        await downloadFilesForTask({
                            s3PreSignedReadUrl: finishedStatus.s3PreSignedReadUrlV2,
                            absolutePathToLocalOutput,
                            context: this.context
                        });
                    }
                }
                if (this.absolutePathToPreview == null) {
                    for (const coordinate of coordinates) {
                        this.context.logger.info(`Published ${coordinate}`);
                    }
                }
                this.#isFinished = true;
                this.#createdSnippets = finishedStatus.createdSnippets != null ? finishedStatus.createdSnippets : false;
                this.#snippetsS3PreSignedReadUrl = finishedStatus.snippetsS3PreSignedReadUrl;
            },
            _other: () => {
                this.context.logger.warn("Received unknown update type: " + remoteTask.status.type);
            }
        });

        return this.#isFinished
            ? {
                  createdSnippets: this.#createdSnippets,
                  snippetsS3PreSignedReadUrl: this.#snippetsS3PreSignedReadUrl
              }
            : undefined;
    }

    private getAbsolutePathToLocalOutput(): AbsoluteFilePath | undefined {
        return this.absolutePathToPreview != null
            ? join(this.absolutePathToPreview, RelativeFilePath.of(path.basename(this.generatorInvocation.name)))
            : this.generatorInvocation.absolutePathToLocalOutput;
    }

    #isFinished = false;
    public get isFinished(): boolean {
        return this.#isFinished;
    }

    #createdSnippets = false;
    public get createdSnippets(): boolean {
        return this.#createdSnippets;
    }

    #snippetsS3PreSignedReadUrl: string | undefined = undefined;
    public get snippetsS3PreSignedReadUrl(): string | undefined {
        return this.#snippetsS3PreSignedReadUrl;
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
        await downloadZipForTask({
            s3PreSignedReadUrl,
            absolutePathToLocalOutput
        });

        context.logger.info(chalk.green(`Downloaded to ${absolutePathToLocalOutput}`));
    } catch (e) {
        context.failAndThrow("Failed to download files", e);
    }
}

async function downloadZipForTask({
    s3PreSignedReadUrl,
    absolutePathToLocalOutput
}: {
    s3PreSignedReadUrl: string;
    absolutePathToLocalOutput: AbsoluteFilePath;
}): Promise<void> {
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
