import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { assertNever, SetRequired } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    ExportsManager,
    getParameterNameForRootPathParameter,
    getPropertyKey,
    getTextOfTsNode,
    ImportsManager,
    maybeAddDocsStructure,
    NpmPackage,
    PackageId
} from "@fern-typescript/commons";
import {
    EndpointSampleCode,
    FileContext,
    GeneratedEndpointImplementation,
    GeneratedSdkClientClass,
    GeneratedWebsocketImplementation
} from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";
import {
    ClassDeclarationStructure,
    InterfaceDeclarationStructure,
    MethodDeclarationStructure,
    ModuleDeclarationStructure,
    OptionalKind,
    PropertySignatureStructure,
    Scope,
    StructureKind,
    TypeAliasDeclarationStructure,
    ts
} from "ts-morph";
import { Code, code } from "ts-poet";
import {
    AnyAuthProviderInstance,
    AuthProviderInstance,
    BasicAuthProviderInstance,
    BearerAuthProviderInstance,
    HeaderAuthProviderInstance,
    InferredAuthProviderInstance,
    OAuthAuthProviderInstance,
    RoutingAuthProviderInstance
} from "./auth-provider/index.js";
import { GeneratedBytesEndpointRequest } from "./endpoint-request/GeneratedBytesEndpointRequest.js";
import { GeneratedDefaultEndpointRequest } from "./endpoint-request/GeneratedDefaultEndpointRequest.js";
import { GeneratedFileUploadEndpointRequest } from "./endpoint-request/GeneratedFileUploadEndpointRequest.js";
import { GeneratedNonThrowingEndpointResponse } from "./endpoints/default/endpoint-response/GeneratedNonThrowingEndpointResponse.js";
import { GeneratedThrowingEndpointResponse } from "./endpoints/default/endpoint-response/GeneratedThrowingEndpointResponse.js";
import {
    GRAPHQL_THROW_ON_ERROR_REQUEST_OPTION,
    getGraphqlTransport,
    isGraphqlSubscription
} from "./endpoints/default/endpoint-response/graphqlResponseBody.js";
import { GeneratedDefaultEndpointImplementation } from "./endpoints/default/GeneratedDefaultEndpointImplementation.js";
import { detectGraphqlConnection, findNestedGraphqlConnections } from "./graphql-pagination/detectGraphqlConnection.js";
import { GeneratedFileDownloadEndpointImplementation } from "./endpoints/GeneratedFileDownloadEndpointImplementation.js";
import { GeneratedGraphqlSubscriptionEndpointImplementation } from "./endpoints/GeneratedGraphqlSubscriptionEndpointImplementation.js";
import { GeneratedStreamingEndpointImplementation } from "./endpoints/GeneratedStreamingEndpointImplementation.js";
import { getClientDefaultValue, isLiteralHeader } from "./endpoints/utils/isLiteralHeader.js";
import { GeneratedWrappedService } from "./GeneratedWrappedService.js";
import { GeneratedDefaultWebsocketImplementation } from "./websocket/GeneratedDefaultWebsocketImplementation.js";

/** Narrows a generated endpoint implementation to a GraphQL subscription. */
function isGraphqlSubscriptionEndpoint(
    endpoint: GeneratedEndpointImplementation
): endpoint is GeneratedGraphqlSubscriptionEndpointImplementation {
    return (
        endpoint instanceof GeneratedGraphqlSubscriptionEndpointImplementation ||
        (endpoint as Partial<GeneratedGraphqlSubscriptionEndpointImplementation>).isGraphqlSubscription === true
    );
}

export declare namespace GeneratedSdkClientClassImpl {
    export interface Init {
        caseConverter: CaseConverter;
        isRoot: boolean;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        intermediateRepresentation: FernIr.IntermediateRepresentation;
        packageId: PackageId;
        serviceClassName: string;
        errorResolver: ErrorResolver;
        packageResolver: PackageResolver;
        neverThrowErrors: boolean;
        includeCredentialsOnCrossOriginRequests: boolean;
        allowCustomFetcher: boolean;
        generateWebSocketClients: boolean;
        requireDefaultEnvironment: boolean;
        defaultTimeoutInSeconds: number | "infinity" | undefined;
        includeContentHeadersOnFileDownloadResponse: boolean;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        inlineFileProperties: boolean;
        omitUndefined: boolean;
        allowExtraFields: boolean;
        streamType: "wrapper" | "web";
        fileResponseType: "stream" | "binary-response";
        formDataSupport: "Node16" | "Node18";
        useDefaultRequestParameterValues: boolean;
        generateEndpointMetadata: boolean;
        parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
        offsetSemantics: "item-index" | "page-index";
        alwaysSendAuth: boolean;
    }
}

export class GeneratedSdkClientClassImpl implements GeneratedSdkClientClass {
    private static readonly REQUEST_OPTIONS_INTERFACE_NAME = "RequestOptions";
    private static readonly IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME = "IdempotentRequestOptions";
    private static readonly TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME = "timeoutInSeconds";
    private static readonly ABORT_SIGNAL_PROPERTY_NAME = "abortSignal";
    private static readonly MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME = "maxRetries";
    private static readonly CUSTOM_FETCHER_PROPERTY_NAME = "fetcher";
    public static readonly BASE_URL_OPTION_PROPERTY_NAME = "baseUrl";
    public static readonly ENVIRONMENT_OPTION_PROPERTY_NAME = "environment";
    public static readonly OPTIONS_INTERFACE_NAME = "Options";
    public static readonly OPTIONS_PRIVATE_MEMBER = "_options";
    private static readonly OPTIONS_PARAMETER_NAME = "options";
    public static readonly METADATA_FOR_TOKEN_SUPPLIER_VAR = "_metadata";
    public static readonly AUTH_PROVIDER_FIELD_NAME = "authProvider";
    public static readonly LOGGING_FIELD_NAME = "logging";

    private readonly case: CaseConverter;
    private readonly isRoot: boolean;
    private readonly intermediateRepresentation: FernIr.IntermediateRepresentation;
    private readonly serviceClassName: string;
    private readonly package_: FernIr.Package;
    private readonly generatedEndpointImplementations: GeneratedEndpointImplementation[];
    private readonly generatedWebsocketImplementation: GeneratedWebsocketImplementation | undefined;
    private readonly generatedWrappedServices: GeneratedWrappedService[];
    private readonly allowCustomFetcher: boolean;
    private readonly generateWebSocketClients: boolean;
    private readonly packageResolver: PackageResolver;
    private readonly requireDefaultEnvironment: boolean;
    private readonly packageId: PackageId;
    private readonly hasGraphqlEndpoint: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    private readonly inlineFileProperties: boolean;
    private readonly includeSerdeLayer: boolean;
    private readonly omitUndefined: boolean;
    private readonly formDataSupport: "Node16" | "Node18";
    private readonly allowExtraFields: boolean;
    private readonly exportsManager: ExportsManager;
    private readonly authProvider: AuthProviderInstance | undefined;
    private readonly anyEndpointWithAuth: boolean;
    private readonly generateEndpointMetadata: boolean;
    private readonly offsetSemantics: "item-index" | "page-index";
    private readonly alwaysSendAuth: boolean;

