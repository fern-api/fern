import { Logger } from "@fern-api/logger";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { ENVIRONMENTS_FEATURE_ID, ReadmeSnippetBuilder } from "./ReadmeSnippetBuilder.js";

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

            features.push({
                id: feature.id,
                advanced: feature.advanced,
                description: this.getFeatureDescription({ context, feature }),
                addendum: addendumsByFeatureId[feature.id] ?? feature.addendum,
                snippets: snippetsForFeature,
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
            features
        };
    }

    /**
     * features.yml describes environments in terms of `option.WithBaseURL`, which takes the
     * string a single-URL environment constant is. A multi-URL environment is a struct with one
     * URL per service, and the client takes it through `option.WithEnvironment`.
     */
    private getFeatureDescription({
        context,
        feature
    }: {
        context: SdkGeneratorContext;
        feature: FernGeneratorCli.FeatureSpec;
    }): string | undefined {
        if (feature.id === ENVIRONMENTS_FEATURE_ID && context.isMultipleBaseUrlsEnvironment()) {
            return [
                "You can choose between different environments by passing one of the predefined `Environments` to the",
                "`option.WithEnvironment` option. Each environment carries the base URL of every service the SDK talks to.",
                "`option.WithBaseURL` points every request at one arbitrary base URL instead, which is particularly useful in",
                "test environments.",
                ""
            ].join("\n");
        }
        return feature.description;
    }

    private getLanguageInfo({ context }: { context: SdkGeneratorContext }): FernGeneratorCli.LanguageInfo {
        return FernGeneratorCli.LanguageInfo.go({});
    }
}

function getCustomSections(context: SdkGeneratorContext): FernGeneratorCli.CustomSection[] | undefined {
    const irCustomSections = context.ir.readmeConfig?.customSections;
    const customConfigSections = parseCustomConfigOrUndefined(
        context.logger,
        context.config.customConfig
    )?.customReadmeSections;

    let sections: FernGeneratorCli.CustomSection[] = [];

    for (const section of irCustomSections ?? []) {
        if (section.language === "go" && !customConfigSections?.some((s) => s.title === section.title)) {
            sections.push({
                name: section.title,
                language: FernGeneratorCli.Language.Go,
                content: section.content
            });
        }
    }
    for (const section of customConfigSections ?? []) {
        sections.push({
            name: section.title,
            language: FernGeneratorCli.Language.Go,
            content: section.content
        });
    }
    return sections.length > 0 ? sections : undefined;
}

function parseCustomConfigOrUndefined(logger: Logger, customConfig: unknown): SdkCustomConfigSchema | undefined {
    if (customConfig == null) {
        return undefined;
    }
    try {
        return SdkCustomConfigSchema.parse(customConfig);
    } catch (error) {
        logger.error(`Error parsing custom config during readme generation: ${error}`);
        return undefined;
    }
}
