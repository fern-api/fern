import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { ContainerType, FileUploadRequestProperty, Type, TypeReference } from "@fern-fern/ir-sdk/api";

import { FileUploadRequestParameter } from "../../request-parameter/FileUploadRequestParameter";
import { getParameterNameForFile } from "./getParameterNameForFile";

export function appendPropertyToFormData({
    property,
    context,
    referenceToFormData,
    wrapperName,
    requestParameter
}: {
    property: FileUploadRequestProperty;
    context: SdkContext;
    referenceToFormData: ts.Expression;
    wrapperName: string;
    requestParameter: FileUploadRequestParameter | undefined;
}): ts.Statement {
    return FileUploadRequestProperty._visit(property, {
        file: (property) => {
            const FOR_LOOP_ITEM_VARIABLE_NAME = "_file";

            let statement = context.coreUtilities.formDataUtils.appendFile({
                referencetoFormData: referenceToFormData,
                key: property.key.wireValue,
                value: ts.factory.createIdentifier(
                    getParameterNameForFile({
                        property,
                        wrapperName,
                        includeSerdeLayer: context.includeSerdeLayer,
                        retainOriginalCasing: context.retainOriginalCasing,
                        inlineFileProperties: context.inlineFileProperties
                    })
                )
            });

            if (property.type === "fileArray") {
                statement = ts.factory.createForOfStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier(FOR_LOOP_ITEM_VARIABLE_NAME),
                                undefined,
                                undefined,
                                undefined
                            )
                        ],
                        ts.NodeFlags.Const
                    ),
                    ts.factory.createIdentifier(
                        getParameterNameForFile({
                            property,
                            wrapperName,
                            includeSerdeLayer: context.includeSerdeLayer,
                            retainOriginalCasing: context.retainOriginalCasing,
                            inlineFileProperties: context.inlineFileProperties
                        })
                    ),
                    ts.factory.createBlock(
                        [
                            context.coreUtilities.formDataUtils.appendFile({
                                referencetoFormData: referenceToFormData,
                                key: property.key.wireValue,
                                value: ts.factory.createIdentifier(FOR_LOOP_ITEM_VARIABLE_NAME)
                            })
                        ],
                        true
                    )
                );
            }

            if (property.isOptional) {
                statement = ts.factory.createIfStatement(
                    ts.factory.createBinaryExpression(
                        ts.factory.createIdentifier(
                            getParameterNameForFile({
                                property,
                                wrapperName,
                                includeSerdeLayer: context.includeSerdeLayer,
                                retainOriginalCasing: context.retainOriginalCasing,
                                inlineFileProperties: context.inlineFileProperties
                            })
                        ),
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
                            )
                        ],
                        ts.NodeFlags.Const
                    ),
                    referenceToBodyProperty,
                    ts.factory.createBlock(
                        [
                            context.coreUtilities.formDataUtils.append({
                                referencetoFormData: referenceToFormData,
                                key: property.name.wireValue,
                                value: stringifyIterableItemType(
                                    ts.factory.createIdentifier(FOR_LOOP_ITEM_VARIABLE_NAME),
                                    property.valueType,
                                    context
                                )
                            })
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
                statement = context.coreUtilities.formDataUtils.append({
                    referencetoFormData: referenceToFormData,
                    key: property.name.wireValue,
                    value: context.type.stringify(referenceToBodyProperty, property.valueType, {
                        includeNullCheckIfOptional: false
                    })
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
        _other: () => {
            throw new Error("Unknown addPropertyToFormData: " + property.type);
        }
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
                _other: () => {
                    throw new Error("Unknown ContainerType: " + container.type);
                }
            }),
        named: (typeName) => {
            const typeDeclaration = context.type.getTypeDeclaration(typeName);
            return Type._visit(typeDeclaration.shape, {
                object: () => false,
                enum: () => false,
                union: () => false,
                alias: ({ aliasOf }) => isMaybeIterable(aliasOf, context),
                undiscriminatedUnion: ({ members }) => members.some((member) => isMaybeIterable(member.type, context)),
                _other: () => {
                    throw new Error("Unknown Type: " + typeDeclaration.shape.type);
                }
            });
        },
        primitive: () => false,
        unknown: () => true,
        _other: () => {
            throw new Error("Unknown TypeReference: " + typeReference.type);
        }
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
                _other: () => {
                    throw new Error("Unknown ContainerType: " + container.type);
                }
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
                _other: () => {
                    throw new Error("Unknown Type: " + typeDeclaration.shape.type);
                }
            });
        },
        primitive: () => {
            throw new Error("Primitive is not iterable.");
        },
        unknown: () => context.type.stringify(value, TypeReference.unknown(), { includeNullCheckIfOptional: false }),
        _other: () => {
            throw new Error("Unknown TypeReference: " + iterable.type);
        }
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
                _other: () => {
                    throw new Error("Unknown ContainerType: " + container.type);
                }
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
                _other: () => {
                    throw new Error("Unknown Type: " + typeDeclaration.shape.type);
                }
            });
        },
        primitive: () => false,
        unknown: () => false,
        _other: () => {
            throw new Error("Unknown TypeReference: " + typeReference.type);
        }
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
                _other: () => {
                    throw new Error("Unknown ContainerType: " + container.type);
                }
            }),
        named: (typeName) => {
            const typeDeclaration = context.type.getTypeDeclaration(typeName);
            return Type._visit(typeDeclaration.shape, {
                object: () => false,
                enum: () => false,
                union: () => false,
                alias: ({ aliasOf }) => isMaybeList(aliasOf, context),
                undiscriminatedUnion: ({ members }) => members.some((member) => isMaybeList(member.type, context)),
                _other: () => {
                    throw new Error("Unknown Type: " + typeDeclaration.shape.type);
                }
            });
        },
        primitive: () => false,
        unknown: () => true,
        _other: () => {
            throw new Error("Unknown TypeReference: " + typeReference.type);
        }
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
                _other: () => {
                    throw new Error("Unknown ContainerType: " + container.type);
                }
            }),
        named: (typeName) => {
            const typeDeclaration = context.type.getTypeDeclaration(typeName);
            return Type._visit(typeDeclaration.shape, {
                object: () => false,
                enum: () => false,
                union: () => false,
                alias: ({ aliasOf }) => isMaybeSet(aliasOf, context),
                undiscriminatedUnion: ({ members }) => members.some((member) => isMaybeSet(member.type, context)),
                _other: () => {
                    throw new Error("Unknown Type: " + typeDeclaration.shape.type);
                }
            });
        },
        primitive: () => false,
        unknown: () => true,
        _other: () => {
            throw new Error("Unknown TypeReference: " + typeReference.type);
        }
    });
}
