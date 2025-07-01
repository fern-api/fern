import {
    PackageId,
    getParameterNameForPositionalPathParameter,
    getPropertyKey,
    getTextOfTsNode
} from "@fern-typescript/commons";
import { ChannelSignature, GeneratedWebsocketImplementation, SdkContext } from "@fern-typescript/contexts";
import {
    ClassDeclarationStructure,
    InterfaceDeclarationStructure,
    ModuleDeclarationStructure,
    Scope,
    StructureKind,
    ts
} from "ts-morph";

import { SetRequired, assertNever } from "@fern-api/core-utils";

import {
    IntermediateRepresentation,
    PathParameter,
    PathParameterLocation,
    WebSocketChannel,
    WebSocketChannelId
} from "@fern-fern/ir-sdk/api";

import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { GetReferenceToPathParameterVariableFromRequest } from "../endpoints/utils/buildUrl";

export declare namespace GeneratedDefaultWebsocketImplementation {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        channel: WebSocketChannel;
        channelId: WebSocketChannelId;
        packageId: PackageId;
        serviceClassName: string;
        requireDefaultEnvironment: boolean;
    }
}

export class GeneratedDefaultWebsocketImplementation implements GeneratedWebsocketImplementation {
    private static readonly CONNECT_ARGS_INTERFACE_NAME = "ConnectArgs";
    private static readonly CONNECT_ARGS_PRIVATE_MEMBER = "args";
    private static readonly DEBUG_PROPERTY_NAME = "debug";
    private static readonly HEADERS_PROPERTY_NAME = "headers";
    private static readonly HEADERS_VARIABLE_NAME = "websocketHeaders";

    private static readonly RECONNECT_ATTEMPTS_PROPERTY_NAME = "reconnectAttempts";
    private static readonly GENERATED_VERSION_PROPERTY_NAME = "fernSdkVersion";
    private static readonly DEFAULT_NUM_RECONNECT_ATTEMPTS = 30;

    private readonly intermediateRepresentation: IntermediateRepresentation;
    private readonly generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private readonly channelId: WebSocketChannelId;
    private readonly packageId: PackageId;
    private readonly serviceClassName: string;
    private readonly requireDefaultEnvironment: boolean;
    channel: WebSocketChannel;

