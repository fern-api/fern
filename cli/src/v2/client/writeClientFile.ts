import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { HttpService } from "@fern-fern/ir-model/services";
import { ClientConstants } from "@fern-typescript/client-v2";
import { getTextOfTsKeyword, getTextOfTsNode } from "@fern-typescript/commons";
import { File } from "@fern-typescript/declaration-handler";
import { Scope, ts } from "ts-morph";

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

    const tailOfFernFilepathToService = intermediateRepresentation.services.http.reduce<Record<string, HttpService[]>>(
        (acc, service) => {
            const tailOfFernFilepath = service.name.fernFilepath[service.name.fernFilepath.length - 1];
            if (tailOfFernFilepath == null) {
                throw new Error("FernFilepath is empty for service " + service.name.name);
            }
            (acc[tailOfFernFilepath] ??= []).push(service);
            return acc;
        },
        {}
    );

    for (const [tailOfFernFilepath, services] of Object.entries(tailOfFernFilepathToService)) {
        for (const service of services) {
            const referenceToServiceClient = ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(
                    file.getReferenceToService(service.name).entityName,
                    ClientConstants.HttpService.SERVICE_NAME
                )
            );

            const publicPropertyName = services.length > 1 ? service.name.name : tailOfFernFilepath;

            const serviceProperty = apiClass.addProperty({
                name: `#${publicPropertyName}`,
                type: getTextOfTsNode(
                    ts.factory.createUnionTypeNode([
                        referenceToServiceClient,
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                    ])
                ),
            });

            apiClass.addGetAccessor({
                name: publicPropertyName,
                returnType: getTextOfTsNode(referenceToServiceClient),
                scope: Scope.Public,
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
}
