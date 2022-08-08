import { TypeReference } from "@fern-fern/ir-model";
import {
    FernWriters,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
    visitorUtils,
} from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/model-context";
import {
    InterfaceDeclaration,
    InterfaceDeclarationStructure,
    OptionalKind,
    SourceFile,
    ts,
    VariableDeclarationKind,
    WriterFunction,
} from "ts-morph";
import {
    getKeyForUnion,
    ResolvedSingleUnionType,
    ResolvedSingleUnionValueType,
    UNION_TYPE_MODEL_IMPORT_STRATEGY,
} from "./utils";

export declare namespace generateUnionType {
    export interface Args {
        file: SourceFile;
        typeName: string;
        docs: string | null | undefined;
        discriminant: string;
        resolvedTypes: ResolvedSingleUnionType[];
        additionalPropertiesForEveryType?: ObjectProperty[];
        modelContext: ModelContext;
    }

    export interface ObjectProperty {
        key: string;
        valueType: TypeReference;
        generateValueCreator: (args: { file: SourceFile }) => ts.Expression;
    }
}

export function generateUnionType({
    file,
    typeName,
    docs,
    discriminant,
    resolvedTypes,
    additionalPropertiesForEveryType = [],
    modelContext,
}: generateUnionType.Args): void {
    const typeAlias = file.addTypeAlias({
        name: typeName,
        type: getWriterForMultiLineUnionType(
            resolvedTypes.map((type) => ({
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

    for (const resolvedType of resolvedTypes) {
        const interfaceNode = module.addInterface(
            generateDiscriminatedSingleUnionTypeInterface({ discriminant, resolvedType })
        );

        for (const additionalProperty of additionalPropertiesForEveryType) {
            interfaceNode.addProperty({
                name: additionalProperty.key,
                type: getTextOfTsNode(
                    modelContext.getReferenceToType({
                        reference: additionalProperty.valueType,
                        referencedIn: file,
                        importStrategy: UNION_TYPE_MODEL_IMPORT_STRATEGY,
                    })
                ),
            });
        }

        if (resolvedType.valueType != null) {
            if (resolvedType.valueType.isExtendable) {
                interfaceNode.addExtends(getTextOfTsNode(resolvedType.valueType.type));
            } else {
                addNonExtendableProperty({
                    interfaceNode,
                    resolvedSingleUnionType: resolvedType,
                    resolvedValueType: resolvedType.valueType,
                });
            }
        }
    }

    const visitorItems: visitorUtils.VisitableItem[] = resolvedTypes.map((resolvedType) => {
        return {
            caseInSwitchStatement: ts.factory.createStringLiteral(resolvedType.discriminantValue),
            keyInVisitor: resolvedType.discriminantValue,
            visitorArgument:
                resolvedType.valueType != null
                    ? resolvedType.valueType.isExtendable
                        ? {
                              type: resolvedType.valueType.type,
                              argument: ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                          }
                        : {
                              type: resolvedType.valueType.type,
                              argument: ts.factory.createPropertyAccessExpression(
                                  ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                                  ts.factory.createIdentifier(resolvedType.discriminantValue)
                              ),
                          }
                    : undefined,
        };
    });

    module.addInterface(visitorUtils.generateVisitorInterface({ items: visitorItems }));

    file.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: typeName,
                initializer: createUtils({
                    typeName,
                    types: resolvedTypes,
                    discriminant,
                    visitorItems,
                    additionalPropertiesForEveryType,
                    file,
                }),
            },
        ],
        isExported: true,
    });
}

function generateDiscriminatedSingleUnionTypeInterface({
    discriminant,
    resolvedType,
}: {
    discriminant: string;
    resolvedType: ResolvedSingleUnionType;
}): OptionalKind<InterfaceDeclarationStructure> {
    return {
        name: getKeyForUnion(resolvedType),
        properties: [
            {
                name: discriminant,
                type: getTextOfTsNode(ts.factory.createStringLiteral(resolvedType.discriminantValue)),
            },
        ],
    };
}

function addNonExtendableProperty({
    interfaceNode,
    resolvedSingleUnionType,
    resolvedValueType,
}: {
    interfaceNode: InterfaceDeclaration;
    resolvedSingleUnionType: ResolvedSingleUnionType;
    resolvedValueType: ResolvedSingleUnionValueType;
}) {
    interfaceNode.addProperty({
        name: resolvedSingleUnionType.discriminantValue,
        type: getTextOfTsNode(resolvedValueType.type),
    });
}

function createUtils({
    typeName,
    types,
    visitorItems,
    additionalPropertiesForEveryType,
    discriminant,
    file,
}: {
    typeName: string;
    types: ResolvedSingleUnionType[];
    visitorItems: readonly visitorUtils.VisitableItem[];
    additionalPropertiesForEveryType: generateUnionType.ObjectProperty[];
    discriminant: string;
    file: SourceFile;
}): WriterFunction {
    const writer = FernWriters.object.writer({ asConst: true });

    for (const singleUnionType of types) {
        writer.addProperty({
            key: singleUnionType.discriminantValue,
            value: getTextOfTsNode(
                generateCreator({
                    typeName,
                    singleUnionType,
                    discriminant,
                    additionalPropertiesForEveryType,
                    file,
                })
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
                    ts.factory.createIdentifier(discriminant)
                ),
                items: visitorItems,
            })
        ),
    });

    writer.addNewLine();

    writer.addProperty({
        key: "_types",
        value: getTextOfTsNode(
            ts.factory.createArrowFunction(
                undefined,
                undefined,
                [],
                ts.factory.createArrayTypeNode(
                    ts.factory.createIndexedAccessTypeNode(
                        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(typeName), undefined),
                        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(discriminant))
                    )
                ),
                undefined,
                ts.factory.createArrayLiteralExpression(
                    types.map((type) => ts.factory.createStringLiteral(type.discriminantValue))
                )
            )
        ),
    });

    return writer.toFunction();
}

