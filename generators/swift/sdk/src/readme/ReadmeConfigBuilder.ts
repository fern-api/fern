import { Logger } from "@fern-api/logger";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { SDKRequirements } from "../requirements";
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
            language: this.getLanguageInfo(context),
            organization: context.config.organization,
            apiReferenceLink: context.ir.readmeConfig?.apiReferenceLink,
            bannerLink: context.ir.readmeConfig?.bannerLink,
            introduction: context.ir.readmeConfig?.introduction,
            referenceMarkdownPath: "./reference.md",
            customSections: getCustomSections(context),
            features,
            requirements: [
                `Swift ${SDKRequirements.minSwiftVersion}+`,
                `iOS ${SDKRequirements.minIOSVersion}+`,
                `macOS ${SDKRequirements.minMacOSVersion}+`,
                `tvOS ${SDKRequirements.minTVOSVersion}+`,
                `watchOS ${SDKRequirements.minWatchOSVersion}+`
            ]
        };
    }

    private getLanguageInfo(context: SdkGeneratorContext): FernGeneratorCli.LanguageInfo {
        const spmDetails = context.getSPMDetails();
        return FernGeneratorCli.LanguageInfo.swift({
            publishInfo: {
                gitUrl: spmDetails?.gitUrl ?? "<git-url>",
                minVersion: spmDetails?.minVersion ?? "0.1.0"
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
        if (section.language === "swift" && !customConfigSections?.some((s) => s.title === section.title)) {
            sections.push({
                name: section.title,
                language: FernGeneratorCli.Language.Swift,
                content: section.content
            });
        }
    }
    for (const section of customConfigSections ?? []) {
        sections.push({
            name: section.title,
            language: FernGeneratorCli.Language.Swift,
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
