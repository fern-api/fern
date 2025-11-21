import { Logger } from "@fern-api/logger";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { ReadmeSnippetBuilder } from "./ReadmeSnippetBuilder";

export class ReadmeConfigBuilder {
    public build({
        context,
        remote,
        featureConfig,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        remote: FernGeneratorCli.Remote | undefined;
        featureConfig: FernGeneratorCli.FeatureConfig;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }): FernGeneratorCli.ReadmeConfig {
        const readmeSnippetBuilder = new ReadmeSnippetBuilder({
            context,
            endpointSnippets
        });
        const snippetsByFeatureId = readmeSnippetBuilder.buildReadmeSnippetsByFeatureId();
        const addendumsByFeatureId = readmeSnippetBuilder.buildReadmeAddendumsByFeatureId();
        const features: FernGeneratorCli.ReadmeFeature[] = [];

        for (const feature of featureConfig.features) {
            const snippetsForFeature = snippetsByFeatureId[feature.id];

            if (snippetsForFeature == null || !snippetsForFeature.length) {
                continue;
            }

            const addendumForFeature = addendumsByFeatureId[feature.id];

            // Customize description for Pagination when using custom pagination
            let description = feature.description;
            if (feature.id === FernGeneratorCli.StructuredFeatureId.Pagination) {
                const hasCustomPagination = Object.values(context.ir.services).some((service) =>
                    service.endpoints.some((endpoint) => endpoint.pagination?.type === "custom")
                );
                if (hasCustomPagination) {
                    description = "Paginated endpoints return a pager that supports navigation in both directions.";
                }
            }

            features.push({
                id: feature.id,
                advanced: feature.advanced,
                description,
                snippets: snippetsForFeature,
                addendum: addendumForFeature,
                snippetsAreOptional: false
            });
        }

        return {
            remote,
            language: this.getLanguageInfo({ context }),
            organization: context.config.organization,
            apiReferenceLink: context.ir.readmeConfig?.apiReferenceLink,
            bannerLink: context.ir.readmeConfig?.bannerLink,
            introduction: context.ir.readmeConfig?.introduction,
            referenceMarkdownPath: "./reference.md",
            apiName: context.ir.readmeConfig?.apiName,
            disabledFeatures: context.ir.readmeConfig?.disabledFeatures,
            whiteLabel: context.ir.readmeConfig?.whiteLabel,
            customSections: getCustomSections(context),
            features,
            exampleStyle: context.ir.readmeConfig?.exampleStyle
        } as FernGeneratorCli.ReadmeConfig;
    }

    private getLanguageInfo({ context }: { context: SdkGeneratorContext }): FernGeneratorCli.LanguageInfo {
        const config = context.config;
        if (config.output.mode.type === "github" && config.output.mode.publishInfo?.type === "maven") {
            const coordinates = config.output.mode.publishInfo.coordinate.split(":");
            const group = coordinates[0];
            const artifact = coordinates[1];
            const version = config.output.mode.version;
            if (group && artifact && version) {
                return FernGeneratorCli.LanguageInfo.java({ publishInfo: { group, artifact, version } });
            } else {
                const missingFields: string[] = [];
                if (!group) {
                    missingFields.push("group");
                }
                if (!artifact) {
                    missingFields.push("artifact");
                }
                if (!version) {
                    missingFields.push("version");
                }
                context.logger.debug(
                    `Unable to populate Java language info. Missing required fields: ${missingFields.join(", ")}`
                );
            }
        } else {
            context.logger.debug("Unable to populate Java language info.");
        }
        return FernGeneratorCli.LanguageInfo.java({});
    }
}

function getCustomSections(context: SdkGeneratorContext): FernGeneratorCli.CustomSection[] | undefined {
    const irCustomSections = context.ir.readmeConfig?.customSections;
    const customConfig = parseCustomConfigOrUndefined(context.logger, context.config.customConfig);
    const customConfigSections = customConfig?.["custom-readme-sections"];

    let sections: FernGeneratorCli.CustomSection[] = [];
    for (const section of irCustomSections ?? []) {
        if (section.language === "java" && !customConfigSections?.some((s) => s.title === section.title)) {
            sections.push({
                name: section.title,
                language: FernGeneratorCli.Language.Java,
                content: section.content
            });
        }
    }
    for (const section of customConfigSections ?? []) {
        sections.push({
            name: section.title,
            language: FernGeneratorCli.Language.Java,
            content: section.content
        });
    }

    return sections.length > 0 ? sections : undefined;
}

function parseCustomConfigOrUndefined(logger: Logger, customConfig: unknown): SdkCustomConfigSchema | undefined {
    try {
        return SdkCustomConfigSchema.parse(customConfig);
    } catch (error) {
        logger.error(`Error parsing custom config during readme generation: ${error}`);
        return undefined;
    }
}
