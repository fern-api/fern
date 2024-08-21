import { AbstractCsharpGeneratorContext, AsIsFiles, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    DeclaredErrorName,
    FernFilepath,
    HttpEndpoint,
    HttpService,
    Name,
    ProtobufService,
    ServiceId,
    Subpackage,
    SubpackageId,
    TypeId
} from "@fern-fern/ir-sdk/api";
import { camelCase, upperFirst } from "lodash-es";
import { GrpcClientInfo } from "./grpc/GrpcClientInfo";
import { CLIENT_OPTIONS_CLASS_NAME } from "./options/ClientOptionsGenerator";
import { REQUEST_OPTIONS_CLASS_NAME, REQUEST_OPTIONS_PARAMETER_NAME } from "./options/RequestOptionsGenerator";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";

const TYPES_FOLDER_NAME = "Types";
const EXCEPTIONS_FOLDER_NAME = "Exceptions";
export const WIRE_TEST_FOLDER = RelativeFilePath.of("Wire");
const CANCELLATION_TOKEN_PARAMETER_NAME = "cancellationToken";

export class SdkGeneratorContext extends AbstractCsharpGeneratorContext<SdkCustomConfigSchema> {
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

    public getCoreAsIsFiles(): string[] {
        const files = [
            AsIsFiles.RawClient,
            AsIsFiles.StringEnumSerializer,
            AsIsFiles.OneOfSerializer,
            AsIsFiles.CollectionItemSerializer,
            AsIsFiles.HttpMethodExtensions,
            AsIsFiles.Constants,
            AsIsFiles.DateTimeSerializer,
            AsIsFiles.JsonConfiguration,
            AsIsFiles.Extensions
        ];
        if (this.hasGrpcEndpoints()) {
            files.push(AsIsFiles.RawGrpcClient);
        }
        return files;
    }

    public getAsIsTestUtils(): string[] {
        return [];
    }

    public getPublicCoreAsIsFiles(): string[] {
        if (this.hasGrpcEndpoints()) {
            return [AsIsFiles.GrpcRequestOptions];
        }
        return [];
    }

    public getNamespaceForServiceId(serviceId: ServiceId): string {
        const service = this.getHttpServiceOrThrow(serviceId);
        return this.getNamespaceFromFernFilepath(service.name.fernFilepath);
    }

    public getDirectoryForSubpackage(subpackage: Subpackage): string {
        return RelativeFilePath.of(
            [...subpackage.fernFilepath.allParts.map((path) => path.pascalCase.safeName)].join("/")
        );
    }

    public getDirectoryForServiceId(serviceId: ServiceId): string {
        const service = this.getHttpServiceOrThrow(serviceId);
        return RelativeFilePath.of(
            [...service.name.fernFilepath.allParts.map((path) => path.pascalCase.safeName)].join("/")
        );
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
        return this.customConfig["root-namespace-for-core-classes"] ?? true
            ? this.getNamespace()
            : this.getCoreNamespace();
    }

    public getBaseWireTestClassReference(): csharp.ClassReference {
        return csharp.classReference({
            name: "BaseWireTest",
            namespace: this.getWireTestNamespace()
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

    public getRequestOptionsParameterName(): string {
        return REQUEST_OPTIONS_PARAMETER_NAME;
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

    public getExtraDependencies(): Record<string, string> {
        return this.customConfig["extra-dependencies"] ?? {};
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
