import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { PublishInfo } from "@fern-api/typescript-base";
import { execFile } from "child_process";
import decompress from "decompress";
import { cp, readdir, rm } from "fs/promises";
import tmp from "tmp-promise";
import { promisify } from "util";

export declare namespace PersistedTypescriptProject {
    export interface Init {
        directory: AbsoluteFilePath;
        srcDirectory: RelativeFilePath;
        distDirectory: RelativeFilePath;
        testDirectory: RelativeFilePath;
        buildCommand: string[];
        formatCommand: string[];
        checkFixCommand: string[];
        /** Package specifiers needed for check:fix (e.g. ["@biomejs/biome@2.4.3"]) */
        checkFixPackages: string[];
        /** Binary names that must be on PATH for check:fix (e.g. ["biome"]) */
        checkFixToolBinaries: string[];
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
    private checkFixPackages: string[];
    private checkFixToolBinaries: string[];

    private runScripts;

    constructor({
        directory,
        srcDirectory,
        distDirectory,
        testDirectory,
        buildCommand,
        formatCommand,
        checkFixCommand,
        checkFixPackages,
        checkFixToolBinaries,
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
        this.checkFixPackages = checkFixPackages;
        this.checkFixToolBinaries = checkFixToolBinaries;
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

    public async fixPackageJson(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        const npm = createLoggingExecutable("npm", {
            cwd: this.directory,
            logger
        });

        try {
            logger.debug("Running npm pkg fix to normalize package.json");
            const startTime = Date.now();
            await npm(["pkg", "fix"]);
            logger.debug(`[TIMING] fixPackageJson took ${Date.now() - startTime}ms`);
        } catch (e) {
            logger.warn(`Failed to run npm pkg fix: ${e}`);
        }
    }

    public async generateLockfile(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger
        });

        const startTime = Date.now();
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
        logger.debug(`[TIMING] generateLockfile took ${Date.now() - startTime}ms`);
    }

    public async installDependencies(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger
        });

        const startTime = Date.now();
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
        logger.debug(`[TIMING] installDependencies took ${Date.now() - startTime}ms`);
    }

    /**
     * Returns true when every tool binary needed by check:fix is already
     * available on the system PATH (e.g. globally installed in Docker).
     * When true, callers can skip installing packages entirely.
     */
    public async areCheckFixToolsAvailable(logger: Logger): Promise<boolean> {
        if (this.checkFixToolBinaries.length === 0) {
            return true;
        }
        const execFileAsync = promisify(execFile);
        for (const binary of this.checkFixToolBinaries) {
            try {
                await execFileAsync("which", [binary]);
            } catch {
                logger.debug(`Tool '${binary}' not found on PATH, will install check:fix packages`);
                return false;
            }
        }
        logger.debug("All check:fix tools available on PATH, skipping install");
        return true;
    }

    /**
     * Installs only the packages required by checkFix (formatter / linter)
     * instead of the full dependency tree. This is significantly faster for
     * output modes that only need formatting/linting but not a full build.
     */
    public async installCheckFixDependencies(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }
        if (this.checkFixPackages.length === 0) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger
        });

        const startTime = Date.now();
        await (this.packageManager === "yarn"
            ? pm(["add", "--dev", "--ignore-scripts", "--prefer-offline", ...this.checkFixPackages], {
                  env: {
                      YARN_ENABLE_IMMUTABLE_INSTALLS: "false"
                  }
              })
            : pm(["add", "--save-dev", "--ignore-scripts", "--prefer-offline", ...this.checkFixPackages], {
                  env: {
                      PNPM_FROZEN_LOCKFILE: "false"
                  }
              }));
        logger.debug(`[TIMING] installCheckFixDependencies took ${Date.now() - startTime}ms`);
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
            const startTime = Date.now();
            await pm(this.formatCommand);
            logger.debug(`[TIMING] format took ${Date.now() - startTime}ms`);
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
            const startTime = Date.now();
            await pm(this.checkFixCommand);
            logger.debug(`[TIMING] checkFix took ${Date.now() - startTime}ms`);
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
        const startTime = Date.now();
        await pm(this.buildCommand);
        logger.debug(`[TIMING] build took ${Date.now() - startTime}ms`);
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

    public async copySrcContentsTo({
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
        const srcDirectoryPath = join(this.directory, this.srcDirectory);
        await this.zipDirectoryContents(srcDirectoryPath, {
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
        // Stage dist contents and root documentation files into a temp directory
        // so the output zip includes them alongside the compiled cjs/esm output.
        const stagingDir = AbsoluteFilePath.of((await tmp.dir()).path);
        const distDir = join(this.directory, this.distDirectory);
        const distItems = await readdir(distDir);
        for (const item of distItems) {
            await cp(join(distDir, RelativeFilePath.of(item)), join(stagingDir, RelativeFilePath.of(item)), {
                recursive: true
            });
        }

        const ROOT_FILES_TO_INCLUDE = ["README.md", "reference.md", "CONTRIBUTING.md"];
        for (const filename of ROOT_FILES_TO_INCLUDE) {
            const src = join(this.directory, RelativeFilePath.of(filename));
            try {
                await cp(src, join(stagingDir, RelativeFilePath.of(filename)));
            } catch (e) {
                // File may not exist (e.g. whitelabel skips CONTRIBUTING.md)
                logger.debug(`Skipping ${filename}: ${e}`);
            }
        }

        await this.zipDirectoryContents(stagingDir, {
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
        const registryUrlWithoutProtocol = `${parsedRegistryUrl.host}${parsedRegistryUrl.pathname}`;

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
        const startTime = Date.now();
        await npm(publishCommand, {
            secrets: [publishInfo.registryUrl]
        });
        logger.debug(`[TIMING] publish took ${Date.now() - startTime}ms`);
    }

    public async deleteGitIgnoredFiles(logger: Logger): Promise<void> {
        const git = createLoggingExecutable("git", {
            cwd: this.directory,
            logger
        });
        await git(["init"]);
        // Disable auto-gc so that no background pack processes run during
        // the subsequent add/commit/clean, which would race with the rm(.git) below.
        await git(["config", "gc.auto", "0"]);
        await git(["add", "."]);
        await git([
            "-c",
            "user.name=fern",
            "-c",
            "user.email=hey@buildwithfern.com",
            "-c",
            "commit.gpgsign=false",
            "commit",
            "--no-verify",
            "-m",
            "Initial commit"
        ]);
        await git(["clean", "-fdx"]);

        await rm(join(this.directory, RelativeFilePath.of(".git")), {
            recursive: true,
            force: true,
            maxRetries: 3,
            retryDelay: 100
        });
    }

    public async writeArbitraryFiles(run: (pathToProject: AbsoluteFilePath) => Promise<void>): Promise<void> {
        await run(this.directory);
    }
}
