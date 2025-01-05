import { camelCase, upperFirst } from "lodash-es";

import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractCsharpGeneratorContext, AsIsFiles, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import {
    DeclaredErrorName,
    EndpointId,
    ExampleEndpointCall,
    FernFilepath,
    HttpEndpoint,
    HttpService,
    IntermediateRepresentation,
    Name,
    NameAndWireValue,
    OAuthScheme,
    ProtobufService,
    ServiceId,
    Subpackage,
    SubpackageId,
    TypeId
} from "@fern-fern/ir-sdk/api";

import { CsharpGeneratorAgent } from "./CsharpGeneratorAgent";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { EndpointGenerator } from "./endpoint/EndpointGenerator";
import { EndpointSnippetsGenerator } from "./endpoint/snippets/EndpointSnippetsGenerator";
import { GrpcClientInfo } from "./grpc/GrpcClientInfo";
import { CLIENT_OPTIONS_CLASS_NAME } from "./options/ClientOptionsGenerator";
import { IDEMPOTENT_REQUEST_OPTIONS_CLASS_NAME } from "./options/IdempotentRequestOptionsGenerator";
import {
    IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME,
    IDEMPOTENT_REQUEST_OPTIONS_PARAMETER_NAME
} from "./options/IdempotentRequestOptionsInterfaceGenerator";
import { REQUEST_OPTIONS_CLASS_NAME } from "./options/RequestOptionsGenerator";
import {
    REQUEST_OPTIONS_INTERFACE_NAME,
    REQUEST_OPTIONS_PARAMETER_NAME
} from "./options/RequestOptionsInterfaceGenerator";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";

const TYPES_FOLDER_NAME = "Types";
const EXCEPTIONS_FOLDER_NAME = "Exceptions";
export const MOCK_SERVER_TEST_FOLDER = RelativeFilePath.of("Unit/MockServer");
const CANCELLATION_TOKEN_PARAMETER_NAME = "cancellationToken";

