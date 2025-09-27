import { Severity } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { rust } from "@fern-api/rust-codegen";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export declare namespace DynamicTypeInstantiationMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: ConvertedAs;
    }

    type ConvertedAs = "key";
}

export class DynamicTypeInstantiationMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeInstantiationMapper.Args): rust.Expression {
        if (args.value == null && !this.context.isNullable(args.typeReference)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Expected non-null value, but got null"
            });
        }
        if (args.value == null) {
            return rust.Expression.none();
        }


        switch (args.typeReference.type) {
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value, value: args.value });
            case "literal":
                return this.convertLiteral({ literal: args.typeReference.value, value: args.value });
            case "unknown":
                return this.convertUnknown({ value: args.value });
            case "named":
                return this.convertNamed({ typeReference: args.typeReference, value: args.value });
            case "optional":
            case "nullable":
                return this.convertOptional({ typeReference: args.typeReference, value: args.value });
            case "list":
                return this.convertList({ typeReference: args.typeReference, value: args.value });
            default:
                return rust.Expression.raw('todo!("Unhandled type reference")');
        }
    }

    private convertPrimitive({
        primitive,
        value
    }: {
        primitive: FernIr.PrimitiveTypeV1;
        value: unknown;
    }): rust.Expression {
        switch (primitive) {
            case "STRING":
                return rust.Expression.methodCall({
                    target: rust.Expression.stringLiteral(value as string),
                    method: "to_string",
                    args: []
                });
            case "INTEGER":
                return rust.Expression.numberLiteral(value as number);
            case "LONG":
                return rust.Expression.numberLiteral(value as number);
            case "DOUBLE":
                return rust.Expression.numberLiteral(value as number);
            case "BOOLEAN":
                return rust.Expression.booleanLiteral(value as boolean);
            case "UUID":
                return rust.Expression.methodCall({
                    target: rust.Expression.stringLiteral(value as string),
                    method: "to_string",
                    args: []
                });
            case "DATE":
                return rust.Expression.methodCall({
                    target: rust.Expression.stringLiteral(value as string),
                    method: "to_string",
                    args: []
                });
            case "DATE_TIME":
                return rust.Expression.methodCall({
                    target: rust.Expression.stringLiteral(value as string),
                    method: "to_string",
                    args: []
                });
            case "BASE_64":
                return rust.Expression.methodCall({
                    target: rust.Expression.stringLiteral(value as string),
                    method: "to_string",
                    args: []
                });
            case "BIG_INTEGER":
                return rust.Expression.numberLiteral(value as number);
            default:
                return rust.Expression.raw(`todo!("Unhandled primitive: ${primitive}")`);
        }
    }

    private convertLiteral({
        literal,
        value
    }: {
        literal: FernIr.dynamic.LiteralType;
        value: unknown;
    }): rust.Expression {
        if (typeof literal?.value === "boolean") {
            return rust.Expression.booleanLiteral(literal.value);
        } else if (typeof literal?.value === "string") {
            return rust.Expression.methodCall({
                target: rust.Expression.stringLiteral(literal.value),
                method: "to_string",
                args: []
            });
        }
        return rust.Expression.raw('todo!("Unknown literal type")');
    }

    private convertUnknown({ value }: { value: unknown }): rust.Expression {
        if (value == null) {
            return rust.Expression.reference("None");
        }

        if (typeof value === "string") {
            return rust.Expression.methodCall({
                target: rust.Expression.stringLiteral(value),
                method: "to_string",
                args: []
            });
        }

        if (typeof value === "number") {
            return rust.Expression.numberLiteral(value);
        }

        if (typeof value === "boolean") {
            return rust.Expression.booleanLiteral(value);
        }

        if (Array.isArray(value)) {
            const elements = value.map((v) => this.convertUnknown({ value: v }));
            return rust.Expression.vec(elements);
        }

        if (typeof value === "object") {
            // Use serde_json for complex objects
            return rust.Expression.raw(`serde_json::json!(${JSON.stringify(value)})`);
        }

        return rust.Expression.stringLiteral("");
    }

    private convertNamed({
        typeReference,
        value
    }: {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
    }): rust.Expression {
        if (typeReference.type !== "named") {
            return rust.Expression.raw('todo!("Invalid named type reference")');
        }

        const typeId = typeReference.value;
        const namedType = this.context.ir.types[typeId];

        if (!namedType) {
            // Fallback to JSON if type not found
            if (typeof value === "object" && value != null) {
                return rust.Expression.raw(`serde_json::json!(${JSON.stringify(value)})`);
            }
            return rust.Expression.methodCall({
                target: rust.Expression.stringLiteral(String(value)),
                method: "to_string",
                args: []
            });
        }

        switch (namedType.type) {
            case "object":
                return this.convertObjectType({ objectType: namedType, value });
            case "alias": {
                // For aliases, create the type constructor with the converted value
                const aliasTypeName = this.context.getStructName(namedType.declaration.name);
                const innerValue = this.convert({ typeReference: namedType.typeReference, value });
                return rust.Expression.functionCall(aliasTypeName, [innerValue]);
            }
            case "enum":
                // For enums, use the enum variant
                return this.convertEnumType({ enumType: namedType, value });
            case "discriminatedUnion":
                return this.convertDiscriminatedUnionType({ unionType: namedType, value });
            case "undiscriminatedUnion":
                return this.convertUndiscriminatedUnionType({ unionType: namedType, value });
            default:
                // Fallback to JSON for unknown types
                if (typeof value === "object" && value != null) {
                    return rust.Expression.raw(`serde_json::json!(${JSON.stringify(value)})`);
                }
                return rust.Expression.methodCall({
                    target: rust.Expression.stringLiteral(String(value)),
                    method: "to_string",
                    args: []
                });
        }
    }

    private convertOptional({
        typeReference,
        value
    }: {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
    }): rust.Expression {
        if (value == null) {
            return rust.Expression.none();
        }
        // For optional/nullable, use the inner type's value structure
        const innerTypeRef =
            (typeReference as FernIr.dynamic.TypeReference.Optional | FernIr.dynamic.TypeReference.Nullable).value ||
            ({ type: "unknown" } as FernIr.dynamic.TypeReference);
        const innerValue = this.convert({ typeReference: innerTypeRef, value });
        return rust.Expression.functionCall("Some", [innerValue]);
    }

    private convertList({
        typeReference,
        value
    }: {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
    }): rust.Expression {
        if (!Array.isArray(value)) {
            return rust.Expression.vec([]);
        }
        // For lists, use the inner type's value structure
        const innerTypeRef =
            (typeReference as FernIr.dynamic.TypeReference.List).value ||
            ({ type: "unknown" } as FernIr.dynamic.TypeReference);
        const elements = value.map((item) => this.convert({ typeReference: innerTypeRef, value: item }));
        return rust.Expression.vec(elements);
    }

    private convertObjectType({
        objectType,
        value
    }: {
        objectType: FernIr.dynamic.ObjectType;
        value: unknown;
    }): rust.Expression {
        if (typeof value !== "object" || value == null) {
            return rust.Expression.raw('todo!("Expected object value for object type")');
        }

        const valueObj = value as Record<string, unknown>;
        const structName = this.context.getStructName(objectType.declaration.name);
        const structFields: Array<{ name: string; value: rust.Expression }> = [];

        // Convert each property of the object
        for (const property of objectType.properties) {
            const fieldName = this.context.getPropertyName(property.name.name);
            const fieldValue = valueObj[property.name.wireValue];

            if (fieldValue !== undefined) {
                const convertedValue = this.convert({
                    typeReference: property.typeReference,
                    value: fieldValue
                });
                structFields.push({
                    name: fieldName,
                    value: convertedValue
                });
            }
        }

        // Use struct construction for better type safety
        const mappedFields = structFields.map((field) => ({ name: field.name, value: field.value }));
        return rust.Expression.structConstruction(structName, mappedFields);
    }

    private convertEnumType({
        enumType,
        value
    }: {
        enumType: FernIr.dynamic.EnumType;
        value: unknown;
    }): rust.Expression {
        if (typeof value !== "string") {
            return rust.Expression.raw('todo!("Expected string value for enum type")');
        }

        const enumName = this.context.getEnumName(enumType.declaration.name);

        // Find the enum variant that matches the wire value
        const enumVariant = enumType.values.find((variant) => variant.wireValue === value);
        if (!enumVariant) {
            return rust.Expression.raw(`todo!("Unknown enum variant: ${value}")`);
        }

        const variantName = enumVariant.name.pascalCase.safeName;
        return rust.Expression.reference(`${enumName}::${variantName}`);
    }

    private convertDiscriminatedUnionType({
        unionType,
        value
    }: {
        unionType: FernIr.dynamic.DiscriminatedUnionType;
        value: unknown;
    }): rust.Expression {
        const discriminatedUnionTypeInstance = this.context.resolveDiscriminatedUnionTypeInstance({
            discriminatedUnion: unionType,
            value
        });

        if (discriminatedUnionTypeInstance == null) {
            return rust.Expression.raw('todo!("Could not resolve discriminated union variant")');
        }

        const unionVariant = discriminatedUnionTypeInstance.singleDiscriminatedUnionType;
        const unionName = this.context.getStructName(unionType.declaration.name);
        const variantName = unionVariant.discriminantValue.name.pascalCase.safeName;

        switch (unionVariant.type) {
            case "singleProperty": {
                // For single property variants, get the property value directly
                const record = this.context.getRecord(discriminatedUnionTypeInstance.value);
                if (record == null) {
                    return rust.Expression.reference(`${unionName}::${variantName}`);
                }

                const propertyValue = this.convert({
                    typeReference: unionVariant.typeReference,
                    value: record[unionVariant.discriminantValue.wireValue]
                });

                return rust.Expression.functionCall(`${unionName}::${variantName}`, [propertyValue]);
            }
            case "samePropertiesAsObject": {
                // For object-based variants, create the struct for the referenced type
                const referencedType = this.context.ir.types[unionVariant.typeId];
                if (!referencedType || referencedType.type !== "object") {
                    return rust.Expression.raw('todo!("Referenced type not found or not an object")');
                }

                const convertedObject = this.convertObjectType({
                    objectType: referencedType,
                    value: discriminatedUnionTypeInstance.value
                });

                return rust.Expression.functionCall(`${unionName}::${variantName}`, [convertedObject]);
            }
            case "noProperties": {
                return rust.Expression.reference(`${unionName}::${variantName}`);
            }
            default:
                return rust.Expression.raw('todo!("Unsupported union variant type")');
        }
    }

    private convertUndiscriminatedUnionType({
        unionType,
        value
    }: {
        unionType: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): rust.Expression {
        const unionName = this.context.getStructName(unionType.declaration.name);

        // Try each type in the union until one works
        for (let i = 0; i < unionType.types.length; i++) {
            const typeReference = unionType.types[i];
            if (!typeReference) {
                continue;
            }

            try {
                const converted = this.convert({ typeReference, value });

                // For undiscriminated unions in Rust, we need to create the appropriate variant
                // The variant name is typically based on the type (e.g., Actor, Director)
                const variantName = this.getUndiscriminatedUnionVariantName(typeReference);

                return rust.Expression.functionCall(`${unionName}::${variantName}`, [converted]);
            } catch (e) {
                continue;
            }
        }
        return rust.Expression.raw('todo!("No matching type in undiscriminated union")');
    }

    private getUndiscriminatedUnionVariantName(typeReference: FernIr.dynamic.TypeReference): string {
        switch (typeReference.type) {
            case "named":
                const namedType = this.context.ir.types[typeReference.value];
                if (namedType) {
                    return namedType.declaration.name.pascalCase.safeName;
                }
                return "Unknown";
            case "primitive":
                // Map primitive types to Rust variant names
                switch (typeReference.value) {
                    case "STRING": return "String";
                    case "INTEGER": return "Integer";
                    case "BOOLEAN": return "Boolean";
                    case "DOUBLE": return "Double";
                    default: return "Unknown";
                }
            default:
                return "Unknown";
        }
    }
}
