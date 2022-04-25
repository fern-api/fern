import { EnumTypeDefinition } from "@fern-api/api";
import { getTextOfTsNode } from "@fern-api/typescript-commons";
import { InterfaceDeclarationStructure, OptionalKind, ts } from "ts-morph";
import {
    UNKNOWN_PROPERY_NAME,
    VISITOR_INTERFACE_NAME,
    VISITOR_PARAMETER_NAME,
    VISITOR_RESULT_TYPE_PARAMETER,
} from "../constants";
import { getKeyForEnum } from "./utils";

export function generateVisitMethod({
    typeName,
    shape,
}: {
    typeName: string;
    shape: EnumTypeDefinition;
}): ts.ArrowFunction {
    const VALUE_PARAMETER_NAME = "value";

    return ts.factory.createArrowFunction(
        undefined,
        [ts.factory.createTypeParameterDeclaration(VISITOR_RESULT_TYPE_PARAMETER)],
        [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                VALUE_PARAMETER_NAME,
                undefined,
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(typeName), undefined)
            ),
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                VISITOR_PARAMETER_NAME,
                undefined,
                ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(typeName),
                        ts.factory.createIdentifier(VISITOR_INTERFACE_NAME)
                    ),
                    [
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createIdentifier(VISITOR_RESULT_TYPE_PARAMETER),
                            undefined
                        ),
                    ]
                )
            ),
        ],
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(VISITOR_RESULT_TYPE_PARAMETER), undefined),
        undefined,
        ts.factory.createBlock(
            [
                ts.factory.createSwitchStatement(
                    ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
                    ts.factory.createCaseBlock([
                        ...shape.values.map((value) =>
                            ts.factory.createCaseClause(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(typeName),
                                    ts.factory.createIdentifier(getKeyForEnum(value))
                                ),
                                [
                                    ts.factory.createReturnStatement(
                                        ts.factory.createCallExpression(
                                            ts.factory.createPropertyAccessExpression(
                                                ts.factory.createIdentifier(VISITOR_PARAMETER_NAME),
                                                ts.factory.createIdentifier(getKeyForEnum(value))
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
                                        ts.factory.createIdentifier(UNKNOWN_PROPERY_NAME)
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

export function generateVisitorInterface({
    shape,
}: {
    shape: EnumTypeDefinition;
}): OptionalKind<InterfaceDeclarationStructure> {
    const VALUE_PARAMETER_NAME = "value";
    const RETURN_TYPE_PARAMETER = "R";

    return {
        name: VISITOR_INTERFACE_NAME,
        typeParameters: [RETURN_TYPE_PARAMETER],
        isExported: true,
        properties: [
            ...shape.values.map((value) => ({
                name: getKeyForEnum(value),
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
                name: UNKNOWN_PROPERY_NAME,
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
    };
}
