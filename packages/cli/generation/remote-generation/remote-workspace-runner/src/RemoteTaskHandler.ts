import { FERNIGNORE_FILENAME, generatorsYml, getFernIgnorePaths } from "@fern-api/configuration";
import { noop } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { InteractiveTaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import axios from "axios";
import chalk from "chalk";
import decompress from "decompress";
import { createWriteStream } from "fs";
import { cp, mkdir, rm } from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import terminalLink from "terminal-link";
import tmp from "tmp-promise";

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
        actualVersion: string | undefined;
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
                nuget: (nugetPackage) => `${nugetPackage.name} ${nugetPackage.version}`,
                crates: (cratesPackage) => `${cratesPackage.name} ${cratesPackage.version}`,
                _other: () => "<unknown package>"
            });
        });

        // extract actual version from the first package for dynamic IR upload
        if (remoteTask.packages.length > 0 && this.#actualVersion == null) {
            this.#actualVersion = remoteTask.packages[0]?.coordinate._visit({
                npm: (npmPackage) => npmPackage.version,
                maven: (mavenPackage) => mavenPackage.version,
                pypi: (pypiPackage) => pypiPackage.version,
                ruby: (rubyGem) => rubyGem.version,
                nuget: (nugetPackage) => nugetPackage.version,
                crates: (cratesPackage) => cratesPackage.version,
                _other: () => undefined
            });
        }

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

            // extract version from log messages as fallback (e.g., "Tagging release 0.0.9")
            if (this.#actualVersion == null) {
                const tagMatch = newLog.message.match(/Tagging release (\d+\.\d+\.\d+)/);
                if (tagMatch) {
                    this.#actualVersion = tagMatch[1];
                }
            }
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
                  snippetsS3PreSignedReadUrl: this.#snippetsS3PreSignedReadUrl,
                  actualVersion: this.#actualVersion
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

    #actualVersion: string | undefined = undefined;
    public get actualVersion(): string | undefined {
        return this.#actualVersion;
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
        const isFernIgnorePresent = await checkFernIgnorePresent(absolutePathToLocalOutput);
        const isExistingGitRepo = await checkIsGitRepository(absolutePathToLocalOutput);

        if (isFernIgnorePresent && isExistingGitRepo) {
            await downloadFilesWithFernIgnoreInExistingRepo({
                s3PreSignedReadUrl,
                absolutePathToLocalOutput,
                context
            });
        } else if (isFernIgnorePresent && !isExistingGitRepo) {
            await downloadFilesWithFernIgnoreInTempRepo({
                s3PreSignedReadUrl,
                absolutePathToLocalOutput,
                context
            });
        } else {
            await downloadZipForTask({
                s3PreSignedReadUrl,
                absolutePathToLocalOutput
            });
        }

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

async function checkFernIgnorePresent(absolutePathToLocalOutput: AbsoluteFilePath): Promise<boolean> {
    const absolutePathToFernignore = join(absolutePathToLocalOutput, RelativeFilePath.of(FERNIGNORE_FILENAME));
    return await doesPathExist(absolutePathToFernignore);
}

async function checkIsGitRepository(absolutePathToLocalOutput: AbsoluteFilePath): Promise<boolean> {
    const absolutePathToGitDir = join(absolutePathToLocalOutput, RelativeFilePath.of(".git"));
    return await doesPathExist(absolutePathToGitDir);
}

async function runGitCommand(
    options: string[],
    cwd: AbsoluteFilePath,
    context: InteractiveTaskContext
): Promise<string> {
    const response = await loggingExeca(context.logger, "git", options, {
        cwd,
        doNotPipeOutput: true
    });
    return response.stdout;
}

async function downloadFilesWithFernIgnoreInExistingRepo({
    s3PreSignedReadUrl,
    absolutePathToLocalOutput,
    context
}: {
    s3PreSignedReadUrl: string;
    absolutePathToLocalOutput: AbsoluteFilePath;
    context: InteractiveTaskContext;
}): Promise<void> {
    const absolutePathToFernignore = join(absolutePathToLocalOutput, RelativeFilePath.of(FERNIGNORE_FILENAME));
    const fernIgnorePaths = await getFernIgnorePaths({ absolutePathToFernignore });

    const gitConfigResponse = await runGitCommand(["config", "--list"], absolutePathToLocalOutput, context);
    if (!gitConfigResponse.includes("user.name")) {
        await runGitCommand(["config", "user.name", "fern-api"], absolutePathToLocalOutput, context);
        await runGitCommand(["config", "user.email", "info@buildwithfern.com"], absolutePathToLocalOutput, context);
    }

    await runGitCommand(["rm", "-rf", "."], absolutePathToLocalOutput, context);

    await downloadAndExtractZipToDirectory({ s3PreSignedReadUrl, outputPath: absolutePathToLocalOutput });

    await runGitCommand(["add", "."], absolutePathToLocalOutput, context);

    await runGitCommand(["reset", "--", ...fernIgnorePaths], absolutePathToLocalOutput, context);
    await runGitCommand(["restore", "."], absolutePathToLocalOutput, context);
}

async function downloadFilesWithFernIgnoreInTempRepo({
    s3PreSignedReadUrl,
    absolutePathToLocalOutput,
    context
}: {
    s3PreSignedReadUrl: string;
    absolutePathToLocalOutput: AbsoluteFilePath;
    context: InteractiveTaskContext;
}): Promise<void> {
    const tmpOutputResolutionDir = AbsoluteFilePath.of((await tmp.dir({})).path);

    const absolutePathToFernignore = join(absolutePathToLocalOutput, RelativeFilePath.of(FERNIGNORE_FILENAME));
    const fernIgnorePaths = await getFernIgnorePaths({ absolutePathToFernignore });

    await cp(absolutePathToLocalOutput, tmpOutputResolutionDir, { recursive: true });

    await runGitCommand(["init"], tmpOutputResolutionDir, context);
    await runGitCommand(["add", "."], tmpOutputResolutionDir, context);

    const gitConfigResponse = await runGitCommand(["config", "--list"], tmpOutputResolutionDir, context);
    if (!gitConfigResponse.includes("user.name")) {
        await runGitCommand(["config", "user.name", "fern-api"], tmpOutputResolutionDir, context);
        await runGitCommand(["config", "user.email", "info@buildwithfern.com"], tmpOutputResolutionDir, context);
    }
    await runGitCommand(["commit", "--allow-empty", "-m", '"init"'], tmpOutputResolutionDir, context);

    await runGitCommand(["rm", "-rf", "."], tmpOutputResolutionDir, context);

    await downloadAndExtractZipToDirectory({ s3PreSignedReadUrl, outputPath: tmpOutputResolutionDir });

    await runGitCommand(["add", "."], tmpOutputResolutionDir, context);

    await runGitCommand(["reset", "--", ...fernIgnorePaths], tmpOutputResolutionDir, context);

    await runGitCommand(["restore", "."], tmpOutputResolutionDir, context);

    await rm(join(tmpOutputResolutionDir, RelativeFilePath.of(".git")), { recursive: true });

    await rm(absolutePathToLocalOutput, { recursive: true });
    await cp(tmpOutputResolutionDir, absolutePathToLocalOutput, { recursive: true });
}

async function downloadAndExtractZipToDirectory({
    s3PreSignedReadUrl,
    outputPath
}: {
    s3PreSignedReadUrl: string;
    outputPath: AbsoluteFilePath;
}): Promise<void> {
    const request = await axios.get(s3PreSignedReadUrl, {
        responseType: "stream"
    });

    const tmpDir = await tmp.dir({ prefix: "fern", unsafeCleanup: true });
    const outputZipPath = path.join(tmpDir.path, "output.zip");
    await pipeline(request.data, createWriteStream(outputZipPath));

    await decompress(outputZipPath, outputPath);
}
