import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export class DynamicTypeInstantiationMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(typeReference: FernGeneratorExec.dynamic.TypeReference, value: unknown): string {
        if (value == null) {
            return this.convertNull(typeReference);
        }

        switch (typeReference.type) {
            case "primitive":
                return this.convertPrimitive(typeReference.value, value);
            case "optional":
                return this.convertOptional(typeReference, value);
            case "list":
                return this.convertList(typeReference, value);
            case "set":
                return this.convertSet(typeReference, value);
            case "map":
                return this.convertMap(typeReference, value);
            case "named":
                return this.convertNamed(typeReference, value);
            case "unknown":
                return this.convertUnknown(value);
            default:
                return this.convertUnknown(value);
        }
    }

    private convertNull(typeReference: FernGeneratorExec.dynamic.TypeReference): string {
        if (typeReference.type === "optional") {
            return "None";
        }
        return "None";
    }

    private convertPrimitive(primitive: FernGeneratorExec.dynamic.PrimitiveType, value: unknown): string {
        switch (primitive.type) {
            case "string":
                return `"${value}".to_string()`;
            case "integer":
                return `${value}`;
            case "double":
                return `${value}f64`;
            case "boolean":
                return value ? "true" : "false";
            case "datetime":
                return `chrono::DateTime::parse_from_rfc3339("${value}").unwrap()`;
            case "uuid":
                return `uuid::Uuid::parse_str("${value}").unwrap()`;
            case "base64":
                return `base64::decode("${value}").unwrap()`;
            default:
                return this.convertUnknown(value);
        }
    }

    private convertOptional(typeReference: FernGeneratorExec.dynamic.OptionalType, value: unknown): string {
        if (value == null) {
            return "None";
        }
        const inner = this.convert(typeReference.value, value);
        return `Some(${inner})`;
    }

    private convertList(typeReference: FernGeneratorExec.dynamic.ListType, value: unknown): string {
        if (!Array.isArray(value)) {
            return "vec![]";
        }
        const elements = value.map((item) => this.convert(typeReference.value, item));
        return `vec![${elements.join(", ")}]`;
    }

    private convertSet(typeReference: FernGeneratorExec.dynamic.SetType, value: unknown): string {
        if (!Array.isArray(value)) {
            return "HashSet::new()";
        }
        const elements = value.map((item) => this.convert(typeReference.value, item));
        return `HashSet::from([${elements.join(", ")}])`;
    }

    private convertMap(typeReference: FernGeneratorExec.dynamic.MapType, value: unknown): string {
        if (typeof value !== "object" || value == null) {
            return "HashMap::new()";
        }
        const entries = Object.entries(value).map(([key, val]) => {
            const keyStr = this.convert(typeReference.key, key);
            const valStr = this.convert(typeReference.value, val);
            return `(${keyStr}, ${valStr})`;
        });
        return `HashMap::from([${entries.join(", ")}])`;
    }

    private convertNamed(typeReference: FernGeneratorExec.dynamic.NamedType, value: unknown): string {
        // For named types, we'll generate a struct initialization
        const typeName = this.context.toPascalCase(typeReference.value.name);

        if (typeof value === "object" && value != null) {
            const fields = Object.entries(value).map(([key, val]) => {
                const fieldName = this.context.toSnakeCase(key);
                const fieldValue = this.convertUnknown(val);
                return `${fieldName}: ${fieldValue}`;
            });
            return `${typeName} { ${fields.join(", ")} }`;
        }

        return `${typeName}::default()`;
    }

    private convertUnknown(value: unknown): string {
        if (value == null) {
            return "None";
        }

        if (typeof value === "string") {
            return `"${value}".to_string()`;
        }

        if (typeof value === "number") {
            if (Number.isInteger(value)) {
                return `${value}`;
            }
            return `${value}f64`;
        }

        if (typeof value === "boolean") {
            return value ? "true" : "false";
        }

        if (Array.isArray(value)) {
            const elements = value.map((v) => this.convertUnknown(v));
            return `vec![${elements.join(", ")}]`;
        }

        if (typeof value === "object") {
            // Use serde_json for complex objects
            return `serde_json::json!(${JSON.stringify(value)})`;
        }

        return '""';
    }
}
