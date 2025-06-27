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
            features
        };
    }

    private getLanguageInfo({ context }: { context: SdkGeneratorContext }): FernGeneratorCli.LanguageInfo {
        context.logger.debug(
            "[jsklan-debug]: FernGeneratorExec.config.GeneratorConfig: " + JSON.stringify(context.config)
        );
        const config = context.config;
        if (config) {
            const outputMode = config.output.mode;
            let group = JSON.stringify(config);
            let artifact = JSON.stringify(config);
            let version = JSON.stringify(config);
            if (outputMode.type == "github") {
                version = outputMode.version;
                if (outputMode.publishInfo?.type == "maven") {
                    group = outputMode.publishInfo.coordinate.split(":")[0] || group;
                    artifact = outputMode.publishInfo.coordinate.split(":")[1] || group;
                }
            }
            return FernGeneratorCli.LanguageInfo.java({
                publishInfo: {
                    group,
                    artifact,
                    version
                }
            });
        }
        return FernGeneratorCli.LanguageInfo.java({});
    }
}
