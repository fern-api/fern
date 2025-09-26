import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createLoggingExecutable, LoggingExecutable } from "@fern-api/logging-execa";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

const GENERATOR_AGENT_NPM_PACKAGE = "@fern-api/generator-cli";

export class GeneratorAgentClient {
    private logger: Logger;
    private skipInstall: boolean;
    private cli: LoggingExecutable | undefined;
    private selfHosted: boolean;

    constructor({ logger, skipInstall, selfHosted }: { logger: Logger; skipInstall?: boolean; selfHosted?: boolean }) {
        this.logger = logger;
        this.skipInstall = skipInstall ?? false;
        this.selfHosted = selfHosted ?? false;
    }

    public async generateReadme<ReadmeConfig>({ readmeConfig }: { readmeConfig: ReadmeConfig }): Promise<string> {
        const readmeConfigFilepath = await this.writeConfig({
            config: readmeConfig
        });
        const args = ["generate", "readme", "--config", readmeConfigFilepath];
        const cli = await this.getOrInstall();
        const content = await cli(args);
        return content.stdout;
    }

    public async pushToGitHub<GitHubConfig>({
        githubConfig,
        withPullRequest
    }: {
        githubConfig: GitHubConfig;
        withPullRequest?: boolean;
    }): Promise<string> {
        const githubConfigFilepath = await this.writeConfig({
            config: githubConfig
        });
        const cmd = withPullRequest ? "pr" : "push";
        const args = ["github", cmd, "--config", githubConfigFilepath];
        const cli = await this.getOrInstall();

        const content = await cli(args);
        return content.stdout;
    }

    public async generateReference<ReferenceConfig>({
        referenceConfig
    }: {
        referenceConfig: ReferenceConfig;
    }): Promise<string> {
        const referenceConfigFilepath = await this.writeConfig({
            config: referenceConfig
        });
        const args = ["generate-reference", "--config", referenceConfigFilepath];
        const cli = await this.getOrInstall({ doNotPipeOutput: true });
        const content = await cli(args);
        return content.stdout;
    }

    public async writeConfig<T>({ config }: { config: T }): Promise<AbsoluteFilePath> {
        const file = await tmp.file();
        await writeFile(file.path, JSON.stringify(config));
        return AbsoluteFilePath.of(file.path);
    }

    private async getOrInstall(options: createLoggingExecutable.Options = {}): Promise<LoggingExecutable> {
        if (this.cli) {
            return this.cli;
        }
        if (this.skipInstall) {
            this.cli = createLoggingExecutable("generator-cli", {
                cwd: process.cwd(),
                logger: this.logger,
                ...options
            });
            return this.cli;
        }
        return this.install(options);
    }

    private async install(options: createLoggingExecutable.Options = {}): Promise<LoggingExecutable> {
        const npm = createLoggingExecutable("npm", {
            cwd: process.cwd(),
            logger: this.logger,
            ...options
        });
        this.logger.debug(`Installing ${GENERATOR_AGENT_NPM_PACKAGE} ...`);
        try {
            await npm(["install", "-f", "-g", GENERATOR_AGENT_NPM_PACKAGE]);
        } catch (error) {
            this.logger.debug(
                `Failed to install ${GENERATOR_AGENT_NPM_PACKAGE}, falling back to already installed version: ${error}`
            );
            // Continue execution as the package might already be installed
        }

        const cli = createLoggingExecutable("generator-cli", {
            cwd: process.cwd(),
            logger: this.logger,
            ...options
        });
        const version = await cli(["--version"]);
        this.logger.debug(`Successfully installed ${GENERATOR_AGENT_NPM_PACKAGE} version ${version.stdout}`);

        this.cli = cli;
        return cli;
    }
}
