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

    private getLanguageInfo({ context }: { context: SdkGeneratorContext }): FernGeneratorCli.LanguageInfo {
        return FernGeneratorCli.LanguageInfo.rust({
            publishInfo: {
                packageName: context.getCrateName(),
                version: context.getCrateVersion()
            }
        });
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
        if (section.language === "rust" && !customConfigSections?.some((s) => s.title === section.title)) {
            sections.push({
                name: section.title,
                language: FernGeneratorCli.Language.Rust,
                content: section.content
            });
        }
    }
    for (const section of customConfigSections ?? []) {
        sections.push({
            name: section.title,
            language: FernGeneratorCli.Language.Rust,
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
