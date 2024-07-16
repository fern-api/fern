import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createLoggingExecutable, LoggingExecutable } from "@fern-api/logging-execa";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

const GENERATOR_CLI_NPM_PACKAGE = "@fern-api/generator-cli";

export class GeneratorCli {
    private logger: Logger;
    private skipInstall: boolean;
    private generatorCli: LoggingExecutable | undefined;

    constructor({ logger, skipInstall }: { logger: Logger; skipInstall?: boolean }) {
        this.logger = logger;
        this.skipInstall = skipInstall ?? false;
    }

    public async generateReference({
        referenceConfig
    }: {
        referenceConfig: FernGeneratorCli.ReferenceConfig;
    }): Promise<string> {
        const referenceConfigFilepath = await this.writeReferenceConfig({
            referenceConfig
        });
        const args = ["generate-reference", "--config", referenceConfigFilepath];
        const generatorCli = await this.getOrInstall();
        const content = await generatorCli(args);
        return content.stdout;
    }

    private async writeReferenceConfig({
        referenceConfig
    }: {
        referenceConfig: FernGeneratorCli.ReferenceConfig;
    }): Promise<AbsoluteFilePath> {
        const referenceConfigFile = await tmp.file();
        await writeFile(referenceConfigFile.path, JSON.stringify(referenceConfig));
        return AbsoluteFilePath.of(referenceConfigFile.path);
    }

    public async generateReadme({ readmeConfig }: { readmeConfig: FernGeneratorCli.ReadmeConfig }): Promise<string> {
        const readmeConfigFilepath = await this.writeReadmeConfig({
            readmeConfig
        });
        const args = ["generate", "readme", "--config", readmeConfigFilepath];
        const generatorCli = await this.getOrInstall();
        const content = await generatorCli(args);
        return content.stdout;
    }

    private async writeReadmeConfig({
        readmeConfig
    }: {
        readmeConfig: FernGeneratorCli.ReadmeConfig;
    }): Promise<AbsoluteFilePath> {
        const readmeConfigFile = await tmp.file();
        await writeFile(readmeConfigFile.path, JSON.stringify(readmeConfig));
        return AbsoluteFilePath.of(readmeConfigFile.path);
    }

    private async getOrInstall(): Promise<LoggingExecutable> {
        if (this.generatorCli) {
            return this.generatorCli;
        }
        if (this.skipInstall) {
            this.generatorCli = createLoggingExecutable("generator-cli", {
                cwd: process.cwd(),
                logger: this.logger
            });
            return this.generatorCli;
        }
        return this.install();
    }

    private async install(): Promise<LoggingExecutable> {
        const npm = createLoggingExecutable("npm", {
            cwd: process.cwd(),
            logger: this.logger
        });
        this.logger.debug(`Installing ${GENERATOR_CLI_NPM_PACKAGE} ...`);
        await npm(["install", "-f", "-g", GENERATOR_CLI_NPM_PACKAGE]);

        const generatorCli = createLoggingExecutable("generator-cli", {
            cwd: process.cwd(),
            logger: this.logger
        });
        const version = await generatorCli(["--version"]);
        this.logger.debug(`Successfully installed ${GENERATOR_CLI_NPM_PACKAGE} version ${version.stdout}`);

        this.generatorCli = generatorCli;
        return generatorCli;
    }
}
