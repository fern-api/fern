import { getTextOfTsNode } from "@fern-typescript/commons";
import { ClassDeclaration, Scope, ts } from "ts-morph";
import { ClientConstants } from "../constants";

const SOCKET_LOCAL_VARIABLE_NAME = "socket";

export function generateDisconnect({ channelClass }: { channelClass: ClassDeclaration }): void {
    channelClass.addMethod({
        name: ClientConstants.WebsocketChannel.Methods.DISCONNECT,
        isAsync: true,
        returnType: getTextOfTsNode(
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
            ])
        ),
        scope: Scope.Public,
        statements: [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(SOCKET_LOCAL_VARIABLE_NAME),
                            undefined,
                            undefined,
                            ts.factory.createAwaitExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createThis(),
                                    ts.factory.createIdentifier(ClientConstants.WebsocketChannel.PrivateMembers.SOCKET)
                                )
                            )
                        ),
                    ],
                    ts.NodeFlags.Const |
                        ts.NodeFlags.AwaitContext |
                        ts.NodeFlags.ContextFlags |
                        ts.NodeFlags.TypeExcludesFlags
                )
            ),
            ts.factory.createReturnStatement(
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
                            [
                                ts.factory.createExpressionStatement(
                                    ts.factory.createBinaryExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier(SOCKET_LOCAL_VARIABLE_NAME),
                                            ts.factory.createIdentifier("onclose")
                                        ),
                                        ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                        ts.factory.createArrowFunction(
                                            undefined,
                                            undefined,
                                            [],
                                            undefined,
                                            undefined,
                                            ts.factory.createBlock(
                                                [
                                                    ts.factory.createExpressionStatement(
                                                        ts.factory.createCallExpression(
                                                            ts.factory.createIdentifier("resolve"),
                                                            undefined,
                                                            []
                                                        )
                                                    ),
                                                ],
                                                true
                                            )
                                        )
                                    )
                                ),
                                ts.factory.createExpressionStatement(
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier(SOCKET_LOCAL_VARIABLE_NAME),
                                            ts.factory.createIdentifier("close")
                                        ),
                                        undefined,
                                        []
                                    )
                                ),
                            ],
                            true
                        )
                    ),
                ])
            ),
        ].map(getTextOfTsNode),
    });
}
