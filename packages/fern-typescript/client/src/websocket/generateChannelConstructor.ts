import { WebSocketService } from "@fern-api/api";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ClassDeclaration, SourceFile, ts } from "ts-morph";
import { ClientConstants } from "../constants";
import { ServiceTypeReference } from "../service-types/types";
import { generateJoinPathsCall } from "../utils/generateJoinPathsCall";

const SOCKET_LOCAL_VARIABLE_NAME = "socket";

export function generateChannelConstructor({
    channelClass,
    channelDefinition,
    initTypeReference,
    file,
}: {
    channelClass: ClassDeclaration;
    channelDefinition: WebSocketService;
    initTypeReference: ServiceTypeReference | undefined;
    file: SourceFile;
}): void {
    channelClass.addConstructor({
        parameters: [
            {
                name: ClientConstants.WebsocketChannel.Constructor.PARAMETER_NAME,
                type: getTextOfTsNode(
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createQualifiedName(
                            ts.factory.createIdentifier(ClientConstants.WebsocketChannel.CLIENT_NAME),
                            ts.factory.createIdentifier(ClientConstants.WebsocketChannel.Namespace.Args.TYPE_NAME)
                        )
                    )
                ),
            },
        ],
        statements: getTextOfTsNode(
            ts.factory.createExpressionStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createThis(),
                        ts.factory.createIdentifier(ClientConstants.WebsocketChannel.PrivateMembers.SOCKET)
                    ),
                    ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                    ts.factory.createNewExpression(ts.factory.createIdentifier("Promise"), undefined, [
                        ts.factory.createArrowFunction(
                            undefined,
                            undefined,
                            [
                                ts.factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    undefined,
                                    ts.factory.createIdentifier("resolve")
                                ),
                            ],
                            undefined,
                            undefined,
                            ts.factory.createBlock(
                                generateCreateAndResolveSocket({
                                    file,
                                    channelDefinition,
                                    initTypeReference,
                                }),
                                true
                            )
                        ),
                    ])
                )
            )
        ),
    });
}

function generateCreateAndResolveSocket({
    file,
    channelDefinition,
    initTypeReference,
}: {
    file: SourceFile;
    channelDefinition: WebSocketService;
    initTypeReference: ServiceTypeReference | undefined;
}): ts.Statement[] {
    return [
        ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        ts.factory.createIdentifier(SOCKET_LOCAL_VARIABLE_NAME),
                        undefined,
                        undefined,
                        ts.factory.createNewExpression(ts.factory.createIdentifier("WebSocket"), undefined, [
                            generateJoinPathsCall({
                                file,
                                paths: [
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier(
                                            ClientConstants.WebsocketChannel.Constructor.PARAMETER_NAME
                                        ),
                                        ts.factory.createIdentifier(
                                            ClientConstants.WebsocketChannel.Namespace.Args.Properties.ORIGIN
                                        )
                                    ),
                                    ts.factory.createStringLiteral(channelDefinition.path),
                                ],
                            }),
                        ])
                    ),
                ],
                ts.NodeFlags.Const
            )
        ),
        ts.factory.createExpressionStatement(
            ts.factory.createBinaryExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(SOCKET_LOCAL_VARIABLE_NAME),
                    ts.factory.createIdentifier("onopen")
                ),
                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [],
                    undefined,
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createBlock(generateOnOpen({ channelDefinition, initTypeReference }), true)
                )
            )
        ),
        ts.factory.createExpressionStatement(
            ts.factory.createBinaryExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(SOCKET_LOCAL_VARIABLE_NAME),
                    ts.factory.createIdentifier("onmessage")
                ),
                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                generateOnMessage({ channelDefinition })
            )
        ),
    ];
}

function generateOnOpen({
    channelDefinition,
    initTypeReference,
}: {
    channelDefinition: WebSocketService;
    initTypeReference: ServiceTypeReference | undefined;
}) {
    const INIT_MESSAGE_VARIABLE_NAME = "initMessage";

    const statements: ts.Statement[] = [];

    if (initTypeReference != null) {
        statements.push(
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(INIT_MESSAGE_VARIABLE_NAME),
                            undefined,
                            undefined,
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createThis(),
                                    ts.factory.createIdentifier(
                                        ClientConstants.WebsocketChannel.PrivateMethods.CONSTRUCT_MESSAGE
                                    )
                                ),
                                undefined,
                                [
                                    ts.factory.createStringLiteral(channelDefinition.init.operationName),
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier(
                                            ClientConstants.WebsocketChannel.Constructor.PARAMETER_NAME
                                        ),
                                        ts.factory.createIdentifier(
                                            ClientConstants.WebsocketChannel.Namespace.Args.Properties.Init.NAME
                                        )
                                    ),
                                ]
                            )
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ts.factory.createExpressionStatement(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(SOCKET_LOCAL_VARIABLE_NAME),
                        ts.factory.createIdentifier("send")
                    ),
                    undefined,
                    [
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("JSON"),
                                ts.factory.createIdentifier("stringify")
                            ),
                            undefined,
                            [ts.factory.createIdentifier(INIT_MESSAGE_VARIABLE_NAME)]
                        ),
                    ]
                )
            )
        );
    }

    statements.push(
        ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(ts.factory.createIdentifier("resolve"), undefined, [
                ts.factory.createIdentifier(SOCKET_LOCAL_VARIABLE_NAME),
            ])
        )
    );

    return statements;
}

function generateOnMessage({ channelDefinition }: { channelDefinition: WebSocketService }): ts.ArrowFunction {
    const MESSAGE_DATA_PROPERTY_NAME = "data";
    const MESSAGE_VARIABLE_NAME = "message";

    return ts.factory.createArrowFunction(
        undefined,
        undefined,
        [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createObjectBindingPattern([
                    ts.factory.createBindingElement(
                        undefined,
                        undefined,
                        ts.factory.createIdentifier(MESSAGE_DATA_PROPERTY_NAME)
                    ),
                ])
            ),
        ],
        undefined,
        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.factory.createBlock(
            [
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier(MESSAGE_VARIABLE_NAME),
                                undefined,
                                undefined,
                                ts.factory.createAsExpression(
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier("JSON"),
                                            ts.factory.createIdentifier("parse")
                                        ),
                                        undefined,
                                        [ts.factory.createIdentifier(MESSAGE_DATA_PROPERTY_NAME)]
                                    ),
                                    ts.factory.createTypeReferenceNode(
                                        ts.factory.createQualifiedName(
                                            ts.factory.createIdentifier(ClientConstants.WebsocketChannel.CLIENT_NAME),
                                            ClientConstants.WebsocketChannel.Namespace.SERVER_MESSAGE
                                        )
                                    )
                                )
                            ),
                        ],
                        ts.NodeFlags.Const
                    )
                ),
                ts.factory.createExpressionStatement(
                    ts.factory.createCallChain(
                        ts.factory.createElementAccessExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createThis(),
                                ts.factory.createIdentifier(ClientConstants.WebsocketChannel.PrivateMembers.CALLBACKS)
                            ),
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(MESSAGE_VARIABLE_NAME),
                                ts.factory.createIdentifier(channelDefinition.messagePropertyKeys.id)
                            )
                        ),
                        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                        undefined,
                        [ts.factory.createIdentifier(MESSAGE_VARIABLE_NAME)]
                    )
                ),
            ],
            true
        )
    );
}
