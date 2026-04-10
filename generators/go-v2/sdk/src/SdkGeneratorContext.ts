import { GeneratorNotificationService, NameInput } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { AbstractGoGeneratorContext, AsIsFiles, FileLocation } from "@fern-api/go-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { getInferredAuthScheme, getOAuthClientCredentialsScheme } from "./authUtils.js";
import { EndpointGenerator } from "./endpoint/EndpointGenerator.js";
import { getEndpointPageReturnType } from "./endpoint/utils/getEndpointPageReturnType.js";
import { GoGeneratorAgent } from "./GoGeneratorAgent.js";
import { Caller } from "./internal/Caller.js";
import { Streamer } from "./internal/Streamer.js";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder.js";
import { EndpointSnippetsGenerator } from "./reference/EndpointSnippetsGenerator.js";
import { SdkCustomConfigSchema } from "./SdkCustomConfig.js";

export class SdkGeneratorContext extends AbstractGoGeneratorContext<SdkCustomConfigSchema> {
    public readonly caller: Caller;
    public readonly streamer: Streamer;
    public readonly endpointGenerator: EndpointGenerator;
    public readonly generatorAgent: GoGeneratorAgent;
    public readonly snippetGenerator: EndpointSnippetsGenerator;

    public constructor(
        public readonly ir: FernIr.IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.endpointGenerator = new EndpointGenerator(this);
        this.snippetGenerator = new EndpointSnippetsGenerator({ context: this });
        this.caller = new Caller(this);
        this.streamer = new Streamer(this);
        this.generatorAgent = new GoGeneratorAgent({
            logger: this.logger,
            config: this.config,
            readmeConfigBuilder: new ReadmeConfigBuilder(),
            publishConfig: this.ir.publishConfig,
            ir
        });
    }

    public getInternalAsIsFiles(): string[] {
        return [];
    }

    public getCoreAsIsFiles(): string[] {
        const files = [];

        if (this.needsPaginationHelpers()) {
            files.push(AsIsFiles.Page);
        }

        if (this.customConfig.customPagerName != null) {
            files.push(AsIsFiles.CustomPagination);
        }

        if (this.ir.sdkConfig.hasStreamingEndpoints) {
            files.push(AsIsFiles.Stream, AsIsFiles.StreamTest);
        }

        if (getOAuthClientCredentialsScheme(this.ir) != null || getInferredAuthScheme(this.ir) != null) {
            files.push(AsIsFiles.TokenProvider);
        }

        return files;
    }

    public getRootAsIsFiles(): string[] {
        const files = [
            AsIsFiles.ErrorDecoder,
            AsIsFiles.ErrorDecoderTest,
            AsIsFiles.Caller,
            AsIsFiles.CallerTest,
            AsIsFiles.Retrier,
            AsIsFiles.RetrierTest
        ];

        if (this.needsPaginationHelpers()) {
            files.push(AsIsFiles.Pager, AsIsFiles.PagerTest);
        }

        if (this.ir.sdkConfig.hasStreamingEndpoints) {
            files.push(AsIsFiles.Streamer);
        }

        return files;
    }

    public getClientClassName(subpackage?: FernIr.Subpackage): string {
        if (subpackage == null && this.customConfig.clientName != null) {
            return this.customConfig.clientName;
        }
        return "Client";
    }

    public getClientConstructorName(subpackage?: FernIr.Subpackage): string {
        if (subpackage == null) {
            if (this.customConfig.clientConstructorName != null) {
                return this.customConfig.clientConstructorName;
            }
            if (this.customConfig.clientName != null) {
                return `New${this.customConfig.clientName}`;
            }
        }
        return "NewClient";
    }

    public getClientFilename(subpackage?: FernIr.Subpackage): string {
        return "client.go";
    }

    public getRawClientConstructorName(subpackage?: FernIr.Subpackage): string {
        return `New${this.getRawClientClassName(subpackage)}`;
    }

