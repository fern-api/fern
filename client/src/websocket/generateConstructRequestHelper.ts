import { WebSocketService } from "@fern-api/api";
import { getTextOfTsKeyword, getTextOfTsNode } from "@fern-typescript/commons";
import { ClassDeclaration, Scope, SourceFile, ts } from "ts-morph";
import { ClientConstants } from "../constants";

const MESSAGE_TYPE_PARAMETER = "T";

export function generateConstructRequestHelper({
    channelClass,
    channelDefinition,
    file,
}: {
    channelClass: ClassDeclaration;
    channelDefinition: WebSocketService;
    file: SourceFile;
}): void {
    file.addImportDeclaration({
        moduleSpecifier: "uuid",
        namespaceImport: "uuid",
    });

    channelClass.addMethod({
        name: ClientConstants.WebsocketChannel.PrivateMethods.CONSTRUCT_MESSAGE,
        typeParameters: [MESSAGE_TYPE_PARAMETER],
        parameters: [
            {
                name: channelDefinition.messagePropertyKeys.operation,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            },
            {
                name: channelDefinition.messagePropertyKeys.body,
                type: MESSAGE_TYPE_PARAMETER,
            },
        ],
        returnType: getTextOfTsNode(
            ts.factory.createQualifiedName(
                ts.factory.createIdentifier(ClientConstants.WebsocketChannel.CLIENT_NAME),
                ClientConstants.WebsocketChannel.Namespace.CLIENT_MESSAGE
            )
        ),
        scope: Scope.Private,
        statements: [
            getTextOfTsNode(
                ts.factory.createReturnStatement(
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier(channelDefinition.messagePropertyKeys.id),
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier("uuid"),
                                        ts.factory.createIdentifier("v4")
                                    ),
                                    undefined,
                                    []
                                )
                            ),
                            ts.factory.createShorthandPropertyAssignment(
                                ts.factory.createIdentifier(channelDefinition.messagePropertyKeys.operation)
                            ),
                            ts.factory.createShorthandPropertyAssignment(
                                ts.factory.createIdentifier(channelDefinition.messagePropertyKeys.body)
                            ),
                        ],
                        true
                    )
                )
            ),
        ],
    });
}
