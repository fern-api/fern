import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

/**
 * Normalizes a snake_case name to match RuboCop's `Naming/VariableNumber` `normalcase` style.
 * Removes underscores immediately before digit sequences when preceded by a letter
 * (e.g., `account_last_4` -> `account_last4`), but preserves leading underscores and
 * underscores after digits (e.g., `_3_d` stays `_3_d`).
 */
function normalizeVariableNumber(name: string): string {
    return name.replace(/([a-zA-Z\d])_(?=\d)/g, "$1");
}

export function generateFields({
    typeDeclaration,
    properties,
    context
}: {
    typeDeclaration?: FernIr.TypeDeclaration;
    properties: FernIr.ObjectProperty[];
    context: ModelGeneratorContext;
}): ruby.AstNode[] {
    return properties.map((prop, index) => {
        const fieldName = normalizeVariableNumber(prop.name.name.snakeCase.safeName);
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
