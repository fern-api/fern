import { ImportsManager, NpmPackage, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedWebsocketClientClass, SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";
import {
    ClassDeclarationStructure,
    InterfaceDeclarationStructure,
    ModuleDeclarationStructure,
    Scope,
    StructureKind,
    ts
} from "ts-morph";

import { SetRequired } from "@fern-api/core-utils";

import { IntermediateRepresentation, WebSocketChannel, WebSocketChannelId } from "@fern-fern/ir-sdk/api";

export declare namespace GeneratedWebsocketClientClassImpl {
    export interface Init {
        importsManager: ImportsManager;
        intermediateRepresentation: IntermediateRepresentation;
        channelId: WebSocketChannelId;
        channel: WebSocketChannel;
        packageResolver: PackageResolver;
        serviceClassName: string;
        errorResolver: ErrorResolver;
        requireDefaultEnvironment: boolean;
    }
}

export class GeneratedWebsocketClientClassImpl implements GeneratedWebsocketClientClass {
    private static readonly OPTIONS_INTERFACE_NAME = "Options";
    private static readonly CONNECT_ARGS_INTERFACE_NAME = "ConnectArgs";
    private static readonly OPTIONS_PRIVATE_MEMBER = "_options";
    private static readonly CONNECT_ARGS_PRIVATE_MEMBER = "args";
    private static readonly DEBUG_PROPERTY_NAME = "debug";
    private static readonly RECONNECT_ATTEMPTS_PROPERTY_NAME = "reconnectAttempts";
    private static readonly GENERATED_VERSION_PROPERTY_NAME = "fernSdkVersion";
    private static readonly ENVIRONMENT_OPTION_PROPERTY_NAME = "environment";
    private static readonly BASE_URL_OPTION_PROPERTY_NAME = "baseUrl";
    private static readonly DEFAULT_NUM_RECONNECT_ATTEMPTS = 30;

    private readonly importsManager: ImportsManager;
    private readonly intermediateRepresentation: IntermediateRepresentation;
    private readonly channelId: WebSocketChannelId;
    private readonly channel: WebSocketChannel;
    private readonly packageResolver: PackageResolver;
    private readonly serviceClassName: string;
    private readonly errorResolver: ErrorResolver;
    private readonly requireDefaultEnvironment: boolean;

    constructor({
        importsManager,
        intermediateRepresentation,
        channelId,
        channel,
        packageResolver,
        serviceClassName,
        errorResolver,
        requireDefaultEnvironment
    }: GeneratedWebsocketClientClassImpl.Init) {
        this.importsManager = importsManager;
        this.intermediateRepresentation = intermediateRepresentation;
        this.channelId = channelId;
        this.channel = channel;
        this.packageResolver = packageResolver;
        this.serviceClassName = serviceClassName;
        this.errorResolver = errorResolver;
        this.requireDefaultEnvironment = requireDefaultEnvironment;
    }

    public writeToFile(context: SdkContext): void {
        const serviceModule: ModuleDeclarationStructure = {
            kind: StructureKind.Module,
            name: this.serviceClassName,
            isExported: true,
            hasDeclareKeyword: true,
            statements: [this.generateOptionsInterface(context), this.generateConnectArgsInterface(context)]
        };

        const serviceClass: ClassDeclarationStructure = {
            kind: StructureKind.Class,
            name: this.serviceClassName,
            isExported: true,
            properties: [],
            ctors: [],
            methods: []
        };

        serviceClass.ctors?.push({
            parameters: [
                {
                    name: GeneratedWebsocketClientClassImpl.OPTIONS_PRIVATE_MEMBER,
                    isReadonly: true,
                    scope: Scope.Protected,
                    type: `${this.serviceClassName}.${GeneratedWebsocketClientClassImpl.OPTIONS_INTERFACE_NAME}`
                }
            ]
        });

        const statements = this.generateConnectMethodStatements(context);

        serviceClass.methods?.push({
            name: "connect",
            scope: Scope.Public,
            isAsync: true,
            parameters: [
                {
                    name: "args",
                    type: `${this.serviceClassName}.${GeneratedWebsocketClientClassImpl.CONNECT_ARGS_INTERFACE_NAME}`,
                    initializer: "{}"
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

    private generateOptionsInterface(context: SdkContext): InterfaceDeclarationStructure {
        const generatedEnvironments = context.environments.getGeneratedEnvironments();
        return {
            kind: StructureKind.Interface,
            name: GeneratedWebsocketClientClassImpl.OPTIONS_INTERFACE_NAME,
            properties: [
                {
                    name: GeneratedWebsocketClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME,
                    type: getTextOfTsNode(
                        context.coreUtilities.fetcher.Supplier._getReferenceToType(
                            generatedEnvironments.getTypeForUserSuppliedEnvironment(context)
                        )
                    ),
                    hasQuestionToken: generatedEnvironments.hasDefaultEnvironment(),
                    docs: ["The environment to use for the websocket."]
                },
                {
                    name: GeneratedWebsocketClientClassImpl.BASE_URL_OPTION_PROPERTY_NAME,
                    type: getTextOfTsNode(
                        context.coreUtilities.fetcher.Supplier._getReferenceToType(
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                        )
                    ),
                    hasQuestionToken: true,
                    docs: ["Override the base URL of the websocket."]
                },
                {
                    name: GeneratedWebsocketClientClassImpl.DEBUG_PROPERTY_NAME,
                    type: getTextOfTsNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)),
                    hasQuestionToken: true,
                    docs: ["Enable debug mode on the websocket. Defaults to false."]
                },
                {
                    name: GeneratedWebsocketClientClassImpl.RECONNECT_ATTEMPTS_PROPERTY_NAME,
                    type: getTextOfTsNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)),
                    hasQuestionToken: true,
                    docs: ["Number of reconnect attempts. Defaults to 30."]
                }
            ]
        };
    }

    private generateConnectArgsInterface(context: SdkContext): InterfaceDeclarationStructure {
        const requestOptions: SetRequired<InterfaceDeclarationStructure, "properties"> = {
            kind: StructureKind.Interface,
            name: GeneratedWebsocketClientClassImpl.CONNECT_ARGS_INTERFACE_NAME,
            properties: [
                ...(this.channel.queryParameters ?? []).map((queryParameter) => {
                    return {
                        name: queryParameter.name.wireValue,
                        type: getTextOfTsNode(context.type.getReferenceToType(queryParameter.valueType).typeNode),
                        hasQuestionToken: true
                    };
                })
            ],
            isExported: true
        };

        const generatedVersion = context.versionContext.getGeneratedVersion();
        if (generatedVersion != null) {
            const header = generatedVersion.getHeader();
            requestOptions.properties.push({
                name: GeneratedWebsocketClientClassImpl.GENERATED_VERSION_PROPERTY_NAME,
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
                                ts.factory.createUnionTypeNode([
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                    ts.factory.createArrayTypeNode(
                                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                                    ),
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.ObjectKeyword),
                                    ts.factory.createArrayTypeNode(
                                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.ObjectKeyword)
                                    )
                                ])
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
            url: this.appendQueryParameters(this.getBaseUrl(this.channel, context), context),
            protocols: ts.factory.createArrayLiteralExpression([]),
            options: ts.factory.createObjectLiteralExpression([
                ts.factory.createPropertyAssignment(
                    "debug",
                    ts.factory.createBinaryExpression(
                        this.getReferenceToOption(GeneratedWebsocketClientClassImpl.DEBUG_PROPERTY_NAME),
                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                        ts.factory.createFalse()
                    )
                ),
                ts.factory.createPropertyAssignment(
                    "maxRetries",
                    ts.factory.createBinaryExpression(
                        this.getReferenceToOption(GeneratedWebsocketClientClassImpl.RECONNECT_ATTEMPTS_PROPERTY_NAME),
                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                        ts.factory.createNumericLiteral(
                            GeneratedWebsocketClientClassImpl.DEFAULT_NUM_RECONNECT_ATTEMPTS
                        )
                    )
                )
            ])
        });
    }

    private appendQueryParameters(url: ts.Expression, context: SdkContext): ts.Expression {
        return ts.factory.createTemplateExpression(ts.factory.createTemplateHead("", ""), [
            ts.factory.createTemplateSpan(url, ts.factory.createTemplateMiddle("?", "?")),
            ts.factory.createTemplateSpan(
                context.externalDependencies.qs.stringify(ts.factory.createIdentifier("queryParams")),
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

        // TODO: What exactly is going on here?
        // return context.environments.getGeneratedEnvironments().getReferenceToEnvironmentUrl({
        //     referenceToEnvironmentValue,
        //     baseUrlId: channel.baseUrl ?? undefined
        // });
        return referenceToEnvironmentValue;
    }

    private getReferenceToOption(option: string): ts.Expression {
        return ts.factory.createPropertyAccessExpression(this.getReferenceToOptions(), option);
    }

    private getReferenceToArg(arg: string): ts.Expression {
        return ts.factory.createElementAccessExpression(this.getReferenceToArgs(), ts.factory.createStringLiteral(arg));
    }

    public getSocketTypeNode(context: SdkContext): ts.TypeNode {
        const reference = context.websocket.getReferenceToWebsocketSocketClass(this.channelId);
        return reference.getTypeNode({
            isForComment: true
        });
    }

    public getReferenceToSocket(context: SdkContext): ts.Expression {
        const reference = context.websocket.getReferenceToWebsocketSocketClass(this.channelId);
        return reference.getExpression();
    }

    public getReferenceToOptions(): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            GeneratedWebsocketClientClassImpl.OPTIONS_PRIVATE_MEMBER
        );
    }

    public getReferenceToArgs(): ts.Expression {
        return ts.factory.createIdentifier(GeneratedWebsocketClientClassImpl.CONNECT_ARGS_PRIVATE_MEMBER);
    }

    private getReferenceToBaseUrl(context: SdkContext): ts.Expression {
        return context.coreUtilities.fetcher.Supplier.get(
            this.getReferenceToOption(GeneratedWebsocketClientClassImpl.BASE_URL_OPTION_PROPERTY_NAME)
        );
    }

    private getReferenceToEnvironment(context: SdkContext): ts.Expression {
        return context.coreUtilities.fetcher.Supplier.get(
            this.getReferenceToOption(GeneratedWebsocketClientClassImpl.ENVIRONMENT_OPTION_PROPERTY_NAME)
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

    public instantiate(args: { referenceToClient: ts.Expression; referenceToOptions: ts.Expression }): ts.Expression {
        return ts.factory.createNewExpression(ts.factory.createIdentifier(this.serviceClassName), undefined, [
            args.referenceToOptions
        ]);
    }

    public accessFromRootClient(args: { referenceToRootClient: ts.Expression }): ts.Expression {
        throw new Error("Not implemented");
    }

    public instantiateAsRoot(args: { context: SdkContext; npmPackage?: NpmPackage }): ts.Expression {
        throw new Error("Not implemented");
    }
}
