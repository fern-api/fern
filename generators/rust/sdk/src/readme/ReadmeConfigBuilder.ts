import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
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
        context: SdkGeneratorContext;
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
            const featureSnippets = snippets[feature.id];
            if (featureSnippets == null || featureSnippets.length === 0) {
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
            features
        };
    }

    private getLanguageInfo({ context }: { context: SdkGeneratorContext }): FernGeneratorCli.LanguageInfo {
        // TODO: Update to use "rust" type once it's added to FernGeneratorCli.LanguageInfo
        // For now, using TypeScript as a placeholder since it's closer to Rust syntax than Go
        // This will generate a README with TypeScript-style badges/titles, but the code snippets will be correct Rust
        // Once Rust is added to the LanguageInfo union, we should use:
        // const packageName = context.configManager.get("packageName");
        // const packageVersion = context.configManager.get("packageVersion");
        const packageName = context.configManager.get("packageName") || context.ir.apiName.snakeCase.safeName;

        return FernGeneratorCli.LanguageInfo.typescript({
            publishInfo: {
                packageName: packageName
            }
        });
    }
}
