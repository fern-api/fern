import { GeneratorNotificationService } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractGoGeneratorContext, FileLocation, go } from "@fern-api/go-ast";
import { GoProject } from "@fern-api/go-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import {
    HttpEndpoint,
    HttpMethod,
    IntermediateRepresentation,
    Name,
    SdkRequestBodyType,
    SdkRequestWrapper,
    ServiceId,
    Subpackage
} from "@fern-fern/ir-sdk/api";

import { GoGeneratorAgent } from "./GoGeneratorAgent";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { EndpointGenerator } from "./endpoint/EndpointGenerator";
import { Caller } from "./internal/Caller";
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

    public getClientClassName(): string {
        return "Client";
    }

    public getClientPackageName(): string {
        return "client";
    }

    public getClientFilename(): string {
        return "client.go";
    }

    public getRawClientClassName(): string {
        return "RawClient";
    }

    public getRawClientFilename(): string {
        return "raw_client.go";
    }

    public getMethodName(name: Name): string {
        return name.pascalCase.unsafeName;
    }

    public getRootClientDirectory(): RelativeFilePath {
        return RelativeFilePath.of(this.getClientPackageName());
    }

    public getRootClientImportPath(): string {
        return `${this.getRootImportPath()}/${this.getClientPackageName()}`;
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

    public getSubpackageClientClassReference(subpackage: Subpackage): go.TypeReference {
        return go.typeReference({
            name: this.getClientClassName(),
            importPath: this.getSubpackageClientFileLocation(subpackage).importPath
        });
    }

    public getSubpackageRawClientClassReference(subpackage: Subpackage): go.TypeReference {
        return go.typeReference({
            name: this.getRawClientClassName(),
            importPath: this.getSubpackageClientFileLocation(subpackage).importPath
        });
    }

    public getSubpackageClientPackageName(subpackage: Subpackage): string {
        return this.getFileLocation(subpackage.fernFilepath).importPath.split("/").pop() ?? "";
    }

    public getSubpackageClientFileLocation(subpackage: Subpackage): FileLocation {
        // TODO: Add support for conditionally including the nested 'client' package element.
        return this.getFileLocation(subpackage.fernFilepath);
    }

    public getSubpackageClientField(subpackage: Subpackage): go.Field {
        return go.field({
            name: this.getClientClassName(),
            type: go.Type.reference(this.getSubpackageClientClassReference(subpackage))
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

    public getVariadicRequestOptionParameter(): go.Parameter {
        return go.parameter({
            name: "opts",
            type: go.Type.reference(this.getRequestOptionTypeReference())
        });
    }

    public getVariadicRequestOptionType(): go.Type {
        return go.Type.variadic(go.Type.reference(this.getRequestOptionTypeReference()));
    }

    public getRequestOptionTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "RequestOption",
            importPath: this.getOptionImportPath()
        });
    }

    public callNewRequestOptions(argument: go.AstNode): go.FuncInvocation {
        return go.invokeFunc({
            func: go.typeReference({
                name: "NewRequestOptions",
                importPath: this.getCoreImportPath()
            }),
            arguments_: [argument]
        });
    }

    public getRawResponseTypeReference(valueType: go.Type): go.TypeReference {
        return go.typeReference({
            name: "Response",
            importPath: this.getCoreImportPath(),
            generics: [valueType]
        });
    }

    public getRequestWrapperTypeReference(serviceId: ServiceId, requestName: Name): go.TypeReference {
        return go.typeReference({
            name: this.getClassName(requestName),
            importPath: this.getLocationForWrappedRequest(serviceId).importPath
        });
    }

    public getEndpointRequestType({
        endpoint,
        serviceId
    }: {
        endpoint: HttpEndpoint;
        serviceId: ServiceId;
    }): go.Type | undefined {
        const sdkRequest = endpoint.sdkRequest;
        if (sdkRequest == null) {
            return undefined;
        }
        switch (sdkRequest.shape.type) {
            case "justRequestBody":
                return this.getEndpointRequestBodyType(sdkRequest.shape.value);
            case "wrapper": {
                const location = this.getLocationForWrappedRequest(serviceId);
                return go.Type.pointer(
                    go.Type.reference(
                        go.typeReference({
                            name: this.getClassName(sdkRequest.shape.wrapperName),
                            importPath: location.importPath
                        })
                    )
                );
            }
            default:
                assertNever(sdkRequest.shape);
        }
    }

    private getEndpointRequestBodyType(requestBodyType: SdkRequestBodyType): go.Type {
        switch (requestBodyType.type) {
            case "typeReference":
                return this.goTypeMapper.convert({ reference: requestBodyType.requestBodyType });
            case "bytes": {
                return go.Type.reference(this.getIoReaderTypeReference());
            }
            default:
                assertNever(requestBodyType);
        }
    }

    private getLocationForWrappedRequest(serviceId: ServiceId): FileLocation {
        const httpService = this.getHttpServiceOrThrow(serviceId);
        return this.getPackageLocation(httpService.name.fernFilepath);
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
}