    public getRawClientClassName(subpackage?: FernIr.Subpackage): string {
        if (subpackage != null) {
            return "RawClient";
        }
        return `Raw${this.getClientClassName()}`;
    }

    public getRawClientFilename(subpackage?: FernIr.Subpackage): string {
        return "raw_client.go";
    }

    public getMethodName(name: NameInput): string {
        return this.caseConverter.pascalUnsafe(name);
    }

    public getReceiverName(name: NameInput): string {
        return this.caseConverter.camelUnsafe(name).charAt(0);
    }

    public getRootClientReceiverName(): string {
        if (this.customConfig.clientName != null) {
            return this.customConfig.clientName.charAt(0).toLowerCase();
        }
        return "c";
    }

    public getDefaultBaseUrlTypeInstantiation(endpoint: FernIr.HttpEndpoint): go.TypeInstantiation {
        const defaultBaseUrl = this.getDefaultBaseUrl(endpoint);
        if (defaultBaseUrl == null) {
            return go.TypeInstantiation.string("");
        }
        return go.TypeInstantiation.string(defaultBaseUrl);
    }

    public getDefaultBaseUrl(endpoint: FernIr.HttpEndpoint): FernIr.EnvironmentUrl | undefined {
        if (endpoint.baseUrl != null) {
            return this.getEnvironmentUrlFromId(endpoint.baseUrl);
        }
        if (this.ir.environments?.defaultEnvironment != null) {
            return this.getEnvironmentUrlFromId(this.ir.environments.defaultEnvironment);
        }
        return undefined;
    }

    public getEnvironmentUrlFromId(id: FernIr.EnvironmentId): FernIr.EnvironmentUrl | undefined {
        if (this.ir.environments == null) {
            return undefined;
        }
        const environments = this.ir.environments.environments;
        switch (environments.type) {
            case "singleBaseUrl":
                return environments.environments.find((environment) => environment.id === id)?.url;
            case "multipleBaseUrls": {
                for (const environment of environments.environments) {
                    const url = environment.urls[id];
                    if (url != null) {
                        return url;
                    }
                }
                return undefined;
            }
            default:
                assertNever(environments);
        }
    }

    public isMultipleBaseUrlsEnvironment(): boolean {
        return this.ir.environments?.environments.type === "multipleBaseUrls";
    }

    public getBaseUrlNameForEndpoint(endpoint: FernIr.HttpEndpoint): string | undefined {
        if (!this.isMultipleBaseUrlsEnvironment() || this.ir.environments == null) {
            return undefined;
        }
        const baseUrlId = endpoint.baseUrl;
        if (baseUrlId == null) {
            return undefined;
        }
        const environments = this.ir.environments.environments;
        if (environments.type !== "multipleBaseUrls") {
            return undefined;
        }
        for (const baseUrl of environments.baseUrls) {
            if (baseUrl.id === baseUrlId) {
                return this.caseConverter.pascalUnsafe(baseUrl.name);
            }
        }
        return undefined;
    }

    public callResolveEnvironmentBaseURL(arguments_: go.AstNode[]): go.FuncInvocation {
        return this.callInternalFunc({ name: "ResolveEnvironmentBaseURL", arguments_ });
    }

    public getRootClientDirectory(): RelativeFilePath {
        return RelativeFilePath.of(this.getRootClientPackageName());
    }

    public getRootClientImportPath(): string {
        return `${this.getRootImportPath()}/${this.getRootClientPackageName()}`;
    }

    public getRootClientPackageName(): string {
        return "client";
    }

    public getRootClientClassReference(): go.TypeReference {
        return go.typeReference({
            name: this.getClientClassName(),
            importPath: this.getRootClientImportPath()
        });
    }

    public getRootRawClientClassReference(): go.TypeReference {
        return go.typeReference({
            name: this.getRawClientClassName(),
            importPath: this.getRootClientImportPath()
        });
    }

