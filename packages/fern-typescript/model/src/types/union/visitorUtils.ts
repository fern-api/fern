import { TypeDefinition, UnionTypeDefinition } from "@fern-api/api";
import { getTextOfTsNode } from "@fern-api/typescript-commons";
import { Directory, InterfaceDeclarationStructure, OptionalKind, SourceFile, ts } from "ts-morph";
import { TypeResolver } from "../../utils/TypeResolver";
import {
    UNKNOWN_PROPERY_NAME,
    VISITOR_INTERFACE_NAME,
    VISITOR_PARAMETER_NAME,
    VISITOR_RESULT_TYPE_PARAMETER,
} from "../constants";
import { getBaseTypeForSingleUnionType, visitResolvedTypeReference } from "./utils";

export function generateVisitMethod({
    typeDefinition,
    shape,
    typeResolver,
}: {
    typeDefinition: TypeDefinition;
    shape: UnionTypeDefinition;
    typeResolver: TypeResolver;
}): ts.ArrowFunction {
    const VALUE_PARAMETER_NAME = "value";

    return ts.factory.createArrowFunction(
        undefined,
        [
            ts.factory.createTypeParameterDeclaration(
                ts.factory.createIdentifier(VISITOR_RESULT_TYPE_PARAMETER),
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
                        ts.factory.createIdentifier(VISITOR_INTERFACE_NAME)
                    ),
                    [
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createIdentifier(VISITOR_RESULT_TYPE_PARAMETER),
                            undefined
                        ),
                    ]
                ),
                undefined
            ),
        ],
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(VISITOR_RESULT_TYPE_PARAMETER), undefined),
        undefined,
        ts.factory.createBlock(
            [
                ts.factory.createSwitchStatement(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
                        ts.factory.createIdentifier(shape.discriminant)
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
                                        visitResolvedTypeReference<ts.Expression[]>(type.valueType, typeResolver, {
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
    typeResolver,
    file,
    modelDirectory,
}: {
    shape: UnionTypeDefinition;
    typeResolver: TypeResolver;
    file: SourceFile;
    modelDirectory: Directory;
}): OptionalKind<InterfaceDeclarationStructure> {
    const VALUE_PARAMETER_NAME = "value";
    const RETURN_TYPE_PARAMETER = "R";

    return {
        name: VISITOR_INTERFACE_NAME,
        isExported: true,
        typeParameters: [RETURN_TYPE_PARAMETER],
        properties: [
            ...shape.types.map((type) => {
                const parameterType = getBaseTypeForSingleUnionType({
                    singleUnionType: type,
                    typeResolver,
                    file,
                    modelDirectory,
                });
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
                                ts.factory.createTypeLiteralNode([
                                    ts.factory.createPropertySignature(
                                        undefined,
                                        ts.factory.createIdentifier(shape.discriminant),
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
    };
}
