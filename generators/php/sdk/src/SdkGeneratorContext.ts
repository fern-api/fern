import { camelCase, upperFirst } from "lodash-es";

import { GeneratorNotificationService } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { AbstractPhpGeneratorContext, AsIsFiles, FileLocation } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import {
    HttpEndpoint,
    HttpMethod,
    HttpService,
    Name,
    SdkRequestWrapper,
    ServiceId,
    Subpackage,
    SubpackageId,
    TypeId,
    UserAgent
} from "@fern-fern/ir-sdk/api";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ErrorDeclaration, ErrorId } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { EXCEPTIONS_DIRECTORY, REQUESTS_DIRECTORY, RESERVED_METHOD_NAMES, TYPES_DIRECTORY } from "./constants";
import { RawClient } from "./core/RawClient";
import { EndpointGenerator } from "./endpoint/EndpointGenerator";
import { GuzzleClient } from "./external/GuzzleClient";

export class SdkGeneratorContext extends AbstractPhpGeneratorContext<SdkCustomConfigSchema> {
    public endpointGenerator: EndpointGenerator;
    public guzzleClient: GuzzleClient;
    public rawClient: RawClient;
    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.endpointGenerator = new EndpointGenerator(this);
        this.guzzleClient = new GuzzleClient(this);
        this.rawClient = new RawClient(this);
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

    public getHttpServiceOrThrow(serviceId: ServiceId): HttpService {
        const service = this.ir.services[serviceId];
        if (service == null) {
            throw new Error(`Service with id ${serviceId} not found`);
        }
        return service;
    }

    public getErrorDeclarationOrThrow(errorId: ErrorId): ErrorDeclaration {
        const error = this.ir.errors[errorId];
        if (error == null) {
            throw new Error(`Error with id ${errorId} not found`);
        }
        return error;
    }

    public getSubpackageClassReference(subpackage: Subpackage): php.ClassReference {
        return php.classReference({
            name: `${subpackage.name.pascalCase.unsafeName}Client`,
            namespace: this.getFileLocation(subpackage.fernFilepath).namespace
        });
    }

    public getEndpointMethodName(endpoint: HttpEndpoint): string {
        // TODO: Propogate reserved keywords through IR via CasingsGenerator.
        const unsafeName = endpoint.name.camelCase.unsafeName;
        if (RESERVED_METHOD_NAMES.includes(unsafeName)) {
            return unsafeName;
        }
        return endpoint.name.camelCase.safeName;
    }

    public getUnpagedEndpointMethodName(endpoint: HttpEndpoint): string {
        return `_${this.getEndpointMethodName(endpoint)}`;
    }

    public getPagedEndpointMethodName(endpoint: HttpEndpoint): string {
        return this.getEndpointMethodName(endpoint);
    }

    public getSubpackageField(subpackage: Subpackage): php.Field {
        return php.field({
            name: `$${subpackage.name.camelCase.safeName}`,
            access: "public",
            type: php.Type.reference(this.getSubpackageClassReference(subpackage))
        });
    }

    public getEnvironmentsClassReference(): php.ClassReference {
        return php.classReference({
            name: "Environments",
            namespace: this.getRootNamespace()
        });
    }

    public getExceptionClassReference(): php.ClassReference {
        return php.classReference({
            name: "Exception",
            namespace: this.getGlobalNamespace()
        });
    }

    public getBaseExceptionClassReference(): php.ClassReference {
        return php.classReference({
            name: this.getOrganizationPascalCase() + "Exception",
            namespace: this.getLocationForBaseException().namespace
        });
    }

    public getBaseApiExceptionClassReference(): php.ClassReference {
        return php.classReference({
            name: this.getOrganizationPascalCase() + "ApiException",
            namespace: this.getLocationForBaseException().namespace
        });
    }

    public getJsonExceptionClassReference(): php.ClassReference {
        return php.classReference({
            name: "JsonException",
            namespace: this.getGlobalNamespace()
        });
    }

    public getClientExceptionInterfaceClassReference(): php.ClassReference {
        return php.classReference({
            name: "ClientExceptionInterface",
            namespace: "Psr\\Http\\Client"
        });
    }

    public getJsonApiRequestClassReference(): php.ClassReference {
        return this.getCoreJsonClassReference("JsonApiRequest");
    }

    public getJsonDecoderClassReference(): php.ClassReference {
        return this.getCoreJsonClassReference("JsonDecoder");
    }

    public getJsonEncoderClassReference(): php.ClassReference {
        return this.getCoreJsonClassReference("JsonEncoder");
    }

