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

        let readmeConfigFilepath: AbsoluteFilePath;
        try {
            readmeConfigFilepath = await this.writeConfig({
                config: readmeConfig
            });
            this.logger.debug(`GeneratorAgentClient.generateReadme: Config written to ${readmeConfigFilepath}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(
                `GeneratorAgentClient.generateReadme: FAILED to write config to temp file: ${errorMessage}`
            );
            throw error;
        }

        const args = ["generate", "readme", "--config", readmeConfigFilepath];
        this.logger.debug(`GeneratorAgentClient.generateReadme: Running command: generator-cli ${args.join(" ")}`);

        let cli: LoggingExecutable;
        try {
            cli = await this.getOrInstall({ doNotPipeOutput: true });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(
                `GeneratorAgentClient.generateReadme: FAILED to get/install generator-cli: ${errorMessage}`
            );
            throw error;
        }

        // Verify CLI is accessible by checking version
        try {
            const versionResult = await cli(["--version"]);
            this.logger.debug(
                `GeneratorAgentClient.generateReadme: Using generator-cli version: ${versionResult.stdout.trim()}`
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(
                `GeneratorAgentClient.generateReadme: FAILED to get generator-cli version (CLI may not be installed): ${errorMessage}`
            );
            throw new Error(`generator-cli is not accessible: ${errorMessage}`);
        }

        try {
            const content = await cli(args);
            this.logger.debug(
                `GeneratorAgentClient.generateReadme: Command succeeded, stdout length: ${content.stdout.length}, stderr: ${content.stderr || "(empty)"}`
            );
            return content.stdout;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Try to extract more details from the error
            const execaError = error as { exitCode?: number; stderr?: string; stdout?: string; command?: string };
            const exitCode = execaError.exitCode ?? "unknown";
            const stderr = execaError.stderr ?? "(no stderr)";
            const stdout = execaError.stdout ?? "(no stdout)";
            this.logger.debug(
                `GeneratorAgentClient.generateReadme: Command FAILED with exit code ${exitCode}`
            );
            this.logger.debug(`GeneratorAgentClient.generateReadme: stderr: ${stderr}`);
            this.logger.debug(`GeneratorAgentClient.generateReadme: stdout: ${stdout}`);
            this.logger.debug(`GeneratorAgentClient.generateReadme: error message: ${errorMessage}`);
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

        let referenceConfigFilepath: AbsoluteFilePath;
        try {
            referenceConfigFilepath = await this.writeConfig({
                config: referenceConfig
            });
            this.logger.debug(`GeneratorAgentClient.generateReference: Config written to ${referenceConfigFilepath}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(
                `GeneratorAgentClient.generateReference: FAILED to write config to temp file: ${errorMessage}`
            );
            throw error;
        }

        const args = ["generate-reference", "--config", referenceConfigFilepath];
        this.logger.debug(`GeneratorAgentClient.generateReference: Running command: generator-cli ${args.join(" ")}`);

        let cli: LoggingExecutable;
        try {
            cli = await this.getOrInstall({ doNotPipeOutput: true });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(
                `GeneratorAgentClient.generateReference: FAILED to get/install generator-cli: ${errorMessage}`
            );
            throw error;
        }

        // Verify CLI is accessible by checking version
        try {
            const versionResult = await cli(["--version"]);
            this.logger.debug(
                `GeneratorAgentClient.generateReference: Using generator-cli version: ${versionResult.stdout.trim()}`
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(
                `GeneratorAgentClient.generateReference: FAILED to get generator-cli version (CLI may not be installed): ${errorMessage}`
            );
            throw new Error(`generator-cli is not accessible: ${errorMessage}`);
        }

        try {
            const content = await cli(args);
            this.logger.debug(
                `GeneratorAgentClient.generateReference: Command succeeded, stdout length: ${content.stdout.length}, stderr: ${content.stderr || "(empty)"}`
            );
            return content.stdout;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Try to extract more details from the error
            const execaError = error as { exitCode?: number; stderr?: string; stdout?: string; command?: string };
            const exitCode = execaError.exitCode ?? "unknown";
            const stderr = execaError.stderr ?? "(no stderr)";
            const stdout = execaError.stdout ?? "(no stdout)";
            this.logger.debug(
                `GeneratorAgentClient.generateReference: Command FAILED with exit code ${exitCode}`
            );
            this.logger.debug(`GeneratorAgentClient.generateReference: stderr: ${stderr}`);
            this.logger.debug(`GeneratorAgentClient.generateReference: stdout: ${stdout}`);
            this.logger.debug(`GeneratorAgentClient.generateReference: error message: ${errorMessage}`);
            throw error;
        }
    }

    public async writeConfig<T>({ config }: { config: T }): Promise<AbsoluteFilePath> {
        // Create temp file
        let file: tmp.FileResult;
        try {
            file = await tmp.file();
            this.logger.debug(`GeneratorAgentClient.writeConfig: Created temp file at ${file.path}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`GeneratorAgentClient.writeConfig: FAILED to create temp file: ${errorMessage}`);
            throw error;
        }

        // Serialize config to JSON
        let configJson: string;
        try {
            configJson = JSON.stringify(config);
            this.logger.debug(`GeneratorAgentClient.writeConfig: Serialized config to JSON (${configJson.length} bytes)`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`GeneratorAgentClient.writeConfig: FAILED to serialize config to JSON: ${errorMessage}`);
            throw error;
        }

        // Write to file
        try {
            await writeFile(file.path, configJson);
            this.logger.debug(`GeneratorAgentClient.writeConfig: Wrote config to ${file.path}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`GeneratorAgentClient.writeConfig: FAILED to write to file: ${errorMessage}`);
            throw error;
        }

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
