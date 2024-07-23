import { Logger } from "@fern-api/logger";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ExportedFilePath, NpmPackage } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { GeneratorCli } from "./Client";
import { ReadmeSnippetBuilder } from "./ReadmeSnippetBuilder";

const DOCKER_FEATURES_CONFIG_PATH = "/assets/features.yml";
const README_FILENAME = "README.md";

export class ReadmeGenerator {
    private generatorCli: GeneratorCli;
    private logger: Logger;

    constructor({ generatorCli, logger }: { generatorCli: GeneratorCli; logger: Logger }) {
        this.generatorCli = generatorCli;
        this.logger = logger;
    }

    public getExportedFilePath(): ExportedFilePath {
        return {
            directories: [],
            file: {
                nameOnDisk: README_FILENAME
            },
            rootDir: ""
        };
    }

    public async generateReadme({
        context,
        ir,
        organization,
        endpointSnippets,
        npmPackage,
        githubRepoUrl,
        githubInstallationToken
    }: {
        context: SdkContext;
        ir: IntermediateRepresentation;
        organization: string;
        endpointSnippets: FernGeneratorExec.Endpoint[];
        npmPackage: NpmPackage | undefined;
        githubRepoUrl: string | undefined;
        githubInstallationToken: string | undefined;
    }): Promise<string> {
        const readmeSnippetBuilder = new ReadmeSnippetBuilder({
            context,
            readmeConfig: ir.readmeConfig,
            npmPackage,
            services: ir.services,
            endpointSnippets
        });
        const readmeConfig = await this.newReadmeConfig({
            ir,
            organization,
            snippets: readmeSnippetBuilder.buildReadmeSnippets(),
            npmPackage,
            githubRepoUrl,
            githubInstallationToken
        });
        return this.generatorCli.generateReadme({ readmeConfig });
    }

    private async newReadmeConfig({
        ir,
        organization,
        snippets,
        npmPackage,
        githubRepoUrl,
        githubInstallationToken
    }: {
        ir: IntermediateRepresentation;
        organization: string;
        snippets: Record<FernGeneratorCli.FeatureId, string[]>;
        npmPackage: NpmPackage | undefined;
        githubRepoUrl: string | undefined;
        githubInstallationToken: string | undefined;
    }): Promise<FernGeneratorCli.ReadmeConfig> {
        const featureConfig = await this.readFeatureConfig();
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
                githubRepoUrl,
                githubInstallationToken
            }),
            language: this.getLanguageInfo({ npmPackage }),
            organization,
            apiReferenceLink: ir.readmeConfig?.apiReferenceLink,
            bannerLink: ir.readmeConfig?.bannerLink,
            features
        };
    }

    private async readFeatureConfig(): Promise<FernGeneratorCli.FeatureConfig> {
        this.logger.debug("Reading feature configuration ...");
        const rawContents = await readFile(getFeaturesConfigPath(), "utf8");
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
