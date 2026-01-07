import { ast, Writer } from "@fern-api/csharp-codegen";

import { FernIr } from "@fern-fern/ir-sdk";
import { TypeReference } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "./ModelGeneratorContext";

interface TypeInfo {
    isOptional: boolean;
    isNullable: boolean;
}

/**
 * Analyzes a TypeReference to determine if it's optional and/or nullable.
 * - optional: Type is wrapped in Optional<T> container
 * - nullable: Type is wrapped in nullable container OR optional with nullable inner type
 */
function analyzeTypeReference(typeReference: TypeReference, context: ModelGeneratorContext): TypeInfo {
    const result: TypeInfo = {
        isOptional: false,
        isNullable: false
    };

    let current: TypeReference = typeReference;

    // Unwrap containers and aliases to find optional/nullable wrappers
    while (true) {
        if (current.type === "container") {
            const container = current.container;

            if (container.type === "optional") {
                result.isOptional = true;
                current = container.optional;
            } else if (container.type === "nullable") {
                result.isNullable = true;
                // If we have nullable inside optional, keep unwrapping
                // e.g., optional<nullable<string>> -> Optional<string?> with both attributes
                if (result.isOptional) {
                    current = container.nullable;
                } else {
                    // nullable without optional -> just a nullable reference type with [Nullable]
                    current = container.nullable;
                }
            } else if (container.type === "list" || container.type === "set" || container.type === "map") {
                // Collections are not optional/nullable themselves
                break;
            } else if (container.type === "literal") {
                // Literals are not optional/nullable
                break;
            } else {
                break;
            }
        } else if (current.type === "named") {
            // Resolve aliases to their underlying types
            const typeDeclaration = context.model.dereferenceType(current.typeId).typeDeclaration;
            if (typeDeclaration.shape.type === "alias") {
                current = typeDeclaration.shape.aliasOf;
            } else {
                // Not an alias, we're done
                break;
            }
        } else {
            // Primitive, unknown, etc.
            break;
        }
    }

    return result;
}

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

    // Analyze the type to determine if it's optional and/or nullable
    const typeInfo = analyzeTypeReference(property.valueType, context);

    const fieldAttributes = [];
    if (jsonProperty) {
        if ("propertyAccess" in property && property.propertyAccess) {
            fieldAttributes.push(context.createJsonAccessAttribute(property.propertyAccess));
        }

        // Add Optional/Nullable attributes - combine them if both are present
        if (typeInfo.isOptional && typeInfo.isNullable) {
            // Both optional and nullable - use annotation group [Nullable, Optional]
            const items = [context.createNullableAttribute(), context.createOptionalAttribute()];
            fieldAttributes.push(context.csharp.annotationGroup({ items }));
        } else if (typeInfo.isOptional) {
            // Only optional
            fieldAttributes.push(context.createOptionalAttribute());
        } else if (typeInfo.isNullable) {
            // Only nullable
            fieldAttributes.push(context.createNullableAttribute());
        }

        fieldAttributes.push(context.createJsonPropertyNameAttribute(property.name.wireValue));
    }
    // if we are using readonly constants, we need to generate the accessors and initializer
    // so that deserialization works correctly  (ie, throws deserializing an incorrect value to a readonly constant)

    let accessors: ast.Field.Accessors | undefined;
    let initializer: ast.CodeBlock | undefined = maybeLiteralInitializer;
    let useRequired = true;

    // Read-only properties should not be required since users cannot set them
    if ("propertyAccess" in property && property.propertyAccess === "READ_ONLY") {
        useRequired = false;
    }

    if (context.generation.settings.enableReadonlyConstants && maybeLiteralInitializer) {
        accessors = {
            get: (writer: Writer) => {
                writer.writeNode(maybeLiteralInitializer);
            },
            set: (writer: Writer) => {
                writer.write("value.Assert(value == ");
                writer.writeNode(maybeLiteralInitializer);
                writer.write(`, string.Format("'${property.name.name.pascalCase.safeName}' must be {0}", `);
                writer.writeNode(maybeLiteralInitializer);
                writer.write("))");
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
