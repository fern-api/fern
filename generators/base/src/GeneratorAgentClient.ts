import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createLoggingExecutable, LoggingExecutable } from "@fern-api/logging-execa";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

const GENERATOR_AGENT_NPM_PACKAGE = "@fern-api/generator-cli";

export class GeneratorAgentClient {
    private logger: Logger;
    private skipInstall: boolean;
    private installAttempted: boolean;
    private selfHosted: boolean;

    constructor({ logger, skipInstall, selfHosted }: { logger: Logger; skipInstall?: boolean; selfHosted?: boolean }) {
        this.logger = logger;
        this.skipInstall = skipInstall ?? false;
        this.installAttempted = false;
        this.selfHosted = selfHosted ?? false;
    }

    public async generateReadme<ReadmeConfig>({ readmeConfig }: { readmeConfig: ReadmeConfig }): Promise<string> {
        this.logger.debug("GeneratorAgentClient.generateReadme: Writing config to temp file...");
        const readmeConfigFilepath = await this.writeConfig({
            config: readmeConfig
        });
        this.logger.debug(`GeneratorAgentClient.generateReadme: Config written to ${readmeConfigFilepath}`);
        
        const args = ["generate", "readme", "--config", readmeConfigFilepath];
        this.logger.debug(`GeneratorAgentClient.generateReadme: Running command: generator-cli ${args.join(" ")}`);
        
        const cli = await this.getOrInstall({ doNotPipeOutput: true });
        try {
            const content = await cli(args);
            this.logger.debug(`GeneratorAgentClient.generateReadme: Command succeeded, stdout length: ${content.stdout.length}, stderr: ${content.stderr || "(empty)"}`);
            return content.stdout;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`GeneratorAgentClient.generateReadme: Command failed: ${errorMessage}`);
            throw error;
        }
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
        this.logger.debug("GeneratorAgentClient.generateReference: Writing config to temp file...");
        const referenceConfigFilepath = await this.writeConfig({
            config: referenceConfig
        });
        this.logger.debug(`GeneratorAgentClient.generateReference: Config written to ${referenceConfigFilepath}`);
        
        const args = ["generate-reference", "--config", referenceConfigFilepath];
        this.logger.debug(`GeneratorAgentClient.generateReference: Running command: generator-cli ${args.join(" ")}`);
        
        const cli = await this.getOrInstall({ doNotPipeOutput: true });
        try {
            const content = await cli(args);
            this.logger.debug(`GeneratorAgentClient.generateReference: Command succeeded, stdout length: ${content.stdout.length}, stderr: ${content.stderr || "(empty)"}`);
            return content.stdout;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`GeneratorAgentClient.generateReference: Command failed: ${errorMessage}`);
            throw error;
        }
    }

    public async writeConfig<T>({ config }: { config: T }): Promise<AbsoluteFilePath> {
        const file = await tmp.file();
        await writeFile(file.path, JSON.stringify(config));
        return AbsoluteFilePath.of(file.path);
    }

    private async getOrInstall(options: createLoggingExecutable.Options = {}): Promise<LoggingExecutable> {
        if (this.skipInstall) {
            this.logger.debug("GeneratorAgentClient.getOrInstall: skipInstall=true, using pre-installed generator-cli");
            return createLoggingExecutable("generator-cli", {
                cwd: process.cwd(),
                logger: this.logger,
                ...options
            });
        }
        this.logger.debug("GeneratorAgentClient.getOrInstall: skipInstall=false, running install...");
        return this.install(options);
    }

    private async install(options: createLoggingExecutable.Options = {}): Promise<LoggingExecutable> {
        const cli = createLoggingExecutable("generator-cli", {
            cwd: process.cwd(),
            logger: this.logger,
            ...options
        });

        // Only attempt npm install and version check once per instance
        if (!this.installAttempted) {
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

            const version = await cli(["--version"]);
            this.logger.debug(`Successfully installed ${GENERATOR_AGENT_NPM_PACKAGE} version ${version.stdout}`);
            this.installAttempted = true;
        }

        return cli;
    }
}
