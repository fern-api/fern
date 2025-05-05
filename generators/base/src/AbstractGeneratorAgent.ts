import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import { AbstractGeneratorContext, FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { Logger } from "@fern-api/logger";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";

import { GeneratorAgentClient } from "./GeneratorAgentClient";
import { ReferenceConfigBuilder } from "./reference";

const DOCKER_FEATURES_CONFIG_PATH = "/assets/features.yml";

export declare namespace AbstractGeneratorAgent {
    interface ReadmeConfigArgs<GeneratorContext extends AbstractGeneratorContext> {
        context: GeneratorContext;
        remote: FernGeneratorCli.Remote | undefined;
        featureConfig: FernGeneratorCli.FeatureConfig;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }

    interface GitHubConfigArgs<GeneratorContext extends AbstractGeneratorContext> {
        context: GeneratorContext;
        remote: FernGeneratorCli.Remote.Github;
        branch?: string;
    }
}

export abstract class AbstractGeneratorAgent<GeneratorContext extends AbstractGeneratorContext> {
    public README_FILENAME = "README.md";
    public SNIPPET_FILENAME = "snippet.json";
    public REFERENCE_FILENAME = "reference.md";

    private logger: Logger;
    private config: FernGeneratorExec.GeneratorConfig;
    private cli: GeneratorAgentClient;

    public constructor({ logger, config }: { logger: Logger; config: FernGeneratorExec.GeneratorConfig }) {
        this.logger = logger;
        this.config = config;
        this.cli = new GeneratorAgentClient({
            logger
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
     * TODO: Maybe rename to `triggerGitHub` since nothing is generated per se?
     */
    public async generateGitHub({ context }: { context: GeneratorContext }): Promise<string> {
        const remote = this.getRemote();
        if (remote === undefined) {
            throw new Error("No remote found, unable to run GitHub actions");
        }
        const githubConfig = this.getGitHubConfig({ context, remote });
        return this.cli.generateGitHub({ githubConfig });
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
    ): FernGeneratorCli.GitHubConfig;

    private async readFeatureConfig(): Promise<FernGeneratorCli.FeatureConfig> {
        this.logger.debug("Reading feature configuration ...");
        const rawContents = await readFile(this.getFeaturesConfigPath(), "utf8");
        if (rawContents.length === 0) {
            throw new Error("Internal error; failed to read feature configuration");
        }
        return yaml.load(rawContents) as FernGeneratorCli.FeatureConfig;
    }

    private getRemote(): FernGeneratorCli.Remote | undefined {
        const outputMode = this.config.output.mode.type === "github" ? this.config.output.mode : undefined;
        if (outputMode?.repoUrl != null && outputMode?.installationToken != null) {
            return FernGeneratorCli.Remote.github({
                repoUrl: outputMode.repoUrl,
                installationToken: outputMode.installationToken
            });
        }
        return undefined;
    }

    private getFeaturesConfigPath(): string {
        if (process.env.NODE_ENV === "test") {
            return path.join(__dirname, "../../features.yml");
        }
        return DOCKER_FEATURES_CONFIG_PATH;
    }
}