    public getClientClassReference({
        fernFilepath,
        subpackage
    }: {
        fernFilepath: FernIr.FernFilepath;
        subpackage?: FernIr.Subpackage;
    }): go.TypeReference {
        if (subpackage == null) {
            return this.getRootClientClassReference();
        }
        return go.typeReference({
            name: this.getClientClassName(subpackage),
            importPath: this.getClientFileLocation({ fernFilepath, subpackage }).importPath
        });
    }

    public getRawClientClassReference({
        fernFilepath,
        subpackage
    }: {
        fernFilepath: FernIr.FernFilepath;
        subpackage?: FernIr.Subpackage;
    }): go.TypeReference {
        if (subpackage == null) {
            return this.getRootRawClientClassReference();
        }
        return go.typeReference({
            name: this.getRawClientClassName(subpackage),
            importPath: this.getClientFileLocation({ fernFilepath, subpackage }).importPath
        });
    }

    public getClientPackageName({
        fernFilepath,
        subpackage
    }: {
        fernFilepath: FernIr.FernFilepath;
        subpackage?: FernIr.Subpackage;
    }): string {
        const fileLocation = this.getClientFileLocation({ fernFilepath, subpackage });
        if (fileLocation.importPath === this.getRootImportPath()) {
            return this.getRootPackageName();
        }
        return fileLocation.importPath.split("/").pop() ?? "";
    }

    public getClientFileLocation({
        fernFilepath,
        subpackage
    }: {
        fernFilepath: FernIr.FernFilepath;
        subpackage?: FernIr.Subpackage;
    }): FileLocation {
        return this.getFileLocationForClient({ fernFilepath, subpackage });
    }

    public getSubpackageClientField({
        fernFilepath,
        subpackage
    }: {
        fernFilepath: FernIr.FernFilepath;
        subpackage: FernIr.Subpackage;
    }): go.Field {
        return go.field({
            name: this.getClientClassName(subpackage),
            type: go.Type.reference(this.getClientClassReference({ fernFilepath, subpackage }))
        });
    }

    public getContextParameter(): go.Parameter {
        return go.parameter({
            name: "ctx",
            type: go.Type.reference(this.getContextTypeReference())
        });
    }

    public getContextParameterReference(): go.AstNode {
        return go.codeblock("ctx");
    }

