import { ast, Writer } from "@fern-api/csharp-codegen";

import { FernIr } from "@fern-fern/ir-sdk";

import { ModelGeneratorContext } from "./ModelGeneratorContext";

export function generateFields(
    cls: ast.Class,
    {
        properties,
        className,
        context
    }: {
        properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[];
        className: string;
        context: ModelGeneratorContext;
    }
): ast.Field[] {
    return properties.map((property) => generateField(cls, { property, className, context }));
}

export function generateField(
    cls: ast.Class,
    {
        property,
        className,
        context,
        jsonProperty = true
    }: {
        property: FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty;
        className: string;
        context: ModelGeneratorContext;
        jsonProperty?: boolean;
    }
): ast.Field {
    const fieldType = context.csharpTypeMapper.convert({ reference: property.valueType });
    const maybeLiteralInitializer = context.getLiteralInitializerFromTypeReference({
        typeReference: property.valueType
    });
    const fieldAttributes = [];
    if (jsonProperty) {
        if ("propertyAccess" in property && property.propertyAccess) {
            fieldAttributes.push(context.createJsonAccessAttribute(property.propertyAccess));
        }
        fieldAttributes.push(context.createJsonPropertyNameAttribute(property.name.wireValue));
    }
    // if we are using readonly constants, we need to generate the accessors and initializer
    // so that deserialization works correctly  (ie, throws deserializing an incorrect value to a readonly constant)

    let accessors: ast.Field.Accessors | undefined;
    let initializer: ast.CodeBlock | undefined = maybeLiteralInitializer;
    let useRequired = true;

    if (context.generation.settings.enableReadonlyConstants && maybeLiteralInitializer) {
        accessors = {
            get: (writer: Writer) => {
                writer.writeNode(maybeLiteralInitializer);
            },
            set: (writer: Writer) => {
                writer.write("value.Assert(value ==");
                writer.writeNode(maybeLiteralInitializer);
                writer.write(`, "'${property.name}' must be " + `);

                writer.writeNode(maybeLiteralInitializer);
                writer.write(")");
            }
        };
        initializer = undefined;
        useRequired = false;
    }

    return cls.addField({
        origin: property,
        type: fieldType,
        access: ast.Access.Public,
        get: true,
        set: true,
        summary: property.docs,
        useRequired,
        initializer,
        annotations: fieldAttributes,
        accessors
    });
}

export function generateFieldForFileProperty(
    cls: ast.Class,
    {
        property,
        className,
        context
    }: {
        property: FernIr.FileProperty;
        className: string;
        context: ModelGeneratorContext;
    }
): ast.Field {
    const fieldType = context.csharpTypeMapper.convertFromFileProperty({ property });

    return cls.addField({
        origin: property.key,
        type: fieldType,
        access: ast.Access.Public,
        get: true,
        set: true,
        useRequired: !property.isOptional
    });
}
