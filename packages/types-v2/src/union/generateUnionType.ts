import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import {
    SingleUnionType,
    SingleUnionTypeProperties,
    SingleUnionTypeProperty,
    TypeReference,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import {
    FernWriters,
    getTextOfTsNode,
    getWriterForMultiLineUnionType,
    maybeAddDocs,
    visitorUtils,
} from "@fern-typescript/commons";
import { createPropertyAssignment } from "@fern-typescript/commons-v2";
import { File } from "@fern-typescript/declaration-handler";
import { InterfaceDeclarationStructure, OptionalKind, ts, VariableDeclarationKind, WriterFunction } from "ts-morph";
import { getKeyForUnion } from "./utils";

export declare namespace generateUnionType {
    export interface Args {
        file: File;
        typeName: string;
        docs: string | null | undefined;
        union: UnionTypeDeclaration;
    }
}

export function generateUnionType({ file, typeName, docs, union }: generateUnionType.Args): void {
    const typeAlias = file.sourceFile.addTypeAlias({
        name: typeName,
        type: getWriterForMultiLineUnionType(
            union.types.map((type) => ({
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

    const module = file.sourceFile.addModule({
        name: typeName,
        isExported: true,
        hasDeclareKeyword: true,
    });

    const visitorItems: visitorUtils.VisitableItems = {
        items: [],
        unknownArgument: undefined,
    };

    for (const singleUnionType of union.types) {
        const interfaceNode = module.addInterface(
            generateDiscriminatedSingleUnionTypeInterface({ discriminant: union.discriminantV2, singleUnionType })
        );

        const addVisitorItem = (visitorArgument: visitorUtils.Argument | undefined) => {
            visitorItems.items.push({
                caseInSwitchStatement: ts.factory.createStringLiteral(singleUnionType.discriminantValue.wireValue),
                keyInVisitor: singleUnionType.discriminantValue.camelCase,
                visitorArgument,
            });
        };

        SingleUnionTypeProperties._visit(singleUnionType.shape, {
            noProperties: () => {
                addVisitorItem(undefined);
            },
            samePropertiesAsObject: (typeName) => {
                const typeNode = file.getReferenceToType(TypeReference.named(typeName)).typeNode;
                interfaceNode.addExtends(getTextOfTsNode(typeNode));
                addVisitorItem({
                    type: typeNode,
                    argument: ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                });
            },
            singleProperty: (singleProperty) => {
                const propertyName = getPropertyNameForSingleProperty(singleUnionType, singleProperty);
                const type = file.getReferenceToType(singleProperty.type);
                interfaceNode.addProperty({
                    name: propertyName,
                    type: getTextOfTsNode(type.isOptional ? type.typeNodeWithoutUndefined : type.typeNode),
                    hasQuestionToken: type.isOptional,
                });
                addVisitorItem({
                    type: type.typeNode,
                    argument: ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                        ts.factory.createIdentifier(propertyName)
                    ),
                });
            },
            _unknown: () => {
                throw new Error("Unknown SingleUnionTypeProperties type: " + singleUnionType.shape._type);
            },
        });
    }

    module.addInterface(visitorUtils.generateVisitorInterface({ items: visitorItems }));

    file.sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: typeName,
                initializer: createUtils({
                    typeName,
                    union,
                    discriminant: union.discriminantV2,
                    visitorItems,
                    file,
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
    discriminant: WireStringWithAllCasings;
    singleUnionType: SingleUnionType;
}): OptionalKind<InterfaceDeclarationStructure> {
    return {
        name: getKeyForUnion(singleUnionType),
        properties: [
            {
                name: discriminant.wireValue,
                type: getTextOfTsNode(ts.factory.createStringLiteral(singleUnionType.discriminantValue.wireValue)),
            },
        ],
    };
}

function createUtils({
    typeName,
    union,
    visitorItems,
    discriminant,
    file,
}: {
    typeName: string;
    union: UnionTypeDeclaration;
    visitorItems: visitorUtils.VisitableItems;
    discriminant: WireStringWithAllCasings;
    file: File;
}): WriterFunction {
    const writer = FernWriters.object.writer({ asConst: true });

    for (const singleUnionType of union.types) {
        writer.addProperty({
            key: singleUnionType.discriminantValue.camelCase,
            value: getTextOfTsNode(
                generateCreator({
                    typeName,
                    singleUnionType,
                    discriminant,
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
                    ts.factory.createIdentifier(discriminant.wireValue)
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
                        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(discriminant.wireValue))
                    )
                ),
                undefined,
                ts.factory.createArrayLiteralExpression(
                    union.types.map((type) => ts.factory.createStringLiteral(type.discriminantValue.wireValue))
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
    file,
}: {
    typeName: string;
    discriminant: WireStringWithAllCasings;
    singleUnionType: SingleUnionType;
    file: File;
}): ts.ArrowFunction {
    const VALUE_PARAMETER_NAME = "value";

    const parameterType = SingleUnionTypeProperties._visit(singleUnionType.shape, {
        noProperties: () => undefined,
        samePropertiesAsObject: (typeName) => file.getReferenceToType(TypeReference.named(typeName)),
        singleProperty: (singleProperty) => file.getReferenceToType(singleProperty.type),
        _unknown: () => {
            throw new Error("Unknown SingleUnionTypeProperties: " + singleUnionType.shape._type);
        },
    });

    const parameter =
        parameterType != null
            ? ts.factory.createParameterDeclaration(
                  undefined,
                  undefined,
                  undefined,
                  VALUE_PARAMETER_NAME,
                  parameterType.isOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                  parameterType.isOptional ? parameterType.typeNodeWithoutUndefined : parameterType.typeNode,
                  undefined
              )
            : undefined;

    const maybeValueAssignment = SingleUnionTypeProperties._visit(singleUnionType.shape, {
        noProperties: () => [],
        samePropertiesAsObject: () => [
            ts.factory.createSpreadAssignment(ts.factory.createIdentifier(VALUE_PARAMETER_NAME)),
        ],
        singleProperty: (singleProperty) => [
            createPropertyAssignment(
                ts.factory.createIdentifier(getPropertyNameForSingleProperty(singleUnionType, singleProperty)),
                ts.factory.createIdentifier(VALUE_PARAMETER_NAME)
            ),
        ],
        _unknown: () => {
            throw new Error("Unknown SingleUnionTypeProperties: " + singleUnionType.shape._type);
        },
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
                    ...maybeValueAssignment,
                    createPropertyAssignment(
                        ts.factory.createIdentifier(discriminant.wireValue),
                        ts.factory.createStringLiteral(singleUnionType.discriminantValue.wireValue)
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

function getPropertyNameForSingleProperty(
    singleUnionType: SingleUnionType,
    _property: SingleUnionTypeProperty
): string {
    // TODO change this to _property.name.wireValue when we're ready to break the wire
    return singleUnionType.discriminantValue.wireValue;
}
