import { GeneratorNotificationService } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractGoGeneratorContext, FileLocation, go } from "@fern-api/go-ast";
import { GoProject } from "@fern-api/go-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { GithubOutputMode, OutputMode } from "@fern-fern/generator-exec-sdk/api";
import {
    EnvironmentId,
    EnvironmentUrl,
    HttpEndpoint,
    HttpMethod,
    HttpService,
    IntermediateRepresentation,
    Name,
    SdkRequestWrapper,
    ServiceId,
    StreamingResponse,
    Subpackage
} from "@fern-fern/ir-sdk/api";

import { GoGeneratorAgent } from "./GoGeneratorAgent";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { EndpointGenerator } from "./endpoint/EndpointGenerator";
import { Caller } from "./internal/Caller";
import { ModuleConfig } from "./module/ModuleConfig";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";

export class SdkGeneratorContext extends AbstractGoGeneratorContext<SdkCustomConfigSchema> {
    public readonly project: GoProject;
    public readonly caller: Caller;
    public readonly endpointGenerator: EndpointGenerator;
    public readonly generatorAgent: GoGeneratorAgent;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.project = new GoProject({ context: this });
        this.endpointGenerator = new EndpointGenerator(this);
        this.caller = new Caller(this);
        this.generatorAgent = new GoGeneratorAgent({
            logger: this.logger,
            config: this.config,
            readmeConfigBuilder: new ReadmeConfigBuilder(),
            ir
        });
    }

    public getClientClassName(subpackage?: Subpackage): string {
        if (subpackage == null && this.customConfig.clientName != null) {
            return this.customConfig.clientName;
        }
        if (subpackage != null && this.isFlatPackageLayout()) {
            return `${this.getClassName(subpackage.name)}Client`;
        }
        return "Client";
    }

    public getClientFilename(subpackage?: Subpackage): string {
        if (subpackage != null && this.isFlatPackageLayout()) {
            return `${this.getFilename(subpackage.name)}.go`;
        }
        return "client.go";
    }

    public getRawClientClassName(subpackage?: Subpackage): string {
        if (subpackage != null) {
            if (this.isFlatPackageLayout()) {
                return `Raw${this.getClassName(subpackage.name)}Client`;
            }
            return "RawClient";
        }
        return `Raw${this.getClientClassName()}`;
    }

    public getRawClientFilename(subpackage?: Subpackage): string {
        if (subpackage != null && this.isFlatPackageLayout()) {
            return `raw_${this.getFilename(subpackage.name)}.go`;
        }
        return "raw_client.go";
    }

    public getMethodName(name: Name): string {
        return name.pascalCase.unsafeName;
    }

    public getReceiverName(name: Name): string {
        return name.camelCase.unsafeName.charAt(0);
    }

    public getDefaultBaseUrlTypeInstantiation(endpoint: HttpEndpoint): go.TypeInstantiation {
        const defaultBaseUrl = this.getDefaultBaseUrl(endpoint);
        if (defaultBaseUrl == null) {
            return go.TypeInstantiation.string("");
        }
        return go.TypeInstantiation.string(defaultBaseUrl);
    }

    public getDefaultBaseUrl(endpoint: HttpEndpoint): EnvironmentUrl | undefined {
        if (endpoint.baseUrl != null) {
            return this.getEnvironmnetUrlFromId(endpoint.baseUrl);
        }
        if (this.ir.environments?.defaultEnvironment != null) {
            return this.getEnvironmnetUrlFromId(this.ir.environments.defaultEnvironment);
        }
        return undefined;
    }

    public getEnvironmnetUrlFromId(id: EnvironmentId): EnvironmentUrl | undefined {
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

    public getModuleConfig({ outputMode }: { outputMode: OutputMode }): ModuleConfig | undefined {
        const githubConfig = this.getGithubOutputMode({ outputMode });
        if (githubConfig == null && this.customConfig.module == null) {
            return undefined;
        }
        if (githubConfig == null) {
            return this.customConfig.module;
        }
        if (this.customConfig.module == null) {
            // A GitHub configuration was provided, so the module config should use
            // the GitHub configuration's repository url.
            const modulePath = githubConfig.repoUrl.replace("https://", "");
            return {
                ...ModuleConfig.DEFAULT,
                path: modulePath
            };
        }
        return {
            path: this.customConfig.module.path,
            version: this.customConfig.module.version,
            imports: this.customConfig.module.imports ?? ModuleConfig.DEFAULT.imports
        };
    }

    private getGithubOutputMode({ outputMode }: { outputMode: OutputMode }): GithubOutputMode | undefined {
        switch (outputMode.type) {
            case "github":
                return outputMode;
            case "publish":
            case "downloadFiles":
                return undefined;
            default:
                assertNever(outputMode);
        }
    }

    public getRootClientDirectory(): RelativeFilePath {
        if (this.isFlatPackageLayout()) {
            return RelativeFilePath.of(".");
        }
        return RelativeFilePath.of(this.getRootClientPackageName());
    }

    public getRootClientImportPath(): string {
        if (this.isFlatPackageLayout()) {
            return this.getRootImportPath();
        }
        return `${this.getRootImportPath()}/${this.getRootClientPackageName()}`;
    }

    public getRootClientPackageName(): string {
        if (this.isFlatPackageLayout()) {
            return this.getRootPackageName();
        }
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

    public getServiceClientClassReference({
        service,
        subpackage
    }: {
        service: HttpService;
        subpackage?: Subpackage;
    }): go.TypeReference {
        return go.typeReference({
            name: this.getClientClassName(subpackage),
            importPath: this.getServiceClientFileLocation({ service, subpackage }).importPath
        });
    }

    public getRawClientClassReference({
        service,
        subpackage
    }: {
        service: HttpService;
        subpackage?: Subpackage;
    }): go.TypeReference {
        return go.typeReference({
            name: this.getRawClientClassName(subpackage),
            importPath: this.getServiceClientFileLocation({ service, subpackage }).importPath
        });
    }

    public getServiceClientPackageName({
        service,
        subpackage
    }: {
        service: HttpService;
        subpackage?: Subpackage;
    }): string {
        const fileLocation = this.getServiceClientFileLocation({ service, subpackage });
        if (fileLocation.importPath === this.getRootImportPath()) {
            return this.getRootPackageName();
        }
        return fileLocation.importPath.split("/").pop() ?? "";
    }

    public getServiceClientFileLocation({
        subpackage,
        service
    }: {
        subpackage?: Subpackage;
        service: HttpService;
    }): FileLocation {
        if (this.isFlatPackageLayout()) {
            return this.getPackageLocation(service.name.fernFilepath);
        }
        return this.getFileLocationForClient({ service, subpackage });
    }

    public getSubpackageClientField({
        service,
        subpackage
    }: {
        service: HttpService;
        subpackage: Subpackage;
    }): go.Field {
        return go.field({
            name: this.getClientClassName(subpackage),
            type: go.Type.reference(this.getServiceClientClassReference({ service, subpackage }))
        });
    }

    public shouldGenerateSubpackageClient(subpackage: Subpackage): boolean {
        if (subpackage.service != null) {
            return true;
        }
        for (const subpackageId of subpackage.subpackages) {
            const subpackage = this.getSubpackageOrThrow(subpackageId);
            if (this.shouldGenerateSubpackageClient(subpackage)) {
                return true;
            }
        }
        return false;
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

    public callBytesNewBuffer(): go.FuncInvocation {
        return go.invokeFunc({
            func: go.typeReference({ name: "NewBuffer", importPath: "bytes" }),
            arguments_: [go.codeblock("nil")],
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
        return this.callInternalFunc("EncodeURL", arguments_);
    }

    public callResolveBaseURL(arguments_: go.AstNode[]): go.FuncInvocation {
        return this.callInternalFunc("ResolveBaseURL", arguments_);
    }

    public callMergeHeaders(arguments_: go.AstNode[]): go.FuncInvocation {
        return this.callInternalFunc("MergeHeaders", arguments_);
    }

    public callNewErrorDecoder(arguments_: go.AstNode[]): go.FuncInvocation {
        return this.callInternalFunc("NewErrorDecoder", arguments_, false);
    }

    public callQueryValues(arguments_: go.AstNode[]): go.FuncInvocation {
        return this.callInternalFunc("QueryValues", arguments_, false);
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

    public isFileUploadEndpoint(endpoint: HttpEndpoint): boolean {
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

    public isPaginationEndpoint(endpoint: HttpEndpoint): boolean {
        return endpoint.pagination != null;
    }

    public isStreamingEndpoint(endpoint: HttpEndpoint): boolean {
        const responseBody = endpoint.response?.body;
        if (responseBody == null) {
            return false;
        }
        switch (responseBody.type) {
            case "fileDownload":
            case "json":
            case "text":
            case "bytes":
                return false;
            case "streaming":
            case "streamParameter":
                return true;
            default:
                assertNever(responseBody);
        }
    }

    public getStreamPayload(streamingResponse: StreamingResponse): go.Type {
        switch (streamingResponse.type) {
            case "json":
            case "sse":
                return this.goTypeMapper.convert({ reference: streamingResponse.payload });
            case "text":
                return go.Type.string();
            default:
                assertNever(streamingResponse);
        }
    }

    public getRequestWrapperTypeReference(serviceId: ServiceId, requestName: Name): go.TypeReference {
        return go.typeReference({
            name: this.getClassName(requestName),
            importPath: this.getLocationForWrappedRequest(serviceId).importPath
        });
    }

    public shouldSkipWrappedRequest({
        endpoint,
        wrapper
    }: {
        endpoint: HttpEndpoint;
        wrapper: SdkRequestWrapper;
    }): boolean {
        return (
            (wrapper.onlyPathParameters ?? false) && !this.includePathParametersInWrappedRequest({ endpoint, wrapper })
        );
    }

    public includePathParametersInWrappedRequest({
        endpoint,
        wrapper
    }: {
        endpoint: HttpEndpoint;
        wrapper: SdkRequestWrapper;
    }): boolean {
        const inlinePathParameters = this.customConfig.inlinePathParameters;
        if (inlinePathParameters == null) {
            return false;
        }
        const wrapperShouldIncludePathParameters = wrapper.includePathParameters ?? false;
        return endpoint.allPathParameters.length > 0 && inlinePathParameters && wrapperShouldIncludePathParameters;
    }

    public accessRequestProperty({
        requestParameterName,
        propertyName
    }: {
        requestParameterName: Name;
        propertyName: Name;
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

    public getNetHttpMethodTypeReference(method: HttpMethod): go.TypeReference {
        return go.typeReference({
            name: this.getNetHttpMethodTypeReferenceName(method),
            importPath: "net/http"
        });
    }

    public isFlatPackageLayout(): boolean {
        return this.customConfig.packageLayout === "flat";
    }

    public getFileLocationForClient({
        service,
        subpackage
    }: {
        service: HttpService;
        subpackage?: Subpackage;
    }): FileLocation {
        const parts = [];
        if (subpackage != null && subpackage.subpackages.length > 0 && subpackage.fernFilepath.file != null) {
            // This represents a nested root package, so we need to deposit
            // the client in a 'client' subpackage (e.g. user/client).
            parts.push(...service.name.fernFilepath.allParts.map((part) => part.camelCase.safeName.toLowerCase()));
            parts.push("client");
        } else {
            parts.push(...service.name.fernFilepath.packagePath.map((part) => part.camelCase.safeName.toLowerCase()));
            parts.push(service.name.fernFilepath.file?.camelCase.safeName.toLowerCase() ?? "client");
        }
        return {
            importPath: [this.getRootImportPath(), ...parts].join("/"),
            directory: RelativeFilePath.of(parts.join("/"))
        };
    }

    private callInternalFunc(name: string, arguments_: go.AstNode[], multiline: boolean = true): go.FuncInvocation {
        return go.invokeFunc({
            func: go.typeReference({
                name,
                importPath: this.getInternalImportPath()
            }),
            arguments_,
            multiline
        });
    }

    private getNetHttpMethodTypeReferenceName(method: HttpMethod): string {
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

    private getLocationForWrappedRequest(serviceId: ServiceId): FileLocation {
        const httpService = this.getHttpServiceOrThrow(serviceId);
        return this.getPackageLocation(httpService.name.fernFilepath);
    }
}
