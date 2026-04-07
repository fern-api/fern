import { DiscriminatedUnionTypeInstance, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { python } from "@fern-api/python-ast";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext.js";

const UNION_VALUE_KEY = "value";

export declare namespace DynamicTypeLiteralMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: ConvertedAs;
    }

    // Identifies what the type is being converted as, which sometimes influences how
    // the type is instantiated.
    type ConvertedAs = "key";
}

export class DynamicTypeLiteralMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeLiteralMapper.Args): python.TypeInstantiation {
        // eslint-disable-next-line eqeqeq
        if (args.value === null) {
            if (this.context.isNullable(args.typeReference)) {
                return python.TypeInstantiation.none();
            }
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Expected non-null value, but got null"
            });
            return python.TypeInstantiation.nop();
        }
        if (args.value === undefined) {
            return python.TypeInstantiation.nop();
        }
        switch (args.typeReference.type) {
            case "list":
                return this.convertList({ list: args.typeReference.value, value: args.value });
            case "literal":
                return this.convertLiteral({ literalType: args.typeReference.value, value: args.value });
            case "map":
                return this.convertMap({ map: args.typeReference, value: args.value });
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named == null) {
                    return python.TypeInstantiation.nop();
                }
                return this.convertNamed({ named, value: args.value, as: args.as });
            }
            case "optional":
                return this.convert({ typeReference: args.typeReference.value, value: args.value, as: args.as });
            case "nullable":
                return this.convert({ typeReference: args.typeReference.value, value: args.value, as: args.as });
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value, value: args.value, as: args.as });
            case "set":
                return this.convertSet({ set: args.typeReference.value, value: args.value });
            case "unknown":
                return python.TypeInstantiation.unknown(args.value);
            default:
                assertNever(args.typeReference);
        }
    }

    private convertLiteral({
        literalType,
        value
    }: {
        literalType: FernIr.dynamic.LiteralType;
        value: unknown;
    }): python.TypeInstantiation {
        switch (literalType.type) {
            case "boolean": {
                const bool = this.context.getValueAsBoolean({ value });
                if (bool == null) {
                    return python.TypeInstantiation.nop();
                }
                return python.TypeInstantiation.bool(bool);
            }
            case "string": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return python.TypeInstantiation.nop();
                }
                return python.TypeInstantiation.str(str);
            }
            default:
                assertNever(literalType);
        }
    }

    private convertList({
        list,
        value
    }: {
        list: FernIr.dynamic.TypeReference;
        value: unknown;
    }): python.TypeInstantiation {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return python.TypeInstantiation.nop();
        }
        return python.TypeInstantiation.list(
            value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ typeReference: list, value: v });
                } finally {
                    this.context.errors.unscope();
                }
            }),
            { multiline: true }
        );
    }

    private convertSet({
        set,
        value
    }: {
        set: FernIr.dynamic.TypeReference;
        value: unknown;
    }): python.TypeInstantiation {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return python.TypeInstantiation.nop();
        }
        // Use list syntax instead of set literals because:
        // 1. SDK request parameters use typing.Sequence which expects lists
        // 2. Sets can't contain unhashable types like dicts in Python
        return python.TypeInstantiation.list(
            value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ typeReference: set, value: v });
                } finally {
                    this.context.errors.unscope();
                }
            }),
            { multiline: true }
        );
    }

    private convertMap({ map, value }: { map: FernIr.dynamic.MapType; value: unknown }): python.TypeInstantiation {
        if (typeof value !== "object" || value == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected object but got: ${value == null ? "null" : typeof value}`
            });
            return python.TypeInstantiation.nop();
        }
        return python.TypeInstantiation.dict(
            Object.entries(value).map(([key, value]) => {
                this.context.errors.scope(key);
                try {
                    return {
                        key: this.convert({ typeReference: map.key, value: key, as: "key" }),
                        value: this.convert({ typeReference: map.value, value })
                    };
                } finally {
                    this.context.errors.unscope();
                }
            }),
            { multiline: true }
        );
    }

    private convertNamed({
        named,
        value,
        as
    }: {
        named: FernIr.dynamic.NamedType;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): python.TypeInstantiation {
        switch (named.type) {
            case "alias": {
                return this.convert({ typeReference: named.typeReference, value, as });
            }
            case "discriminatedUnion":
                return this.convertDiscriminatedUnion({ discriminatedUnion: named, value });
            case "enum":
                return this.convertEnum({ enum_: named, value });
            case "object":
                return this.convertObject({ object_: named, value });
            case "undiscriminatedUnion":
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
    }): python.TypeInstantiation {
        const discriminatedUnionTypeInstance = this.context.resolveDiscriminatedUnionTypeInstance({
            discriminatedUnion,
            value
        });
        if (discriminatedUnionTypeInstance == null) {
            return python.TypeInstantiation.nop();
        }
        const unionVariant = discriminatedUnionTypeInstance.singleDiscriminatedUnionType;
        const unionProperties = this.convertDiscriminatedUnionProperties({
            discriminatedUnionTypeInstance,
            unionVariant
        });
        if (unionProperties == null) {
            return python.TypeInstantiation.nop();
        }
        const variantClassReference = this.context.getDiscriminatedUnionVariantClassReference({
            unionDeclaration: discriminatedUnion.declaration,
            discriminantValue: unionVariant.discriminantValue
        });
        return python.TypeInstantiation.reference(
            python.instantiateClass({
                classReference: variantClassReference,
                arguments_: unionProperties.map((entry) =>
                    python.methodArgument({ name: entry.name, value: entry.value })
                ),
                multiline: true
            })
        );
    }

    private convertDiscriminatedUnionProperties({
        discriminatedUnionTypeInstance,
        unionVariant
    }: {
        discriminatedUnionTypeInstance: DiscriminatedUnionTypeInstance;
        unionVariant: FernIr.dynamic.SingleDiscriminatedUnionType;
    }): python.NamedValue[] | undefined {
        const baseFields = this.getBaseFields({
            discriminatedUnionTypeInstance,
            singleDiscriminatedUnionType: unionVariant
        });
        switch (unionVariant.type) {
            case "samePropertiesAsObject": {
                const named = this.context.resolveNamedType({
                    typeId: unionVariant.typeId
                });
                if (named == null) {
                    return undefined;
                }
                if (named.type !== "object") {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: "Internal error; expected union value to be an object"
                    });
                    return undefined;
                }
                const objectEntries = this.convertObjectEntries({
                    object_: named,
                    value: discriminatedUnionTypeInstance.value
                });
                return [...baseFields, ...objectEntries];
            }
            case "singleProperty": {
                try {
                    this.context.errors.scope(unionVariant.discriminantValue.wireValue);
                    const record = this.context.getRecord(discriminatedUnionTypeInstance.value);
                    if (record == null) {
                        return [
                            ...baseFields,
                            {
                                name: UNION_VALUE_KEY,
                                value: this.convert({
                                    typeReference: unionVariant.typeReference,
                                    value: discriminatedUnionTypeInstance.value
                                })
                            }
                        ];
                    }
                    return [
                        ...baseFields,
                        {
                            name: this.context.getPropertyName(unionVariant.discriminantValue.name),
                            value: this.convert({
                                typeReference: unionVariant.typeReference,
                                value: record[unionVariant.discriminantValue.wireValue]
                            })
                        }
                    ];
                } finally {
                    this.context.errors.unscope();
                }
            }
            case "noProperties":
                return baseFields;
            default:
                assertNever(unionVariant);
        }
    }

    private getBaseFields({
        discriminatedUnionTypeInstance,
        singleDiscriminatedUnionType
    }: {
        discriminatedUnionTypeInstance: DiscriminatedUnionTypeInstance;
        singleDiscriminatedUnionType: FernIr.dynamic.SingleDiscriminatedUnionType;
    }): python.NamedValue[] {
        const properties = this.context.associateByWireValue({
            parameters: singleDiscriminatedUnionType.properties ?? [],
            values: this.context.getRecord(discriminatedUnionTypeInstance.value) ?? {},

            // We're only selecting the base properties here. The rest of the properties
            // are handled by the union variant.
            ignoreMissingParameters: true
        });
        return properties.map((property) => {
            this.context.errors.scope(property.name.wireValue);
            try {
                return {
                    name: this.context.getPropertyName(property.name.name),
                    value: this.convert(property)
                };
            } finally {
                this.context.errors.unscope();
            }
        });
    }

    private convertObjectEntries({
        object_,
        value
    }: {
        object_: FernIr.dynamic.ObjectType;
        value: unknown;
    }): python.NamedValue[] {
        const record = this.context.getRecord(value) ?? {};
        const properties = this.context.associateByWireValue({
            parameters: object_.properties,
            values: record
        });

        // Track which wire values have been provided in the example
        const providedWireValues = new Set<string>(Object.keys(record));

        const result = properties.map((property) => {
            this.context.errors.scope(property.name.wireValue);
            try {
                return {
                    name: this.context.getPropertyName(property.name.name),
                    value: this.convert(property)
                };
            } finally {
                this.context.errors.unscope();
            }
        });

        // Synthesize default values for required properties missing from the example.
        // This prevents generating invalid code like ClassName() when required fields are omitted.
        for (const property of object_.properties) {
            if (providedWireValues.has(property.name.wireValue)) {
                continue;
            }
            if (this.context.isOptional(property.typeReference) || this.context.isNullable(property.typeReference)) {
                continue;
            }
            const defaultValue = this.synthesizeDefaultValue(property.typeReference);
            if (!python.TypeInstantiation.isNop(defaultValue)) {
                result.push({
                    name: this.context.getPropertyName(property.name.name),
                    value: defaultValue
                });
            }
        }

        return result;
    }

    private convertObject({
        object_,
        value
    }: {
        object_: FernIr.dynamic.ObjectType;
        value: unknown;
    }): python.TypeInstantiation {
        const entries = this.convertObjectEntries({ object_, value });
        const classReference = this.context.getTypeClassReference(object_.declaration);
        return python.TypeInstantiation.reference(
            python.instantiateClass({
                classReference,
                arguments_: entries.map((entry) => python.methodArgument({ name: entry.name, value: entry.value })),
                multiline: true
            })
        );
    }

    private convertEnum({
        enum_,
        value
    }: {
        enum_: FernIr.dynamic.EnumType;
        value: unknown;
    }): python.TypeInstantiation {
        const enumValue = this.getEnumValue({ enum_, value });
        if (enumValue == null) {
            return python.TypeInstantiation.nop();
        }
        const enumType = this.context.customConfig.pydantic_config?.enum_type;
        if (enumType === "python_enums" || enumType === "forward_compatible_python_enums") {
            const classReference = this.context.getTypeClassReference(enum_.declaration);
            const memberName = enumValue.name.screamingSnakeCase.safeName;
            return python.TypeInstantiation.reference(
                python.accessAttribute({
                    lhs: classReference,
                    rhs: python.codeBlock(memberName)
                })
            );
        }
        return python.TypeInstantiation.str(enumValue.wireValue);
    }

    private getEnumValue({
        enum_,
        value
    }: {
        enum_: FernIr.dynamic.EnumType;
        value: unknown;
    }): FernIr.dynamic.NameAndWireValue | undefined {
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
        return enumValue;
    }

    private convertUndiscriminatedUnion({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): python.TypeInstantiation {
        const result = this.findMatchingUndiscriminatedUnionType({
            undiscriminatedUnion,
            value
        });
        if (result == null) {
            return python.TypeInstantiation.nop();
        }
        return result;
    }

    private findMatchingUndiscriminatedUnionType({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): python.TypeInstantiation | undefined {
        for (const typeReference of undiscriminatedUnion.types) {
            const errorsBefore = this.context.errors.size();
            try {
                const instantiation = this.convert({ typeReference, value });
                if (python.TypeInstantiation.isNop(instantiation)) {
                    this.context.errors.truncate(errorsBefore);
                    continue;
                }
                return instantiation;
            } catch {
                this.context.errors.truncate(errorsBefore);
                continue;
            }
        }
        this.context.errors.add({
            severity: Severity.Critical,
            message: `None of the types in the undiscriminated union matched the given "${typeof value}" value`
        });
        return undefined;
    }

    // =============================================================================
    // DEFAULT VALUE SYNTHESIS
    // =============================================================================

    /**
     * Synthesizes a reasonable default value for a given type reference.
     * Used to populate required fields that are missing from examples,
     * preventing invalid code generation (e.g. empty constructors for
     * types with required fields).
     */
    private synthesizeDefaultValue(
        typeReference: FernIr.dynamic.TypeReference,
        seen: Set<string> = new Set()
    ): python.TypeInstantiation {
        switch (typeReference.type) {
            case "optional":
            case "nullable":
                return python.TypeInstantiation.nop();
            case "primitive":
                return this.synthesizeDefaultPrimitive(typeReference.value);
            case "literal":
                return this.synthesizeDefaultLiteral(typeReference.value);
            case "list":
                return python.TypeInstantiation.list([]);
            case "set":
                return python.TypeInstantiation.list([]);
            case "map":
                return python.TypeInstantiation.dict([]);
            case "named": {
                if (seen.has(typeReference.value)) {
                    return python.TypeInstantiation.nop();
                }
                const named = this.context.resolveNamedType({ typeId: typeReference.value });
                if (named == null) {
                    return python.TypeInstantiation.nop();
                }
                return this.synthesizeDefaultNamed({ named, typeId: typeReference.value, seen });
            }
            case "unknown":
                return python.TypeInstantiation.nop();
            default:
                assertNever(typeReference);
        }
    }

    private synthesizeDefaultPrimitive(primitive: FernIr.dynamic.PrimitiveTypeV1): python.TypeInstantiation {
        switch (primitive) {
            case "STRING":
            case "BASE_64":
            case "BIG_INTEGER":
                return python.TypeInstantiation.str("string");
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64":
                return python.TypeInstantiation.int(1);
            case "FLOAT":
            case "DOUBLE":
                return python.TypeInstantiation.float(1.1);
            case "BOOLEAN":
                return python.TypeInstantiation.bool(true);
            case "DATE":
                return python.TypeInstantiation.date("2024-01-15");
            case "DATE_TIME":
            case "DATE_TIME_RFC_2822":
                return python.TypeInstantiation.datetime("2024-01-15T09:30:00Z");
            case "UUID":
                return python.TypeInstantiation.uuid("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32");
            default:
                assertNever(primitive);
        }
    }

    private synthesizeDefaultLiteral(literalType: FernIr.dynamic.LiteralType): python.TypeInstantiation {
        switch (literalType.type) {
            case "boolean":
                return python.TypeInstantiation.bool(literalType.value);
            case "string":
                return python.TypeInstantiation.str(literalType.value);
            default:
                assertNever(literalType);
        }
    }

    private synthesizeDefaultNamed({
        named,
        typeId,
        seen
    }: {
        named: FernIr.dynamic.NamedType;
        typeId: string;
        seen: Set<string>;
    }): python.TypeInstantiation {
        const newSeen = new Set(seen);
        newSeen.add(typeId);

        switch (named.type) {
            case "alias":
                return this.synthesizeDefaultValue(named.typeReference, newSeen);
            case "enum": {
                const firstValue = named.values[0];
                if (firstValue == null) {
                    return python.TypeInstantiation.nop();
                }
                const enumType = this.context.customConfig.pydantic_config?.enum_type;
                if (enumType === "python_enums" || enumType === "forward_compatible_python_enums") {
                    const classReference = this.context.getTypeClassReference(named.declaration);
                    const memberName = firstValue.name.screamingSnakeCase.safeName;
                    return python.TypeInstantiation.reference(
                        python.accessAttribute({
                            lhs: classReference,
                            rhs: python.codeBlock(memberName)
                        })
                    );
                }
                return python.TypeInstantiation.str(firstValue.wireValue);
            }
            case "object": {
                const entries: python.NamedValue[] = [];
                for (const property of named.properties) {
                    if (
                        this.context.isOptional(property.typeReference) ||
                        this.context.isNullable(property.typeReference)
                    ) {
                        continue;
                    }
                    const defaultValue = this.synthesizeDefaultValue(property.typeReference, newSeen);
                    if (!python.TypeInstantiation.isNop(defaultValue)) {
                        entries.push({
                            name: this.context.getPropertyName(property.name.name),
                            value: defaultValue
                        });
                    }
                }
                const classReference = this.context.getTypeClassReference(named.declaration);
                return python.TypeInstantiation.reference(
                    python.instantiateClass({
                        classReference,
                        arguments_: entries.map((entry) =>
                            python.methodArgument({ name: entry.name, value: entry.value })
                        ),
                        multiline: true
                    })
                );
            }
            case "discriminatedUnion":
            case "undiscriminatedUnion":
                return python.TypeInstantiation.nop();
            default:
                assertNever(named);
        }
    }

    // =============================================================================
    // PRIMITIVE CONVERSION
    // =============================================================================

    private convertPrimitive({
        primitive,
        value,
        as
    }: {
        primitive: FernIr.dynamic.PrimitiveTypeV1;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): python.TypeInstantiation {
        switch (primitive) {
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return python.TypeInstantiation.nop();
                }
                return python.TypeInstantiation.int(num);
            }
            case "FLOAT":
            case "DOUBLE": {
                const num = this.getValueAsNumber({ value });
                if (num == null) {
                    return python.TypeInstantiation.nop();
                }
                return python.TypeInstantiation.float(num);
            }
            case "BOOLEAN": {
                const bool = this.getValueAsBoolean({ value, as });
                if (bool == null) {
                    return python.TypeInstantiation.nop();
                }
                return python.TypeInstantiation.bool(bool);
            }
            case "BASE_64":
            case "BIG_INTEGER":
            case "STRING": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return python.TypeInstantiation.nop();
                }
                return python.TypeInstantiation.str(str);
            }
            case "UUID": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return python.TypeInstantiation.nop();
                }
                return python.TypeInstantiation.uuid(str);
            }
            case "DATE": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return python.TypeInstantiation.nop();
                }
                return python.TypeInstantiation.date(str);
            }
            case "DATE_TIME":
            case "DATE_TIME_RFC_2822": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return python.TypeInstantiation.nop();
                }
                return python.TypeInstantiation.datetime(str);
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
        const num = as === "key" ? (typeof value === "string" ? Number(value) : value) : value;
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
            as === "key" ? (typeof value === "string" ? value === "true" : value === "false" ? false : value) : value;
        return this.context.getValueAsBoolean({ value: bool });
    }
}
