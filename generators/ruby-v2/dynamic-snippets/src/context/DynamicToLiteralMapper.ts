import { DiscriminatedUnionTypeInstance, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { ruby } from "@fern-api/ruby-ast";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext.js";

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

    public convert(args: DynamicTypeLiteralMapper.Args): ruby.AstNode {
        // eslint-disable-next-line eqeqeq
        if (args.value === null) {
            if (this.context.isNullable(args.typeReference)) {
                return ruby.TypeLiteral.nil();
            }
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Expected non-null value, but got null"
            });
            return ruby.TypeLiteral.nop();
        }
        if (args.value === undefined) {
            return ruby.TypeLiteral.nop();
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
                    return ruby.TypeLiteral.nop();
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
                return ruby.TypeLiteral.nop();
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
    }): ruby.AstNode {
        switch (literalType.type) {
            case "boolean": {
                const bool = this.context.getValueAsBoolean({ value });
                if (bool == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.boolean(bool);
            }
            case "string": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.string(str);
            }
            default:
                assertNever(literalType);
        }
    }

    private convertList({ list, value }: { list: FernIr.dynamic.TypeReference; value: unknown }): ruby.AstNode {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return ruby.TypeLiteral.nop();
        }
        return ruby.TypeLiteral.list(
            value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ typeReference: list, value: v });
                } finally {
                    this.context.errors.unscope();
                }
            })
        );
    }

    private convertSet({ set, value }: { set: FernIr.dynamic.TypeReference; value: unknown }): ruby.AstNode {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return ruby.TypeLiteral.nop();
        }
        return ruby.TypeLiteral.set(
            value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ typeReference: set, value: v });
                } finally {
                    this.context.errors.unscope();
                }
            })
        );
    }

    private convertMap({ map, value }: { map: FernIr.dynamic.MapType; value: unknown }): ruby.AstNode {
        if (typeof value !== "object" || value == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected object but got: ${value == null ? "null" : typeof value}`
            });
            return ruby.TypeLiteral.nop();
        }
        return ruby.TypeLiteral.hash(
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
            })
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
    }): ruby.AstNode {
        switch (named.type) {
            case "alias": {
                return this.convert({ typeReference: named.typeReference, value, as });
            }
            case "discriminatedUnion":
                return this.convertDiscriminatedUnion({
                    discriminatedUnion: named,
                    value
                });
            case "object":
                return this.convertObject({ object: named, value });
            case "enum":
                return this.convertEnum({ enum_: named, value });
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
    }): ruby.AstNode {
        const discriminatedUnionTypeInstance = this.context.resolveDiscriminatedUnionTypeInstance({
            discriminatedUnion,
            value
        });
        if (discriminatedUnionTypeInstance == null) {
            return ruby.TypeLiteral.nop();
        }
        const unionVariant = discriminatedUnionTypeInstance.singleDiscriminatedUnionType;
        const unionProperties = this.convertDiscriminatedUnionProperties({
            discriminatedUnionTypeInstance,
            unionVariant
        });
        if (unionProperties == null) {
            return ruby.TypeLiteral.nop();
        }
        return ruby.TypeLiteral.hash(unionProperties);
    }

    private convertDiscriminatedUnionProperties({
        discriminatedUnionTypeInstance,
        unionVariant
    }: {
        discriminatedUnionTypeInstance: DiscriminatedUnionTypeInstance;
        unionVariant: FernIr.dynamic.SingleDiscriminatedUnionType;
    }): ruby.HashEntry[] | undefined {
        switch (unionVariant.type) {
            case "samePropertiesAsObject": {
                const named = this.context.resolveNamedType({
                    typeId: unionVariant.typeId
                });
                if (named == null) {
                    return undefined;
                }
                const converted = this.convertNamed({ named, value: discriminatedUnionTypeInstance.value });
                // For Ruby, we expect a hash back from convertNamed for objects
                // We need to extract the entries from the hash
                return this.extractHashEntries(converted);
            }
            case "singleProperty": {
                try {
                    this.context.errors.scope(unionVariant.discriminantValue.wireValue);
                    const record = this.context.getRecord(discriminatedUnionTypeInstance.value);
                    if (record == null) {
                        return [
                            {
                                key: ruby.TypeLiteral.string(
                                    this.context.getPropertyName(unionVariant.discriminantValue.name)
                                ),
                                value: this.convert({
                                    typeReference: unionVariant.typeReference,
                                    value: discriminatedUnionTypeInstance.value
                                })
                            }
                        ];
                    }
                    return [
                        {
                            key: ruby.TypeLiteral.string(
                                this.context.getPropertyName(unionVariant.discriminantValue.name)
                            ),
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
                return [];
            default:
                assertNever(unionVariant);
        }
    }

    private extractHashEntries(node: ruby.AstNode): ruby.HashEntry[] | undefined {
        // This is a workaround to extract hash entries from a TypeLiteral
        // We need to check if the node is a hash and extract its entries
        // For now, we'll return an empty array if we can't extract entries
        // The node should be a hash created by convertObject
        if (node instanceof ruby.TypeLiteral) {
            // TypeLiteral doesn't expose internal type, so we need to work around this
            // by re-converting the value as an object
            return undefined;
        }
        return undefined;
    }

    private convertEnum({ enum_, value }: { enum_: FernIr.dynamic.EnumType; value: unknown }): ruby.AstNode {
        const name = this.getEnumValueName({ enum_, value });
        if (name == null) {
            return ruby.TypeLiteral.nop();
        }
        // In Ruby, enum values are typically represented as strings
        return ruby.TypeLiteral.string(name);
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
        // Return the wire value for Ruby (as a string)
        return enumValue.wireValue;
    }

    private convertUndiscriminatedUnion({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): ruby.AstNode {
        const result = this.findMatchingUndiscriminatedUnionType({
            undiscriminatedUnion,
            value
        });
        if (result == null) {
            return ruby.TypeLiteral.nop();
        }
        return result;
    }

    private findMatchingUndiscriminatedUnionType({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): ruby.AstNode | undefined {
        for (const typeReference of undiscriminatedUnion.types) {
            // Clone the context to avoid polluting errors
            const clonedContext = this.context.clone();
            const clonedMapper = new DynamicTypeLiteralMapper({ context: clonedContext });
            const result = clonedMapper.convert({ typeReference, value });
            // If no errors were added, this type matched - return the already-converted result
            // to avoid duplicate errors from calling convert() again on the main context
            if (clonedContext.errors.empty()) {
                return result;
            }
        }
        this.context.errors.add({
            severity: Severity.Critical,
            message: `None of the types in the undiscriminated union matched the given "${typeof value}" value`
        });
        return undefined;
    }

    private convertPrimitive({
        primitive,
        value,
        as
    }: {
        primitive: FernIr.dynamic.PrimitiveTypeV1;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): ruby.AstNode {
        switch (primitive) {
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.integer(num);
            }
            case "FLOAT":
            case "DOUBLE": {
                const num = this.getValueAsNumber({ value });
                if (num == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.float(num);
            }
            case "BOOLEAN": {
                const bool = this.getValueAsBoolean({ value, as });
                if (bool == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.boolean(bool);
            }
            case "BASE_64":
            case "BIG_INTEGER":
            case "STRING": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.string(str);
            }
            case "UUID": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.string(str);
            }
            case "DATE": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.string(str);
            }
            case "DATE_TIME":
            case "DATE_TIME_RFC_2822": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.string(str);
            }
            default:
                assertNever(primitive);
        }
    }

    private convertObject({ object, value }: { object: FernIr.dynamic.ObjectType; value: unknown }): ruby.AstNode {
        if (typeof value !== "object" || value == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected object but got: ${value == null ? "null" : typeof value}`
            });
            return ruby.TypeLiteral.nop();
        }

        const entries = this.convertObjectEntries({ object, value });
        return ruby.TypeLiteral.hash(entries);
    }

    private convertObjectEntries({
        object,
        value
    }: {
        object: FernIr.dynamic.ObjectType;
        value: unknown;
    }): ruby.HashEntry[] {
        const record = (typeof value === "object" && value != null ? value : {}) as Record<string, unknown>;
        const providedWireValues = new Set<string>(Object.keys(record));

        const entries: ruby.HashEntry[] = [];

        // Convert provided values
        for (const [key, val] of Object.entries(record)) {
            this.context.errors.scope(key);
            const property = object.properties.find((p) => p.name.wireValue === key);
            const typeReference = property?.typeReference ?? { type: "unknown" as const };
            const propertyName = property?.name.name.snakeCase.safeName ?? key;
            const converted = this.convert({ typeReference, value: val });
            if (!ruby.TypeLiteral.isNop(converted)) {
                entries.push({
                    key: ruby.TypeLiteral.string(propertyName),
                    value: converted
                });
            }
            this.context.errors.unscope();
        }

        // Synthesize default values for required properties missing from the example
        for (const property of object.properties) {
            if (providedWireValues.has(property.name.wireValue)) {
                continue;
            }
            if (this.context.isOptional(property.typeReference) || this.context.isNullable(property.typeReference)) {
                continue;
            }
            const defaultValue = this.synthesizeDefaultValue(property.typeReference);
            if (!ruby.TypeLiteral.isNop(defaultValue)) {
                entries.push({
                    key: ruby.TypeLiteral.string(property.name.name.snakeCase.safeName),
                    value: defaultValue
                });
            }
        }

        return entries.filter((entry) => !ruby.TypeLiteral.isNop(entry.value));
    }

    // =============================================================================
    // DEFAULT VALUE SYNTHESIS
    // =============================================================================

    /**
     * Synthesizes a reasonable default value for a given type reference.
     * Used to populate required fields that are missing from examples,
     * preventing invalid code generation (e.g. empty hashes for types
     * with required fields).
     */
    public synthesizeDefaultValue(
        typeReference: FernIr.dynamic.TypeReference,
        seen: Set<string> = new Set()
    ): ruby.AstNode {
        switch (typeReference.type) {
            case "optional":
            case "nullable":
                return ruby.TypeLiteral.nop();
            case "primitive":
                return this.synthesizeDefaultPrimitive(typeReference.value);
            case "literal":
                return this.synthesizeDefaultLiteral(typeReference.value);
            case "list":
                return ruby.TypeLiteral.list([]);
            case "set":
                return ruby.TypeLiteral.list([]);
            case "map":
                return ruby.TypeLiteral.hash([]);
            case "named": {
                if (seen.has(typeReference.value)) {
                    return ruby.TypeLiteral.nop();
                }
                const named = this.context.resolveNamedType({ typeId: typeReference.value });
                if (named == null) {
                    return ruby.TypeLiteral.nop();
                }
                return this.synthesizeDefaultNamed({ named, typeId: typeReference.value, seen });
            }
            case "unknown":
                return ruby.TypeLiteral.nop();
            default:
                assertNever(typeReference);
        }
    }

    private synthesizeDefaultPrimitive(primitive: FernIr.dynamic.PrimitiveTypeV1): ruby.AstNode {
        switch (primitive) {
            case "STRING":
            case "BASE_64":
            case "BIG_INTEGER":
                return ruby.TypeLiteral.string("string");
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64":
                return ruby.TypeLiteral.integer(1);
            case "FLOAT":
            case "DOUBLE":
                return ruby.TypeLiteral.float(1.1);
            case "BOOLEAN":
                return ruby.TypeLiteral.boolean(true);
            case "DATE":
                return ruby.TypeLiteral.string("2024-01-15");
            case "DATE_TIME":
            case "DATE_TIME_RFC_2822":
                return ruby.TypeLiteral.string("2024-01-15T09:30:00Z");
            case "UUID":
                return ruby.TypeLiteral.string("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32");
            default:
                assertNever(primitive);
        }
    }

    private synthesizeDefaultLiteral(literalType: FernIr.dynamic.LiteralType): ruby.AstNode {
        switch (literalType.type) {
            case "boolean":
                return ruby.TypeLiteral.boolean(literalType.value);
            case "string":
                return ruby.TypeLiteral.string(literalType.value);
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
    }): ruby.AstNode {
        const newSeen = new Set(seen);
        newSeen.add(typeId);

        switch (named.type) {
            case "alias":
                return this.synthesizeDefaultValue(named.typeReference, newSeen);
            case "enum": {
                const firstValue = named.values[0];
                if (firstValue == null) {
                    return ruby.TypeLiteral.nop();
                }
                return ruby.TypeLiteral.string(firstValue.wireValue);
            }
            case "object": {
                const entries: ruby.HashEntry[] = [];
                for (const property of named.properties) {
                    if (
                        this.context.isOptional(property.typeReference) ||
                        this.context.isNullable(property.typeReference)
                    ) {
                        continue;
                    }
                    const defaultValue = this.synthesizeDefaultValue(property.typeReference, newSeen);
                    if (!ruby.TypeLiteral.isNop(defaultValue)) {
                        entries.push({
                            key: ruby.TypeLiteral.string(property.name.name.snakeCase.safeName),
                            value: defaultValue
                        });
                    }
                }
                return ruby.TypeLiteral.hash(entries);
            }
            case "discriminatedUnion":
            case "undiscriminatedUnion":
                return ruby.TypeLiteral.nop();
            default:
                assertNever(named);
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
        const bool = as === "key" ? (typeof value === "string" ? value === "true" : Boolean(value)) : value;
        return this.context.getValueAsBoolean({ value: bool });
    }
}
