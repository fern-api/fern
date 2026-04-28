import { FERNIGNORE_FILENAME, generatorsYml, getFernIgnorePaths } from "@fern-api/configuration";
import { noop } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { CliError, InteractiveTaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import axios from "axios";
import chalk from "chalk";
import { createWriteStream } from "fs";
import { chmod, cp, mkdir, readdir, rm } from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import terminalLink from "terminal-link";
import tmp from "tmp-promise";
import yauzl from "yauzl";

import { extractPublishTarget, PublishTarget } from "./publishTarget.js";

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
        /**
         * URL of the pull request Fiddle opened against the SDK repo, when the output mode
         * creates PRs (`github` with `makePr: true` / `githubV2.pullRequest`). Undefined for
         * push / commit-and-release / non-GitHub modes.
         */
        pullRequestUrl: string | undefined;
        /**
         * True when Fiddle's diff analyzer determined the generated SDK is identical to the
         * current SDK repo contents. Undefined when the analyzer didn't run (e.g., local-
         * filesystem / download-files modes).
         */
        noChangesDetected: boolean | undefined;
        /**
         * Where the SDK was published, derived from `remoteTask.packages[0].coordinate`. Undefined
         * for GitHub-only output modes (PR / push / commit-and-release without a registry) and for
         * local-file-system downloads.
         */
        publishTarget: PublishTarget | undefined;
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
            this.context.failAndThrow("Task is missing on job status", undefined, {
                code: CliError.Code.InternalError
            });
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

        // Structured publish target for the automation step summary. Computed lazily — only the
        // first coordinate we see wins, so if Fiddle reports additional coordinates in later
        // polls (rare, but possible with multi-registry publishes) we keep the primary one.
        if (this.#publishTarget == null) {
            this.#publishTarget = extractPublishTarget(remoteTask.packages);
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

            // extract version from log messages as fallback (e.g., "Tagging release 0.0.9" or "Tagging release v0.2.0-rc.1")
            if (this.#actualVersion == null) {
                this.#actualVersion = extractVersionFromLogMessage(newLog.message) ?? this.#actualVersion;
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
                this.context.failAndThrow(message, undefined, { code: CliError.Code.ContainerError });
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
                this.#pullRequestUrl = finishedStatus.pullRequestUrl;
                this.#noChangesDetected = finishedStatus.noChangesDetected;
                // Prefer the dedicated actualVersion field from Fiddle over log-regex heuristics
                if (finishedStatus.actualVersion != null) {
                    this.#actualVersion = finishedStatus.actualVersion;
                }
            },
            _other: () => {
                this.context.logger.warn("Received unknown update type: " + remoteTask.status.type);
            }
        });

        return this.#isFinished
            ? {
                  createdSnippets: this.#createdSnippets,
                  snippetsS3PreSignedReadUrl: this.#snippetsS3PreSignedReadUrl,
                  actualVersion: this.#actualVersion,
                  pullRequestUrl: this.#pullRequestUrl,
                  noChangesDetected: this.#noChangesDetected,
                  publishTarget: this.#publishTarget
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

    #publishTarget: PublishTarget | undefined = undefined;
    public get publishTarget(): PublishTarget | undefined {
        return this.#publishTarget;
    }

    #pullRequestUrl: string | undefined = undefined;
    public get pullRequestUrl(): string | undefined {
        return this.#pullRequestUrl;
    }

    #noChangesDetected: boolean | undefined = undefined;
    public get noChangesDetected(): boolean | undefined {
        return this.#noChangesDetected;
    }
}

const VERSION_TAG_REGEX = /Tagging release (v?\d+\.\d+\.\d+(?:-[\w.-]+)?)/;

/**
 * Extracts a semver version from a log message matching "Tagging release X.Y.Z".
 * Handles optional v-prefix (Go generators) and pre-release suffixes.
 * Returns `undefined` when no version is found.
 */
