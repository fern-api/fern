import { AbstractGeneratorContext, FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { Logger } from "@fern-api/logger";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import { GeneratorAgentClient } from "./GeneratorAgentClient";
import { ReferenceConfigBuilder } from "./reference";
import { RawGithubConfig, resolveGitHubConfig } from "./utils";

const FEATURES_CONFIG_PATHS = [
    "/assets/features.yml",
    path.join(__dirname, "./features.yml"),
    path.join(__dirname, "./assets/features.yml"),
    path.join(__dirname, "../features.yml"),
    path.join(__dirname, "../assets/features.yml"),
    path.join(__dirname, "../../features.yml"),
    path.join(__dirname, "../../assets/features.yml")
];

export declare namespace AbstractGeneratorAgent {
    interface ReadmeConfigArgs<GeneratorContext extends AbstractGeneratorContext> {
        context: GeneratorContext;
        remote: FernGeneratorCli.Remote | undefined;
        featureConfig: FernGeneratorCli.FeatureConfig;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }

    interface GitHubConfigArgs<GeneratorContext extends AbstractGeneratorContext> {
        context: GeneratorContext;
    }
}

export abstract class AbstractGeneratorAgent<GeneratorContext extends AbstractGeneratorContext> {
    public README_FILENAME = "README.md";
    public SNIPPET_FILENAME = "snippet.json";
    public REFERENCE_FILENAME = "reference.md";

    private logger: Logger;
    private config: FernGeneratorExec.GeneratorConfig;
    private cli: GeneratorAgentClient;
    public constructor({
        logger,
        config,
        selfHosted = false,
        skipInstall = false
    }: {
        logger: Logger;
        config: FernGeneratorExec.GeneratorConfig;
        selfHosted?: boolean;
        skipInstall?: boolean;
    }) {
        this.logger = logger;
        this.config = config;
        this.cli = new GeneratorAgentClient({
            logger,
            selfHosted,
            skipInstall
        });
    }

    /**
     * Generates the README.md content using the given generator context.
     */
    public async generateReadme({
        context,
        endpointSnippets
    }: {
        context: GeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }): Promise<string> {
        this.logger.debug("AbstractGeneratorAgent.generateReadme: Starting README generation...");
        this.logger.debug(
            `AbstractGeneratorAgent.generateReadme: Received ${endpointSnippets.length} endpoint snippets`
        );

        // Get remote config
        this.logger.debug("AbstractGeneratorAgent.generateReadme: Getting remote config...");
        let remote: FernGeneratorCli.Remote | undefined;
        try {
            remote = this.getRemote(context);
            this.logger.debug(
                `AbstractGeneratorAgent.generateReadme: Remote config: ${remote ? JSON.stringify(remote) : "(none)"}`
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`AbstractGeneratorAgent.generateReadme: FAILED to get remote config: ${errorMessage}`);
            throw error;
        }

        // Load feature config
        this.logger.debug("AbstractGeneratorAgent.generateReadme: Loading feature config...");
        let featureConfig: FernGeneratorCli.FeatureConfig;
        try {
            featureConfig = await this.readFeatureConfig();
            this.logger.debug(
                `AbstractGeneratorAgent.generateReadme: Feature config loaded with ${featureConfig.features?.length ?? 0} features`
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`AbstractGeneratorAgent.generateReadme: FAILED to load feature config: ${errorMessage}`);
            throw error;
        }

        // Build README config
        this.logger.debug("AbstractGeneratorAgent.generateReadme: Building README config from getReadmeConfig()...");
        let readmeConfig: FernGeneratorCli.ReadmeConfig;
        try {
            readmeConfig = this.getReadmeConfig({
                context,
                remote,
                featureConfig,
                endpointSnippets
            });
            // Log key fields of the config to help debug
            this.logger.debug(
                `AbstractGeneratorAgent.generateReadme: README config built - ` +
                    `organization: ${readmeConfig.organization ?? "(none)"}, ` +
                    `language: ${readmeConfig.language?.type ?? "(none)"}, ` +
                    `features: ${readmeConfig.features?.length ?? 0}, ` +
                    `apiReferenceLink: ${readmeConfig.apiReferenceLink ?? "(none)"}`
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.debug(
                `AbstractGeneratorAgent.generateReadme: FAILED to build README config: ${errorMessage}`
            );
            if (errorStack) {
                this.logger.debug(`AbstractGeneratorAgent.generateReadme: Stack trace: ${errorStack}`);
            }
            throw error;
        }

        // Call CLI
        this.logger.debug("AbstractGeneratorAgent.generateReadme: Calling CLI to generate README...");
        try {
            const result = await this.cli.generateReadme({ readmeConfig });
            this.logger.debug(`AbstractGeneratorAgent.generateReadme: CLI returned ${result.length} bytes`);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`AbstractGeneratorAgent.generateReadme: CLI FAILED with error: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * Runs the GitHub action using the given generator context.
     */
    public async pushToGitHub({ context }: { context: GeneratorContext }): Promise<string> {
        const rawGithubConfig = this.getGitHubConfig({ context });
        const githubConfig = resolveGitHubConfig({ rawGithubConfig, logger: this.logger });
        return this.cli.pushToGitHub({ githubConfig, withPullRequest: githubConfig.mode === "pull-request" });
    }

    protected resolveGitHubConfig({ context }: { context: GeneratorContext }) {
        const rawGithubConfig = this.getGitHubConfig({ context });
        return resolveGitHubConfig({ rawGithubConfig, logger: this.logger });
    }

    /**
     * Generates the reference.md content using the given builder.
     */
    public async generateReference(builder: ReferenceConfigBuilder): Promise<string> {
        this.logger.debug("AbstractGeneratorAgent.generateReference: Starting reference generation...");

        // Get language
        let language: FernGeneratorCli.Language;
        try {
            language = this.getLanguage();
            this.logger.debug(`AbstractGeneratorAgent.generateReference: Language: ${language}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`AbstractGeneratorAgent.generateReference: FAILED to get language: ${errorMessage}`);
            throw error;
        }

        // Build reference config
        this.logger.debug("AbstractGeneratorAgent.generateReference: Building reference config...");
        let referenceConfig: ReturnType<ReferenceConfigBuilder["build"]>;
        try {
            referenceConfig = builder.build(language);
            // Log key fields of the config
            const sectionCount = referenceConfig.sections?.length ?? 0;
            const hasRootSection = referenceConfig.rootSection != null;
            const rootEndpointCount = referenceConfig.rootSection?.endpoints?.length ?? 0;
            this.logger.debug(
                `AbstractGeneratorAgent.generateReference: Reference config built - ` +
                    `sections: ${sectionCount}, ` +
                    `hasRootSection: ${hasRootSection}, ` +
                    `rootEndpoints: ${rootEndpointCount}, ` +
                    `language: ${referenceConfig.language ?? "(none)"}`
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.debug(
                `AbstractGeneratorAgent.generateReference: FAILED to build reference config: ${errorMessage}`
            );
            if (errorStack) {
                this.logger.debug(`AbstractGeneratorAgent.generateReference: Stack trace: ${errorStack}`);
            }
            throw error;
        }

        // Call CLI
        this.logger.debug("AbstractGeneratorAgent.generateReference: Calling CLI to generate reference...");
        try {
            const result = await this.cli.generateReference({ referenceConfig });
            this.logger.debug(`AbstractGeneratorAgent.generateReference: CLI returned ${result.length} bytes`);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`AbstractGeneratorAgent.generateReference: CLI FAILED with error: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * Gets the language of the generator.
     */
    protected abstract getLanguage(): FernGeneratorCli.Language;

    /**
     * Gets the README.md configuration.
     */
    protected abstract getReadmeConfig(
        args: AbstractGeneratorAgent.ReadmeConfigArgs<GeneratorContext>
    ): FernGeneratorCli.ReadmeConfig;

    /**
     * Gets the GitHub configuration.
     */
    protected abstract getGitHubConfig(
        args: AbstractGeneratorAgent.GitHubConfigArgs<GeneratorContext>
    ): RawGithubConfig;

    protected async readFeatureConfig(): Promise<FernGeneratorCli.FeatureConfig> {
        this.logger.debug("AbstractGeneratorAgent.readFeatureConfig: Reading feature configuration...");
        try {
            const rawYaml = await this.getFeaturesConfig();
            this.logger.debug(`AbstractGeneratorAgent.readFeatureConfig: Raw YAML length: ${rawYaml.length} bytes`);
            const loaded = yaml.load(rawYaml) as FernGeneratorCli.FeatureConfig;
            this.logger.debug(
                `AbstractGeneratorAgent.readFeatureConfig: Loaded ${loaded.features?.length ?? 0} features`
            );
            return loaded;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(
                `AbstractGeneratorAgent.readFeatureConfig: Failed to read feature config: ${errorMessage}`
            );
            throw error;
        }
    }

    protected getRemote(context: GeneratorContext): FernGeneratorCli.Remote | undefined {
        const outputMode = this.config.output.mode.type === "github" ? this.config.output.mode : undefined;
        if (outputMode?.repoUrl != null && outputMode?.installationToken != null) {
            return FernGeneratorCli.Remote.github({
                repoUrl: outputMode.repoUrl,
                installationToken: outputMode.installationToken
            });
        }

        try {
            const githubConfig = this.getGitHubConfig({ context });
            if (githubConfig.uri != null && githubConfig.token != null) {
                return FernGeneratorCli.Remote.github({
                    repoUrl: this.normalizeRepoUrl(githubConfig.uri),
                    installationToken: githubConfig.token
                });
            }
        } catch (error) {
            return undefined;
        }
        return undefined;
    }

    private normalizeRepoUrl(repoUrl: string): string {
        // If it's already a full URL, return as-is
        if (repoUrl.startsWith("https://")) {
            return repoUrl;
        }

        // If it's in owner/repo format, convert to full GitHub URL
        if (repoUrl.match(/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/)) {
            return `https://github.com/${repoUrl}`;
        }

        // Default: assume it's a GitHub URL and add prefix
        return `https://github.com/${repoUrl}`;
    }

    private async getFeaturesConfig(): Promise<string> {
        // try to find the features.yml file using the well-known paths
        this.logger.debug(
            `AbstractGeneratorAgent.getFeaturesConfig: Searching for features.yml in ${FEATURES_CONFIG_PATHS.length} paths...`
        );
        for (const each of FEATURES_CONFIG_PATHS) {
            try {
                this.logger.debug(`AbstractGeneratorAgent.getFeaturesConfig: Trying path: ${each}`);
                const rawContents = await readFile(each, "utf8");
                if (rawContents.length !== 0) {
                    this.logger.debug(
                        `AbstractGeneratorAgent.getFeaturesConfig: Found features.yml at ${each} (${rawContents.length} bytes)`
                    );
                    return rawContents;
                }
                this.logger.debug(`AbstractGeneratorAgent.getFeaturesConfig: File at ${each} is empty, skipping`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.debug(
                    `AbstractGeneratorAgent.getFeaturesConfig: Path ${each} not accessible: ${errorMessage}`
                );
            }
        }
        // throw an error if we can't find the features.yml file
        this.logger.debug("AbstractGeneratorAgent.getFeaturesConfig: No features.yml found in any path");
        throw new Error("Internal error; failed to read feature configuration");
    }
}
