import { SingleUnionType } from "@fern-api/api";
import {
    FernWriters,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
    visitorUtils,
} from "@fern-typescript/commons";
import {
    InterfaceDeclaration,
    InterfaceDeclarationStructure,
    OptionalKind,
    SourceFile,
    ts,
    VariableDeclarationKind,
    WriterFunction,
} from "ts-morph";
import { getKeyForUnion } from "./utils";

export interface SingleUnionTypeWithResolvedValueType extends SingleUnionType {
    resolvedValueType: { type: ts.TypeNode; isExtendable: boolean } | undefined;
}

export function generateUnionType({
    file,
    typeName,
    docs,
    discriminant,
    types,
}: {
    file: SourceFile;
    typeName: string;
    docs: string | null | undefined;
    discriminant: string;
    types: SingleUnionTypeWithResolvedValueType[];
}): void {
    const typeAlias = file.addTypeAlias({
        name: typeName,
        type: getWriterForMultiLineUnionType(
            types.map((type) => ({
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

    for (const singleUnionType of types) {
        const interfaceNode = module.addInterface(
            generateDiscriminatedSingleUnionTypeInterface({ discriminant, singleUnionType })
        );

        const { resolvedValueType } = singleUnionType;
        if (resolvedValueType != null) {
            if (resolvedValueType.isExtendable) {
                interfaceNode.addExtends(getTextOfTsNode(resolvedValueType.type));
            } else {
                addNonExtendableProperty(interfaceNode, singleUnionType, resolvedValueType.type);
            }
        }
    }

    const visitorItems: visitorUtils.VisitableItem[] = types.map((type) => {
        const { resolvedValueType } = type;
        return {
            caseInSwitchStatement: ts.factory.createStringLiteral(type.discriminantValue),
            keyInVisitor: type.discriminantValue,
            visitorArgument:
                resolvedValueType != null
                    ? resolvedValueType.isExtendable
                        ? {
                              type: resolvedValueType.type,
                              argument: ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                          }
                        : {
                              type: resolvedValueType.type,
                              argument: ts.factory.createPropertyAccessExpression(
                                  ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                                  ts.factory.createIdentifier(type.discriminantValue)
                              ),
                          }
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
                    types,
                    discriminant,
                    visitorItems,
                }),
            },
        ],
        isExported: true,
    });
}

function generateDiscriminatedSingleUnionTypeInterface({
    discriminant,
    singleUnionType,
}: {
    discriminant: string;
    singleUnionType: SingleUnionType;
}): OptionalKind<InterfaceDeclarationStructure> {
    return {
        name: getKeyForUnion(singleUnionType),
        properties: [
            {
                name: discriminant,
                type: getTextOfTsNode(ts.factory.createStringLiteral(singleUnionType.discriminantValue)),
            },
        ],
    };
}

function addNonExtendableProperty(
    interfaceNode: InterfaceDeclaration,
    singleUnionType: SingleUnionType,
    resolvedValueType: ts.Node
) {
    interfaceNode.addProperty({
        name: singleUnionType.discriminantValue,
        type: getTextOfTsNode(resolvedValueType),
    });
}

function createUtils({
    typeName,
    types,
    visitorItems,
    discriminant,
}: {
    typeName: string;
    types: SingleUnionTypeWithResolvedValueType[];
    visitorItems: readonly visitorUtils.VisitableItem[];
    discriminant: string;
}): WriterFunction {
    const writer = FernWriters.object.writer();

    for (const singleUnionType of types) {
        writer.addProperty({
            key: singleUnionType.discriminantValue,
            value: getTextOfTsNode(generateCreator({ typeName, singleUnionType, discriminant })),
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

    return writer.toFunction();
}

function generateCreator({
    typeName,
    discriminant,
    singleUnionType,
}: {
    typeName: string;
    discriminant: string;
    singleUnionType: SingleUnionTypeWithResolvedValueType;
}): ts.ArrowFunction {
    const VALUE_PARAMETER_NAME = "value";

    const parameterType = singleUnionType.resolvedValueType;
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

    const additionalObjectProperties =
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
                    ...additionalObjectProperties,
                    ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier(discriminant),
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
