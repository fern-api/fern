import { getTextOfTsKeyword, getTextOfTsNode } from "@fern-typescript/commons";
import { createPropertyAssignment, WrapperDeclaration } from "@fern-typescript/commons-v2";
import { DeclarationHandler, File } from "@fern-typescript/declaration-handler";
import { Scope, ts } from "ts-morph";
import { ClientConstants } from "./constants";

export const WrapperDeclarationHandler: DeclarationHandler<WrapperDeclaration> = {
    run: async (wrapper, { file }) => {
        generateWrapper({ wrapper, file });
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
        name: "_origin",
        type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
    });

    const authSchemeProperties = file.authSchemes.getProperties();
    optionsInterface.addProperties(authSchemeProperties);

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
        const service = file.getServiceDeclaration(serviceName);

        const referenceToServiceClient = file.getReferenceToService(serviceName, {
            importAlias: `${serviceName.name}${ClientConstants.HttpService.SERVICE_NAME}`,
        });
        const referenceToServiceClientType = ts.factory.createTypeReferenceNode(referenceToServiceClient.entityName);

        const publicPropertyName = serviceName.fernFilepath[serviceName.fernFilepath.length - 1]?.camelCase;
        if (publicPropertyName == null) {
            throw new Error("FernFilepath is empty for service " + serviceName.name);
        }

        const serviceProperty = apiClass.addProperty({
            name: `#${publicPropertyName}`,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode([
                    referenceToServiceClientType,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                ])
            ),
        });

        const referenceToOrigin = ts.factory.createPropertyAccessExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createThis(),
                ts.factory.createIdentifier(optionsMember.getName())
            ),
            originProperty.getName()
        );
        const basePath =
            service.basePath != null
                ? file.externalDependencies.urlJoin.invoke([
                      referenceToOrigin,
                      ts.factory.createStringLiteral(service.basePath),
                  ])
                : referenceToOrigin;

        apiClass.addGetAccessor({
            name: publicPropertyName,
            returnType: getTextOfTsNode(referenceToServiceClientType),
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
                                ts.factory.createNewExpression(referenceToServiceClient.expression, undefined, [
                                    ts.factory.createObjectLiteralExpression(
                                        [
                                            createPropertyAssignment(
                                                ts.factory.createIdentifier(
                                                    ClientConstants.HttpService.ServiceNamespace.Options.Properties
                                                        .BASE_PATH
                                                ),
                                                basePath
                                            ),
                                            ...authSchemeProperties.map(({ name: propertyName }) =>
                                                createPropertyAssignment(
                                                    propertyName,
                                                    ts.factory.createPropertyAccessExpression(
                                                        ts.factory.createPropertyAccessExpression(
                                                            ts.factory.createThis(),
                                                            ts.factory.createIdentifier(optionsMember.getName())
                                                        ),
                                                        propertyName
                                                    )
                                                )
                                            ),
                                        ],
                                        true
                                    ),
                                ])
                            )
                        )
                    )
                ),
            ],
        });
    }

    for (const wrapped of wrapper.wrappedWrappers) {
        const lastFernFilepathPart = wrapped.fernFilepath[wrapped.fernFilepath.length - 1];
        if (lastFernFilepathPart == null) {
            throw new Error("FernFilepath is empty for wrapper.");
        }

        const referenceToWrapped = file.getReferenceToWrapper(wrapped, {
            importAlias: `${lastFernFilepathPart.pascalCase}${wrapped.name}`,
        });
        const referenceToWrappedType = ts.factory.createTypeReferenceNode(referenceToWrapped.entityName);

        const publicPropertyName = lastFernFilepathPart.camelCase;

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
