import { csharp } from "@fern-api/csharp-codegen";

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
}): csharp.Field[] {
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
}): csharp.Field {
    const fieldType = context.csharpTypeMapper.convert({ reference: property.valueType });
    const maybeLiteralInitializer = context.getLiteralInitializerFromTypeReference({
        typeReference: property.valueType
    });
    const fieldAttributes = [];
    if ("propertyAccess" in property && property.propertyAccess) {
        fieldAttributes.push(context.createJsonAccessAttribute(property.propertyAccess));
    }

    return csharp.field({
        name: getPropertyName({ className, objectProperty: property.name, context }),
        type: fieldType,
        access: csharp.Access.Public,
        get: true,
        set: true,
        summary: property.docs,
        jsonPropertyName: property.name.wireValue,
        useRequired: true,
        initializer: maybeLiteralInitializer,
        annotations: fieldAttributes
    });
}

/**
 * Class Names and Property Names cannot overlap in C# otherwise there are compilation errors.
 */
function getPropertyName({
    className,
    objectProperty,
    context
}: {
    className: string;
    objectProperty: FernIr.NameAndWireValue;
    context: ModelGeneratorContext;
}): string {
    const propertyName = context.getPascalCaseSafeName(objectProperty.name);
    if (propertyName === className) {
        return `${propertyName}_`;
    }
    return propertyName;
}
