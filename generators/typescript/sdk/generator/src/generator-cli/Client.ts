import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createLoggingExecutable, LoggingExecutable } from "@fern-api/logging-execa";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ExportedFilePath, NpmPackage } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import tmp from "tmp-promise";
import { ReadmeSnippetBuilder } from "./ReadmeSnippetBuilder";

const README_FILENAME = "README.md";
const GENERATOR_CLI_NPM_PACKAGE = "@fern-api/generator-cli";
const FEATURES_CONFIG_PATH = "/assets/features.yml";

export class GeneratorCli {
    private logger: Logger;
    private organization: string;
    private ir: IntermediateRepresentation;
    private npmPackage: NpmPackage | undefined;
    private skipInstall: boolean;
    private generatorCli: LoggingExecutable | undefined;

    constructor({
        logger,
        organization,
        intermediateRepresentation,
        npmPackage,
        skipInstall
    }: {
        logger: Logger;
        organization: string;
        intermediateRepresentation: IntermediateRepresentation;
        npmPackage: NpmPackage | undefined;
        skipInstall?: boolean;
    }) {
        this.logger = logger;
        this.organization = organization;
        this.ir = intermediateRepresentation;
        this.npmPackage = npmPackage;
        this.skipInstall = skipInstall ?? false;
    }

    public getReadmeExportedFilePath(): ExportedFilePath {
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
        endpointSnippets,
        originalReadmeFilepath
    }: {
        context: SdkContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
        originalReadmeFilepath: string | undefined;
    }): Promise<string> {
        const readmeSnippetBuilder = new ReadmeSnippetBuilder({
            context,
            readmeConfig: this.ir.readmeConfig,
            npmPackage: this.npmPackage,
            services: this.ir.services,
            endpointSnippets
        });
        const readmeConfigFilepath = await this.writeReadmeConfig({
            snippets: readmeSnippetBuilder.buildReadmeSnippets()
        });
        const args = ["generate", "readme", "--config", readmeConfigFilepath];
        if (originalReadmeFilepath) {
            args.push("--original-readme", originalReadmeFilepath);
        }
        const generatorCli = await this.getOrInstall();
        const content = await generatorCli(args);
        return content.stdout;
    }

    private async writeReadmeConfig({
        snippets
    }: {
        snippets: Record<FernGeneratorCli.FeatureId, string[]>;
    }): Promise<AbsoluteFilePath> {
        const readmeConfig = await this.getReadmeConfig({ snippets });
        const readmeConfigFile = await tmp.file();
        await writeFile(readmeConfigFile.path, JSON.stringify(readmeConfig));
        return AbsoluteFilePath.of(readmeConfigFile.path);
    }

    private async getReadmeConfig({
        snippets
    }: {
        snippets: Record<FernGeneratorCli.FeatureId, string[]>;
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
                description: feature.description,
                snippets: featureSnippets,
                snippetsAreOptional: false
            });
        }
        return {
            language: this.getLanguageInfo(),
            organization: this.organization,
            apiReferenceLink: this.ir.readmeConfig?.apiReferenceLink,
            bannerLink: this.ir.readmeConfig?.bannerLink,
            features
        };
    }

    private async readFeatureConfig(): Promise<FernGeneratorCli.FeatureConfig> {
        this.logger.debug("Reading feature configuration ...");
        const rawContents = await readFile(FEATURES_CONFIG_PATH, "utf8");
        if (rawContents.length === 0) {
            throw new Error("Internal error; failed to read feature configuration");
        }
        return yaml.load(rawContents) as FernGeneratorCli.FeatureConfig;
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
        await npm(["install", "-g", GENERATOR_CLI_NPM_PACKAGE]);

        const generatorCli = createLoggingExecutable("generator-cli", {
            cwd: process.cwd(),
            logger: this.logger
        });
        const version = await generatorCli(["--version"]);
        this.logger.debug(`Successfully installed ${GENERATOR_CLI_NPM_PACKAGE} version ${version.stdout}`);

        this.generatorCli = generatorCli;
        return generatorCli;
    }

    private getLanguageInfo(): FernGeneratorCli.LanguageInfo {
        if (this.npmPackage != null) {
            return FernGeneratorCli.LanguageInfo.typescript({
                publishInfo: {
                    packageName: this.npmPackage.packageName
                }
            });
        }
        return FernGeneratorCli.LanguageInfo.typescript({});
    }
}
