import { SingleUnionType, TypeDefinition, UnionTypeDefinition } from "@fern/ir-generation";
import {
    InterfaceDeclaration,
    ModuleDeclaration,
    SourceFile,
    ts,
    VariableDeclarationKind,
    WriterFunctionOrValue,
    Writers,
} from "ts-morph";
import { generateTypeReference } from "../../utils/generateTypeReference";
import { getTextOfTsNode } from "../../utils/getTextOfTsNode";
import { getWriterForMultiLineUnionType } from "../../utils/getWriterForMultiLineUnionType";
import { maybeAddDocs } from "../../utils/maybeAddDocs";
import { TypeResolver } from "../../utils/TypeResolver";
import { addUnionVisitorToNamespace, generateUnionVisit } from "./generateUnionVisit";
import { DISCRIMINANT, getBaseTypeForSingleUnionType, getKeyForUnion, visitTypeReference } from "./utils";

export function generateUnionType({
    file,
    typeDefinition,
    shape,
    typeResolver,
}: {
    file: SourceFile;
    typeDefinition: TypeDefinition;
    shape: UnionTypeDefinition;
    typeResolver: TypeResolver;
}): void {
    const typeAlias = file.addTypeAlias({
        name: typeDefinition.name.name,
        type: getWriterForMultiLineUnionType(
            shape.types.map((type) => ({
                node: ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(typeDefinition.name.name),
                        ts.factory.createIdentifier(getKeyForUnion(type))
                    ),
                    undefined
                ),
                docs: type.docs,
            }))
        ),
        isExported: true,
    });
    maybeAddDocs(typeAlias, typeDefinition.docs);

    const module = file.addModule({
        name: typeDefinition.name.name,
        isExported: true,
        hasDeclareKeyword: true,
    });
    for (const singleUnionType of shape.types) {
        const interfaceNode = addDiscriminatedSingleUnionTypeInterface(module, singleUnionType);
        const baseType = getBaseTypeForSingleUnionType({
            singleUnionType,
            typeResolver,
            file,
        });
        if (baseType != null) {
            visitTypeReference(singleUnionType.valueType, typeResolver, {
                namedObject: () => {
                    interfaceNode.addExtends(getTextOfTsNode(baseType));
                },
                nonObject: () => {
                    addNonExtendableProperty(interfaceNode, singleUnionType, baseType);
                },
                void: () => {
                    /* noop */
                },
            });
        }
    }
    addUnionVisitorToNamespace({ moduleDeclaration: module, shape, typeResolver, file });

    file.addVariableStatement({
        declarations: [
            {
                name: typeDefinition.name.name,
                initializer: Writers.object(createUtils({ typeDefinition, shape, typeResolver, file })),
            },
        ],
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
    });
}

function addDiscriminatedSingleUnionTypeInterface(
    module: ModuleDeclaration,
    singleUnionType: SingleUnionType
): InterfaceDeclaration {
    return module.addInterface({
        name: getKeyForUnion(singleUnionType),
        properties: [
            {
                name: DISCRIMINANT,
                type: getTextOfTsNode(ts.factory.createStringLiteral(singleUnionType.discriminantValue)),
            },
        ],
    });
}

function addNonExtendableProperty(
    interfaceNode: InterfaceDeclaration,
    singleUnionType: SingleUnionType,
    baseType: ts.Node
) {
    interfaceNode.addProperty({
        name: singleUnionType.discriminantValue,
        type: getTextOfTsNode(baseType),
    });
}

function createUtils({
    typeDefinition,
    shape,
    typeResolver,
    file,
}: {
    typeDefinition: TypeDefinition;
    shape: UnionTypeDefinition;
    typeResolver: TypeResolver;
    file: SourceFile;
}): Record<string, WriterFunctionOrValue> {
    const properties: Record<string, WriterFunctionOrValue> = {};

    for (const type of shape.types) {
        properties[type.discriminantValue] = getTextOfTsNode(
            generateCreator({ typeDefinition, type, typeResolver, file })
        );
        properties[`is${getKeyForUnion(type)}`] = getTextOfTsNode(generatePredicate(typeDefinition, type));
    }

    properties.visit = getTextOfTsNode(generateUnionVisit({ typeDefinition, shape, typeResolver }));

    return properties;
}

function generateCreator({
    typeDefinition,
    type,
    typeResolver,
    file,
}: {
    typeDefinition: TypeDefinition;
    type: SingleUnionType;
    typeResolver: TypeResolver;
    file: SourceFile;
}): ts.ArrowFunction {
    return visitTypeReference(type.valueType, typeResolver, {
        namedObject: () =>
            ts.factory.createArrowFunction(
                undefined,
                undefined,
                [
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        ts.factory.createIdentifier(type.discriminantValue),
                        undefined,
                        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Omit"), [
                            getQualifiedUnionTypeReference(typeDefinition, type),
                            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(DISCRIMINANT)),
                        ]),
                        undefined
                    ),
                ],
                getQualifiedUnionTypeReference(typeDefinition, type),
                undefined,
                ts.factory.createParenthesizedExpression(
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createSpreadAssignment(ts.factory.createIdentifier(type.discriminantValue)),
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier(DISCRIMINANT),
                                ts.factory.createStringLiteral(type.discriminantValue)
                            ),
                        ],
                        true
                    )
                )
            ),
        nonObject: () =>
            ts.factory.createArrowFunction(
                undefined,
                undefined,
                [
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        ts.factory.createIdentifier(type.discriminantValue),
                        undefined,
                        generateTypeReference(type.valueType, file),
                        undefined
                    ),
                ],
                getQualifiedUnionTypeReference(typeDefinition, type),
                undefined,
                ts.factory.createParenthesizedExpression(
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createShorthandPropertyAssignment(
                                ts.factory.createIdentifier(type.discriminantValue),
                                undefined
                            ),
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier(DISCRIMINANT),
                                ts.factory.createStringLiteral(type.discriminantValue)
                            ),
                        ],
                        true
                    )
                )
            ),
        void: () =>
            ts.factory.createArrowFunction(
                undefined,
                undefined,
                [],
                getQualifiedUnionTypeReference(typeDefinition, type),
                undefined,
                ts.factory.createParenthesizedExpression(
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier(DISCRIMINANT),
                                ts.factory.createStringLiteral(type.discriminantValue)
                            ),
                        ],
                        true
                    )
                )
            ),
    });
}

function generatePredicate(typeDefinition: TypeDefinition, type: SingleUnionType): ts.Node {
    const PARAMETER = "value";

    return ts.factory.createArrowFunction(
        undefined,
        undefined,
        [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createIdentifier(PARAMETER),
                undefined,
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(typeDefinition.name.name), undefined),
                undefined
            ),
        ],
        ts.factory.createTypePredicateNode(undefined, PARAMETER, getQualifiedUnionTypeReference(typeDefinition, type)),
        undefined,
        ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(PARAMETER),
                ts.factory.createIdentifier(DISCRIMINANT)
            ),
            ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
            ts.factory.createStringLiteral(type.discriminantValue)
        )
    );
}

function getQualifiedUnionTypeReference(typeDefinition: TypeDefinition, singleUnionType: SingleUnionType) {
    return ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
            ts.factory.createIdentifier(typeDefinition.name.name),
            ts.factory.createIdentifier(getKeyForUnion(singleUnionType))
        ),
        undefined
    );
}
