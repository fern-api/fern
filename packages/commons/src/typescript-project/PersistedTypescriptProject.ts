import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { cp } from "fs/promises";
import urlJoin from "url-join";
import { PublishInfo } from "../NpmPackage";

export declare namespace PersistedTypescriptProject {
    export interface Init {
        directory: AbsoluteFilePath;
        srcDirectory: RelativeFilePath;
        distDirectory: RelativeFilePath;
        yarnBuildCommand: string[];
        yarnFormatCommand: string[];
    }
}

export class PersistedTypescriptProject {
    private directory: AbsoluteFilePath;
    private srcDirectory: RelativeFilePath;
    private distDirectory: RelativeFilePath;
    private yarnBuildCommand: string[];
    private yarnFormatCommand: string[];

    private hasInstalled = false;
    private hasFormatted = false;
    private hasBuilt = false;

    constructor({
        directory,
        srcDirectory,
        distDirectory,
        yarnBuildCommand,
        yarnFormatCommand,
    }: PersistedTypescriptProject.Init) {
        this.directory = directory;
        this.srcDirectory = srcDirectory;
        this.distDirectory = distDirectory;
        this.yarnBuildCommand = yarnBuildCommand;
        this.yarnFormatCommand = yarnFormatCommand;
    }

    public getSrcDirectory(): AbsoluteFilePath {
        return join(this.directory, this.srcDirectory);
    }

    public async installDependencies(logger: Logger): Promise<void> {
        if (this.hasInstalled) {
            return;
        }

        const yarn = createLoggingExecutable("yarn", {
            cwd: this.directory,
            logger,
        });

        await yarn(["install"], {
            env: {
                // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
                YARN_ENABLE_IMMUTABLE_INSTALLS: "false",
            },
        });

        this.hasInstalled = true;
    }

    public async format(logger: Logger): Promise<void> {
        if (this.hasFormatted) {
            return;
        }

        if (!this.hasInstalled) {
            await this.installDependencies(logger);
        }

        const yarn = createLoggingExecutable("yarn", {
            cwd: this.directory,
            logger,
        });
        await yarn(this.yarnFormatCommand);

        this.hasFormatted = true;
    }

    public async build(logger: Logger): Promise<void> {
        if (this.hasBuilt) {
            return;
        }

        if (!this.hasFormatted) {
            await this.format(logger);
        }

        const yarn = createLoggingExecutable("yarn", {
            cwd: this.directory,
            logger,
        });
        await yarn(this.yarnBuildCommand);

        this.hasBuilt = true;
    }

    public async copyProjectTo(target: AbsoluteFilePath): Promise<void> {
        await cp(this.directory, target, { recursive: true });
    }

    public async copyDistTo(target: AbsoluteFilePath, { logger }: { logger: Logger }): Promise<void> {
        if (!this.hasBuilt) {
            await this.build(logger);
        }
        await cp(join(this.directory, this.distDirectory), target, { recursive: true });
    }

    public async installVscodeSdks(logger: Logger): Promise<void> {
        if (!this.hasInstalled) {
            await this.installDependencies(logger);
        }

        const yarn = createLoggingExecutable("yarn", {
            cwd: this.directory,
            logger,
        });
        await yarn(["dlx", "@yarnpkg/sdks", "vscode"]);
    }

    public async publish({
        logger,
        publishInfo,
        dryRun,
    }: {
        logger: Logger;
        publishInfo: PublishInfo;
        dryRun: boolean;
    }): Promise<void> {
        if (!this.hasBuilt) {
            await this.build(logger);
        }

        const npm = createLoggingExecutable("npm", {
            cwd: this.directory,
            logger,
        });

        const parsedRegistryUrl = new URL(publishInfo.registryUrl);
        const registryUrlWithoutProtocol = urlJoin(parsedRegistryUrl.hostname, parsedRegistryUrl.pathname);

        // intentionally not writing these to the project config with `--location project`,
        // so the registry url and token aren't persisted
        await npm(["config", "set", "registry", publishInfo.registryUrl], {
            secrets: [publishInfo.registryUrl],
        });
        await npm(["config", "set", `//${registryUrlWithoutProtocol}:_authToken`, publishInfo.token], {
            secrets: [registryUrlWithoutProtocol, publishInfo.token],
        });

        const publishCommand = ["publish"];
        if (dryRun) {
            publishCommand.push("--dry-run");
        }
        await npm(publishCommand);
    }
}
