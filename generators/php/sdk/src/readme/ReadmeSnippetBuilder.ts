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
    private static EXCEPTION_HANDLING_FEATURE_ID: FernGeneratorCli.FeatureId = "EXCEPTION_HANDLING";

    private readonly context: SdkGeneratorContext;
    private readonly endpoints: Record<EndpointId, EndpointWithFilepath> = {};
    private readonly snippets: Record<EndpointId, string> = {};
    private readonly defaultEndpointId: EndpointId;
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
    }

    public buildReadmeSnippets(): Record<FernGeneratorCli.FeatureId, string[]> {
        const snippets: Record<FernGeneratorCli.FeatureId, string[]> = {};
        snippets[FernGeneratorCli.StructuredFeatureId.Usage] = this.buildUsageSnippets();
        snippets[FernGeneratorCli.StructuredFeatureId.Retries] = this.buildRetrySnippets();
        snippets[FernGeneratorCli.StructuredFeatureId.Timeouts] = this.buildTimeoutSnippets();
        snippets[ReadmeSnippetBuilder.EXCEPTION_HANDLING_FEATURE_ID] = this.buildExceptionHandlingSnippets();
        return snippets;
    }

    private buildUsageSnippets(): string[] {
        const usageEndpointIds = this.getEndpointIdsForFeature(FernGeneratorCli.StructuredFeatureId.Usage);
        if (usageEndpointIds != null) {
            return usageEndpointIds.map((endpointId) => this.getSnippetForEndpointId(endpointId));
        }
        return [this.getSnippetForEndpointId(this.defaultEndpointId)];
    }

    private buildExceptionHandlingSnippets(): string[] {
        const exceptionHandlingEndpoints = this.getEndpointsForFeature(
            ReadmeSnippetBuilder.EXCEPTION_HANDLING_FEATURE_ID
        );
        return exceptionHandlingEndpoints.map((exceptionHandlingEndpoint) =>
            this.writeCode(`
use ${this.context.getRootNamespace()}\\Exceptions\\${this.context.getBaseApiExceptionClassReference().name};
use ${this.context.getRootNamespace()}\\Exceptions\\${this.context.getBaseExceptionClassReference().name};

try {
    $response = ${this.getMethodCall(exceptionHandlingEndpoint)}(...);
} catch (${this.context.getBaseApiExceptionClassReference().name} $e) {
    echo 'API Exception occurred: ' . $e->getMessage() . "\\n";
    echo 'Status Code: ' . $e->getCode() . "\\n"; 
    echo 'Response Body: ' . $e->getBody() . "\\n";
    // Optionally, rethrow the exception or handle accordingly.
}
`)
        );
    }

    private buildRetrySnippets(): string[] {
        const retryEndpoints = this.getEndpointsForFeature(FernGeneratorCli.StructuredFeatureId.Retries);
        return retryEndpoints.map((retryEndpoint) =>
            this.writeCode(`
$response = ${this.getMethodCall(retryEndpoint)}(
    ...,
    options: [
        'maxRetries' => 0 // Override maxRetries at the request level
    ]
);
`)
        );
    }

    private buildTimeoutSnippets(): string[] {
        const timeoutEndpoints = this.getEndpointsForFeature(FernGeneratorCli.StructuredFeatureId.Timeouts);
        return timeoutEndpoints.map((timeoutEndpoint) =>
            this.writeCode(`
$response = ${this.getMethodCall(timeoutEndpoint)}(
    ...,
    options: [
        'timeout' => 3.0 // Override timeout to 3 seconds
    ]
);
`)
        );
    }

    private buildPaginationSnippets(): string[] {
        const explicitlyConfigured = this.getExplicitlyConfiguredSnippets(
            FernGeneratorCli.StructuredFeatureId.Pagination
        );
        if (explicitlyConfigured != null) {
            return explicitlyConfigured;
        }
        const paginationEndpoint = this.getEndpointWithPagination();
        if (paginationEndpoint != null) {
            const snippet = this.getSnippetForEndpointId(paginationEndpoint.endpoint.id);
            return snippet != null ? [snippet] : [];
        }
        return [];
    }

    private getEndpointWithPagination(): EndpointWithFilepath | undefined {
        return this.filterEndpoint((endpointWithFilepath) => {
            if (endpointWithFilepath.endpoint.pagination != null) {
                return endpointWithFilepath;
            }
            return undefined;
        });
    }

    private filterEndpoint<T>(transform: (endpoint: EndpointWithFilepath) => T | undefined): T | undefined {
        for (const endpointWithFilepath of Object.values(this.endpoints)) {
            const result = transform(endpointWithFilepath);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    private getExplicitlyConfiguredSnippets(featureId: FeatureId): string[] | undefined {
        const endpointIds = this.getEndpointIdsForFeature(featureId);
        if (endpointIds != null) {
            return endpointIds.map((endpointId) => this.getSnippetForEndpointId(endpointId)).filter((e) => e != null);
        }
        return undefined;
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
        // Note: this is a shim since php snippets are not supported yet in FernGeneratorExec
        if (endpoint.snippet.type !== "java") {
            throw new Error(`Internal error; expected csharp snippet but got: ${endpoint.snippet.type}`);
        }
        return endpoint.snippet.syncClient;
    }

    private getMethodCall(endpoint: EndpointWithFilepath): string {
        return `${this.context.getAccessFromRootClient(endpoint.fernFilepath)}->${this.context.getEndpointMethodName(
            endpoint.endpoint
        )}`;
    }

    private writeCode(s: string): string {
        return s.trim() + "\n";
    }
}
