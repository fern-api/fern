import { assertNever, SetRequired } from "@fern-api/core-utils";
import {
    AuthScheme,
    BasicAuthScheme,
    BearerAuthScheme,
    ExampleEndpointCall,
    HeaderAuthScheme,
    HttpEndpoint,
    HttpHeader,
    HttpResponseBody,
    IntermediateRepresentation,
    OAuthScheme,
    Package,
    PathParameter,
    VariableDeclaration,
    VariableId
} from "@fern-fern/ir-sdk/api";
import {
    getTextOfTsNode,
    ImportsManager,
    JavaScriptRuntime,
    maybeAddDocsStructure,
    NpmPackage,
    PackageId
} from "@fern-typescript/commons";
import { GeneratedEndpointImplementation, GeneratedSdkClientClass, SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";
import {
    ClassDeclarationStructure,
    InterfaceDeclarationStructure,
    MethodDeclarationStructure,
    ModuleDeclarationStructure,
    OptionalKind,
    PropertyDeclarationStructure,
    PropertySignatureStructure,
    Scope,
    StructureKind,
    ts
} from "ts-morph";
import { code } from "ts-poet";
import { GeneratedBytesEndpointRequest } from "./endpoint-request/GeneratedBytesEndpointRequest";
import { GeneratedDefaultEndpointRequest } from "./endpoint-request/GeneratedDefaultEndpointRequest";
import { GeneratedFileUploadEndpointRequest } from "./endpoint-request/GeneratedFileUploadEndpointRequest";
import { GeneratedNonThrowingEndpointResponse } from "./endpoints/default/endpoint-response/GeneratedNonThrowingEndpointResponse";
import { GeneratedThrowingEndpointResponse } from "./endpoints/default/endpoint-response/GeneratedThrowingEndpointResponse";
import { GeneratedDefaultEndpointImplementation } from "./endpoints/default/GeneratedDefaultEndpointImplementation";
import { GeneratedFileDownloadEndpointImplementation } from "./endpoints/GeneratedFileDownloadEndpointImplementation";
import { GeneratedStreamingEndpointImplementation } from "./endpoints/GeneratedStreamingEndpointImplementation";
import { getNonVariablePathParameters } from "./endpoints/utils/getNonVariablePathParameters";
import { getParameterNameForPathParameter } from "./endpoints/utils/getParameterNameForPathParameter";
import { getLiteralValueForHeader, isLiteralHeader } from "./endpoints/utils/isLiteralHeader";
import { REQUEST_OPTIONS_PARAMETER_NAME } from "./endpoints/utils/requestOptionsParameter";
import { GeneratedHeader } from "./GeneratedHeader";
import { GeneratedWrappedService } from "./GeneratedWrappedService";
import { OAuthTokenProviderGenerator } from "./oauth-generator/OAuthTokenProviderGenerator";

export declare namespace GeneratedSdkClientClassImpl {
    export interface Init {
        isRoot: boolean;
        importsManager: ImportsManager;
        intermediateRepresentation: IntermediateRepresentation;
        packageId: PackageId;
        serviceClassName: string;
        errorResolver: ErrorResolver;
        packageResolver: PackageResolver;
        neverThrowErrors: boolean;
        includeCredentialsOnCrossOriginRequests: boolean;
        allowCustomFetcher: boolean;
        requireDefaultEnvironment: boolean;
        defaultTimeoutInSeconds: number | "infinity" | undefined;
        npmPackage: NpmPackage | undefined;
        targetRuntime: JavaScriptRuntime;
        includeContentHeadersOnFileDownloadResponse: boolean;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        inlineFileProperties: boolean;
        omitUndefined: boolean;
        oauthTokenProviderGenerator: OAuthTokenProviderGenerator;
    }
}

export class GeneratedSdkClientClassImpl implements GeneratedSdkClientClass {
    private static REQUEST_OPTIONS_INTERFACE_NAME = "RequestOptions";
    private static IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME = "IdempotentRequestOptions";
    private static TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME = "timeoutInSeconds";
    private static ABORT_SIGNAL_PROPERTY_NAME = "abortSignal";
    private static MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME = "maxRetries";
    private static OPTIONS_INTERFACE_NAME = "Options";
    private static OPTIONS_PRIVATE_MEMBER = "_options";
    private static ENVIRONMENT_OPTION_PROPERTY_NAME = "environment";
    private static CUSTOM_FETCHER_PROPERTY_NAME = "fetcher";
    private static AUTHORIZATION_HEADER_HELPER_METHOD_NAME = "_getAuthorizationHeader";
    private static CUSTOM_AUTHORIZATION_HEADER_HELPER_METHOD_NAME = "_getCustomAuthorizationHeaders";

    private isRoot: boolean;
    private intermediateRepresentation: IntermediateRepresentation;
    private oauthAuthScheme: OAuthScheme | undefined;
    private bearerAuthScheme: BearerAuthScheme | undefined;
    private basicAuthScheme: BasicAuthScheme | undefined;
    private authHeaders: HeaderAuthScheme[];
    private serviceClassName: string;
    private package_: Package;
    private generatedEndpointImplementations: GeneratedEndpointImplementation[];
    private generatedWrappedServices: GeneratedWrappedService[];
    private allowCustomFetcher: boolean;
    private packageResolver: PackageResolver;
    private requireDefaultEnvironment: boolean;
    private npmPackage: NpmPackage | undefined;
    private targetRuntime: JavaScriptRuntime;
    private packageId: PackageId;
    private retainOriginalCasing: boolean;
    private inlineFileProperties: boolean;
    private omitUndefined: boolean;
    private importsManager: ImportsManager;
    private oauthTokenProviderGenerator: OAuthTokenProviderGenerator;

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
        requireDefaultEnvironment,
        defaultTimeoutInSeconds,
        npmPackage,
        targetRuntime,
        includeContentHeadersOnFileDownloadResponse,
        includeSerdeLayer,
        retainOriginalCasing,
        inlineFileProperties,
        omitUndefined,
        importsManager,
        oauthTokenProviderGenerator
    }: GeneratedSdkClientClassImpl.Init) {
        this.isRoot = isRoot;
        this.intermediateRepresentation = intermediateRepresentation;
        this.serviceClassName = serviceClassName;
        this.packageId = packageId;
        this.allowCustomFetcher = allowCustomFetcher;
        this.packageResolver = packageResolver;
        this.requireDefaultEnvironment = requireDefaultEnvironment;
        this.npmPackage = npmPackage;
        this.targetRuntime = targetRuntime;
        this.retainOriginalCasing = retainOriginalCasing;
        this.inlineFileProperties = inlineFileProperties;
        this.omitUndefined = omitUndefined;
        this.importsManager = importsManager;
        this.oauthTokenProviderGenerator = oauthTokenProviderGenerator;

        const package_ = packageResolver.resolvePackage(packageId);
        this.package_ = package_;

        const service = packageResolver.getServiceDeclaration(packageId);

        if (service == null) {
            this.generatedEndpointImplementations = [];
        } else {
            this.generatedEndpointImplementations = service.endpoints.map((endpoint) => {
                const requestBody = endpoint.requestBody ?? undefined;

                const getGeneratedEndpointRequest = () => {
                    if (requestBody?.type === "bytes") {
                        return new GeneratedBytesEndpointRequest({
                            ir: this.intermediateRepresentation,
                            packageId,
                            service,
                            endpoint,
                            requestBody,
                            generatedSdkClientClass: this,
                            targetRuntime: this.targetRuntime,
                            retainOriginalCasing: this.retainOriginalCasing
                        });
                    }
                    if (requestBody?.type === "fileUpload") {
                        return new GeneratedFileUploadEndpointRequest({
                            importsManager: this.importsManager,
                            ir: this.intermediateRepresentation,
                            packageId,
                            service,
                            endpoint,
                            requestBody,
                            generatedSdkClientClass: this,
                            targetRuntime: this.targetRuntime,
                            retainOriginalCasing: this.retainOriginalCasing,
                            inlineFileProperties: this.inlineFileProperties
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
                            retainOriginalCasing: this.retainOriginalCasing
                        });
                    }
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
                            includeSerdeLayer
                        });
                    } else {
                        return new GeneratedThrowingEndpointResponse({
                            packageId,
                            endpoint,
                            errorDiscriminationStrategy: intermediateRepresentation.errorDiscriminationStrategy,
                            errorResolver,
                            response,
                            includeContentHeadersOnResponse: includeContentHeadersOnFileDownloadResponse,
                            clientClass: this
                        });
                    }
                };

                const getDefaultEndpointImplementation = ({
                    response
                }: {
                    response:
                        | HttpResponseBody.Json
                        | HttpResponseBody.FileDownload
                        | HttpResponseBody.Text
                        | HttpResponseBody.Bytes
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
                        omitUndefined: this.omitUndefined
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
                            omitUndefined: this.omitUndefined
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
                            omitUndefined: this.omitUndefined
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
                            omitUndefined: this.omitUndefined
                        }),
                    bytes: (bytesResponse) => {
                        return getDefaultEndpointImplementation({
                            response: HttpResponseBody.bytes(bytesResponse)
                        });
                    },
                    text: (textResponse) => {
                        return getDefaultEndpointImplementation({
                            response: HttpResponseBody.text(textResponse)
                        });
                    },
                    _other: () => {
                        throw new Error("Unknown Response type: " + endpoint.response?.body?.type);
                    }
                });
            });
        }

        this.generatedWrappedServices = package_.subpackages.reduce<GeneratedWrappedService[]>(
            (acc, wrappedSubpackageId) => {
                const subpackage = this.packageResolver.resolveSubpackage(wrappedSubpackageId);
                if (subpackage.hasEndpointsInTree) {
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

        this.authHeaders = [];
        for (const authScheme of intermediateRepresentation.auth.schemes) {
            AuthScheme._visit(authScheme, {
                basic: (basicAuthScheme) => {
                    this.basicAuthScheme = basicAuthScheme;
                },
                bearer: (bearerAuthScheme) => {
                    this.bearerAuthScheme = bearerAuthScheme;
                },
                header: (header) => {
                    this.authHeaders.push(header);
                },
                oauth: (oauthScheme) => {
                    this.oauthAuthScheme = oauthScheme;
                },
                _other: () => {
                    throw new Error("Unknown auth scheme: " + authScheme.type);
                }
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
    }): ts.Expression | undefined {
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
            invocation
        });
    }

    public getEndpoint(args: { context: SdkContext; endpointId: string }): GeneratedEndpointImplementation | undefined {
        const generatedEndpoint = this.generatedEndpointImplementations.find((generatedEndpoint) => {
            return generatedEndpoint.endpoint.id === args.endpointId;
        });
        return generatedEndpoint;
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
        serviceModule.statements = [optionsInterface, this.generateRequestOptionsInterface(context)];
        context.sourceFile.addModule(serviceModule);

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

        if (this.isRoot && context.generateOAuthClients) {
            serviceClass.properties.push({
                kind: StructureKind.Property,
                name: OAuthTokenProviderGenerator.OAUTH_TOKEN_PROVIDER_PROPERTY_NAME,
                type: getTextOfTsNode(context.coreUtilities.auth.OAuthTokenProvider._getReferenceToType()),
                scope: Scope.Private,
                isReadonly: true
            });
        }

        if (this.isRoot && context.generateOAuthClients && this.oauthAuthScheme != null) {
            const authClientTypeName = this.oauthTokenProviderGenerator.getAuthClientTypeName({
                context,
                oauthScheme: this.oauthAuthScheme
            });
            const properties: ts.PropertyAssignment[] = [
                ts.factory.createPropertyAssignment(
                    OAuthTokenProviderGenerator.OAUTH_CLIENT_ID_PROPERTY_NAME,
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createThis(),
                            GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
                        ),
                        OAuthTokenProviderGenerator.OAUTH_CLIENT_ID_PROPERTY_NAME
                    )
                ),
                ts.factory.createPropertyAssignment(
                    OAuthTokenProviderGenerator.OAUTH_CLIENT_SECRET_PROPERTY_NAME,
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createThis(),
                            GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
                        ),
                        OAuthTokenProviderGenerator.OAUTH_CLIENT_SECRET_PROPERTY_NAME
                    )
                ),

                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier(OAuthTokenProviderGenerator.OAUTH_AUTH_CLIENT_PROPERTY_NAME),
                    ts.factory.createNewExpression(ts.factory.createIdentifier(authClientTypeName), undefined, [
                        ts.factory.createObjectLiteralExpression(
                            [
                                ts.factory.createPropertyAssignment(
                                    ts.factory.createIdentifier(
                                        GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME
                                    ),
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createThis(),
                                            GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
                                        ),
                                        ts.factory.createIdentifier(
                                            GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME
                                        )
                                    )
                                )
                            ],
                            true
                        )
                    ])
                )
            ];
            const parameters = [
                {
                    name: GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER,
                    isReadonly: true,
                    scope: Scope.Protected,
                    type: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(serviceModule.name),
                                ts.factory.createIdentifier(optionsInterface.name)
                            )
                        )
                    )
                }
            ];
            const readClientId =
                this.oauthAuthScheme.configuration.clientIdEnvVar != null
                    ? code`
                    const ${OAuthTokenProviderGenerator.OAUTH_CLIENT_ID_PROPERTY_NAME} = this._options.${OAuthTokenProviderGenerator.OAUTH_CLIENT_ID_PROPERTY_NAME} ?? process.env["${this.oauthAuthScheme.configuration.clientIdEnvVar}"];
                    if (${OAuthTokenProviderGenerator.OAUTH_CLIENT_ID_PROPERTY_NAME} == null) {
                        throw new Error(
                            "${OAuthTokenProviderGenerator.OAUTH_CLIENT_ID_PROPERTY_NAME} is required; either pass it as an argument or set the ${this.oauthAuthScheme.configuration.clientIdEnvVar} environment variable"
                        );
                    }
                `
                    : code``;
            const setClientId =
                this.oauthAuthScheme.configuration.clientIdEnvVar != null
                    ? code`
                ${OAuthTokenProviderGenerator.OAUTH_CLIENT_ID_PROPERTY_NAME}
            `
                    : code`
                ${OAuthTokenProviderGenerator.OAUTH_CLIENT_ID_PROPERTY_NAME}: this._options.${OAuthTokenProviderGenerator.OAUTH_CLIENT_ID_PROPERTY_NAME}
            `;
            const readClientSecret =
                this.oauthAuthScheme.configuration.clientSecretEnvVar != null
                    ? code`
                    const ${OAuthTokenProviderGenerator.OAUTH_CLIENT_SECRET_PROPERTY_NAME} = this._options.${OAuthTokenProviderGenerator.OAUTH_CLIENT_SECRET_PROPERTY_NAME} ?? process.env["${this.oauthAuthScheme.configuration.clientSecretEnvVar}"];
                    if (${OAuthTokenProviderGenerator.OAUTH_CLIENT_SECRET_PROPERTY_NAME} == null) {
                        throw new Error(
                            "${OAuthTokenProviderGenerator.OAUTH_CLIENT_SECRET_PROPERTY_NAME} is required; either pass it as an argument or set the ${this.oauthAuthScheme.configuration.clientSecretEnvVar} environment variable"
                        );
                    }
                `
                    : code``;
            const setClientSecret =
                this.oauthAuthScheme.configuration.clientSecretEnvVar != null
                    ? code`
                ${OAuthTokenProviderGenerator.OAUTH_CLIENT_SECRET_PROPERTY_NAME}
            `
                    : code`
                ${OAuthTokenProviderGenerator.OAUTH_CLIENT_SECRET_PROPERTY_NAME}: this._options.${OAuthTokenProviderGenerator.OAUTH_CLIENT_SECRET_PROPERTY_NAME}
            `;
            const statements = code`
                ${readClientId}

                ${readClientSecret}

                this.${OAuthTokenProviderGenerator.OAUTH_TOKEN_PROVIDER_PROPERTY_NAME} = new core.${OAuthTokenProviderGenerator.OAUTH_TOKEN_PROVIDER_CLASS_NAME}({
                    ${setClientId},
                    ${setClientSecret},
                    ${OAuthTokenProviderGenerator.OAUTH_AUTH_CLIENT_PROPERTY_NAME}: new ${authClientTypeName}({
                        environment: this._options.environment,
                    }),
                });
            `;
            serviceClass.ctors.push({
                parameters,
                statements: statements.toString({ dprintOptions: { indentWidth: 4 } })
            });
        } else {
            serviceClass.ctors.push({
                parameters: [
                    {
                        name: GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER,
                        isReadonly: true,
                        scope: Scope.Protected,
                        type: getTextOfTsNode(
                            ts.factory.createTypeReferenceNode(
                                ts.factory.createQualifiedName(
                                    ts.factory.createIdentifier(serviceModule.name),
                                    ts.factory.createIdentifier(optionsInterface.name)
                                )
                            )
                        ),
                        initializer: optionsInterface.properties?.every((property) => property.hasQuestionToken)
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

            if (!isIdempotent && endpoint.endpoint.idempotent) {
                isIdempotent = true;
            }

            const statements = endpoint.getStatements(context);
            // const returnsAPIPromise = !context.neverThrowErrors && !endpoint.isPaginated(context);

            const method: MethodDeclarationStructure = {
                kind: StructureKind.Method,
                name: endpoint.endpoint.name.camelCase.unsafeName,
                parameters: signature.parameters,
                returnType: getTextOfTsNode(
                    ts.factory.createTypeReferenceNode("Promise", [signature.returnTypeWithoutPromise])
                ),
                scope: Scope.Public,
                isAsync: true, // if not returnsAPIPromise we return an `APIPromise`
                statements: statements.map(getTextOfTsNode),
                overloads: overloads.map((overload, index) => ({
                    docs: index === 0 && docs != null ? ["\n" + docs] : undefined,
                    parameters: overload.parameters,
                    returnType: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode("Promise", [overload.returnTypeWithoutPromise])
                    )
                }))
            };
            serviceClass.methods.push(method);

            if (overloads.length === 0) {
                maybeAddDocsStructure(method, docs);
            }
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

        if (this.shouldGenerateAuthorizationHeaderHelperMethod()) {
            const returnsMaybeAuth =
                !this.intermediateRepresentation.sdkConfig.isAuthMandatory || this.basicAuthScheme != null;
            const returnType = returnsMaybeAuth
                ? ts.factory.createTypeReferenceNode("Promise", [
                      ts.factory.createUnionTypeNode([
                          ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                          ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                      ])
                  ])
                : ts.factory.createTypeReferenceNode("Promise", [
                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                  ]);

            serviceClass.methods.push({
                scope: Scope.Protected,
                isAsync: true,
                name: GeneratedSdkClientClassImpl.AUTHORIZATION_HEADER_HELPER_METHOD_NAME,
                statements: this.getAuthorizationHeaderStatements(context).map(getTextOfTsNode),
                returnType: getTextOfTsNode(returnType)
            });
        }

        if (this.shouldGenerateCustomAuthorizationHeaderHelperMethod()) {
            serviceClass.methods.push({
                scope: Scope.Protected,
                isAsync: true,
                name: GeneratedSdkClientClassImpl.CUSTOM_AUTHORIZATION_HEADER_HELPER_METHOD_NAME,
                statements: this.getCustomAuthorizationHeaderStatements(context).map(getTextOfTsNode)
            });
        }

        context.sourceFile.addClass(serviceClass);
    }

    private shouldGenerateAuthorizationHeaderHelperMethod(): boolean {
        if (this.generatedEndpointImplementations.length === 0) {
            return false;
        }
        return this.oauthAuthScheme != null || this.bearerAuthScheme != null || this.basicAuthScheme != null;
    }

    private shouldGenerateCustomAuthorizationHeaderHelperMethod(): boolean {
        if (this.generatedEndpointImplementations.length === 0) {
            return false;
        }
        return this.getCustomAuthorizationHeaders().length > 0;
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

    public getAuthorizationHeaderValue(): ts.Expression | undefined {
        if (this.shouldGenerateAuthorizationHeaderHelperMethod()) {
            return ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createThis(),
                        GeneratedSdkClientClassImpl.AUTHORIZATION_HEADER_HELPER_METHOD_NAME
                    ),
                    undefined,
                    []
                )
            );
        } else {
            return undefined;
        }
    }

    public getCustomAuthorizationHeadersValue(): ts.Expression | undefined {
        if (this.shouldGenerateCustomAuthorizationHeaderHelperMethod()) {
            return ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createThis(),
                        GeneratedSdkClientClassImpl.CUSTOM_AUTHORIZATION_HEADER_HELPER_METHOD_NAME
                    ),
                    undefined,
                    []
                )
            );
        } else {
            return undefined;
        }
    }

    public getHeaders(context: SdkContext): GeneratedHeader[] {
        const headers: GeneratedHeader[] = [
            ...this.intermediateRepresentation.headers
                // auth headers are handled separately
                .filter((header) => !this.isAuthorizationHeader(header))
                .map((header) => {
                    const headerName = this.getOptionKeyForHeader(header);
                    const literalValue = getLiteralValueForHeader(header, context);

                    let value: ts.Expression;
                    if (literalValue != null) {
                        if (typeof literalValue === "boolean") {
                            const booleanLiteral = literalValue ? ts.factory.createTrue() : ts.factory.createFalse();
                            value = ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createParenthesizedExpression(
                                        ts.factory.createBinaryExpression(
                                            ts.factory.createBinaryExpression(
                                                ts.factory.createPropertyAccessChain(
                                                    ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                                                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                                    ts.factory.createIdentifier(headerName)
                                                ),
                                                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                                ts.factory.createPropertyAccessChain(
                                                    ts.factory.createPropertyAccessExpression(
                                                        ts.factory.createThis(),
                                                        GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
                                                    ),
                                                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                                    ts.factory.createIdentifier(headerName)
                                                )
                                            ),
                                            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                            booleanLiteral
                                        )
                                    ),
                                    ts.factory.createIdentifier("toString")
                                ),
                                undefined,
                                []
                            );
                        } else {
                            value = ts.factory.createBinaryExpression(
                                ts.factory.createPropertyAccessChain(
                                    ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                    ts.factory.createIdentifier(headerName)
                                ),
                                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                ts.factory.createBinaryExpression(
                                    ts.factory.createPropertyAccessChain(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createThis(),
                                            GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
                                        ),
                                        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                        ts.factory.createIdentifier(headerName)
                                    ),
                                    ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                    ts.factory.createStringLiteral(literalValue.toString())
                                )
                            );
                        }
                    } else {
                        value = context.type.stringify(
                            context.coreUtilities.fetcher.Supplier.get(
                                this.getReferenceToOption(this.getOptionKeyForHeader(header))
                            ),
                            header.valueType,
                            { includeNullCheckIfOptional: true }
                        );
                    }

                    return {
                        header: header.name.wireValue,
                        value
                    };
                }),
            {
                header: this.intermediateRepresentation.sdkConfig.platformHeaders.language,
                value: ts.factory.createStringLiteral("JavaScript")
            }
        ];

        if (this.npmPackage != null) {
            headers.push(
                {
                    header: this.intermediateRepresentation.sdkConfig.platformHeaders.sdkName,
                    value: ts.factory.createStringLiteral(this.npmPackage.packageName)
                },
                {
                    header: this.intermediateRepresentation.sdkConfig.platformHeaders.sdkVersion,
                    value: ts.factory.createStringLiteral(this.npmPackage.version)
                }
            );
        }

        if (context.ir.sdkConfig.platformHeaders.userAgent != null) {
            headers.push({
                header: context.ir.sdkConfig.platformHeaders.userAgent.header,
                value: ts.factory.createStringLiteral(context.ir.sdkConfig.platformHeaders.userAgent.value)
            });
        }

        const generatedVersion = context.versionContext.getGeneratedVersion();
        if (generatedVersion != null) {
            const header = generatedVersion.getHeader();
            const headerName = this.getOptionKeyForHeader(header);
            const defaultVersion = generatedVersion.getDefaultVersion();

            let value: ts.Expression;
            if (defaultVersion != null) {
                value = ts.factory.createBinaryExpression(
                    ts.factory.createPropertyAccessChain(
                        ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                        ts.factory.createIdentifier(headerName)
                    ),
                    ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                    ts.factory.createBinaryExpression(
                        ts.factory.createPropertyAccessChain(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createThis(),
                                GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
                            ),
                            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                            ts.factory.createIdentifier(headerName)
                        ),
                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                        ts.factory.createStringLiteral(defaultVersion)
                    )
                );
            } else {
                value = ts.factory.createBinaryExpression(
                    ts.factory.createPropertyAccessChain(
                        ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                        ts.factory.createIdentifier(headerName)
                    ),
                    ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createThis(),
                            GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
                        ),
                        ts.factory.createIdentifier(headerName)
                    )
                );
            }
            headers.push({
                header: header.name.wireValue,
                value
            });
        }

        headers.push(
            {
                header: "X-Fern-Runtime",
                value: context.coreUtilities.runtime.type._getReferenceTo()
            },
            {
                header: "X-Fern-Runtime-Version",
                value: context.coreUtilities.runtime.version._getReferenceTo()
            }
        );

        return headers;
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
        const requestOptions: SetRequired<InterfaceDeclarationStructure, "properties"> = {
            kind: StructureKind.Interface,
            name: GeneratedSdkClientClassImpl.REQUEST_OPTIONS_INTERFACE_NAME,
            properties: [
                {
                    name: GeneratedSdkClientClassImpl.TIMEOUT_IN_SECONDS_REQUEST_OPTION_PROPERTY_NAME,
                    type: getTextOfTsNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)),
                    hasQuestionToken: true,
                    docs: ["The maximum time to wait for a response in seconds."]
                },
                {
                    name: GeneratedSdkClientClassImpl.MAX_RETRIES_REQUEST_OPTION_PROPERTY_NAME,
                    type: getTextOfTsNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)),
                    hasQuestionToken: true,
                    docs: ["The number of times to retry the request. Defaults to 2."]
                },
                {
                    name: GeneratedSdkClientClassImpl.ABORT_SIGNAL_PROPERTY_NAME,
                    type: getTextOfTsNode(ts.factory.createIdentifier("AbortSignal")),
                    hasQuestionToken: true,
                    docs: ["A hook to abort the request."]
                },
                ...this.intermediateRepresentation.headers.map((header) => {
                    return {
                        name: this.getOptionKeyForHeader(header),
                        type: getTextOfTsNode(context.type.getReferenceToType(header.valueType).typeNode),
                        hasQuestionToken: true,
                        docs: [`Override the ${header.name.wireValue} header`]
                    };
                }),
                {
                    name: "headers",
                    type: "Record<string, string>",
                    hasQuestionToken: true,
                    docs: ["Additional headers to include in the request."]
                }
            ]
        };

        const generatedVersion = context.versionContext.getGeneratedVersion();
        if (generatedVersion != null) {
            const header = generatedVersion.getHeader();
            requestOptions.properties.push({
                name: this.getOptionKeyForHeader(header),
                type: generatedVersion.getEnumValueUnion(),
                hasQuestionToken: true,
                docs: [`Override the ${header.name.wireValue} header`]
            });
        }
        return requestOptions;
    }

    /******************************
     * IDEMPOTENT REQUEST OPTIONS *
     ******************************/

    private generateIdempotentRequestOptionsInterface(context: SdkContext): InterfaceDeclarationStructure {
        const properties: OptionalKind<PropertySignatureStructure>[] = [];
        for (const header of this.intermediateRepresentation.idempotencyHeaders) {
            if (!isLiteralHeader(header, context)) {
                const type = context.type.getReferenceToType(header.valueType);
                properties.push({
                    name: this.getOptionKeyForHeader(header),
                    type: getTextOfTsNode(type.typeNode),
                    hasQuestionToken: type.isOptional
                });
            }
        }
        return {
            kind: StructureKind.Interface,
            name: GeneratedSdkClientClassImpl.IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME,
            extends: [GeneratedSdkClientClassImpl.REQUEST_OPTIONS_INTERFACE_NAME],
            properties
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

        if (this.oauthAuthScheme != null && context.generateOAuthClients) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    OAuthTokenProviderGenerator.OAUTH_CLIENT_ID_PROPERTY_NAME,
                    ts.factory.createStringLiteral("YOUR_CLIENT_ID")
                )
            );
            properties.push(
                ts.factory.createPropertyAssignment(
                    OAuthTokenProviderGenerator.OAUTH_CLIENT_SECRET_PROPERTY_NAME,
                    ts.factory.createStringLiteral("YOUR_CLIENT_SECRET")
                )
            );
        }

        if (this.bearerAuthScheme != null) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    this.getBearerAuthOptionKey(this.bearerAuthScheme),
                    ts.factory.createStringLiteral(`YOUR_${this.bearerAuthScheme.token.screamingSnakeCase.unsafeName}`)
                )
            );
        }

        if (this.basicAuthScheme != null) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    this.getBasicAuthUsernameOptionKey(this.basicAuthScheme),
                    ts.factory.createStringLiteral(
                        `YOUR_${this.basicAuthScheme.username.screamingSnakeCase.unsafeName}`
                    )
                )
            );
            properties.push(
                ts.factory.createPropertyAssignment(
                    this.getBasicAuthPasswordOptionKey(this.basicAuthScheme),
                    ts.factory.createStringLiteral(
                        `YOUR_${this.basicAuthScheme.password.screamingSnakeCase.unsafeName}`
                    )
                )
            );
        }

        for (const header of this.authHeaders) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    this.getOptionKeyForAuthHeader(header),
                    ts.factory.createStringLiteral(`YOUR_${header.name.name.screamingSnakeCase.unsafeName}`)
                )
            );
        }

        for (const header of this.intermediateRepresentation.headers) {
            if (!isLiteralHeader(header, context)) {
                properties.push(
                    ts.factory.createPropertyAssignment(
                        this.getOptionKeyForHeader(header),
                        ts.factory.createStringLiteral(`YOUR_${header.name.name.screamingSnakeCase.unsafeName}`)
                    )
                );
            }
        }

        const generatedVersion = context.versionContext.getGeneratedVersion();
        if (generatedVersion != null && !generatedVersion.hasDefaultVersion()) {
            const header = generatedVersion.getHeader();
            properties.push(
                ts.factory.createPropertyAssignment(
                    this.getOptionKeyForHeader(header),
                    ts.factory.createStringLiteral(generatedVersion.getFirstEnumValue())
                )
            );
        }

        return properties;
    }

    private generateOptionsInterface(context: SdkContext): InterfaceDeclarationStructure {
        const properties: OptionalKind<PropertySignatureStructure>[] = [];

        if (!this.requireDefaultEnvironment) {
            const generatedEnvironments = context.environments.getGeneratedEnvironments();
            properties.push({
                name: GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME,
                type: getTextOfTsNode(
                    context.coreUtilities.fetcher.Supplier._getReferenceToType(
                        generatedEnvironments.getTypeForUserSuppliedEnvironment(context)
                    )
                ),
                hasQuestionToken: generatedEnvironments.hasDefaultEnvironment()
            });
        }

        if (this.isRoot && this.oauthAuthScheme != null && context.generateOAuthClients) {
            properties.push({
                name: OAuthTokenProviderGenerator.OAUTH_CLIENT_ID_PROPERTY_NAME,
                type: getTextOfTsNode(
                    context.coreUtilities.fetcher.Supplier._getReferenceToType(
                        context.type.getReferenceToType(
                            this.oauthAuthScheme.configuration.tokenEndpoint.requestProperties.clientId.property
                                .valueType
                        ).typeNode
                    )
                ),
                hasQuestionToken: this.oauthAuthScheme.configuration.clientIdEnvVar != null
            });
            properties.push({
                name: OAuthTokenProviderGenerator.OAUTH_CLIENT_SECRET_PROPERTY_NAME,
                type: getTextOfTsNode(
                    context.coreUtilities.fetcher.Supplier._getReferenceToType(
                        context.type.getReferenceToType(
                            this.oauthAuthScheme.configuration.tokenEndpoint.requestProperties.clientSecret.property
                                .valueType
                        ).typeNode
                    )
                ),
                hasQuestionToken: this.oauthAuthScheme.configuration.clientSecretEnvVar != null
            });
        }

        for (const variable of this.intermediateRepresentation.variables) {
            const variableType = context.type.getReferenceToType(variable.type);
            properties.push({
                name: this.getOptionNameForVariable(variable),
                type: getTextOfTsNode(variableType.typeNodeWithoutUndefined),
                hasQuestionToken: variableType.isOptional
            });
        }

        for (const pathParameter of getNonVariablePathParameters(this.intermediateRepresentation.pathParameters)) {
            properties.push({
                name: getParameterNameForPathParameter({
                    pathParameter,
                    retainOriginalCasing: this.retainOriginalCasing
                }),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode)
            });
        }

        if (this.bearerAuthScheme != null) {
            properties.push({
                name: this.getBearerAuthOptionKey(this.bearerAuthScheme),
                type: getTextOfTsNode(
                    context.coreUtilities.fetcher.Supplier._getReferenceToType(
                        this.intermediateRepresentation.sdkConfig.isAuthMandatory &&
                            this.bearerAuthScheme.tokenEnvVar == null
                            ? context.coreUtilities.auth.BearerToken._getReferenceToType()
                            : ts.factory.createUnionTypeNode([
                                  context.coreUtilities.auth.BearerToken._getReferenceToType(),
                                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                              ])
                    )
                ),
                hasQuestionToken:
                    !this.intermediateRepresentation.sdkConfig.isAuthMandatory ||
                    this.bearerAuthScheme.tokenEnvVar != null
            });
        } else if (!this.isRoot && this.oauthAuthScheme != null && context.generateOAuthClients) {
            properties.push({
                name: OAuthTokenProviderGenerator.OAUTH_TOKEN_PROPERTY_NAME,
                type: getTextOfTsNode(
                    context.coreUtilities.fetcher.Supplier._getReferenceToType(
                        this.intermediateRepresentation.sdkConfig.isAuthMandatory
                            ? context.coreUtilities.auth.BearerToken._getReferenceToType()
                            : ts.factory.createUnionTypeNode([
                                  context.coreUtilities.auth.BearerToken._getReferenceToType(),
                                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                              ])
                    )
                ),
                hasQuestionToken: true
            });
        }

        if (this.basicAuthScheme != null) {
            properties.push(
                {
                    name: this.getBasicAuthUsernameOptionKey(this.basicAuthScheme),
                    type: getTextOfTsNode(
                        context.coreUtilities.fetcher.Supplier._getReferenceToType(
                            this.intermediateRepresentation.sdkConfig.isAuthMandatory &&
                                this.basicAuthScheme.passwordEnvVar == null &&
                                this.basicAuthScheme.usernameEnvVar == null
                                ? ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                                : ts.factory.createUnionTypeNode([
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                  ])
                        )
                    ),
                    hasQuestionToken:
                        !this.intermediateRepresentation.sdkConfig.isAuthMandatory ||
                        (this.basicAuthScheme.passwordEnvVar != null && this.basicAuthScheme.usernameEnvVar != null)
                },
                {
                    name: this.getBasicAuthPasswordOptionKey(this.basicAuthScheme),
                    type: getTextOfTsNode(
                        context.coreUtilities.fetcher.Supplier._getReferenceToType(
                            this.intermediateRepresentation.sdkConfig.isAuthMandatory &&
                                this.basicAuthScheme.passwordEnvVar == null &&
                                this.basicAuthScheme.usernameEnvVar == null
                                ? ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                                : ts.factory.createUnionTypeNode([
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                  ])
                        )
                    ),
                    hasQuestionToken:
                        !this.intermediateRepresentation.sdkConfig.isAuthMandatory ||
                        (this.basicAuthScheme.passwordEnvVar != null && this.basicAuthScheme.usernameEnvVar != null)
                }
            );
        }

        for (const header of this.authHeaders) {
            const referenceToHeaderType = context.type.getReferenceToType(header.valueType);
            const isOptional =
                referenceToHeaderType.isOptional || !this.intermediateRepresentation.sdkConfig.isAuthMandatory;
            properties.push({
                name: this.getOptionKeyForAuthHeader(header),
                type: getTextOfTsNode(
                    context.coreUtilities.fetcher.Supplier._getReferenceToType(
                        this.intermediateRepresentation.sdkConfig.isAuthMandatory
                            ? referenceToHeaderType.typeNode
                            : ts.factory.createUnionTypeNode([
                                  referenceToHeaderType.typeNodeWithoutUndefined,
                                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                              ])
                    )
                ),
                hasQuestionToken: isOptional
            });
        }

        for (const header of this.intermediateRepresentation.headers) {
            const type = context.type.getReferenceToType(header.valueType);
            if (isLiteralHeader(header, context)) {
                properties.push({
                    name: this.getOptionKeyForHeader(header),
                    type: getTextOfTsNode(context.type.getReferenceToType(header.valueType).typeNode),
                    hasQuestionToken: true,
                    docs: [`Override the ${header.name.wireValue} header`]
                });
            } else {
                properties.push({
                    name: this.getOptionKeyForHeader(header),
                    type: getTextOfTsNode(context.coreUtilities.fetcher.Supplier._getReferenceToType(type.typeNode)),
                    hasQuestionToken: type.isOptional,
                    docs: [`Override the ${header.name.wireValue} header`]
                });
            }
        }

        const generatedVersion = context.versionContext.getGeneratedVersion();
        if (generatedVersion != null) {
            const header = generatedVersion.getHeader();
            properties.push({
                name: this.getOptionKeyForHeader(header),
                type: generatedVersion.getEnumValueUnion(),
                hasQuestionToken: generatedVersion.hasDefaultVersion(),
                docs: [`Override the ${header.name.wireValue} header`]
            });
        }

        if (this.allowCustomFetcher) {
            properties.push({
                name: GeneratedSdkClientClassImpl.CUSTOM_FETCHER_PROPERTY_NAME,
                type: getTextOfTsNode(context.coreUtilities.fetcher.FetchFunction._getReferenceToType()),
                hasQuestionToken: true
            });
        }

        return {
            kind: StructureKind.Interface,
            name: GeneratedSdkClientClassImpl.OPTIONS_INTERFACE_NAME,
            properties
        };
    }

    private getBearerAuthOptionKey(bearerAuthScheme: BearerAuthScheme): string {
        return bearerAuthScheme.token.camelCase.safeName;
    }

    private getBasicAuthUsernameOptionKey(basicAuthScheme: BasicAuthScheme): string {
        return basicAuthScheme.username.camelCase.safeName;
    }

    private getBasicAuthPasswordOptionKey(basicAuthScheme: BasicAuthScheme): string {
        return basicAuthScheme.password.camelCase.safeName;
    }

    private getReferenceToEnvironment(context: SdkContext): ts.Expression {
        return context.coreUtilities.fetcher.Supplier.get(
            this.getReferenceToOption(GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME)
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

    private getReferenceToOption(option: string): ts.Expression {
        return ts.factory.createPropertyAccessExpression(this.getReferenceToOptions(), option);
    }

    private getOptionKeyForHeader(header: HttpHeader): string {
        return header.name.name.camelCase.unsafeName;
    }

    private getOptionKeyForAuthHeader(header: HeaderAuthScheme): string {
        return header.name.name.camelCase.unsafeName;
    }

    private getAuthorizationHeaderStatements(context: SdkContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        if (this.oauthAuthScheme != null) {
            const BEARER_TOKEN_VARIABLE_NAME = "bearer";
            statements.push(
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                                undefined,
                                undefined,
                                context.coreUtilities.fetcher.Supplier.get(
                                    this.getReferenceToOption(OAuthTokenProviderGenerator.OAUTH_TOKEN_PROPERTY_NAME)
                                )
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                )
            );

            statements.push(
                ts.factory.createIfStatement(
                    ts.factory.createBinaryExpression(
                        ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                        ts.factory.createNull()
                    ),
                    ts.factory.createBlock(
                        [
                            ts.factory.createReturnStatement(
                                ts.factory.createTemplateExpression(ts.factory.createTemplateHead("Bearer "), [
                                    ts.factory.createTemplateSpan(
                                        ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                                        ts.factory.createTemplateTail("", "")
                                    )
                                ])
                            )
                        ],
                        true
                    )
                )
            );

            statements.push(ts.factory.createReturnStatement(ts.factory.createIdentifier("undefined")));

            return statements;
        }
        if (this.bearerAuthScheme != null) {
            if (this.bearerAuthScheme.tokenEnvVar != null) {
                const BEARER_TOKEN_VARIABLE_NAME = "bearer";
                statements.push(
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                                    undefined,
                                    undefined,
                                    ts.factory.createBinaryExpression(
                                        ts.factory.createParenthesizedExpression(
                                            context.coreUtilities.fetcher.Supplier.get(
                                                this.getReferenceToOption(
                                                    this.getBearerAuthOptionKey(this.bearerAuthScheme)
                                                )
                                            )
                                        ),
                                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                        ts.factory.createElementAccessExpression(
                                            ts.factory.createPropertyAccessChain(
                                                ts.factory.createIdentifier("process"),
                                                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                                ts.factory.createIdentifier("env")
                                            ),
                                            ts.factory.createStringLiteral(this.bearerAuthScheme.tokenEnvVar)
                                        )
                                    )
                                )
                            ],
                            ts.NodeFlags.Const
                        )
                    )
                );

                if (this.intermediateRepresentation.sdkConfig.isAuthMandatory) {
                    statements.push(
                        ts.factory.createIfStatement(
                            ts.factory.createBinaryExpression(
                                ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                                ts.factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
                                ts.factory.createNull()
                            ),
                            ts.factory.createBlock(
                                [
                                    ts.factory.createThrowStatement(
                                        context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                                            message: ts.factory.createStringLiteral(
                                                `Please specify ${this.bearerAuthScheme.tokenEnvVar} when instantiating the client.`
                                            ),
                                            statusCode: undefined,
                                            responseBody: undefined
                                        })
                                    )
                                ],
                                true
                            )
                        )
                    );

                    statements.push(
                        ts.factory.createReturnStatement(
                            ts.factory.createTemplateExpression(ts.factory.createTemplateHead("Bearer "), [
                                ts.factory.createTemplateSpan(
                                    ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                                    ts.factory.createTemplateTail("", "")
                                )
                            ])
                        )
                    );
                } else {
                    statements.push(
                        ts.factory.createIfStatement(
                            ts.factory.createBinaryExpression(
                                ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                                ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                ts.factory.createNull()
                            ),
                            ts.factory.createBlock(
                                [
                                    ts.factory.createReturnStatement(
                                        ts.factory.createTemplateExpression(ts.factory.createTemplateHead("Bearer "), [
                                            ts.factory.createTemplateSpan(
                                                ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                                                ts.factory.createTemplateTail("", "")
                                            )
                                        ])
                                    )
                                ],
                                true
                            )
                        )
                    );
                }
            } else if (this.intermediateRepresentation.sdkConfig.isAuthMandatory) {
                statements.push(
                    ts.factory.createReturnStatement(
                        ts.factory.createTemplateExpression(ts.factory.createTemplateHead("Bearer "), [
                            ts.factory.createTemplateSpan(
                                context.coreUtilities.fetcher.Supplier.get(
                                    this.getReferenceToOption(this.getBearerAuthOptionKey(this.bearerAuthScheme))
                                ),
                                ts.factory.createTemplateTail("", "")
                            )
                        ])
                    )
                );
            } else {
                const BEARER_TOKEN_VARIABLE_NAME = "bearer";
                statements.push(
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                                    undefined,
                                    undefined,
                                    context.coreUtilities.fetcher.Supplier.get(
                                        this.getReferenceToOption(this.getBearerAuthOptionKey(this.bearerAuthScheme))
                                    )
                                )
                            ],
                            ts.NodeFlags.Const
                        )
                    )
                );

                statements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createBinaryExpression(
                            ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                            ts.factory.createNull()
                        ),
                        ts.factory.createBlock(
                            [
                                ts.factory.createReturnStatement(
                                    ts.factory.createTemplateExpression(ts.factory.createTemplateHead("Bearer "), [
                                        ts.factory.createTemplateSpan(
                                            ts.factory.createIdentifier(BEARER_TOKEN_VARIABLE_NAME),
                                            ts.factory.createTemplateTail("", "")
                                        )
                                    ])
                                )
                            ],
                            true
                        )
                    )
                );
            }
        }

        if (this.basicAuthScheme != null) {
            const usernameExpression =
                this.basicAuthScheme.usernameEnvVar != null
                    ? ts.factory.createBinaryExpression(
                          ts.factory.createParenthesizedExpression(
                              context.coreUtilities.fetcher.Supplier.get(
                                  this.getReferenceToOption(this.getBasicAuthUsernameOptionKey(this.basicAuthScheme))
                              )
                          ),
                          ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                          ts.factory.createElementAccessExpression(
                              ts.factory.createPropertyAccessChain(
                                  ts.factory.createIdentifier("process"),
                                  ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                  ts.factory.createIdentifier("env")
                              ),
                              ts.factory.createStringLiteral(this.basicAuthScheme.usernameEnvVar)
                          )
                      )
                    : context.coreUtilities.fetcher.Supplier.get(
                          this.getReferenceToOption(this.getBasicAuthUsernameOptionKey(this.basicAuthScheme))
                      );

            const passwordExpression =
                this.basicAuthScheme.passwordEnvVar != null
                    ? ts.factory.createBinaryExpression(
                          ts.factory.createParenthesizedExpression(
                              context.coreUtilities.fetcher.Supplier.get(
                                  this.getReferenceToOption(this.getBasicAuthPasswordOptionKey(this.basicAuthScheme))
                              )
                          ),
                          ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                          ts.factory.createElementAccessExpression(
                              ts.factory.createPropertyAccessChain(
                                  ts.factory.createIdentifier("process"),
                                  ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                  ts.factory.createIdentifier("env")
                              ),
                              ts.factory.createStringLiteral(this.basicAuthScheme.passwordEnvVar)
                          )
                      )
                    : context.coreUtilities.fetcher.Supplier.get(
                          this.getReferenceToOption(this.getBasicAuthPasswordOptionKey(this.basicAuthScheme))
                      );

            if (this.intermediateRepresentation.sdkConfig.isAuthMandatory) {
                statements.push(
                    ts.factory.createReturnStatement(
                        context.coreUtilities.auth.BasicAuth.toAuthorizationHeader(
                            usernameExpression,
                            passwordExpression
                        )
                    )
                );
            } else {
                const USERNAME_VARIABLE_NAME = this.basicAuthScheme.username.camelCase.unsafeName;
                const PASSWORD_VARIABLE_NAME = this.basicAuthScheme.password.camelCase.unsafeName;
                statements.push(
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    USERNAME_VARIABLE_NAME,
                                    undefined,
                                    undefined,
                                    usernameExpression
                                )
                            ],
                            ts.NodeFlags.Const
                        )
                    ),
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    PASSWORD_VARIABLE_NAME,
                                    undefined,
                                    undefined,
                                    passwordExpression
                                )
                            ],
                            ts.NodeFlags.Const
                        )
                    )
                );

                statements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createBinaryExpression(
                            ts.factory.createBinaryExpression(
                                ts.factory.createIdentifier(USERNAME_VARIABLE_NAME),
                                ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                ts.factory.createNull()
                            ),
                            ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                            ts.factory.createBinaryExpression(
                                ts.factory.createIdentifier(PASSWORD_VARIABLE_NAME),
                                ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                ts.factory.createNull()
                            )
                        ),
                        ts.factory.createBlock(
                            [
                                ts.factory.createReturnStatement(
                                    context.coreUtilities.auth.BasicAuth.toAuthorizationHeader(
                                        ts.factory.createIdentifier(USERNAME_VARIABLE_NAME),
                                        ts.factory.createIdentifier(PASSWORD_VARIABLE_NAME)
                                    )
                                )
                            ],
                            true
                        )
                    )
                );
            }
        }

        if (!this.intermediateRepresentation.sdkConfig.isAuthMandatory) {
            statements.push(ts.factory.createReturnStatement(ts.factory.createIdentifier("undefined")));
        }

        return statements;
    }

    private getCustomAuthorizationHeaderStatements(context: SdkContext): ts.Statement[] {
        const elements: GeneratedHeader[] = [];
        const statements: ts.Statement[] = [];
        for (const header of this.getCustomAuthorizationHeaders()) {
            const headerVariableName = `${header.header.name.name.camelCase.unsafeName}Value`;
            const headerExpression =
                header.type === "authScheme" && header.header.headerEnvVar != null
                    ? ts.factory.createBinaryExpression(
                          ts.factory.createParenthesizedExpression(
                              context.coreUtilities.fetcher.Supplier.get(
                                  this.getReferenceToOption(this.getKeyForCustomHeader(header))
                              )
                          ),
                          ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                          ts.factory.createElementAccessExpression(
                              ts.factory.createPropertyAccessChain(
                                  ts.factory.createIdentifier("process"),
                                  ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                  ts.factory.createIdentifier("env")
                              ),
                              ts.factory.createStringLiteral(header.header.headerEnvVar)
                          )
                      )
                    : context.coreUtilities.fetcher.Supplier.get(
                          this.getReferenceToOption(this.getKeyForCustomHeader(header))
                      );
            statements.push(
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier(headerVariableName),
                                undefined,
                                undefined,
                                headerExpression
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                )
            );

            const headerValue =
                header.type === "authScheme" && header.header.prefix != null
                    ? ts.factory.createTemplateExpression(
                          ts.factory.createTemplateHead(`${header.header.prefix.trim()} `),
                          [
                              ts.factory.createTemplateSpan(
                                  ts.factory.createIdentifier(headerVariableName),
                                  ts.factory.createTemplateTail("", "")
                              )
                          ]
                      )
                    : ts.factory.createIdentifier(headerVariableName);
            elements.push({
                header: header.header.name.wireValue,
                value: headerValue
            });
        }

        const authHeaders: ts.ObjectLiteralElementLike[] = elements.map(({ header, value }) =>
            ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(header), value)
        );

        const toAuthHeaderStatement = ts.factory.createReturnStatement(
            ts.factory.createObjectLiteralExpression(authHeaders)
        );
        statements.push(toAuthHeaderStatement);

        return statements;
    }

    private getCustomAuthorizationHeaders(): CustomHeader[] {
        const headers: CustomHeader[] = [];

        for (const header of this.intermediateRepresentation.headers) {
            if (this.isAuthorizationHeader(header)) {
                headers.push({ type: "global", header });
            }
        }

        for (const header of this.authHeaders) {
            headers.push({ type: "authScheme", header });
        }

        return headers;
    }

    private isAuthorizationHeader(header: HttpHeader | HeaderAuthScheme): boolean {
        return header.name.wireValue.toLowerCase() === "authorization";
    }

    private getKeyForCustomHeader(header: CustomHeader): string {
        switch (header.type) {
            case "authScheme":
                return this.getOptionKeyForAuthHeader(header.header);
            case "global":
                return this.getOptionKeyForHeader(header.header);
            default:
                assertNever(header);
        }
    }

    public getReferenceToRootPathParameter(pathParameter: PathParameter): ts.Expression {
        return this.getReferenceToOption(
            getParameterNameForPathParameter({
                pathParameter,
                retainOriginalCasing: this.retainOriginalCasing
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
}

type CustomHeader = { type: "global"; header: HttpHeader } | { type: "authScheme"; header: HeaderAuthScheme };