    constructor({
        caseConverter,
        isRoot,
        intermediateRepresentation,
        serviceClassName,
        packageId,
        errorResolver,
        packageResolver,
        neverThrowErrors,
        includeCredentialsOnCrossOriginRequests,
        allowCustomFetcher,
        generateWebSocketClients,
        requireDefaultEnvironment,
        defaultTimeoutInSeconds,
        includeContentHeadersOnFileDownloadResponse,
        includeSerdeLayer,
        retainOriginalCasing,
        inlineFileProperties,
        omitUndefined,
        allowExtraFields,
        exportsManager,
        streamType,
        fileResponseType,
        formDataSupport,
        generateEndpointMetadata,
        parameterNaming,
        offsetSemantics,
        alwaysSendAuth
    }: GeneratedSdkClientClassImpl.Init) {
        this.case = caseConverter;
        this.isRoot = isRoot;
        this.intermediateRepresentation = intermediateRepresentation;
        this.serviceClassName = serviceClassName;
        this.packageId = packageId;
        this.allowCustomFetcher = allowCustomFetcher;
        this.generateWebSocketClients = generateWebSocketClients;
        this.packageResolver = packageResolver;
        this.requireDefaultEnvironment = requireDefaultEnvironment;
        this.retainOriginalCasing = retainOriginalCasing;
        this.inlineFileProperties = inlineFileProperties;
        this.includeSerdeLayer = includeSerdeLayer;
        this.omitUndefined = omitUndefined;
        this.allowExtraFields = allowExtraFields;
        this.formDataSupport = formDataSupport;
        this.exportsManager = exportsManager;
        this.generateEndpointMetadata = generateEndpointMetadata;
        this.parameterNaming = parameterNaming;
        this.offsetSemantics = offsetSemantics;
        this.alwaysSendAuth = alwaysSendAuth;

        const package_ = packageResolver.resolvePackage(packageId);
        this.package_ = package_;

        const service = packageResolver.getServiceDeclaration(packageId);

        this.anyEndpointWithAuth = anyEndpointWithAuth({ packageId, packageResolver });

        const websocketChannel = packageResolver.getWebSocketChannelDeclaration(packageId);
        const websocketChannelId = this.package_.websocket ?? undefined;

        // `throwOnError` only applies to the GraphQL query/mutation request/response path; subscriptions
        // stream events and are not enveloped, so a subscription-only client gets no `throwOnError`.
        this.hasGraphqlEndpoint =
            service?.endpoints.some(
                (endpoint) => getGraphqlTransport(endpoint) != null && !isGraphqlSubscription(endpoint)
            ) ?? false;

        if (service == null) {
            this.generatedEndpointImplementations = [];
        } else {
            this.generatedEndpointImplementations = service.endpoints.map((endpoint: FernIr.HttpEndpoint) => {
                const requestBody = endpoint.requestBody ?? undefined;

                const getGeneratedEndpointRequest = () => {
                    return this.getGeneratedEndpointRequest({
                        endpoint,
                        requestBody,
                        packageId,
                        service
                    });
                };

                const getGeneratedEndpointResponse = ({
                    response
                }: {
                    response:
                        | FernIr.HttpResponseBody.Json
                        | FernIr.HttpResponseBody.FileDownload
                        | FernIr.HttpResponseBody.Text
                        | FernIr.HttpResponseBody.Streaming
                        | FernIr.HttpResponseBody.Bytes
                        | undefined;
                }) => {
                    if (neverThrowErrors) {
                        return new GeneratedNonThrowingEndpointResponse({
                            packageId,
                            endpoint,
                            errorDiscriminationStrategy: intermediateRepresentation.errorDiscriminationStrategy,
                            errorResolver,
                            response,
                            includeSerdeLayer,
                            streamType,
                            fileResponseType
                        });
                    } else {
                        return new GeneratedThrowingEndpointResponse({
                            packageId,
                            endpoint,
                            errorDiscriminationStrategy: intermediateRepresentation.errorDiscriminationStrategy,
                            errorResolver,
                            response,
                            includeContentHeadersOnResponse: includeContentHeadersOnFileDownloadResponse,
                            clientClass: this,
                            streamType,
                            fileResponseType,
                            offsetSemantics: this.offsetSemantics
                        });
                    }
                };

                const getDefaultEndpointImplementation = ({
                    response
                }: {
                    response:
                        | FernIr.HttpResponseBody.Json
                        | FernIr.HttpResponseBody.FileDownload
                        | FernIr.HttpResponseBody.Text
                        | undefined;
                }) => {
                    return new GeneratedDefaultEndpointImplementation({
                        endpoint,
                        request: getGeneratedEndpointRequest(),
                        response: getGeneratedEndpointResponse({ response }),
                        generatedSdkClientClass: this,
                        includeCredentialsOnCrossOriginRequests,
                        defaultTimeoutInSeconds,
                        includeSerdeLayer,
                        retainOriginalCasing: this.retainOriginalCasing,
                        omitUndefined: this.omitUndefined,
                        generateEndpointMetadata: this.generateEndpointMetadata,
                        parameterNaming
                    });
                };

                // GraphQL subscriptions stream over a WebSocket (graphql-transport-ws) rather than a
                // single POST, so they get a dedicated implementation. Queries/mutations continue to
                // use the default POST implementation below.
                const graphqlTransport = getGraphqlTransport(endpoint);
                if (graphqlTransport != null && graphqlTransport.operationType?.toUpperCase() === "SUBSCRIPTION") {
                    const jsonResponse = endpoint.response?.body?.type === "json" ? endpoint.response.body : undefined;
                    return new GeneratedGraphqlSubscriptionEndpointImplementation({
                        packageId,
                        endpoint,
                        graphqlTransport,
                        request: getGeneratedEndpointRequest(),
                        response: getGeneratedEndpointResponse({ response: jsonResponse }),
                        generatedSdkClientClass: this
                    });
                }

                if (endpoint.response?.body == null) {
                    return getDefaultEndpointImplementation({ response: undefined });
                }

                return FernIr.HttpResponseBody._visit<GeneratedEndpointImplementation>(endpoint.response.body, {
                    fileDownload: (fileDownload) =>
                        new GeneratedFileDownloadEndpointImplementation({
                            endpoint,
                            generatedSdkClientClass: this,
                            includeCredentialsOnCrossOriginRequests,
                            defaultTimeoutInSeconds,
                            request: getGeneratedEndpointRequest(),
                            response: getGeneratedEndpointResponse({
                                response: FernIr.HttpResponseBody.fileDownload(fileDownload)
                            }),
                            includeSerdeLayer,
                            retainOriginalCasing: this.retainOriginalCasing,
                            omitUndefined: this.omitUndefined,
                            streamType,
                            fileResponseType,
                            generateEndpointMetadata: this.generateEndpointMetadata,
                            parameterNaming
                        }),
                    json: (jsonResponse) =>
                        getDefaultEndpointImplementation({
                            response: FernIr.HttpResponseBody.json(jsonResponse)
                        }),
                    streaming: (streamingResponse) =>
                        new GeneratedStreamingEndpointImplementation({
                            packageId,
                            endpoint,
                            generatedSdkClientClass: this,
                            includeCredentialsOnCrossOriginRequests,
                            response: getGeneratedEndpointResponse({
                                response: FernIr.HttpResponseBody.streaming(streamingResponse)
                            }),
                            defaultTimeoutInSeconds,
                            request: getGeneratedEndpointRequest(),
                            includeSerdeLayer,
                            retainOriginalCasing: this.retainOriginalCasing,
                            omitUndefined: this.omitUndefined,
                            streamType,
                            generateEndpointMetadata: this.generateEndpointMetadata,
                            parameterNaming
                        }),
                    streamParameter: (streamParameter) =>
                        // TODO(amckinney): For now we just generate the stream variant of the endpoint.
                        // We need to implement both the non-streaming and streaming variants.
                        new GeneratedStreamingEndpointImplementation({
                            packageId,
                            endpoint,
                            generatedSdkClientClass: this,
                            includeCredentialsOnCrossOriginRequests,
                            response: getGeneratedEndpointResponse({
                                response: FernIr.HttpResponseBody.streaming(streamParameter.streamResponse)
                            }),
                            defaultTimeoutInSeconds,
                            request: getGeneratedEndpointRequest(),
                            includeSerdeLayer,
                            retainOriginalCasing: this.retainOriginalCasing,
                            omitUndefined: this.omitUndefined,
                            streamType,
                            generateEndpointMetadata: this.generateEndpointMetadata,
                            parameterNaming
                        }),
                    text: (textResponse) => {
                        return getDefaultEndpointImplementation({
                            response: FernIr.HttpResponseBody.text(textResponse)
                        });
                    },
                    bytes: (bytesResponse) => {
                        return new GeneratedFileDownloadEndpointImplementation({
                            endpoint,
                            generatedSdkClientClass: this,
                            includeCredentialsOnCrossOriginRequests,
                            defaultTimeoutInSeconds,
                            request: getGeneratedEndpointRequest(),
                            response: getGeneratedEndpointResponse({
                                response: FernIr.HttpResponseBody.bytes(bytesResponse)
                            }),
                            includeSerdeLayer,
                            retainOriginalCasing: this.retainOriginalCasing,
                            omitUndefined: this.omitUndefined,
                            streamType,
                            fileResponseType,
                            generateEndpointMetadata: this.generateEndpointMetadata,
                            parameterNaming
                        });
                    },
                    _other: () => {
                        throw new Error("Unknown Response type: " + endpoint.response?.body?.type);
                    }
                });
            });
        }

        if (websocketChannel != null && websocketChannelId != null && this.generateWebSocketClients) {
            this.generatedWebsocketImplementation = new GeneratedDefaultWebsocketImplementation({
                channel: websocketChannel,
                channelId: websocketChannelId,
                packageId,
                serviceClassName: this.serviceClassName,
                requireDefaultEnvironment: this.requireDefaultEnvironment,
                intermediateRepresentation: this.intermediateRepresentation,
                generatedSdkClientClass: this,
                includeSerdeLayer: this.includeSerdeLayer,
                retainOriginalCasing: this.retainOriginalCasing,
                omitUndefined: this.omitUndefined,
                parameterNaming,
                caseConverter: this.case,
                alwaysSendAuth: this.alwaysSendAuth
            });
        } else {
            this.generatedWebsocketImplementation = undefined;
        }

        this.generatedWrappedServices = package_.subpackages.reduce<GeneratedWrappedService[]>(
            (acc: GeneratedWrappedService[], wrappedSubpackageId: FernIr.SubpackageId) => {
                const subpackage = this.packageResolver.resolveSubpackage(wrappedSubpackageId);
                const hasWebSocketInTree =
                    (subpackage as { hasWebSocketInTree?: boolean }).hasWebSocketInTree ?? subpackage.websocket != null;
                if (subpackage.hasEndpointsInTree || (this.generateWebSocketClients && hasWebSocketInTree)) {
                    acc.push(
                        new GeneratedWrappedService({
                            wrappedSubpackageId,
                            wrappedSubpackage: this.packageResolver.resolveSubpackage(wrappedSubpackageId),
                            wrapperService: this
                        })
                    );
                }
                return acc;
            },
            []
        );

        // Convert any global "authorization" headers into HeaderAuthScheme objects
        const authSchemes: FernIr.AuthScheme[] = [...intermediateRepresentation.auth.schemes];
        for (const header of intermediateRepresentation.headers) {
            if (getWireValue(header.name).toLowerCase() === "authorization") {
                authSchemes.push(
                    FernIr.AuthScheme.header({
                        key: "_GlobalAuthorizationHeader",
                        name: header.name,
                        prefix: undefined,
                        headerEnvVar: header.env,
                        headerPlaceholder: undefined,
                        valueType: header.valueType,
                        docs: header.docs
                    })
                );
            }
        }

        const authRequirement = intermediateRepresentation.auth.requirement;
        const anyAuthProviders: AuthProviderInstance[] = [];
        const routingAuthProviders: Map<string, AuthProviderInstance> = new Map();

        const getAuthProvider = (authScheme: FernIr.AuthScheme): AuthProviderInstance =>
            FernIr.AuthScheme._visit<AuthProviderInstance>(authScheme, {
                basic: (scheme) => new BasicAuthProviderInstance(scheme),
                bearer: (scheme) => new BearerAuthProviderInstance(scheme),
                header: (scheme) => new HeaderAuthProviderInstance(scheme),
                oauth: () => new OAuthAuthProviderInstance(),
                inferred: () => new InferredAuthProviderInstance(),
                _other: () => {
                    throw new Error("Unknown auth scheme: " + authScheme.type);
                }
            });

        switch (authRequirement) {
            case "ANY":
                // For ANY auth, collect all providers and create AnyAuthProviderInstance
                for (const authScheme of authSchemes) {
                    anyAuthProviders.push(getAuthProvider(authScheme));
                }
                if (anyAuthProviders.length > 0) {
                    this.authProvider = new AnyAuthProviderInstance(anyAuthProviders);
                }
                break;
            case "ENDPOINT_SECURITY":
                // For ENDPOINT_SECURITY, collect all providers keyed by scheme key and create RoutingAuthProviderInstance
                for (const authScheme of authSchemes) {
                    routingAuthProviders.set(authScheme.key, getAuthProvider(authScheme));
                }
                if (routingAuthProviders.size > 0) {
                    this.authProvider = new RoutingAuthProviderInstance(routingAuthProviders);
                }
                break;
            case "ALL":
                // For ALL auth requirements, use the first auth scheme
                for (const authScheme of authSchemes) {
                    this.authProvider = getAuthProvider(authScheme);
                    break;
                }
                break;
            default:
                assertNever(authRequirement);
        }
    }

