import { WebSocketChannel } from "@fern-api/api";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ClassDeclaration, SourceFile, ts } from "ts-morph";
import { ClientConstants } from "../constants";
import { generateJoinPathsCall } from "../utils/generateJoinPathsCall";

const SOCKET_LOCAL_VARIABLE_NAME = "socket";

export function generateChannelConstructor({
    channelClass,
    channelDefinition,
    file,
}: {
    channelClass: ClassDeclaration;
    channelDefinition: WebSocketChannel;
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
}: {
    file: SourceFile;
    channelDefinition: WebSocketChannel;
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
                    ts.factory.createBlock(
                        [
                            ts.factory.createExpressionStatement(
                                ts.factory.createCallExpression(ts.factory.createIdentifier("resolve"), undefined, [
                                    ts.factory.createIdentifier(SOCKET_LOCAL_VARIABLE_NAME),
                                ])
                            ),
                        ],
                        true
                    )
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
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createThis(),
                    ts.factory.createIdentifier(ClientConstants.WebsocketChannel.Methods.ON_MESSAGE)
                )
            )
        ),
    ];
}
