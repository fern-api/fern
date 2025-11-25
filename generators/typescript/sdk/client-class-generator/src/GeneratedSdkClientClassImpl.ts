import { SetRequired } from "@fern-api/core-utils";
import {
    AuthScheme,
    ExampleEndpointCall,
    HttpEndpoint,
    HttpHeader,
    HttpRequestBody,
    HttpResponseBody,
    HttpService,
    IntermediateRepresentation,
    Package,
    PathParameter,
    SubpackageId,
    VariableDeclaration,
    VariableId
} from "@fern-fern/ir-sdk/api";
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
    GeneratedEndpointImplementation,
    GeneratedSdkClientClass,
    GeneratedWebsocketImplementation,
    SdkContext
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
    OAuthAuthProviderInstance
} from "./auth-provider";
import { GeneratedBytesEndpointRequest } from "./endpoint-request/GeneratedBytesEndpointRequest";
import { GeneratedDefaultEndpointRequest } from "./endpoint-request/GeneratedDefaultEndpointRequest";
import { GeneratedFileUploadEndpointRequest } from "./endpoint-request/GeneratedFileUploadEndpointRequest";
import { GeneratedNonThrowingEndpointResponse } from "./endpoints/default/endpoint-response/GeneratedNonThrowingEndpointResponse";
import { GeneratedThrowingEndpointResponse } from "./endpoints/default/endpoint-response/GeneratedThrowingEndpointResponse";
import { GeneratedDefaultEndpointImplementation } from "./endpoints/default/GeneratedDefaultEndpointImplementation";
import { GeneratedFileDownloadEndpointImplementation } from "./endpoints/GeneratedFileDownloadEndpointImplementation";
import { GeneratedStreamingEndpointImplementation } from "./endpoints/GeneratedStreamingEndpointImplementation";
import { isLiteralHeader } from "./endpoints/utils/isLiteralHeader";
import { GeneratedWrappedService } from "./GeneratedWrappedService";
import { GeneratedDefaultWebsocketImplementation } from "./websocket/GeneratedDefaultWebsocketImplementation";

export declare namespace GeneratedSdkClientClassImpl {
    export interface Init {
        isRoot: boolean;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        intermediateRepresentation: IntermediateRepresentation;
        packageId: PackageId;
        serviceClassName: string;
        errorResolver: ErrorResolver;
        packageResolver: PackageResolver;
        neverThrowErrors: boolean;
        includeCredentialsOnCrossOriginRequests: boolean;
        allowCustomFetcher: boolean;
        shouldGenerateWebsocketClients: boolean;
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

    private readonly isRoot: boolean;
    private readonly intermediateRepresentation: IntermediateRepresentation;
    private readonly serviceClassName: string;
    private readonly package_: Package;
    private readonly generatedEndpointImplementations: GeneratedEndpointImplementation[];
    private readonly generatedWebsocketImplementation: GeneratedWebsocketImplementation | undefined;
    private readonly generatedWrappedServices: GeneratedWrappedService[];
    private readonly allowCustomFetcher: boolean;
    private readonly shouldGenerateWebsocketClients: boolean;
    private readonly packageResolver: PackageResolver;
    private readonly requireDefaultEnvironment: boolean;
    private readonly packageId: PackageId;
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

