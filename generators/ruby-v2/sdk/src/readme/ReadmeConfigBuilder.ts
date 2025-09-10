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
        const addendumsByFeatureId = readmeSnippetBuilder.buildReadmeAddendumsByFeatureId();
        const features: FernGeneratorCli.ReadmeFeature[] = [];

        for (const feature of featureConfig.features) {
            // Note: The ENVIRONMENTS feature creates dynamic code in the addendum,
            // so we need to set snippetsAreOptional to true and handle a bit differently.
            const snippetsForFeature = snippetsByFeatureId[feature.id];
            if (
                (snippetsForFeature == null || !snippetsForFeature.length) &&
                feature.id !== readmeSnippetBuilder.getEnvironmentFeatureIDName()
            ) {
                continue;
            }

            const addendumForFeature = addendumsByFeatureId[feature.id];

            if (addendumForFeature != null) {
                feature.addendum = addendumForFeature;
            }

            features.push({
                id: feature.id,
                advanced: feature.advanced,
                description: feature.description,
                snippets: snippetsForFeature,
                addendum: feature.addendum,
                snippetsAreOptional: feature.id === readmeSnippetBuilder.getEnvironmentFeatureIDName() ? true : false
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
        return FernGeneratorCli.LanguageInfo.ruby({});
    }
}
