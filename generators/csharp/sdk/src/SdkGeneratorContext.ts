import { fail } from "node:assert";
import { AbstractFormatter, GeneratorNotificationService, NopFormatter } from "@fern-api/base-generator";
import { AsIsFiles, BaseCsharpGeneratorContext } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { CsharpFormatter } from "@fern-api/csharp-formatter";
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
    NameAndWireValue,
    OAuthScheme,
    SdkRequestWrapper,
    ServiceId,
    Subpackage,
    SubpackageId,
    TypeId,
    WellKnownProtobufType
} from "@fern-fern/ir-sdk/api";
import { CsharpGeneratorAgent } from "./CsharpGeneratorAgent";
import { EndpointGenerator } from "./endpoint/EndpointGenerator";
import { EndpointSnippetsGenerator } from "./endpoint/snippets/EndpointSnippetsGenerator";
import { IDEMPOTENT_REQUEST_OPTIONS_PARAMETER_NAME } from "./options/IdempotentRequestOptionsInterfaceGenerator";
import { REQUEST_OPTIONS_PARAMETER_NAME } from "./options/RequestOptionsInterfaceGenerator";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";

const TYPES_FOLDER_NAME = "Types";
const EXCEPTIONS_FOLDER_NAME = "Exceptions";
export const MOCK_SERVER_TEST_FOLDER = RelativeFilePath.of("Unit/MockServer");
const CANCELLATION_TOKEN_PARAMETER_NAME = "cancellationToken";

