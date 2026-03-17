import type { SetRequired } from "@fern-api/core-utils";
import type { FernIr } from "@fern-fern/ir-sdk";
import {
    getParameterNameForPropertyPathParameterName,
    getPropertyKey,
    getTextOfTsNode,
    type PackageId
} from "@fern-typescript/commons";
import type { ChannelSignature, GeneratedWebsocketImplementation, SdkContext } from "@fern-typescript/contexts";
import {
    type ClassDeclarationStructure,
    type InterfaceDeclarationStructure,
    type ModuleDeclarationStructure,
    Scope,
    StructureKind,
    ts
} from "ts-morph";
import { buildUrl } from "../endpoints/utils/buildUrl.js";
import { GeneratedQueryParams } from "../endpoints/utils/GeneratedQueryParams.js";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl.js";

/**
 * Represents WebSocket auth fallback configuration from the IR.
 * Defined locally because the published @fern-fern/ir-sdk may not yet include these types.
 *
 * The raw IR JSON uses `_type` as the discriminant (wire format), but the deserialized
 * SDK uses `type`. Since the published SDK doesn't know about this field yet, the
 * value passes through as raw JSON with `_type`. We accept both forms.
 */
interface WebSocketAuthFallback {
    type: "websocketSubprotocol" | "query";
    format?: string;
    name?: string;
}

interface AuthFallbackInfo {
    scheme: FernIr.AuthScheme;
    fallback: WebSocketAuthFallback;
}

export declare namespace GeneratedDefaultWebsocketImplementation {
    export interface Init {
        intermediateRepresentation: FernIr.IntermediateRepresentation;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        channel: FernIr.WebSocketChannel;
        channelId: FernIr.WebSocketChannelId;
        packageId: PackageId;
        serviceClassName: string;
        requireDefaultEnvironment: boolean;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        omitUndefined: boolean;
        parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    }
}

export class GeneratedDefaultWebsocketImplementation implements GeneratedWebsocketImplementation {
    private static readonly CONNECT_ARGS_INTERFACE_NAME = "ConnectArgs";
    private static readonly CONNECT_ARGS_PRIVATE_MEMBER = "args";
    private static readonly DEBUG_PROPERTY_NAME = "debug";
    private static readonly HEADERS_PROPERTY_NAME = "headers";
    private static readonly HEADERS_VARIABLE_NAME = "_headers";

    private static readonly PROTOCOLS_PROPERTY_NAME = "protocols";
    private static readonly RECONNECT_ATTEMPTS_PROPERTY_NAME = "reconnectAttempts";
    private static readonly CONNECTION_TIMEOUT_PROPERTY_NAME = "connectionTimeoutInSeconds";
    private static readonly ABORT_SIGNAL_PROPERTY_NAME = "abortSignal";
    private static readonly GENERATED_VERSION_PROPERTY_NAME = "fernSdkVersion";
    private static readonly DEFAULT_NUM_RECONNECT_ATTEMPTS = 30;
    private static readonly ADDITIONAL_QUERY_PARAMETERS_PROPERTY_NAME = "queryParams";
    private static readonly AUTH_FALLBACK_HEADERS_NAME = "_authFallbackHeaders";
    private static readonly IS_BROWSER_LIKE_NAME = "_isBrowserLike";
    private static readonly AUTH_TOKEN_NAME = "_authToken";
    private static readonly FALLBACK_PROTOCOLS_NAME = "_fallbackProtocols";
    private static readonly FALLBACK_QUERY_PARAMS_NAME = "_fallbackQueryParams";

    private readonly intermediateRepresentation: FernIr.IntermediateRepresentation;
    private readonly generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private readonly channelId: FernIr.WebSocketChannelId;
    private readonly packageId: PackageId;
    private readonly serviceClassName: string;
    private readonly requireDefaultEnvironment: boolean;
    private readonly includeSerdeLayer: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly omitUndefined: boolean;
    private readonly parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    public readonly channel: FernIr.WebSocketChannel;

    constructor({
        intermediateRepresentation,
        generatedSdkClientClass,
        channelId,
        packageId,
        channel,
        serviceClassName,
        requireDefaultEnvironment,
        includeSerdeLayer,
        retainOriginalCasing,
        omitUndefined,
        parameterNaming
    }: GeneratedDefaultWebsocketImplementation.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.channelId = channelId;
        this.packageId = packageId;
        this.channel = channel;
        this.serviceClassName = serviceClassName;
        this.requireDefaultEnvironment = requireDefaultEnvironment;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.omitUndefined = omitUndefined;
        this.parameterNaming = parameterNaming;
    }