    private getGeneratedEndpointRequest({
        endpoint,
        requestBody,
        packageId,
        service
    }: {
        endpoint: FernIr.HttpEndpoint;
        requestBody: FernIr.HttpRequestBody | undefined;
        packageId: PackageId;
        service: FernIr.HttpService;
    }): GeneratedBytesEndpointRequest | GeneratedDefaultEndpointRequest | GeneratedFileUploadEndpointRequest {
        if (requestBody?.type === "bytes") {
            return new GeneratedBytesEndpointRequest({
                ir: this.intermediateRepresentation,
                packageId,
                service,
                endpoint,
                requestBody,
                generatedSdkClientClass: this,
                retainOriginalCasing: this.retainOriginalCasing,
                exportsManager: this.exportsManager,
                parameterNaming: this.parameterNaming,
                caseConverter: this.case
            });
        }
        if (requestBody?.type === "fileUpload") {
            return new GeneratedFileUploadEndpointRequest({
                ir: this.intermediateRepresentation,
                packageId,
                service,
                endpoint,
                requestBody,
                generatedSdkClientClass: this,
                retainOriginalCasing: this.retainOriginalCasing,
                inlineFileProperties: this.inlineFileProperties,
                includeSerdeLayer: this.includeSerdeLayer,
                allowExtraFields: this.allowExtraFields,
                omitUndefined: this.omitUndefined,
                formDataSupport: this.formDataSupport,
                parameterNaming: this.parameterNaming,
                caseConverter: this.case
            });
        } else {
            return new GeneratedDefaultEndpointRequest({
                ir: this.intermediateRepresentation,
                packageId,
                sdkRequest: endpoint.sdkRequest ?? undefined,
                service,
                endpoint,
                requestBody,
                generatedSdkClientClass: this,
                retainOriginalCasing: this.retainOriginalCasing,
                parameterNaming: this.parameterNaming,
                caseConverter: this.case
            });
        }
    }

    private getGeneratedEndpointImplementation(endpointId: string): GeneratedEndpointImplementation | undefined {
        const generatedEndpoint = this.generatedEndpointImplementations.find((generatedEndpoint) => {
            return generatedEndpoint.endpoint.id === endpointId;
        });
        return generatedEndpoint;
    }

    public invokeEndpoint(args: {
        context: FileContext;
        endpointId: string;
        example: FernIr.ExampleEndpointCall;
        clientReference: ts.Identifier;
    }): EndpointSampleCode | undefined {
        const generatedEndpoint = this.getGeneratedEndpointImplementation(args.endpointId);
        if (generatedEndpoint == null) {
            return undefined;
        }
        return generatedEndpoint.getExample({
            ...args,
            opts: {}
        });
    }

    public maybeLeverageInvocation(args: {
        context: FileContext;
        endpointId: string;
        example: FernIr.ExampleEndpointCall;
        clientReference: ts.Identifier;
    }): ts.Node[] | undefined {
        const generatedEndpoint = this.getGeneratedEndpointImplementation(args.endpointId);
        const invocation = this.invokeEndpoint(args);
        if (generatedEndpoint == null || invocation == null) {
            return undefined;
        }

        return generatedEndpoint.maybeLeverageInvocation({
            context: args.context,
            invocation: invocation.endpointInvocation
        });
    }

    public getEndpoint(args: {
        context: FileContext;
        endpointId: string;
    }): GeneratedEndpointImplementation | undefined {
        const generatedEndpoint = this.generatedEndpointImplementations.find((generatedEndpoint) => {
            return generatedEndpoint.endpoint.id === args.endpointId;
        });
        return generatedEndpoint;
    }

    public getGenerateEndpointMetadata(): boolean {
        return this.generateEndpointMetadata;
    }

    public getAlwaysSendAuth(): boolean {
        return this.alwaysSendAuth;
    }

    public accessFromRootClient(args: { referenceToRootClient: ts.Expression }): ts.Expression {
        return [...this.package_.fernFilepath.allParts].reduce<ts.Expression>(
            (acc, part) => ts.factory.createPropertyAccessExpression(acc, this.case.camelUnsafe(part)),
            args.referenceToRootClient
        );
    }

