import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static readonly REQUEST_TYPES_FEATURE_ID: FernGeneratorCli.FeatureId = "REQUEST_TYPES";

    private readonly context: SdkGeneratorContext;
    private readonly endpointSnippetsById: Record<string, FernGeneratorExec.Endpoint>;

    public constructor({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }) {
        super({ endpointSnippets });
        this.context = context;
        this.endpointSnippetsById = Object.fromEntries(
            endpointSnippets.map((snippet) => [snippet.id.identifierOverride, snippet])
        );
    }

    public override getDefaultEndpointId(): EndpointId {
        return this.context.ir.readmeConfig?.defaultEndpoint ?? super.getDefaultEndpointId();
    }

    public buildReadmeSnippets(): Record<FernGeneratorCli.FeatureId, string[]> {
        const snippets: Record<FernGeneratorCli.FeatureId, string[]> = {};
        snippets[FernGeneratorCli.StructuredFeatureId.Usage] = this.buildUsageSnippets();
        snippets[ReadmeSnippetBuilder.REQUEST_TYPES_FEATURE_ID] = this.buildRequestTypesSnippets();
        return snippets;
    }

    private buildUsageSnippets(): string[] {
        const snippets: string[] = [];
        const usageEndpointIds = this.getEndpointIdsForFeature(FernGeneratorCli.StructuredFeatureId.Usage);
        if (usageEndpointIds != null) {
            usageEndpointIds.forEach((endpointId) => {
                const snippet = this.getUsageSnippetForEndpoint(endpointId);
                if (snippet?.type === "typescript") {
                    snippets.push(snippet.client);
                }
            });
        } else {
            const snippet = this.getUsageSnippetForEndpoint(this.getDefaultEndpointId());
            if (snippet?.type === "typescript") {
                snippets.push(snippet.client);
            }
        }
        return snippets;
    }

    private buildRequestTypesSnippets(): string[] {
        const moduleName = this.context.project.symbolRegistry.getModuleSymbolOrThrow();
        const requestContainerName = this.context.project.symbolRegistry.getRequestsContainerSymbolOrThrow();
        const [firstRequestTypeSymbol] = this.context.project.symbolRegistry.getAllRequestTypeSymbols();
        if (firstRequestTypeSymbol == null) {
            return [];
        }
        const content = SwiftFile.getRawContents([
            swift.Statement.import(moduleName),
            swift.LineBreak.single(),
            swift.Statement.constantDeclaration({
                unsafeName: "request",
                value: swift.Expression.structInitialization({
                    unsafeName: requestContainerName + "." + firstRequestTypeSymbol.name,
                    arguments_: [
                        swift.functionArgument({
                            value: swift.Expression.rawValue("...")
                        })
                    ],
                    multiline: true
                })
            })
        ]);
        return [content];
    }

    private getUsageSnippetForEndpoint(endpointId: string) {
        return this.endpointSnippetsById[endpointId]?.snippet;
    }

    private getEndpointIdsForFeature(featureId: FeatureId): EndpointId[] | undefined {
        return this.context.ir.readmeConfig?.features?.[this.getFeatureKey(featureId)];
    }
}
