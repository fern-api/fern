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

    private hasGeneratedLockfile = false;
    private hasFormatted = false;
    private hasBuilt = false;

    private runScripts;

    constructor({
        directory,
        srcDirectory,
        distDirectory,
        testDirectory,
        buildCommand,
        formatCommand,
        runScripts,
        packageManager
    }: PersistedTypescriptProject.Init) {
        this.directory = directory;
        this.srcDirectory = srcDirectory;
        this.distDirectory = distDirectory;
        this.testDirectory = testDirectory;
        this.buildCommand = buildCommand;
        this.formatCommand = formatCommand;
        this.runScripts = runScripts;
        this.packageManager = packageManager;
    }

    public getSrcDirectory(): AbsoluteFilePath {
        return join(this.directory, this.srcDirectory);
    }

    public getRootDirectory(): AbsoluteFilePath {
        return this.directory;
    }

    public async generateLockfile(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        if (this.hasGeneratedLockfile) {
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

        this.hasGeneratedLockfile = true;
    }

    public async format(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        if (this.hasFormatted) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger
        });
        await pm(this.formatCommand);

        this.hasFormatted = true;
    }

    public async build(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        if (this.hasBuilt) {
            return;
        }

        const pm = createLoggingExecutable(this.packageManager, {
            cwd: this.directory,
            logger
        });
        await pm(this.buildCommand);

        this.hasBuilt = true;
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
        await this.build(logger);

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
        await this.build(logger);
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
        await this.build(logger);

        const npm = createLoggingExecutable("npm", {
            cwd: this.directory,
            logger
        });

        const parsedRegistryUrl = new URL(publishInfo.registryUrl);
        const registryUrlWithoutProtocol = urlJoin(parsedRegistryUrl.hostname, parsedRegistryUrl.pathname);

        // intentionally not writing these to the project config with `--location project`,
        // so the registry url and token aren't persisted
        await npm(["config", "set", "registry", publishInfo.registryUrl], {
            secrets: [publishInfo.registryUrl]
        });
        await npm(["config", "set", `//${registryUrlWithoutProtocol}:_authToken`, publishInfo.token], {
            secrets: [registryUrlWithoutProtocol, publishInfo.token]
        });

        const publishCommand = ["publish"];
        if (dryRun) {
            publishCommand.push("--dry-run");
        }
        if (shouldTolerateRepublish) {
            publishCommand.push("--tolerate-republish");
        }
        await npm(publishCommand);
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
