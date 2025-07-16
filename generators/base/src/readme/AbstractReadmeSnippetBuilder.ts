import { camelCase } from "lodash-es";

import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";

export abstract class AbstractReadmeSnippetBuilder {
    private endpointSnippets: FernGeneratorExec.Endpoint[];

    constructor({ endpointSnippets }: { endpointSnippets: FernGeneratorExec.Endpoint[] }) {
        this.endpointSnippets = endpointSnippets;
    }

    /**
     * Get the default endpoint that should be used in the generated README.md.
     * We prefer POST endpoints for better snippet quality, but if none are available,
     * we use the first endpoint.
     */
    public getDefaultEndpointId(): string {
        let defaultEndpoint = this.endpointSnippets.find((endpoint) => endpoint.id.method === "POST");
        if (defaultEndpoint == null) {
            const firstEndpoint = this.endpointSnippets[0];
            if (firstEndpoint == null) {
                throw new Error("Internal error; no endpoint snippets were provided");
            }
            defaultEndpoint = firstEndpoint;
        }
        if (defaultEndpoint.id.identifierOverride == null) {
            throw new Error("Internal error; all endpoints must define an endpoint id to generate README.md");
        }
        return defaultEndpoint.id.identifierOverride;
    }

    /**
     * Get the feature key for a given feature id. This key is (optionally) specified in
     * the user's generator configuration to customize specific README.md sections.
     */
    public getFeatureKey(featureId: string): string {
        return camelCase(featureId);
    }
}
