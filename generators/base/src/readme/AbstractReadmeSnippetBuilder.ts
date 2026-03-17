import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { camelCase } from "lodash-es";

export abstract class AbstractReadmeSnippetBuilder {
    private endpointSnippets: FernGeneratorExec.Endpoint[];

    constructor({ endpointSnippets }: { endpointSnippets: FernGeneratorExec.Endpoint[] }) {
        this.endpointSnippets = endpointSnippets;
    }

    /**
     * Get the default endpoint that should be used in the generated README.md.
     * We prefer POST endpoints for better snippet quality, and among those,
     * we prefer the shortest snippet to avoid verbose examples with many optional parameters.
     */
    public getDefaultEndpointId(): string {
        let candidates = this.endpointSnippets.filter((endpoint) => endpoint.id.method === "POST");
        if (candidates.length === 0) {
            candidates = [...this.endpointSnippets];
        }
        if (candidates.length === 0) {
            throw new Error("Internal error; no endpoint snippets were provided");
        }

        // Among candidates, prefer the one with the shortest snippet.
        // This avoids endpoints with many optional parameters that produce verbose README examples
        // (e.g. bytes endpoints with 30+ optional query parameters all rendered as &None).
        let bestEndpoint = candidates[0];
        if (bestEndpoint == null) {
            throw new Error("Internal error; no endpoint snippets were provided");
        }
        let bestLength = this.getSnippetTextLength(bestEndpoint);

        for (let i = 1; i < candidates.length; i++) {
            const candidate = candidates[i];
            if (candidate == null) {
                continue;
            }
            const length = this.getSnippetTextLength(candidate);
            if (length < bestLength) {
                bestEndpoint = candidate;
                bestLength = length;
            }
        }

        if (bestEndpoint.id.identifierOverride == null) {
            throw new Error("Internal error; all endpoints must define an endpoint id to generate README.md");
        }
        return bestEndpoint.id.identifierOverride;
    }

    /**
     * Get the text length of a snippet for comparison purposes.
     * Shorter snippets generally make better README examples.
     */
    private getSnippetTextLength(endpoint: FernGeneratorExec.Endpoint): number {
        const snippet = endpoint.snippet as Record<string, unknown>;
        const text = (snippet.client ?? snippet.syncClient ?? "") as string;
        return text.length;
    }

    /**
     * Get the feature key for a given feature id. This key is (optionally) specified in
     * the user's generator configuration to customize specific README.md sections.
     */
    public getFeatureKey(featureId: string): string {
        return camelCase(featureId);
    }
}
