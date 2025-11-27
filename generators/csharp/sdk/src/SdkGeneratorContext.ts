import { fail } from "node:assert";
import { AbstractFormatter, GeneratorNotificationService, NopFormatter } from "@fern-api/base-generator";
import { AsIsFiles, GeneratorContext } from "@fern-api/csharp-base";
import { ast, CsharpConfigSchema, Generation } from "@fern-api/csharp-codegen";

import { CsharpFormatter } from "@fern-api/csharp-formatter";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
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
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";

export class SdkGeneratorContext extends GeneratorContext {
    public readonly formatter: AbstractFormatter;
    public readonly nopFormatter: AbstractFormatter;
    public readonly endpointGenerator: EndpointGenerator;
    public readonly generatorAgent: CsharpGeneratorAgent;
    public readonly snippetGenerator: EndpointSnippetsGenerator;
    public constructor(
        ir: IntermediateRepresentation,
        config: FernGeneratorExec.config.GeneratorConfig,
        customConfig: CsharpConfigSchema,
        generatorNotificationService: GeneratorNotificationService
    ) {
        super(
            ir,
            config,
            customConfig,
            generatorNotificationService,
            new Generation(ir, ir.apiName.pascalCase.unsafeName, customConfig, config, {
                makeRelativeFilePath: (path: string) => RelativeFilePath.of(path),
                makeAbsoluteFilePath: (path: string) => AbsoluteFilePath.of(path),
                getNamespaceForTypeId: (typeId: TypeId) => this.getNamespaceForTypeId(typeId),
                getDirectoryForTypeId: (typeId: TypeId) => this.getDirectoryForTypeId(typeId),
                getCoreAsIsFiles: () => this.getCoreAsIsFiles(),
                getCoreTestAsIsFiles: () => this.getCoreTestAsIsFiles(),
                getPublicCoreAsIsFiles: () => this.getPublicCoreAsIsFiles(),
                getAsyncCoreAsIsFiles: () => this.getAsyncCoreAsIsFiles(),
                getChildNamespaceSegments: (fernFilepath: FernFilepath) => this.getChildNamespaceSegments(fernFilepath)
            })
        );
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
        return this.Collection.list(
            this.System.Collections.Generic.KeyValuePair(this.Primitive.string, this.Primitive.string)
        );
    }

    public getAdditionalBodyPropertiesType(): ast.Type {
        return this.Primitive.object.asOptional();
    }

    public getSubpackage(subpackageId: SubpackageId): Subpackage | undefined {
        return this.ir.subpackages[subpackageId];
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
        const typeDeclaration = this.model.dereferenceType(typeId).typeDeclaration;
        return RelativeFilePath.of(
            [
                ...typeDeclaration.name.fernFilepath.allParts.map((path: Name) => path.pascalCase.safeName),
                this.constants.folders.types
            ].join("/")
        );
    }

    public getDirectoryForError(declaredErrorName: DeclaredErrorName): RelativeFilePath {
        return RelativeFilePath.of(
            [
                ...declaredErrorName.fernFilepath.allParts.map((path) => path.pascalCase.safeName),
                this.constants.folders.exceptions
            ].join("/")
        );
    }

    public getNamespaceForTypeId(typeId: TypeId): string {
        const typeDeclaration = this.model.dereferenceType(typeId).typeDeclaration;
        return this.getNamespaceFromFernFilepath(typeDeclaration.name.fernFilepath);
    }

    public getAccessFromRootClient(fernFilepath: FernFilepath): string {
        const clientAccessParts = fernFilepath.allParts.map((part) => part.pascalCase.safeName);
        return clientAccessParts.length > 0
            ? `${this.names.variables.client}.${clientAccessParts.join(".")}`
            : this.names.variables.client;
    }

    public includePathParametersInWrappedRequest({
        endpoint,
        wrapper
    }: {
        endpoint: HttpEndpoint;
        wrapper: SdkRequestWrapper;
    }): boolean {
        const inlinePathParameters = this.settings.shouldInlinePathParameters;
        const wrapperShouldIncludePathParameters = wrapper.includePathParameters ?? false;
        return endpoint.allPathParameters.length > 0 && inlinePathParameters && wrapperShouldIncludePathParameters;
    }

