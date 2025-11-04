import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { isNonNullish } from "@fern-api/core-utils";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId, FernFilepath, HttpEndpoint, SdkRequestWrapper } from "@fern-fern/ir-sdk/api";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { readFileSync } from "fs";
import { template } from "lodash-es";
import { join } from "path";
import { Code, code } from "ts-poet";

interface EndpointWithFilepath {
    endpoint: HttpEndpoint;
    fernFilepath: FernFilepath;
}

interface EndpointWithRequest {
    endpoint: HttpEndpoint;
    requestWrapper: SdkRequestWrapper;
}

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static readonly ABORTING_REQUESTS_FEATURE_ID: FernGeneratorCli.FeatureId = "ABORTING_REQUESTS";
    private static readonly EXCEPTION_HANDLING_FEATURE_ID: FernGeneratorCli.FeatureId = "EXCEPTION_HANDLING";
    private static readonly REQUEST_AND_RESPONSE_TYPES_FEATURE_ID: FernGeneratorCli.FeatureId =
        "REQUEST_AND_RESPONSE_TYPES";
    private static readonly RUNTIME_COMPATIBILITY_FEATURE_ID: FernGeneratorCli.FeatureId = "RUNTIME_COMPATIBILITY";
    private static readonly PAGINATION_FEATURE_ID: FernGeneratorCli.FeatureId = "PAGINATION";
    private static readonly RAW_RESPONSES_FEATURE_ID: FernGeneratorCli.FeatureId = "ACCESS_RAW_RESPONSE_DATA";
    private static readonly ADDITIONAL_HEADERS_FEATURE_ID: FernGeneratorCli.FeatureId = "ADDITIONAL_HEADERS";
    private static readonly ADDITIONAL_QUERY_STRING_PARAMETERS_FEATURE_ID: FernGeneratorCli.FeatureId =
        "ADDITIONAL_QUERY_STRING_PARAMETERS";
    public static readonly BINARY_RESPONSE_FEATURE_ID: FernGeneratorCli.FeatureId = "BINARY_RESPONSE";
    public static readonly FILE_UPLOAD_REQUEST_FEATURE_ID: FernGeneratorCli.FeatureId = "FILE_UPLOADS";
    public static readonly STREAMING_RESPONSE_FEATURE_ID: FernGeneratorCli.FeatureId = "STREAMING_RESPONSE";
    public static readonly LOGGING_FEATURE_ID: FernGeneratorCli.FeatureId = "LOGGING";

    private readonly context: SdkContext;
    private readonly isPaginationEnabled: boolean;
    private readonly endpoints: Record<EndpointId, EndpointWithFilepath> = {};
    private readonly snippets: Record<EndpointId, string> = {};
    private readonly defaultEndpointId: EndpointId;
    private readonly rootPackageName: string;
    private readonly rootClientConstructorName: string;
    private readonly clientVariableName: string;
    private readonly genericAPISdkErrorName: string;
    private readonly fileResponseType: "stream" | "binary-response";

    constructor({
        context,
        endpointSnippets,
        fileResponseType
    }: {
        context: SdkContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
        fileResponseType: "stream" | "binary-response";
    }) {
        super({ endpointSnippets });
        this.context = context;
        this.fileResponseType = fileResponseType;
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
        snippets[ReadmeSnippetBuilder.STREAMING_RESPONSE_FEATURE_ID] = this.buildStreamingSnippets();
        snippets[ReadmeSnippetBuilder.FILE_UPLOAD_REQUEST_FEATURE_ID] = this.buildFileUploadRequestSnippet();
        snippets[ReadmeSnippetBuilder.BINARY_RESPONSE_FEATURE_ID] = this.buildBinaryResponseSnippet();
        snippets[ReadmeSnippetBuilder.RAW_RESPONSES_FEATURE_ID] = this.buildRawResponseSnippets();
        snippets[ReadmeSnippetBuilder.ADDITIONAL_HEADERS_FEATURE_ID] = this.buildAdditionalHeadersSnippets();
        snippets[ReadmeSnippetBuilder.ADDITIONAL_QUERY_STRING_PARAMETERS_FEATURE_ID] =
            this.buildAdditionalQueryStringParametersSnippets();
        snippets[ReadmeSnippetBuilder.LOGGING_FEATURE_ID] = this.buildLoggingSnippets();

        if (this.isPaginationEnabled) {
            snippets[FernGeneratorCli.StructuredFeatureId.Pagination] = this.buildPaginationSnippets();
        }

        const requestAndResponseTypesSnippets = this.buildRequestAndResponseTypesSnippets();
        if (requestAndResponseTypesSnippets != null) {
            snippets[ReadmeSnippetBuilder.REQUEST_AND_RESPONSE_TYPES_FEATURE_ID] = requestAndResponseTypesSnippets;
        }

        return snippets;
    }

    public buildReadmeAddendums(): Record<FernGeneratorCli.FeatureId, string> {
        const addendums: Record<FernGeneratorCli.FeatureId, string | undefined> = {};
        addendums[ReadmeSnippetBuilder.BINARY_RESPONSE_FEATURE_ID] = this.buildBinaryResponseAddendum();

        return Object.fromEntries(
            Object.entries(addendums).filter(([_, value]) => value != null) as [FernGeneratorCli.FeatureId, string][]
        );
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
        console.log(err.rawResponse);
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
const { data, rawResponse } = await ${this.getMethodCall(rawResponseEndpoint)}(...).withRawResponse();

console.log(data);
console.log(rawResponse.headers['X-My-Header']);
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

    private buildAdditionalQueryStringParametersSnippets(): string[] {
        const queryStringEndpoints = this.getEndpointsForFeature(
            ReadmeSnippetBuilder.ADDITIONAL_QUERY_STRING_PARAMETERS_FEATURE_ID
        );
        return queryStringEndpoints.map((queryStringEndpoint) =>
            this.writeCode(
                code`
const response = await ${this.getMethodCall(queryStringEndpoint)}(..., {
    queryParams: {
        'customQueryParamKey': 'custom query param value'
    }
});
`
            )
        );
    }

    private buildFileUploadRequestSnippet(): string[] {
        const fileUploadEndpoints = Object.values(this.context.ir.services).flatMap((service) =>
            service.endpoints
                .filter((endpoint) => {
                    if (endpoint.requestBody == null) {
                        return false;
                    }
                    if (endpoint.requestBody.type === "bytes") {
                        return true;
                    }
                    if (
                        endpoint.requestBody.type === "fileUpload" &&
                        endpoint.requestBody.properties.some((property) => property.type === "file")
                    ) {
                        return true;
                    }
                    return false;
                })
                .map((endpoint) => ({
                    endpoint,
                    fernFilepath: service.name.fernFilepath
                }))
        );
        for (const fileUploadEndpoint of fileUploadEndpoints) {
            if (fileUploadEndpoint.endpoint.requestBody?.type === "bytes") {
                return [
                    this.writeCode(
                        code`
import { createReadStream } from "fs";

await ${this.getMethodCall(fileUploadEndpoint)}(createReadStream("path/to/file"), ...);
await ${this.getMethodCall(fileUploadEndpoint)}(new ReadableStream(), ...);
await ${this.getMethodCall(fileUploadEndpoint)}(Buffer.from('binary data'), ...);
await ${this.getMethodCall(fileUploadEndpoint)}(new Blob(['binary data'], { type: 'audio/mpeg' }), ...);
await ${this.getMethodCall(fileUploadEndpoint)}(new File(['binary data'], 'file.mp3'), ...);
await ${this.getMethodCall(fileUploadEndpoint)}(new ArrayBuffer(8), ...);
await ${this.getMethodCall(fileUploadEndpoint)}(new Uint8Array([0, 1, 2]), ...);
                `
                    )
                ];
            }

            const snippet = this.getSnippetForEndpointId(fileUploadEndpoint.endpoint.id);
            if (snippet != null) {
                return [snippet];
            }
        }
        return [];
    }

    private buildBinaryResponseSnippet(): string[] {
        if (this.fileResponseType !== "binary-response") {
            return [];
        }

        const binaryResponseEndpoints = Object.values(this.context.ir.services).flatMap((service) =>
            service.endpoints
                .filter(
                    (endpoint) =>
                        endpoint.response?.body?.type === "fileDownload" || endpoint.response?.body?.type === "bytes"
                )
                .map((endpoint) => ({
                    endpoint,
                    fernFilepath: service.name.fernFilepath
                }))
        );
        if (binaryResponseEndpoints.length === 0) {
            return [];
        }
        const binaryResponseEndpoint = binaryResponseEndpoints[0] as EndpointWithFilepath;
        return [
            this.writeCode(
                code`
const response = await ${this.getMethodCall(binaryResponseEndpoint)}(...);
const stream: ReadableStream<Uint8Array> = response.stream();
// const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
// const blob: Blob = response.blob();
// const bytes: Uint8Array = response.bytes();
// You can only use the response body once, so you must choose one of the above methods.
// If you want to check if the response body has been used, you can use the following property.
const bodyUsed = response.bodyUsed;
`
            )
        ];
    }

    private buildBinaryResponseAddendum(): string | undefined {
        if (this.fileResponseType !== "binary-response") {
            return undefined;
        }

        const binaryResponseEndpoints = Object.values(this.context.ir.services).flatMap((service) =>
            service.endpoints
                .filter(
                    (endpoint) =>
                        endpoint.response?.body?.type === "fileDownload" || endpoint.response?.body?.type === "bytes"
                )
                .map((endpoint) => ({
                    endpoint,
                    fernFilepath: service.name.fernFilepath
                }))
        );
        if (binaryResponseEndpoints.length === 0) {
            return undefined;
        }
        const binaryResponseEndpoint = binaryResponseEndpoints[0] as EndpointWithFilepath;

        const templateFile = readFileSync(join(__dirname, "assets/readme/binary-response-addendum.md"), "utf-8");
        const compileTemplate = template(templateFile);
        return compileTemplate({
            snippet: this.writeCode(code`const response = await ${this.getMethodCall(binaryResponseEndpoint)}(...);`)
        });
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

    private buildLoggingSnippets(): string[] {
        return [
            this.writeCode(
                code`
import { ${this.rootClientConstructorName}, logging } from "${this.rootPackageName}";

const ${this.clientVariableName} = new ${this.rootClientConstructorName}({
    ...
    logging: {
        level: logging.LogLevel.Debug, // defaults to logging.LogLevel.Info
        logger: new logging.ConsoleLogger(), // defaults to ConsoleLogger
        silent: false, // defaults to true, set to false to enable logging
    }
});
`
            )
        ];
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
        return `${this.getAccessFromRootClient(endpoint.fernFilepath)}.${this.getEndpointMethodName(endpoint.endpoint)}`;
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