    public instantiate({
        referenceToClient,
        referenceToOptions
    }: {
        referenceToClient: ts.Expression;
        referenceToOptions: ts.Expression;
    }): ts.Expression {
        return ts.factory.createNewExpression(referenceToClient, undefined, [referenceToOptions]);
    }

    public instantiateAsRoot(args: { context: FileContext; npmPackage: NpmPackage }): ts.Expression {
        const rootSdkClientName = args.context.sdkClientClass.getReferenceToClientClass(this.packageId, {
            npmPackage: args.npmPackage
        });
        const optionsProperties = this.getOptionsPropertiesForSnippet(args.context);
        return ts.factory.createNewExpression(
            rootSdkClientName.getExpression(),
            undefined,
            optionsProperties.length > 0 ? [ts.factory.createObjectLiteralExpression(optionsProperties)] : undefined
        );
    }

    public writeToFile(context: FileContext): void {
        const serviceModule: ModuleDeclarationStructure = {
            kind: StructureKind.Module,
            name: this.serviceClassName,
            isExported: true,
            hasDeclareKeyword: true
        };

        const optionsInterface = this.generateOptionsInterface(context);
        serviceModule.statements = [
            optionsInterface,
            ...(this.generatedEndpointImplementations.length > 0 || this.isRoot
                ? [this.generateRequestOptionsInterface(context)]
                : []),
            ...(this.generatedWebsocketImplementation != null
                ? [this.generatedWebsocketImplementation.getModuleStatement(context)]
                : [])
        ];

        const serviceClass: SetRequired<
            ClassDeclarationStructure,
            "properties" | "ctors" | "methods" | "getAccessors"
        > = {
            kind: StructureKind.Class,
            name: this.serviceClassName,
            isExported: true,
            properties: [],
            getAccessors: [],
            ctors: [],
            methods: []
        };
        maybeAddDocsStructure(serviceClass, this.package_.docs);

        // Determine the type for _options based on whether auth is required
        const optionsType =
            this.authProvider && (this.anyEndpointWithAuth || this.alwaysSendAuth)
                ? (() => {
                      // Import NormalizedClientOptionsWithAuth and normalizeClientOptionsWithAuth from BaseClient
                      context.importsManager.addImportFromRoot("BaseClient", {
                          namedImports: [
                              { name: "NormalizedClientOptionsWithAuth", type: "type" },
                              "normalizeClientOptionsWithAuth"
                          ]
                      });
                      return ts.factory.createTypeReferenceNode(
                          ts.factory.createIdentifier("NormalizedClientOptionsWithAuth"),
                          [
                              ts.factory.createTypeReferenceNode(
                                  ts.factory.createQualifiedName(
                                      ts.factory.createIdentifier(serviceModule.name),
                                      ts.factory.createIdentifier(optionsInterface.name)
                                  )
                              )
                          ]
                      );
                  })()
                : (() => {
                      // Import NormalizedClientOptions from BaseClient
                      context.importsManager.addImportFromRoot("BaseClient", {
                          namedImports: [{ name: "NormalizedClientOptions", type: "type" }]
                      });
                      return ts.factory.createTypeReferenceNode(
                          ts.factory.createIdentifier("NormalizedClientOptions"),
                          [
                              ts.factory.createTypeReferenceNode(
                                  ts.factory.createQualifiedName(
                                      ts.factory.createIdentifier(serviceModule.name),
                                      ts.factory.createIdentifier(optionsInterface.name)
                                  )
                              )
                          ]
                      );
                  })();

        serviceClass.properties.push({
            kind: StructureKind.Property,
            name: GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER,
            type: getTextOfTsNode(optionsType),
            scope: Scope.Protected,
            isReadonly: true
        });

        if (this.authProvider && (this.anyEndpointWithAuth || this.alwaysSendAuth)) {
            const parameters = [
                {
                    name: GeneratedSdkClientClassImpl.OPTIONS_PARAMETER_NAME,
                    type: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(serviceModule.name),
                                ts.factory.createIdentifier(optionsInterface.name)
                            )
                        )
                    ),
                    initializer: !context.baseClient.anyRequiredBaseClientOptions(context) ? "{}" : undefined
                }
            ];
            const statements = code`
                ${this.getCtorOptionsStatementsWithAuth(context)}
            `;
            serviceClass.ctors.push({
                parameters,
                statements: statements.toString({ dprintOptions: { indentWidth: 4 } })
            });
        } else {
            serviceClass.ctors.push({
                statements: this.getCtorOptionsStatements(context).toString({ dprintOptions: { indentWidth: 4 } }),
                parameters: [
                    {
                        name: GeneratedSdkClientClassImpl.OPTIONS_PARAMETER_NAME,
                        type: getTextOfTsNode(
                            ts.factory.createTypeReferenceNode(
                                ts.factory.createQualifiedName(
                                    ts.factory.createIdentifier(serviceModule.name),
                                    ts.factory.createIdentifier(optionsInterface.name)
                                )
                            )
                        ),
                        initializer: !context.baseClient.anyRequiredBaseClientOptions(context) ? "{}" : undefined
                    }
                ]
            });
        }

        let isIdempotent = false;

        for (const endpoint of this.generatedEndpointImplementations) {
            const signature = endpoint.getSignature(context);
            const docs = endpoint.getDocs(context);
            const overloads = endpoint.getOverloads(context);
            const isPaginated = endpoint.isPaginated(context);

            if (!isIdempotent && endpoint.endpoint.idempotent) {
                isIdempotent = true;
            }

            const publicMethodName = this.case.camelUnsafe(endpoint.endpoint.name);

            // GraphQL subscriptions return an AsyncIterableIterator synchronously (the socket opens
            // lazily on first iteration), so they bypass the HttpResponsePromise / async public+internal
            // method machinery used by every other endpoint.
            if (isGraphqlSubscriptionEndpoint(endpoint)) {
                const subscriptionMethod: MethodDeclarationStructure = {
                    kind: StructureKind.Method,
                    scope: Scope.Public,
                    name: publicMethodName,
                    typeParameters: signature.typeParameters,
                    parameters: signature.parameters,
                    returnType: getTextOfTsNode(signature.returnTypeWithoutPromise),
                    statements: endpoint.getStatements(context).map(getTextOfTsNode)
                };
                maybeAddDocsStructure(subscriptionMethod, docs);
                serviceClass.methods.push(subscriptionMethod);
                continue;
            }

            const internalMethodName = `__${publicMethodName}`;
            const publicStatements = [
                ts.factory.createReturnStatement(
                    context.coreUtilities.fetcher.HttpResponsePromise.fromPromise(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createThis(),
                                ts.factory.createIdentifier(internalMethodName)
                            ),
                            undefined,
                            signature.parameters.map((p) => ts.factory.createIdentifier(p.name))
                        )
                    )
                )
            ];

            const publicMethod: MethodDeclarationStructure = {
                kind: StructureKind.Method,
                scope: Scope.Public,
                name: publicMethodName,
                typeParameters: signature.typeParameters,
                parameters: signature.parameters,
                returnType: getTextOfTsNode(
                    context.coreUtilities.fetcher.HttpResponsePromise._getReferenceToType(
                        signature.returnTypeWithoutPromise
                    )
                ),
                statements: publicStatements.map(getTextOfTsNode)
            };

            if (overloads.length === 0) {
                maybeAddDocsStructure(publicMethod, docs);
            }

            const internalResponseStatements = endpoint.getStatements(context);
            const internalMethod: MethodDeclarationStructure = {
                kind: StructureKind.Method,
                name: internalMethodName,
                typeParameters: signature.typeParameters,
                parameters: signature.parameters,
                returnType: getTextOfTsNode(
                    ts.factory.createTypeReferenceNode("Promise", [
                        isPaginated
                            ? signature.returnTypeWithoutPromise
                            : context.coreUtilities.fetcher.RawResponse.WithRawResponse._getReferenceToType(
                                  signature.returnTypeWithoutPromise
                              )
                    ])
                ),
                scope: Scope.Private,
                isAsync: true,
                statements: internalResponseStatements.map(getTextOfTsNode),
                overloads: overloads.map((overload) => ({
                    typeParameters: overload.typeParameters,
                    parameters: overload.parameters,
                    returnType: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode("Promise", [
                            isPaginated
                                ? overload.returnTypeWithoutPromise
                                : context.coreUtilities.fetcher.RawResponse.WithRawResponse._getReferenceToType(
                                      overload.returnTypeWithoutPromise
                                  )
                        ])
                    )
                }))
            };

            if (isPaginated) {
                // paginated only has one implementation, so copy the implementation from internal to public
                Object.assign(publicMethod, internalMethod);
                publicMethod.name = publicMethodName;
                publicMethod.scope = Scope.Public;
                serviceClass.methods.push(publicMethod);
            } else {
                serviceClass.methods.push(publicMethod);
                serviceClass.methods.push(internalMethod);
            }
        }

        if (this.generatedWebsocketImplementation != null) {
            const signature = this.generatedWebsocketImplementation.getSignature(context);
            const classStatements = this.generatedWebsocketImplementation.getClassStatements(context);

            const method: MethodDeclarationStructure = {
                kind: StructureKind.Method,
                name: this.generatedWebsocketImplementation.channel.connectMethodName ?? "connect",
                isAsync: true,
                parameters: signature.parameters,
                returnType: getTextOfTsNode(
                    ts.factory.createTypeReferenceNode("Promise", [signature.returnTypeWithoutPromise])
                ),
                scope: Scope.Public,
                statements: classStatements.map(getTextOfTsNode)
            };

            serviceClass.methods.push(method);
        }

        if (isIdempotent) {
            serviceModule.statements.push(this.generateIdempotentRequestOptionsInterface(context));
        }

        // Add the GraphQL `paginate` namespace on any client that exposes Relay-connection endpoints.
        this.addGraphqlPaginateGetter({ serviceClass, context });

        // Add passthrough fetch method on root client
        if (this.isRoot) {
            this.addPassthroughFetchMethod({ serviceClass, context });
        }

        // Add the GraphQL `raw` escape hatch on the root client when the API has GraphQL query/mutation
        // operations anywhere (they live in the query/mutation subpackages, not the root service, so this
        // checks the whole IR rather than the root client's own endpoints).
        if (this.isRoot && this.irHasGraphqlQueryOrMutation()) {
            this.addGraphqlRawMethod({ serviceClass });
        }

        for (const wrappedService of this.generatedWrappedServices) {
            wrappedService.addToServiceClass({
                isRoot: this.isRoot,
                class_: serviceClass,
                context
            });
        }

        context.sourceFile.addModule(serviceModule);
        context.sourceFile.addClass(serviceClass);
    }

    private getCtorOptionsStatements(context: FileContext): Code {
        context.importsManager.addImportFromRoot("BaseClient", {
            namedImports: ["normalizeClientOptions"]
        });

        return code`this._options = normalizeClientOptions(options);`;
    }

    private getCtorOptionsStatementsWithAuth(context: FileContext): Code {
        context.importsManager.addImportFromRoot("BaseClient", {
            namedImports: ["normalizeClientOptionsWithAuth"]
        });

        return code`this._options = normalizeClientOptionsWithAuth(options);`;
    }

    private addPassthroughFetchMethod({
        serviceClass,
        context
    }: {
        serviceClass: SetRequired<ClassDeclarationStructure, "properties" | "ctors" | "methods" | "getAccessors">;
        context: FileContext;
    }): void {
        // Build the auth headers getter expression
        const hasAuth = this.authProvider && (this.anyEndpointWithAuth || this.alwaysSendAuth);
        let getAuthHeadersCode: string;
        if (hasAuth) {
            getAuthHeadersCode =
                "getAuthHeaders: async () => (await this._options.authProvider.getAuthRequest()).headers,";
        } else {
            getAuthHeadersCode = "";
        }

        // Resolve the base URL from either the explicit baseUrl option or the environment.
        // For multi-URL environments (e.g. { ec2: string; s3: string }), the environment is an object,
        // so we project it to a string via the base URL property that HTTP endpoints use.
        // This is the same logic regular endpoint methods use (via endpoint.baseUrl → getReferenceToEnvironmentUrl),
        // ensuring the passthrough fetch resolves to the REST base URL, not a WebSocket or other URL.
        // If the IR defines a default environment, we also fall back to it (matching regular endpoint behavior).
        // For single-URL or no-IR-defined environments, the environment is already a string, so we fall back to it directly.
        const envs = this.intermediateRepresentation.environments?.environments;
        let baseUrlCode: string;
        if (envs != null && envs.type === "multipleBaseUrls") {
            // Find the base URL ID used by the first HTTP endpoint — this is the REST URL.
            // Falls back to baseUrls[0] if no HTTP endpoints exist (e.g. WebSocket-only APIs).
            let httpBaseUrlId: string | undefined;
            for (const service of Object.values(this.intermediateRepresentation.services)) {
                for (const endpoint of service.endpoints) {
                    if (endpoint.baseUrl != null) {
                        httpBaseUrlId = endpoint.baseUrl;
                        break;
                    }
                }
                if (httpBaseUrlId != null) {
                    break;
                }
            }

            const targetBaseUrl =
                httpBaseUrlId != null
                    ? (envs.baseUrls.find((bu) => bu.id === httpBaseUrlId) ?? envs.baseUrls[0])
                    : envs.baseUrls[0];
            if (targetBaseUrl == null) {
                throw new Error("Multi-URL environment has no base URLs defined");
            }
            const baseUrlName = this.case.camelUnsafe(targetBaseUrl.name);

            // Get the default environment reference (e.g. environments.SdkEnvironment.Production) if one exists.
            // This mirrors getEnvironment() which does: this._options.environment ?? defaultEnvironment
            const defaultEnvExpr = context.environments
                .getGeneratedEnvironments()
                .getReferenceToDefaultEnvironment(context);
            const defaultEnvFallback =
                defaultEnvExpr != null ? ` ?? ${getTextOfTsNode(defaultEnvExpr)}.${baseUrlName}` : "";

            baseUrlCode = `baseUrl: this._options.baseUrl ?? (async () => {
        const env = await core.Supplier.get(this._options.environment);
        return typeof env === "string" ? env : (env as Record<string, string>)?.${baseUrlName}${defaultEnvFallback};
    }),`;
        } else {
            baseUrlCode = "baseUrl: this._options.baseUrl ?? this._options.environment,";
        }

        const fetchMethodBody = `
return core.makePassthroughRequest(input, init, {
    ${baseUrlCode}
    headers: this._options.headers,
    timeoutInSeconds: this._options.timeoutInSeconds,
    maxRetries: this._options.maxRetries,
    fetch: this._options.fetch,
    logging: this._options.logging,
    ${getAuthHeadersCode}
}, requestOptions);`;

        const fetchMethod: MethodDeclarationStructure = {
            kind: StructureKind.Method,
            scope: Scope.Public,
            isAsync: true,
            name: "fetch",
            docs: [
                "Make a passthrough request using the SDK's configured auth, retry, logging, etc.\n" +
                    "This is useful for making requests to endpoints not yet supported in the SDK.\n" +
                    "The input can be a URL string, URL object, or Request object. Relative paths are resolved against the configured base URL.\n\n" +
                    "@param {Request | string | URL} input - The URL, path, or Request object.\n" +
                    "@param {RequestInit} init - Standard fetch RequestInit options.\n" +
                    "@param {core.PassthroughRequest.RequestOptions} requestOptions - Per-request overrides (timeout, retries, headers, abort signal).\n" +
                    "@returns {Promise<Response>} A standard Response object."
            ],
            parameters: [
                { name: "input", type: "Request | string | URL" },
                { name: "init", type: "RequestInit", hasQuestionToken: true },
                { name: "requestOptions", type: "core.PassthroughRequest.RequestOptions", hasQuestionToken: true }
            ],
            returnType: "Promise<Response>",
            statements: fetchMethodBody
        };

        serviceClass.methods.push(fetchMethod);
    }

    /**
     * Generates the GraphQL `raw` escape hatch (PRD §6.5): `client.raw<TResult, TVariables>(query,
     * variables, requestOptions)`. Power users who already maintain GraphQL documents send one directly
     * and get back the same `{ data, errors }` envelope as the typed operations. It reuses the root
     * client's passthrough `fetch` (so auth, retries, base-url resolution, headers and logging all
     * apply) and POSTs `{ query, variables }` to the `/graphql` endpoint.
     */
    /** Whether any service in the IR exposes a GraphQL query/mutation operation (POST /graphql). */
    private irHasGraphqlQueryOrMutation(): boolean {
        for (const service of Object.values(this.intermediateRepresentation.services)) {
            for (const endpoint of service.endpoints) {
                if (getGraphqlTransport(endpoint) != null && !isGraphqlSubscription(endpoint)) {
                    return true;
                }
            }
        }
        return false;
    }

    private addGraphqlRawMethod({
        serviceClass
    }: {
        serviceClass: SetRequired<ClassDeclarationStructure, "properties" | "ctors" | "methods" | "getAccessors">;
    }): void {
        const rawMethodBody = `
const _response = await this.fetch(
    "/graphql",
    {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: variables ?? {} }),
    },
    requestOptions,
);
const _gqlBody = (await _response.json()) as { data?: TResult; errors?: core.GraphqlResponseError[] };
if (requestOptions?.throwOnError === true && _gqlBody?.errors != null && _gqlBody.errors.length > 0) {
    throw new core.GraphqlError({ errors: _gqlBody.errors, data: _gqlBody.data });
}
return { data: _gqlBody?.data, errors: _gqlBody?.errors };`;

        const rawMethod: MethodDeclarationStructure = {
            kind: StructureKind.Method,
            scope: Scope.Public,
            isAsync: true,
            name: "raw",
            docs: [
                "Execute a raw GraphQL document, bypassing the typed operation surface.\n" +
                    "Useful for power users who maintain their own GraphQL queries/mutations.\n" +
                    "Returns the `{ data, errors }` envelope; pass `throwOnError: true` to throw `GraphqlError` on operation errors.\n\n" +
                    "@param {string} query - The GraphQL document to execute.\n" +
                    "@param {TVariables} variables - The GraphQL variables for the document.\n" +
                    "@param {RequestOptions} requestOptions - Per-request overrides (timeout, retries, headers, abort signal, throwOnError)."
            ],
            typeParameters: [
                { name: "TResult", default: "unknown" },
                { name: "TVariables", default: "Record<string, unknown>" }
            ],
            parameters: [
                { name: "query", type: "string" },
                { name: "variables", type: "TVariables", hasQuestionToken: true },
                {
                    // Passthrough-fetch options (timeout/retries/headers/abort) plus the GraphQL
                    // `throwOnError` opt-in. Uses the passthrough options type (rather than the client's
                    // RequestOptions) so it stays assignable to `this.fetch`.
                    name: "requestOptions",
                    type: "core.PassthroughRequest.RequestOptions & { throwOnError?: boolean }",
                    hasQuestionToken: true
                }
            ],
            returnType: "Promise<core.GraphqlResponse<TResult | undefined>>",
            statements: rawMethodBody
        };

        serviceClass.methods.push(rawMethod);
    }

    /**
     * Generates the GraphQL `paginate` namespace (PRD §10.3) for any client exposing Relay-connection
     * endpoints. For each such endpoint it emits `paginate.<field>(request, selection, requestOptions)`,
     * an `AsyncIterableIterator` over the connection's nodes typed to the caller's node selection. Each
     * method delegates to its sibling query method per page (reusing auth/base-url/fetch/envelope),
     * passing a connection-wrapped selection and following `pageInfo.endCursor` while `hasNextPage`.
     */
    private addGraphqlPaginateGetter({
        serviceClass,
        context
    }: {
        serviceClass: SetRequired<ClassDeclarationStructure, "properties" | "ctors" | "methods" | "getAccessors">;
        context: FileContext;
    }): void {
        const fieldHasAfterArg = this.makeGraphqlFieldHasAfterArg();
        const methods: string[] = [];

        for (const endpoint of this.generatedEndpointImplementations) {
            const siblingMethodName = this.case.camelUnsafe(endpoint.endpoint.name);

            // (1) Root connection: the endpoint's response IS the connection (e.g. `feed: PostConnection`).
            const rootConnection = detectGraphqlConnection(endpoint.endpoint, this.intermediateRepresentation.types);
            if (rootConnection != null) {
                const requestParam = endpoint
                    .getSignature(context)
                    .parameters.find((parameter) => parameter.name === "request");
                const refs = this.graphqlNodeTypeRefs(context, rootConnection.nodeType);
                if (requestParam?.type != null && refs != null) {
                    methods.push(
                        this.buildGraphqlPaginateMethod({
                            methodName: siblingMethodName,
                            refs,
                            paramDeclaration: `request${requestParam.hasQuestionToken === true ? "?" : ""}: ${requestParam.type}`,
                            initialAfter: "request?.after",
                            siblingCall: `this.${siblingMethodName}({ ...request, after }, { ${this.graphqlConnectionSelectionProps(rootConnection.nodesAccessor)} }, requestOptions)`,
                            accessor: rootConnection.nodesAccessor,
                            path: []
                        })
                    );
                }
            }

            // (2) Nested connections reachable under a no-arg root field (e.g. `viewer.posts`).
            for (const nested of findNestedGraphqlConnections({
                endpoint: endpoint.endpoint,
                types: this.intermediateRepresentation.types,
                fieldHasAfterArg
            })) {
                const refs = this.graphqlNodeTypeRefs(context, nested.nodeType);
                if (refs?.namespace == null) {
                    continue;
                }
                const argsType = `${refs.namespace}.${this.case.pascalSafe(nested.parentTypeName)}${this.case.pascalUnsafe(nested.connectionFieldName)}Args`;
                // Drill: nest `{ __args: { ...args, after }, <connSel> }` under each path segment.
                let drill = `{ __args: { ...args, after }, ${this.graphqlConnectionSelectionProps(nested.nodesAccessor)} }`;
                for (let i = nested.path.length - 1; i >= 0; i--) {
                    drill = `{ ${nested.path[i]}: ${drill} }`;
                }
                methods.push(
                    this.buildGraphqlPaginateMethod({
                        methodName: siblingMethodName + nested.path.map((segment) => this.case.pascalUnsafe(segment)).join(""),
                        refs,
                        paramDeclaration: `args: ${argsType}`,
                        initialAfter: "args?.after",
                        siblingCall: `this.${siblingMethodName}(${drill}, requestOptions)`,
                        accessor: nested.nodesAccessor,
                        path: nested.path
                    })
                );
            }
        }

        if (methods.length === 0) {
            return;
        }

        serviceClass.getAccessors.push({
            kind: StructureKind.GetAccessor,
            scope: Scope.Public,
            name: "paginate",
            docs: [
                "Auto-pagination helpers for this client's Relay-connection fields (root and nested). Each " +
                    "returns an `AsyncIterableIterator` over the connection's nodes, following " +
                    "`pageInfo.endCursor` across pages:\n\n" +
                    "    for await (const node of client.<...>.paginate.<field>(args, selection)) { ... }"
            ],
            statements: `return {\n${methods.join(",\n")}\n};`
        });
    }

    /** Resolves a node type's `Select`/`DefaultSelection`/`Result` references (+ the import namespace). */
    private graphqlNodeTypeRefs(
        context: FileContext,
        nodeType: FernIr.TypeReference
    ): { selectType: string; defaultText: string; resultType: string; namespace: string | undefined } | undefined {
        const selectReference = context.type.getReferenceToGraphqlSelectTypeForReference(nodeType);
        const defaultExpression = context.type
            .getReferenceToGraphqlDefaultSelectionForReference(nodeType)
            ?.getExpression();
        if (selectReference == null || defaultExpression == null) {
            return undefined;
        }
        const selectType = getTextOfTsNode(selectReference.getTypeNode());
        return {
            selectType,
            defaultText: getTextOfTsNode(defaultExpression),
            resultType: getTextOfTsNode(
                context.coreUtilities.graphqlUtils.Result._getReferenceToType(
                    context.type.getReferenceToType(nodeType).typeNode,
                    ts.factory.createTypeReferenceNode("S")
                )
            ),
            // The Select type is namespaced (e.g. `Api.PostSelect`); the sibling `<Parent><Field>Args`
            // type lives in the same namespace, so reuse its prefix to reference it.
            namespace: selectType.includes(".") ? selectType.split(".")[0] : undefined
        };
    }

    /** The inner `edges`/`nodes` + `pageInfo` selection properties for a connection (no surrounding braces). */
    private graphqlConnectionSelectionProps(accessor: "edges" | "nodes"): string {
        return accessor === "edges"
            ? "edges: { node: selection }, pageInfo: { hasNextPage: true, endCursor: true }"
            : "nodes: selection, pageInfo: { hasNextPage: true, endCursor: true }";
    }

    /**
     * Builds one `paginate.<name>` method. The connection result is selection-narrowed through a generic
     * `S`, which TS can't statically index, so the page is read through an explicit shape (under the path,
     * if nested) keyed to the typed node result; `paginateGraphql<...>` types the yielded nodes.
     */
    private buildGraphqlPaginateMethod({
        methodName,
        refs,
        paramDeclaration,
        initialAfter,
        siblingCall,
        accessor,
        path
    }: {
        methodName: string;
        refs: { selectType: string; defaultText: string; resultType: string };
        paramDeclaration: string;
        initialAfter: string;
        siblingCall: string;
        accessor: "edges" | "nodes";
        path: string[];
    }): string {
        const pageInfoShape = "pageInfo?: { endCursor?: string; hasNextPage?: boolean }";
        let shape =
            accessor === "edges"
                ? `{ edges?: ReadonlyArray<{ node: ${refs.resultType} }>; ${pageInfoShape} }`
                : `{ nodes?: ReadonlyArray<${refs.resultType}>; ${pageInfoShape} }`;
        for (let i = path.length - 1; i >= 0; i--) {
            shape = `{ ${path[i]}?: ${shape} }`;
        }
        const pathAccess = path.map((segment) => `?.${segment}`).join("");
        const nodesExtraction =
            accessor === "edges" ? "(_connection?.edges ?? []).map((_edge) => _edge.node)" : "_connection?.nodes ?? []";

        return `${methodName}: <S extends ${refs.selectType} = typeof ${refs.defaultText}>(
    ${paramDeclaration},
    selection: S = ${refs.defaultText} as S,
    requestOptions?: ${this.serviceClassName}.RequestOptions,
): AsyncIterableIterator<${refs.resultType}> => {
    return core.paginateGraphql<${refs.resultType}>({
        initialAfter: ${initialAfter},
        fetchPage: async (after) => {
            const _page = await ${siblingCall};
            const _connection = (_page.data as unknown as ${shape} | undefined)${pathAccess};
            return {
                nodes: ${nodesExtraction},
                endCursor: _connection?.pageInfo?.endCursor ?? undefined,
                hasNextPage: _connection?.pageInfo?.hasNextPage ?? false,
            };
        },
    });
}`;
    }

    /** Reads `ir.graphqlFieldArguments` (structurally — the published IR may predate it) to test whether a
     * field accepts an `after` cursor argument, gating nested auto-pagination. */
    private makeGraphqlFieldHasAfterArg(): (parentTypeId: string, fieldWireName: string) => boolean {
        const graphqlFieldArguments = (
            this.intermediateRepresentation as unknown as {
                graphqlFieldArguments?: Record<
                    string,
                    { fields: Record<string, Array<{ name: string | { wireValue?: string } }>> }
                >;
            }
        ).graphqlFieldArguments;
        return (parentTypeId, fieldWireName) => {
            const args = graphqlFieldArguments?.[parentTypeId]?.fields?.[fieldWireName];
            return (
                args != null &&
                args.some((arg) => (typeof arg.name === "string" ? arg.name : arg.name.wireValue) === "after")
            );
        };
    }

    public getBaseUrl(endpoint: FernIr.HttpEndpoint, context: FileContext): ts.Expression {
        const referenceToBaseUrl = this.getReferenceToBaseUrl(context);

        const environment = this.getEnvironment(endpoint, context);

        return ts.factory.createBinaryExpression(
            referenceToBaseUrl,
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            environment
        );
    }

    public getEnvironment(endpoint: FernIr.HttpEndpoint, context: FileContext): ts.Expression {
        let referenceToEnvironmentValue = this.getReferenceToEnvironment(context);

        const defaultEnvironment = context.environments
            .getGeneratedEnvironments()
            .getReferenceToDefaultEnvironment(context);

        if (this.requireDefaultEnvironment) {
            if (defaultEnvironment == null) {
                throw new Error("Cannot use default environment because none exists");
            }
            return defaultEnvironment;
        }

        if (defaultEnvironment != null) {
            referenceToEnvironmentValue = ts.factory.createBinaryExpression(
                referenceToEnvironmentValue,
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                defaultEnvironment
            );
        }

        return context.environments.getGeneratedEnvironments().getReferenceToEnvironmentUrl({
            referenceToEnvironmentValue,
            baseUrlId: endpoint.baseUrl ?? undefined
        });
    }

    /*******************
     * REQUEST OPTIONS *
     *******************/

    public getRequestOptionsType(idempotent: boolean): string {
        return idempotent
            ? `${this.serviceClassName}.${GeneratedSdkClientClassImpl.IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME}`
            : `${this.serviceClassName}.${GeneratedSdkClientClassImpl.REQUEST_OPTIONS_INTERFACE_NAME}`;
    }

    private generateRequestOptionsInterface(context: FileContext): InterfaceDeclarationStructure {
        // For clients with GraphQL endpoints, expose a per-call `throwOnError` opt-in. GraphQL is a
        // partial-success protocol (a 200 can carry both `data` and `errors`); by default operation
        // errors are returned on the `{ data, errors }` envelope, but callers who prefer the legacy
        // throw-on-error behavior can set `throwOnError: true` to throw `GraphqlError` instead.
        const properties: OptionalKind<PropertySignatureStructure>[] = this.hasGraphqlEndpoint
            ? [
                  {
                      name: GRAPHQL_THROW_ON_ERROR_REQUEST_OPTION,
                      type: "boolean",
                      hasQuestionToken: true,
                      docs: [
                          "Throw `GraphqlError` when the GraphQL response contains operation errors, instead of returning them on the `{ data, errors }` envelope. Defaults to `false`."
                      ]
                  }
              ]
            : [];
        return {
            kind: StructureKind.Interface,
            name: GeneratedSdkClientClassImpl.REQUEST_OPTIONS_INTERFACE_NAME,
            properties,
            extends: [getTextOfTsNode(context.sdkClientClass.getReferenceToBaseRequestOptions().getTypeNode())],
            isExported: true
        };
    }

    /******************************
     * IDEMPOTENT REQUEST OPTIONS *
     ******************************/

    private generateIdempotentRequestOptionsInterface(context: FileContext): InterfaceDeclarationStructure {
        return {
            kind: StructureKind.Interface,
            name: GeneratedSdkClientClassImpl.IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME,
            extends: [
                GeneratedSdkClientClassImpl.REQUEST_OPTIONS_INTERFACE_NAME,
                getTextOfTsNode(context.sdkClientClass.getReferenceToBaseIdempotentRequestOptions().getTypeNode())
            ],
            isExported: true
        };
    }

    /***********
     * OPTIONS *
     ***********/

    public getOptionsPropertiesForSnippet(context: FileContext): ts.ObjectLiteralElementLike[] {
        const properties: ts.ObjectLiteralElementLike[] = [];

        if (!this.requireDefaultEnvironment && context.ir.environments?.defaultEnvironment == null) {
            const firstEnvironment = context.environments.getReferenceToFirstEnvironmentEnum();
            const environment =
                firstEnvironment != null
                    ? firstEnvironment.getExpression()
                    : ts.factory.createStringLiteral("YOUR_BASE_URL");
            properties.push(
                ts.factory.createPropertyAssignment(
                    GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME,
                    environment
                )
            );
        }

        // Delegate auth snippet properties to the auth provider
        if (this.authProvider != null) {
            properties.push(...this.authProvider.getSnippetProperties(context));
        }

        for (const header of this.intermediateRepresentation.headers) {
            if (!isLiteralHeader(header, context)) {
                const clientDefaultVal = getClientDefaultValue(header.clientDefault);
                const snippetValue =
                    clientDefaultVal != null
                        ? ts.factory.createStringLiteral(clientDefaultVal.toString())
                        : ts.factory.createStringLiteral(`YOUR_${this.case.screamingSnakeUnsafe(header.name)}`);
                properties.push(
                    ts.factory.createPropertyAssignment(
                        getPropertyKey(this.getOptionKeyForHeader(header)),
                        snippetValue
                    )
                );
            }
        }

        for (const variable of this.intermediateRepresentation.variables) {
            if (variable.type.type === "container" && variable.type.container.type === "literal") {
                continue;
            }
            properties.push(
                ts.factory.createPropertyAssignment(
                    getPropertyKey(this.getOptionNameForVariable(variable)),
                    ts.factory.createStringLiteral(`YOUR_${this.case.screamingSnakeUnsafe(variable.name)}`)
                )
            );
        }

        const generatedVersion = context.versionContext.getGeneratedVersion();
        if (generatedVersion != null && !generatedVersion.hasDefaultVersion()) {
            const header = generatedVersion.getHeader();
            properties.push(
                ts.factory.createPropertyAssignment(
                    getPropertyKey(this.getOptionKeyForHeader(header)),
                    ts.factory.createStringLiteral(generatedVersion.getFirstEnumValue())
                )
            );
        }

        return properties;
    }

    private generateOptionsInterface(context: FileContext): TypeAliasDeclarationStructure {
        // Use type alias instead of interface because BaseClientOptions may include union types
        // (e.g., AtLeastOneOf pattern for AnyAuthProvider.AuthOptions)
        // TypeScript interfaces can only extend object types with statically known members
        return {
            kind: StructureKind.TypeAlias,
            name: GeneratedSdkClientClassImpl.OPTIONS_INTERFACE_NAME,
            type: getTextOfTsNode(context.sdkClientClass.getReferenceToBaseClientOptions().getTypeNode()),
            isExported: true
        };
    }

    private getReferenceToEnvironment(context: FileContext): ts.Expression {
        return context.coreUtilities.fetcher.Supplier.get(
            this.getReferenceToOption(GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME)
        );
    }

    private getReferenceToBaseUrl(context: FileContext): ts.Expression {
        return context.coreUtilities.fetcher.Supplier.get(
            this.getReferenceToOption(GeneratedSdkClientClassImpl.BASE_URL_OPTION_PROPERTY_NAME)
        );
    }

    public getReferenceToRequestOptions(endpoint: FernIr.HttpEndpoint): ts.TypeReferenceNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                ts.factory.createIdentifier(this.serviceClassName),
                ts.factory.createIdentifier(
                    endpoint.idempotent
                        ? GeneratedSdkClientClassImpl.IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME
                        : GeneratedSdkClientClassImpl.REQUEST_OPTIONS_INTERFACE_NAME
                )
            )
        );
    }

    public getReferenceToTimeoutInSeconds({
        referenceToRequestOptions,
        isNullable
    }: {
        referenceToRequestOptions: ts.Expression;
        isNullable: boolean;
    }): ts.Expression {
        return isNullable
            ? ts.factory.createPropertyAccessChain(
                  referenceToRequestOptions,
                  ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                  ts.factory.createIdentifier(
                      GeneratedSdkClientClassImpl.TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME
                  )
              )
            : ts.factory.createPropertyAccessExpression(
                  referenceToRequestOptions,
                  ts.factory.createIdentifier(
                      GeneratedSdkClientClassImpl.TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME
                  )
              );
    }

    public getReferenceToMaxRetries({
        referenceToRequestOptions,
        isNullable
    }: {
        referenceToRequestOptions: ts.Expression;
        isNullable: boolean;
    }): ts.Expression {
        return isNullable
            ? ts.factory.createPropertyAccessChain(
                  referenceToRequestOptions,
                  ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                  ts.factory.createIdentifier(GeneratedSdkClientClassImpl.MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME)
              )
            : ts.factory.createPropertyAccessExpression(
                  referenceToRequestOptions,
                  ts.factory.createIdentifier(GeneratedSdkClientClassImpl.MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME)
              );
    }

    public getReferenceToAbortSignal({
        referenceToRequestOptions
    }: {
        referenceToRequestOptions: ts.Expression;
    }): ts.Expression {
        return ts.factory.createPropertyAccessChain(
            referenceToRequestOptions,
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier(GeneratedSdkClientClassImpl.ABORT_SIGNAL_PROPERTY_NAME)
        );
    }

    public getReferenceToDefaultTimeoutInSeconds(): ts.Expression {
        return ts.factory.createPropertyAccessChain(
            this.getReferenceToOptions(),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier(GeneratedSdkClientClassImpl.TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME)
        );
    }

    public getReferenceToDefaultMaxRetries(): ts.Expression {
        return ts.factory.createPropertyAccessChain(
            this.getReferenceToOptions(),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier(GeneratedSdkClientClassImpl.MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME)
        );
    }

    public getReferenceToFetch(): ts.Expression {
        return ts.factory.createPropertyAccessChain(
            this.getReferenceToOptions(),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier("fetch")
        );
    }

    public getReferenceToLogger(_context: FileContext): ts.Expression {
        return this.getReferenceToOption(GeneratedSdkClientClassImpl.LOGGING_FIELD_NAME);
    }

    public getReferenceToOptions(): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
        );
    }

    public getReferenceToFetcher(context: FileContext): ts.Expression {
        if (this.allowCustomFetcher) {
            return ts.factory.createBinaryExpression(
                this.getReferenceToOption(GeneratedSdkClientClassImpl.CUSTOM_FETCHER_PROPERTY_NAME),
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                context.coreUtilities.fetcher.fetcher._getReferenceTo()
            );
        } else {
            return context.coreUtilities.fetcher.fetcher._getReferenceTo();
        }
    }

    public getReferenceToAuthProvider(): ts.Expression | undefined {
        if (!this.authProvider) {
            return undefined;
        }
        return ts.factory.createPropertyAccessExpression(
            this.getReferenceToOptions(),
            ts.factory.createIdentifier(GeneratedSdkClientClassImpl.AUTH_PROVIDER_FIELD_NAME)
        );
    }

    public getReferenceToAuthProviderOrThrow(): ts.Expression {
        if (!this.authProvider) {
            throw new Error("Auth provider is not available");
        }
        return ts.factory.createPropertyAccessExpression(
            this.getReferenceToOptions(),
            ts.factory.createIdentifier(GeneratedSdkClientClassImpl.AUTH_PROVIDER_FIELD_NAME)
        );
    }

    public hasAuthProvider(): boolean {
        return this.authProvider != null;
    }

    public getReferenceToOption(option: string): ts.Expression {
        return ts.factory.createPropertyAccessExpression(this.getReferenceToOptions(), option);
    }

    private getOptionKeyForHeader(header: FernIr.HttpHeader): string {
        return this.case.camelUnsafe(header.name);
    }

    public getReferenceToMetadataForEndpointSupplier(): ts.Expression {
        return ts.factory.createIdentifier(GeneratedSdkClientClassImpl.METADATA_FOR_TOKEN_SUPPLIER_VAR);
    }

    public getReferenceToRootPathParameter(pathParameter: FernIr.PathParameter): ts.Expression {
        return this.getReferenceToOption(
            getParameterNameForRootPathParameter({
                pathParameter,
                retainOriginalCasing: this.retainOriginalCasing,
                parameterNaming: this.parameterNaming,
                caseConverter: this.case
            })
        );
    }

    public getReferenceToVariable(variableId: FernIr.VariableId): ts.Expression {
        const variable = this.intermediateRepresentation.variables.find((v) => v.id === variableId);
        if (variable == null) {
            throw new Error("Variable does not exist: " + variableId);
        }
        return this.getReferenceToOption(this.getOptionNameForVariable(variable));
    }

    private getOptionNameForVariable(variable: FernIr.VariableDeclaration): string {
        return this.case.camelUnsafe(variable.name);
    }

    public hasAnyEndpointsWithAuth(): boolean {
        return this.anyEndpointWithAuth;
    }

    public getAuthProviderInstance(): AuthProviderInstance | undefined {
        return this.authProvider;
    }
}

function anyEndpointWithAuth({
    packageId,
    packageResolver
}: {
    packageId: PackageId;
    packageResolver: PackageResolver;
}): boolean {
    const irPackage = packageResolver.resolvePackage(packageId);

    const websocketChannel = packageResolver.getWebSocketChannelDeclaration(packageId);
    if (websocketChannel?.auth) {
        return true;
    }

    const service = packageResolver.getServiceDeclaration(packageId);
    if (service && service.endpoints.some((endpoint) => endpoint.auth)) {
        return true;
    }

    if (
        irPackage.subpackages.some((subpackageId) => {
            return anyEndpointWithAuth({
                packageId: {
                    isRoot: false,
                    subpackageId
                },
                packageResolver
            });
        })
    ) {
        return true;
    }

    return false;
}
