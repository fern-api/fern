import { FileUploadRequestProperty } from "@fern-fern/ir-model/http";
import { ContainerType, Type, TypeReference } from "@fern-fern/ir-model/types";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { FileUploadRequestParameter } from "../../request-parameter/FileUploadRequestParameter";
import { getParameterNameForFile } from "./getParameterNameForFile";

export function appendPropertyToFormData({
    property,
    context,
    referenceToFormData,
    requestParameter,
}: {
    property: FileUploadRequestProperty;
    context: SdkContext;
    referenceToFormData: ts.Expression;
    requestParameter: FileUploadRequestParameter | undefined;
}): ts.Statement {
    return FileUploadRequestProperty._visit(property, {
        file: (property) => {
            let statement = context.externalDependencies.formData.append({
                referencetoFormData: referenceToFormData,
                key: property.key.wireValue,
                value: ts.factory.createIdentifier(getParameterNameForFile(property)),
            });

            if (property.isOptional) {
                statement = ts.factory.createIfStatement(
                    ts.factory.createBinaryExpression(
                        ts.factory.createIdentifier(getParameterNameForFile(property)),
                        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                        ts.factory.createNull()
                    ),
                    ts.factory.createBlock([statement], true)
                );
            }

            return statement;
        },
        bodyProperty: (property) => {
            if (requestParameter == null) {
                throw new Error("Cannot append body property to form data because requestParameter is not defined.");
            }
            const FOR_LOOP_ITEM_VARIABLE_NAME = "_item";

            const referenceToBodyProperty = requestParameter.getReferenceToBodyProperty(property, context);

            let statement: ts.Statement;

            if (isMaybeIterable(property.valueType, context)) {
                statement = ts.factory.createForOfStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier(FOR_LOOP_ITEM_VARIABLE_NAME),
                                undefined,
                                undefined,
                                undefined
                            ),
                        ],
                        ts.NodeFlags.Const
                    ),
                    referenceToBodyProperty,
                    ts.factory.createBlock(
                        [
                            context.externalDependencies.formData.append({
                                referencetoFormData: referenceToFormData,
                                key: property.name.wireValue,
                                value: stringifyIterableItemType(
                                    ts.factory.createIdentifier(FOR_LOOP_ITEM_VARIABLE_NAME),
                                    property.valueType,
                                    context
                                ),
                            }),
                        ],
                        true
                    )
                );

                if (!isDefinitelyIterable(property.valueType, context)) {
                    const conditions: ts.Expression[] = [];
                    if (isMaybeList(property.valueType, context)) {
                        conditions.push(
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("Array"),
                                    ts.factory.createIdentifier("isArray")
                                ),
                                undefined,
                                [referenceToBodyProperty]
                            )
                        );
                    }
                    if (isMaybeSet(property.valueType, context)) {
                        conditions.push(
                            ts.factory.createBinaryExpression(
                                referenceToBodyProperty,
                                ts.factory.createToken(ts.SyntaxKind.InstanceOfKeyword),
                                ts.factory.createIdentifier("Set")
                            )
                        );
                    }
                    const condition = conditions.reduce((a, b) =>
                        ts.factory.createBinaryExpression(a, ts.factory.createToken(ts.SyntaxKind.BarBarToken), b)
                    );
                    statement = ts.factory.createIfStatement(condition, statement);
                }
            } else {
                statement = context.externalDependencies.formData.append({
                    referencetoFormData: referenceToFormData,
                    key: property.name.wireValue,
                    value: context.type.stringify(referenceToBodyProperty, property.valueType, {
                        includeNullCheckIfOptional: false,
                    }),
                });
            }

            if (context.type.getReferenceToType(property.valueType).isOptional) {
                statement = ts.factory.createIfStatement(
                    ts.factory.createBinaryExpression(
                        referenceToBodyProperty,
                        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                        ts.factory.createNull()
                    ),
                    ts.factory.createBlock([statement], true)
                );
            }

            return statement;
        },
        _unknown: () => {
            throw new Error("Unknown addPropertyToFormData: " + property.type);
        },
    });
}

function isMaybeIterable(typeReference: TypeReference, context: SdkContext): boolean {
    return TypeReference._visit<boolean>(typeReference, {
        container: (container) =>
            ContainerType._visit<boolean>(container, {
                list: () => true,
                set: () => true,
                map: () => false,
                literal: () => false,
                optional: (itemType) => isMaybeIterable(itemType, context),
                _unknown: () => {
                    throw new Error("Unknown ContainerType: " + container._type);
                },
            }),
        named: (typeName) => {
            const typeDeclaration = context.type.getTypeDeclaration(typeName);
            return Type._visit(typeDeclaration.shape, {
                object: () => false,
                enum: () => false,
                union: () => false,
                alias: ({ aliasOf }) => isMaybeIterable(aliasOf, context),
                undiscriminatedUnion: ({ members }) => members.some((member) => isMaybeIterable(member.type, context)),
                _unknown: () => {
                    throw new Error("Unknown Type: " + typeDeclaration.shape._type);
                },
            });
        },
        primitive: () => false,
        unknown: () => true,
        _unknown: () => {
            throw new Error("Unknown TypeReference: " + typeReference._type);
        },
    });
}

