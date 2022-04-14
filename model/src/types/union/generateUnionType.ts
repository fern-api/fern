import { SingleUnionType, TypeDefinition, UnionTypeDefinition } from "@fern/ir-generation";
import { FernWriters } from "@fern/typescript-commons";
import {
    Directory,
    InterfaceDeclaration,
    ModuleDeclaration,
    SourceFile,
    ts,
    VariableDeclarationKind,
    WriterFunction,
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
    modelDirectory,
}: {
    file: SourceFile;
    typeDefinition: TypeDefinition;
    shape: UnionTypeDefinition;
    typeResolver: TypeResolver;
    modelDirectory: Directory;
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
            modelDirectory,
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
    addUnionVisitorToNamespace({
        moduleDeclaration: module,
        shape,
        typeResolver,
        file,
        modelDirectory,
    });

    file.addVariableStatement({
        declarations: [
            {
                name: typeDefinition.name.name,
                initializer: createUtils({
                    typeDefinition,
                    shape,
                    typeResolver,
                    file,
                    modelDirectory,
                }),
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
        isExported: true,
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
    modelDirectory,
}: {
    typeDefinition: TypeDefinition;
    shape: UnionTypeDefinition;
    typeResolver: TypeResolver;
    file: SourceFile;
    modelDirectory: Directory;
}): WriterFunction {
    const writer = FernWriters.object.writer();

    for (const type of shape.types) {
        writer.addProperty({
            key: type.discriminantValue,
            value: getTextOfTsNode(generateCreator({ typeDefinition, type, typeResolver, file, modelDirectory })),
        });
        writer.addProperty({
            key: `is${getKeyForUnion(type)}`,
            value: getTextOfTsNode(generatePredicate(typeDefinition, type)),
        });
        writer.addNewLine();
    }

    writer.addProperty({
        key: "visit",
        value: getTextOfTsNode(generateUnionVisit({ typeDefinition, shape, typeResolver })),
    });

    return writer.toFunction();
}

function generateCreator({
    typeDefinition,
    type,
    typeResolver,
    file,
    modelDirectory,
}: {
    typeDefinition: TypeDefinition;
    type: SingleUnionType;
    typeResolver: TypeResolver;
    file: SourceFile;
    modelDirectory: Directory;
}): ts.ArrowFunction {
    const VALUE_PARAMETER_NAME = "value";

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
                        VALUE_PARAMETER_NAME,
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
                            ts.factory.createSpreadAssignment(ts.factory.createIdentifier(VALUE_PARAMETER_NAME)),
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
                        generateTypeReference({ reference: type.valueType, from: file, modelDirectory }),
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
