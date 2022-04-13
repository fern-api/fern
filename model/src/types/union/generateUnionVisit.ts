import { TypeDefinition, UnionTypeDefinition } from "@fern/ir-generation";
import { ModuleDeclaration, SourceFile, ts } from "ts-morph";
import { getTextOfTsNode } from "../../utils/getTextOfTsNode";
import { TypeResolver } from "../../utils/TypeResolver";
import { DISCRIMINANT, getBaseTypeForSingleUnionType, visitTypeReference } from "./utils";

const VISITOR_NAME = "Visitor";
const UNKNOWN_KEY = "unknown";

export function generateUnionVisit({
    typeDefinition,
    shape,
    typeResolver,
}: {
    typeDefinition: TypeDefinition;
    shape: UnionTypeDefinition;
    typeResolver: TypeResolver;
}): ts.ArrowFunction {
    const VALUE_PARAMETER_NAME = "value";
    const VISITOR_PARAMETER_NAME = "visitor";
    const RETURN_TYPE_PARAMETER = "R";

    return ts.factory.createArrowFunction(
        undefined,
        [
            ts.factory.createTypeParameterDeclaration(
                ts.factory.createIdentifier(RETURN_TYPE_PARAMETER),
                undefined,
                undefined
            ),
        ],
        [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
                undefined,
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(typeDefinition.name.name), undefined),
                undefined
            ),
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createIdentifier(VISITOR_PARAMETER_NAME),
                undefined,
                ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(typeDefinition.name.name),
                        ts.factory.createIdentifier(VISITOR_NAME)
                    ),
                    [ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(RETURN_TYPE_PARAMETER), undefined)]
                ),
                undefined
            ),
        ],
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(RETURN_TYPE_PARAMETER), undefined),
        undefined,
        ts.factory.createBlock(
            [
                ts.factory.createSwitchStatement(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
                        ts.factory.createIdentifier(DISCRIMINANT)
                    ),
                    ts.factory.createCaseBlock([
                        ...shape.types.map((type) =>
                            ts.factory.createCaseClause(ts.factory.createStringLiteral(type.discriminantValue), [
                                ts.factory.createReturnStatement(
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier(VISITOR_PARAMETER_NAME),
                                            ts.factory.createIdentifier(type.discriminantValue)
                                        ),
                                        undefined,
                                        visitTypeReference<ts.Expression[]>(type.valueType, typeResolver, {
                                            namedObject: () => [ts.factory.createIdentifier(VALUE_PARAMETER_NAME)],
                                            nonObject: () => [
                                                ts.factory.createPropertyAccessExpression(
                                                    ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
                                                    ts.factory.createIdentifier(type.discriminantValue)
                                                ),
                                            ],
                                            void: () => [],
                                        })
                                    )
                                ),
                            ])
                        ),
                        ts.factory.createDefaultClause([
                            ts.factory.createReturnStatement(
                                ts.factory.createCallExpression(
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier(VISITOR_PARAMETER_NAME),
                                        ts.factory.createIdentifier(UNKNOWN_KEY)
                                    ),
                                    undefined,
                                    [ts.factory.createIdentifier(VALUE_PARAMETER_NAME)]
                                )
                            ),
                        ]),
                    ])
                ),
            ],
            true
        )
    );
}

export function addUnionVisitorToNamespace({
    moduleDeclaration,
    shape,
    typeResolver,
    file,
}: {
    moduleDeclaration: ModuleDeclaration;
    shape: UnionTypeDefinition;
    typeResolver: TypeResolver;
    file: SourceFile;
}): void {
    const VALUE_PARAMETER_NAME = "value";
    const RETURN_TYPE_PARAMETER = "R";

    moduleDeclaration.addInterface({
        name: VISITOR_NAME,
        typeParameters: [RETURN_TYPE_PARAMETER],
        properties: [
            ...shape.types.map((type) => {
                const parameterType = getBaseTypeForSingleUnionType({ singleUnionType: type, typeResolver, file });
                return {
                    name: type.discriminantValue,
                    type: getTextOfTsNode(
                        ts.factory.createFunctionTypeNode(
                            undefined,
                            parameterType != null
                                ? [
                                      ts.factory.createParameterDeclaration(
                                          undefined,
                                          undefined,
                                          undefined,
                                          ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
                                          undefined,
                                          parameterType,
                                          undefined
                                      ),
                                  ]
                                : [],
                            ts.factory.createTypeReferenceNode(
                                ts.factory.createIdentifier(RETURN_TYPE_PARAMETER),
                                undefined
                            )
                        )
                    ),
                };
            }),
            {
                name: UNKNOWN_KEY,
                type: getTextOfTsNode(
                    ts.factory.createFunctionTypeNode(
                        undefined,
                        [
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                undefined,
                                ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
                                undefined,
                                ts.factory.createTypeLiteralNode([
                                    ts.factory.createPropertySignature(
                                        undefined,
                                        ts.factory.createIdentifier(DISCRIMINANT),
                                        undefined,
                                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                                    ),
                                ]),
                                undefined
                            ),
                        ],
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createIdentifier(RETURN_TYPE_PARAMETER),
                            undefined
                        )
                    )
                ),
            },
        ],
    });
}
