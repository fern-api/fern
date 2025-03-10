import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId, FernFilepath, HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

interface EndpointWithFilepath {
    endpoint: HttpEndpoint;
    fernFilepath: FernFilepath;
}

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static CLIENT_VARIABLE_NAME = "client";

    private readonly context: SdkGeneratorContext;
    private readonly endpoints: Record<EndpointId, EndpointWithFilepath> = {};
    private readonly snippets: Record<EndpointId, string> = {};
    private readonly defaultEndpointId: EndpointId;
    private readonly rootPackageName: string;
    private readonly isPaginationEnabled: boolean;

    constructor({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }) {
        super({ endpointSnippets });
        this.context = context;

        this.isPaginationEnabled = context.config.generatePaginatedClients ?? false;
        this.endpoints = this.buildEndpoints();
        this.snippets = this.buildSnippets(endpointSnippets);
        this.defaultEndpointId =
            this.context.ir.readmeConfig?.defaultEndpoint != null
                ? this.context.ir.readmeConfig.defaultEndpoint
                : this.getDefaultEndpointId();
        this.rootPackageName = this.getRootPackageName();
    }

    public buildReadmeSnippets(): Record<FernGeneratorCli.FeatureId, string[]> {
        const snippets: Record<FernGeneratorCli.FeatureId, string[]> = {};
        // TODO: The usage section will be a full snippet. As of 11-Mar-25, our intention
        // is to generate this using dynamic snippets. However, the go generator is using
        // IR v53, which doesn't include the endpoint examples needed to generate
        // dynamic snippets. Therefore, for the time being, the usage section is omitted.
        // snippets[FernGeneratorCli.StructuredFeatureId.Usage] = this.buildUsageSnippets();
        snippets[FernGeneratorCli.StructuredFeatureId.Retries] = this.buildRetrySnippets();
        snippets[FernGeneratorCli.StructuredFeatureId.Timeouts] = this.buildTimeoutSnippets();
        return snippets;
    }

    private buildUsageSnippets(): string[] {
        const usageEndpointIds = this.getEndpointIdsForFeature(FernGeneratorCli.StructuredFeatureId.Usage);
        if (usageEndpointIds != null) {
            return usageEndpointIds.map((endpointId) => this.getSnippetForEndpointId(endpointId));
        }
        return [this.getSnippetForEndpointId(this.defaultEndpointId)];
    }

    private buildRetrySnippets(): string[] {
        const retryEndpoints = this.getEndpointsForFeature(FernGeneratorCli.StructuredFeatureId.Retries);
        return retryEndpoints.map((retryEndpoint) =>
            this.writeCode(`
${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME} := ${this.rootPackageName}.NewClient(
    option.WithMaxAttempts(1),
)

response, err := ${this.getMethodCall(retryEndpoint)}(
    ...,
    option.WithMaxAttempts(1),
)
`)
        );
    }

    private buildTimeoutSnippets(): string[] {
        const timeoutEndpoints = this.getEndpointsForFeature(FernGeneratorCli.StructuredFeatureId.Timeouts);
        return timeoutEndpoints.map((timeoutEndpoint) =>
            this.writeCode(`
ctx, cancel := context.WithTimeout(..., time.Second)
defer cancel()

response, err := ${this.getMethodCall(timeoutEndpoint)}(...)
`)
        );
    }

    private buildEndpoints(): Record<EndpointId, EndpointWithFilepath> {
        const endpoints: Record<EndpointId, EndpointWithFilepath> = {};
        for (const service of Object.values(this.context.ir.services)) {
            for (const endpoint of service.endpoints) {
                endpoints[endpoint.id] = {
                    endpoint,
                    fernFilepath: service.name.fernFilepath
                };
            }
        }
        return endpoints;
    }

    private buildSnippets(endpointSnippets: FernGeneratorExec.Endpoint[]): Record<EndpointId, string> {
        const snippets: Record<EndpointId, string> = {};
        for (const endpointSnippet of Object.values(endpointSnippets)) {
            if (endpointSnippet.id.identifierOverride == null) {
                throw new Error("Internal error; snippets must define the endpoint id to generate README.md");
            }
            snippets[endpointSnippet.id.identifierOverride] = this.getEndpointSnippetString(endpointSnippet);
        }
        return snippets;
    }

    private getSnippetForEndpointId(endpointId: EndpointId): string {
        const snippet = this.snippets[endpointId];
        if (snippet == null) {
            throw new Error(`Internal error; missing snippet for endpoint ${endpointId}`);
        }
        return snippet;
    }

    private getEndpointsForFeature(featureId: FeatureId): EndpointWithFilepath[] {
        const endpointIds = this.getEndpointIdsForFeature(featureId);
        return endpointIds != null ? this.getEndpoints(endpointIds) : this.getEndpoints([this.defaultEndpointId]);
    }

    private getEndpointIdsForFeature(featureId: FeatureId): EndpointId[] | undefined {
        return this.context.ir.readmeConfig?.features?.[this.getFeatureKey(featureId)];
    }

    private getEndpoints(endpointIds: EndpointId[]): EndpointWithFilepath[] {
        return endpointIds.map((endpointId) => {
            const endpoint = this.endpoints[endpointId];
            if (endpoint == null) {
                throw new Error(`Internal error; missing endpoint ${endpointId}`);
            }
            return endpoint;
        });
    }

    private getEndpointSnippetString(endpoint: FernGeneratorExec.Endpoint): string {
        if (endpoint.snippet.type !== "go") {
            throw new Error(`Internal error; expected go snippet but got: ${endpoint.snippet.type}`);
        }
        return endpoint.snippet.client;
    }

    private getMethodCall(endpoint: EndpointWithFilepath): string {
        return `${this.getAccessFromRootClient(endpoint.fernFilepath)}.${this.getEndpointMethodName(
            endpoint.endpoint
        )}`;
    }

    private getAccessFromRootClient(fernFilepath: FernFilepath): string {
        const clientAccessParts = fernFilepath.allParts.map((part) => part.pascalCase.unsafeName);
        return clientAccessParts.length > 0
            ? `${ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME}.${clientAccessParts.join(".")}`
            : ReadmeSnippetBuilder.CLIENT_VARIABLE_NAME;
    }

    private getEndpointMethodName(endpoint: HttpEndpoint): string {
        return endpoint.name.pascalCase.unsafeName;
    }

    private getRootPackageName(): string {
        return `${this.context.config.organization}client`;
    }

    private writeCode(s: string): string {
        return s.trim() + "\n";
    }
}
