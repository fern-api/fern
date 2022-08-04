import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { ClientConstants } from "@fern-typescript/client-v2";
import { getTextOfTsKeyword, getTextOfTsNode } from "@fern-typescript/commons";
import { File } from "@fern-typescript/declaration-handler";
import { camelCase } from "lodash-es";
import { Scope, ts } from "ts-morph";
import { getGeneratedServiceName } from "./utils/getGeneratedServiceName";

export function writeClientFile(intermediateRepresentation: IntermediateRepresentation, file: File): void {
    const apiModule = file.sourceFile.addModule({
        name: "Client",
        isExported: true,
    });

    const optionsInterface = apiModule.addInterface({
        name: "Options",
        isExported: true,
    });

    const originProperty = optionsInterface.addProperty({
        name: "origin",
        type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
    });

    const apiClass = file.sourceFile.addClass({
        name: apiModule.getName(),
        isExported: true,
    });

    const constructor = apiClass.addConstructor();
    const optionsMember = constructor.addParameter({
        scope: Scope.Private,
        isReadonly: true,
        name: "options",
        type: getTextOfTsNode(
            ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier(apiModule.getName()),
                    optionsInterface.getName()
                )
            )
        ),
    });

    for (const service of intermediateRepresentation.services.http) {
        const referenceToServiceClient = ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                file.getReferenceToService(service.name).entityName,
                ClientConstants.HttpService.SERVICE_NAME
            )
        );

        const serviceProperty = apiClass.addProperty({
            name: camelCase(service.name.name),
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode([
                    referenceToServiceClient,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                ])
            ),
        });

        apiClass.addGetAccessor({
            name: getGeneratedServiceName(service.name),
            returnType: getTextOfTsNode(referenceToServiceClient),
            statements: [
                getTextOfTsNode(
                    ts.factory.createReturnStatement(
                        ts.factory.createParenthesizedExpression(
                            ts.factory.createBinaryExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createThis(),
                                    serviceProperty.getName()
                                ),
                                ts.SyntaxKind.QuestionQuestionEqualsToken,
                                ts.factory.createNewExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        file.getReferenceToService(service.name).expression,
                                        ClientConstants.HttpService.SERVICE_NAME
                                    ),
                                    undefined,
                                    [
                                        ts.factory.createObjectLiteralExpression(
                                            [
                                                ts.factory.createPropertyAssignment(
                                                    ts.factory.createIdentifier(
                                                        ClientConstants.HttpService.ServiceNamespace.Init.Properties
                                                            .BASE_PATH
                                                    ),
                                                    ts.factory.createPropertyAccessExpression(
                                                        ts.factory.createPropertyAccessExpression(
                                                            ts.factory.createThis(),
                                                            ts.factory.createIdentifier(optionsMember.getName())
                                                        ),
                                                        originProperty.getName()
                                                    )
                                                ),
                                            ],
                                            true
                                        ),
                                    ]
                                )
                            )
                        )
                    )
                ),
            ],
        });
    }
}
