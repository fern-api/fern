import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { PublishInfo } from "@fern-api/typescript-base";
import decompress from "decompress";
import { cp, readdir, rm } from "fs/promises";
import tmp from "tmp-promise";
import urlJoin from "url-join";

export declare namespace PersistedTypescriptProject {
    export interface Init {
        directory: AbsoluteFilePath;
        srcDirectory: RelativeFilePath;
        distDirectory: RelativeFilePath;
        testDirectory: RelativeFilePath;
        buildCommand: string[];
        formatCommand: string[];
        checkFixCommand: string[];
        runScripts: boolean;
        packageManager: "pnpm" | "yarn";
    }
}

export class PersistedTypescriptProject {
    private directory: AbsoluteFilePath;
    private srcDirectory: RelativeFilePath;
    private distDirectory: RelativeFilePath;
    private packageManager: "pnpm" | "yarn";
    private testDirectory: RelativeFilePath;
    private buildCommand: string[];
    private formatCommand: string[];
    private checkFixCommand: string[];

    private runScripts;

    constructor({
        directory,
        srcDirectory,
        distDirectory,
        testDirectory,
        buildCommand,
        formatCommand,
        checkFixCommand,
        runScripts,
        packageManager
    }: PersistedTypescriptProject.Init) {
        this.directory = directory;
        this.srcDirectory = srcDirectory;
        this.distDirectory = distDirectory;
        this.testDirectory = testDirectory;
        this.buildCommand = buildCommand;
        this.formatCommand = formatCommand;
        this.checkFixCommand = checkFixCommand;
        this.runScripts = runScripts;
        this.packageManager = packageManager;
    }

    public getSrcDirectory(): AbsoluteFilePath {
        return join(this.directory, this.srcDirectory);
    }

    public getRootDirectory(): AbsoluteFilePath {
        return this.directory;
    }

    public getTestDirectory(): RelativeFilePath {
        return this.testDirectory;
    }

