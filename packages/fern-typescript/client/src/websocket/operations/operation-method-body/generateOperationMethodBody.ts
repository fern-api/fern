import { WebSocketOperation } from "@fern-api/api";
import { addUuidDependency, DependencyManager, getTextOfTsNode, SourceFileManager } from "@fern-typescript/commons";
import { StatementStructures, ts, WriterFunction } from "ts-morph";
import { ServiceTypeName } from "../../../commons/service-types/types";
import { ClientConstants } from "../../../constants";
import { GeneratedOperationTypes } from "../operation-types/types";

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
    operationTypes: GeneratedOperationTypes;
    channelFile: SourceFileManager;
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
    channelFile: SourceFileManager;
    getReferenceToLocalServiceType: (typeName: ServiceTypeName) => ts.TypeReferenceNode;
    operationTypes: GeneratedOperationTypes;
    dependencyManager: DependencyManager;
}): ts.Statement[] {
    channelFile.addImportDeclaration({
        moduleSpecifier: "uuid",
        defaultImport: "uuid",
    });
    addUuidDependency(dependencyManager);

    const messageElements: ts.ObjectLiteralElementLike[] = [
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(ClientConstants.WebsocketChannel.Operation.Types.Request.Properties.ID),
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier("uuid"),
                    ts.factory.createIdentifier("v4")
                ),
                undefined,
                []
            )
        ),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(ClientConstants.WebsocketChannel.Operation.Types.Request.Properties.OPERATION),
            ts.factory.createStringLiteral(operation.operationId)
        ),
    ];
    if (operationTypes.request?.body != null) {
        messageElements.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(ClientConstants.WebsocketChannel.Operation.Types.Request.Properties.BODY),
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
                        getReferenceToLocalServiceType(ClientConstants.Commons.Types.Request.TYPE_NAME),
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
                        ts.factory.createIdentifier(
                            ClientConstants.WebsocketChannel.Operation.Types.Request.Properties.ID
                        )
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
