import { ImportsManager, NpmPackage, PackageId, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedWebsocketSocketClass, SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";
import {
    ClassDeclarationStructure,
    InterfaceDeclarationStructure,
    MethodDeclarationStructure,
    ModuleDeclarationStructure,
    Scope,
    StructureKind,
    TypeAliasDeclarationStructure,
    ts
} from "ts-morph";

import {
    IntermediateRepresentation,
    WebSocketChannel,
    WebSocketChannelId,
    WebSocketMessage,
    WebSocketMessageBody
} from "@fern-fern/ir-sdk/api";

export declare namespace GeneratedWebsocketSocketClassImpl {
    export interface Init {
        importsManager: ImportsManager;
        intermediateRepresentation: IntermediateRepresentation;
        channelId: WebSocketChannelId;
        channel: WebSocketChannel;
        packageResolver: PackageResolver;
        packageId: PackageId;
        serviceClassName: string;
        errorResolver: ErrorResolver;
    }
}

interface LiteralPropertyValue {
    propertyWireKey: string;
    propertyValue: boolean | string;
}

export class GeneratedWebsocketSocketClassImpl implements GeneratedWebsocketSocketClass {
    private static readonly ARGS_PROPERTY_NAME = "Args";
    private static readonly RESPONSE_PROPERTY_NAME = "Response";
    private static readonly EVENT_HANDLERS_PROPERTY_TYPE = "EventHandlers";
    private static readonly EVENT_HANDLERS_PROPERTY_NAME = "eventHandlers";
    private static readonly SOCKET_PROPERTY_NAME = "socket";
    private static readonly RECEIVED_AT_PROPERTY_NAME = "receivedAt";
    private static readonly EVENT_PARAMETER_NAME = "event";
    private static readonly CALLBACK_PARAMETER_NAME = "callback";

    private readonly importsManager: ImportsManager;
    private readonly intermediateRepresentation: IntermediateRepresentation;
    private readonly channelId: WebSocketChannelId;
    private readonly channel: WebSocketChannel;
    private readonly packageResolver: PackageResolver;
    private readonly packageId: PackageId;
    private readonly serviceClassName: string;
    private readonly errorResolver: ErrorResolver;

    constructor({
        importsManager,
        intermediateRepresentation,
        channelId,
        channel,
        packageResolver,
        packageId,
        serviceClassName,
        errorResolver
    }: GeneratedWebsocketSocketClassImpl.Init) {
        this.importsManager = importsManager;
        this.intermediateRepresentation = intermediateRepresentation;
        this.channelId = channelId;
        this.channel = channel;
        this.packageResolver = packageResolver;
        this.packageId = packageId;
        this.serviceClassName = serviceClassName;
        this.errorResolver = errorResolver;
    }

    public writeToFile(context: SdkContext): void {
        const serviceModule: ModuleDeclarationStructure = {
            kind: StructureKind.Module,
            name: this.serviceClassName,
            isExported: true,
            hasDeclareKeyword: true,
            statements: [
                this.generateSocketArgs(context),
                this.generateSocketResponse(context),
                this.generateSocketHandlers(context)
            ]
        };

        const serviceClass: ClassDeclarationStructure = {
            kind: StructureKind.Class,
            name: this.serviceClassName,
            isExported: true,
            properties: [
                {
                    name: GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME,
                    type: getTextOfTsNode(context.coreUtilities.websocket.ReconnectingWebSocket._getReferenceToType()),
                    isReadonly: true,
                    scope: Scope.Public
                },
                {
                    name: GeneratedWebsocketSocketClassImpl.EVENT_HANDLERS_PROPERTY_NAME,
                    type: `${this.serviceClassName}.${GeneratedWebsocketSocketClassImpl.EVENT_HANDLERS_PROPERTY_TYPE}`,
                    isReadonly: true,
                    scope: Scope.Protected,
                    initializer: "{}"
                }
            ],
            ctors: [
                {
                    parameters: [
                        {
                            name: `{ ${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME} }`,
                            type: `${this.serviceClassName}.${GeneratedWebsocketSocketClassImpl.ARGS_PROPERTY_NAME}`
                        }
                    ],
                    statements: [
                        `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME} = ${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME};`,
                        `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("open", this.handleOpen);`,
                        `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("message", this.handleMessage);`,
                        `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("close", this.handleClose);`,
                        `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("error", this.handleError);`
                    ]
                }
            ],
            getAccessors: [
                {
                    name: "readyState",
                    docs: [
                        {
                            description: "The current state of the connection; this is one of the readyState constants."
                        }
                    ],
                    returnType: "number",
                    statements: ["return this.socket.readyState;"]
                }
            ],
            methods: []
        };

        const handlerRegister = this.generateHandlerRegister(context);
        const connectMethod = this.generateConnectMethod();
        const closeMethod = this.generateCloseMethod();
        const handleOpen = this.generateHandleOpen();
        const handleClose = this.generateHandleClose(context);
        const handleError = this.generateHandleError(context);
        const sendJSON = this.generateSendJSON(context);
        serviceClass.methods?.push(
            handlerRegister,
            connectMethod,
            sendJSON,
            closeMethod,
            handleOpen,
            handleClose,
            handleError
        );

        context.sourceFile.addModule(serviceModule);
        context.sourceFile.addClass(serviceClass);
    }

    private generateSocketArgs(context: SdkContext): InterfaceDeclarationStructure {
        return {
            kind: StructureKind.Interface,
            name: GeneratedWebsocketSocketClassImpl.ARGS_PROPERTY_NAME,
            isExported: true,
            properties: [
                {
                    name: GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME,
                    type: getTextOfTsNode(context.coreUtilities.websocket.ReconnectingWebSocket._getReferenceToType())
                }
            ]
        };
    }

    private generateSocketResponse(context: SdkContext): TypeAliasDeclarationStructure {
        return {
            kind: StructureKind.TypeAlias,
            name: GeneratedWebsocketSocketClassImpl.RESPONSE_PROPERTY_NAME,
            isExported: true,
            type: getTextOfTsNode(
                ts.factory.createIntersectionTypeNode([
                    this.getSubscribeMessageNode(context),
                    ts.factory.createTypeLiteralNode([
                        ts.factory.createPropertySignature(
                            undefined,
                            ts.factory.createIdentifier(GeneratedWebsocketSocketClassImpl.RECEIVED_AT_PROPERTY_NAME),
                            undefined,
                            ts.factory.createTypeReferenceNode("Date", undefined)
                        )
                    ])
                ])
            )
        };
    }

    private generateSocketHandlers(context: SdkContext): TypeAliasDeclarationStructure {
        return {
            kind: StructureKind.TypeAlias,
            name: GeneratedWebsocketSocketClassImpl.EVENT_HANDLERS_PROPERTY_TYPE,
            type: getTextOfTsNode(
                ts.factory.createTypeLiteralNode([
                    ts.factory.createPropertySignature(
                        undefined,
                        ts.factory.createIdentifier("open"),
                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                        ts.factory.createFunctionTypeNode(
                            undefined,
                            [],
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                        )
                    ),
                    ts.factory.createPropertySignature(
                        undefined,
                        ts.factory.createIdentifier("message"),
                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                        ts.factory.createFunctionTypeNode(
                            undefined,
                            [
                                ts.factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    undefined,
                                    ts.factory.createIdentifier("message"),
                                    undefined,
                                    ts.factory.createTypeReferenceNode(
                                        GeneratedWebsocketSocketClassImpl.RESPONSE_PROPERTY_NAME,
                                        undefined
                                    ),
                                    undefined
                                )
                            ],
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                        )
                    ),
                    ts.factory.createPropertySignature(
                        undefined,
                        ts.factory.createIdentifier("close"),
                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                        ts.factory.createFunctionTypeNode(
                            undefined,
                            [
                                ts.factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    undefined,
                                    ts.factory.createIdentifier("event"),
                                    undefined,
                                    context.coreUtilities.websocket.CloseEvent._getReferenceToType(),
                                    undefined
                                )
                            ],
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                        )
                    ),
                    ts.factory.createPropertySignature(
                        undefined,
                        ts.factory.createIdentifier("error"),
                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                        ts.factory.createFunctionTypeNode(
                            undefined,
                            [
                                ts.factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    undefined,
                                    ts.factory.createIdentifier("error"),
                                    undefined,
                                    ts.factory.createTypeReferenceNode("Error", undefined),
                                    undefined
                                )
                            ],
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                        )
                    )
                ])
            )
        };
    }

    private generateHandlerRegister(context: SdkContext): MethodDeclarationStructure {
        return {
            kind: StructureKind.Method,
            name: "on",
            scope: Scope.Public,
            typeParameters: [
                {
                    name: "T",
                    constraint: `keyof ${this.serviceClassName}.${GeneratedWebsocketSocketClassImpl.EVENT_HANDLERS_PROPERTY_TYPE}`
                }
            ],
            parameters: [
                {
                    name: GeneratedWebsocketSocketClassImpl.EVENT_PARAMETER_NAME,
                    type: "T"
                },
                {
                    name: GeneratedWebsocketSocketClassImpl.CALLBACK_PARAMETER_NAME,
                    type: `${this.serviceClassName}.${GeneratedWebsocketSocketClassImpl.EVENT_HANDLERS_PROPERTY_TYPE}[T]`
                }
            ],
            docs: [
                {
                    description:
                        "@param event - The event to attach to.\n" +
                        "@param callback - The callback to run when the event is triggered."
                }
            ],
            statements: [
                `this.${GeneratedWebsocketSocketClassImpl.EVENT_HANDLERS_PROPERTY_NAME}[${GeneratedWebsocketSocketClassImpl.EVENT_PARAMETER_NAME}]` +
                    ` = ${GeneratedWebsocketSocketClassImpl.CALLBACK_PARAMETER_NAME};`
            ]
        };
    }

    private generateConnectMethod(): MethodDeclarationStructure {
        return {
            kind: StructureKind.Method,
            name: "connect",
            scope: Scope.Public,
            returnType: this.serviceClassName,
            statements: [
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.reconnect();`,
                "",
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("open", this.handleOpen);`,
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("message", this.handleMessage);`,
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("close", this.handleClose);`,
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("error", this.handleError);`,
                "",
                "return this;"
            ]
        };
    }

    private generateCloseMethod(): MethodDeclarationStructure {
        return {
            kind: StructureKind.Method,
            name: "close",
            scope: Scope.Public,
            returnType: "void",
            docs: [
                {
                    description: "Closes the underlying socket."
                }
            ],
            statements: [
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.close();`,
                "",
                "this.handleClose({ code: 1000 } as CloseEvent);",
                "",
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.removeEventListener("open", this.handleOpen);`,
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.removeEventListener("message", this.handleMessage);`,
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.removeEventListener("close", this.handleClose);`,
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.removeEventListener("error", this.handleError);`
            ]
        };
    }

    private generateSendJSON(context: SdkContext): MethodDeclarationStructure {
        const publishMessageNode = this.getPublishMessageNode(context);
        const publishMessage = this.getPublishMessage();
        const referenceToPublishMessage = ts.factory.createIdentifier("payload");
        return {
            kind: StructureKind.Method,
            name: "sendJSON",
            scope: Scope.Public,
            returnType: "void",
            parameters: [
                {
                    name: "payload",
                    type: getTextOfTsNode(publishMessageNode)
                }
            ],
            statements: [
                // TODO (Eden): Implement
                // `const jsonPayload = ${this.getSeralizedExpression(publishMessage.body, referenceToPublishMessage, context)};`,
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.send(JSON.stringify(jsonPayload));`
            ]
        };
    }

    private generateHandleOpen(): MethodDeclarationStructure {
        return {
            kind: StructureKind.Method,
            name: "handleOpen",
            scope: Scope.Private,
            statements: [`this.${GeneratedWebsocketSocketClassImpl.EVENT_HANDLERS_PROPERTY_NAME}.open?.();`]
        };
    }

    private generateHandleClose(context: SdkContext): MethodDeclarationStructure {
        return {
            kind: StructureKind.Method,
            name: "handleClose",
            scope: Scope.Private,
            parameters: [
                {
                    name: "event",
                    type: getTextOfTsNode(context.coreUtilities.websocket.CloseEvent._getReferenceToType())
                }
            ],
            statements: [`this.${GeneratedWebsocketSocketClassImpl.EVENT_HANDLERS_PROPERTY_NAME}.close?.(event);`]
        };
    }

    private generateHandleError(context: SdkContext): MethodDeclarationStructure {
        return {
            kind: StructureKind.Method,
            name: "handleError",
            scope: Scope.Private,
            parameters: [
                {
                    name: "event",
                    type: getTextOfTsNode(context.coreUtilities.websocket.ErrorEvent._getReferenceToType())
                }
            ],
            statements: [
                "const message = event.message ?? \"core.ReconnectingWebSocket error\";",
                `this.${GeneratedWebsocketSocketClassImpl.EVENT_HANDLERS_PROPERTY_NAME}.error?.(new Error(message));`
            ]
        };
    }

    private getSeralizedExpression(
        requestBody: WebSocketMessageBody.InlinedBody | WebSocketMessageBody.Reference,
        referenceToRequestBody: ts.Expression,
        context: SdkContext
    ): ts.Expression {
        // TODO (Eden): We need to instantiate a new WebsocketSchemaContext to get the correct serializer
        switch (requestBody.type) {
            case "inlinedBody": {
                // TODO (Eden): Implement
                throw new Error("Inlined body messages are not supported yet");
            }
            case "reference":
                return context.sdkEndpointTypeSchemas
                    .getGeneratedEndpointTypeSchemas({ isRoot: false, subpackageId: this.channelId }, this.channel.name)
                    .serializeRequest(referenceToRequestBody, context);
        }
    }

    private getPublishMessage(): WebSocketMessage {
        return this.channel.messages.filter((message) => message.origin === "server")[0] as WebSocketMessage;
    }

    private getPublishMessageNode(context: SdkContext): ts.TypeNode {
        // TODO (Eden): At the moment, we're only extracting two messages in the IR: publish & subscribe.
        // We'll need to update this if we want to support other message types.
        return this.channel.messages
            .filter((message) => message.origin === "server")
            .map((message) => {
                if (message.body.type === "inlinedBody") {
                    // TODO (Eden): Handle inlined body messages
                    throw new Error("Inlined body messages are not supported yet");
                }
                // @ts-ignore
                const generatedType = context.type.getReferenceToType(message.body.bodyType);
                return ts.factory.createTypeReferenceNode(getTextOfTsNode(generatedType.typeNode), undefined);
            })[0] as ts.TypeNode;
    }

    private getSubscribeMessageNode(context: SdkContext): ts.TypeNode {
        // TODO (Eden): At the moment, we're only extracting two messages in the IR: publish & subscribe.
        // We'll need to update this if we want to support other message types.
        return this.channel.messages
            .filter((message) => message.origin === "server")
            .map((message) => {
                if (message.body.type === "inlinedBody") {
                    // TODO (Eden): Handle inlined body messages
                    throw new Error("Inlined body messages are not supported yet");
                }
                // @ts-ignore
                const generatedType = context.type.getReferenceToType(message.body.bodyType);
                return ts.factory.createTypeReferenceNode(getTextOfTsNode(generatedType.typeNode), undefined);
            })[0] as ts.TypeNode;
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
