import { EnumTypeDefinition, TypeDefinition } from "@fern/ir-generation";
import { ModuleDeclaration, ts } from "ts-morph";
import { getTextOfTsNode } from "../../utils/getTextOfTsNode";
import { getKeyForEnum } from "./utils";

const VISITOR_NAME = "Visitor";
const UNKNOWN_KEY = "unknown";

export function generateEnumVisit(typeDefinition: TypeDefinition, shape: EnumTypeDefinition): ts.ArrowFunction {
    const VALUE_PARAMETER_NAME = "value";
    const VISITOR_PARAMETER_NAME = "visitor";
    const RETURN_TYPE_PARAMETER = "R";

    return ts.factory.createArrowFunction(
        undefined,
        [ts.factory.createTypeParameterDeclaration(RETURN_TYPE_PARAMETER)],
        [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                VALUE_PARAMETER_NAME,
                undefined,
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(typeDefinition.name.name), undefined)
            ),
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                VISITOR_PARAMETER_NAME,
                undefined,
                ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(typeDefinition.name.name),
                        ts.factory.createIdentifier(VISITOR_NAME)
                    ),
                    [ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(RETURN_TYPE_PARAMETER), undefined)]
                )
            ),
        ],
        undefined,
        undefined,
        ts.factory.createBlock(
            [
                ts.factory.createSwitchStatement(
                    ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
                    ts.factory.createCaseBlock([
                        ...shape.values.map((value) =>
                            ts.factory.createCaseClause(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(typeDefinition.name.name),
                                    ts.factory.createIdentifier(getKeyForEnum(value))
                                ),
                                [
                                    ts.factory.createReturnStatement(
                                        ts.factory.createCallExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier(VISITOR_PARAMETER_NAME),
                                                ts.factory.createIdentifier(value.value)
                                            ),
                                            undefined,
                                            []
                                        )
                                    ),
                                ]
                            )
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

export function addEnumVisitorToNamespace(moduleDeclaration: ModuleDeclaration, shape: EnumTypeDefinition): void {
    const RETURN_TYPE_PARAMETER = "R";

    moduleDeclaration.addInterface({
        name: VISITOR_NAME,
        typeParameters: [RETURN_TYPE_PARAMETER],
        properties: [
            ...shape.values.map((value) => ({
                name: value.value,
                type: getTextOfTsNode(
                    ts.factory.createFunctionTypeNode(
                        undefined,
                        [],
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createIdentifier(RETURN_TYPE_PARAMETER),
                            undefined
                        )
                    )
                ),
            })),
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
                                ts.factory.createIdentifier(RETURN_TYPE_PARAMETER),
                                undefined,
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
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