    public getJsonSerializerClassReference(): php.ClassReference {
        return this.getCoreJsonClassReference("JsonSerializer");
    }

    public getMultipartApiRequestClassReference(): php.ClassReference {
        return this.getCoreMultipartClassReference("MultipartApiRequest");
    }

    public getMultipartFormDataClassReference(): php.ClassReference {
        return this.getCoreMultipartClassReference("MultipartFormData");
    }

    public getFileClassReference(): php.ClassReference {
        return this.getUtilsClassReference("File");
    }

    public getRequestWrapperReference(serviceId: ServiceId, requestName: Name): php.ClassReference {
        return php.classReference({
            name: requestName.pascalCase.safeName,
            namespace: this.getLocationForWrappedRequest(serviceId).namespace
        });
    }

    public getHttpMethodClassReference(): php.ClassReference {
        return this.getCoreClientClassReference("HttpMethod");
    }

    public getPagerClassReference(itemType: php.Type): php.ClassReference {
        return php.classReference({
            name: "Pager",
            namespace: this.getCorePaginationNamespace(),
            generics: [itemType]
        });
    }

    public getOffsetPagerClassReference(): php.ClassReference {
        return php.classReference({
            name: "OffsetPager",
            namespace: this.getCorePaginationNamespace()
        });
    }

    public getCursorPagerClassReference(): php.ClassReference {
        return php.classReference({
            name: "CursorPager",
            namespace: this.getCorePaginationNamespace()
        });
    }

