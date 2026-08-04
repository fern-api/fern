import { Logger } from "@fern-api/logger";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { NpmPackage } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { template } from "lodash-es";
import { ReadmeSnippetBuilder } from "./ReadmeSnippetBuilder.js";

const SdkCustomConfigSchema: typeof TypescriptCustomConfigSchema = TypescriptCustomConfigSchema;
type SdkCustomConfigSchema = TypescriptCustomConfigSchema;

export interface ReactQueryReadmeConfig {
    clientClassName: string;
    namespaceName: string;
    providerName: string;
}

export class ReadmeConfigBuilder {
    private readonly endpointSnippets: FernGeneratorExec.Endpoint[];
    private readonly fileResponseType: "stream" | "binary-response";
    private readonly fetchSupport: "node-fetch" | "native";
    private readonly allowCustomFetcher: boolean;
    private readonly generateSubpackageExports: boolean;
    private readonly requireBaseUrl: boolean;
    private readonly reactQueryConfig: ReactQueryReadmeConfig | undefined;

    constructor({
        endpointSnippets,
        fileResponseType,
        fetchSupport,
        allowCustomFetcher,
        generateSubpackageExports,
        requireBaseUrl,
        reactQueryConfig
    }: {
        endpointSnippets: FernGeneratorExec.Endpoint[];
        fileResponseType: "stream" | "binary-response";
        fetchSupport: "node-fetch" | "native";
        allowCustomFetcher: boolean;
        generateSubpackageExports: boolean;
        requireBaseUrl: boolean;
        reactQueryConfig?: ReactQueryReadmeConfig;
    }) {
        this.endpointSnippets = endpointSnippets;
        this.fileResponseType = fileResponseType;
        this.fetchSupport = fetchSupport;
        this.allowCustomFetcher = allowCustomFetcher;
        this.generateSubpackageExports = generateSubpackageExports;
        this.requireBaseUrl = requireBaseUrl;
        this.reactQueryConfig = reactQueryConfig;
    }