    public getErrorCodesTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "ErrorCodes",
            importPath: this.getInternalImportPath()
        });
    }

    public getCoreApiErrorTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "APIError",
            importPath: this.getCoreImportPath()
        });
    }

    public getVariadicRequestOptionParameter(): go.Parameter {
        return go.parameter({
            name: "opts",
            type: this.getVariadicRequestOptionType()
        });
    }

    public getVariadicIdempotentRequestOptionParameter(): go.Parameter {
        return go.parameter({
            name: "opts",
            type: this.getVariadicIdempotentRequestOptionType()
        });
    }

    public getRequestOptionsType(): go.Type {
        return go.Type.pointer(go.Type.reference(this.getRequestOptionsTypeReference()));
    }

    public getVariadicRequestOptionType(): go.Type {
        return go.Type.variadic(go.Type.reference(this.getRequestOptionTypeReference()));
    }

    public getVariadicIdempotentRequestOptionType(): go.Type {
        return go.Type.variadic(go.Type.reference(this.getIdempotentRequestOptionTypeReference()));
    }

    public getRequestOptionsTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "RequestOptions",
            importPath: this.getCoreImportPath()
        });
    }

    public getRequestOptionsParameter(): go.Parameter {
        return go.parameter({
            name: "options",
            type: this.getRequestOptionsType()
        });
    }

    public getRequestOptionTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "RequestOption",
            importPath: this.getOptionImportPath()
        });
    }

    public getIdempotentRequestOptionTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "IdempotentRequestOption",
            importPath: this.getOptionImportPath()
        });
    }

    public getTestingTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "T",
            importPath: "testing"
        });
    }

    public callBytesNewBuffer(): go.FuncInvocation {
        return go.invokeFunc({
            func: go.typeReference({ name: "NewBuffer", importPath: "bytes" }),
            arguments_: [go.codeblock("nil")],
            multiline: false
        });
    }

    public callGetenv(env: string): go.FuncInvocation {
        return go.invokeFunc({
            func: go.typeReference({ name: "Getenv", importPath: "os" }),
            arguments_: [go.TypeInstantiation.string(env)],
            multiline: false
        });
    }

    public callNewRequestOptions(argument: go.AstNode): go.FuncInvocation {
        return go.invokeFunc({
            func: go.typeReference({
                name: "NewRequestOptions",
                importPath: this.getCoreImportPath()
            }),
            arguments_: [argument],
            multiline: false
        });
    }

    public callNewIdempotentRequestOptions(argument: go.AstNode): go.FuncInvocation {
        return go.invokeFunc({
            func: go.typeReference({
                name: "NewIdempotentRequestOptions",
                importPath: this.getCoreImportPath()
            }),
            arguments_: [argument],
            multiline: false
        });
    }

    public callSprintf(arguments_: go.AstNode[]): go.FuncInvocation {
        return go.invokeFunc({
            func: go.typeReference({
                name: "Sprintf",
                importPath: "fmt"
            }),
            arguments_,
            multiline: false
        });
    }

    public callEncodeUrl(arguments_: go.AstNode[]): go.FuncInvocation {
        return this.callInternalFunc({ name: "EncodeURL", arguments_ });
    }

    public callResolveBaseURL(arguments_: go.AstNode[]): go.FuncInvocation {
        return this.callInternalFunc({ name: "ResolveBaseURL", arguments_ });
    }

    public callMergeHeaders(arguments_: go.AstNode[]): go.FuncInvocation {
        return this.callInternalFunc({ name: "MergeHeaders", arguments_ });
    }

    public callNewErrorDecoder(arguments_: go.AstNode[]): go.FuncInvocation {
        return go.invokeFunc({
            func: go.typeReference({
                name: "NewErrorDecoder",
                importPath: this.getInternalImportPath()
            }),
            arguments_,
            multiline: false
        });
    }

    public getErrorCodesVariableReference(importPath?: string): go.TypeReference {
        return go.typeReference({
            name: "ErrorCodes",
            importPath: importPath ?? this.getRootImportPath()
        });
    }

    /**
     * Gets the import path for the namespace where error_codes.go is generated.
     * For subpackages, this is the package location based on the fernFilepath.
     * For the root package (when subpackage is undefined), this is the root import path.
     */
    public getNamespaceImportPath(subpackage: FernIr.Subpackage | undefined): string {
        if (subpackage == null) {
            return this.getRootImportPath();
        }
        return this.getPackageLocation(subpackage.fernFilepath).importPath;
    }

    public isPerEndpointErrorCodes(): boolean {
        return this.customConfig.errorCodes === "per-endpoint";
    }

    public callNewMultipartWriter(arguments_: go.AstNode[]): go.FuncInvocation {
        return this.callInternalFunc({ name: "NewMultipartWriter", arguments_, multiline: false });
    }

    public callWithDefaultContentType(contentType: string): go.FuncInvocation {
        return this.callInternalFunc({
            name: "WithDefaultContentType",
            arguments_: [go.TypeInstantiation.string(contentType)],
            multiline: false
        });
    }

    public callNewStreamer({
        arguments_,
        streamPayload
    }: {
        arguments_: go.AstNode[];
        streamPayload: go.Type;
    }): go.FuncInvocation {
        return this.callInternalFunc({ name: "NewStreamer", arguments_, generics: [streamPayload], multiline: false });
    }

    public callQueryValues(arguments_: go.AstNode[]): go.FuncInvocation {
        return this.callInternalFunc({ name: "QueryValues", arguments_, multiline: false });
    }

    public callQueryValuesWithDefaults(arguments_: go.AstNode[]): go.FuncInvocation {
        return this.callInternalFunc({ name: "QueryValuesWithDefaults", arguments_, multiline: true });
    }

    public getPageTypeReference(cursorType: go.Type, valueType: go.Type, responseType: go.Type): go.TypeReference {
        return go.typeReference({
            name: "Page",
            importPath: this.getCoreImportPath(),
            generics: [cursorType, valueType, responseType]
        });
    }

    public getRawResponseTypeReference(valueType: go.Type): go.TypeReference {
        return go.typeReference({
            name: "Response",
            importPath: this.getCoreImportPath(),
            generics: [valueType]
        });
    }

    public getStreamTypeReference(valueType: go.Type): go.TypeReference {
        return go.typeReference({
            name: "Stream",
            importPath: this.getCoreImportPath(),
            generics: [valueType]
        });
    }

    public getCustomPagerTypeReference(responseType: go.Type): go.TypeReference {
        const pagerName = this.customConfig.customPagerName ?? "CustomPager";
        return go.typeReference({
            name: pagerName,
            importPath: this.getCoreImportPath(),
            generics: [responseType]
        });
    }

    public isFileUploadEndpoint(endpoint: FernIr.HttpEndpoint): boolean {
        const requestBody = endpoint.requestBody;
        if (requestBody == null) {
            return false;
        }
        switch (requestBody.type) {
            case "inlinedRequestBody":
            case "reference":
            case "bytes":
                return false;
            case "fileUpload":
                return true;
            default:
                assertNever(requestBody);
        }
    }

    public isEnabledPaginationEndpoint(endpoint: FernIr.HttpEndpoint): boolean {
        if (this.isPaginationWithRequestBodyEndpoint(endpoint)) {
            // TODO: The original Go generator did not handle pagination endpoints with request body properties.
            // To preserve compatibility, we generate a delegating endpoint for these cases.
            //
            // We'll need to add an opt-in feature flag to resolve this gap.
            return false;
        }
        const pagination = this.getPagination(endpoint);
        if (pagination?.type === "custom" || pagination?.type === "uri" || pagination?.type === "path") {
            return false;
        }
        return this.isPaginationEndpoint(endpoint);
    }

    public isPaginationWithRequestBodyEndpoint(endpoint: FernIr.HttpEndpoint): boolean {
        const pagination = this.getPagination(endpoint);
        if (pagination == null) {
            return false;
        }
        switch (pagination.type) {
            case "cursor":
            case "offset":
                return pagination.page.property.type === "body";
            case "custom":
                return false;
            case "uri":
            case "path":
                return false;
            default:
                assertNever(pagination);
        }
    }

    public isPaginationEndpoint(endpoint: FernIr.HttpEndpoint): boolean {
        return this.getPagination(endpoint) != null;
    }

    public getPagination(endpoint: FernIr.HttpEndpoint): FernIr.Pagination | undefined {
        return endpoint.pagination;
    }

    public isStreamingEndpoint(endpoint: FernIr.HttpEndpoint): boolean {
        return this.getStreamingResponse(endpoint) != null;
    }

    public getStreamingResponse(endpoint: FernIr.HttpEndpoint): FernIr.StreamingResponse | undefined {
        const responseBody = endpoint.response?.body;
        if (responseBody == null) {
            return undefined;
        }
        switch (responseBody.type) {
            case "streaming":
                return responseBody.value;
            case "streamParameter":
                return responseBody.streamResponse;
            case "fileDownload":
            case "json":
            case "text":
            case "bytes":
                return undefined;
            default:
                assertNever(responseBody);
        }
    }

    public getStreamPayload(streamingResponse: FernIr.StreamingResponse): go.Type {
        switch (streamingResponse.type) {
            case "json":
            case "sse":
                return go.Type.dereference(this.goTypeMapper.convert({ reference: streamingResponse.payload }));
            case "text":
                return go.Type.string();
            default:
                assertNever(streamingResponse);
        }
    }

    public getRequestWrapperTypeReference(serviceId: FernIr.ServiceId, requestName: NameInput): go.TypeReference {
        return go.typeReference({
            name: this.getClassName(requestName),
            importPath: this.getLocationForWrappedRequest(serviceId).importPath
        });
    }

    public shouldSkipWrappedRequest({
        endpoint,
        wrapper
    }: {
        endpoint: FernIr.HttpEndpoint;
        wrapper: FernIr.SdkRequestWrapper;
    }): boolean {
        if (endpoint.sdkRequest == null) {
            return true;
        }
        if (this.includePathParametersInWrappedRequest({ endpoint, wrapper })) {
            return false;
        }
        if (endpoint.queryParameters.length > 0) {
            return false;
        }
        if (endpoint.headers.length > 0) {
            return false;
        }
        if (endpoint.requestBody != null) {
            const requestBody = endpoint.requestBody;
            switch (requestBody.type) {
                case "fileUpload":
                    return !this.fileUploadRequestHasProperties(requestBody);
                case "reference":
                case "inlinedRequestBody":
                case "bytes":
                    return false;
                default:
                    assertNever(requestBody);
            }
        }
        return (
            (wrapper.onlyPathParameters ?? false) && !this.includePathParametersInWrappedRequest({ endpoint, wrapper })
        );
    }

    public shouldGenerateSubpackageClient(subpackage: FernIr.Subpackage): boolean {
        if (subpackage.service != null) {
            return true;
        }
        return subpackage.subpackages.some((subpackageId) => {
            const nestedSubpackage = this.getSubpackageOrThrow(subpackageId);
            return nestedSubpackage.hasEndpointsInTree;
        });
    }

    public includePathParametersInWrappedRequest({
        endpoint,
        wrapper
    }: {
        endpoint: FernIr.HttpEndpoint;
        wrapper: FernIr.SdkRequestWrapper;
    }): boolean {
        const inlinePathParameters = this.customConfig.inlinePathParameters;
        if (inlinePathParameters == null) {
            return false;
        }
        const wrapperShouldIncludePathParameters = wrapper.includePathParameters ?? false;
        return endpoint.allPathParameters.length > 0 && inlinePathParameters && wrapperShouldIncludePathParameters;
    }

    private fileUploadRequestHasProperties(fileUploadRequest: FernIr.FileUploadRequest): boolean {
        if (this.customConfig.inlineFileProperties) {
            return true;
        }
        return fileUploadRequest.properties.some((property) => property.type === "bodyProperty");
    }

    public accessRequestProperty({
        requestParameterName,
        propertyName
    }: {
        requestParameterName: NameInput;
        propertyName: NameInput;
    }): string {
        const requestParameter = this.getParameterName(requestParameterName);
        return `${requestParameter}.${this.getFieldName(propertyName)}`;
    }

    public getNetHttpHeaderTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "Header",
            importPath: "net/http"
        });
    }

    public getNetHttpMethodTypeReference(method: FernIr.HttpMethod): go.TypeReference {
        return go.typeReference({
            name: this.getNetHttpMethodTypeReferenceName(method),
            importPath: "net/http"
        });
    }

    public getFileLocationForClient({
        fernFilepath,
        subpackage
    }: {
        fernFilepath: FernIr.FernFilepath;
        subpackage?: FernIr.Subpackage;
    }): FileLocation {
        const parts = [];
        if (subpackage != null && subpackage.subpackages.length > 0 && subpackage.fernFilepath.file != null) {
            // This represents a nested root package, so we need to deposit
            // the client in a 'client' subpackage (e.g. user/client).
            parts.push(...fernFilepath.allParts.map((part) => this.caseConverter.camelSafe(part).toLowerCase()));
            parts.push("client");
        } else {
            parts.push(...fernFilepath.packagePath.map((part) => this.caseConverter.camelSafe(part).toLowerCase()));
            parts.push(
                fernFilepath.file != null ? this.caseConverter.camelSafe(fernFilepath.file).toLowerCase() : "client"
            );
        }
        return {
            importPath: [this.getRootImportPath(), ...parts].join("/"),
            directory: RelativeFilePath.of(parts.join("/"))
        };
    }

    private getNetHttpMethodTypeReferenceName(method: FernIr.HttpMethod): string {
        switch (method) {
            case "GET":
                return "MethodGet";
            case "POST":
                return "MethodPost";
            case "PUT":
                return "MethodPut";
            case "PATCH":
                return "MethodPatch";
            case "DELETE":
                return "MethodDelete";
            case "HEAD":
                return "MethodHead";
            default:
                assertNever(method);
        }
    }

    private getLocationForWrappedRequest(serviceId: FernIr.ServiceId): FileLocation {
        if (this.customConfig.exportAllRequestsAtRoot) {
            // All inlined request types are generated in the root package's requests.go
            return this.getRootPackageLocation();
        } else {
            // Otherwise, generate in subpackage based on service filepath
            const httpService = this.getHttpServiceOrThrow(serviceId);
            return this.getPackageLocation(httpService.name.fernFilepath);
        }
    }

    private getRootPackageLocation(): FileLocation {
        return {
            importPath: this.getRootImportPath(),
            directory: RelativeFilePath.of("")
        };
    }

    public maybeGetExampleEndpointCall(endpoint: FernIr.HttpEndpoint): FernIr.ExampleEndpointCall | null {
        // Try user-specified examples first
        if (endpoint.userSpecifiedExamples.length > 0) {
            const exampleEndpointCall = endpoint.userSpecifiedExamples[0]?.example;
            if (exampleEndpointCall != null) {
                return exampleEndpointCall;
            }
        }
        // Fall back to auto-generated examples
        const exampleEndpointCall = endpoint.autogeneratedExamples[0]?.example;

        return exampleEndpointCall ?? null;
    }

    public getReturnTypeForEndpoint(httpEndpoint: FernIr.HttpEndpoint): go.Type {
        const responseBody = httpEndpoint.response?.body;

        if (responseBody == null) {
            return go.Type.error(); // no explicit void in golang, just need to handle the error
        }

        const pagination = this.getPagination(httpEndpoint);
        if (pagination?.type === "custom" && this.customConfig.customPagerName != null) {
            // For custom pagination, delegate to getEndpointPageReturnType which handles all three generics
            // This avoids code duplication and ensures consistency
            const pageReturnType = getEndpointPageReturnType({ context: this, endpoint: httpEndpoint });
            if (pageReturnType != null) {
                return pageReturnType;
            }
            // Fallback to error if pageReturnType is undefined
            return go.Type.error();
        }

        switch (responseBody.type) {
            case "json":
                return this.goTypeMapper.convert({ reference: responseBody.value.responseBodyType });
            case "fileDownload":
            case "text":
                return go.Type.string();
            case "bytes":
                throw new Error("Returning bytes is not supported");
            case "streaming":
            case "streamParameter": {
                const streamingResponse = this.getStreamingResponse(httpEndpoint);
                if (!streamingResponse) {
                    throw new Error(
                        `Unable to parse streaming response for endpoint ${this.caseConverter.camelSafe(httpEndpoint.name)}`
                    );
                }
                return this.getStreamPayload(streamingResponse);
            }
            default:
                assertNever(responseBody);
        }
    }

    public isSelfHosted(): boolean {
        return this.ir.selfHosted ?? false;
    }

    private needsPaginationHelpers(): boolean {
        for (const service of Object.values(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.pagination != null) {
                    return true;
                }
            }
        }
        return false;
    }

    public static chainMethods(
        baseFunc: go.FuncInvocation,
        ...methods: Omit<go.MethodInvocation.Args, "on">[]
    ): go.MethodInvocation {
        if (methods.length === 0) {
            throw new Error("Must have methods to chain");
        }

        let current: go.AstNode = baseFunc;
        for (const method of methods) {
            current = go.invokeMethod({
                on: current,
                method: method.method,
                arguments_: method.arguments_,
                multiline: method.multiline
            });
        }
        return current as go.MethodInvocation;
    }
}
