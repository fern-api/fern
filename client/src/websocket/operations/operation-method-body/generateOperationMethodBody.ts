import { WebSocketOperation } from "@fern-api/api";
import { DependencyManager, generateUuidCall, getTextOfTsNode } from "@fern-typescript/commons";
import {
    GeneratedWebSocketOperationTypes,
    ServiceTypeName,
    ServiceTypesConstants,
} from "@fern-typescript/service-types";
import { SourceFile, StatementStructures, ts, WriterFunction } from "ts-morph";
import { ClientConstants } from "../../../constants";

const SOCKET_LOCAL_VARIABLE_NAME = "socket";
const MESSAGE_LOCAL_VARIABLE_NAME = "message";

export function generateOperationMethodBody({
    operation,
    operationTypes,
    channelFile,
    getReferenceToLocalServiceType,
    dependencyManager,
}: {
    operation: WebSocketOperation;
    operationTypes: GeneratedWebSocketOperationTypes;
    channelFile: SourceFile;
    getReferenceToLocalServiceType: (typeName: ServiceTypeName) => ts.TypeReferenceNode;
    dependencyManager: DependencyManager;
}): (StatementStructures | WriterFunction | string)[] {
    return [
        (writer) => {
            writer.writeLine(
                getTextOfTsNode(
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
                                            ts.factory.createIdentifier(
                                                ClientConstants.WebsocketChannel.PrivateMembers.SOCKET
                                            )
                                        )
                                    )
                                ),
                            ],
                            ts.NodeFlags.Const |
                                ts.NodeFlags.AwaitContext |
                                ts.NodeFlags.ContextFlags |
                                ts.NodeFlags.TypeExcludesFlags
                        )
                    )
                )
            );

            writer.newLine();
        },
        getTextOfTsNode(
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
                                ts.factory.createIdentifier("resolve"),
                                undefined,
                                undefined,
                                undefined
                            ),
                        ],
                        undefined,
                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        ts.factory.createBlock(
                            generatePromiseBody({
                                operation,
                                channelFile,
                                getReferenceToLocalServiceType,
                                operationTypes,
                                dependencyManager,
                            }),
                            true
                        )
                    ),
                ])
            )
        ),
    ];
}

function generatePromiseBody({
    operation,
    channelFile,
    getReferenceToLocalServiceType,
    operationTypes,
    dependencyManager,
}: {
    operation: WebSocketOperation;
    channelFile: SourceFile;
    getReferenceToLocalServiceType: (typeName: ServiceTypeName) => ts.TypeReferenceNode;
    operationTypes: GeneratedWebSocketOperationTypes;
    dependencyManager: DependencyManager;
}): ts.Statement[] {
    const messageElements: ts.ObjectLiteralElementLike[] = [
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(ServiceTypesConstants.WebsocketChannel.Request.Properties.ID),
            generateUuidCall({ file: channelFile, dependencyManager })
        ),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(ServiceTypesConstants.WebsocketChannel.Request.Properties.OPERATION),
            ts.factory.createStringLiteral(operation.operationId)
        ),
    ];
    if (operationTypes.request?.body != null) {
        messageElements.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(ServiceTypesConstants.Commons.Request.Properties.Body.PROPERTY_NAME),
                ts.factory.createIdentifier(ClientConstants.WebsocketChannel.Operation.Signature.REQUEST_PARAMETER)
            )
        );
    }

    return [
        ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        ts.factory.createIdentifier(MESSAGE_LOCAL_VARIABLE_NAME),
                        undefined,
                        getReferenceToLocalServiceType(ServiceTypesConstants.Commons.Request.TYPE_NAME),
                        ts.factory.createObjectLiteralExpression(messageElements, true)
                    ),
                ],
                ts.NodeFlags.Const
            )
        ),
        ts.factory.createExpressionStatement(
            ts.factory.createBinaryExpression(
                ts.factory.createElementAccessExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createThis(),
                        ts.factory.createIdentifier(ClientConstants.WebsocketChannel.PrivateMembers.CALLBACKS)
                    ),
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(MESSAGE_LOCAL_VARIABLE_NAME),
                        ts.factory.createIdentifier(ServiceTypesConstants.WebsocketChannel.Request.Properties.ID)
                    )
                ),
                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                ts.factory.createIdentifier("resolve")
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
                        [ts.factory.createIdentifier(MESSAGE_LOCAL_VARIABLE_NAME)]
                    ),
                ]
            )
        ),
    ];
}