export function extractVersionFromLogMessage(message: string): string | undefined {
    const match = message.match(VERSION_TAG_REGEX);
    if (match?.[1] == null) {
        return undefined;
    }
    return match[1].replace(/^v/, "");
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
        context.failAndThrow("Failed to download files", e, { code: CliError.Code.NetworkError });
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
    // Force remove the directory to handle read-only files (e.g., .git/objects)
    await forceRemoveDirectory(absolutePathToLocalOutput);
    await mkdir(absolutePathToLocalOutput, { recursive: true });
    await extractZipToDirectory(outputZipPath, absolutePathToLocalOutput);
}

async function forceRemoveDirectory(dirPath: AbsoluteFilePath): Promise<void> {
    if (!(await doesPathExist(dirPath))) {
        return;
    }
    await makeWritableRecursive(dirPath);
    await rm(dirPath, { recursive: true, force: true });
}

async function makeWritableRecursive(dirPath: AbsoluteFilePath): Promise<void> {
    try {
        const entries = await readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = AbsoluteFilePath.of(path.join(dirPath, entry.name));
            if (entry.isDirectory()) {
                await makeWritableRecursive(fullPath);
            }
            try {
                await chmod(fullPath, 0o755);
            } catch {
                // Ignore chmod errors - file might be deleted or inaccessible
            }
        }
        await chmod(dirPath, 0o755);
    } catch {
        // Ignore errors - directory might not exist or be inaccessible
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

    // Initialize a throwaway git repo in the temp directory. This is only used to
    // leverage git's file-tracking for resolving .fernignore paths. We inline the
    // user config, disable commit signing, and skip hooks to avoid prompts (e.g.
    // Touch ID on macOS) and unnecessary overhead.
    await runGitCommand(["init"], tmpOutputResolutionDir, context);
    await runGitCommand(["add", "."], tmpOutputResolutionDir, context);
    await runGitCommand(
        [
            "-c",
            "user.name=fern",
            "-c",
            "user.email=hey@buildwithfern.com",
            "-c",
            "commit.gpgsign=false",
            "commit",
            "--allow-empty",
            "--no-verify",
            "-m",
            "init"
        ],
        tmpOutputResolutionDir,
        context
    );

    await runGitCommand(["rm", "-rf", "."], tmpOutputResolutionDir, context);

    await downloadAndExtractZipToDirectory({ s3PreSignedReadUrl, outputPath: tmpOutputResolutionDir });

    await runGitCommand(["add", "."], tmpOutputResolutionDir, context);

    await runGitCommand(["reset", "--", ...fernIgnorePaths], tmpOutputResolutionDir, context);

    await runGitCommand(["restore", "."], tmpOutputResolutionDir, context);

    await forceRemoveDirectory(join(tmpOutputResolutionDir, RelativeFilePath.of(".git")));

    await forceRemoveDirectory(absolutePathToLocalOutput);
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

    await extractZipToDirectory(outputZipPath, outputPath);
}

export async function extractZipToDirectory(zipPath: string, outputDir: AbsoluteFilePath): Promise<void> {
    return new Promise((resolve, reject) => {
        yauzl.open(zipPath, { lazyEntries: true }, (err, zipFile) => {
            if (err || !zipFile) {
                reject(err ?? new Error("Failed to open zip file"));
                return;
            }

            zipFile.on("error", reject);
            zipFile.on("end", resolve);

            zipFile.on("entry", (entry: yauzl.Entry) => {
                const outputPath = path.join(outputDir, entry.fileName);

                if (entry.fileName.endsWith("/")) {
                    mkdir(outputPath, { recursive: true })
                        .then(() => zipFile.readEntry())
                        .catch(reject);
                    return;
                }

                mkdir(path.dirname(outputPath), { recursive: true })
                    .then(() => {
                        zipFile.openReadStream(entry, (streamErr, readStream) => {
                            if (streamErr || !readStream) {
                                reject(streamErr ?? new Error("Failed to open read stream"));
                                return;
                            }
                            readStream
                                .pipe(createWriteStream(outputPath))
                                .on("finish", () => zipFile.readEntry())
                                .on("error", reject);
                        });
                    })
                    .catch(reject);
            });

            zipFile.readEntry();
        });
    });
}
