import { noop, visitDiscriminatedUnion } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { NameRegistry, swift } from "@fern-api/swift-codegen";
import type { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export function registerLiteralEnums({
    parentSymbol,
    registry,
    namedType,
    context
}: {
    parentSymbol: swift.Symbol;
    registry: NameRegistry;
    namedType: FernIr.dynamic.NamedType;
    context: DynamicSnippetsGeneratorContext;
}) {
    visitDiscriminatedUnion(namedType, "type")._visit({
        object: (otd) => {
            registerLiteralEnumsForObjectProperties({
                parentSymbol,
                registry,
                properties: otd.properties
            });
        },
        discriminatedUnion: (utd) => {
            Object.values(utd.types).forEach((singleUnionType) => {
                const variantSymbol = registry.getDiscriminatedUnionVariantSymbolOrThrow(
                    parentSymbol,
                    singleUnionType.discriminantValue.wireValue
                );
                visitDiscriminatedUnion(singleUnionType, "type")._visit({
                    noProperties: noop,
                    samePropertiesAsObject: (declaredTypeName) => {
                        const variantProperties = context.getPropertiesOfDiscriminatedUnionVariant(
                            declaredTypeName.typeId
                        );
                        variantProperties.forEach((property) => {
                            registerLiteralEnumsForTypeReference({
                                parentSymbol: variantSymbol,
                                registry,
                                typeReference: property.typeReference
                            });
                        });
                    },
                    singleProperty: (p) => {
                        registerLiteralEnumsForTypeReference({
                            parentSymbol: variantSymbol,
                            registry,
                            typeReference: p.typeReference
                        });
                    },
                    _other: noop
                });
            });
        },
        undiscriminatedUnion: (utd) => {
            utd.types.forEach((typeReference) => {
                registerLiteralEnumsForTypeReference({
                    parentSymbol,
                    registry,
                    typeReference
                });
            });
        },
        alias: noop,
        enum: noop,
        _other: noop
    });
}

export function registerLiteralEnumsForObjectProperties({
    parentSymbol,
    registry,
    properties
}: {
    parentSymbol: swift.Symbol;
    registry: NameRegistry;
    properties: FernIr.dynamic.NamedParameter[];
}) {
    properties.forEach((property) => {
        registerLiteralEnumsForTypeReference({
            parentSymbol,
            registry,
            typeReference: property.typeReference
        });
    });
}

export function registerLiteralEnumsForTypeReference({
    parentSymbol,
    registry,
    typeReference
}: {
    parentSymbol: swift.Symbol;
    registry: NameRegistry;
    typeReference: FernIr.dynamic.TypeReference;
}) {
    visitDiscriminatedUnion(typeReference, "type")._visit({
        list: (lt) => {
            registerLiteralEnumsForTypeReference({
                parentSymbol,
                registry,
                typeReference: lt.value
            });
        },
        literal: (typeReference) => {
            visitDiscriminatedUnion(typeReference.value, "type")._visit({
                string: (literalType) => {
                    registry.registerNestedLiteralEnumSymbol({
                        parentSymbol,
                        literalValue: literalType.value
                    });
                },
                boolean: noop,
                _other: noop
            });
        },
        map: (typeReference) => {
            registerLiteralEnumsForTypeReference({
                parentSymbol,
                registry,
                typeReference: typeReference.key
            });
            registerLiteralEnumsForTypeReference({
                parentSymbol,
                registry,
                typeReference: typeReference.value
            });
        },
        named: noop,
        nullable: (typeReference) => {
            registerLiteralEnumsForTypeReference({
                parentSymbol,
                registry,
                typeReference: typeReference.value
            });
        },
        optional: (typeReference) => {
            registerLiteralEnumsForTypeReference({
                parentSymbol,
                registry,
                typeReference: typeReference.value
            });
        },
        primitive: noop,
        set: (typeReference) => {
            registerLiteralEnumsForTypeReference({
                parentSymbol,
                registry,
                typeReference: typeReference.value
            });
        },
        unknown: noop,
        _other: noop
    });
}
