import { camelCase, upperFirst } from "lodash-es";

import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractPhpGeneratorContext, FileLocation } from "@fern-api/php-codegen";
import { AsIsFiles, php } from "@fern-api/php-codegen";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import {
    HttpEndpoint,
    HttpMethod,
    HttpService,
    Name,
    ServiceId,
    Subpackage,
    SubpackageId,
    TypeId
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
        if (this.customConfig["client-class-name"] != null) {
            return this.customConfig["client-class-name"];
        }
        return this.getComputedClientName();
    }

    public getBaseUrlOptionName(): string {
        return "baseUrl";
    }

    public getGuzzleClientOptionName(): string {
        return "client";
    }

    public getHeadersOptionName(): string {
        return "headers";
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

    public getRequestOptionsType(): php.Type {
        return php.Type.typeDict(
            [
                {
                    key: this.getBaseUrlOptionName(),
                    valueType: php.Type.string(),
                    optional: true
                }
            ],
            {
                multiline: true
            }
        );
    }

    public getEnvironmentAccess(name: Name): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.writeNode(this.getEnvironmentsClassReference());
            writer.write(`::${this.getEnvironmentName(name)}->value`);
        });
    }

    public getEnvironmentName(name: Name): string {
        return name.pascalCase.safeName;
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
            AsIsFiles.MultipartApiRequest,
            AsIsFiles.MultipartFormData,
            AsIsFiles.MultipartFormDataPart,
            ...this.getCoreSerializationAsIsFiles()
        ];
    }

    public getCoreTestAsIsFiles(): string[] {
        return [AsIsFiles.RawClientTest, ...this.getCoreSerializationTestAsIsFiles()];
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
}
