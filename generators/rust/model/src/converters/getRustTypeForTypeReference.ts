import { assertNever } from "@fern-api/core-utils";
import { rust } from "@fern-api/rust-codegen";
import { PrimitiveTypeV1, TypeReference } from "@fern-fern/ir-sdk/api";
import { isFloatingPointType } from "../utils/primitiveTypeUtils";

export function generateRustTypeForTypeReference(typeReference: TypeReference): rust.Type {
    switch (typeReference.type) {
        case "container":
            return typeReference.container._visit({
                literal: (literal) => {
                    switch (literal.type) {
                        case "string":
                            return rust.Type.primitive(rust.PrimitiveType.String);
                        case "boolean":
                            return rust.Type.primitive(rust.PrimitiveType.Bool);
                        default:
                            return rust.Type.primitive(rust.PrimitiveType.String);
                    }
                },
                map: (mapType) =>
                    rust.Type.hashMap(
                        generateRustTypeForTypeReference(mapType.keyType),
                        generateRustTypeForTypeReference(mapType.valueType)
                    ),
                set: (setType) => {
                    // Rust doesn't have a built-in Set, use HashSet
                    const elementType = isFloatingPointType(setType)
                        ? rust.Type.reference(
                              rust.reference({
                                  name: "OrderedFloat",
                                  module: "ordered_float",
                                  genericArgs: [generateRustTypeForTypeReference(setType)]
                              })
                          )
                        : generateRustTypeForTypeReference(setType);

                    return rust.Type.reference(
                        rust.reference({
                            name: "HashSet",
                            module: "std::collections",
                            genericArgs: [elementType]
                        })
                    );
                },
                nullable: (nullableType) => rust.Type.option(generateRustTypeForTypeReference(nullableType)),
                optional: (optionalType) => rust.Type.option(generateRustTypeForTypeReference(optionalType)),
                list: (listType) => rust.Type.vec(generateRustTypeForTypeReference(listType)),
                _other: () => {
                    // Fallback for unknown container types
                    return rust.Type.reference(
                        rust.reference({
                            name: "Value",
                            module: "serde_json"
                        })
                    );
                }
            });
        case "primitive":
            return PrimitiveTypeV1._visit(typeReference.primitive.v1, {
                string: () => rust.Type.primitive(rust.PrimitiveType.String),
                boolean: () => rust.Type.primitive(rust.PrimitiveType.Bool),
                integer: () => rust.Type.primitive(rust.PrimitiveType.I32),
                uint: () => rust.Type.primitive(rust.PrimitiveType.U32),
                uint64: () => rust.Type.primitive(rust.PrimitiveType.U64),
                long: () => rust.Type.primitive(rust.PrimitiveType.I64),
                float: () => rust.Type.primitive(rust.PrimitiveType.F32),
                double: () => rust.Type.primitive(rust.PrimitiveType.F64),
                bigInteger: () => {
                    // Use BigInt from num-bigint crate
                    return rust.Type.reference(
                        rust.reference({
                            name: "BigInt",
                            module: "num_bigint"
                        })
                    );
                },
                date: () => {
                    // Use NaiveDate for date-only (imported from chrono)
                    return rust.Type.reference(
                        rust.reference({
                            name: "NaiveDate"
                        })
                    );
                },
                dateTime: () => {
                    // Use DateTime<Utc> for timestamps (imported from chrono)
                    return rust.Type.reference(
                        rust.reference({
                            name: "DateTime",
                            genericArgs: [
                                rust.Type.reference(
                                    rust.reference({
                                        name: "Utc"
                                    })
                                )
                            ]
                        })
                    );
                },
                base64: () => {
                    // Base64 is typically represented as Vec<u8> or String
                    return rust.Type.primitive(rust.PrimitiveType.String);
                },
                uuid: () => {
                    // Use uuid::Uuid
                    return rust.Type.reference(
                        rust.reference({
                            name: "Uuid",
                            module: "uuid"
                        })
                    );
                },
                _other: () => {
                    // Fallback for unknown primitive types
                    return rust.Type.primitive(rust.PrimitiveType.String);
                }
            });
        case "named":
            // Reference to a user-defined type
            return rust.Type.reference(
                rust.reference({
                    name: typeReference.name.pascalCase.unsafeName
                })
            );
        case "unknown":
            // Use serde_json::Value for truly unknown types
            return rust.Type.reference(
                rust.reference({
                    name: "Value",
                    module: "serde_json"
                })
            );
        default:
            return assertNever(typeReference);
    }
}