export class SdkGeneratorContext extends AbstractCsharpGeneratorContext<SdkCustomConfigSchema> {
    public readonly endpointGenerator: EndpointGenerator;
    public readonly generatorAgent: CsharpGeneratorAgent;
    public readonly snippetGenerator: EndpointSnippetsGenerator;
    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.endpointGenerator = new EndpointGenerator({ context: this });
        this.generatorAgent = new CsharpGeneratorAgent({
            logger: this.logger,
            config: this.config,
            readmeConfigBuilder: new ReadmeConfigBuilder()
        });
        this.snippetGenerator = new EndpointSnippetsGenerator({ context: this });
    }

    /**
     * Returns the service with the given id
     * @param serviceId
     * @returns
     */
    public getHttpServiceOrThrow(serviceId: ServiceId): HttpService {
        const service = this.ir.services[serviceId];
        if (service == null) {
            throw new Error(`Service with id ${serviceId} not found`);
        }
        return service;
    }

    public getSubpackageOrThrow(subpackageId: SubpackageId): Subpackage {
        const subpackage = this.ir.subpackages[subpackageId];
        if (subpackage == null) {
            throw new Error(`Subpackage with id ${subpackageId} not found`);
        }
        return subpackage;
    }

    /**
     * __package__.yml types are stored in a Types directory (e.g. /src/Types)
     * __{{file}}__.yml types are stored in a directory with the same name as the file
     * (e.g. /src/{{file}}/Types)
     *
     * @param typeId The type id of the type declaration
     * @returns
     */
    public getDirectoryForTypeId(typeId: TypeId): RelativeFilePath {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return RelativeFilePath.of(
            [
                ...typeDeclaration.name.fernFilepath.allParts.map((path) => path.pascalCase.safeName),
                TYPES_FOLDER_NAME
            ].join("/")
        );
    }

    public getDirectoryForError(declaredErrorName: DeclaredErrorName): RelativeFilePath {
        return RelativeFilePath.of(
            [
                ...declaredErrorName.fernFilepath.allParts.map((path) => path.pascalCase.safeName),
                EXCEPTIONS_FOLDER_NAME
            ].join("/")
        );
    }

    public getNamespaceForTypeId(typeId: TypeId): string {
        const typeDeclaration = this.getTypeDeclarationOrThrow(typeId);
        return this.getNamespaceFromFernFilepath(typeDeclaration.name.fernFilepath);
    }

    public getAccessFromRootClient(fernFilepath: FernFilepath): string {
        const clientVariableName = this.getClientVariableName();
        const clientAccessParts = fernFilepath.allParts.map((part) => part.pascalCase.safeName);
        return clientAccessParts.length > 0
            ? `${clientVariableName}.${clientAccessParts.join(".")}`
            : clientVariableName;
    }

    public getClientVariableName(): string {
        return EndpointSnippetsGenerator.CLIENT_VARIABLE_NAME;
    }

    public getRawAsIsFiles(): string[] {
        return [AsIsFiles.GitIgnore];
    }

    public getCoreAsIsFiles(): string[] {
        const files = [
            AsIsFiles.CollectionItemSerializer,
            AsIsFiles.Constants,
            AsIsFiles.DateTimeSerializer,
            AsIsFiles.Extensions,
            AsIsFiles.Headers,
            AsIsFiles.HeaderValue,
            AsIsFiles.HttpMethodExtensions,
            AsIsFiles.JsonConfiguration,
            AsIsFiles.OneOfSerializer,
            AsIsFiles.RawClient
        ];
        if (this.hasGrpcEndpoints()) {
            files.push(AsIsFiles.RawGrpcClient);
        }
        if (this.hasPagination()) {
            files.push(AsIsFiles.Page);
            files.push(AsIsFiles.Pager);
        }
        if (this.customConfig["experimental-enable-forward-compatible-enums"] ?? false) {
            files.push(AsIsFiles.StringEnum);
            files.push(AsIsFiles.StringEnumExtensions);
            files.push(AsIsFiles.StringEnumSerializer);
        } else {
            files.push(AsIsFiles.EnumSerializer);
        }
        return files;
    }

    public hasPagination(): boolean {
        return this.config.generatePaginatedClients === true && this.ir.sdkConfig.hasPaginatedEndpoints;
    }

    public getCoreTestAsIsFiles(): string[] {
        const files = [AsIsFiles.Test.RawClientTests];
        if (this.customConfig["experimental-enable-forward-compatible-enums"] ?? false) {
            files.push(AsIsFiles.Test.StringEnumSerializerTests);
        } else {
            files.push(AsIsFiles.Test.EnumSerializerTests);
        }
        if (this.hasPagination()) {
            AsIsFiles.Test.Pagination.forEach((file) => files.push(file));
        }
        return files;
    }

    public getPublicCoreAsIsFiles(): string[] {
        if (this.hasGrpcEndpoints()) {
            return [AsIsFiles.GrpcRequestOptions];
        }
        return [];
    }

    public getPublicCoreTestAsIsFiles(): string[] {
        return [];
    }

    public getAsIsTestUtils(): string[] {
        return [];
    }

    public getExampleEndpointCallOrThrow(endpoint: HttpEndpoint): ExampleEndpointCall {
        if (endpoint.userSpecifiedExamples.length > 0) {
            const exampleEndpointCall = endpoint.userSpecifiedExamples[0]?.example;
            if (exampleEndpointCall != null) {
                return exampleEndpointCall;
            }
        }
        const exampleEndpointCall = endpoint.autogeneratedExamples[0]?.example;
        if (exampleEndpointCall == null) {
            throw new Error(`No example found for endpoint ${endpoint.id}`);
        }
        return exampleEndpointCall;
    }

    public getNamespaceForServiceId(serviceId: ServiceId): string {
        const service = this.getHttpServiceOrThrow(serviceId);
        return this.getNamespaceFromFernFilepath(service.name.fernFilepath);
    }

    public getDirectoryForSubpackage(subpackage: Subpackage): string {
        return this.getDirectoryForFernFilepath(subpackage.fernFilepath);
    }

    public getDirectoryForServiceId(serviceId: ServiceId): string {
        const service = this.getHttpServiceOrThrow(serviceId);
        return this.getDirectoryForFernFilepath(service.name.fernFilepath);
    }

    public getDirectoryForFernFilepath(fernFilepath: FernFilepath): string {
        return RelativeFilePath.of([...fernFilepath.allParts.map((path) => path.pascalCase.safeName)].join("/"));
    }

    public getJsonExceptionClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: "System.Text.Json",
            name: "JsonException"
        });
    }

    public getSubpackageClassReference(subpackage: Subpackage): csharp.ClassReference {
        return csharp.classReference({
            name: `${subpackage.name.pascalCase.unsafeName}Client`,
            namespace: this.getNamespaceFromFernFilepath(subpackage.fernFilepath)
        });
    }

    public getSubpackageForServiceId(serviceId: ServiceId): Subpackage | undefined {
        return Object.values(this.ir.subpackages).find((subpackage) => subpackage.service === serviceId);
    }

    public getSubpackageForServiceIdOrThrow(serviceId: ServiceId): Subpackage {
        const subpackage = this.getSubpackageForServiceId(serviceId);
        if (subpackage == null) {
            throw new Error(`No example found for subpackage with serviceId ${serviceId}`);
        }
        return subpackage;
    }

    public getSubpackageClassReferenceForServiceIdOrThrow(serviceId: ServiceId): csharp.ClassReference {
        const subpackage = this.getSubpackageForServiceIdOrThrow(serviceId);
        return this.getSubpackageClassReference(subpackage);
    }

    private getComputedClientName(): string {
        return `${upperFirst(camelCase(this.config.organization))}${this.ir.apiName.pascalCase.unsafeName}`;
    }

    public getRootClientClassName(): string {
        if (this.customConfig["client-class-name"] != null) {
            return this.customConfig["client-class-name"];
        }
        return `${this.getComputedClientName()}Client`;
    }

    public getRootClientClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.getRootClientClassName(),
            namespace: this.getNamespace()
        });
    }

    public getBaseExceptionClassReference(): csharp.ClassReference {
        const maybeOverrideName = this.customConfig["base-exception-class-name"];
        return csharp.classReference({
            name: maybeOverrideName ?? this.getExceptionPrefix() + "Exception",
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getBaseApiExceptionClassReference(): csharp.ClassReference {
        const maybeOverrideName = this.customConfig["base-api-exception-class-name"];
        return csharp.classReference({
            name: maybeOverrideName ?? this.getExceptionPrefix() + "ApiException",
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getExceptionClassReference(declaredErrorName: DeclaredErrorName): csharp.ClassReference {
        return csharp.classReference({
            name: this.getPascalCaseSafeName(declaredErrorName.name),
            namespace: this.getNamespaceFromFernFilepath(declaredErrorName.fernFilepath)
        });
    }

    private getExceptionPrefix() {
        return this.customConfig["client-class-name"] ?? this.getComputedClientName();
    }

    public getHeadersClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.getHeadersClassName(),
            namespace: this.getCoreNamespace()
        });
    }

    public getHeadersClassName(): string {
        return "Headers";
    }

    public getRawClientClassName(): string {
        return "RawClient";
    }

    public getRawClientClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.getRawClientClassName(),
            namespace: this.getCoreNamespace()
        });
    }

    public getRawGrpcClientClassName(): string {
        return "RawGrpcClient";
    }

    public getRawGrpcClientClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.getRawGrpcClientClassName(),
            namespace: this.getCoreNamespace()
        });
    }

    public getExtensionsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "Extensions",
            namespace: this.getCoreNamespace()
        });
    }

    public getGrpcRequestOptionsName(): string {
        return "GrpcRequestOptions";
    }

    public getGrpcCreateCallOptionsMethodName(): string {
        return "CreateCallOptions";
    }

    public getGrpcRequestOptionsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: this.getGrpcRequestOptionsName(),
            namespace: this.getNamespace()
        });
    }

    public getGrpcChannelOptionsFieldName(): string {
        return "GrpcOptions";
    }

    public getGrpcChannelOptionsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "GrpcChannelOptions",
            namespace: "Grpc.Net.Client"
        });
    }

    public getCancellationTokenClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "CancellationToken",
            namespace: "System.Threading"
        });
    }

    public getCancellationTokenParameterName(): string {
        return CANCELLATION_TOKEN_PARAMETER_NAME;
    }

    public getGrpcClientInfoForServiceId(serviceId: ServiceId): GrpcClientInfo | undefined {
        const protobufService = this.protobufResolver.getProtobufServiceForServiceId(serviceId);
        if (protobufService == null) {
            return undefined;
        }
        const serviceName = this.getGrpcClientServiceName(protobufService);
        return {
            privatePropertyName: this.getGrpcClientPrivatePropertyName(protobufService),
            classReference: csharp.classReference({
                name: `${serviceName}.${serviceName}Client`,
                namespace: this.protobufResolver.getNamespaceFromProtobufFileOrThrow(protobufService.file)
            }),
            protobufService
        };
    }

    public getEnvironmentsClassReference(): csharp.ClassReference {
        let environmentsClassName: string;
        if (this.customConfig["client-class-name"] != null) {
            environmentsClassName = `${this.customConfig["client-class-name"]}Environment`;
        } else {
            environmentsClassName = `${this.getComputedClientName()}Environment`;
        }
        return csharp.classReference({
            name: environmentsClassName,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getNamespaceForPublicCoreClasses(): string {
        return (this.customConfig["root-namespace-for-core-classes"] ?? true)
            ? this.getNamespace()
            : this.getCoreNamespace();
    }

    public getBaseMockServerTestClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "BaseMockServerTest",
            namespace: this.getMockServerTestNamespace()
        });
    }

    public getClientOptionsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: CLIENT_OPTIONS_CLASS_NAME,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getRequestOptionsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: REQUEST_OPTIONS_CLASS_NAME,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getRequestOptionsInterfaceReference(): csharp.ClassReference {
        return csharp.classReference({
            name: REQUEST_OPTIONS_INTERFACE_NAME,
            namespace: this.getCoreNamespace()
        });
    }

    public getIdempotentRequestOptionsClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: IDEMPOTENT_REQUEST_OPTIONS_CLASS_NAME,
            namespace: this.getNamespaceForPublicCoreClasses()
        });
    }

    public getIdempotentRequestOptionsInterfaceClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME,
            namespace: this.getCoreNamespace()
        });
    }

    public getRequestOptionsParameterName(): string {
        return REQUEST_OPTIONS_PARAMETER_NAME;
    }

    public getIdempotentRequestOptionsParameterName(): string {
        return IDEMPOTENT_REQUEST_OPTIONS_PARAMETER_NAME;
    }

    public getRequestWrapperReference(serviceId: ServiceId, requestName: Name): csharp.ClassReference {
        const service = this.getHttpServiceOrThrow(serviceId);
        RelativeFilePath.of([...service.name.fernFilepath.allParts.map((path) => path.pascalCase.safeName)].join("/"));
        return csharp.classReference({
            name: requestName.pascalCase.safeName,
            namespace: this.getNamespaceForServiceId(serviceId)
        });
    }

    public getEndpointMethodName(endpoint: HttpEndpoint): string {
        return `${endpoint.name.pascalCase.safeName}Async`;
    }

    public endpointUsesGrpcTransport(service: HttpService, endpoint: HttpEndpoint): boolean {
        return service.transport?.type === "grpc" && endpoint.transport?.type !== "http";
    }

    public getExtraDependencies(): Record<string, string> {
        return this.customConfig["extra-dependencies"] ?? {};
    }

    public getOauthTokenProviderClassReference(): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: "OAuthTokenProvider"
        });
    }

    public getOauth(): OAuthScheme | undefined {
        if (
            this.ir.auth.schemes[0] != null &&
            this.ir.auth.schemes[0].type === "oauth" &&
            this.config.generateOauthClients
        ) {
            return this.ir.auth.schemes[0];
        }
        return undefined;
    }

    public getPagerClassReference({ itemType }: { itemType: csharp.Type }): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: "Pager",
            generics: [itemType]
        });
    }

    public getOffsetPagerClassReference({
        requestType,
        requestOptionsType,
        responseType,
        offsetType,
        stepType,
        itemType
    }: {
        requestType: csharp.Type;
        requestOptionsType: csharp.Type;
        responseType: csharp.Type;
        offsetType: csharp.Type;
        stepType: csharp.Type;
        itemType: csharp.Type;
    }): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: "OffsetPager",
            generics: [requestType, requestOptionsType, responseType, offsetType, stepType, itemType]
        });
    }

    public getCursorPagerClassReference({
        requestType,
        requestOptionsType,
        responseType,
        cursorType,
        itemType
    }: {
        requestType: csharp.Type;
        requestOptionsType: csharp.Type;
        responseType: csharp.Type;
        cursorType: csharp.Type;
        itemType: csharp.Type;
    }): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.getCoreNamespace(),
            name: "CursorPager",
            generics: [requestType, requestOptionsType, responseType, cursorType, itemType]
        });
    }

    public resolveEndpointOrThrow(service: HttpService, endpointId: EndpointId): HttpEndpoint {
        const httpEndpoint = service.endpoints.find((endpoint) => endpoint.id === endpointId);
        if (httpEndpoint == null) {
            throw new Error(`Failed to find token endpoint ${endpointId}`);
        }
        return httpEndpoint;
    }

    public getNameForField(name: NameAndWireValue): string {
        return name.name.pascalCase.safeName;
    }

    private getGrpcClientPrivatePropertyName(protobufService: ProtobufService): string {
        return `_${protobufService.name.camelCase.safeName}`;
    }

    private getGrpcClientServiceName(protobufService: ProtobufService): string {
        return protobufService.name.pascalCase.safeName;
    }

    override getChildNamespaceSegments(fernFilepath: FernFilepath): string[] {
        const segmentNames =
            this.customConfig["explicit-namespaces"] === true ? fernFilepath.allParts : fernFilepath.packagePath;
        return segmentNames.map((segmentName) => segmentName.pascalCase.safeName);
    }
}
