import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { Code, code } from "ts-poet";

import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { isNonNullish } from "@fern-api/core-utils";

import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId, FernFilepath, HttpEndpoint, SdkRequestWrapper } from "@fern-fern/ir-sdk/api";

interface EndpointWithFilepath {
    endpoint: HttpEndpoint;
    fernFilepath: FernFilepath;
}

interface EndpointWithRequest {
    endpoint: HttpEndpoint;
    requestWrapper: SdkRequestWrapper;
}

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static ABORTING_REQUESTS_FEATURE_ID: FernGeneratorCli.FeatureId = "ABORTING_REQUESTS";
    private static EXCEPTION_HANDLING_FEATURE_ID: FernGeneratorCli.FeatureId = "EXCEPTION_HANDLING";
    private static REQUEST_AND_RESPONSE_TYPES_FEATURE_ID: FernGeneratorCli.FeatureId = "REQUEST_AND_RESPONSE_TYPES";
    private static RUNTIME_COMPATIBILITY_FEATURE_ID: FernGeneratorCli.FeatureId = "RUNTIME_COMPATIBILITY";
    private static STREAMING_FEATURE_ID: FernGeneratorCli.FeatureId = "STREAMING";
    private static PAGINATION_FEATURE_ID: FernGeneratorCli.FeatureId = "PAGINATION";
    private static RAW_RESPONSES_FEATURE_ID: FernGeneratorCli.FeatureId = "RAW_RESPONSES";
    private static ADDITIONAL_HEADERS_FEATURE_ID: FernGeneratorCli.FeatureId = "ADDITIONAL_HEADERS";

    private readonly context: SdkContext;
    private readonly isPaginationEnabled: boolean;
    private readonly endpoints: Record<EndpointId, EndpointWithFilepath> = {};
    private readonly snippets: Record<EndpointId, string> = {};
    private readonly defaultEndpointId: EndpointId;
    private readonly rootPackageName: string;
    private readonly rootClientConstructorName: string;
    private readonly clientVariableName: string;
    private readonly genericAPISdkErrorName: string;

    constructor({
        context,
        endpointSnippets
    }: {
        context: SdkContext;
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
        this.rootClientConstructorName = this.getRootClientConstructorName();
        this.clientVariableName = this.getClientVariableName();
        this.genericAPISdkErrorName = this.getGenericApiSdkErrorName();
    }

    public buildReadmeSnippets(): Record<FernGeneratorCli.FeatureId, string[]> {
        const snippets: Record<FernGeneratorCli.FeatureId, string[]> = {};
        snippets[FernGeneratorCli.StructuredFeatureId.Usage] = this.buildUsageSnippets();
        snippets[FernGeneratorCli.StructuredFeatureId.Retries] = this.buildRetrySnippets();
        snippets[FernGeneratorCli.StructuredFeatureId.Timeouts] = this.buildTimeoutSnippets();

        snippets[ReadmeSnippetBuilder.ABORTING_REQUESTS_FEATURE_ID] = this.buildAbortSignalSnippets();
        snippets[ReadmeSnippetBuilder.EXCEPTION_HANDLING_FEATURE_ID] = this.buildExceptionHandlingSnippets();
        snippets[ReadmeSnippetBuilder.RUNTIME_COMPATIBILITY_FEATURE_ID] = this.buildRuntimeCompatibilitySnippets();
        snippets[ReadmeSnippetBuilder.STREAMING_FEATURE_ID] = this.buildStreamingSnippets();
        snippets[ReadmeSnippetBuilder.RAW_RESPONSES_FEATURE_ID] = this.buildRawResponseSnippets();
        snippets[ReadmeSnippetBuilder.ADDITIONAL_HEADERS_FEATURE_ID] = this.buildAdditionalHeadersSnippets();

        if (this.isPaginationEnabled) {
            snippets[FernGeneratorCli.StructuredFeatureId.Pagination] = this.buildPaginationSnippets();
        }

        const requestAndResponseTypesSnippets = this.buildRequestAndResponseTypesSnippets();
        if (requestAndResponseTypesSnippets != null) {
            snippets[ReadmeSnippetBuilder.REQUEST_AND_RESPONSE_TYPES_FEATURE_ID] = requestAndResponseTypesSnippets;
        }

        return snippets;
    }

    private getExplicitlyConfiguredSnippets(featureId: FeatureId): string[] | undefined {
        const endpointIds = this.getEndpointIdsForFeature(featureId);
        if (endpointIds != null) {
            return endpointIds.map((endpointId) => this.getSnippetForEndpointId(endpointId)).filter(isNonNullish);
        }
        return undefined;
    }

    private buildStreamingSnippets(): string[] {
        const explicitlyConfigured = this.getExplicitlyConfiguredSnippets(
            FernGeneratorCli.StructuredFeatureId.Streaming
        );
        if (explicitlyConfigured != null) {
            return explicitlyConfigured;
        }
        const streamingEndpoint = this.getEndpointWithStreaming();
        if (streamingEndpoint != null) {
            const snippet = this.getSnippetForEndpointId(streamingEndpoint.endpoint.id);
            return snippet != null ? [snippet] : [];
        }
        return [];
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

    private buildUsageSnippets(): string[] {
        const explicitlyConfigured = this.getExplicitlyConfiguredSnippets(FernGeneratorCli.StructuredFeatureId.Usage);
        if (explicitlyConfigured != null) {
            return explicitlyConfigured;
        }
        return [this.getSnippetForEndpointIdOrThrow(this.defaultEndpointId)];
    }

    private buildExceptionHandlingSnippets(): string[] {
        const exceptionHandlingEndpoints = this.getEndpointsForFeature(
            ReadmeSnippetBuilder.EXCEPTION_HANDLING_FEATURE_ID
        );
        return exceptionHandlingEndpoints.map((exceptionHandlingEndpoint) =>
            this.writeCode(
                code`
import { ${this.genericAPISdkErrorName} } from "${this.rootPackageName}";

try {
    await ${this.getMethodCall(exceptionHandlingEndpoint)}(...);
} catch (err) {
    if (err instanceof ${this.genericAPISdkErrorName}) {
        console.log(err.statusCode);
        console.log(err.message);
        console.log(err.body);
    }
}
`
            )
        );
    }

    private buildRequestAndResponseTypesSnippets(): string[] | undefined {
        const endpointWithRequest = this.getEndpointWithRequest();
        if (endpointWithRequest == null) {
            // There aren't any endpoints with in-lined request types, so we skip
            // this section altogether.
            return undefined;
        }
        const requestTypeName = `${this.context.namespaceExport}.${endpointWithRequest.requestWrapper.wrapperName.pascalCase.unsafeName}`;
        return [
            this.writeCode(
                code`
import { ${this.context.namespaceExport} } from "${this.rootPackageName}";

const request: ${requestTypeName} = {
    ...
};
`
            )
        ];
    }

    private buildRawResponseSnippets(): string[] {
        const rawResponseEndpoints = this.getEndpointsForFeature(ReadmeSnippetBuilder.RAW_RESPONSES_FEATURE_ID);
        return rawResponseEndpoints.map((rawResponseEndpoint) =>
            this.writeCode(
                code`
const response = await ${this.getMethodCall(rawResponseEndpoint)}(...).asRaw();

console.log(response.headers['X-My-Header']);
console.log(response.body);
`
            )
        );
    }

    private buildAdditionalHeadersSnippets(): string[] {
        const headerEndpoints = this.getEndpointsForFeature(ReadmeSnippetBuilder.ADDITIONAL_HEADERS_FEATURE_ID);
        return headerEndpoints.map((headerEndpoint) =>
            this.writeCode(
                code`
const response = await ${this.getMethodCall(headerEndpoint)}(..., {
    headers: {
        'X-Custom-Header': 'custom value'
    }
});
`
            )
        );
    }

    private buildRetrySnippets(): string[] {
        const retryEndpoints = this.getEndpointsForFeature(FernGeneratorCli.StructuredFeatureId.Retries);
        return retryEndpoints.map((retryEndpoint) =>
            this.writeCode(
                code`
const response = await ${this.getMethodCall(retryEndpoint)}(..., {
    maxRetries: 0 // override maxRetries at the request level
});
`
            )
        );
    }

    private buildTimeoutSnippets(): string[] {
        const timeoutEndpoints = this.getEndpointsForFeature(FernGeneratorCli.StructuredFeatureId.Timeouts);
        return timeoutEndpoints.map((timeoutEndpoint) =>
            this.writeCode(
                code`
const response = await ${this.getMethodCall(timeoutEndpoint)}(..., {
    timeoutInSeconds: 30 // override timeout to 30s
});
`
            )
        );
    }

    private buildAbortSignalSnippets(): string[] {
        const abortSignalEndpoints = this.getEndpointsForFeature(ReadmeSnippetBuilder.ABORTING_REQUESTS_FEATURE_ID);
        return abortSignalEndpoints.map((abortSignalEndpoint) =>
            this.writeCode(
                code`
const controller = new AbortController();
const response = await ${this.getMethodCall(abortSignalEndpoint)}(..., {
    abortSignal: controller.signal
});
controller.abort(); // aborts the request
`
            )
        );
    }

    private buildRuntimeCompatibilitySnippets(): string[] {
        const snippet = this.writeCode(
            code`
import { ${this.rootClientConstructorName} } from "${this.rootPackageName}";

const ${this.clientVariableName} = new ${this.rootClientConstructorName}({
    ...
    fetcher: // provide your implementation here
});
`
        );
        return [snippet];
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

    private getSnippetForEndpointIdOrThrow(endpointId: EndpointId): string {
        const snippet = this.getSnippetForEndpointId(endpointId);
        if (snippet == null) {
            throw new Error(`Internal error; missing snippet for endpoint ${endpointId}`);
        }
        return snippet;
    }

    private getSnippetForEndpointId(endpointId: EndpointId): string | undefined {
        return this.snippets[endpointId];
    }

    private getEndpointWithPagination(): EndpointWithFilepath | undefined {
        return this.filterEndpoint((endpointWithFilepath) => {
            if (endpointWithFilepath.endpoint.pagination != null) {
                return endpointWithFilepath;
            }
            return undefined;
        });
    }

    private getEndpointWithStreaming(): EndpointWithFilepath | undefined {
        return this.filterEndpoint((endpointWithFilepath) => {
            if (endpointWithFilepath.endpoint.response?.body?.type === "streaming") {
                return endpointWithFilepath;
            }
            return undefined;
        });
    }

    private getEndpointWithRequest(): EndpointWithRequest | undefined {
        return this.filterEndpoint((endpointWithFilepath) => {
            if (endpointWithFilepath.endpoint.sdkRequest?.shape?.type === "wrapper") {
                return {
                    endpoint: endpointWithFilepath.endpoint,
                    requestWrapper: endpointWithFilepath.endpoint.sdkRequest.shape
                };
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

    private getEndpointSnippetString(endpoint: FernGeneratorExec.Endpoint): string {
        if (endpoint.snippet.type !== "typescript") {
            throw new Error(`Internal error; expected TypeScript snippet but got: ${endpoint.snippet.type}`);
        }
        return endpoint.snippet.client;
    }

    private getRootPackageName(): string {
        const packageName = this.context.npmPackage?.packageName;
        if (packageName == null || packageName.length === 0) {
            return this.context.namespaceExport;
        }
        return packageName;
    }

    private getRootClientConstructorName(): string {
        return getTextOfTsNode(this.context.sdkClientClass.getReferenceToClientClass({ isRoot: true }).getTypeNode());
    }

    private getClientVariableName(): string {
        return getTextOfTsNode(this.context.sdkInstanceReferenceForSnippet);
    }

    private getGenericApiSdkErrorName(): string {
        const errorName = getTextOfTsNode(
            this.context.genericAPISdkError.getReferenceToGenericAPISdkError().getEntityName()
        );
        const split = errorName.split(".");
        return split[1] ?? errorName;
    }

    private getMethodCall(endpoint: EndpointWithFilepath): string {
        return `${this.getAccessFromRootClient(endpoint.fernFilepath)}.${this.getEndpointMethodName(
            endpoint.endpoint
        )}`;
    }

    private getAccessFromRootClient(fernFilepath: FernFilepath): string {
        const clientAccessParts = fernFilepath.allParts.map((part) => part.camelCase.unsafeName);
        return clientAccessParts.length > 0
            ? `${this.clientVariableName}.${clientAccessParts.join(".")}`
            : this.clientVariableName;
    }

    private getEndpointMethodName(endpoint: HttpEndpoint): string {
        return endpoint.name.camelCase.unsafeName;
    }

    private writeCode(code: Code): string {
        return code.toString({ dprintOptions: { indentWidth: 4 } }).trim() + "\n";
    }
}