    public getHttpMethod(method: HttpMethod): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.writeNode(this.getHttpMethodClassReference());
            writer.write(`::${method}`);
        });
    }

    public getDefaultBaseUrlForEndpoint(endpoint: HttpEndpoint): php.CodeBlock {
        if (endpoint.baseUrl != null) {
            return this.getBaseUrlForEnvironment(endpoint.baseUrl);
        }
        return this.getDefaultBaseUrl();
    }

    public getRootClientClassName(): string {
        if (this.customConfig.clientName != null) {
            return this.customConfig.clientName;
        }
        if (this.customConfig["client-class-name"] != null) {
            return this.customConfig["client-class-name"];
        }
        return this.getComputedClientName();
    }

    public getBaseUrlOptionName(): string {
        return "baseUrl";
    }

    public getMaxRetriesOptionName(): string {
        return "maxRetries";
    }

    public getGuzzleClientOptionName(): string {
        return "client";
    }

    public getHeadersOptionName(): string {
        return "headers";
    }

    public getBodyPropertiesOptionName(): string {
        return "bodyProperties";
    }

    public getQueryParametersOptionName(): string {
        return "queryParameters";
    }

    public getTimeoutOptionName(): string {
        return "timeout";
    }

    public getClientOptionsName(): string {
        return this.getOptionsName();
    }

    public getRequestOptionsName(): string {
        return this.getOptionsName();
    }

    public getOptionsName(): string {
        return "options";
    }

    public getClientOptionsType(): php.Type {
        return php.Type.typeDict(
            [
                {
                    key: this.getBaseUrlOptionName(),
                    valueType: php.Type.string(),
                    optional: true
                },
                {
                    key: this.getGuzzleClientOptionName(),
                    valueType: php.Type.reference(this.guzzleClient.getClientInterfaceClassReference()),
                    optional: true
                },
                {
                    key: this.getMaxRetriesOptionName(),
                    valueType: php.Type.int(),
                    optional: true
                },
                {
                    key: this.getTimeoutOptionName(),
                    valueType: php.Type.float(),
                    optional: true
                },
                {
                    key: this.getHeadersOptionName(),
                    valueType: php.Type.map(php.Type.string(), php.Type.string()),
                    optional: true
                }
            ],
            {
                multiline: true
            }
        );
    }

    public getRequestOptionsType({ endpoint }: { endpoint: HttpEndpoint }): php.Type {
        const options = [
            {
                key: this.getBaseUrlOptionName(),
                valueType: php.Type.string(),
                optional: true
            },
            {
                key: this.getMaxRetriesOptionName(),
                valueType: php.Type.int(),
                optional: true
            },
            {
                key: this.getTimeoutOptionName(),
                valueType: php.Type.float(),
                optional: true
            },
            {
                key: this.getHeadersOptionName(),
                valueType: php.Type.map(php.Type.string(), php.Type.string()),
                optional: true
            },
            {
                key: this.getQueryParametersOptionName(),
                valueType: php.Type.map(php.Type.string(), php.Type.mixed()),
                optional: true
            }
        ];
        if (!this.isMultipartEndpoint(endpoint)) {
            options.push({
                key: this.getBodyPropertiesOptionName(),
                valueType: php.Type.map(php.Type.string(), php.Type.mixed()),
                optional: true
            });
        }
        return php.Type.typeDict(options, {
            multiline: true
        });
    }

    public getEnvironmentAccess(name: Name): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.writeNode(this.getEnvironmentsClassReference());
            writer.write(`::${this.getEnvironmentName(name)}->value`);
        });
    }

    public createRequestWithDefaults(reference: php.ClassReference | php.CodeBlock): php.AstNode {
        return php.invokeMethod({
            on: php.classReference({
                name: "PaginationHelper",
                namespace: this.getCorePaginationNamespace()
            }),
            method: "createRequestWithDefaults",
            arguments_: [
                php.codeblock((writer) => {
                    if (reference instanceof php.ClassReference) {
                        writer.writeNode(reference);
                        writer.write("::class");
                        return;
                    }
                    writer.writeNode(reference);
                })
            ],
            static_: true
        });
    }

    public deepSetPagination(
        objectVarToSetOn: php.AstNode,
        setterPath: Name[],
        valueVarToSet: php.AstNode
    ): php.AstNode {
        if (setterPath.length === 0) {
            throw new Error("setterPath cannot be empty");
        }
        if (setterPath.length === 1) {
            const singleSetter = setterPath[0] as Name;
            return php.codeblock((writer) => {
                writer.writeNode(objectVarToSetOn);
                writer.writeNode(this.getTypeSetter(singleSetter, valueVarToSet));
            });
        }
        return php.invokeMethod({
            on: php.classReference({
                name: "PaginationHelper",
                namespace: this.getCorePaginationNamespace()
            }),
            method: "setDeep",
            arguments_: [
                objectVarToSetOn,
                php.codeblock(`[${setterPath.map((path) => `"${this.getPropertyName(path)}"`).join(", ")}]`),
                valueVarToSet
            ],
            static_: true
        });
    }

    public getEnvironmentName(name: Name): string {
        return name.pascalCase.safeName;
    }

    public getUserAgent(): UserAgent | undefined {
        if (this.ir.sdkConfig.platformHeaders.userAgent != null) {
            return this.ir.sdkConfig.platformHeaders.userAgent;
        }
        if (this.version != null) {
            return {
                header: "User-Agent",
                value: `${this.getPackageName()}/${this.version}`
            };
        }
        return undefined;
    }

    public getTypeGetter(propertyName: Name): php.AstNode {
        return php.codeblock((writer) => {
            if (this.shouldGenerateGetterMethods()) {
                writer.write(`->${this.getPropertyGetterName(propertyName)}()`);
            } else {
                writer.write(`->${this.getPropertyName(propertyName)}`);
            }
        });
    }

    public getTypeSetter(propertyName: Name, valueVarToSet: php.AstNode): php.AstNode {
        return php.codeblock((writer) => {
            if (this.shouldGenerateGetterMethods()) {
                writer.write(`->${this.getPropertySetterName(propertyName)}`);
                writer.write("(");
                writer.writeNode(valueVarToSet);
                writer.write(")");
            } else {
                writer.write(`->${this.getPropertyName(propertyName)}`);
                writer.write(" = ");
                writer.writeNode(valueVarToSet);
            }
        });
    }

    public accessRequestProperty({
        requestParameterName,
        propertyName
    }: {
        requestParameterName: Name;
        propertyName: Name;
    }): string {
        const requestParameter = this.getRequestParameterVar({ requestParameterName });
        if (this.shouldGenerateGetterMethods()) {
            return `${requestParameter}->${this.getPropertyGetterName(propertyName)}()`;
        }
        return `${requestParameter}->${this.getPropertyName(propertyName)}`;
    }

    public getRequestParameterVar({ requestParameterName }: { requestParameterName: Name }): string {
        return `$${this.getParameterName(requestParameterName)}`;
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

    public getRawAsIsFiles(): string[] {
        return [AsIsFiles.GitIgnore, AsIsFiles.PhpStanNeon, AsIsFiles.PhpUnitXml];
    }

    public getCoreAsIsFiles(): string[] {
        return [
            AsIsFiles.BaseApiRequest,
            AsIsFiles.HttpMethod,
            AsIsFiles.JsonApiRequest,
            AsIsFiles.RawClient,
            AsIsFiles.RetryMiddleware,
            AsIsFiles.MultipartApiRequest,
            AsIsFiles.MultipartFormData,
            AsIsFiles.MultipartFormDataPart,
            ...this.getCorePagerAsIsFiles(),
            ...this.getCoreSerializationAsIsFiles()
        ];
    }

    private getCorePagerAsIsFiles(): string[] {
        return this.hasPagination()
            ? [
                  AsIsFiles.CursorPager,
                  AsIsFiles.OffsetPager,
                  AsIsFiles.Page,
                  AsIsFiles.Pager,
                  AsIsFiles.PaginationHelper
              ]
            : [];
    }

    public getCoreTestAsIsFiles(): string[] {
        return [
            AsIsFiles.RawClientTest,
            ...this.getCorePagerTestAsIsFiles(),
            ...this.getCoreSerializationTestAsIsFiles()
        ];
    }

    private getCorePagerTestAsIsFiles(): string[] {
        return this.hasPagination()
            ? [
                  AsIsFiles.CursorPagerTest,
                  AsIsFiles.GeneratorPagerTest,
                  AsIsFiles.HasNextPageOffsetPagerTest,
                  AsIsFiles.IntOffsetPagerTest,
                  AsIsFiles.StepOffsetPagerTest,
                  AsIsFiles.DeepSetTest,
                  AsIsFiles.DeepSetAccessorsTest,
                  AsIsFiles.CreateRequestWithDefaultsTest
              ]
            : [];
    }

    public getUtilsAsIsFiles(): string[] {
        return [AsIsFiles.File];
    }

    public getLocationForTypeId(typeId: TypeId): FileLocation {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return this.getFileLocation(typeDeclaration.name.fernFilepath, TYPES_DIRECTORY);
    }

    public getLocationForSubpackageId(subpackageId: SubpackageId): FileLocation {
        const subpackage = this.getSubpackageOrThrow(subpackageId);
        return this.getLocationForSubpackage(subpackage);
    }

    public getLocationForSubpackage(subpackage: Subpackage): FileLocation {
        return this.getFileLocation(subpackage.fernFilepath);
    }

    public getLocationForServiceId(serviceId: ServiceId): FileLocation {
        const httpService = this.getHttpServiceOrThrow(serviceId);
        return this.getFileLocation(httpService.name.fernFilepath);
    }

    public getLocationForWrappedRequest(serviceId: ServiceId): FileLocation {
        const httpService = this.getHttpServiceOrThrow(serviceId);
        return this.getFileLocation(httpService.name.fernFilepath, REQUESTS_DIRECTORY);
    }

    public getLocationForErrorId(errorId: ErrorId): FileLocation {
        const errorDeclaration = this.getErrorDeclarationOrThrow(errorId);
        return this.getFileLocation(errorDeclaration.name.fernFilepath, EXCEPTIONS_DIRECTORY);
    }

    public getLocationForBaseException(): FileLocation {
        return this.getFileLocation({ allParts: [], packagePath: [], file: undefined }, EXCEPTIONS_DIRECTORY);
    }

    private getDefaultBaseUrl(): php.CodeBlock {
        const defaultEnvironmentId = this.ir.environments?.defaultEnvironment;
        if (defaultEnvironmentId == null) {
            return php.codeblock("''");
        }
        return this.getBaseUrlForEnvironment(defaultEnvironmentId);
    }

    private getBaseUrlForEnvironment(environmentId: string): php.CodeBlock {
        const environmentName =
            environmentId != null
                ? this.ir.environments?.environments._visit({
                      singleBaseUrl: (value) => {
                          return value.environments.find((env) => {
                              return env.id === environmentId;
                          })?.name;
                      },
                      multipleBaseUrls: (value) => {
                          return value.environments.find((env) => {
                              return env.id === environmentId;
                          })?.name;
                      },
                      _other: () => undefined
                  })
                : undefined;
        if (environmentName == null) {
            return php.codeblock("''");
        }
        return this.getEnvironmentAccess(environmentName);
    }

    private getComputedClientName(): string {
        return `${this.getOrganizationPascalCase()}Client`;
    }

    private getOrganizationPascalCase(): string {
        return `${upperFirst(camelCase(this.config.organization))}`;
    }

    private isMultipartEndpoint(endpoint: HttpEndpoint): boolean {
        return endpoint.requestBody?.type === "fileUpload";
    }

    public hasPagination(): boolean {
        return this.config.generatePaginatedClients === true && this.ir.sdkConfig.hasPaginatedEndpoints;
    }
}
