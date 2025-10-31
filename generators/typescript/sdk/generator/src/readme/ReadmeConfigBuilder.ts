import { Logger } from "@fern-api/logger";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { NpmPackage } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { template } from "lodash-es";
import { ReadmeSnippetBuilder } from "./ReadmeSnippetBuilder";

const SdkCustomConfigSchema: typeof TypescriptCustomConfigSchema = TypescriptCustomConfigSchema;
type SdkCustomConfigSchema = TypescriptCustomConfigSchema;

export class ReadmeConfigBuilder {
    private readonly endpointSnippets: FernGeneratorExec.Endpoint[];
    private readonly fileResponseType: "stream" | "binary-response";
    private readonly fetchSupport: "node-fetch" | "native";

    constructor({
        endpointSnippets,
        fileResponseType,
        fetchSupport
    }: {
        endpointSnippets: FernGeneratorExec.Endpoint[];
        fileResponseType: "stream" | "binary-response";
        fetchSupport: "node-fetch" | "native";
    }) {
        this.endpointSnippets = endpointSnippets;
        this.fileResponseType = fileResponseType;
        this.fetchSupport = fetchSupport;
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
            endpointSnippets: this.endpointSnippets,
            fileResponseType: this.fileResponseType
        });
        const snippets = readmeSnippetBuilder.buildReadmeSnippets();
        const addendums = readmeSnippetBuilder.buildReadmeAddendums();
        const features: FernGeneratorCli.ReadmeFeature[] = [];
        for (const feature of featureConfig.features) {
            const snippetForFeature = snippets[feature.id];
            if (snippetForFeature == null) {
                continue;
            }

            const addendumForFeature = addendums[feature.id];

            if (addendumForFeature != null) {
                feature.addendum = addendumForFeature;
            }
            features.push({
                id: feature.id,
                advanced: feature.advanced,
                description: feature.description ? this.processTemplateText(feature.description) : undefined,
                snippets: snippetForFeature,
                addendum: feature.addendum ? this.processTemplateText(feature.addendum) : undefined,
                snippetsAreOptional: false
            });
        }
        return {
            remote,
            language: this.getLanguageInfo({ npmPackage: context.npmPackage }),
            organization: context.config.organization,
            apiReferenceLink: context.ir.readmeConfig?.apiReferenceLink,
            bannerLink: context.ir.readmeConfig?.bannerLink,
            introduction: context.ir.readmeConfig?.introduction,
            referenceMarkdownPath: "./reference.md",
            apiName: context.ir.readmeConfig?.apiName,
            disabledFeatures: context.ir.readmeConfig?.disabledFeatures
                ? Array.from(context.ir.readmeConfig.disabledFeatures)
                : undefined,
            whiteLabel: context.ir.readmeConfig?.whiteLabel,
            customSections: getCustomSections(context),
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

    private processTemplateText(templateText: string | undefined): string {
        const templateVariables = this.getTemplateVariables();
        const compiledTemplate = template(templateText);
        const content = compiledTemplate(templateVariables);
        return content;
    }

    private getTemplateVariables(): Record<string, unknown> {
        return {
            fetchSupport: this.fetchSupport
        };
    }
}

function getCustomSections(context: SdkContext): FernGeneratorCli.CustomSection[] | undefined {
    const irCustomSections = context.ir.readmeConfig?.customSections;
    const customConfigSections = parseCustomConfigOrUndefined(
        context.logger,
        context.config.customConfig
    )?.customReadmeSections;

    let sections: FernGeneratorCli.CustomSection[] = [];
    for (const section of irCustomSections ?? []) {
        if (section.language === "typescript" && !customConfigSections?.some((s) => s.title === section.title)) {
            sections.push({
                name: section.title,
                language: FernGeneratorCli.Language.Typescript,
                content: section.content
            });
        }
    }
    for (const section of customConfigSections ?? []) {
        sections.push({
            name: section.title,
            language: FernGeneratorCli.Language.Typescript,
            content: section.content
        });
    }
    return sections.length > 0 ? sections : undefined;
}

function parseCustomConfigOrUndefined(logger: Logger, customConfig: unknown): SdkCustomConfigSchema | undefined {
    try {
        return SdkCustomConfigSchema.parse(customConfig);
    } catch (error) {
        logger.error(`Error parsing custom config during readme generation: ${error}`);
        return undefined;
    }
}
