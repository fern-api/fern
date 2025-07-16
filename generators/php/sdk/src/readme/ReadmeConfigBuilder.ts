import { FernGeneratorCli } from '@fern-fern/generator-cli-sdk'
import { FernGeneratorExec } from '@fern-fern/generator-exec-sdk'

import { SdkGeneratorContext } from '../SdkGeneratorContext'
import { ReadmeSnippetBuilder } from './ReadmeSnippetBuilder'

export interface Snippet {
    id: string
    snippet: string
}

export class ReadmeConfigBuilder {
    public build({
        context,
        remote,
        featureConfig,
        endpointSnippets
    }: {
        context: SdkGeneratorContext
        remote: FernGeneratorCli.Remote | undefined
        featureConfig: FernGeneratorCli.FeatureConfig
        endpointSnippets: FernGeneratorExec.Endpoint[]
    }): FernGeneratorCli.ReadmeConfig {
        const readmeSnippetBuilder = new ReadmeSnippetBuilder({
            context,
            endpointSnippets
        })
        const snippets = readmeSnippetBuilder.buildReadmeSnippets()
        const addendums = readmeSnippetBuilder.buildReadmeAddendums()
        const features: FernGeneratorCli.ReadmeFeature[] = []
        for (const feature of featureConfig.features) {
            const featureSnippets = snippets[feature.id]
            if (!featureSnippets) {
                continue
            }

            const addendumForFeature = addendums[feature.id]

            if (addendumForFeature != null) {
                feature.addendum = addendumForFeature
            }

            features.push({
                id: feature.id,
                advanced: feature.advanced,
                description: feature.description,
                snippets: featureSnippets,
                addendum: feature.addendum,
                snippetsAreOptional: false
            })
        }
        return {
            remote,
            language: this.getLanguageInfo({ context }),
            organization: context.config.organization,
            apiReferenceLink: context.ir.readmeConfig?.apiReferenceLink,
            bannerLink: context.ir.readmeConfig?.bannerLink,
            introduction: context.ir.readmeConfig?.introduction,
            features,
            requirements: ['PHP ^8.1']
        }
    }

    private getLanguageInfo({ context }: { context: SdkGeneratorContext }): FernGeneratorCli.LanguageInfo {
        return FernGeneratorCli.LanguageInfo.php({
            publishInfo: {
                packageName: context.getPackageName()
            }
        })
    }
}
