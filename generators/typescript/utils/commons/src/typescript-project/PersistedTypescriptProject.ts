import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import decompress from "decompress";
import { cp, readdir, rm } from "fs/promises";
import tmp from "tmp-promise";
import urlJoin from "url-join";
import { PublishInfo } from "../NpmPackage";

export declare namespace PersistedTypescriptProject {
    export interface Init {
        directory: AbsoluteFilePath;
        srcDirectory: RelativeFilePath;
        distDirectory: RelativeFilePath;
        testDirectory: RelativeFilePath;
        buildCommand: string[];
        formatCommand: string[];
        runScripts: boolean;
    }
}

export class PersistedTypescriptProject {
    private directory: AbsoluteFilePath;
    private srcDirectory: RelativeFilePath;
    private distDirectory: RelativeFilePath;
    private testDirectory: RelativeFilePath;
    private buildCommand: string[];
    private formatCommand: string[];

    private hasInstalled = false;
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
        runScripts
    }: PersistedTypescriptProject.Init) {
        this.directory = directory;
        this.srcDirectory = srcDirectory;
        this.distDirectory = distDirectory;
        this.testDirectory = testDirectory;
        this.buildCommand = buildCommand;
        this.formatCommand = formatCommand;
        this.runScripts = runScripts;
    }

    public getSrcDirectory(): AbsoluteFilePath {
        return join(this.directory, this.srcDirectory);
    }

    public getRootDirectory(): AbsoluteFilePath {
        return this.directory;
    }

    public async installDependencies(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        if (this.hasInstalled) {
            return;
        }

        const yarn = createLoggingExecutable("yarn", {
            cwd: this.directory,
            logger
        });

        await yarn(["install"]);

        this.hasInstalled = true;
    }

    public async format(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        if (this.hasFormatted) {
            return;
        }

        await this.installDependencies(logger);

        const yarn = createLoggingExecutable("yarn", {
            cwd: this.directory,
            logger
        });
        await yarn(this.formatCommand);

        this.hasFormatted = true;
    }

    public async build(logger: Logger): Promise<void> {
        if (!this.runScripts) {
            return;
        }

        if (this.hasBuilt) {
            return;
        }

        await this.format(logger);

        const yarn = createLoggingExecutable("yarn", {
            cwd: this.directory,
            logger
        });
        await yarn(this.buildCommand);

        this.hasBuilt = true;
    }

    public async copyProjectAsZipTo({
        destinationZip,
        logger
    }: {
        destinationZip: AbsoluteFilePath;
        logger: Logger;
    }): Promise<void> {
        await this.zipDirectoryContents(this.directory, { logger, destinationZip });
    }

    public async npmPackAsZipTo({
        destinationZip,
        logger
    }: {
        destinationZip: AbsoluteFilePath;
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
        await this.zipDirectoryContents(directoryOfDecompressedPack, { logger, destinationZip });
    }

    public async copySrcAsZipTo({
        destinationZip,
        logger
    }: {
        destinationZip: AbsoluteFilePath;
        logger: Logger;
    }): Promise<void> {
        await this.format(logger);
        await this.zipDirectoryContents(join(this.directory, this.srcDirectory), { logger, destinationZip });
    }

    public async copyDistAsZipTo({
        destinationZip,
        logger
    }: {
        destinationZip: AbsoluteFilePath;
        logger: Logger;
    }): Promise<void> {
        await this.build(logger);
        await this.zipDirectoryContents(join(this.directory, this.distDirectory), { logger, destinationZip });
    }

    private async zipDirectoryContents(
        directoryToZip: AbsoluteFilePath,
        { destinationZip, logger }: { destinationZip: AbsoluteFilePath; logger: Logger }
    ) {
        const zip = createLoggingExecutable("zip", {
            cwd: directoryToZip,
            logger,
            // zip is noisy
            doNotPipeOutput: true
        });

        const tmpZipLocation = join(AbsoluteFilePath.of((await tmp.dir()).path), RelativeFilePath.of("output.zip"));
        await zip(["-r", tmpZipLocation, ...(await readdir(directoryToZip))]);
        await cp(tmpZipLocation, destinationZip);
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
