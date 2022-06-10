import { SingleUnionType } from "@fern-api/api";
import {
    FernWriters,
    getNamedTypeReference,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
    TypeResolver,
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
import { getKeyForUnion, getResolvedTypeForSingleUnionType, ResolvedSingleUnionType } from "./utils";

export interface SingleUnionTypeWithResolvedValueType {
    originalType: SingleUnionType;
    resolvedType: ResolvedSingleUnionType | undefined;
}

export function generateUnionType({
    file,
    typeName,
    docs,
    discriminant,
    types,
    typeResolver,
    baseDirectory,
    baseDirectoryType,
}: {
    file: SourceFile;
    typeName: string;
    docs: string | null | undefined;
    discriminant: string;
    types: SingleUnionType[];
    typeResolver: TypeResolver;
    baseDirectory: Directory;
    baseDirectoryType: getNamedTypeReference.Args["baseDirectoryType"];
}): void {
    const resolvedTypes: SingleUnionTypeWithResolvedValueType[] = types.map((type) => ({
        originalType: type,
        resolvedType: getResolvedTypeForSingleUnionType({
            singleUnionType: type,
            typeResolver,
            baseDirectory,
            baseDirectoryType,
            file,
        }),
    }));
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

    for (const { resolvedType, originalType } of resolvedTypes) {
        const interfaceNode = module.addInterface(
            generateDiscriminatedSingleUnionTypeInterface({ discriminant, singleUnionType: originalType })
        );

        if (resolvedType != null) {
            if (resolvedType.isExtendable) {
                interfaceNode.addExtends(getTextOfTsNode(resolvedType.type));
            } else {
                addNonExtendableProperty(interfaceNode, originalType, resolvedType.type);
            }
        }
    }

    const visitorItems: visitorUtils.VisitableItem[] = resolvedTypes.map(({ resolvedType, originalType }) => {
        return {
            caseInSwitchStatement: ts.factory.createStringLiteral(originalType.discriminantValue),
            keyInVisitor: originalType.discriminantValue,
            visitorArgument:
                resolvedType != null
                    ? resolvedType.isExtendable
                        ? {
                              type: resolvedType.type,
                              argument: ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                          }
                        : {
                              type: resolvedType.type,
                              argument: ts.factory.createPropertyAccessExpression(
                                  ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                                  ts.factory.createIdentifier(originalType.discriminantValue)
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
                    types: resolvedTypes,
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
    const writer = FernWriters.object.writer({ asConst: true });

    for (const singleUnionType of types) {
        writer.addProperty({
            key: singleUnionType.originalType.discriminantValue,
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
                    types.map(({ originalType }) => ts.factory.createStringLiteral(originalType.discriminantValue))
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
}: {
    typeName: string;
    discriminant: string;
    singleUnionType: SingleUnionTypeWithResolvedValueType;
}): ts.ArrowFunction {
    const VALUE_PARAMETER_NAME = "value";

    const parameterType = singleUnionType.resolvedType;
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
                          ts.factory.createIdentifier(singleUnionType.originalType.discriminantValue),
                          ts.factory.createIdentifier(VALUE_PARAMETER_NAME)
                      ),
                  ]
            : [];

    return ts.factory.createArrowFunction(
        undefined,
        undefined,
        parameter != null ? [parameter] : [],
        getQualifiedUnionTypeReference({ typeName, singleUnionType: singleUnionType.originalType }),
        undefined,
        ts.factory.createParenthesizedExpression(
            ts.factory.createObjectLiteralExpression(
                [
                    ...additionalObjectProperties,
                    ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier(discriminant),
                        ts.factory.createStringLiteral(singleUnionType.originalType.discriminantValue)
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