    constructor({
        isRoot,
        intermediateRepresentation,
        serviceClassName,
        packageId,
        errorResolver,
        packageResolver,
        neverThrowErrors,
        includeCredentialsOnCrossOriginRequests,
        allowCustomFetcher,
        shouldGenerateWebsocketClients,
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
        offsetSemantics
    }: GeneratedSdkClientClassImpl.Init) {
        this.isRoot = isRoot;
        this.intermediateRepresentation = intermediateRepresentation;
        this.serviceClassName = serviceClassName;
        this.packageId = packageId;
        this.allowCustomFetcher = allowCustomFetcher;
        this.shouldGenerateWebsocketClients = shouldGenerateWebsocketClients;
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

        const package_ = packageResolver.resolvePackage(packageId);
        this.package_ = package_;

        const service = packageResolver.getServiceDeclaration(packageId);

        this.anyEndpointWithAuth = anyEndpointWithAuth({ packageId, packageResolver });

        const websocketChannel = packageResolver.getWebSocketChannelDeclaration(packageId);
        const websocketChannelId = this.package_.websocket ?? undefined;

        if (service == null) {
            this.generatedEndpointImplementations = [];
        } else {
            this.generatedEndpointImplementations = service.endpoints.map((endpoint: HttpEndpoint) => {
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
                        | HttpResponseBody.Json
                        | HttpResponseBody.FileDownload
                        | HttpResponseBody.Text
                        | HttpResponseBody.Streaming
                        | HttpResponseBody.Bytes
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
                    response: HttpResponseBody.Json | HttpResponseBody.FileDownload | HttpResponseBody.Text | undefined;
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

                if (endpoint.response?.body == null) {
                    return getDefaultEndpointImplementation({ response: undefined });
                }

                return HttpResponseBody._visit<GeneratedEndpointImplementation>(endpoint.response.body, {
                    fileDownload: (fileDownload) =>
                        new GeneratedFileDownloadEndpointImplementation({
                            endpoint,
                            generatedSdkClientClass: this,
                            includeCredentialsOnCrossOriginRequests,
                            defaultTimeoutInSeconds,
                            request: getGeneratedEndpointRequest(),
                            response: getGeneratedEndpointResponse({
                                response: HttpResponseBody.fileDownload(fileDownload)
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
                            response: HttpResponseBody.json(jsonResponse)
                        }),
                    streaming: (streamingResponse) =>
                        new GeneratedStreamingEndpointImplementation({
                            packageId,
                            endpoint,
                            generatedSdkClientClass: this,
                            includeCredentialsOnCrossOriginRequests,
                            response: getGeneratedEndpointResponse({
                                response: HttpResponseBody.streaming(streamingResponse)
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
                                response: HttpResponseBody.streaming(streamParameter.streamResponse)
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
                            response: HttpResponseBody.text(textResponse)
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
                                response: HttpResponseBody.bytes(bytesResponse)
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

        if (websocketChannel != null && websocketChannelId != null && this.shouldGenerateWebsocketClients) {
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
                parameterNaming
            });
        } else {
            this.generatedWebsocketImplementation = undefined;
        }

        this.generatedWrappedServices = package_.subpackages.reduce<GeneratedWrappedService[]>(
            (acc: GeneratedWrappedService[], wrappedSubpackageId: SubpackageId) => {
                const subpackage = this.packageResolver.resolveSubpackage(wrappedSubpackageId);
                if (
                    subpackage.hasEndpointsInTree ||
                    (this.shouldGenerateWebsocketClients && subpackage.websocket != null)
                ) {
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
        const authSchemes: AuthScheme[] = [...intermediateRepresentation.auth.schemes];
        for (const header of intermediateRepresentation.headers) {
            if (header.name.wireValue.toLowerCase() === "authorization") {
                authSchemes.push(
                    AuthScheme.header({
                        key: "_GlobalAuthorizationHeader",
                        name: header.name,
                        prefix: undefined,
                        headerEnvVar: header.env,
                        valueType: header.valueType,
                        docs: header.docs
                    })
                );
            }
        }

        const isAnyAuth = intermediateRepresentation.auth.requirement === "ANY";
        const anyAuthProviders: AuthProviderInstance[] = [];

        const getAuthProvider = (authScheme: AuthScheme): AuthProviderInstance =>
            AuthScheme._visit<AuthProviderInstance>(authScheme, {
                basic: (scheme) => new BasicAuthProviderInstance(scheme),
                bearer: (scheme) => new BearerAuthProviderInstance(scheme),
                header: (scheme) => new HeaderAuthProviderInstance(scheme),
                oauth: () => new OAuthAuthProviderInstance(),
                inferred: () => new InferredAuthProviderInstance(),
                _other: () => {
                    throw new Error("Unknown auth scheme: " + authScheme.type);
                }
            });

        for (const authScheme of authSchemes) {
            if (isAnyAuth) {
                const authProvider = getAuthProvider(authScheme);
                anyAuthProviders.push(authProvider);
            } else {
                this.authProvider = getAuthProvider(authScheme);
                break;
            }
        }

        // After the loop, if isAnyAuth, create AnyAuthProviderInstance with all collected providers
        if (isAnyAuth && anyAuthProviders.length > 0) {
            this.authProvider = new AnyAuthProviderInstance(anyAuthProviders);
        }
    }

    private getGeneratedEndpointRequest({
        endpoint,
        requestBody,
        packageId,
        service
    }: {
        endpoint: HttpEndpoint;
        requestBody: HttpRequestBody | undefined;
        packageId: PackageId;
        service: HttpService;
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
                parameterNaming: this.parameterNaming
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
                parameterNaming: this.parameterNaming
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
                parameterNaming: this.parameterNaming
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
        context: SdkContext;
        endpointId: string;
        example: ExampleEndpointCall;
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
        context: SdkContext;
        endpointId: string;
        example: ExampleEndpointCall;
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

    public getEndpoint(args: { context: SdkContext; endpointId: string }): GeneratedEndpointImplementation | undefined {
        const generatedEndpoint = this.generatedEndpointImplementations.find((generatedEndpoint) => {
            return generatedEndpoint.endpoint.id === args.endpointId;
        });
        return generatedEndpoint;
    }

    public getGenerateEndpointMetadata(): boolean {
        return this.generateEndpointMetadata;
    }

    public accessFromRootClient(args: { referenceToRootClient: ts.Expression }): ts.Expression {
        return [...this.package_.fernFilepath.allParts].reduce<ts.Expression>(
            (acc, part) => ts.factory.createPropertyAccessExpression(acc, part.camelCase.unsafeName),
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

    public instantiateAsRoot(args: { context: SdkContext; npmPackage: NpmPackage }): ts.Expression {
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

    public writeToFile(context: SdkContext): void {
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
            this.authProvider && this.anyEndpointWithAuth
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

        if (this.authProvider && this.anyEndpointWithAuth) {
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
                    initializer:
                        optionsInterface.properties?.every((property) => property.hasQuestionToken) &&
                        !context.baseClient.anyRequiredBaseClientOptions(context)
                            ? "{}"
                            : undefined
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
                        initializer:
                            optionsInterface.properties?.every((property) => property.hasQuestionToken) &&
                            !context.baseClient.anyRequiredBaseClientOptions(context)
                                ? "{}"
                                : undefined
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

            const publicMethodName = endpoint.endpoint.name.camelCase.unsafeName;
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
                name: "connect",
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

    private getCtorOptionsStatements(context: SdkContext): Code {
        context.importsManager.addImportFromRoot("BaseClient", {
            namedImports: ["normalizeClientOptions"]
        });

        return code`this._options = normalizeClientOptions(options);`;
    }

    private getCtorOptionsStatementsWithAuth(context: SdkContext): Code {
        context.importsManager.addImportFromRoot("BaseClient", {
            namedImports: ["normalizeClientOptionsWithAuth"]
        });

        return code`this._options = normalizeClientOptionsWithAuth(options);`;
    }

    public getBaseUrl(endpoint: HttpEndpoint, context: SdkContext): ts.Expression {
        const referenceToBaseUrl = this.getReferenceToBaseUrl(context);

        const environment = this.getEnvironment(endpoint, context);

        return ts.factory.createBinaryExpression(
            referenceToBaseUrl,
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            environment
        );
    }

    public getEnvironment(endpoint: HttpEndpoint, context: SdkContext): ts.Expression {
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

    private generateRequestOptionsInterface(context: SdkContext): InterfaceDeclarationStructure {
        return {
            kind: StructureKind.Interface,
            name: GeneratedSdkClientClassImpl.REQUEST_OPTIONS_INTERFACE_NAME,
            properties: [],
            extends: [getTextOfTsNode(context.sdkClientClass.getReferenceToBaseRequestOptions().getTypeNode())],
            isExported: true
        };
    }

    /******************************
     * IDEMPOTENT REQUEST OPTIONS *
     ******************************/

    private generateIdempotentRequestOptionsInterface(context: SdkContext): InterfaceDeclarationStructure {
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

    public getOptionsPropertiesForSnippet(context: SdkContext): ts.ObjectLiteralElementLike[] {
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
                properties.push(
                    ts.factory.createPropertyAssignment(
                        getPropertyKey(this.getOptionKeyForHeader(header)),
                        ts.factory.createStringLiteral(`YOUR_${header.name.name.screamingSnakeCase.unsafeName}`)
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
                    ts.factory.createStringLiteral(`YOUR_${variable.name.screamingSnakeCase.unsafeName}`)
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

    private generateOptionsInterface(context: SdkContext): InterfaceDeclarationStructure {
        const properties: OptionalKind<PropertySignatureStructure>[] = [];

        return {
            kind: StructureKind.Interface,
            name: GeneratedSdkClientClassImpl.OPTIONS_INTERFACE_NAME,
            properties,
            extends: [getTextOfTsNode(context.sdkClientClass.getReferenceToBaseClientOptions().getTypeNode())],
            isExported: true
        };
    }

    private getReferenceToEnvironment(context: SdkContext): ts.Expression {
        return context.coreUtilities.fetcher.Supplier.get(
            this.getReferenceToOption(GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME)
        );
    }

    private getReferenceToBaseUrl(context: SdkContext): ts.Expression {
        return context.coreUtilities.fetcher.Supplier.get(
            this.getReferenceToOption(GeneratedSdkClientClassImpl.BASE_URL_OPTION_PROPERTY_NAME)
        );
    }

    public getReferenceToRequestOptions(endpoint: HttpEndpoint): ts.TypeReferenceNode {
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

    public getReferenceToLogger(_context: SdkContext): ts.Expression {
        return this.getReferenceToOption(GeneratedSdkClientClassImpl.LOGGING_FIELD_NAME);
    }

    public getReferenceToOptions(): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
        );
    }

    public getReferenceToFetcher(context: SdkContext): ts.Expression {
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

    private getOptionKeyForHeader(header: HttpHeader): string {
        return header.name.name.camelCase.unsafeName;
    }

    public getReferenceToMetadataForEndpointSupplier(): ts.Expression {
        return ts.factory.createIdentifier(GeneratedSdkClientClassImpl.METADATA_FOR_TOKEN_SUPPLIER_VAR);
    }

    public getReferenceToRootPathParameter(pathParameter: PathParameter): ts.Expression {
        return this.getReferenceToOption(
            getParameterNameForRootPathParameter({
                pathParameter,
                retainOriginalCasing: this.retainOriginalCasing,
                parameterNaming: this.parameterNaming
            })
        );
    }

    public getReferenceToVariable(variableId: VariableId): ts.Expression {
        const variable = this.intermediateRepresentation.variables.find((v) => v.id === variableId);
        if (variable == null) {
            throw new Error("Variable does not exist: " + variableId);
        }
        return this.getReferenceToOption(this.getOptionNameForVariable(variable));
    }

    private getOptionNameForVariable(variable: VariableDeclaration): string {
        return variable.name.camelCase.unsafeName;
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
