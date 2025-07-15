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
