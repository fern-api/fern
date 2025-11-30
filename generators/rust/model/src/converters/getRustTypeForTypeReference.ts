import { assertNever } from "@fern-api/core-utils";
import { rust } from "@fern-api/rust-codegen";
import { PrimitiveTypeV1, TypeReference } from "@fern-fern/ir-sdk/api";
import { isFloatingPointType } from "../utils/primitiveTypeUtils";

export interface RustTypeGeneratorContext {
    getUniqueTypeNameForReference(declaredTypeName: {
        fernFilepath: { allParts: Array<{ pascalCase: { safeName: string } }> };
        name: { pascalCase: { safeName: string } };
    }): string;
}

export function generateRustTypeForTypeReference(
    typeReference: TypeReference,
    context: RustTypeGeneratorContext,
    wrapInBox: boolean = false
): rust.Type {
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
                        generateRustTypeForTypeReference(mapType.keyType, context, false),
                        // Propagate wrapInBox to the value type for recursive maps
                        generateRustTypeForTypeReference(mapType.valueType, context, wrapInBox)
                    ),
                set: (setType) => {
                    // Rust doesn't have a built-in Set, use HashSet
                    // Propagate wrapInBox to the element type
                    const elementType = isFloatingPointType(setType)
                        ? rust.Type.reference(
                              rust.reference({
                                  name: "OrderedFloat",
                                  module: "ordered_float",
                                  genericArgs: [generateRustTypeForTypeReference(setType, context, wrapInBox)]
                              })
                          )
                        : generateRustTypeForTypeReference(setType, context, wrapInBox);

                    return rust.Type.reference(
                        rust.reference({
                            name: "HashSet",
                            genericArgs: [elementType]
                        })
                    );
                },
                nullable: (nullableType) =>
                    rust.Type.option(generateRustTypeForTypeReference(nullableType, context, wrapInBox)),
                optional: (optionalType) =>
                    rust.Type.option(generateRustTypeForTypeReference(optionalType, context, wrapInBox)),
                list: (listType) =>
                    // Vec is heap-allocated, but we need to Box the inner type if it's recursive
                    // This generates Vec<Box<T>> for recursive types, not Box<Vec<T>>
                    rust.Type.vec(generateRustTypeForTypeReference(listType, context, wrapInBox)),
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
                integer: () => rust.Type.primitive(rust.PrimitiveType.I64),
                uint: () => rust.Type.primitive(rust.PrimitiveType.I64),
                uint64: () => rust.Type.primitive(rust.PrimitiveType.I64),
                long: () => rust.Type.primitive(rust.PrimitiveType.I64),
                float: () => rust.Type.primitive(rust.PrimitiveType.F64),
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
                    // Base64 represents binary data as Vec<u8>
                    return rust.Type.reference(
                        rust.reference({
                            name: "Vec",
                            module: undefined,
                            genericArgs: [rust.Type.primitive(rust.PrimitiveType.U8)]
                        })
                    );
                },
                uuid: () => {
                    // Use uuid::Uuid
                    return rust.Type.reference(
                        rust.reference({
                            name: "Uuid"
                        })
                    );
                },
                _other: () => {
                    // Fallback for unknown primitive types
                    return rust.Type.primitive(rust.PrimitiveType.String);
                }
            });
        case "named": {
            const baseType = rust.Type.reference(
                rust.reference({
                    name: context.getUniqueTypeNameForReference(typeReference)
                })
            );

            // Wrap in Box<T> if this is a recursive reference
            return wrapInBox
                ? rust.Type.reference(
                      rust.reference({
                          name: "Box",
                          genericArgs: [baseType]
                      })
                  )
                : baseType;
        }
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
