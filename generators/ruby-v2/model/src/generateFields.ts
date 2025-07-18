import { ruby } from "@fern-api/ruby-ast";
import { ObjectProperty, TypeReference, PrimitiveTypeV1 } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "./ModelGeneratorContext";

export function generateFields({
    properties,
    context
}: {
    properties: ObjectProperty[];
    context: ModelGeneratorContext;
}): ruby.AstNode[] {
    return properties.map((prop, index) => {
        const fieldName = prop.name.name.snakeCase.safeName;
        const rubyType = toRubyType(prop.valueType);
        
        return ruby.codeblock((writer) => {
            writer.write(`field :${fieldName}, ${rubyType}, optional: true, nullable: true`);
            // Only add newline for the last statement to ensure 'end' appears on its own line
            if (index === properties.length - 1) {
                writer.newLine();
            }
        });
    });
}

function toRubyType(typeReference: TypeReference): string {
    return typeReference._visit<string>({
        primitive: (primitiveType) => {
            return PrimitiveTypeV1._visit<string>(primitiveType.v1, {
                string: () => "String",
                double: () => "Float",
                integer: () => "Integer",
                boolean: () => "Boolean",
                long: () => "Long",
                dateTime: () => "DateTime",
                date: () => "Date",
                uuid: () => "String",
                base64: () => "String",
                bigInteger: () => "String",
                uint: () => "Integer",
                uint64: () => "Long",
                float: () => "Float",
                _other: () => "String" // fallback
            });
        },
        named: (declaredTypeName) => {
            // For declared types like MovieId, use the name as-is
            return declaredTypeName.name.pascalCase.safeName;
        },
        container: () => {
            // TODO: Handle containers properly (Array, Hash, etc.)
            return "Array";
        },
        unknown: () => "Object",
        _other: () => "Object"
    });
} 