    public hasFormUrlEncodedEndpoints(): boolean {
        return Object.values(this.ir.services).some((service) =>
            service.endpoints.some(
                (endpoint) => endpoint.requestBody?.contentType === "application/x-www-form-urlencoded"
            )
        );
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

        if (this.hasFormUrlEncodedEndpoints()) {
            files.push(AsIsFiles.FormRequest);
        }

        if (this.settings.includeExceptionHandler) {
            files.push(AsIsFiles.ExceptionHandler);
        }
        if (this.hasGrpcEndpoints()) {
            files.push(AsIsFiles.RawGrpcClient);
        }
        if (this.hasPagination()) {
            files.push(AsIsFiles.Page);
            files.push(AsIsFiles.Pager);
        }
        if (this.settings.isForwardCompatibleEnumsEnabled) {
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
        if (this.settings.generateNewAdditionalProperties) {
            files.push(AsIsFiles.Test.Json.AdditionalPropertiesTests);
        }
        if (this.settings.isForwardCompatibleEnumsEnabled) {
            files.push(AsIsFiles.Test.Json.StringEnumSerializerTests);
        } else {
            files.push(AsIsFiles.Test.Json.EnumSerializerTests);
        }
        if (this.hasPagination()) {
            AsIsFiles.Test.Pagination.forEach((file) => files.push(file));
        }

        return files;
    }

    public getAsyncCoreAsIsFiles(): string[] {
        if (this.hasWebSocketEndpoints) {
            // recurse thru all the entries in AsIsFiles.WebSocketAsync and create the files from the templates
            const files: string[] = [];

            async function recurse(name: string, entries: Record<string, string | object>) {
                for (const [key, entry] of Object.entries(entries)) {
                    const filename = `${name}/${key}`;
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
        const files = [AsIsFiles.FileParameter, AsIsFiles.RawResponse];
        if (this.settings.generateNewAdditionalProperties) {
            files.push(AsIsFiles.Json.AdditionalProperties);
        }
        if (this.hasGrpcEndpoints()) {
            files.push(AsIsFiles.GrpcRequestOptions);
        }
        return files;
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
        const service = this.getHttpService(serviceId) ?? fail(`Service with id ${serviceId} not found`);
        return this.getDirectoryForFernFilepath(service.name.fernFilepath);
    }

    public getDirectoryForFernFilepath(fernFilepath: FernFilepath): string {
        return RelativeFilePath.of([...fernFilepath.allParts.map((path) => path.pascalCase.safeName)].join("/"));
    }

    public getEndpointMethodName(endpoint: HttpEndpoint): string {
        return `${endpoint.name.pascalCase.safeName}Async`;
    }

    public endpointUsesGrpcTransport(service: HttpService, endpoint: HttpEndpoint): boolean {
        return service.transport?.type === "grpc" && endpoint.transport?.type !== "http";
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

    public resolveEndpoint(service: HttpService, endpointId: EndpointId): HttpEndpoint {
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
     * Gets all the subpackages from a given list of subpackage ids
     * If the subpackage has no endpoints, but it has children with endpoints, then skip this one and give me the children
     *
     * This has the net effect of eliminating empty levels that shoulnd't be in the SDK.
     *
     * @param subpackageIds - The list of subpackage ids to get.
     * @returns The list of subpackages that have endpoints or children with endpoints.
     */
    public getSubpackages(subpackageIds: string[]): Subpackage[] {
        // get the actual subpackage objects
        const subpackages = subpackageIds
            .map((subpackageId) => this.getSubpackage(subpackageId))
            .filter((subpackage) => subpackage != null);

        return subpackages;
    }

    /**
     * Checks if a specific subpackage has any endpoints .
     * @param subpackage - The subpackage to check.
     * @returns True if the subpackage has a service, false otherwise.
     */
    public subPackageHasEndpoints(subpackage?: Subpackage): boolean {
        if (subpackage == null) {
            return false;
        }
        const service = this.getHttpService(subpackage.service);
        if (service == null) {
            return false;
        }

        return !!this.getHttpService(subpackage?.service)?.endpoints?.length;
    }

    /**
     * Checks if a specific subpackage has any WebSocket endpoints.
     * @param subpackage
     * @returns
     */
    public subPackageHasWebsocketEndpoints(subpackage?: Subpackage): boolean {
        return this.settings.enableWebsockets && subpackage != null && !!subpackage.websocket?.length;
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
    public subPackageHasEndpointsRecursively(subpackage?: Subpackage): boolean {
        return (
            subpackage != null &&
            (subpackage.hasEndpointsInTree ||
                subpackage.subpackages.some(
                    (pkg) =>
                        this.subPackageHasEndpointsRecursively(this.getSubpackage(pkg)) ||
                        this.subPackageHasWebsocketEndpointsRecursively(this.getSubpackage(pkg))
                ))
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
    public subPackageHasWebsocketEndpointsRecursively(subpackage?: Subpackage): boolean {
        return (
            subpackage != null &&
            this.settings.enableWebsockets &&
            (subpackage.websocket != null ||
                subpackage.subpackages.some((pkg) =>
                    this.subPackageHasWebsocketEndpointsRecursively(this.getSubpackage(pkg))
                ))
        );
    }

    #doesIrHaveCustomPagination: boolean | undefined;

    public override shouldCreateCustomPagination(): boolean {
        if (this.#doesIrHaveCustomPagination === undefined) {
            this.#doesIrHaveCustomPagination = Object.values(this.ir.services).some((service) =>
                service.endpoints.some((endpoint) => endpoint.pagination?.type === "custom")
            );
        }
        return this.#doesIrHaveCustomPagination;
    }

    getChildNamespaceSegments(fernFilepath: FernFilepath): string[] {
        const segmentNames = this.settings.explicitNamespaces ? fernFilepath.allParts : fernFilepath.packagePath;
        return segmentNames.map((segmentName) => segmentName.pascalCase.safeName);
    }
}