    constructor({
        intermediateRepresentation,
        generatedSdkClientClass,
        channelId,
        packageId,
        channel,
        serviceClassName,
        requireDefaultEnvironment
    }: GeneratedDefaultWebsocketImplementation.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.channelId = channelId;
        this.packageId = packageId;
        this.channel = channel;
        this.serviceClassName = serviceClassName;
        this.requireDefaultEnvironment = requireDefaultEnvironment;
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
                        name: getPropertyKey(queryParameter.name.wireValue),
                        type: getTextOfTsNode(context.type.getReferenceToType(queryParameter.valueType).typeNode),
                        hasQuestionToken: true
                    };
                }),
                ...(this.channel.headers ?? []).map((header) => {
                    return {
                        name: getPropertyKey(header.name.wireValue),
                        type: getTextOfTsNode(context.type.getReferenceToType(header.valueType).typeNode),
                        hasQuestionToken: true
                    };
                }),
                {
                    name: GeneratedDefaultWebsocketImplementation.HEADERS_PROPERTY_NAME,
                    type: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
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
        return [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier("queryParams"),
                            undefined,
                            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                            ]),
                            ts.factory.createObjectLiteralExpression()
                        )
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ...(this.channel.queryParameters ?? []).map((queryParameter) =>
                ts.factory.createIfStatement(
                    ts.factory.createBinaryExpression(
                        this.getReferenceToArg(queryParameter.name.wireValue),
                        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                        ts.factory.createNull()
                    ),
                    ts.factory.createBlock(
                        [
                            ts.factory.createExpressionStatement(
                                ts.factory.createBinaryExpression(
                                    ts.factory.createElementAccessExpression(
                                        ts.factory.createIdentifier("queryParams"),
                                        ts.factory.createStringLiteral(queryParameter.name.wireValue)
                                    ),
                                    ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                    this.getReferenceToArg(queryParameter.name.wireValue)
                                )
                            )
                        ],
                        true
                    )
                )
            ),
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.HEADERS_VARIABLE_NAME),
                            undefined,
                            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                            ]),
                            ts.factory.createObjectLiteralExpression()
                        )
                    ],
                    ts.NodeFlags.Let
                )
            ),
            ...(this.generatedSdkClientClass.shouldGenerateCustomAuthorizationHeaderHelperMethod()
                ? [
                      ts.factory.createExpressionStatement(
                          ts.factory.createBinaryExpression(
                              ts.factory.createIdentifier(
                                  GeneratedDefaultWebsocketImplementation.HEADERS_VARIABLE_NAME
                              ),
                              ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                              ts.factory.createObjectLiteralExpression(
                                  [
                                      ts.factory.createSpreadAssignment(
                                          ts.factory.createIdentifier(
                                              GeneratedDefaultWebsocketImplementation.HEADERS_VARIABLE_NAME
                                          )
                                      ),
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
                                  ],
                                  true
                              )
                          )
                      )
                  ]
                : []),
            ...(this.channel.headers ?? []).map((header) => {
                return ts.factory.createIfStatement(
                    ts.factory.createBinaryExpression(
                        this.getReferenceToArg(header.name.wireValue),
                        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                        ts.factory.createNull()
                    ),
                    ts.factory.createBlock([
                        ts.factory.createExpressionStatement(
                            ts.factory.createBinaryExpression(
                                ts.factory.createElementAccessExpression(
                                    ts.factory.createIdentifier(
                                        GeneratedDefaultWebsocketImplementation.HEADERS_VARIABLE_NAME
                                    ),
                                    ts.factory.createStringLiteral(header.name.wireValue)
                                ),
                                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                this.getReferenceToArg(header.name.wireValue)
                            )
                        )
                    ])
                );
            }),
            ts.factory.createExpressionStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.HEADERS_VARIABLE_NAME),
                    ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createSpreadAssignment(
                                ts.factory.createIdentifier(
                                    GeneratedDefaultWebsocketImplementation.HEADERS_VARIABLE_NAME
                                )
                            ),
                            ts.factory.createSpreadAssignment(
                                this.getReferenceToArg(GeneratedDefaultWebsocketImplementation.HEADERS_PROPERTY_NAME)
                            )
                        ],
                        true
                    )
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
        return context.coreUtilities.websocket.ReconnectingWebSocket._connect({
            url: this.buildFullUrl(this.getBaseUrl(this.channel, context), this.channel, context),
            protocols: ts.factory.createArrayLiteralExpression([]),
            options: ts.factory.createObjectLiteralExpression([
                ts.factory.createPropertyAssignment(
                    "debug",
                    ts.factory.createBinaryExpression(
                        this.getReferenceToArg(GeneratedDefaultWebsocketImplementation.DEBUG_PROPERTY_NAME),
                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                        ts.factory.createFalse()
                    )
                ),
                ts.factory.createPropertyAssignment(
                    "maxRetries",
                    ts.factory.createBinaryExpression(
                        this.getReferenceToArg(
                            GeneratedDefaultWebsocketImplementation.RECONNECT_ATTEMPTS_PROPERTY_NAME
                        ),
                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                        ts.factory.createNumericLiteral(
                            GeneratedDefaultWebsocketImplementation.DEFAULT_NUM_RECONNECT_ATTEMPTS
                        )
                    )
                )
            ]),
            headers: ts.factory.createIdentifier(GeneratedDefaultWebsocketImplementation.HEADERS_VARIABLE_NAME)
        });
    }

    private buildFullUrl(url: ts.Expression, channel: WebSocketChannel, context: SdkContext): ts.Expression {
        return ts.factory.createTemplateExpression(ts.factory.createTemplateHead("", ""), [
            ts.factory.createTemplateSpan(
                url,
                ts.factory.createTemplateMiddle(`${channel.path.head}?`, `${channel.path.head}?`)
            ),
            ...channel.path.parts.map((part) =>
                ts.factory.createTemplateSpan(
                    ts.factory.createCallExpression(ts.factory.createIdentifier("encodeURIComponent"), undefined, [
                        ts.factory.createElementAccessExpression(
                            ts.factory.createIdentifier("args"),
                            ts.factory.createStringLiteral(part.pathParameter)
                        )
                    ]),
                    ts.factory.createTemplateMiddle(part.tail, part.tail)
                )
            ),
            ts.factory.createTemplateSpan(
                context.coreUtilities.urlUtils.toQueryString._invoke([ts.factory.createIdentifier("queryParams")]),
                ts.factory.createTemplateTail("", "")
            )
        ]);
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
}
