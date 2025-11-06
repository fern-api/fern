import { SetRequired } from "@fern-api/core-utils";
import {
    IntermediateRepresentation,
    NameAndWireValue,
    QueryParameter,
    WebSocketChannel,
    WebSocketChannelId
} from "@fern-fern/ir-sdk/api";
import { getPropertyKey, getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { ChannelSignature, GeneratedWebsocketImplementation, SdkContext } from "@fern-typescript/contexts";
import {
    ClassDeclarationStructure,
    InterfaceDeclarationStructure,
    ModuleDeclarationStructure,
    Scope,
    StructureKind,
    ts
} from "ts-morph";
import { buildUrl } from "../endpoints/utils/buildUrl";
import { GeneratedQueryParams } from "../endpoints/utils/GeneratedQueryParams";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";

export declare namespace GeneratedDefaultWebsocketImplementation {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        channel: WebSocketChannel;
        channelId: WebSocketChannelId;
        packageId: PackageId;
        serviceClassName: string;
        requireDefaultEnvironment: boolean;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        omitUndefined: boolean;
    }
}

export class GeneratedDefaultWebsocketImplementation implements GeneratedWebsocketImplementation {
    private static readonly CONNECT_ARGS_INTERFACE_NAME = "ConnectArgs";
    private static readonly CONNECT_ARGS_PRIVATE_MEMBER = "args";
    private static readonly DEBUG_PROPERTY_NAME = "debug";
    private static readonly HEADERS_PROPERTY_NAME = "headers";
    private static readonly HEADERS_VARIABLE_NAME = "_headers";

    private static readonly RECONNECT_ATTEMPTS_PROPERTY_NAME = "reconnectAttempts";
    private static readonly GENERATED_VERSION_PROPERTY_NAME = "fernSdkVersion";
    private static readonly DEFAULT_NUM_RECONNECT_ATTEMPTS = 30;

    private readonly intermediateRepresentation: IntermediateRepresentation;
    private readonly generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private readonly channelId: WebSocketChannelId;
    private readonly packageId: PackageId;
    private readonly serviceClassName: string;
    private readonly requireDefaultEnvironment: boolean;
    private readonly includeSerdeLayer: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly omitUndefined: boolean;
    channel: WebSocketChannel;

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
        omitUndefined
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
            name: "connect",
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
                        name: getPropertyKey(pathParameter.name.originalName),
                        type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode),
                        hasQuestionToken: false
                    };
                }),
                ...(this.channel.queryParameters ?? []).map((queryParameter) => {
                    return {
                        name: getPropertyKey(this.getPropertyNameOfQueryParameter(queryParameter).propertyName),
                        type: getTextOfTsNode(context.type.getReferenceToType(queryParameter.valueType).typeNode),
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

        // Add path parameters binding
        for (const pathParameter of [
            ...this.intermediateRepresentation.pathParameters,
            ...this.channel.pathParameters
        ]) {
            bindingElements.push(
                ts.factory.createBindingElement(
                    undefined,
                    undefined,
                    ts.factory.createIdentifier(pathParameter.name.originalName)
                )
            );
        }

        // Add query parameters binding
        for (const queryParameter of this.channel.queryParameters ?? []) {
            bindingElements.push(
                ts.factory.createBindingElement(
                    undefined,
                    undefined,
                    ts.factory.createIdentifier(this.getPropertyNameOfQueryParameter(queryParameter).propertyName)
                )
            );
        }

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
            referenceToQueryParameterProperty: (key, context) => {
                return this.getReferenceToQueryParameter(key, context);
            }
        });

        const mergeHeaders: ts.Expression[] = [];
        const authProviderStatements = [];
        const mergeOnlyDefinedHeaders: (ts.PropertyAssignment | ts.SpreadAssignment)[] = [];
        if (this.generatedSdkClientClass.hasAuthProvider()) {
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
                                    this.generatedSdkClientClass.getReferenceToAuthProviderOrThrow()
                                )
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                )
            );
            mergeHeaders.push(ts.factory.createIdentifier("_authRequest.headers"));
        } else {
            const getAuthHeaderValue = this.generatedSdkClientClass.getAuthorizationHeaderValue();
            mergeOnlyDefinedHeaders.push(
                ...(getAuthHeaderValue
                    ? [ts.factory.createPropertyAssignment("Authorization", getAuthHeaderValue)]
                    : this.generatedSdkClientClass.shouldGenerateCustomAuthorizationHeaderHelperMethod()
                      ? [
                            ts.factory.createSpreadAssignment(
                                ts.factory.createAwaitExpression(
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createThis(),
                                            GeneratedSdkClientClassImpl.CUSTOM_AUTHORIZATION_HEADER_HELPER_METHOD_NAME
                                        ),
                                        undefined,
                                        []
                                    )
                                )
                            )
                        ]
                      : [])
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
                            this.getReferenceToWebsocket(context)
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

    private getReferenceToWebsocket(context: SdkContext): ts.Expression {
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
            getReferenceToPathParameterVariableFromRequest: (pathParameter) => {
                return ts.factory.createIdentifier(`args.${pathParameter.name.originalName}`);
            }
        });

        if (url == null) {
            throw new Error(`Failed to build URL for ${this.channelId}`);
        }

        return context.coreUtilities.websocket.ReconnectingWebSocket._connect({
            url: context.coreUtilities.urlUtils.join._invoke([baseUrl, url]),
            protocols: ts.factory.createArrayLiteralExpression([]),
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
                )
            ]),
            headers: ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.HEADERS_VARIABLE_NAME),
            queryParameters:
                this.channel.queryParameters.length > 0
                    ? ts.factory.createIdentifier(GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME)
                    : ts.factory.createObjectLiteralExpression([], false)
        });
    }

    private getEnvironment(channel: WebSocketChannel, context: SdkContext): ts.Expression {
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

    public getBaseUrl(channel: WebSocketChannel, context: SdkContext): ts.Expression {
        const referenceToBaseUrl = this.getReferenceToBaseUrl(context);

        const environment = this.getEnvironment(channel, context);

        return ts.factory.createBinaryExpression(
            referenceToBaseUrl,
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            environment
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

    public getPropertyNameOfQueryParameter(queryParameter: QueryParameter): {
        safeName: string;
        propertyName: string;
    } {
        return this.getPropertyNameOfQueryParameterFromName(queryParameter.name);
    }

    public getPropertyNameOfQueryParameterFromName(name: NameAndWireValue): {
        safeName: string;
        propertyName: string;
    } {
        return {
            safeName: name.name.camelCase.safeName,
            propertyName:
                this.includeSerdeLayer && !this.retainOriginalCasing ? name.name.camelCase.unsafeName : name.wireValue
        };
    }
}
