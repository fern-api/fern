import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private readonly context: SdkGeneratorContext;
    private readonly snippetsById: Record<string, FernGeneratorExec.Endpoint>;

    public constructor({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }) {
        super({ endpointSnippets });
        this.context = context;
        this.snippetsById = Object.fromEntries(endpointSnippets.map((snippet) => [snippet.id.identifierOverride, snippet]));
    }

    public override getDefaultEndpointId(): EndpointId {
        return this.context.ir.readmeConfig?.defaultEndpoint ?? super.getDefaultEndpointId();
    }

    public buildReadmeSnippets(): Record<FernGeneratorCli.FeatureId, string[]> {
        const snippets: Record<FernGeneratorCli.FeatureId, string[]> = {};
        snippets[FernGeneratorCli.StructuredFeatureId.Usage] = this.buildUsageSnippets();
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

    private getUsageSnippetForEndpoint(endpointId: string) {
        return this.snippetsById[endpointId]?.snippet;
    }

    private getEndpointIdsForFeature(featureId: FeatureId): EndpointId[] | undefined {
        return this.context.ir.readmeConfig?.features?.[this.getFeatureKey(featureId)];
    }
}
