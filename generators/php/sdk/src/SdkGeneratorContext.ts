import { assertNever } from "@fern-api/core-utils";
import {
    Name,
    HttpEndpoint,
    HttpService,
    ServiceId,
    Subpackage,
    SubpackageId,
    TypeId,
    HttpMethod
} from "@fern-fern/ir-sdk/api";
import { AbstractPhpGeneratorContext, FileLocation } from "@fern-api/php-codegen";
import { GeneratorNotificationService } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { AsIsFiles, php } from "@fern-api/php-codegen";
import { camelCase, upperFirst } from "lodash-es";
import { RawClient } from "./core/RawClient";
import { GuzzleClient } from "./external/GuzzleClient";
import { ErrorId, ErrorDeclaration } from "@fern-fern/ir-sdk/api";
import { TYPES_DIRECTORY, ERRORS_DIRECTORY, REQUESTS_DIRECTORY } from "./constants";
import { EndpointGenerator } from "./endpoint/EndpointGenerator";

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
        return endpoint.name.camelCase.safeName;
    }

    public getSubpackageField(subpackage: Subpackage): php.Field {
        return php.field({
            name: `$${subpackage.name.camelCase.safeName}`,
            access: "public",
            type: php.Type.reference(this.getSubpackageClassReference(subpackage))
        });
    }

    public getExceptionClassReference(): php.ClassReference {
        return php.classReference({
            name: "Exception",
            namespace: this.getGlobalNamespace()
        });
    }

    public getBaseExceptionClassReference(): php.ClassReference {
        // TODO: Update this to the generated base exception class.
        return php.classReference({
            name: "Exception",
            namespace: this.getGlobalNamespace()
        });
    }

    public getBaseApiExceptionClassReference(): php.ClassReference {
        // TODO: Update this to the generated base API exception class.
        return php.classReference({
            name: "Exception",
            namespace: this.getGlobalNamespace()
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
        return this.getCoreClassReference("JsonApiRequest");
    }

    public getRequestWrapperReference(serviceId: ServiceId, requestName: Name): php.ClassReference {
        return php.classReference({
            name: requestName.pascalCase.safeName,
            namespace: this.getLocationForWrappedRequest(serviceId).namespace
        });
    }

    public getHttpMethodClassReference(): php.ClassReference {
        return this.getCoreClassReference("HttpMethod");
    }

    public getHttpMethod(method: HttpMethod): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.writeNode(this.getHttpMethodClassReference());
            writer.write(`::${method}`);
        });
    }

    public getDefaultBaseUrlForEndpoint(endpoint: HttpEndpoint): php.AstNode {
        // TODO: Add support for environments.
        return php.codeblock("''");
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
        return php.Type.typeDict([
            {
                key: this.getBaseUrlOptionName(),
                valueType: php.Type.string(),
                optional: true
            },
            {
                key: this.getGuzzleClientOptionName(),
                valueType: php.Type.reference(this.guzzleClient.getClientInterfaceClassReference()),
                optional: true
            }
        ]);
    }

    public getRequestOptionsType(): php.Type {
        return php.Type.typeDict([
            {
                key: this.getBaseUrlOptionName(),
                valueType: php.Type.string(),
                optional: true
            }
        ]);
    }

    private getComputedClientName(): string {
        return `${upperFirst(camelCase(this.config.organization))}Client`;
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
            ...this.getCoreSerializationAsIsFiles()
        ];
    }

    public getCoreTestAsIsFiles(): string[] {
        return [AsIsFiles.RawClientTest, ...this.getCoreSerializationTestAsIsFiles()];
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
        return this.getFileLocation(errorDeclaration.name.fernFilepath, ERRORS_DIRECTORY);
    }
}
