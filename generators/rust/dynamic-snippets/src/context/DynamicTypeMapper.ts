import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export declare namespace DynamicTypeMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
    }
}

export class DynamicTypeMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public mapType(args: DynamicTypeMapper.Args): string {
        switch (args.typeReference.type) {
            case "primitive":
                return this.mapPrimitive(args.typeReference.value);
            case "list":
                return `Vec<${this.mapType({ typeReference: args.typeReference.value })}>`;
            case "map": {
                const keyType = this.mapType({ typeReference: args.typeReference.key });
                const valueType = this.mapType({ typeReference: args.typeReference.value });
                return `HashMap<${keyType}, ${valueType}>`;
            }
            case "set":
                return `HashSet<${this.mapType({ typeReference: args.typeReference.value })}>`;
            case "optional":
            case "nullable":
                return `Option<${this.mapType({ typeReference: args.typeReference.value })}>`;
            case "named": {
                const namedType = this.context.ir.types[args.typeReference.value];
                if (!namedType) {
                    return "String";
                }
                return this.mapNamed(namedType);
            }
            case "literal":
                return this.mapLiteral(args.typeReference.value);
            case "unknown":
                return "serde_json::Value";
            default:
                return "String";
        }
    }

    private mapPrimitive(primitive: FernIr.PrimitiveTypeV1): string {
        switch (primitive) {
            case "STRING":
            case "BASE_64":
            case "BIG_INTEGER":
                return "String";
            case "INTEGER":
            case "LONG":
                return "i64";
            case "UINT":
            case "UINT_64":
                return "u64";
            case "FLOAT":
                return "f32";
            case "DOUBLE":
                return "f64";
            case "BOOLEAN":
                return "bool";
            case "UUID":
                return "Uuid";
            case "DATE":
                return "NaiveDate";
            case "DATE_TIME":
                return "DateTime<Utc>";
            default:
                return "String";
        }
    }

    private mapNamed(namedType: FernIr.dynamic.NamedType): string {
        switch (namedType.type) {
            case "alias":
                return this.mapType({ typeReference: namedType.typeReference });
            case "object":
            case "enum":
            case "discriminatedUnion":
            case "undiscriminatedUnion":
                return this.context.getStructName(namedType.declaration.name);
            default:
                return "String";
        }
    }

    private mapLiteral(literal: FernIr.dynamic.LiteralType): string {
        switch (literal.type) {
            case "string":
                return "String";
            case "boolean":
                return "bool";
            default:
                return "String";
        }
    }
}
