import { getTextOfTsKeyword, getTextOfTsNode } from "@fern-typescript/commons";
import { WrapperDeclaration } from "@fern-typescript/commons-v2";
import { DeclarationHandler, File } from "@fern-typescript/declaration-handler";
import { Scope, ts } from "ts-morph";
import { ClientConstants } from "./constants";

export const WrapperDeclarationHandler: DeclarationHandler<WrapperDeclaration> = {
    run: async (wrapperDeclaration, { withFile }) => {
        await withFile((file) => {
            generateWrapper({ wrapper: wrapperDeclaration, file });
        });
    },
};

export function generateWrapper({ wrapper, file }: { wrapper: WrapperDeclaration; file: File }): void {
    const apiModule = file.sourceFile.addModule({
        name: wrapper.name.name,
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

    for (const serviceName of wrapper.wrappedServices) {
        const referenceToServiceClient = ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                file.getReferenceToService(serviceName).entityName,
                ClientConstants.HttpService.SERVICE_NAME
            )
        );

        const publicPropertyName = serviceName.fernFilepath[serviceName.fernFilepath.length - 1];
        if (publicPropertyName == null) {
            throw new Error("FernFilepath is empty for service " + serviceName.name);
        }

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
                                        file.getReferenceToService(serviceName).expression,
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

    for (const wrapped of wrapper.wrappedWrappers) {
        const referenceToWrapped = file.getReferenceToWrapper(wrapped);
        const referenceToWrappedType = ts.factory.createTypeReferenceNode(referenceToWrapped.entityName);

        const publicPropertyName = wrapped.fernFilepath[wrapped.fernFilepath.length - 1];
        if (publicPropertyName == null) {
            throw new Error("FernFilepath is empty for tree node.");
        }

        const serviceProperty = apiClass.addProperty({
            name: `#${publicPropertyName}`,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode([
                    referenceToWrappedType,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                ])
            ),
        });

        apiClass.addGetAccessor({
            name: publicPropertyName,
            returnType: getTextOfTsNode(referenceToWrappedType),
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
                                ts.factory.createNewExpression(referenceToWrapped.expression, undefined, [
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createThis(),
                                        ts.factory.createIdentifier(optionsMember.getName())
                                    ),
                                ])
                            )
                        )
                    )
                ),
            ],
        });
    }
}