    public async generateLockfile(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger
        });

        await (this.packageManager === "yarn"
            ? pm(["install", "--mode=update-lockfile", "--ignore-scripts", "--prefer-offline"], {
                  env: {
                      // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
                      YARN_ENABLE_IMMUTABLE_INSTALLS: "false"
                  }
              })
            : pm(["install", "--lockfile-only", "--ignore-scripts", "--prefer-offline"], {
                  env: {
                      // allow modifying pnpm-lock.yaml, even when in CI
                      PNPM_FROZEN_LOCKFILE: "false"
                  }
              }));
    }

    public async installDependencies(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger
        });

        await (this.packageManager === "yarn"
            ? pm(["install", "--ignore-scripts", "--prefer-offline"], {
                  env: {
                      // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
                      YARN_ENABLE_IMMUTABLE_INSTALLS: "false"
                  }
              })
            : pm(["install", "--ignore-scripts", "--prefer-offline"], {
                  env: {
                      // allow modifying pnpm-lock.yaml, even when in CI
                      PNPM_FROZEN_LOCKFILE: "false"
                  }
              }));
    }

    public async format(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger
        });
        try {
            await pm(this.formatCommand);
        } catch (e) {
            logger.error(`Failed to format the generated project: ${e}`);
        }
    }

    public async checkFix(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger,
            reject: false
        });
        try {
            await pm(this.checkFixCommand);
        } catch (e) {
            logger.error(`Failed to format the generated project: ${e}`);
        }
    }

    public async build(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger
        });
        try {
            await pm(this.buildCommand);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const tsErrorCodePattern = /TS\d{4}/;
            const isTypeScriptError =
                tsErrorCodePattern.test(errorMessage) ||
                errorMessage.includes("error TS") ||
                errorMessage.includes("tsc") ||
                this.buildCommand.some((cmd) => cmd.includes("tsc"));

            if (isTypeScriptError) {
                const enhancedMessage = [
                    "TypeScript compilation failed.",
                    "",
                    "If you have a custom tsconfig.json in your project, the generated SDK may not be compatible with stricter compiler settings.",
                    "",
                    "To resolve this issue:",
                    "1. Check your tsconfig.json for strict settings (e.g., strict, strictNullChecks, noImplicitAny, exactOptionalPropertyTypes)",
                    "2. Consider adding skipLibCheck: true to your tsconfig.json",
                    "3. Use a separate tsconfig.json for the generated SDK directory",
                    "4. Or adjust your tsconfig.json to be less strict for the SDK directory",
                    "",
                    "Original error:",
                    errorMessage
                ].join("\n");

                const enhancedError = new Error(enhancedMessage);
                enhancedError.stack = error instanceof Error ? error.stack : undefined;
                throw enhancedError;
            }

            throw error;
        }
    }

    public async copyProjectTo({
        destinationPath,
        zipFilename,
        unzipOutput,
        logger
    }: {
        destinationPath: AbsoluteFilePath;
        zipFilename: string;
        unzipOutput?: boolean;
        logger: Logger;
    }): Promise<void> {
        await this.zipDirectoryContents(this.directory, { logger, destinationPath, zipFilename, unzipOutput });
    }

    public async npmPackTo({
        destinationPath,
        zipFilename,
        unzipOutput,
        logger
    }: {
        destinationPath: AbsoluteFilePath;
        zipFilename: string;
        unzipOutput?: boolean;
        logger: Logger;
    }): Promise<void> {
        const npm = createLoggingExecutable("npm", {
            cwd: this.directory,
            logger
        });

        // pack to tmp dir
        const directoryContainingPack = AbsoluteFilePath.of((await tmp.dir()).path);
        await npm(["pack", "--pack-destination", directoryContainingPack]);

        // decompress pack to a new tmp dir
        const directoryContainingPackItems = await readdir(directoryContainingPack);
        const packName = directoryContainingPackItems.find((item) => item.endsWith(".tgz"));
        if (packName == null) {
            throw new Error("Failed to find pack");
        }
        const pathToPack = join(directoryContainingPack, RelativeFilePath.of(packName));
        const directoryOfDecompressedPack = AbsoluteFilePath.of((await tmp.dir()).path);
        await decompress(pathToPack, directoryOfDecompressedPack, {
            strip: 1
        });

        // zip decompressed pack into destination
        await this.zipDirectoryContents(directoryOfDecompressedPack, {
            logger,
            destinationPath,
            zipFilename,
            unzipOutput
        });
    }

    public async copySrcTo({
        destinationPath,
        zipFilename,
        unzipOutput,
        logger
    }: {
        destinationPath: AbsoluteFilePath;
        zipFilename: string;
        unzipOutput?: boolean;
        logger: Logger;
    }): Promise<void> {
        await this.zipDirectoryContents(join(this.directory, this.srcDirectory), {
            logger,
            destinationPath,
            zipFilename,
            unzipOutput
        });
    }

    public async copyDistTo({
        destinationPath,
        zipFilename,
        unzipOutput,
        logger
    }: {
        destinationPath: AbsoluteFilePath;
        zipFilename: string;
        unzipOutput?: boolean;
        logger: Logger;
    }): Promise<void> {
        await this.zipDirectoryContents(join(this.directory, this.distDirectory), {
            logger,
            destinationPath,
            zipFilename,
            unzipOutput
        });
    }

    private async zipDirectoryContents(
        directoryToZip: AbsoluteFilePath,
        {
            destinationPath,
            zipFilename,
            logger,
            unzipOutput
        }: { destinationPath: AbsoluteFilePath; zipFilename: string; logger: Logger; unzipOutput?: boolean }
    ) {
        const zip = createLoggingExecutable("zip", {
            cwd: directoryToZip,
            logger,
            // zip is noisy
            doNotPipeOutput: true
        });
        const destinationZip = join(destinationPath, RelativeFilePath.of(zipFilename));

        const tmpZipLocation = join(AbsoluteFilePath.of((await tmp.dir()).path), RelativeFilePath.of("output.zip"));
        await zip(["-r", tmpZipLocation, ...(await readdir(directoryToZip))]);
        await cp(tmpZipLocation, destinationZip);

        if (unzipOutput) {
            // Unzip the file in the destination directory
            await decompress(destinationZip, destinationPath, {
                strip: 0
            });
            // Clean up (remove) the zip file after successful decompression
            await rm(destinationZip);
        }
    }

    public async publish({
        logger,
        publishInfo,
        dryRun,
        shouldTolerateRepublish
    }: {
        logger: Logger;
        publishInfo: PublishInfo;
        dryRun: boolean;
        shouldTolerateRepublish: boolean;
    }): Promise<void> {
        const npm = createLoggingExecutable("npm", {
            cwd: this.directory,
            logger
        });

        const parsedRegistryUrl = new URL(publishInfo.registryUrl);
        const registryUrlWithoutProtocol = urlJoin(parsedRegistryUrl.hostname, parsedRegistryUrl.pathname);

        await npm(["config", "set", `//${registryUrlWithoutProtocol}:_authToken`, publishInfo.token], {
            secrets: [registryUrlWithoutProtocol, publishInfo.token]
        });

        const publishCommand = ["publish", "--registry", publishInfo.registryUrl];
        if (dryRun) {
            publishCommand.push("--dry-run");
        }
        if (shouldTolerateRepublish) {
            publishCommand.push("--tolerate-republish");
        }
        await npm(publishCommand, {
            secrets: [publishInfo.registryUrl]
        });
    }

    public async deleteGitIgnoredFiles(logger: Logger): Promise<void> {
        const git = createLoggingExecutable("git", {
            cwd: this.directory,
            logger
        });
        await git(["init"]);
        await git(["add", "."]);
        await git([
            "-c",
            "user.name='fern'",
            "-c",
            "user.email='hey@buildwithfern.com'",
            "commit",
            "-m",
            '"Initial commit"'
        ]);
        await git(["clean", "-fdx"]);

        await rm(join(this.directory, RelativeFilePath.of(".git")), { recursive: true });
    }

    public async writeArbitraryFiles(run: (pathToProject: AbsoluteFilePath) => Promise<void>): Promise<void> {
        await run(this.directory);
    }
}
