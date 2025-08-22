import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { SDKRequirements } from "../requirements";
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
        return FernGeneratorCli.LanguageInfo.swift({
            publishInfo: {
                gitUrl: "https://github.com/kafkas/swift-sdk.git", // TODO(kafkas): Implement
                minVersion: "0.1.0" // TODO(kafkas): Implement
            }
        });
    }
}
