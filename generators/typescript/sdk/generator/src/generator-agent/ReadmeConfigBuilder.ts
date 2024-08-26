import { Logger } from "@fern-api/logger";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { NpmPackage } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { ReadmeSnippetBuilder } from "./ReadmeSnippetBuilder";

const DOCKER_FEATURES_CONFIG_PATH = "/assets/features.yml";

export class ReadmeConfigBuilder {
    private logger: Logger;
    private endpointSnippets: FernGeneratorExec.Endpoint[];
    private npmPackage: NpmPackage | undefined;
    private githubRepoUrl: string | undefined;
    private githubInstallationToken: string | undefined;

    constructor({
        logger,
        endpointSnippets,
        npmPackage,
        githubRepoUrl,
        githubInstallationToken
    }: {
        logger: Logger;
        endpointSnippets: FernGeneratorExec.Endpoint[];
        npmPackage: NpmPackage | undefined;
        githubRepoUrl: string | undefined;
        githubInstallationToken: string | undefined;
    }) {
        this.logger = logger;
        this.endpointSnippets = endpointSnippets;
        this.npmPackage = npmPackage;
        this.githubRepoUrl = githubRepoUrl;
        this.githubInstallationToken = githubInstallationToken;
    }

    public build(context: SdkContext): FernGeneratorCli.ReadmeConfig {
        const featureConfig = this.readFeatureConfig();
        const readmeSnippetBuilder = new ReadmeSnippetBuilder({
            context,
            npmPackage: this.npmPackage,
            endpointSnippets: this.endpointSnippets
        });
        const snippets = readmeSnippetBuilder.buildReadmeSnippets();
        const features: FernGeneratorCli.ReadmeFeature[] = [];
        for (const feature of featureConfig.features) {
            const featureSnippets = snippets[feature.id];
            if (!featureSnippets) {
                continue;
            }
            features.push({
                id: feature.id,
                advanced: feature.advanced,
                description: feature.description,
                snippets: featureSnippets,
                snippetsAreOptional: false
            });
        }
        return {
            remote: this.getRemote({
                githubRepoUrl: this.githubRepoUrl,
                githubInstallationToken: this.githubInstallationToken
            }),
            language: this.getLanguageInfo({ npmPackage: this.npmPackage }),
            organization: context.config.organization,
            apiReferenceLink: context.ir.readmeConfig?.apiReferenceLink,
            bannerLink: context.ir.readmeConfig?.bannerLink,
            features
        };
    }

    private readFeatureConfig(): FernGeneratorCli.FeatureConfig {
        this.logger.debug("Reading feature configuration ...");
        const rawContents = readFileSync(getFeaturesConfigPath(), "utf8");
        if (rawContents.length === 0) {
            throw new Error("Internal error; failed to read feature configuration");
        }
        return yaml.load(rawContents) as FernGeneratorCli.FeatureConfig;
    }

    private getRemote({
        githubRepoUrl,
        githubInstallationToken
    }: {
        githubRepoUrl: string | undefined;
        githubInstallationToken: string | undefined;
    }): FernGeneratorCli.Remote | undefined {
        if (githubRepoUrl != null && githubInstallationToken != null) {
            return FernGeneratorCli.Remote.github({
                repoUrl: githubRepoUrl,
                installationToken: githubInstallationToken
            });
        }
        return undefined;
    }

    private getLanguageInfo({ npmPackage }: { npmPackage: NpmPackage | undefined }): FernGeneratorCli.LanguageInfo {
        if (npmPackage != null) {
            return FernGeneratorCli.LanguageInfo.typescript({
                publishInfo: {
                    packageName: npmPackage.packageName
                }
            });
        }
        return FernGeneratorCli.LanguageInfo.typescript({});
    }
}

function getFeaturesConfigPath(): string {
    if (process.env.NODE_ENV === "test") {
        return path.join(__dirname, "../../features.yml");
    }
    return DOCKER_FEATURES_CONFIG_PATH;
}
