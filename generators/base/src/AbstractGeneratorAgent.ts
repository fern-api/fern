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
        const readmeConfig = this.getReadmeConfig({
            context,
            remote: this.getRemote(),
            featureConfig: await this.readFeatureConfig(),
            endpointSnippets
        });
        return this.cli.generateReadme({ readmeConfig });
    }

    /**
     * Runs the GitHub action using the given generator context.
     */
    public async pushToGitHub({ context }: { context: GeneratorContext }): Promise<string> {
        const rawGithubConfig = this.getGitHubConfig({ context });
        const githubConfig = resolveGitHubConfig({ rawGithubConfig, logger: this.logger });
        return this.cli.pushToGitHub({ githubConfig, withPullRequest: githubConfig.mode === "pull-request" });
    }

    /**
     * Generates the reference.md content using the given builder.
     */
    public async generateReference(builder: ReferenceConfigBuilder): Promise<string> {
        const referenceConfig = builder.build(this.getLanguage());
        return this.cli.generateReference({ referenceConfig });
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

    private async readFeatureConfig(): Promise<FernGeneratorCli.FeatureConfig> {
        this.logger.debug("Reading feature configuration ...");
        const rawYaml = await this.getFeaturesConfig();
        const loaded = yaml.load(rawYaml) as FernGeneratorCli.FeatureConfig;
        return loaded;
    }

    private getRemote(): FernGeneratorCli.Remote | undefined {
        const outputMode = this.config.output.mode.type === "github" ? this.config.output.mode : undefined;
        if (outputMode?.repoUrl != null) {
            // Convert short format (owner/repo) to full GitHub URL if needed
            const repoUrl = this.normalizeRepoUrl(outputMode.repoUrl);

            // For remote generation, use installationToken if available
            if (outputMode.installationToken != null) {
                return FernGeneratorCli.Remote.github({
                    repoUrl,
                    installationToken: outputMode.installationToken
                });
            }
            // For local generation, create remote config for README URL construction
            // even without installationToken (it will be used only for URL construction)
            return FernGeneratorCli.Remote.github({
                repoUrl,
                installationToken: "" // Empty token - only used for README URL construction
            });
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
        for (const each of FEATURES_CONFIG_PATHS) {
            try {
                const rawContents = await readFile(each, "utf8");
                if (rawContents.length !== 0) {
                    return rawContents;
                }
            } catch (error) {
                // ignore
            }
        }
        // throw an error if we can't find the features.yml file
        throw new Error("Internal error; failed to read feature configuration");
    }
}
