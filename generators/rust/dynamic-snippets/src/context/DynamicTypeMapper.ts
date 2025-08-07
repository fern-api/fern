import { TypeInstance } from "@fern-api/browser-compatible-base-generator";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export class DynamicTypeMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(typeReference: FernGeneratorExec.dynamic.TypeReference): TypeInstance {
        switch (typeReference.type) {
            case "primitive":
                return this.convertPrimitive(typeReference.value);
            case "optional":
                return this.convertOptional(typeReference);
            case "list":
                return this.convertList(typeReference);
            case "set":
                return this.convertSet(typeReference);
            case "map":
                return this.convertMap(typeReference);
            case "named":
                return this.convertNamed(typeReference);
            case "unknown":
                return TypeInstance.unknown();
            default:
                return TypeInstance.unknown();
        }
    }

    private convertPrimitive(primitive: FernGeneratorExec.dynamic.PrimitiveType): TypeInstance {
        switch (primitive.type) {
            case "string":
                return TypeInstance.string();
            case "integer":
                return TypeInstance.integer();
            case "double":
                return TypeInstance.double();
            case "boolean":
                return TypeInstance.boolean();
            case "datetime":
                return TypeInstance.dateTime();
            case "uuid":
                return TypeInstance.uuid();
            case "base64":
                return TypeInstance.base64();
            default:
                return TypeInstance.unknown();
        }
    }

    private convertOptional(typeReference: FernGeneratorExec.dynamic.OptionalType): TypeInstance {
        const inner = this.convert(typeReference.value);
        return TypeInstance.optional(inner);
    }

    private convertList(typeReference: FernGeneratorExec.dynamic.ListType): TypeInstance {
        const itemType = this.convert(typeReference.value);
        return TypeInstance.list(itemType);
    }

    private convertSet(typeReference: FernGeneratorExec.dynamic.SetType): TypeInstance {
        const itemType = this.convert(typeReference.value);
        return TypeInstance.set(itemType);
    }

    private convertMap(typeReference: FernGeneratorExec.dynamic.MapType): TypeInstance {
        const keyType = this.convert(typeReference.key);
        const valueType = this.convert(typeReference.value);
        return TypeInstance.map({ keyType, valueType });
    }

    private convertNamed(typeReference: FernGeneratorExec.dynamic.NamedType): TypeInstance {
        // For named types, we'll treat them as objects for now
        // In a full implementation, we'd look up the type definition
        return TypeInstance.object({
            fields: []
        });
    }
}