export class SdkGeneratorContext extends BaseCsharpGeneratorContext<SdkCustomConfigSchema> {
    public readonly formatter: AbstractFormatter;
    public readonly nopFormatter: AbstractFormatter;
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
        this.formatter = new CsharpFormatter();
        this.nopFormatter = new NopFormatter();
        this.endpointGenerator = new EndpointGenerator({ context: this });
        this.generatorAgent = new CsharpGeneratorAgent({
            logger: this.logger,
            config: this.config,
            readmeConfigBuilder: new ReadmeConfigBuilder(),
            ir: this.ir
        });
        this.snippetGenerator = new EndpointSnippetsGenerator({ context: this });
    }

    public getAdditionalQueryParametersType(): ast.Type {
        return this.csharp.Type.list(
            this.csharp.Type.reference(
                this.getKeyValuePairsClassReference({
                    key: this.csharp.Type.string(),
                    value: this.csharp.Type.string()
                })
            )
        );
    }

    public getAdditionalBodyPropertiesType(): ast.Type {
        return this.csharp.Type.optional(this.csharp.Type.object());
    }

    public getSubpackageOrThrow(subpackageId: SubpackageId): Subpackage {
        return this.ir.subpackages[subpackageId] || fail(`Subpackage with id ${subpackageId} not found`);
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

    // todo: why is this different from the ModelGeneratorContext?
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

    public shouldInlinePathParameters(): boolean {
        return this.customConfig["inline-path-parameters"] ?? true;
    }

    public includePathParametersInWrappedRequest({
        endpoint,
        wrapper
    }: {
        endpoint: HttpEndpoint;
        wrapper: SdkRequestWrapper;
    }): boolean {
        const inlinePathParameters = this.shouldInlinePathParameters();
        const wrapperShouldIncludePathParameters = wrapper.includePathParameters ?? false;
        return endpoint.allPathParameters.length > 0 && inlinePathParameters && wrapperShouldIncludePathParameters;
    }

    public includeExceptionHandler(): boolean {
        return this.customConfig["include-exception-handler"] ?? false;
    }

    public generateMockServerTests(): boolean {
        return this.customConfig["generate-mock-server-tests"] ?? true;
    }

    public getRawAsIsFiles(): string[] {
        return [AsIsFiles.EditorConfig, AsIsFiles.GitIgnore];
    }

    public getCoreAsIsFiles(): string[] {
        const files = [AsIsFiles.Constants, AsIsFiles.Extensions, AsIsFiles.ValueConvert];
        // JSON stuff
        files.push(
            ...[
                AsIsFiles.Json.CollectionItemSerializer,
                AsIsFiles.Json.DateOnlyConverter,
                AsIsFiles.Json.DateTimeSerializer,
                AsIsFiles.Json.JsonAccessAttribute,
                AsIsFiles.Json.JsonConfiguration,
                AsIsFiles.Json.OneOfSerializer
            ]
        );
        // HTTP stuff
        files.push(
            ...[
                AsIsFiles.ApiResponse,
                AsIsFiles.BaseRequest,
                AsIsFiles.EmptyRequest,
                AsIsFiles.EncodingCache,
                AsIsFiles.FormUrlEncoder,
                AsIsFiles.Headers,
                AsIsFiles.HeaderValue,
                AsIsFiles.HttpMethodExtensions,
                AsIsFiles.IIsRetryableContent,
                AsIsFiles.JsonRequest,
                AsIsFiles.MultipartFormRequest,
                // AsIsFiles.NdJsonContent,
                // AsIsFiles.NdJsonRequest,
                AsIsFiles.QueryStringConverter,
                AsIsFiles.RawClient,
                AsIsFiles.StreamRequest
            ]
        );
        if (this.includeExceptionHandler()) {
            files.push(AsIsFiles.ExceptionHandler);
        }
        if (this.hasGrpcEndpoints()) {
            files.push(AsIsFiles.RawGrpcClient);
        }
        if (this.hasPagination()) {
            files.push(AsIsFiles.Page);
            files.push(AsIsFiles.Pager);
        }
        if (this.isForwardCompatibleEnumsEnabled()) {
            files.push(AsIsFiles.StringEnum);
            files.push(AsIsFiles.StringEnumExtensions);
            files.push(AsIsFiles.Json.StringEnumSerializer);
        } else {
            files.push(AsIsFiles.Json.EnumSerializer);
        }
        const resolvedProtoAnyType = this.protobufResolver.resolveWellKnownProtobufType(WellKnownProtobufType.any());
        if (resolvedProtoAnyType != null) {
            files.push(AsIsFiles.ProtoAnyMapper);
        }
        return files;
    }

    public hasPagination(): boolean {
        return this.config.generatePaginatedClients === true && this.ir.sdkConfig.hasPaginatedEndpoints;
    }

    public getCoreTestAsIsFiles(): string[] {
        const files = [
            AsIsFiles.Test.Json.DateOnlyJsonTests,
            AsIsFiles.Test.Json.DateTimeJsonTests,
            AsIsFiles.Test.Json.JsonAccessAttributeTests,
            AsIsFiles.Test.Json.OneOfSerializerTests,
            AsIsFiles.Test.QueryStringConverterTests,
            AsIsFiles.Test.RawClientTests.AdditionalHeadersTests,
            AsIsFiles.Test.RawClientTests.AdditionalParametersTests,
            AsIsFiles.Test.RawClientTests.MultipartFormTests,
            AsIsFiles.Test.RawClientTests.RetriesTests,
            AsIsFiles.Test.RawClientTests.QueryParameterTests
        ];
        if (this.hasIdempotencyHeaders()) {
            files.push(AsIsFiles.Test.RawClientTests.IdempotentHeadersTests);
        }
        if (this.generateNewAdditionalProperties()) {
            files.push(AsIsFiles.Test.Json.AdditionalPropertiesTests);
        }
        if (this.isForwardCompatibleEnumsEnabled()) {
            files.push(AsIsFiles.Test.Json.StringEnumSerializerTests);
        } else {
            files.push(AsIsFiles.Test.Json.EnumSerializerTests);
        }
        if (this.hasPagination()) {
            AsIsFiles.Test.Pagination.forEach((file) => files.push(file));
        }

        return files;
    }

    public getAsyncCoreNamespace(): string {
        return `${this.getCoreNamespace()}.Async`;
    }

    public getAsyncApiOptionsClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: "AsyncApiOptions",
            namespace: `${this.getAsyncCoreNamespace()}.Models`
        });
    }

    public getAsyncApiClassReference(
        genericType: ast.ClassReference | ast.Type | ast.TypeParameter
    ): ast.ClassReference {
        return this.csharp.classReference({
            name: "AsyncApi",
            namespace: `${this.getAsyncCoreNamespace()}`,
            generics: [genericType]
        });
    }

    public getQueryBuilderClassReference(): ast.ClassReference {
        return this.csharp.classReference({
            name: "Query",
            namespace: this.getAsyncCoreNamespace()
        });
    }

    public getAsyncEventClassReference(
        genericType?: ast.ClassReference | ast.Type | ast.TypeParameter
    ): ast.ClassReference {
        return this.csharp.classReference({
            name: "Event",
            namespace: `${this.getAsyncCoreNamespace()}.Events`,
            generics: genericType ? [genericType] : []
        });
    }

    public getAsyncCoreAsIsFiles(): string[] {
        if (this.hasWebSocketEndpoints) {
            // recurse thru all the entries in AsIsFiles.WebSocketAsync and create the files from the templates
            const files: string[] = [];

            async function recurse(name: string, entries: Record<string, string | object>) {
                for (const [key, entry] of Object.entries(entries)) {
                    const filename = name + "/" + key;
                    if (typeof entry === "string") {
                        files.push(entry);
                    } else {
                        await recurse(filename, entry as Record<string, string | object>);
                    }
                }
            }
            recurse("Async", AsIsFiles.WebSocketAsync);
            return files;
        }

        return [];
    }

    public getPublicCoreAsIsFiles(): string[] {
        const files = [AsIsFiles.FileParameter];
        if (this.generateNewAdditionalProperties()) {
            files.push(AsIsFiles.Json.AdditionalProperties);
        }
        if (this.hasGrpcEndpoints()) {
            files.push(AsIsFiles.GrpcRequestOptions);
        }
        return files;
    }

    public getPublicCoreTestAsIsFiles(): string[] {
        return [];
    }

    public getAsIsTestUtils(): string[] {
        return Object.values(AsIsFiles.Test.Utils);
    }

    public getExampleEndpointCallIfExists(endpoint: HttpEndpoint): ExampleEndpointCall | undefined {
        if (endpoint.userSpecifiedExamples.length > 0) {
            const exampleEndpointCall = endpoint.userSpecifiedExamples[0]?.example;
            if (exampleEndpointCall != null) {
                return exampleEndpointCall;
            }
        }
        const exampleEndpointCall = endpoint.autogeneratedExamples[0]?.example;
        if (exampleEndpointCall == null) {
            // just warn if there is no example for a given endpoint
            // if there turns out to be none at all, it will throw later.
            this.logger.warn(`No example found for endpoint ${endpoint.id} -- skipping.`);
            return undefined;
        }
        return exampleEndpointCall;
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

    public getRootClientAccess(): ast.Access {
        return this.customConfig["root-client-class-access"] ?? ast.Access.Public;
    }

    public getCancellationTokenParameterName(): string {
        return CANCELLATION_TOKEN_PARAMETER_NAME;
    }

    public getRequestOptionsParameterName(): string {
        return REQUEST_OPTIONS_PARAMETER_NAME;
    }

    public getIdempotentRequestOptionsParameterName(): string {
        return IDEMPOTENT_REQUEST_OPTIONS_PARAMETER_NAME;
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

    public resolveEndpointOrThrow(service: HttpService, endpointId: EndpointId): HttpEndpoint {
        const httpEndpoint = service.endpoints.find((endpoint) => endpoint.id === endpointId);
        if (httpEndpoint == null) {
            throw new Error(`Failed to find token endpoint ${endpointId}`);
        }
        return httpEndpoint;
    }

    public isSelfHosted(): boolean {
        return this.ir.selfHosted ?? false;
    }

    public getNameForField(name: NameAndWireValue): string {
        return name.name.pascalCase.safeName;
    }

    /**
     * Recursively checks if a subpackage has endpoints.
     * @param subpackage - The subpackage to check.
     * @returns True if the subpackage has endpoints, false otherwise.
     *
     * @remarks
     * The `hasEndpointInTree` member may not always be perfectly accurate.
     *
     * This method is a interim workaround that recursively checks all
     * subpackages in order to determine if the subpackage has endpoints.
     *
     * If a child subpackage has a WebSocket endpoint, it will be included in the check.
     *
     * There may be other cases that this method does not handle (GRPC, etc?)
     */
    public subPackageHasEndpoints(subpackage: Subpackage): boolean {
        return (
            subpackage.hasEndpointsInTree ||
            subpackage.subpackages.some(
                (pkg) =>
                    this.subPackageHasEndpoints(this.getSubpackageOrThrow(pkg)) ||
                    this.subPackageHasWebsocketEndpoints(this.getSubpackageOrThrow(pkg))
            )
        );
    }

    /**
     * Recursively checks if a subpackage contains WebSocket endpoints.
     *
     * @param subpackage - The subpackage to check for WebSocket endpoints.
     * @returns True if the subpackage has WebSocket endpoints, false otherwise.
     *
     * @remarks
     * This method only returns true if WebSockets are enabled via the `enableWebsockets`
     * configuration flag. It recursively traverses the subpackage tree to check for:
     * - Direct WebSocket endpoints in the current subpackage
     * - WebSocket endpoints in any nested subpackages
     *
     * The method will return false if WebSockets are disabled, regardless of whether
     * the subpackage actually contains WebSocket endpoint definitions.
     */
    public subPackageHasWebsocketEndpoints(subpackage: Subpackage): boolean {
        return (
            this.enableWebsockets &&
            (subpackage.websocket != null ||
                subpackage.subpackages.some((pkg) =>
                    this.subPackageHasWebsocketEndpoints(this.getSubpackageOrThrow(pkg))
                ))
        );
    }

    #doesIrHaveCustomPagination: boolean | undefined;

    public shouldCreateCustomPagination(): boolean {
        if (this.#doesIrHaveCustomPagination === undefined) {
            this.#doesIrHaveCustomPagination = Object.values(this.ir.services).some((service) =>
                service.endpoints.some((endpoint) => endpoint.pagination?.type === "custom")
            );
        }
        return this.#doesIrHaveCustomPagination;
    }

    override getChildNamespaceSegments(fernFilepath: FernFilepath): string[] {
        const segmentNames =
            this.customConfig["explicit-namespaces"] === true ? fernFilepath.allParts : fernFilepath.packagePath;
        return segmentNames.map((segmentName) => segmentName.pascalCase.safeName);
    }
}
