import { SingleUnionType, UnionTypeDefinition } from "@fern-api/api";
import {
    FernWriters,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
    visitorUtils,
} from "@fern-typescript/commons";
import {
    Directory,
    InterfaceDeclaration,
    InterfaceDeclarationStructure,
    OptionalKind,
    SourceFile,
    ts,
    VariableDeclarationKind,
    WriterFunction,
} from "ts-morph";
import { TypeResolver } from "../../utils/TypeResolver";
import { getBaseTypeForSingleUnionType, getKeyForUnion, visitResolvedTypeReference } from "./utils";

export function generateUnionType({
    file,
    typeName,
    docs,
    unionTypeDefinition,
    typeResolver,
    modelDirectory,
}: {
    file: SourceFile;
    typeName: string;
    docs: string | null | undefined;
    unionTypeDefinition: UnionTypeDefinition;
    typeResolver: TypeResolver;
    modelDirectory: Directory;
}): void {
    const typeAlias = file.addTypeAlias({
        name: typeName,
        type: getWriterForMultiLineUnionType(
            unionTypeDefinition.types.map((type) => ({
                node: ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(typeName),
                        ts.factory.createIdentifier(getKeyForUnion(type))
                    ),
                    undefined
                ),
                docs: type.docs,
            }))
        ),
        isExported: true,
    });
    maybeAddDocs(typeAlias, docs);

    const module = file.addModule({
        name: typeName,
        isExported: true,
        hasDeclareKeyword: true,
    });

    for (const singleUnionType of unionTypeDefinition.types) {
        const interfaceNode = module.addInterface(
            generateDiscriminatedSingleUnionTypeInterface({ unionTypeDefinition, singleUnionType })
        );

        const baseType = getBaseTypeForSingleUnionType({
            singleUnionType,
            typeResolver,
            file,
            modelDirectory,
        });
        if (baseType != null) {
            visitResolvedTypeReference(singleUnionType.valueType, typeResolver, {
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

    const visitorItems: visitorUtils.VisitableItem[] = unionTypeDefinition.types.map((type) => {
        const baseType = getBaseTypeForSingleUnionType({
            singleUnionType: type,
            typeResolver,
            file,
            modelDirectory,
        });

        return {
            caseInSwitchStatement: ts.factory.createStringLiteral(type.discriminantValue),
            keyInVisitor: type.discriminantValue,
            visitorArgument:
                baseType != null
                    ? visitResolvedTypeReference<visitorUtils.VisitorArgument | undefined>(
                          type.valueType,
                          typeResolver,
                          {
                              namedObject: () => ({
                                  type: baseType,
                                  argument: ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                              }),
                              nonObject: () => ({
                                  type: baseType,
                                  argument: ts.factory.createPropertyAccessExpression(
                                      ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                                      ts.factory.createIdentifier(type.discriminantValue)
                                  ),
                              }),
                              void: () => undefined,
                          }
                      )
                    : undefined,
        };
    });

    module.addInterface(visitorUtils.generateVisitorInterface(visitorItems));

    file.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: typeName,
                initializer: createUtils({
                    typeName,
                    unionTypeDefinition,
                    typeResolver,
                    file,
                    modelDirectory,
                    visitorItems,
                }),
            },
        ],
        isExported: true,
    });
}

function generateDiscriminatedSingleUnionTypeInterface({
    unionTypeDefinition,
    singleUnionType,
}: {
    unionTypeDefinition: UnionTypeDefinition;
    singleUnionType: SingleUnionType;
}): OptionalKind<InterfaceDeclarationStructure> {
    return {
        name: getKeyForUnion(singleUnionType),
        properties: [
            {
                name: unionTypeDefinition.discriminant,
                type: getTextOfTsNode(ts.factory.createStringLiteral(singleUnionType.discriminantValue)),
            },
        ],
    };
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
    typeName,
    unionTypeDefinition,
    typeResolver,
    file,
    modelDirectory,
    visitorItems,
}: {
    typeName: string;
    unionTypeDefinition: UnionTypeDefinition;
    typeResolver: TypeResolver;
    file: SourceFile;
    modelDirectory: Directory;
    visitorItems: readonly visitorUtils.VisitableItem[];
}): WriterFunction {
    const writer = FernWriters.object.writer();

    for (const singleUnionType of unionTypeDefinition.types) {
        writer.addProperty({
            key: singleUnionType.discriminantValue,
            value: getTextOfTsNode(
                generateCreator({ typeName, unionTypeDefinition, singleUnionType, typeResolver, file, modelDirectory })
            ),
        });
        writer.addNewLine();
    }

    writer.addProperty({
        key: visitorUtils.VISIT_PROPERTY_NAME,
        value: getTextOfTsNode(
            visitorUtils.generateVisitMethod({
                typeName,
                switchOn: ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                    ts.factory.createIdentifier(unionTypeDefinition.discriminant)
                ),
                items: visitorItems,
            })
        ),
    });

    return writer.toFunction();
}

function generateCreator({
    typeName,
    unionTypeDefinition,
    singleUnionType,
    typeResolver,
    file,
    modelDirectory,
}: {
    typeName: string;
    unionTypeDefinition: UnionTypeDefinition;
    singleUnionType: SingleUnionType;
    typeResolver: TypeResolver;
    file: SourceFile;
    modelDirectory: Directory;
}): ts.ArrowFunction {
    const VALUE_PARAMETER_NAME = "value";

    const parameterType = getBaseTypeForSingleUnionType({
        singleUnionType,
        typeResolver,
        file,
        modelDirectory,
    });
    const parameter =
        parameterType != null
            ? ts.factory.createParameterDeclaration(
                  undefined,
                  undefined,
                  undefined,
                  VALUE_PARAMETER_NAME,
                  undefined,
                  parameterType,
                  undefined
              )
            : undefined;

    const additionalObjectProperties: ts.ObjectLiteralElementLike[] = visitResolvedTypeReference<
        ts.ObjectLiteralElementLike[]
    >(singleUnionType.valueType, typeResolver, {
        namedObject: () => [ts.factory.createSpreadAssignment(ts.factory.createIdentifier(VALUE_PARAMETER_NAME))],
        nonObject: () => [
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(singleUnionType.discriminantValue),
                ts.factory.createIdentifier(VALUE_PARAMETER_NAME)
            ),
        ],
        void: () => [],
    });

    return ts.factory.createArrowFunction(
        undefined,
        undefined,
        parameter != null ? [parameter] : [],
        getQualifiedUnionTypeReference({ typeName, singleUnionType }),
        undefined,
        ts.factory.createParenthesizedExpression(
            ts.factory.createObjectLiteralExpression(
                [
                    ...additionalObjectProperties,
                    ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier(unionTypeDefinition.discriminant),
                        ts.factory.createStringLiteral(singleUnionType.discriminantValue)
                    ),
                ],
                true
            )
        )
    );
}

function getQualifiedUnionTypeReference({
    typeName,
    singleUnionType,
}: {
    typeName: string;
    singleUnionType: SingleUnionType;
}) {
    return ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
            ts.factory.createIdentifier(typeName),
            ts.factory.createIdentifier(getKeyForUnion(singleUnionType))
        ),
        undefined
    );
}
