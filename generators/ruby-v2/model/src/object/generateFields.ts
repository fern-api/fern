import { ruby } from "@fern-api/ruby-ast";
import { ObjectProperty, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export function generateFields({
    typeDeclaration,
    properties,
    context
}: {
    typeDeclaration?: TypeDeclaration;
    properties: ObjectProperty[];
    context: ModelGeneratorContext;
}): ruby.AstNode[] {
    return properties.map((prop, index) => {
        const fieldName = prop.name.name.snakeCase.safeName;
        const wireValue = prop.name.wireValue;
        const rubyType = context.typeMapper.convert({ reference: prop.valueType });

        let isCircular: boolean = false;
        if (typeDeclaration != null && prop.valueType.type === "named") {
            const propertyTypeDeclaration = context.getTypeDeclaration(prop.valueType.typeId);
            isCircular = propertyTypeDeclaration?.referencedTypes.has(typeDeclaration.name.typeId) ?? false;
        }

        const isOptional = prop.valueType.type === "container" && prop.valueType.container.type === "optional";
        const isNullable = prop.valueType.type === "container" && prop.valueType.container.type === "nullable";

        return ruby.codeblock((writer) => {
            writer.write(`field :${fieldName}, `);
            writer.write("-> { ");
            rubyType.write(writer);
            writer.write(" }");
            writer.write(`, optional: ${isOptional}, nullable: ${isNullable}`);
            if (wireValue !== fieldName) {
                writer.write(`, api_name: "${wireValue}"`);
            }
            // Only add newline for the last statement to ensure 'end' appears on its own line
            if (index === properties.length - 1) {
                writer.newLine();
            }
        });
    });
}
