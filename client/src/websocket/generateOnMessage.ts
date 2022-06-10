import { getTextOfTsKeyword, getTextOfTsNode } from "@fern-typescript/commons";
import { ClassDeclaration, Scope, ts } from "ts-morph";
import { ClientConstants } from "../constants";

const EVENT_PARAMETER_NAME = "event";
const MESSAGE_LOCAL_VARIABLE_NAME = "message";
const CALLBACK_LOCAL_VARIABLE_NAME = "callback";

export function generateOnMessage({ channelClass }: { channelClass: ClassDeclaration }): void {
    channelClass.addMethod({
        name: ClientConstants.WebsocketChannel.Methods.ON_MESSAGE,
        parameters: [
            {
                name: EVENT_PARAMETER_NAME,
                type: getTextOfTsNode(ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("MessageEvent"))),
            },
        ],
        returnType: getTextOfTsKeyword(ts.SyntaxKind.VoidKeyword),
        scope: Scope.Private,
        statements: [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(MESSAGE_LOCAL_VARIABLE_NAME),
                            undefined,
                            undefined,
                            ts.factory.createAsExpression(
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier("JSON"),
                                        ts.factory.createIdentifier("parse")
                                    ),
                                    undefined,
                                    [
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier(EVENT_PARAMETER_NAME),
                                            ts.factory.createIdentifier("data")
                                        ),
                                    ]
                                ),
                                ts.factory.createTypeReferenceNode(
                                    ts.factory.createQualifiedName(
                                        ts.factory.createIdentifier(ClientConstants.WebsocketChannel.CLIENT_NAME),
                                        ts.factory.createIdentifier(
                                            ClientConstants.WebsocketChannel.Namespace.SERVER_MESSAGE
                                        )
                                    ),
                                    undefined
                                )
                            )
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    ts.factory.createStringLiteral(
                        ClientConstants.WebsocketChannel.Operation.Types.Request.Properties.OPERATION
                    ),
                    ts.factory.createToken(ts.SyntaxKind.InKeyword),
                    ts.factory.createIdentifier(MESSAGE_LOCAL_VARIABLE_NAME)
                ),
                ts.factory.createBlock(
                    [
                        ts.factory.createExpressionStatement(
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("console"),
                                    ts.factory.createIdentifier("log")
                                ),
                                undefined,
                                [ts.factory.createStringLiteral("Received server message")]
                            )
                        ),
                    ],
                    true
                ),
                ts.factory.createBlock(
                    [
                        ts.factory.createVariableStatement(
                            undefined,
                            ts.factory.createVariableDeclarationList(
                                [
                                    ts.factory.createVariableDeclaration(
                                        ts.factory.createIdentifier(CALLBACK_LOCAL_VARIABLE_NAME),
                                        undefined,
                                        undefined,
                                        ts.factory.createElementAccessExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createThis(),
                                                ts.factory.createIdentifier(
                                                    ClientConstants.WebsocketChannel.PrivateMembers.CALLBACKS
                                                )
                                            ),
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier(MESSAGE_LOCAL_VARIABLE_NAME),
                                                ts.factory.createIdentifier(
                                                    ClientConstants.WebsocketChannel.Operation.Types.Response.Properties
                                                        .REPLY_TO
                                                )
                                            )
                                        )
                                    ),
                                ],
                                ts.NodeFlags.Const
                            )
                        ),
                        ts.factory.createIfStatement(
                            ts.factory.createBinaryExpression(
                                ts.factory.createIdentifier(CALLBACK_LOCAL_VARIABLE_NAME),
                                ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                ts.factory.createNull()
                            ),
                            ts.factory.createBlock(
                                [
                                    ts.factory.createExpressionStatement(
                                        ts.factory.createCallExpression(
                                            ts.factory.createIdentifier(CALLBACK_LOCAL_VARIABLE_NAME),
                                            undefined,
                                            [ts.factory.createIdentifier(MESSAGE_LOCAL_VARIABLE_NAME)]
                                        )
                                    ),
                                ],
                                true
                            ),
                            ts.factory.createBlock(
                                [
                                    ts.factory.createExpressionStatement(
                                        ts.factory.createCallExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier("console"),
                                                ts.factory.createIdentifier("error")
                                            ),
                                            undefined,
                                            [ts.factory.createStringLiteral("Received reply to unknown request")]
                                        )
                                    ),
                                ],
                                true
                            )
                        ),
                    ],
                    true
                )
            ),
        ].map(getTextOfTsNode),
    });
}