    public getSignature(context: SdkContext): ChannelSignature {
        const connectArgsInterface = this.generateConnectArgsInterface(context);

        return {
            parameters: [
                {
                    name: "args",
                    type: `${this.serviceClassName}.${GeneratedDefaultWebsocketImplementation.CONNECT_ARGS_INTERFACE_NAME}`,
                    initializer: connectArgsInterface.properties?.every((p) => p.hasQuestionToken) ? "{}" : undefined
                }
            ],
            returnTypeWithoutPromise: this.getSocketTypeNode(context)
        };
    }

    public getModuleStatement(context: SdkContext): InterfaceDeclarationStructure {
        return this.generateConnectArgsInterface(context);
    }

    public getClassStatements(context: SdkContext): ts.Statement[] {
        return this.generateConnectMethodStatements(context);
    }

    public writeToFile(context: SdkContext): void {
        const connectArgsInterface = this.generateConnectArgsInterface(context);

        const serviceModule: ModuleDeclarationStructure = {
            kind: StructureKind.Module,
            name: this.serviceClassName,
            isExported: true,
            hasDeclareKeyword: true,
            statements: [connectArgsInterface]
        };

        const serviceClass: ClassDeclarationStructure = {
            kind: StructureKind.Class,
            name: this.serviceClassName,
            isExported: true,
            properties: [],
            ctors: [],
            methods: []
        };

        const statements = this.generateConnectMethodStatements(context);

        serviceClass.methods?.push({
            name: this.channel.connectMethodName ?? "connect",
            scope: Scope.Public,
            isAsync: true,
            parameters: [
                {
                    name: "args",
                    type: `${this.serviceClassName}.${GeneratedDefaultWebsocketImplementation.CONNECT_ARGS_INTERFACE_NAME}`,
                    initializer: connectArgsInterface.properties?.every((p) => p.hasQuestionToken) ? "{}" : undefined
                }
            ],
            returnType: getTextOfTsNode(
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                    this.getSocketTypeNode(context)
                ])
            ),
            statements: statements.map(getTextOfTsNode)
        });

        context.sourceFile.addModule(serviceModule);
        context.sourceFile.addClass(serviceClass);
    }

    private generateConnectArgsInterface(context: SdkContext): InterfaceDeclarationStructure {
        const requestOptions: SetRequired<InterfaceDeclarationStructure, "properties"> = {
            kind: StructureKind.Interface,
            name: GeneratedDefaultWebsocketImplementation.CONNECT_ARGS_INTERFACE_NAME,
            properties: [
                ...(this.channel.pathParameters ?? []).map((pathParameter) => {
                    return {
                        name: getPropertyKey(this.getPropertyNameOfPathParameter(pathParameter).propertyName),
                        type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode),
                        hasQuestionToken: false
                    };
                }),
                ...(this.channel.queryParameters ?? []).map((queryParameter) => {
                    const type = context.type.getReferenceToType(queryParameter.valueType);
                    const typeNode = queryParameter.allowMultiple
                        ? ts.factory.createUnionTypeNode([
                              type.typeNodeWithoutUndefined,
                              ts.factory.createArrayTypeNode(type.typeNodeWithoutUndefined)
                          ])
                        : type.typeNodeWithoutUndefined;
                    return {
                        name: getPropertyKey(this.getPropertyNameOfQueryParameter(queryParameter).propertyName),
                        type: getTextOfTsNode(typeNode),
                        hasQuestionToken: context.type.isOptional(queryParameter.valueType)
                    };
                }),
                ...(this.channel.headers ?? []).map((header) => {
                    return {
                        name: getPropertyKey(header.name.wireValue),
                        type: getTextOfTsNode(context.type.getReferenceToType(header.valueType).typeNode),
                        hasQuestionToken: context.type.isOptional(header.valueType)
                    };
                }),
                {
                    name: GeneratedDefaultWebsocketImplementation.PROTOCOLS_PROPERTY_NAME,
                    type: getTextOfTsNode(
                        ts.factory.createUnionTypeNode([
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                            ts.factory.createArrayTypeNode(
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                            )
                        ])
                    ),
                    hasQuestionToken: true,
                    docs: ["WebSocket subprotocols to use for the connection."]
                },
                {
                    name: GeneratedDefaultWebsocketImplementation.ADDITIONAL_QUERY_PARAMETERS_PROPERTY_NAME,
                    type: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                        ])
                    ),
                    hasQuestionToken: true,
                    docs: ["Additional query parameters to send with the websocket connect request."]
                },
                {
                    name: GeneratedDefaultWebsocketImplementation.HEADERS_PROPERTY_NAME,
                    type: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                        ])
                    ),
                    hasQuestionToken: true,
                    docs: ["Arbitrary headers to send with the websocket connect request."]
                },
                {
                    name: GeneratedDefaultWebsocketImplementation.DEBUG_PROPERTY_NAME,
                    type: getTextOfTsNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)),
                    hasQuestionToken: true,
                    docs: ["Enable debug mode on the websocket. Defaults to false."]
                },
                {
                    name: GeneratedDefaultWebsocketImplementation.RECONNECT_ATTEMPTS_PROPERTY_NAME,
                    type: getTextOfTsNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)),
                    hasQuestionToken: true,
                    docs: ["Number of reconnect attempts. Defaults to 30."]
                },
                {
                    name: GeneratedDefaultWebsocketImplementation.CONNECTION_TIMEOUT_PROPERTY_NAME,
                    type: getTextOfTsNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)),
                    hasQuestionToken: true,
                    docs: ["The timeout for establishing the WebSocket connection in seconds."]
                },
                {
                    name: GeneratedDefaultWebsocketImplementation.ABORT_SIGNAL_PROPERTY_NAME,
                    type: getTextOfTsNode(ts.factory.createTypeReferenceNode("AbortSignal")),
                    hasQuestionToken: true,
                    docs: ["A signal to abort the WebSocket connection."]
                }
            ],
            isExported: true
        };

        const generatedVersion = context.versionContext.getGeneratedVersion();
        if (generatedVersion != null) {
            const header = generatedVersion.getHeader();
            requestOptions.properties.push({
                name: GeneratedDefaultWebsocketImplementation.GENERATED_VERSION_PROPERTY_NAME,
                type: generatedVersion.getEnumValueUnion(),
                hasQuestionToken: true,
                docs: [`Override the ${header.name.wireValue} header`]
            });
        }
        return requestOptions;
    }

    private generateConnectMethodStatements(context: SdkContext): ts.Statement[] {
        const bindingElements: ts.BindingElement[] = [];
        const usedNames = new Set<string>();
        const pathParameterLocalNames = new Map<string, string>();
        const queryParameterLocalNames = new Map<string, string>();

        const getNonConflictingName = (name: string) => {
            while (usedNames.has(name)) {
                name = `${name}_`;
            }
            usedNames.add(name);
            return name;
        };

        // Add path parameters binding
        for (const pathParameter of [
            ...this.intermediateRepresentation.pathParameters,
            ...this.channel.pathParameters
        ]) {
            const propertyNames = this.getPropertyNameOfPathParameter(pathParameter);
            const localVarName = getNonConflictingName(propertyNames.safeName);
            pathParameterLocalNames.set(pathParameter.name.originalName, localVarName);

            bindingElements.push(
                ts.factory.createBindingElement(
                    undefined,
                    localVarName !== propertyNames.propertyName
                        ? ts.factory.createIdentifier(propertyNames.propertyName)
                        : undefined,
                    ts.factory.createIdentifier(localVarName)
                )
            );
        }

        // Add query parameters binding
        for (const queryParameter of this.channel.queryParameters ?? []) {
            const propertyNames = this.getPropertyNameOfQueryParameter(queryParameter);
            const localVarName = getNonConflictingName(propertyNames.safeName);
            queryParameterLocalNames.set(queryParameter.name.wireValue, localVarName);

            bindingElements.push(
                ts.factory.createBindingElement(
                    undefined,
                    localVarName !== propertyNames.propertyName
                        ? ts.factory.createStringLiteral(propertyNames.propertyName)
                        : undefined,
                    ts.factory.createIdentifier(localVarName)
                )
            );
        }

        // Add protocols binding
        bindingElements.push(
            ts.factory.createBindingElement(
                undefined,
                undefined,
                ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.PROTOCOLS_PROPERTY_NAME)
            )
        );

        // Add additional query parameters binding
        bindingElements.push(
            ts.factory.createBindingElement(
                undefined,
                undefined,
                ts.factory.createIdentifier(
                    GeneratedDefaultWebsocketImplementation.ADDITIONAL_QUERY_PARAMETERS_PROPERTY_NAME
                )
            )
        );

        // Add headers binding
        bindingElements.push(
            ts.factory.createBindingElement(
                undefined,
                undefined,
                ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.HEADERS_PROPERTY_NAME)
            )
        );

        // Add other optional parameters
        bindingElements.push(
            ts.factory.createBindingElement(
                undefined,
                undefined,
                ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.DEBUG_PROPERTY_NAME)
            ),
            ts.factory.createBindingElement(
                undefined,
                undefined,
                ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.RECONNECT_ATTEMPTS_PROPERTY_NAME)
            ),
            ts.factory.createBindingElement(
                undefined,
                undefined,
                ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.CONNECTION_TIMEOUT_PROPERTY_NAME)
            ),
            ts.factory.createBindingElement(
                undefined,
                undefined,
                ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.ABORT_SIGNAL_PROPERTY_NAME)
            )
        );

        // Add generated version if available
        const generatedVersion = context.versionContext.getGeneratedVersion();
        if (generatedVersion != null) {
            bindingElements.push(
                ts.factory.createBindingElement(
                    undefined,
                    undefined,
                    ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.GENERATED_VERSION_PROPERTY_NAME)
                )
            );
        }

        // Create the destructuring statement
        const destructuringStatement = ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        ts.factory.createObjectBindingPattern(bindingElements),
                        undefined,
                        undefined,
                        ts.factory.createIdentifier("args")
                    )
                ],
                ts.NodeFlags.Const
            )
        );

        const queryParameters = new GeneratedQueryParams({
            queryParameters: this.channel.queryParameters,
            referenceToQueryParameterProperty: (key, _context) => {
                const localVarName = queryParameterLocalNames.get(key);
                if (localVarName == null) {
                    throw new Error(`Could not find local variable name for query parameter: ${key}`);
                }
                return ts.factory.createIdentifier(localVarName);
            }
        });

        const mergeHeaders: ts.Expression[] = [];
        const authProviderStatements: ts.Statement[] = [];
        const mergeOnlyDefinedHeaders: (ts.PropertyAssignment | ts.SpreadAssignment)[] = [];
        const authFallback = this.getWebSocketAuthFallback();
        if (this.generatedSdkClientClass.hasAuthProvider() && this.channel.auth) {
            const metadataArg = this.generatedSdkClientClass.getGenerateEndpointMetadata()
                ? ts.factory.createObjectLiteralExpression([
                      ts.factory.createPropertyAssignment(
                          "endpointMetadata",
                          this.generatedSdkClientClass.getReferenceToMetadataForEndpointSupplier()
                      )
                  ])
                : undefined;

            authProviderStatements.push(
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                "_authRequest",
                                undefined,
                                context.coreUtilities.auth.AuthRequest._getReferenceToType(),
                                context.coreUtilities.auth.AuthProvider.getAuthRequest.invoke(
                                    this.generatedSdkClientClass.getReferenceToAuthProviderOrThrow(),
                                    metadataArg
                                )
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                )
            );

            if (authFallback != null) {
                authProviderStatements.push(...this.generateAuthFallbackStatements(authFallback, context));
            }

            mergeHeaders.push(
                authFallback != null
                    ? ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.AUTH_FALLBACK_HEADERS_NAME)
                    : ts.factory.createIdentifier("_authRequest.headers")
            );
        }
        mergeOnlyDefinedHeaders.push(
            ...this.channel.headers.map((header) => {
                return ts.factory.createPropertyAssignment(
                    ts.factory.createStringLiteral(header.name.wireValue),
                    this.getReferenceToArg(header.name.wireValue)
                );
            })
        );
        if (mergeOnlyDefinedHeaders.length > 0) {
            context.importsManager.addImportFromRoot("core/headers", {
                namedImports: ["mergeOnlyDefinedHeaders"]
            });
            mergeHeaders.push(
                ts.factory.createCallExpression(ts.factory.createIdentifier("mergeOnlyDefinedHeaders"), undefined, [
                    ts.factory.createObjectLiteralExpression(mergeOnlyDefinedHeaders)
                ])
            );
        }
        mergeHeaders.push(ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.HEADERS_PROPERTY_NAME));

        if (mergeHeaders.length > 1) {
            context.importsManager.addImportFromRoot("core/headers", {
                namedImports: ["mergeHeaders"]
            });
        }

        return [
            destructuringStatement,
            ...queryParameters.getBuildStatements(context),
            ...authProviderStatements,
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.HEADERS_VARIABLE_NAME),
                            undefined,
                            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("unknown"))
                            ]),
                            mergeHeaders.length > 1
                                ? ts.factory.createCallExpression(
                                      ts.factory.createIdentifier("mergeHeaders"),
                                      undefined,
                                      [...mergeHeaders]
                                  )
                                : ts.factory.createObjectLiteralExpression(
                                      [ts.factory.createSpreadAssignment(mergeHeaders[0] as ts.Expression)],
                                      false
                                  )
                        )
                    ],
                    ts.NodeFlags.Let
                )
            ),
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier("socket"),
                            undefined,
                            undefined,
                            this.getReferenceToWebsocket(context, pathParameterLocalNames, authFallback)
                        )
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ts.factory.createReturnStatement(
                ts.factory.createNewExpression(this.getReferenceToSocket(context), undefined, [
                    ts.factory.createObjectLiteralExpression([
                        ts.factory.createShorthandPropertyAssignment(ts.factory.createIdentifier("socket"))
                    ])
                ])
            )
        ];
    }

    private getReferenceToWebsocket(
        context: SdkContext,
        pathParameterLocalNames: Map<string, string>,
        authFallback: AuthFallbackInfo | undefined
    ): ts.Expression {
        const baseUrl = this.getBaseUrl(this.channel, context);

        const url = buildUrl({
            endpoint: {
                allPathParameters: [...this.intermediateRepresentation.pathParameters, ...this.channel.pathParameters],
                fullPath: this.channel.path,
                path: this.channel.path,
                sdkRequest: undefined
            },
            generatedClientClass: this.generatedSdkClientClass,
            context,
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            omitUndefined: this.omitUndefined,
            parameterNaming: this.parameterNaming,
            getReferenceToPathParameterVariableFromRequest: (pathParameter) => {
                const localVarName = pathParameterLocalNames.get(pathParameter.name.originalName);
                if (localVarName == null) {
                    throw new Error(
                        `Could not find local variable name for path parameter: ${pathParameter.name.originalName}`
                    );
                }
                return ts.factory.createIdentifier(localVarName);
            },
            // For websockets, we always inline path parameters since we manually destructure them
            forceInlinePathParameters: true
        });

        if (url == null) {
            throw new Error(`Failed to build URL for ${this.channelId}`);
        }

        const protocolsExpr =
            authFallback != null
                ? this.getProtocolsWithFallback(authFallback)
                : ts.factory.createBinaryExpression(
                      ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.PROTOCOLS_PROPERTY_NAME),
                      ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                      ts.factory.createArrayLiteralExpression([])
                  );

        const queryParametersExpr =
            authFallback != null ? this.getQueryParametersWithFallback(authFallback) : this.getMergedQueryParameters();

        return context.coreUtilities.websocket.ReconnectingWebSocket._connect({
            url: context.coreUtilities.urlUtils.join._invoke([baseUrl, url]),
            protocols: protocolsExpr,
            options: ts.factory.createObjectLiteralExpression([
                ts.factory.createPropertyAssignment(
                    "debug",
                    ts.factory.createBinaryExpression(
                        ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.DEBUG_PROPERTY_NAME),
                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                        ts.factory.createFalse()
                    )
                ),
                ts.factory.createPropertyAssignment(
                    "maxRetries",
                    ts.factory.createBinaryExpression(
                        ts.factory.createIdentifier(
                            GeneratedDefaultWebsocketImplementation.RECONNECT_ATTEMPTS_PROPERTY_NAME
                        ),
                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                        ts.factory.createNumericLiteral(
                            GeneratedDefaultWebsocketImplementation.DEFAULT_NUM_RECONNECT_ATTEMPTS
                        )
                    )
                ),
                // connectionTimeoutInSeconds != null ? connectionTimeoutInSeconds * 1000 : undefined
                ts.factory.createPropertyAssignment(
                    "connectionTimeout",
                    ts.factory.createConditionalExpression(
                        ts.factory.createBinaryExpression(
                            ts.factory.createIdentifier(
                                GeneratedDefaultWebsocketImplementation.CONNECTION_TIMEOUT_PROPERTY_NAME
                            ),
                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                            ts.factory.createNull()
                        ),
                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                        ts.factory.createBinaryExpression(
                            ts.factory.createIdentifier(
                                GeneratedDefaultWebsocketImplementation.CONNECTION_TIMEOUT_PROPERTY_NAME
                            ),
                            ts.factory.createToken(ts.SyntaxKind.AsteriskToken),
                            ts.factory.createNumericLiteral(1000)
                        ),
                        ts.factory.createToken(ts.SyntaxKind.ColonToken),
                        ts.factory.createIdentifier("undefined")
                    )
                )
            ]),
            headers: ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.HEADERS_VARIABLE_NAME),
            queryParameters: queryParametersExpr,
            abortSignal: ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.ABORT_SIGNAL_PROPERTY_NAME)
        });
    }

    private getEnvironment(channel: FernIr.WebSocketChannel, context: SdkContext): ts.Expression {
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
            baseUrlId: channel.baseUrl ?? undefined
        });
    }

    private getReferenceToOption(option: string): ts.Expression {
        return ts.factory.createElementAccessExpression(
            this.getReferenceToOptions(),
            ts.factory.createStringLiteral(option)
        );
    }

    private getReferenceToArg(arg: string): ts.Expression {
        return ts.factory.createElementAccessExpression(this.getReferenceToArgs(), ts.factory.createStringLiteral(arg));
    }

    public getSocketTypeNode(context: SdkContext): ts.TypeNode {
        const reference = context.websocket.getReferenceToWebsocketSocketClass(this.packageId);
        return reference.getTypeNode({
            isForComment: true
        });
    }

    public getReferenceToSocket(context: SdkContext): ts.Expression {
        const reference = context.websocket.getReferenceToWebsocketSocketClass(this.packageId);
        return reference.getExpression();
    }

    public getReferenceToOptions(): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
        );
    }

    public getReferenceToArgs(): ts.Expression {
        return ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.CONNECT_ARGS_PRIVATE_MEMBER);
    }

    private getReferenceToBaseUrl(context: SdkContext): ts.Expression {
        return context.coreUtilities.fetcher.Supplier.get(
            this.getReferenceToOption(GeneratedSdkClientClassImpl.BASE_URL_OPTION_PROPERTY_NAME)
        );
    }

    private getReferenceToEnvironment(context: SdkContext): ts.Expression {
        return context.coreUtilities.fetcher.Supplier.get(
            this.getReferenceToOption(GeneratedSdkClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME)
        );
    }

    public getBaseUrl(channel: FernIr.WebSocketChannel, context: SdkContext): ts.Expression {
        const referenceToBaseUrl = this.getReferenceToBaseUrl(context);

        const environment = this.getEnvironment(channel, context);

        return ts.factory.createBinaryExpression(
            referenceToBaseUrl,
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            environment
        );
    }

    private getMergedQueryParameters(): ts.Expression {
        const additionalQueryParamsRef = ts.factory.createIdentifier(
            GeneratedDefaultWebsocketImplementation.ADDITIONAL_QUERY_PARAMETERS_PROPERTY_NAME
        );

        if (this.channel.queryParameters.length > 0) {
            // Merge channel query params with user-provided additional query params:
            // { ..._queryParams, ...queryParams }
            return ts.factory.createObjectLiteralExpression(
                [
                    ts.factory.createSpreadAssignment(
                        ts.factory.createIdentifier(GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME)
                    ),
                    ts.factory.createSpreadAssignment(additionalQueryParamsRef)
                ],
                false
            );
        }

        // No channel query params, just use the additional query params (or empty object if undefined):
        // queryParams ?? {}
        return ts.factory.createBinaryExpression(
            additionalQueryParamsRef,
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            ts.factory.createObjectLiteralExpression([], false)
        );
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: SdkContext): ts.Expression {
        const queryParameter = this.channel.queryParameters.find(
            (queryParam) => queryParam.name.wireValue === queryParameterKey
        );
        if (queryParameter == null) {
            throw new Error("Query parameter does not exist: " + queryParameterKey);
        }
        return ts.factory.createIdentifier(this.getPropertyNameOfQueryParameter(queryParameter).propertyName);
    }

    public getPropertyNameOfQueryParameter(queryParameter: FernIr.QueryParameter): {
        safeName: string;
        propertyName: string;
    } {
        return this.getPropertyNameOfQueryParameterFromName(queryParameter.name);
    }

    public getPropertyNameOfQueryParameterFromName(name: FernIr.NameAndWireValue): {
        safeName: string;
        propertyName: string;
    } {
        return {
            safeName: name.name.camelCase.safeName,
            propertyName:
                this.includeSerdeLayer && !this.retainOriginalCasing ? name.name.camelCase.unsafeName : name.wireValue
        };
    }

    public getPropertyNameOfPathParameter(pathParameter: FernIr.PathParameter): {
        safeName: string;
        propertyName: string;
    } {
        return {
            safeName: pathParameter.name.camelCase.safeName,
            propertyName: getParameterNameForPropertyPathParameterName({
                pathParameterName: pathParameter.name,
                retainOriginalCasing: this.retainOriginalCasing,
                includeSerdeLayer: this.includeSerdeLayer,
                parameterNaming: this.parameterNaming
            })
        };
    }

    /**
     * Finds the first auth scheme that has a websocketAuthFallback defined.
     * Returns the scheme and its fallback configuration, or undefined if none found.
     */
    private getWebSocketAuthFallback(): AuthFallbackInfo | undefined {
        if (!this.channel.auth) {
            return undefined;
        }
        for (const scheme of this.intermediateRepresentation.auth.schemes) {
            // Access websocketAuthFallback from the scheme. The field is on BaseAuthScheme
            // in the IR but may not yet be in the published @fern-fern/ir-sdk types.
            // When the published SDK doesn't know about the field, it passes through as
            // raw JSON (with `_type` discriminant). When the SDK does know about it,
            // the deserialized form uses `type`.
            const rawFallback = (scheme as unknown as { websocketAuthFallback?: Record<string, unknown> })
                .websocketAuthFallback;
            if (rawFallback != null) {
                // Normalize: raw wire format uses `_type`, deserialized uses `type`
                const fallbackType = (rawFallback.type ?? rawFallback._type) as string | undefined;
                if (fallbackType != null) {
                    const fallback: WebSocketAuthFallback = {
                        type: fallbackType as WebSocketAuthFallback["type"],
                        format: rawFallback.format as string | undefined,
                        name: rawFallback.name as string | undefined
                    };
                    return { scheme, fallback };
                }
            }
        }
        return undefined;
    }

    /**
     * Generates the runtime-branching statements for WebSocket auth fallback.
     * Produces:
     *   const _isBrowserLike = !["node", "bun", "deno"].includes(RUNTIME.type);
     *   const _authToken = _authRequest.headers["Authorization"]?.split(" ")[1] ?? "";
     *   const _authFallbackHeaders = _isBrowserLike ? {} : _authRequest.headers;
     *   const _fallbackProtocols = _isBrowserLike ? [format.replace("{token}", _authToken)] : [];
     *   // or for query fallback:
     *   const _fallbackQueryParams = _isBrowserLike ? { [name]: _authToken } : {};
     */
    private generateAuthFallbackStatements(authFallback: AuthFallbackInfo, context: SdkContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        // const _isBrowserLike = !["node", "bun", "deno"].includes(RUNTIME.type);
        statements.push(
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            GeneratedDefaultWebsocketImplementation.IS_BROWSER_LIKE_NAME,
                            undefined,
                            undefined,
                            ts.factory.createPrefixUnaryExpression(
                                ts.SyntaxKind.ExclamationToken,
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createArrayLiteralExpression([
                                            ts.factory.createStringLiteral("node"),
                                            ts.factory.createStringLiteral("bun"),
                                            ts.factory.createStringLiteral("deno")
                                        ]),
                                        "includes"
                                    ),
                                    undefined,
                                    [context.coreUtilities.runtime.type._getReferenceTo()]
                                )
                            )
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        );

        // Generate token extraction based on auth scheme type
        const tokenExtraction = this.getTokenExtractionExpression(authFallback.scheme);
        // const _authToken = <tokenExtraction>;
        statements.push(
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            GeneratedDefaultWebsocketImplementation.AUTH_TOKEN_NAME,
                            undefined,
                            undefined,
                            tokenExtraction
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        );

        // const _authFallbackHeaders = _isBrowserLike ? {} : _authRequest.headers;
        statements.push(
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            GeneratedDefaultWebsocketImplementation.AUTH_FALLBACK_HEADERS_NAME,
                            undefined,
                            undefined,
                            ts.factory.createConditionalExpression(
                                ts.factory.createIdentifier(
                                    GeneratedDefaultWebsocketImplementation.IS_BROWSER_LIKE_NAME
                                ),
                                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                ts.factory.createObjectLiteralExpression([]),
                                ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                ts.factory.createIdentifier("_authRequest.headers")
                            )
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        );

        // Generate fallback-specific statements based on the fallback type
        if (authFallback.fallback.type === "websocketSubprotocol") {
            // const _fallbackProtocols = _isBrowserLike
            //     ? [format.replace("{token}", _authToken)]
            //     : [];
            const formatStr = authFallback.fallback.format ?? "";
            statements.push(
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                GeneratedDefaultWebsocketImplementation.FALLBACK_PROTOCOLS_NAME,
                                undefined,
                                undefined,
                                ts.factory.createConditionalExpression(
                                    ts.factory.createIdentifier(
                                        GeneratedDefaultWebsocketImplementation.IS_BROWSER_LIKE_NAME
                                    ),
                                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                    ts.factory.createArrayLiteralExpression([
                                        ts.factory.createCallExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createStringLiteral(formatStr),
                                                "replace"
                                            ),
                                            undefined,
                                            [
                                                ts.factory.createStringLiteral("{token}"),
                                                ts.factory.createIdentifier(
                                                    GeneratedDefaultWebsocketImplementation.AUTH_TOKEN_NAME
                                                )
                                            ]
                                        )
                                    ]),
                                    ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                    ts.factory.createArrayLiteralExpression([])
                                )
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                )
            );
        } else if (authFallback.fallback.type === "query") {
            // const _fallbackQueryParams = _isBrowserLike
            //     ? { [name]: _authToken }
            //     : {};
            const queryParamName = authFallback.fallback.name ?? "";
            statements.push(
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                GeneratedDefaultWebsocketImplementation.FALLBACK_QUERY_PARAMS_NAME,
                                undefined,
                                undefined,
                                ts.factory.createConditionalExpression(
                                    ts.factory.createIdentifier(
                                        GeneratedDefaultWebsocketImplementation.IS_BROWSER_LIKE_NAME
                                    ),
                                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                    ts.factory.createObjectLiteralExpression([
                                        ts.factory.createPropertyAssignment(
                                            ts.factory.createStringLiteral(queryParamName),
                                            ts.factory.createIdentifier(
                                                GeneratedDefaultWebsocketImplementation.AUTH_TOKEN_NAME
                                            )
                                        )
                                    ]),
                                    ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                    ts.factory.createObjectLiteralExpression([])
                                )
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                )
            );
        }

        return statements;
    }

    /**
     * Returns an expression that extracts the raw token value from _authRequest.headers
     * based on the auth scheme type.
     */
    private getTokenExtractionExpression(scheme: FernIr.AuthScheme): ts.Expression {
        switch (scheme.type) {
            case "bearer":
            case "oauth":
                // _authRequest.headers["Authorization"]?.split(" ")[1] ?? ""
                return ts.factory.createBinaryExpression(
                    ts.factory.createElementAccessChain(
                        ts.factory.createCallChain(
                            ts.factory.createPropertyAccessChain(
                                ts.factory.createElementAccessExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier("_authRequest"),
                                        "headers"
                                    ),
                                    ts.factory.createStringLiteral("Authorization")
                                ),
                                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                "split"
                            ),
                            undefined,
                            undefined,
                            [ts.factory.createStringLiteral(" ")]
                        ),
                        undefined,
                        ts.factory.createNumericLiteral(1)
                    ),
                    ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                    ts.factory.createStringLiteral("")
                );
            case "basic":
                // _authRequest.headers["Authorization"]?.split(" ")[1] ?? ""
                return ts.factory.createBinaryExpression(
                    ts.factory.createElementAccessChain(
                        ts.factory.createCallChain(
                            ts.factory.createPropertyAccessChain(
                                ts.factory.createElementAccessExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier("_authRequest"),
                                        "headers"
                                    ),
                                    ts.factory.createStringLiteral("Authorization")
                                ),
                                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                "split"
                            ),
                            undefined,
                            undefined,
                            [ts.factory.createStringLiteral(" ")]
                        ),
                        undefined,
                        ts.factory.createNumericLiteral(1)
                    ),
                    ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                    ts.factory.createStringLiteral("")
                );
            case "header": {
                // _authRequest.headers["<headerWireValue>"] ?? ""
                const headerName = scheme.name.wireValue;
                return ts.factory.createBinaryExpression(
                    ts.factory.createElementAccessExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("_authRequest"),
                            "headers"
                        ),
                        ts.factory.createStringLiteral(headerName)
                    ),
                    ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                    ts.factory.createStringLiteral("")
                );
            }
            case "inferred":
                // Inferred auth schemes should not have websocketAuthFallback in practice,
                // but handle gracefully by returning empty string
                return ts.factory.createStringLiteral("");
            default: {
                const _exhaustive: never = scheme;
                throw new Error(`Unexpected auth scheme type: ${(_exhaustive as FernIr.AuthScheme).type}`);
            }
        }
    }

    /**
     * Returns the protocols expression when auth fallback is present.
     * For websocketSubprotocol fallback: [...(protocols ?? []), ..._fallbackProtocols]
     * For query fallback: protocols ?? [] (unchanged)
     */
    private getProtocolsWithFallback(authFallback: AuthFallbackInfo): ts.Expression {
        const baseProtocols = ts.factory.createBinaryExpression(
            ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.PROTOCOLS_PROPERTY_NAME),
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            ts.factory.createArrayLiteralExpression([])
        );

        if (authFallback.fallback.type === "websocketSubprotocol") {
            // [...(protocols ?? []), ..._fallbackProtocols]
            return ts.factory.createArrayLiteralExpression([
                ts.factory.createSpreadElement(ts.factory.createParenthesizedExpression(baseProtocols)),
                ts.factory.createSpreadElement(
                    ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.FALLBACK_PROTOCOLS_NAME)
                )
            ]);
        }

        return baseProtocols;
    }

    /**
     * Returns the query parameters expression when auth fallback is present.
     * For query fallback: { ..._queryParams, ...queryParams, ..._fallbackQueryParams }
     * For websocketSubprotocol fallback: same as normal (no query changes)
     */
    private getQueryParametersWithFallback(authFallback: AuthFallbackInfo): ts.Expression {
        if (authFallback.fallback.type === "query") {
            const additionalQueryParamsRef = ts.factory.createIdentifier(
                GeneratedDefaultWebsocketImplementation.ADDITIONAL_QUERY_PARAMETERS_PROPERTY_NAME
            );
            const fallbackQueryParamsRef = ts.factory.createIdentifier(
                GeneratedDefaultWebsocketImplementation.FALLBACK_QUERY_PARAMS_NAME
            );

            if (this.channel.queryParameters.length > 0) {
                return ts.factory.createObjectLiteralExpression(
                    [
                        ts.factory.createSpreadAssignment(
                            ts.factory.createIdentifier(GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME)
                        ),
                        ts.factory.createSpreadAssignment(additionalQueryParamsRef),
                        ts.factory.createSpreadAssignment(fallbackQueryParamsRef)
                    ],
                    false
                );
            }

            return ts.factory.createObjectLiteralExpression(
                [
                    ts.factory.createSpreadAssignment(
                        ts.factory.createBinaryExpression(
                            additionalQueryParamsRef,
                            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                            ts.factory.createObjectLiteralExpression([], false)
                        )
                    ),
                    ts.factory.createSpreadAssignment(fallbackQueryParamsRef)
                ],
                false
            );
        }

        return this.getMergedQueryParameters();
    }
}
