import { noop } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { TypeDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";

import { NameRegistry } from "../project";

export function registerLiteralEnums({
    parentSymbol,
    registry,
    typeDeclaration
}: {
    parentSymbol: swift.Symbol;
    registry: NameRegistry;
    typeDeclaration: TypeDeclaration;
}) {
    typeDeclaration.shape._visit({
        object: (otd) => {
            const allProperties = [...(otd.extendedProperties ?? []), ...otd.properties];
            allProperties.forEach((property) => {
                registerLiteralEnumsForTypeReference({
                    parentSymbol,
                    registry,
                    typeReference: property.valueType
                });
            });
        },
        union: (utd) => {
            utd.types.forEach((type) => {
                type.shape._visit({
                    noProperties: noop,
                    samePropertiesAsObject: noop,
                    singleProperty: (p) => {
                        registerLiteralEnumsForTypeReference({
                            parentSymbol,
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