    public build({
        context,
        remote,
        featureConfig
    }: {
        context: FileContext;
        remote: FernGeneratorCli.Remote | undefined;
        featureConfig: FernGeneratorCli.FeatureConfig;
    }): FernGeneratorCli.ReadmeConfig {
        const readmeSnippetBuilder = new ReadmeSnippetBuilder({
            context,
            endpointSnippets: this.endpointSnippets,
            fileResponseType: this.fileResponseType,
            allowCustomFetcher: this.allowCustomFetcher,
            generateSubpackageExports: this.generateSubpackageExports,
            requireBaseUrl: this.requireBaseUrl
        });
        const snippets = readmeSnippetBuilder.buildReadmeSnippets();
        const addendums = readmeSnippetBuilder.buildReadmeAddendums();
        const authenticationDescription = readmeSnippetBuilder.buildAuthenticationDescription();
        const features: FernGeneratorCli.ReadmeFeature[] = [];
        for (const feature of featureConfig.features) {
            const snippetForFeature = snippets[feature.id];

            // Check if this is the AUTHENTICATION feature with a custom description
            const isAuthenticationWithDescription =
                feature.id === "AUTHENTICATION" && authenticationDescription != null;

            // If snippet is explicitly false, skip this feature UNLESS it has a custom description
            if (snippetForFeature === false && !isAuthenticationWithDescription) {
                continue;
            }

            // Skip features without snippets unless they have a custom description (like AUTHENTICATION)
            if (snippetForFeature == null && !isAuthenticationWithDescription) {
                continue;
            }

            const addendumForFeature = addendums[feature.id];

            if (addendumForFeature != null) {
                feature.addendum = addendumForFeature;
            }

            // Override description for AUTHENTICATION feature if we have a custom one
            let description = feature.description ? this.processTemplateText(feature.description) : undefined;
            if (isAuthenticationWithDescription) {
                description = authenticationDescription;
            }

            // Features with description-only content (no code snippets) should still be rendered
            const isDescriptionOnlyFeature = feature.id === "RUNTIME_COMPATIBILITY";

            features.push({
                id: feature.id,
                advanced: feature.advanced,
                description,
                snippets: snippetForFeature === false ? [] : (snippetForFeature ?? []),
                addendum: feature.addendum ? this.processTemplateText(feature.addendum) : undefined,
                snippetsAreOptional: isAuthenticationWithDescription || isDescriptionOnlyFeature
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
            customSections: this.getCustomSectionsWithReactQuery(
                getCustomSections(context, this.generateSubpackageExports)
            ),
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

    private getCustomSectionsWithReactQuery(
        existingSections: FernGeneratorCli.CustomSection[] | undefined
    ): FernGeneratorCli.CustomSection[] | undefined {
        if (this.reactQueryConfig == null) {
            return existingSections;
        }

        const { clientClassName, namespaceName, providerName } = this.reactQueryConfig;
        const content = [
            "This SDK includes first-class [TanStack React Query](https://tanstack.com/query) hooks, available via the `{{ packageName }}/react-query` subpath import. React and `@tanstack/react-query` are optional peer dependencies — they are only needed if you use the hooks.",
            "",
            "### Setup",
            "",
            "Wrap your application with the client provider:",
            "",
            "```typescript",
            `import { ${clientClassName} } from "{{ packageName }}";`,
            `import { ${providerName} } from "{{ packageName }}/react-query";`,
            "",
            `const client = new ${clientClassName}({ /* ... */ });`,
            "",
            "function App() {",
            "    return (",
            `        <${providerName} client={client}>`,
            "            <YourApp />",
            `        </${providerName}>`,
            "    );",
            "}",
            "```",
            "",
            "### Query Hooks",
            "",
            "Hooks follow a tRPC-style namespace that mirrors the SDK client hierarchy:",
            "",
            "```typescript",
            `import { ${namespaceName} } from "{{ packageName }}/react-query";`,
            "",
            "function UserList() {",
            `    const { data, isLoading } = ${namespaceName}.user.list.useQuery();`,
            "    // Also available: useSuspenseQuery()",
            "}",
            "```",
            "",
            "### Mutation Hooks",
            "",
            "```typescript",
            "function CreateUser() {",
            `    const mutation = ${namespaceName}.user.create.useMutation();`,
            '    return <button onClick={() => mutation.mutate([{ name: "Alice" }])}>Create</button>;',
            "}",
            "```",
            "",
            "### Cache Invalidation",
            "",
            "Each endpoint and service exposes an `invalidate` helper for targeted cache invalidation:",
            "",
            "```typescript",
            'import { useQueryClient } from "@tanstack/react-query";',
            "",
            "const queryClient = useQueryClient();",
            "",
            "// Invalidate a specific endpoint",
            `await ${namespaceName}.user.list.invalidate(queryClient);`,
            "",
            "// Invalidate all queries for a service",
            `await ${namespaceName}.user.invalidate(queryClient);`,
            "",
            "// Invalidate all SDK queries",
            `await ${namespaceName}.invalidate(queryClient);`,
            "```",
            "",
            "### SSR / React Server Components",
            "",
            "Use `getQueryOptions` to prefetch data on the server:",
            "",
            "```typescript",
            `const options = ${namespaceName}.user.list.getQueryOptions(client);`,
            "await queryClient.prefetchQuery(options);",
            "```"
        ].join("\n");

        const reactQuerySection: FernGeneratorCli.CustomSection = {
            name: "React Query",
            language: FernGeneratorCli.Language.Typescript,
            content
        };

        const sections = existingSections ?? [];
        return [reactQuerySection, ...sections];
    }
}

function getCustomSections(
    context: FileContext,
    generateSubpackageExports: boolean
): FernGeneratorCli.CustomSection[] | undefined {
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
    if (customConfig == null) {
        return undefined;
    }
    try {
        return SdkCustomConfigSchema.parse(customConfig);
    } catch (error) {
        logger.error(`Error parsing custom config during readme generation: ${error}`);
        return undefined;
    }
}
