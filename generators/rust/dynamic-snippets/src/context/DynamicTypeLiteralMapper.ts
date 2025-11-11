import { Severity } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { rust } from "@fern-api/rust-codegen";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export declare namespace DynamicTypeLiteralMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: ConvertedAs;
    }

    type ConvertedAs = "mapKey" | "mapValue";
}

export class DynamicTypeLiteralMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeLiteralMapper.Args): rust.Expression {
        // Handle null values
        if (args.value == null) {
            if (this.context.isNullable(args.typeReference)) {
                return rust.Expression.none();
            } else {
                // For required fields, generate a placeholder value instead of None
                this.context.addScopedError(
                    "Expected non-null value, but got null. Using placeholder.",
                    Severity.Critical
                );
                return this.generatePlaceholderValue(args.typeReference);
            }
        }

        // Perform type validation before conversion
        if (!this.context.validateTypeReference(args.typeReference, args.value)) {
            this.context.addScopedError(
                `Type validation failed: expected ${args.typeReference.type}, got ${typeof args.value}`,
                Severity.Warning
            );
            // Continue with conversion but note the warning
        }

        switch (args.typeReference.type) {
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value, value: args.value, as: args.as });
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
            case "map":
                return this.convertMap({ map: args.typeReference as FernIr.dynamic.MapType, value: args.value });
            case "set":
                return this.convertSet({
                    set: args.typeReference as FernIr.dynamic.TypeReference.Set,
                    value: args.value
                });
            default:
                this.context.addScopedError("Unhandled type reference", Severity.Critical);
                return rust.Expression.raw("Default::default()");
        }
    }

    /**
     * Generate a placeholder value for required fields that have null/undefined data.
     * This ensures generated code compiles even with incomplete test data.
     */
    private generatePlaceholderValue(typeReference: FernIr.dynamic.TypeReference): rust.Expression {
        switch (typeReference.type) {
            case "primitive":
                return this.generatePrimitivePlaceholder(typeReference.value);
            case "named":
                return rust.Expression.raw("Default::default()");
            case "list":
                return rust.Expression.vec([]);
            case "set":
                return rust.Expression.raw("HashSet::new()");
            case "map":
                return rust.Expression.raw("HashMap::new()");
            case "literal":
                return this.convertLiteral({ literal: typeReference.value, value: typeReference.value.value });
            case "unknown":
                return rust.Expression.raw("serde_json::json!(null)");
            default:
                return rust.Expression.raw("Default::default()");
        }
    }

    private generatePrimitivePlaceholder(primitive: FernIr.PrimitiveTypeV1): rust.Expression {
        switch (primitive) {
            case "STRING":
            case "UUID":
            case "BASE_64":
            case "BIG_INTEGER":
                return rust.Expression.methodCall({
                    target: rust.Expression.stringLiteral("value"),
                    method: "to_string",
                    args: []
                });
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64":
                return rust.Expression.numberLiteral(0);
            case "FLOAT":
            case "DOUBLE":
                return rust.Expression.floatLiteral(0.0);
            case "BOOLEAN":
                return rust.Expression.booleanLiteral(false);
            case "DATE":
                return rust.Expression.raw('NaiveDate::parse_from_str("2024-01-01", "%Y-%m-%d").unwrap()');
            case "DATE_TIME":
                return rust.Expression.raw(
                    'DateTime::parse_from_rfc3339("2024-01-01T00:00:00Z").unwrap().with_timezone(&Utc)'
                );
            default:
                return rust.Expression.raw("Default::default()");
        }
    }

    private convertPrimitive({
        primitive,
        value,
        as
    }: {
        primitive: FernIr.PrimitiveTypeV1;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): rust.Expression {
        switch (primitive) {
            case "STRING": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return rust.Expression.raw("Default::default()");
                }
                return rust.Expression.methodCall({
                    target: rust.Expression.stringLiteral(str),
                    method: "to_string",
                    args: []
                });
            }
            case "INTEGER":
            case "LONG": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return rust.Expression.raw("Default::default()");
                }
                return rust.Expression.numberLiteral(num);
            }
            case "DOUBLE":
            case "FLOAT": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return rust.Expression.raw("Default::default()");
                }
                return rust.Expression.floatLiteral(num);
            }
            case "BOOLEAN": {
                const bool = this.getValueAsBoolean({ value, as });
                if (bool == null) {
                    return rust.Expression.raw("Default::default()");
                }
                return rust.Expression.booleanLiteral(bool);
            }
            case "UUID": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return rust.Expression.raw("Default::default()");
                }
                // Parse UUID from string: Uuid::parse_str("...").unwrap()
                return rust.Expression.methodCall({
                    target: rust.Expression.functionCall("Uuid::parse_str", [rust.Expression.stringLiteral(str)]),
                    method: "unwrap",
                    args: []
                });
            }
            case "DATE": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return rust.Expression.raw("Default::default()");
                }
                // Parse NaiveDate: NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()
                return rust.Expression.methodCall({
                    target: rust.Expression.functionCall("NaiveDate::parse_from_str", [
                        rust.Expression.stringLiteral(str),
                        rust.Expression.stringLiteral("%Y-%m-%d")
                    ]),
                    method: "unwrap",
                    args: []
                });
            }
            case "DATE_TIME": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return rust.Expression.raw("Default::default()");
                }
                // Parse DateTime: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap().with_timezone(&Utc)
                return rust.Expression.methodCall({
                    target: rust.Expression.methodCall({
                        target: rust.Expression.functionCall("DateTime::parse_from_rfc3339", [
                            rust.Expression.stringLiteral(str)
                        ]),
                        method: "unwrap",
                        args: []
                    }),
                    method: "with_timezone",
                    args: [rust.Expression.raw("&Utc")]
                });
            }
            case "BASE_64": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return rust.Expression.raw("Default::default()");
                }
                return rust.Expression.methodCall({
                    target: rust.Expression.stringLiteral(str),
                    method: "to_string",
                    args: []
                });
            }
            case "BIG_INTEGER": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return rust.Expression.raw("Default::default()");
                }
                return rust.Expression.methodCall({
                    target: rust.Expression.stringLiteral(str),
                    method: "to_string",
                    args: []
                });
            }
            case "UINT":
            case "UINT_64": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return rust.Expression.raw("Default::default()");
                }
                return rust.Expression.numberLiteral(num);
            }
            default:
                this.context.addScopedError(`Unhandled primitive: ${primitive}`, Severity.Critical);
                return rust.Expression.raw("Default::default()");
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
        this.context.addScopedError("Unknown literal type", Severity.Critical);
        return rust.Expression.raw("Default::default()");
    }

    private convertUnknown({ value }: { value: unknown }): rust.Expression {
        if (value == null) {
            return rust.Expression.reference("None");
        }

        // For unknown types, always use serde_json::json! to ensure proper type compatibility
        // This is especially important for map<string, unknown> which expects serde_json::Value
        return rust.Expression.raw(`serde_json::json!(${JSON.stringify(value)})`);
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
            this.context.addScopedError(`Type not found: ${typeId}`, Severity.Critical);
            return rust.Expression.raw("Default::default()");
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
                this.context.addScopedError("Unsupported named type", Severity.Critical);
                return rust.Expression.raw("Default::default()");
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

        const innerTypeRef =
            (typeReference as FernIr.dynamic.TypeReference.List).value ||
            ({ type: "unknown" } as FernIr.dynamic.TypeReference);

        const elements = value.map((item, index) => {
            this.context.scopeError(`[${index}]`);
            try {
                return this.convert({ typeReference: innerTypeRef, value: item });
            } finally {
                this.context.unscopeError();
            }
        });
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
            this.context.addScopedError("Expected object value for object type", Severity.Critical);
            return rust.Expression.raw("Default::default()");
        }

        const structName = this.context.getStructName(objectType.declaration.name);
        const valueRecord = this.context.getRecord(value) ?? {};

        // Check if this object extends another object (flattening case)
        const extendsInfo = this.getObjectExtensionInfo(objectType);

        if (extendsInfo) {
            return this.convertExtendedObject({
                objectType,
                value: valueRecord,
                structName,
                extendsInfo
            });
        }

        // Regular object handling - include ALL properties, setting missing optional ones to None
        const structFields: Array<{ name: string; value: rust.Expression }> = [];

        for (const property of objectType.properties) {
            this.context.scopeError(property.name.wireValue);
            try {
                const propertyName = this.context.getPropertyName(property.name.name);
                const wireValue = property.name.wireValue;

                let propertyValue: rust.Expression;

                // Check for _fields properties first (for #[serde(flatten)] support)
                // These properties don't exist in the JSON but need to be populated from parent data
                if (propertyName.endsWith("_fields") && property.typeReference.type === "named") {
                    // Special handling for _fields properties that should contain base object data
                    const baseTypeId = property.typeReference.value;
                    const baseType = this.context.ir.types[baseTypeId];

                    if (baseType && baseType.type === "object") {
                        propertyValue = this.convertObjectType({
                            objectType: baseType,
                            value: valueRecord // Use parent object's data
                        });
                    } else {
                        propertyValue = this.convert({
                            typeReference: property.typeReference,
                            value: valueRecord[wireValue]
                        });
                    }
                } else {
                    const hasValue = wireValue in valueRecord;

                    if (!hasValue) {
                        // Property not in value - check if it's optional
                        const isOptional = this.context.isNullable(property.typeReference);
                        if (isOptional) {
                            propertyValue = rust.Expression.none();
                        } else {
                            // Required field missing - add error and use default
                            this.context.addScopedError(`Required field '${wireValue}' is missing`, Severity.Critical);
                            propertyValue = rust.Expression.raw("Default::default()");
                        }
                    } else {
                        propertyValue = this.convert({
                            typeReference: property.typeReference,
                            value: valueRecord[wireValue]
                        });
                    }
                }

                structFields.push({
                    name: propertyName,
                    value: propertyValue
                });
            } finally {
                this.context.unscopeError();
            }
        }

        return rust.Expression.structConstruction(structName, structFields);
    }

    // Check if object extends another object (for flattening)
    private getObjectExtensionInfo(objectType: FernIr.dynamic.ObjectType): {
        baseObjectTypeId: string;
        baseObjectType: FernIr.dynamic.ObjectType;
        baseFieldName: string;
    } | null {
        // Check if extends information is available in the object
        const extendsProperty = (objectType as { extends?: string[] }).extends;
        if (extendsProperty && Array.isArray(extendsProperty) && extendsProperty.length > 0) {
            const baseTypeId = extendsProperty[0];
            if (baseTypeId) {
                const baseType = this.context.ir.types[baseTypeId];

                if (baseType && baseType.type === "object") {
                    // For Rust, the flattened field is typically named after the base type
                    const baseFieldName = this.getBaseFieldName(baseType.declaration.name);

                    return {
                        baseObjectTypeId: baseTypeId,
                        baseObjectType: baseType,
                        baseFieldName
                    };
                }
            }
        }

        // General case: Check if this object has properties that suggest it extends another object
        // Look for properties that might be flattened base objects
        const potentialBaseFieldProperty = objectType.properties.find((prop) => {
            const propertyName = prop.name.name.snakeCase.safeName;
            return propertyName.endsWith("_fields") && prop.typeReference.type === "named";
        });

        if (potentialBaseFieldProperty && potentialBaseFieldProperty.typeReference.type === "named") {
            const baseTypeId = potentialBaseFieldProperty.typeReference.value;
            const baseType = this.context.ir.types[baseTypeId];

            if (baseType && baseType.type === "object") {
                return {
                    baseObjectTypeId: baseTypeId,
                    baseObjectType: baseType,
                    baseFieldName: potentialBaseFieldProperty.name.name.snakeCase.safeName
                };
            }
        }

        return null;
    }

    // Convert object that extends another object (handles flattening)
    private convertExtendedObject({
        objectType,
        value,
        structName,
        extendsInfo
    }: {
        objectType: FernIr.dynamic.ObjectType;
        value: Record<string, unknown>;
        structName: string;
        extendsInfo: {
            baseObjectTypeId: string;
            baseObjectType: FernIr.dynamic.ObjectType;
            baseFieldName: string;
        };
    }): rust.Expression {
        const structFields: Array<{ name: string; value: rust.Expression }> = [];

        // Create the base object with all base properties
        const baseProperties = this.context.associateByWireValue({
            parameters: extendsInfo.baseObjectType.properties,
            values: value
        });

        const baseStructFields = baseProperties.map((property) => {
            this.context.scopeError(property.name.wireValue);
            try {
                return {
                    name: this.context.getPropertyName(property.name.name),
                    value: this.convert({
                        typeReference: property.typeReference,
                        value: property.value
                    })
                };
            } finally {
                this.context.unscopeError();
            }
        });

        const baseStructName = this.context.getStructName(extendsInfo.baseObjectType.declaration.name);
        const baseStruct = rust.Expression.structConstruction(baseStructName, baseStructFields);

        // Add the flattened base object field
        structFields.push({
            name: extendsInfo.baseFieldName,
            value: baseStruct
        });

        // Add the extended properties (those not in the base object)
        const extendedProperties = objectType.properties.filter(
            (prop) =>
                !extendsInfo.baseObjectType.properties.some(
                    (baseProp) => baseProp.name.wireValue === prop.name.wireValue
                )
        );

        const extendedPropsAssociated = this.context.associateByWireValue({
            parameters: extendedProperties,
            values: value
        });

        extendedPropsAssociated.forEach((property) => {
            this.context.scopeError(property.name.wireValue);
            try {
                structFields.push({
                    name: this.context.getPropertyName(property.name.name),
                    value: this.convert({
                        typeReference: property.typeReference,
                        value: property.value
                    })
                });
            } finally {
                this.context.unscopeError();
            }
        });

        return rust.Expression.structConstruction(structName, structFields);
    }

    // Generate the field name for the flattened base object
    private getBaseFieldName(baseName: FernIr.Name): string {
        // Convert "Movie" -> "movie_fields" (common Rust pattern)
        return `${baseName.snakeCase.safeName}_fields`;
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
            this.context.addScopedError("Could not resolve discriminated union variant", Severity.Critical);
            return rust.Expression.raw("Default::default()");
        }

        const unionVariant = discriminatedUnionTypeInstance.singleDiscriminatedUnionType;
        const unionName = this.context.getStructNameByDeclaration(unionType.declaration);
        const variantName = unionVariant.discriminantValue.name.pascalCase.safeName;

        // Handle different union variant types with correct Rust syntax
        switch (unionVariant.type) {
            case "singleProperty": {
                // For single property variants: UnionName::Variant { field_name: value, ...base_properties }
                const record = this.context.getRecord(discriminatedUnionTypeInstance.value);
                if (record == null) {
                    return rust.Expression.reference(`${unionName}::${variantName}`);
                }

                this.context.scopeError(unionVariant.discriminantValue.wireValue);
                try {
                    // Get the variant's main property value
                    const propertyValue = this.convert({
                        typeReference: unionVariant.typeReference,
                        value: record[unionVariant.discriminantValue.wireValue]
                    });

                    // Build all struct fields: variant value + base properties
                    const structFields: Array<{ name: string; value: rust.Expression }> = [
                        {
                            name: this.getUnionFieldName(unionVariant),
                            value: propertyValue
                        }
                    ];

                    // Add base/extended properties from the union
                    if (unionVariant.properties && unionVariant.properties.length > 0) {
                        for (const property of unionVariant.properties) {
                            const wireValue = property.name.wireValue;
                            const fieldName = property.name.name.snakeCase.safeName;
                            const fieldValue = record[wireValue];

                            this.context.scopeError(wireValue);
                            try {
                                const convertedValue = this.convert({
                                    typeReference: property.typeReference,
                                    value: fieldValue
                                });
                                structFields.push({
                                    name: fieldName,
                                    value: convertedValue
                                });
                            } finally {
                                this.context.unscopeError();
                            }
                        }
                    }

                    // Use struct syntax with all fields
                    return rust.Expression.structConstruction(`${unionName}::${variantName}`, structFields);
                } finally {
                    this.context.unscopeError();
                }
            }
            case "samePropertiesAsObject": {
                // For object-based variants: UnionName::Variant { data: ObjectStruct { ... } }
                const referencedType = this.context.ir.types[unionVariant.typeId];
                if (!referencedType || referencedType.type !== "object") {
                    this.context.addScopedError("Referenced union type not found or not an object", Severity.Critical);
                    return rust.Expression.reference(`${unionName}::${variantName}`);
                }

                const convertedObject = this.convertObjectType({
                    objectType: referencedType,
                    value: discriminatedUnionTypeInstance.value
                });

                // Use struct syntax with data field
                return rust.Expression.structConstruction(`${unionName}::${variantName}`, [
                    {
                        name: "data",
                        value: convertedObject
                    }
                ]);
            }
            case "noProperties": {
                // For no-properties variants: UnionName::Variant
                return rust.Expression.reference(`${unionName}::${variantName}`);
            }
            default:
                this.context.addScopedError("Unsupported union variant type", Severity.Critical);
                return rust.Expression.reference(`${unionName}::${variantName}`);
        }
    }

    // Helper to get the correct field name for union variants
    private getUnionFieldName(unionVariant: FernIr.dynamic.SingleDiscriminatedUnionType): string {
        // For single property variants, typically use "value" or the property name
        // This might need adjustment based on actual Rust SDK generation patterns
        return "value";
    }

    private convertUndiscriminatedUnionType({
        unionType,
        value
    }: {
        unionType: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): rust.Expression {
        const unionName = this.context.getStructNameByDeclaration(unionType.declaration);

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
        this.context.addScopedError("No matching type in undiscriminated union", Severity.Critical);
        return rust.Expression.raw("Default::default()");
    }

    private getUndiscriminatedUnionVariantName(typeReference: FernIr.dynamic.TypeReference): string {
        switch (typeReference.type) {
            case "named": {
                const namedType = this.context.ir.types[typeReference.value];
                if (namedType) {
                    return namedType.declaration.name.pascalCase.safeName;
                }
                return "Unknown";
            }
            case "primitive":
                // Map primitive types to Rust variant names
                switch (typeReference.value) {
                    case "STRING":
                        return "String";
                    case "INTEGER":
                        return "Integer";
                    case "BOOLEAN":
                        return "Boolean";
                    case "DOUBLE":
                        return "Double";
                    default:
                        return "Unknown";
                }
            default:
                return "Unknown";
        }
    }

    // Helper methods for value conversion with contextual support
    private getValueAsNumber({
        value,
        as
    }: {
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): number | undefined {
        const num = as === "mapKey" && typeof value === "string" ? Number(value) : value;
        return this.context.getValueAsNumber({ value: num });
    }

    private getValueAsBoolean({
        value,
        as
    }: {
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): boolean | undefined {
        const bool = (() => {
            switch (as) {
                case "mapKey": {
                    if (value === "true") {
                        return true;
                    }
                    if (value === "false") {
                        return false;
                    }
                    return value;
                }
                case "mapValue":
                case undefined:
                    return value;
                default:
                    return value;
            }
        })();
        return this.context.getValueAsBoolean({ value: bool });
    }

    // Map conversion method
    private convertMap({ map, value }: { map: FernIr.dynamic.MapType; value: unknown }): rust.Expression {
        if (typeof value !== "object" || value == null) {
            this.context.addScopedError(
                `Expected object but got: ${value == null ? "null" : typeof value}`,
                Severity.Critical
            );
            return rust.Expression.raw("Default::default()");
        }

        const entries = Object.entries(value).map(([key, mapValue]) => {
            this.context.scopeError(key);
            try {
                return [
                    this.convert({ typeReference: map.key, value: key, as: "mapKey" }),
                    this.convert({ typeReference: map.value, value: mapValue, as: "mapValue" })
                ];
            } finally {
                this.context.unscopeError();
            }
        });

        // Use a simpler approach for now since hashMapLiteral may not be available
        return rust.Expression.raw(
            `HashMap::from([${entries.map((entry) => `(${entry[0]}, ${entry[1]})`).join(", ")}])`
        );
    }

    // Set conversion method
    private convertSet({ set, value }: { set: FernIr.dynamic.TypeReference.Set; value: unknown }): rust.Expression {
        if (!Array.isArray(value)) {
            this.context.addScopedError(`Expected array but got: ${typeof value}`, Severity.Critical);
            return rust.Expression.raw("Default::default()");
        }

        const elements = value.map((v, index) => {
            this.context.scopeError(`[${index}]`);
            try {
                return this.convert({ typeReference: set.value, value: v });
            } finally {
                this.context.unscopeError();
            }
        });

        // Use vec! macro for better Rust generation
        const elementStrings = elements.map((el) => el.toString());
        return rust.Expression.raw(`HashSet::from([${elementStrings.join(", ")}])`);
    }
}
