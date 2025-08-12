import { ruby } from "@fern-api/ruby-ast";
import { ObjectProperty } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export function generateFields({
    properties,
    context
}: {
    properties: ObjectProperty[];
    context: ModelGeneratorContext;
}): ruby.AstNode[] {
    return properties.map((prop, index) => {
        const fieldName = prop.name.name.snakeCase.safeName;
        const rubyType = context.typeMapper.convert({ reference: prop.valueType });

        const isOptional = prop.valueType.type === "container" && prop.valueType.container.type === "optional";
        const isNullable = prop.valueType.type === "container" && prop.valueType.container.type === "nullable";

        return ruby.codeblock((writer) => {
            writer.write(`field :${fieldName}, ${rubyType}, optional: ${isOptional}, nullable: ${isNullable}`);
            // Only add newline for the last statement to ensure 'end' appears on its own line
            if (index === properties.length - 1) {
                writer.newLine();
            }
        });
    });
}
