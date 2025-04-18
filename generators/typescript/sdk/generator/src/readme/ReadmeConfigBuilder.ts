import { NpmPackage } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { ReadmeSnippetBuilder } from "./ReadmeSnippetBuilder";

export class ReadmeConfigBuilder {
    private endpointSnippets: FernGeneratorExec.Endpoint[];

    constructor({ endpointSnippets }: { endpointSnippets: FernGeneratorExec.Endpoint[] }) {
        this.endpointSnippets = endpointSnippets;
    }

    public build({
        context,
        remote,
        featureConfig
    }: {
        context: SdkContext;
        remote: FernGeneratorCli.Remote | undefined;
        featureConfig: FernGeneratorCli.FeatureConfig;
    }): FernGeneratorCli.ReadmeConfig {
        const readmeSnippetBuilder = new ReadmeSnippetBuilder({
            context,
            endpointSnippets: this.endpointSnippets
        });
        const snippets = readmeSnippetBuilder.buildReadmeSnippets();
        const features: FernGeneratorCli.ReadmeFeature[] = [];
        for (const feature of featureConfig.features) {
            const snippetForFeature = snippets[feature.id];
            if (snippetForFeature == null) {
                continue;
            }
            features.push({
                id: feature.id,
                advanced: feature.advanced,
                description: feature.description,
                snippets: snippetForFeature,
                snippetsAreOptional: false
            });
        }
        return {
            remote,
            language: this.getLanguageInfo({ npmPackage: context.npmPackage }),
            organization: context.config.organization,
            apiReferenceLink: context.ir.readmeConfig?.apiReferenceLink,
            bannerLink: context.ir.readmeConfig?.bannerLink,
            referenceMarkdownPath: "./reference.md",
            features
        };
    }

    private getLanguageInfo({ npmPackage }: { npmPackage: NpmPackage | undefined }): FernGeneratorCli.LanguageInfo {
        if (npmPackage != null) {
            return FernGeneratorCli.LanguageInfo.typescript({
                publishInfo: {
                    packageName: npmPackage.packageName
                }
            });
        }
        return FernGeneratorCli.LanguageInfo.typescript({});
    }
}