function stringifyIterableItemType(value: ts.Expression, iterable: TypeReference, context: SdkContext): ts.Expression {
    return TypeReference._visit(iterable, {
        container: (container) =>
            ContainerType._visit(container, {
                list: (itemType) => context.type.stringify(value, itemType, { includeNullCheckIfOptional: false }),
                set: (itemType) => context.type.stringify(value, itemType, { includeNullCheckIfOptional: false }),
                map: () => {
                    throw new Error("Map is not iterable.");
                },
                literal: () => {
                    throw new Error("Literal is not iterable.");
                },
                optional: (itemType) => stringifyIterableItemType(value, itemType, context),
                _unknown: () => {
                    throw new Error("Unknown ContainerType: " + container._type);
                },
            }),
        named: (typeName) => {
            const typeDeclaration = context.type.getTypeDeclaration(typeName);
            return Type._visit(typeDeclaration.shape, {
                object: () => {
                    throw new Error("Object is not iterable.");
                },
                enum: () => {
                    throw new Error("Enum is not iterable.");
                },
                union: () => {
                    throw new Error("Union is not iterable.");
                },
                alias: ({ aliasOf }) => stringifyIterableItemType(value, aliasOf, context),
                undiscriminatedUnion: () =>
                    context.type.stringify(value, TypeReference.unknown(), { includeNullCheckIfOptional: false }),
                _unknown: () => {
                    throw new Error("Unknown Type: " + typeDeclaration.shape._type);
                },
            });
        },
        primitive: () => {
            throw new Error("Primitive is not iterable.");
        },
        unknown: () => context.type.stringify(value, TypeReference.unknown(), { includeNullCheckIfOptional: false }),
        _unknown: () => {
            throw new Error("Unknown TypeReference: " + iterable._type);
        },
    });
}

function isDefinitelyIterable(typeReference: TypeReference, context: SdkContext): boolean {
    return TypeReference._visit<boolean>(typeReference, {
        container: (container) =>
            ContainerType._visit<boolean>(container, {
                list: () => true,
                set: () => true,
                map: () => false,
                literal: () => false,
                optional: (itemType) => isDefinitelyIterable(itemType, context),
                _unknown: () => {
                    throw new Error("Unknown ContainerType: " + container._type);
                },
            }),
        named: (typeName) => {
            const typeDeclaration = context.type.getTypeDeclaration(typeName);
            return Type._visit(typeDeclaration.shape, {
                object: () => false,
                enum: () => false,
                union: () => false,
                alias: ({ aliasOf }) => isDefinitelyIterable(aliasOf, context),
                undiscriminatedUnion: ({ members }) =>
                    members.every((member) => isDefinitelyIterable(member.type, context)),
                _unknown: () => {
                    throw new Error("Unknown Type: " + typeDeclaration.shape._type);
                },
            });
        },
        primitive: () => false,
        unknown: () => false,
        _unknown: () => {
            throw new Error("Unknown TypeReference: " + typeReference._type);
        },
    });
}

function isMaybeList(typeReference: TypeReference, context: SdkContext): boolean {
    return TypeReference._visit<boolean>(typeReference, {
        container: (container) =>
            ContainerType._visit<boolean>(container, {
                list: () => true,
                set: () => false,
                map: () => false,
                literal: () => false,
                optional: (itemType) => isMaybeList(itemType, context),
                _unknown: () => {
                    throw new Error("Unknown ContainerType: " + container._type);
                },
            }),
        named: (typeName) => {
            const typeDeclaration = context.type.getTypeDeclaration(typeName);
            return Type._visit(typeDeclaration.shape, {
                object: () => false,
                enum: () => false,
                union: () => false,
                alias: ({ aliasOf }) => isMaybeList(aliasOf, context),
                undiscriminatedUnion: ({ members }) => members.some((member) => isMaybeList(member.type, context)),
                _unknown: () => {
                    throw new Error("Unknown Type: " + typeDeclaration.shape._type);
                },
            });
        },
        primitive: () => false,
        unknown: () => true,
        _unknown: () => {
            throw new Error("Unknown TypeReference: " + typeReference._type);
        },
    });
}

function isMaybeSet(typeReference: TypeReference, context: SdkContext): boolean {
    return TypeReference._visit<boolean>(typeReference, {
        container: (container) =>
            ContainerType._visit<boolean>(container, {
                list: () => false,
                set: () => true,
                map: () => false,
                literal: () => false,
                optional: (itemType) => isMaybeSet(itemType, context),
                _unknown: () => {
                    throw new Error("Unknown ContainerType: " + container._type);
                },
            }),
        named: (typeName) => {
            const typeDeclaration = context.type.getTypeDeclaration(typeName);
            return Type._visit(typeDeclaration.shape, {
                object: () => false,
                enum: () => false,
                union: () => false,
                alias: ({ aliasOf }) => isMaybeSet(aliasOf, context),
                undiscriminatedUnion: ({ members }) => members.some((member) => isMaybeSet(member.type, context)),
                _unknown: () => {
                    throw new Error("Unknown Type: " + typeDeclaration.shape._type);
                },
            });
        },
        primitive: () => false,
        unknown: () => true,
        _unknown: () => {
            throw new Error("Unknown TypeReference: " + typeReference._type);
        },
    });
}
