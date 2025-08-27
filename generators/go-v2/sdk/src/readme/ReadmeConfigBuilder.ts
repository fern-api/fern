import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

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
        const features: FernGeneratorCli.ReadmeFeature[] = [];

        for (const feature of featureConfig.features) {
            const snippetsForFeature = snippetsByFeatureId[feature.id];

            if (snippetsForFeature == null || !snippetsForFeature.length) {
                continue;
            }

            features.push({
                id: feature.id,
                advanced: feature.advanced,
                description: feature.description,
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
            features
        };
    }

    private getLanguageInfo({ context }: { context: SdkGeneratorContext }): FernGeneratorCli.LanguageInfo {
        return FernGeneratorCli.LanguageInfo.go({});
    }
}
