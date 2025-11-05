import { WebSocketChannel, WebSocketMessage, WebSocketMessageBody } from "@fern-fern/ir-sdk/api";
import { getPropertyKey, getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { GeneratedWebsocketSocketClass, SdkContext } from "@fern-typescript/contexts";
import { camelCase } from "lodash-es";
import {
    ClassDeclarationStructure,
    InterfaceDeclarationStructure,
    MethodDeclarationStructure,
    ModuleDeclarationStructure,
    PropertyDeclarationStructure,
    Scope,
    StructureKind,
    TypeAliasDeclarationStructure,
    ts
} from "ts-morph";

export declare namespace GeneratedWebsocketSocketClassImpl {
    export interface Init {
        packageId: PackageId;
        includeSerdeLayer: boolean;
        channel: WebSocketChannel;
        serviceClassName: string;
        retainOriginalCasing: boolean;
        omitUndefined: boolean;
        skipResponseValidation: boolean;
    }
}

export class GeneratedWebsocketSocketClassImpl implements GeneratedWebsocketSocketClass {
    private static readonly ARGS_PROPERTY_NAME = "Args";
    private static readonly RESPONSE_PROPERTY_NAME = "Response";
    private static readonly EVENT_HANDLERS_PROPERTY_TYPE = "EventHandlers";
    private static readonly EVENT_HANDLERS_PROPERTY_NAME = "eventHandlers";
    private static readonly SOCKET_PROPERTY_NAME = "socket";
    private static readonly EVENT_PARAMETER_NAME = "event";
    private static readonly CALLBACK_PARAMETER_NAME = "callback";
    private static readonly MESSAGE_PARAMETER_NAME = "message";
    private static readonly CLOSE_CODE_VALUE = 1000;

    private readonly channel: WebSocketChannel;
    private readonly includeSerdeLayer: boolean;
    private readonly serviceClassName: string;
    private readonly packageId: PackageId;
    private readonly retainOriginalCasing: boolean;
    private readonly omitUndefined: boolean;
    private readonly skipResponseValidation: boolean;

    constructor({
        packageId,
        includeSerdeLayer,
        channel,
        serviceClassName,
        retainOriginalCasing,
        omitUndefined,
        skipResponseValidation
    }: GeneratedWebsocketSocketClassImpl.Init) {
        this.includeSerdeLayer = includeSerdeLayer;
        this.channel = channel;
        this.packageId = packageId;
        this.serviceClassName = serviceClassName;
        this.retainOriginalCasing = retainOriginalCasing;
        this.omitUndefined = omitUndefined;
        this.skipResponseValidation = skipResponseValidation;
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
                    name: getPropertyKey(GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME),
                    type: getTextOfTsNode(context.coreUtilities.websocket.ReconnectingWebSocket._getReferenceToType()),
                    isReadonly: true,
                    scope: Scope.Public
                },
                {
                    name: getPropertyKey(GeneratedWebsocketSocketClassImpl.EVENT_HANDLERS_PROPERTY_NAME),
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
                            name: "args",
                            type: `${this.serviceClassName}.${GeneratedWebsocketSocketClassImpl.ARGS_PROPERTY_NAME}`
                        }
                    ],
                    statements: [
                        `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME} = args.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME};`,
                        `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("open", this.handleOpen);`,
                        `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("${GeneratedWebsocketSocketClassImpl.MESSAGE_PARAMETER_NAME}", this.handleMessage);`,
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
                    statements: [`return this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.readyState;`]
                }
            ],
            methods: []
        };

        const handlerRegister = this.generateHandlerRegister(context);
        const sendHelperMethods = this.generateSendHelperMethods(context);
        const connectMethod = this.generateConnectMethod();
        const closeMethod = this.generateCloseMethod();
        const waitForOpen = this.generateWaitForOpen(context);
        const assertSocketIsOpen = this.generateAssertSocketIsOpen(context);

        const sendBinary = this.generateSendBinary(context);
        const handleOpen = this.generateHandleOpen();
        const handleMessage = this.generateHandleMessage(context);
        const handleClose = this.generateHandleClose(context);
        const handleError = this.generateHandleError(context);

        serviceClass.methods?.push(
            handlerRegister,
            ...sendHelperMethods,
            connectMethod,
            closeMethod,
            waitForOpen,
            assertSocketIsOpen,
            sendBinary
        );
        if (!this.includeSerdeLayer) {
            const sendJson = this.generateSendJson(context);
            serviceClass.methods?.push(sendJson);
        }

        serviceClass.properties?.push(handleOpen, handleMessage, handleClose, handleError);

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
                    name: getPropertyKey(GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME),
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
            type: getTextOfTsNode(this.getUnionedNodeForOrigin(context, "server"))
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
                        ts.factory.createIdentifier(GeneratedWebsocketSocketClassImpl.MESSAGE_PARAMETER_NAME),
                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                        ts.factory.createFunctionTypeNode(
                            undefined,
                            [
                                ts.factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    undefined,
                                    ts.factory.createIdentifier(
                                        GeneratedWebsocketSocketClassImpl.MESSAGE_PARAMETER_NAME
                                    ),
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
            returnType: "void",
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
                        "@param callback - The callback to run when the event is triggered.\n" +
                        "Usage:\n" +
                        "```typescript\n" +
                        "this.on('open', () => {\n" +
                        "    console.log('The websocket is open');\n" +
                        "});\n" +
                        "```"
                }
            ],
            statements: [
                `this.${GeneratedWebsocketSocketClassImpl.EVENT_HANDLERS_PROPERTY_NAME}[${GeneratedWebsocketSocketClassImpl.EVENT_PARAMETER_NAME}]` +
                    ` = ${GeneratedWebsocketSocketClassImpl.CALLBACK_PARAMETER_NAME};`
            ]
        };
    }

    private generateSendHelperMethods(context: SdkContext): MethodDeclarationStructure[] {
        return this.getMessagesForOrigin("client").map((message) => {
            const node = this.getNodeForMessage(context, message);
            return this.generateSendMessage(context, message, node);
        });
    }

    private generateSendMessage(
        context: SdkContext,
        message: WebSocketMessage,
        node: ts.TypeNode
    ): MethodDeclarationStructure {
        const messageType = camelCase(message.type);
        return {
            kind: StructureKind.Method,
            name: `send${messageType.charAt(0).toUpperCase() + messageType.slice(1)}`,
            scope: Scope.Public,
            parameters: [
                {
                    name: GeneratedWebsocketSocketClassImpl.MESSAGE_PARAMETER_NAME,
                    type: getTextOfTsNode(node)
                }
            ],
            returnType: "void",
            statements: this.includeSerdeLayer
                ? [
                      "this.assertSocketIsOpen();",
                      `const jsonPayload = ${getTextOfTsNode(this.getSerializedExpression(message.body, "message", context))};`,
                      `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.send(JSON.stringify(jsonPayload));`
                  ]
                : [
                      "this.assertSocketIsOpen();",
                      `this.sendJson(${GeneratedWebsocketSocketClassImpl.MESSAGE_PARAMETER_NAME});`
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
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("${GeneratedWebsocketSocketClassImpl.MESSAGE_PARAMETER_NAME}", this.handleMessage);`,
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("close", this.handleClose);`,
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("error", this.handleError);`,
                "",
                "return this;"
            ],
            docs: [
                {
                    description: "Connect to the websocket and register event handlers."
                }
            ]
        };
    }

    private generateCloseMethod(): MethodDeclarationStructure {
        return {
            kind: StructureKind.Method,
            name: "close",
            scope: Scope.Public,
            returnType: "void",
            statements: [
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.close();`,
                "",
                `this.handleClose({ code: ${GeneratedWebsocketSocketClassImpl.CLOSE_CODE_VALUE} } as CloseEvent);`,
                "",
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.removeEventListener("open", this.handleOpen);`,
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.removeEventListener("${GeneratedWebsocketSocketClassImpl.MESSAGE_PARAMETER_NAME}", this.handleMessage);`,
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.removeEventListener("close", this.handleClose);`,
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.removeEventListener("error", this.handleError);`
            ],
            docs: [
                {
                    description: "Close the websocket and unregister event handlers."
                }
            ]
        };
    }

    private generateWaitForOpen(context: SdkContext): MethodDeclarationStructure {
        return {
            kind: StructureKind.Method,
            name: "waitForOpen",
            scope: Scope.Public,
            isAsync: true,
            returnType: `Promise<${getTextOfTsNode(context.coreUtilities.websocket.ReconnectingWebSocket._getReferenceToType())}>`,
            statements: [
                `if (this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.readyState === ${getTextOfTsNode(context.coreUtilities.websocket.ReconnectingWebSocket._getReferenceToType())}.OPEN) {`,
                `    return this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME};`,
                "}",
                "return new Promise((resolve, reject) => {",
                `    this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("open", () => {`,
                `        resolve(this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME});`,
                "    });",
                "",
                `    this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.addEventListener("error", (event: unknown) => {`,
                "        reject(event);",
                "    });",
                "});"
            ],
            docs: [
                {
                    description: "Returns a promise that resolves when the websocket is open."
                }
            ]
        };
    }

    private generateAssertSocketIsOpen(context: SdkContext): MethodDeclarationStructure {
        return {
            kind: StructureKind.Method,
            name: "assertSocketIsOpen",
            scope: Scope.Private,
            returnType: "void",
            statements: [
                `if (!this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}) {`,
                '    throw new Error("Socket is not connected.");',
                "}",
                "",
                `if (this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.readyState !== ${getTextOfTsNode(context.coreUtilities.websocket.ReconnectingWebSocket._getReferenceToType())}.OPEN) {`,
                '    throw new Error("Socket is not open.");',
                "}"
            ],
            docs: [
                {
                    description: "Asserts that the websocket is open."
                }
            ]
        };
    }

    private generateSendJson(context: SdkContext): MethodDeclarationStructure {
        const publishMessageNode = this.getUnionedNodeForOrigin(context, "client");
        return {
            kind: StructureKind.Method,
            name: "sendJson",
            scope: Scope.Protected,
            returnType: "void",
            parameters: [
                {
                    name: "payload",
                    type: getTextOfTsNode(publishMessageNode)
                }
            ],
            statements: [
                `const jsonPayload = ${getTextOfTsNode(context.jsonContext.getReferenceToToJson().getTypeNode())}(payload);`,
                `this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.send(jsonPayload);`
            ],
            docs: [
                {
                    description: "Send a JSON payload to the websocket."
                }
            ]
        };
    }

    private generateSendBinary(context: SdkContext): MethodDeclarationStructure {
        return {
            kind: StructureKind.Method,
            name: "sendBinary",
            scope: Scope.Protected,
            returnType: "void",
            parameters: [
                {
                    name: "payload",
                    type: "ArrayBufferLike | Blob | ArrayBufferView"
                }
            ],
            statements: [`this.${GeneratedWebsocketSocketClassImpl.SOCKET_PROPERTY_NAME}.send(payload);`],
            docs: [
                {
                    description: "Send a binary payload to the websocket."
                }
            ]
        };
    }

    private generateHandleMessage(context: SdkContext): PropertyDeclarationStructure {
        const bodyLines: string[] = [
            `const data = ${getTextOfTsNode(context.jsonContext.getReferenceToFromJson().getTypeNode())}(event.data);`,
            ""
        ];

        if (this.includeSerdeLayer) {
            bodyLines.push(
                `const parsedResponse = ${getTextOfTsNode(this.getUnionedParseResponse(context))};`,
                "if (parsedResponse.ok) {",
                `    this.eventHandlers.${GeneratedWebsocketSocketClassImpl.MESSAGE_PARAMETER_NAME}?.(parsedResponse.value);`,
                "} else {",
                '    this.eventHandlers.error?.(new Error("Received unknown message type"));',
                "}"
            );
        } else {
            bodyLines.push(
                `this.eventHandlers.message?.(data as ${this.serviceClassName}.${GeneratedWebsocketSocketClassImpl.RESPONSE_PROPERTY_NAME});`
            );
        }

        return {
            kind: StructureKind.Property,
            name: "handleMessage",
            scope: Scope.Private,
            type: "(event: { data: string }) => void",
            initializer: `event => {
    ${bodyLines.map((line) => "    " + line).join("\n")}
    }`
        };
    }

    private generateHandleOpen(): PropertyDeclarationStructure {
        return {
            kind: StructureKind.Property,
            name: "handleOpen",
            scope: Scope.Private,
            type: "() => void",
            initializer: `() => {
        this.${GeneratedWebsocketSocketClassImpl.EVENT_HANDLERS_PROPERTY_NAME}.open?.();
    }`
        };
    }

    private generateHandleClose(context: SdkContext): PropertyDeclarationStructure {
        return {
            kind: StructureKind.Property,
            name: "handleClose",
            scope: Scope.Private,
            type: `(event: ${getTextOfTsNode(context.coreUtilities.websocket.CloseEvent._getReferenceToType())}) => void`,
            initializer: `event => {
        this.${GeneratedWebsocketSocketClassImpl.EVENT_HANDLERS_PROPERTY_NAME}.close?.(event);
    }`
        };
    }

    private generateHandleError(context: SdkContext): PropertyDeclarationStructure {
        return {
            kind: StructureKind.Property,
            name: "handleError",
            scope: Scope.Private,
            type: `(event: ${getTextOfTsNode(context.coreUtilities.websocket.ErrorEvent._getReferenceToType())}) => void`,
            initializer: `event => {
        const ${GeneratedWebsocketSocketClassImpl.MESSAGE_PARAMETER_NAME} = event.message;
        this.${GeneratedWebsocketSocketClassImpl.EVENT_HANDLERS_PROPERTY_NAME}.error?.(new Error(${GeneratedWebsocketSocketClassImpl.MESSAGE_PARAMETER_NAME}));
    }`
        };
    }

    private getSerializedExpression(
        subscribeMessage: WebSocketMessageBody.InlinedBody | WebSocketMessageBody.Reference,
        requestBodyReference: string,
        context: SdkContext
    ): ts.Expression {
        const referenceToRequestBody = ts.factory.createIdentifier(requestBodyReference);
        switch (subscribeMessage.type) {
            case "inlinedBody": {
                throw new Error("Websocket inlined schemas are not supported at the moment.");
            }
            case "reference":
                return context.typeSchema
                    .getSchemaOfTypeReference(subscribeMessage.bodyType)
                    .jsonOrThrow(referenceToRequestBody, {
                        unrecognizedObjectKeys: "passthrough",
                        allowUnrecognizedEnumValues: true,
                        allowUnrecognizedUnionMembers: true,
                        skipValidation: this.skipResponseValidation,
                        breadcrumbsPrefix: [],
                        omitUndefined: this.omitUndefined
                    });
        }
    }

    private getUnionedParseResponse(context: SdkContext): ts.Expression {
        const receiveMessages = this.getMessagesForOrigin("server")
            .map((message) => message.body)
            .filter((body) => body.type === "reference");
        return context.websocketTypeSchema
            .getGeneratedWebsocketResponseTypeSchema(this.packageId, this.channel, receiveMessages)
            .deserializeResponse(ts.factory.createIdentifier("data"), context);
    }

    private getMessagesForOrigin(origin: "client" | "server"): WebSocketMessage[] {
        return this.channel.messages.filter((message) => message.origin === origin);
    }

    private getAllMessageNodesForOrigin(context: SdkContext, origin: "client" | "server"): ts.TypeNode[] {
        return this.getMessagesForOrigin(origin).map((message) => this.getNodeForMessage(context, message));
    }

    private getUnionedNodeForOrigin(context: SdkContext, origin: "client" | "server"): ts.TypeNode {
        const allReturnTypes = this.getAllMessageNodesForOrigin(context, origin);
        if (allReturnTypes.length === 0) {
            context.logger.warn(
                `WebSocket channel ${this.channel.name} has no ${origin} messages defined. Using 'never' as the type.`
            );
            return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);
        }
        return ts.factory.createUnionTypeNode(allReturnTypes);
    }

    private getNodeForMessage(context: SdkContext, message: WebSocketMessage): ts.TypeNode {
        if (message.body.type === "inlinedBody") {
            throw new Error("Websocket inlined schemas are not supported at the moment.");
        }
        const generatedType = context.type.getReferenceToType(message.body.bodyType);
        return ts.factory.createTypeReferenceNode(getTextOfTsNode(generatedType.typeNode), undefined);
    }
}
