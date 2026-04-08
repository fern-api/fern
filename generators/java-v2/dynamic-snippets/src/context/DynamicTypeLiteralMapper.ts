import { Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever, extractErrorMessage } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { java } from "@fern-api/java-ast";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext.js";

export declare namespace DynamicTypeLiteralMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: ConvertedAs;
        inUndiscriminatedUnion?: boolean;
        // Set to true when we've detected a nested optional+nullable type that should
        // collapse into OptionalNullable<T> (only relevant when collapse-optional-nullable is enabled).
        isCollapsedOptionalNullable?: boolean;
    }

    // Identifies what the type is being converted as, which sometimes influences how
    // the type is instantiated.
    type ConvertedAs = "mapKey" | "mapValue" | "request";
}

export class DynamicTypeLiteralMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    private usesOptionalNullable(): boolean {
        return this.context.customConfig?.["collapse-optional-nullable"] === true;
    }

    private wrapInOptionalIfNotNop(
        value: java.TypeLiteral,
        useOf: boolean = false,
        isCollapsedOptionalNullable: boolean = false
    ): java.TypeLiteral {
        if (java.TypeLiteral.isNop(value)) {
            return value;
        }
        if (isCollapsedOptionalNullable) {
            return this.context.getOptionalNullableOf(value);
        }
        return java.TypeLiteral.optional({ value, useOf });
    }

    public convert(args: DynamicTypeLiteralMapper.Args): java.TypeLiteral {
        // eslint-disable-next-line eqeqeq
        if (args.value === null) {
            if (this.context.isNullable(args.typeReference)) {
                return this.context.getNullableOfNull();
            }
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Expected non-null value, but got null"
            });
            return java.TypeLiteral.nop();
        }
        if (args.value === undefined) {
            return java.TypeLiteral.nop();
        }
        switch (args.typeReference.type) {
            case "list":
                return this.convertList({ list: args.typeReference.value, value: args.value, as: args.as });
            case "literal":
                return this.convertLiteral({ literal: args.typeReference.value, value: args.value });
            case "map":
                return this.convertMap({ map: args.typeReference, value: args.value, as: args.as });
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named == null) {
                    return java.TypeLiteral.nop();
                }
                return this.convertNamed({
                    named,
                    value: args.value,
                    as: args.as,
                    inUndiscriminatedUnion: args.inUndiscriminatedUnion
                });
            }
            case "nullable":
            case "optional": {
                if (
                    args.value === undefined ||
                    (typeof args.value === "object" &&
                        args.value !== null &&
                        Object.keys(args.value).length === 0 &&
                        args.typeReference.value.type === "named")
                ) {
                    // Use OptionalNullable.absent() only when the type is truly a collapsed
                    // optional+nullable (either detected here or propagated from outer recursion).
                    const isCollapsed =
                        args.isCollapsedOptionalNullable ||
                        (this.usesOptionalNullable() &&
                            (args.typeReference.value.type === "optional" ||
                                args.typeReference.value.type === "nullable"));
                    if (isCollapsed) {
                        return this.context.getOptionalNullableAbsent();
                    } else {
                        return java.TypeLiteral.reference(
                            java.invokeMethod({
                                on: java.classReference({
                                    name: "Optional",
                                    packageName: "java.util"
                                }),
                                method: "empty",
                                arguments_: []
                            })
                        );
                    }
                }

                if (args.typeReference.value.type === "list") {
                    const listLiteral = this.convertList({ list: args.typeReference.value.value, value: args.value });
                    return this.wrapInOptionalIfNotNop(listLiteral, true, args.isCollapsedOptionalNullable === true);
                }

                // When using OptionalNullable mode and we have nested optional/nullable,
                // skip wrapping since they collapse into a single OptionalNullable<T>
                if (
                    this.usesOptionalNullable() &&
                    (args.typeReference.value.type === "optional" || args.typeReference.value.type === "nullable")
                ) {
                    return this.convert({
                        typeReference: args.typeReference.value,
                        value: args.value,
                        as: args.as,
                        inUndiscriminatedUnion: args.inUndiscriminatedUnion,
                        isCollapsedOptionalNullable: true
                    });
                }

                const convertedValue = this.convert({
                    typeReference: args.typeReference.value,
                    value: args.value,
                    as: args.as,
                    inUndiscriminatedUnion: args.inUndiscriminatedUnion
                });
                // TODO(amckinney): The Java generator produces Map<T, Optional<U>> whenever the value is an optional.
                //
                // This is difficult to use in practice - we should update this to unbox the map values and remove this
                // flag.
                // When in an undiscriminated union, we always use Optional.of() for optional types
                const useOf = args.as === "mapValue" || args.inUndiscriminatedUnion === true;
                return this.wrapInOptionalIfNotNop(convertedValue, useOf, args.isCollapsedOptionalNullable === true);
            }
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value, value: args.value, as: args.as });
            case "set":
                return this.convertSet({ set: args.typeReference.value, value: args.value, as: args.as });
            case "unknown":
                return this.convertUnknown({ value: args.value });
            default:
                assertNever(args.typeReference);
        }
    }

    private convertList({
        list,
        value,
        as
    }: {
        list: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): java.TypeLiteral {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return java.TypeLiteral.nop();
        }

        const isItemOptional = list.type === "optional" || list.type === "nullable";

        return java.TypeLiteral.list({
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: list }),
            values: value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    if (isItemOptional) {
                        const itemValue = this.convert({ typeReference: list.value, value: v, as });
                        return this.wrapInOptionalIfNotNop(itemValue, true);
                    }
                    return this.convert({ typeReference: list, value: v, as });
                } finally {
                    this.context.errors.unscope();
                }
            }),
            isParameter: true // For dynamic snippets, we're generating method parameters
        });
    }

    private convertLiteral({
        literal,
        value
    }: {
        literal: FernIr.dynamic.LiteralType;
        value: unknown;
    }): java.TypeLiteral {
        switch (literal.type) {
            case "boolean": {
                const bool = this.context.getValueAsBoolean({ value });
                if (bool == null) {
                    return java.TypeLiteral.nop();
                }
                return java.TypeLiteral.boolean(bool);
            }
            case "string": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return java.TypeLiteral.nop();
                }
                return java.TypeLiteral.string(str);
            }
            default:
                assertNever(literal);
        }
    }

    private convertSet({
        set,
        value,
        as
    }: {
        set: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): java.TypeLiteral {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return java.TypeLiteral.nop();
        }
        return java.TypeLiteral.set({
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: set }),
            values: value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ typeReference: set, value: v, as });
                } finally {
                    this.context.errors.unscope();
                }
            })
        });
    }

    private convertMap({
        map,
        value,
        as
    }: {
        map: FernIr.dynamic.MapType;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): java.TypeLiteral {
        if (typeof value !== "object" || value == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected object but got: ${value == null ? "null" : typeof value}`
            });
            return java.TypeLiteral.nop();
        }
        return java.TypeLiteral.map({
            keyType: this.context.dynamicTypeMapper.convert({ typeReference: map.key }),
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: map.value }),
            entries: Object.entries(value).map(([key, value]) => {
                this.context.errors.scope(key);
                try {
                    return {
                        key: this.convert({ typeReference: map.key, value: key, as: "mapKey" }),
                        value: this.convert({
                            typeReference: map.value,
                            value,
                            as: "mapValue"
                        })
                    };
                } finally {
                    this.context.errors.unscope();
                }
            })
        });
    }

    private convertNamed({
        named,
        value,
        as,
        inUndiscriminatedUnion
    }: {
        named: FernIr.dynamic.NamedType;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
        inUndiscriminatedUnion?: boolean;
    }): java.TypeLiteral {
        switch (named.type) {
            case "alias":
                if (named.typeReference.type === "unknown") {
                    const convertedValue = this.convert({
                        typeReference: named.typeReference,
                        value,
                        as,
                        inUndiscriminatedUnion
                    });
                    return java.TypeLiteral.reference(
                        java.invokeMethod({
                            on: this.context.getJavaClassReferenceFromDeclaration({
                                declaration: named.declaration
                            }),
                            method: "of",
                            arguments_: [convertedValue]
                        })
                    );
                }
                return this.convert({ typeReference: named.typeReference, value, as, inUndiscriminatedUnion });
            case "discriminatedUnion":
                return this.convertDiscriminatedUnion({
                    discriminatedUnion: named,
                    value
                });
            case "enum":
                return this.convertEnum({ enum_: named, value });
            case "object":
                return this.convertObject({ object_: named, value, as, inUndiscriminatedUnion });
            case "undiscriminatedUnion":
                // Don't pass inUndiscriminatedUnion here - we're AT the undiscriminated union level,
                // not within it. The flag should only apply to the variants within the union.
                return this.convertUndiscriminatedUnion({ undiscriminatedUnion: named, value });
            default:
                assertNever(named);
        }
    }

    private convertDiscriminatedUnion({
        discriminatedUnion,
        value
    }: {
        discriminatedUnion: FernIr.dynamic.DiscriminatedUnionType;
        value: unknown;
    }): java.TypeLiteral {
        const classReference = this.context.getJavaClassReferenceFromDeclaration({
            declaration: discriminatedUnion.declaration
        });
        const discriminatedUnionTypeInstance = this.context.resolveDiscriminatedUnionTypeInstance({
            discriminatedUnion,
            value
        });
        if (discriminatedUnionTypeInstance == null) {
            return java.TypeLiteral.nop();
        }
        const unionVariant = discriminatedUnionTypeInstance.singleDiscriminatedUnionType;
        switch (unionVariant.type) {
            case "samePropertiesAsObject": {
                const named = this.context.resolveNamedType({
                    typeId: unionVariant.typeId
                });
                if (named == null) {
                    return java.TypeLiteral.nop();
                }
                return java.TypeLiteral.reference(
                    java.invokeMethod({
                        on: classReference,
                        method: this.context.getPropertyName(unionVariant.discriminantValue.name),
                        arguments_: [this.convertNamed({ named, value: discriminatedUnionTypeInstance.value })]
                    })
                );
            }
            case "singleProperty": {
                const record = this.context.getRecord(discriminatedUnionTypeInstance.value);
                if (record == null) {
                    return java.TypeLiteral.nop();
                }
                try {
                    this.context.errors.scope(unionVariant.discriminantValue.wireValue);
                    // For primitive union variants, the property key is always "value"
                    const propertyKey = "value";
                    return java.TypeLiteral.reference(
                        java.invokeMethod({
                            on: classReference,
                            method: this.context.getPropertyName(unionVariant.discriminantValue.name),
                            arguments_: [
                                this.convert({
                                    typeReference: unionVariant.typeReference,
                                    value: record[propertyKey]
                                })
                            ]
                        })
                    );
                } finally {
                    this.context.errors.unscope();
                }
            }
            case "noProperties":
                return java.TypeLiteral.reference(
                    java.invokeMethod({
                        on: classReference,
                        method: this.context.getPropertyName(unionVariant.discriminantValue.name),
                        arguments_: []
                    })
                );
            default:
                assertNever(unionVariant);
        }
    }

    private convertObject({
        object_,
        value,
        as,
        inUndiscriminatedUnion
    }: {
        object_: FernIr.dynamic.ObjectType;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
        inUndiscriminatedUnion?: boolean;
    }): java.TypeLiteral {
        const valueRecord = this.context.getRecord(value) ?? {};
        const properties = this.context.associateByWireValue({
            parameters: object_.properties,
            values: valueRecord
        });
        // Add missing required properties with default values to ensure valid staged builder code.
        // Java uses type-state staged builders where required fields must be set before build() can
        // be called. Without this, an empty value like {} would generate .builder().build() which
        // fails to compile when the builder has required stages.
        //
        // When inside undiscriminated union matching, throw on missing required properties instead
        // of adding defaults. This allows the matching to reject incorrect variants and try others.
        const existingWireValues = new Set(properties.map((p) => p.name.wireValue));
        for (const param of object_.properties) {
            if (!existingWireValues.has(param.name.wireValue) && !this.context.isOptional(param.typeReference)) {
                if (inUndiscriminatedUnion === true) {
                    throw new Error(`Required property "${param.name.wireValue}" is missing from value`);
                }
                const defaultValue = this.getDefaultValueForTypeReference(param.typeReference);
                if (defaultValue !== undefined) {
                    properties.push({
                        name: param.name,
                        typeReference: param.typeReference,
                        value: defaultValue
                    });
                }
            }
        }
        // Re-sort all properties (including newly added defaults) to match schema declaration order.
        // Java staged builders require method calls in the exact order defined by the schema.
        const paramOrderMap = new Map<string, number>();
        const declaredWireValues = new Set<string>();
        object_.properties.forEach((param, index) => {
            paramOrderMap.set(param.name.wireValue, index);
            declaredWireValues.add(param.name.wireValue);
        });
        properties.sort(
            (a, b) => (paramOrderMap.get(a.name.wireValue) ?? 0) - (paramOrderMap.get(b.name.wireValue) ?? 0)
        );
        const filteredProperties =
            as === "request"
                ? properties.filter((property) => !this.context.isDirectLiteral(property.typeReference))
                : properties;
        const builderParameters: java.BuilderParameter[] = [];
        for (const property of filteredProperties) {
            this.context.errors.scope(property.name.wireValue);
            try {
                const convertedValue = this.convert({
                    typeReference: property.typeReference,
                    value: property.value,
                    as,
                    inUndiscriminatedUnion
                });
                // If a required property converts to nop (e.g., invalid enum value for the wrong
                // union variant), throw to reject this variant during undiscriminated union matching.
                // Outside of union matching, just skip the nop value to produce best-effort output.
                if (java.TypeLiteral.isNop(convertedValue) && !this.context.isOptional(property.typeReference)) {
                    if (inUndiscriminatedUnion === true) {
                        throw new Error(`Required property "${property.name.wireValue}" could not be converted`);
                    }
                    continue;
                }
                builderParameters.push({
                    name: this.context.getMethodName(property.name.name),
                    value: convertedValue
                });
            } finally {
                this.context.errors.unscope();
            }
        }
        // Handle extra properties not in the schema via .additionalProperty() builder
        // calls so the serialized output matches the example data.
        for (const [key, val] of Object.entries(valueRecord)) {
            if (!declaredWireValues.has(key) && val !== undefined) {
                const rawValue = this.convertToRawJavaLiteral(val);
                if (rawValue != null) {
                    builderParameters.push({
                        name: "additionalProperty",
                        value: java.TypeLiteral.raw(`"${this.escapeJavaString(key)}", ${rawValue}`)
                    });
                }
            }
        }
        return java.TypeLiteral.builder({
            classReference: this.context.getJavaClassReferenceFromDeclaration({
                declaration: object_.declaration
            }),
            parameters: builderParameters
        });
    }

    private convertToRawJavaLiteral(value: unknown): string | null {
        if (typeof value === "string") {
            return `"${this.escapeJavaString(value)}"`;
        }
        if (typeof value === "number") {
            return value.toString();
        }
        if (typeof value === "boolean") {
            return value.toString();
        }
        if (value === null) {
            return "null";
        }
        return null;
    }

    private escapeJavaString(s: string): string {
        return s
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .replace(/\t/g, "\\t")
            .replace(/\r/g, "\\r");
    }

    private getDefaultValueForTypeReference(typeReference: FernIr.dynamic.TypeReference): unknown {
        switch (typeReference.type) {
            case "primitive":
                return this.getDefaultPrimitiveValue(typeReference.value);
            case "nullable":
                return null;
            case "optional":
                return undefined;
            case "list":
            case "set":
                return [];
            case "map":
                return {};
            case "named": {
                const named = this.context.resolveNamedType({ typeId: typeReference.value });
                if (named == null) {
                    return {};
                }
                switch (named.type) {
                    case "enum":
                        if (named.values.length > 0) {
                            const firstValue = named.values[0];
                            return firstValue != null ? firstValue.wireValue : undefined;
                        }
                        return undefined;
                    case "object":
                    case "alias":
                        return {};
                    case "discriminatedUnion":
                    case "undiscriminatedUnion":
                        // Cannot synthesize valid defaults for union types
                        return undefined;
                    default:
                        return {};
                }
            }
            case "literal":
                return typeReference.value.value;
            case "unknown":
                return {};
            default:
                assertNever(typeReference);
        }
    }

    private getDefaultPrimitiveValue(primitive: FernIr.dynamic.PrimitiveTypeV1): unknown {
        switch (primitive) {
            case "STRING":
                return "string";
            case "INTEGER":
            case "UINT":
                return 1;
            case "LONG":
            case "UINT_64":
                return 1000000;
            case "FLOAT":
            case "DOUBLE":
                return 1.1;
            case "BOOLEAN":
                return true;
            case "DATE":
                return "2024-01-15";
            case "DATE_TIME":
                return "2024-01-15T09:30:00Z";
            case "DATE_TIME_RFC_2822":
                return "Tue, 15 Jan 2024 09:30:00 +0000";
            case "UUID":
                return "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32";
            case "BASE_64":
                return "SGVsbG8gd29ybGQh";
            case "BIG_INTEGER":
                return "123456789";
            default:
                return "string";
        }
    }

    private convertEnum({ enum_, value }: { enum_: FernIr.dynamic.EnumType; value: unknown }): java.TypeLiteral {
        const name = this.getEnumValueName({ enum_, value });
        if (name == null) {
            return java.TypeLiteral.nop();
        }
        return java.TypeLiteral.enum_({
            classReference: this.context.getJavaClassReferenceFromDeclaration({
                declaration: enum_.declaration
            }),
            value: name
        });
    }

    private getEnumValueName({ enum_, value }: { enum_: FernIr.dynamic.EnumType; value: unknown }): string | undefined {
        if (typeof value !== "string") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected enum value string, got: ${typeof value}`
            });
            return undefined;
        }
        const enumValue = enum_.values.find((v) => v.wireValue === value);
        if (enumValue == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `An enum value named "${value}" does not exist in this context`
            });
            return undefined;
        }
        return this.context.getEnumName(enumValue.name);
    }

    private convertUndiscriminatedUnion({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): java.TypeLiteral {
        const result = this.findMatchingUndiscriminatedUnionType({
            undiscriminatedUnion,
            value
        });
        if (result == null) {
            return java.TypeLiteral.nop();
        }
        if (this.context.isPrimitive(result.valueTypeReference)) {
            // Primitive types overload the 'of' method rather than
            // defining a separate method from the type.
            return java.TypeLiteral.reference(
                java.invokeMethod({
                    on: this.context.getJavaClassReferenceFromDeclaration({
                        declaration: undiscriminatedUnion.declaration
                    }),
                    method: "of",
                    arguments_: [result.typeInstantiation]
                })
            );
        }
        // Use simple 'of' method name for consistency across all union factory methods
        // This matches the Java SDK's generated code pattern
        return java.TypeLiteral.reference(
            java.invokeMethod({
                on: this.context.getJavaClassReferenceFromDeclaration({
                    declaration: undiscriminatedUnion.declaration
                }),
                method: "of",
                arguments_: [result.typeInstantiation]
            })
        );
    }

    private findMatchingUndiscriminatedUnionType({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): { valueTypeReference: FernIr.dynamic.TypeReference; typeInstantiation: java.TypeLiteral } | undefined {
        const attemptedVariants: string[] = [];
        const variantErrors: string[] = [];

        for (const typeReference of undiscriminatedUnion.types) {
            const errorsBefore = this.context.errors.size();
            try {
                attemptedVariants.push(JSON.stringify(typeReference));
                const typeInstantiation = this.convert({
                    typeReference,
                    value,
                    inUndiscriminatedUnion: true
                });

                if (java.TypeLiteral.isNop(typeInstantiation)) {
                    this.context.errors.truncate(errorsBefore);
                    continue;
                }

                return { valueTypeReference: typeReference, typeInstantiation };
            } catch (e) {
                this.context.errors.truncate(errorsBefore);
                variantErrors.push(`Type ${JSON.stringify(typeReference)}: ${extractErrorMessage(e)}`);
                continue;
            }
        }

        this.context.errors.add({
            severity: Severity.Critical,
            message: `None of the types in the undiscriminated union matched the given "${typeof value}" value. Tried ${attemptedVariants.length} variants. Errors: ${variantErrors.join("; ")}`
        });

        // Instead of returning undefined (which causes invalid code generation),
        // throw an error to fail fast with a clear message
        const unionName = undiscriminatedUnion.declaration.name ?? "UnknownUnion";
        const detailedErrors = variantErrors.map((error, index) => `  ${index + 1}. ${error}`).join("\n");
        throw new Error(
            `Failed to match undiscriminated union "${unionName}" for ${typeof value} value.\n` +
                `Value: ${JSON.stringify(value)}\n` +
                `Attempted ${attemptedVariants.length} variants:\n${detailedErrors}\n\n` +
                `This prevents invalid snippet code generation that would cause formatter errors.`
        );
    }

    private getUndiscriminatedUnionFieldName({
        typeReference
    }: {
        typeReference: FernIr.dynamic.TypeReference;
    }): string | undefined {
        switch (typeReference.type) {
            case "list":
                return this.getUndiscriminatedUnionFieldNameForList({ list: typeReference });
            case "literal":
                return this.getUndiscriminatedUnionFieldNameForLiteral({ literal: typeReference.value });
            case "map":
                return this.getUndiscriminatedUnionFieldNameForMap({ map: typeReference });
            case "named": {
                const named = this.context.resolveNamedType({ typeId: typeReference.value });
                if (named == null) {
                    return undefined;
                }
                return this.context.getClassName(named.declaration.name);
            }
            case "optional":
                return this.getUndiscriminatedUnionFieldNameForOptional({ typeReference });
            case "nullable":
                return this.getUndiscriminatedUnionFieldNameForNullable({ typeReference });
            case "primitive":
                return this.getUndiscriminatedUnionFieldNameForPrimitive({ primitive: typeReference.value });
            case "set":
                return this.getUndiscriminatedUnionFieldNameForSet({ set: typeReference });
            case "unknown":
                return "Unknown";
            default:
                assertNever(typeReference);
        }
    }

    private getUndiscriminatedUnionFieldNameForList({
        list
    }: {
        list: FernIr.dynamic.TypeReference.List;
    }): string | undefined {
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference: list });
        if (fieldName == null) {
            return undefined;
        }
        return `ListOf${fieldName}`;
    }

    private getUndiscriminatedUnionFieldNameForMap({ map }: { map: FernIr.dynamic.MapType }): string | undefined {
        const keyFieldName = this.getUndiscriminatedUnionFieldName({ typeReference: map.key });
        if (keyFieldName == null) {
            return undefined;
        }
        const valueFieldName = this.getUndiscriminatedUnionFieldName({ typeReference: map.value });
        if (valueFieldName == null) {
            return undefined;
        }
        return `MapOf${keyFieldName}To${valueFieldName}`;
    }

    private getUndiscriminatedUnionFieldNameForOptional({
        typeReference
    }: {
        typeReference: FernIr.dynamic.TypeReference.Optional | FernIr.dynamic.TypeReference.Nullable;
    }): string | undefined {
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference });
        if (fieldName == null) {
            return undefined;
        }
        return `Optional${fieldName}`;
    }

    private getUndiscriminatedUnionFieldNameForNullable({
        typeReference
    }: {
        typeReference: FernIr.dynamic.TypeReference.Optional | FernIr.dynamic.TypeReference.Nullable;
    }): string | undefined {
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference });
        if (fieldName == null) {
            return undefined;
        }
        return `Nullable${fieldName}`;
    }

    private getUndiscriminatedUnionFieldNameForSet({
        set
    }: {
        set: FernIr.dynamic.TypeReference.Set;
    }): string | undefined {
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference: set });
        if (fieldName == null) {
            return undefined;
        }
        return `SetOf${fieldName}`;
    }

    private getUndiscriminatedUnionFieldNameForLiteral({
        literal: _literal
    }: {
        literal: FernIr.dynamic.LiteralType;
    }): string | undefined {
        // The Java SDK doesn't support literal types here.
        return undefined;
    }

    private getUndiscriminatedUnionFieldNameForPrimitive({
        primitive
    }: {
        primitive: FernIr.dynamic.PrimitiveTypeV1;
    }): string {
        switch (primitive) {
            case "INTEGER":
            case "UINT":
                return "Integer";
            case "LONG":
            case "UINT_64":
                return "Long";
            case "FLOAT":
                return "Float";
            case "DOUBLE":
                return "Double";
            case "BOOLEAN":
                return "Boolean";
            case "BIG_INTEGER":
                return "BigInteger";
            case "STRING":
                return "String";
            case "UUID":
                return "Uuid";
            case "DATE":
                return "Date";
            case "DATE_TIME":
                return "DateTime";
            case "DATE_TIME_RFC_2822":
                return "DateTimeRfc2822";
            case "BASE_64":
                return "Base64";
            default:
                assertNever(primitive);
        }
    }

    private convertUnknown({ value }: { value: unknown }): java.TypeLiteral {
        if (this.context.customConfig?.["generate-unknown-as-json-node"] === true) {
            return this.convertToJsonNode({ value });
        }
        return java.TypeLiteral.unknown(value);
    }

    private convertToJsonNode({ value }: { value: unknown }): java.TypeLiteral {
        const objectMappersClass = java.classReference({
            name: "ObjectMappers",
            packageName: this.context.getCorePackageName()
        });

        // For primitive values, wrap directly in valueToTree
        if (typeof value === "string") {
            return java.TypeLiteral.reference(
                java.invokeMethod({
                    on: java.codeblock((writer) => {
                        writer.writeNode(objectMappersClass);
                        writer.write(".JSON_MAPPER");
                    }),
                    method: "valueToTree",
                    arguments_: [java.TypeLiteral.string(value)]
                })
            );
        }

        if (typeof value === "number") {
            return java.TypeLiteral.reference(
                java.invokeMethod({
                    on: java.codeblock((writer) => {
                        writer.writeNode(objectMappersClass);
                        writer.write(".JSON_MAPPER");
                    }),
                    method: "valueToTree",
                    arguments_: [java.TypeLiteral.integer(value)]
                })
            );
        }

        if (typeof value === "boolean") {
            return java.TypeLiteral.reference(
                java.invokeMethod({
                    on: java.codeblock((writer) => {
                        writer.writeNode(objectMappersClass);
                        writer.write(".JSON_MAPPER");
                    }),
                    method: "valueToTree",
                    arguments_: [java.TypeLiteral.boolean(value)]
                })
            );
        }

        if (value === null) {
            return java.TypeLiteral.reference(
                java.invokeMethod({
                    on: java.codeblock((writer) => {
                        writer.writeNode(objectMappersClass);
                        writer.write(".JSON_MAPPER");
                    }),
                    method: "valueToTree",
                    arguments_: [java.TypeLiteral.raw(java.codeblock("null"))]
                })
            );
        }

        if (Array.isArray(value)) {
            return java.TypeLiteral.reference(
                java.invokeMethod({
                    on: java.codeblock((writer) => {
                        writer.writeNode(objectMappersClass);
                        writer.write(".JSON_MAPPER");
                    }),
                    method: "valueToTree",
                    arguments_: [
                        java.TypeLiteral.list({
                            valueType: java.Type.object(),
                            values: value.map((v) => java.TypeLiteral.unknown(v)),
                            isParameter: true
                        })
                    ]
                })
            );
        }

        if (typeof value === "object" && value !== null) {
            // For objects, create a map and wrap in valueToTree
            return java.TypeLiteral.reference(
                java.invokeMethod({
                    on: java.codeblock((writer) => {
                        writer.writeNode(objectMappersClass);
                        writer.write(".JSON_MAPPER");
                    }),
                    method: "valueToTree",
                    arguments_: [java.TypeLiteral.unknown(value)]
                })
            );
        }

        // Fallback to regular unknown handling
        return java.TypeLiteral.unknown(value);
    }

    private convertPrimitive({
        primitive,
        value,
        as
    }: {
        primitive: FernIr.dynamic.PrimitiveTypeV1;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): java.TypeLiteral {
        switch (primitive) {
            case "INTEGER":
            case "UINT": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return java.TypeLiteral.nop();
                }
                return java.TypeLiteral.integer(num);
            }
            case "LONG":
            case "UINT_64": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return java.TypeLiteral.nop();
                }
                return java.TypeLiteral.long(num);
            }
            case "FLOAT": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return java.TypeLiteral.nop();
                }
                return java.TypeLiteral.float(num);
            }
            case "DOUBLE": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return java.TypeLiteral.nop();
                }
                return java.TypeLiteral.double(num);
            }
            case "BOOLEAN": {
                const bool = this.getValueAsBoolean({ value, as });
                if (bool == null) {
                    return java.TypeLiteral.nop();
                }
                return java.TypeLiteral.boolean(bool);
            }
            case "STRING": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return java.TypeLiteral.nop();
                }
                return java.TypeLiteral.string(str);
            }
            case "DATE": {
                const date = this.context.getValueAsString({ value });
                if (date == null) {
                    return java.TypeLiteral.nop();
                }
                if (this.context.customConfig?.["use-local-date-for-dates"] === true) {
                    return java.TypeLiteral.date(date);
                }
                return java.TypeLiteral.string(date);
            }
            case "DATE_TIME":
            case "DATE_TIME_RFC_2822": {
                const dateTime = this.context.getValueAsString({ value });
                if (dateTime == null) {
                    return java.TypeLiteral.nop();
                }
                return java.TypeLiteral.dateTime(dateTime);
            }
            case "UUID": {
                const uuid = this.context.getValueAsString({ value });
                if (uuid == null) {
                    return java.TypeLiteral.nop();
                }
                return java.TypeLiteral.uuid(uuid);
            }
            case "BASE_64": {
                const base64 = this.context.getValueAsString({ value });
                if (base64 == null) {
                    return java.TypeLiteral.nop();
                }
                return java.TypeLiteral.bytes(base64);
            }
            case "BIG_INTEGER": {
                const bigInt = this.context.getValueAsString({ value });
                if (bigInt == null) {
                    return java.TypeLiteral.nop();
                }
                return java.TypeLiteral.bigInteger(bigInt);
            }
            default:
                assertNever(primitive);
        }
    }

    private getValueAsNumber({
        value,
        as
    }: {
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): number | undefined {
        const num = as === "mapKey" ? (typeof value === "string" ? Number(value) : value) : value;
        return this.context.getValueAsNumber({ value: num });
    }

    private getValueAsBoolean({
        value,
        as
    }: {
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): boolean | undefined {
        const bool =
            as === "mapKey"
                ? typeof value === "string"
                    ? value === "true"
                    : value === "false"
                      ? false
                      : value
                : value;
        return this.context.getValueAsBoolean({ value: bool });
    }
}
