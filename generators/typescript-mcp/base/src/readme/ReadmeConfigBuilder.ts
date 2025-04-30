import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";

import { AbstractTypescriptMcpGeneratorContext } from "../context/AbstractTypescriptMcpGeneratorContext";

export class ReadmeConfigBuilder {
    public build({
        context,
        remote,
        featureConfig
    }: {
        context: AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema>;
        remote: FernGeneratorCli.Remote | undefined;
        featureConfig: FernGeneratorCli.FeatureConfig;
    }): FernGeneratorCli.ReadmeConfig {
        const features: FernGeneratorCli.ReadmeFeature[] = [];

        for (const feature of featureConfig.features) {
            features.push({
                id: feature.id,
                advanced: feature.advanced,
                description: feature.description,
                snippetsAreOptional: true
            });
        }

        return {
            remote,
            language: this.getLanguageInfo({ context }),
            organization: context.config.organization,
            apiReferenceLink: context.ir.readmeConfig?.apiReferenceLink,
            bannerLink: context.ir.readmeConfig?.bannerLink,
            features
        };
    }

    private getLanguageInfo({
        context
    }: {
        context: AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema>;
    }): FernGeneratorCli.LanguageInfo {
        return FernGeneratorCli.LanguageInfo.typescript({});
    }
}
