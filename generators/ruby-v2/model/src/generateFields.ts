import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";

import { ModelGeneratorContext } from "./ModelGeneratorContext";

export function generateFields({
    properties,
    className,
    context
}: {
    properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[];
    className: string;
    context: ModelGeneratorContext;
}): ruby.Field[] {
    return properties.map((property) => generateField({ property, className, context }));
}

export function generateField({
    property,
    className,
    context
}: {
    property: FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty;
    className: string;
    context: ModelGeneratorContext;
}): ruby.Field {
    const fieldType = context.typeMapper.convert({ reference: property.valueType });

    return ruby.field({
        name: getPropertyName({ className, objectProperty: property.name }),
        type: fieldType,
        docs: property.docs,
        optional: property.valueType.type === "container" && property.valueType.container.type === "optional",
        nullable: property.valueType.type === "container" && property.valueType.container.type === "nullable"
    });
}

/**
 * Class Names and Property Names cannot overlap in C# otherwise there are compilation errors.
 */
function getPropertyName({
    className,
    objectProperty
}: {
    className: string;
    objectProperty: FernIr.NameAndWireValue;
}): string {
    const propertyName = objectProperty.name.snakeCase.safeName;
    if (propertyName === className) {
        return `${propertyName}_`;
    }
    return propertyName;
}
