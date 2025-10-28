import { noop } from "@fern-api/core-utils";
import { BaseSwiftCustomConfigSchema, swift } from "@fern-api/swift-codegen";
import { ObjectProperty, TypeDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";

import { NameRegistry } from "../project";
import { AbstractSwiftGeneratorContext } from "./AbstractSwiftGeneratorContext";

export function registerLiteralEnums({
    parentSymbol,
    registry,
    typeDeclaration,
    context
}: {
    parentSymbol: swift.Symbol;
    registry: NameRegistry;
    typeDeclaration: TypeDeclaration;
    context: AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>;
}) {
    typeDeclaration.shape._visit({
        object: (otd) => {
            const allProperties = [...(otd.extendedProperties ?? []), ...otd.properties];
            registerLiteralEnumsForObjectProperties({
                parentSymbol,
                registry,
                properties: allProperties
            });
        },
        union: (utd) => {
            utd.types.forEach((type) => {
                const variantSymbol = registry.getDiscriminatedUnionVariantSymbolOrThrow(
                    parentSymbol,
                    type.discriminantValue.wireValue
                );
                type.shape._visit({
                    noProperties: noop,
                    samePropertiesAsObject: (declaredTypeName) => {
                        const variantProperties = context.getPropertiesOfDiscriminatedUnionVariant(
                            declaredTypeName.typeId
                        );
                        variantProperties.forEach((property) => {
                            registerLiteralEnumsForTypeReference({
                                parentSymbol: variantSymbol,
                                registry,
                                typeReference: property.valueType
                            });
                        });
                    },
                    singleProperty: (p) => {
                        registerLiteralEnumsForTypeReference({
                            parentSymbol: variantSymbol,
                            registry,
                            typeReference: p.type
                        });
                    },
                    _other: noop
                });
            });
        },
        undiscriminatedUnion: (utd) => {
            utd.members.forEach((member) => {
                registerLiteralEnumsForTypeReference({
                    parentSymbol,
                    registry,
                    typeReference: member.type
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
    properties: ObjectProperty[];
}) {
    properties.forEach((property) => {
        registerLiteralEnumsForTypeReference({
            parentSymbol,
            registry,
            typeReference: property.valueType
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
    typeReference: TypeReference;
}) {
    typeReference._visit({
        container: (ct) => {
            ct._visit({
                literal: (literal) => {
                    literal._visit({
                        string: (literalValue) => {
                            registry.registerNestedLiteralEnumSymbol({
                                parentSymbol,
                                literalValue
                            });
                        },
                        _other: noop,
                        boolean: noop
                    });
                },
                map: (mt) => {
                    registerLiteralEnumsForTypeReference({
                        parentSymbol,
                        registry,
                        typeReference: mt.keyType
                    });
                    registerLiteralEnumsForTypeReference({
                        parentSymbol,
                        registry,
                        typeReference: mt.valueType
                    });
                },
                list: (lt) => {
                    registerLiteralEnumsForTypeReference({
                        parentSymbol,
                        registry,
                        typeReference: lt
                    });
                },
                nullable: (typeReference) => {
                    registerLiteralEnumsForTypeReference({
                        parentSymbol,
                        registry,
                        typeReference
                    });
                },
                optional: (typeReference) => {
                    registerLiteralEnumsForTypeReference({
                        parentSymbol,
                        registry,
                        typeReference
                    });
                },
                set: (typeReference) => {
                    registerLiteralEnumsForTypeReference({
                        parentSymbol,
                        registry,
                        typeReference
                    });
                },
                _other: noop
            });
        },
        named: noop,
        primitive: noop,
        unknown: noop,
        _other: noop
    });
}
