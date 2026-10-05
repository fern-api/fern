import { getWireValue } from "@fern-api/base-generator";
import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export function generateFields({
    typeDeclaration,
    properties,
    context,
    documentFields = false
}: {
    typeDeclaration?: FernIr.TypeDeclaration;
    properties: FernIr.ObjectProperty[];
    context: ModelGeneratorContext;
    /* Whether to render each property's docs as a comment above its `field` declaration */
    documentFields?: boolean;
}): ruby.AstNode[] {
    return properties.map((prop, index) => {
        const fieldName = context.caseConverter.snakeSafe(prop.name);
        const wireValue = getWireValue(prop.name);
        const rubyType = context.typeMapper.convert({ reference: prop.valueType });

        let isCircular: boolean = false;
        if (typeDeclaration != null && prop.valueType.type === "named") {
            const propertyTypeDeclaration = context.getTypeDeclaration(prop.valueType.typeId);
            isCircular = propertyTypeDeclaration?.referencedTypes.has(typeDeclaration.name.typeId) ?? false;
        }

        const isOptional = hasWrapper(prop.valueType, "optional");
        const isNullable = hasWrapper(prop.valueType, "nullable");

        const docs = documentFields ? prop.docs?.trim() : undefined;

        return ruby.codeblock((writer) => {
            if (docs != null && docs !== "") {
                ruby.comment({ docs }).write(writer);
            }
            writer.write(`field :${fieldName}, `);
            writer.write("-> { ");
            rubyType.write(writer);
            writer.write(" }");
            writer.write(`, optional: ${isOptional}, nullable: ${isNullable}`);
            if (wireValue !== fieldName) {
                writer.write(`, api_name: "${wireValue}"`);
            }
        });
    });
}

/**
 * Whether the type is `optional`/`nullable`, including through the other wrapper, so that
 * `optional<nullable<T>>` is both optional and nullable.
 */
function hasWrapper(typeReference: FernIr.TypeReference, wrapper: "optional" | "nullable"): boolean {
    if (typeReference.type !== "container") {
        return false;
    }
    const container = typeReference.container;
    if (container.type === wrapper) {
        return true;
    }
    if (container.type === "optional") {
        return hasWrapper(container.optional, wrapper);
    }
    if (container.type === "nullable") {
        return hasWrapper(container.nullable, wrapper);
    }
    return false;
}