function generateCreator({
    typeName,
    discriminant,
    singleUnionType,
    additionalPropertiesForEveryType,
    file,
}: {
    typeName: string;
    discriminant: string;
    singleUnionType: ResolvedSingleUnionType;
    additionalPropertiesForEveryType: generateUnionType.ObjectProperty[];
    file: SourceFile;
}): ts.ArrowFunction {
    const VALUE_PARAMETER_NAME = "value";

    const parameterType = singleUnionType.valueType;

    const parameter =
        parameterType != null
            ? ts.factory.createParameterDeclaration(
                  undefined,
                  undefined,
                  undefined,
                  VALUE_PARAMETER_NAME,
                  undefined,
                  parameterType.type,
                  undefined
              )
            : undefined;

    const maybeValueAssignment =
        parameterType != null
            ? parameterType.isExtendable
                ? [ts.factory.createSpreadAssignment(ts.factory.createIdentifier(VALUE_PARAMETER_NAME))]
                : [
                      ts.factory.createPropertyAssignment(
                          ts.factory.createIdentifier(singleUnionType.discriminantValue),
                          ts.factory.createIdentifier(VALUE_PARAMETER_NAME)
                      ),
                  ]
            : [];

    return ts.factory.createArrowFunction(
        undefined,
        undefined,
        parameter != null ? [parameter] : [],
        getQualifiedUnionTypeReference({ typeName, singleUnionType }),
        undefined,
        ts.factory.createParenthesizedExpression(
            ts.factory.createObjectLiteralExpression(
                [
                    ...maybeValueAssignment,
                    ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier(discriminant),
                        ts.factory.createStringLiteral(singleUnionType.discriminantValue)
                    ),
                    ...additionalPropertiesForEveryType.map((additionalProperty) =>
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier(additionalProperty.key),
                            additionalProperty.generateValueCreator({ file })
                        )
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
    singleUnionType: ResolvedSingleUnionType;
}) {
    return ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
            ts.factory.createIdentifier(typeName),
            ts.factory.createIdentifier(getKeyForUnion(singleUnionType))
        ),
        undefined
    );
}
