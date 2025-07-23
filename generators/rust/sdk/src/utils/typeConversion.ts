import { TypeReference, PrimitiveTypeV1 } from "@fern-fern/ir-sdk/api";

/**
 * Simple utility to convert IR TypeReference to Rust type strings
 * This is a simplified version - we'll enhance it later with full AST support
 */
export function convertIrTypeToRustTypeString(typeReference: TypeReference): string {
    switch (typeReference.type) {
        case "container":
            return typeReference.container._visit({
                list: (itemType: TypeReference) => {
                    const innerType = convertIrTypeToRustTypeString(itemType);
                    return `Vec<${innerType}>`;
                },
                set: (itemType: TypeReference) => {
                    const innerType = convertIrTypeToRustTypeString(itemType);
                    return `HashSet<${innerType}>`;
                },
                map: ({ keyType, valueType }: { keyType: TypeReference; valueType: TypeReference }) => {
                    const keyRustType = convertIrTypeToRustTypeString(keyType);
                    const valueRustType = convertIrTypeToRustTypeString(valueType);
                    return `HashMap<${keyRustType}, ${valueRustType}>`;
                },
                optional: (innerType: TypeReference) => {
                    const rustInnerType = convertIrTypeToRustTypeString(innerType);
                    return `Option<${rustInnerType}>`;
                },
                nullable: (innerType: TypeReference) => {
                    const rustInnerType = convertIrTypeToRustTypeString(innerType);
                    return `Option<${rustInnerType}>`;
                },
                literal: () => {
                    return "String";
                },
                _other: () => {
                    return "String";
                }
            });

        case "primitive":
            return convertPrimitiveTypeToString(typeReference.primitive.v1);

        case "named":
            return typeReference.name.pascalCase.unsafeName;

        case "unknown":
            return "serde_json::Value";

        default:
            return "String";
    }
}

function convertPrimitiveTypeToString(primitive: PrimitiveTypeV1): string {
    switch (primitive) {
        case "STRING":
            return "String";
        case "BOOLEAN":
            return "bool";
        case "INTEGER":
            return "i32";
        case "LONG":
            return "i64";
        case "UINT":
            return "u32";
        case "UINT_64":
            return "u64";
        case "FLOAT":
            return "f32";
        case "DOUBLE":
            return "f64";
        case "BIG_INTEGER":
            return "String";
        case "DATE":
            return "chrono::NaiveDate";
        case "DATE_TIME":
            return "chrono::DateTime<chrono::Utc>";
        case "UUID":
            return "uuid::Uuid";
        case "BASE_64":
            return "String";
        default:
            return "String";
    }
}

 