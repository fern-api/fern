import { DiscriminatedUnionTypeInstance, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { go } from "@fern-api/go-ast";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export declare namespace DynamicTypeInstantiationMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: ConvertedAs;
    }

    // Identifies what the type is being converted as, which sometimes influences how
    // the type is instantiated.
    type ConvertedAs = "key";
}

export class DynamicTypeInstantiationMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeInstantiationMapper.Args): go.TypeInstantiation {
        // eslint-disable-next-line eqeqeq
        if (args.value === null && !this.context.isNullable(args.typeReference)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Expected non-null value, but got null"
            });
        }
        if (args.value == null) {
            return go.TypeInstantiation.nop();
        }
        switch (args.typeReference.type) {
            case "list":
                return this.convertList({ list: args.typeReference.value, value: args.value });
            case "literal":
                return go.TypeInstantiation.nop();
            case "map":
                return this.convertMap({ map: args.typeReference, value: args.value });
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named == null) {
                    return go.TypeInstantiation.nop();
                }
                return this.convertNamed({ named, value: args.value, as: args.as });
            }
            case "nullable":
                return go.TypeInstantiation.optional(
                    this.convert({ typeReference: args.typeReference.value, value: args.value, as: args.as })
                );
            case "optional":
                return go.TypeInstantiation.optional(
                    this.convert({ typeReference: args.typeReference.value, value: args.value, as: args.as })
                );
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value, value: args.value, as: args.as });
            case "set":
                return this.convertList({ list: args.typeReference.value, value: args.value });
            case "unknown":
                return this.convertUnknown({ value: args.value });
            default:
                assertNever(args.typeReference);
        }
    }

    public convertToPointerIfPossible(args: DynamicTypeInstantiationMapper.Args): go.TypeInstantiation {
        const converted = this.convert(args);
        switch (args.typeReference.type) {
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named?.type === "enum") {
                    return go.TypeInstantiation.reference(
                        go.invokeMethod({
                            on: converted,
                            method: "Ptr",
                            arguments_: []
                        })
                    );
                }
                return converted;
            }
            default:
                return converted;
        }
    }

    private convertList({ list, value }: { list: FernIr.dynamic.TypeReference; value: unknown }): go.TypeInstantiation {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return go.TypeInstantiation.nop();
        }
        return go.TypeInstantiation.slice({
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: list }),
            values: value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ typeReference: list, value: v });
                } finally {
                    this.context.errors.unscope();
                }
            })
        });
    }

    private convertMap({ map, value }: { map: FernIr.dynamic.MapType; value: unknown }): go.TypeInstantiation {
        if (typeof value !== "object" || value == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected object but got: ${value == null ? "null" : typeof value}`
            });
            return go.TypeInstantiation.nop();
        }
        return go.TypeInstantiation.map({
            keyType: this.context.dynamicTypeMapper.convert({ typeReference: map.key }),
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: map.value }),
            entries: Object.entries(value).map(([key, value]) => {
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
        });
    }

    private convertNamed({
        named,
        value,
        as
    }: {
        named: FernIr.dynamic.NamedType;
        value: unknown;
        as?: DynamicTypeInstantiationMapper.ConvertedAs;
    }): go.TypeInstantiation {
        switch (named.type) {
            case "alias":
                return this.convertAlias({
                    aliasType: named,
                    value,
                    as
                });
            case "discriminatedUnion":
                return this.convertDiscriminatedUnion({
                    discriminatedUnion: named,
                    value
                });
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

    private convertAlias({
        aliasType,
        value,
        as
    }: {
        aliasType: FernIr.dynamic.NamedType.Alias;
        value: unknown;
        as?: DynamicTypeInstantiationMapper.ConvertedAs;
    }): go.TypeInstantiation {
        switch (aliasType.typeReference.type) {
            case "literal":
                return go.TypeInstantiation.reference(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: this.context.getTypeName(aliasType.declaration.name),
                            importPath: this.context.getImportPath(aliasType.declaration.fernFilepath)
                        }),
                        arguments_: [this.convertLiteralValue(aliasType.typeReference.value)]
                    })
                );
            default:
                return this.convert({ typeReference: aliasType.typeReference, value, as });
        }
    }

    private convertLiteralValue(literal: FernIr.dynamic.LiteralType): go.TypeInstantiation {
        switch (literal.type) {
            case "boolean":
                return go.TypeInstantiation.bool(literal.value);
            case "string":
                return go.TypeInstantiation.string(literal.value);
            default:
                assertNever(literal);
        }
    }

    private convertDiscriminatedUnion({
        discriminatedUnion,
        value
    }: {
        discriminatedUnion: FernIr.dynamic.DiscriminatedUnionType;
        value: unknown;
    }): go.TypeInstantiation {
        const structTypeReference = this.context.getGoTypeReferenceFromDeclaration({
            declaration: discriminatedUnion.declaration
        });
        const discriminatedUnionTypeInstance = this.context.resolveDiscriminatedUnionTypeInstance({
            discriminatedUnion,
            value
        });
        if (discriminatedUnionTypeInstance == null) {
            return go.TypeInstantiation.nop();
        }
        const unionVariant = discriminatedUnionTypeInstance.singleDiscriminatedUnionType;
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
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.structPointer({
                    typeReference: structTypeReference,
                    fields: [
                        {
                            name: this.context.getTypeName(unionVariant.discriminantValue.name),
                            value: this.convertNamed({ named, value: discriminatedUnionTypeInstance.value })
                        },
                        ...baseFields
                    ]
                });
            }
            case "singleProperty": {
                const record = this.context.getRecord(discriminatedUnionTypeInstance.value);
                if (record == null) {
                    return go.TypeInstantiation.nop();
                }
                try {
                    this.context.errors.scope(unionVariant.discriminantValue.wireValue);
                    return go.TypeInstantiation.structPointer({
                        typeReference: structTypeReference,
                        fields: [
                            {
                                name: this.context.getTypeName(unionVariant.discriminantValue.name),
                                value: this.convert({
                                    typeReference: unionVariant.typeReference,
                                    value: record[unionVariant.discriminantValue.wireValue]
                                })
                            },
                            ...baseFields
                        ]
                    });
                } finally {
                    this.context.errors.unscope();
                }
            }
            case "noProperties":
                return go.TypeInstantiation.structPointer({
                    typeReference: structTypeReference,
                    fields: [
                        {
                            // Unions with no properties require the discriminant property to be set.
                            name: this.context.getTypeName(discriminatedUnionTypeInstance.discriminantValue.name),
                            value: go.TypeInstantiation.string(unionVariant.discriminantValue.wireValue)
                        },
                        ...baseFields
                    ]
                });
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
    }): go.StructField[] {
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
                    name: this.context.getTypeName(property.name.name),
                    value: this.convert(property)
                };
            } finally {
                this.context.errors.unscope();
            }
        });
    }

    private convertObject({
        object_,
        value
    }: {
        object_: FernIr.dynamic.ObjectType;
        value: unknown;
    }): go.TypeInstantiation {
        const properties = this.context.associateByWireValue({
            parameters: object_.properties,
            values: this.context.getRecord(value) ?? {}
        });
        return go.TypeInstantiation.structPointer({
            typeReference: go.typeReference({
                name: this.context.getTypeName(object_.declaration.name),
                importPath: this.context.getImportPath(object_.declaration.fernFilepath)
            }),
            fields: properties.map((property) => {
                this.context.errors.scope(property.name.wireValue);
                try {
                    return {
                        name: this.context.getTypeName(property.name.name),
                        value: this.convert(property)
                    };
                } finally {
                    this.context.errors.unscope();
                }
            })
        });
    }

    private convertEnum({ enum_, value }: { enum_: FernIr.dynamic.EnumType; value: unknown }): go.TypeInstantiation {
        const name = this.getEnumValueName({ enum_, value });
        if (name == null) {
            return go.TypeInstantiation.nop();
        }
        return go.TypeInstantiation.enum(
            go.typeReference({
                name,
                importPath: this.context.getImportPath(enum_.declaration.fernFilepath)
            })
        );
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
        return `${this.context.getTypeName(enum_.declaration.name)}${this.context.getTypeName(enumValue.name)}`;
    }

    private convertUndiscriminatedUnion({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): go.TypeInstantiation {
        const result = this.findMatchingUndiscriminatedUnionType({
            undiscriminatedUnion,
            value
        });
        if (result == null) {
            return go.TypeInstantiation.nop();
        }
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference: result.valueTypeReference });
        if (fieldName == null) {
            return go.TypeInstantiation.nop();
        }
        return go.TypeInstantiation.structPointer({
            typeReference: this.context.getGoTypeReferenceFromDeclaration({
                declaration: undiscriminatedUnion.declaration
            }),
            fields: [
                {
                    name: fieldName,
                    value: result.typeInstantiation
                }
            ]
        });
    }

    private findMatchingUndiscriminatedUnionType({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): { valueTypeReference: FernIr.dynamic.TypeReference; typeInstantiation: go.TypeInstantiation } | undefined {
        for (const typeReference of undiscriminatedUnion.types) {
            if (this.typeReferenceMatchesValue({ typeReference, value })) {
                try {
                    const typeInstantiation = this.convert({ typeReference, value });
                    return { valueTypeReference: typeReference, typeInstantiation };
                } catch (e) {
                    continue;
                }
            }
        }
        this.context.errors.add({
            severity: Severity.Critical,
            message: `None of the types in the undiscriminated union matched the given "${typeof value}" value`
        });
        return undefined;
    }

    private typeReferenceMatchesValue({
        typeReference,
        value
    }: {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
    }): boolean {
        switch (typeReference.type) {
            case "named": {
                const named = this.context.resolveNamedType({ typeId: typeReference.value });
                if (named == null) {
                    return false;
                }
                return this.namedTypeMatchesValue({ named, value });
            }
            case "optional":
                return value === undefined || this.typeReferenceMatchesValue({ typeReference: typeReference.value, value });
            case "nullable":
                return value === null || this.typeReferenceMatchesValue({ typeReference: typeReference.value, value });
            case "list":
                return Array.isArray(value);
            case "set":
                return Array.isArray(value);
            case "map":
                return typeof value === "object" && value != null && !Array.isArray(value);
            case "primitive":
                return this.primitiveMatchesValue({ primitive: typeReference.value, value });
            case "literal":
                return this.literalMatchesValue({ literal: typeReference.value, value });
            case "unknown":
                return true;
            default:
                assertNever(typeReference);
        }
    }

    private namedTypeMatchesValue({ named, value }: { named: FernIr.dynamic.NamedType; value: unknown }): boolean {
        switch (named.type) {
            case "alias":
                return this.typeReferenceMatchesValue({ typeReference: named.typeReference, value });
            case "enum":
                return typeof value === "string";
            case "object":
                return this.objectMatchesValue({ object_: named, value });
            case "discriminatedUnion":
                return typeof value === "object" && value != null;
            case "undiscriminatedUnion":
                return named.types.some((typeReference) => this.typeReferenceMatchesValue({ typeReference, value }));
            default:
                assertNever(named);
        }
    }

    private objectMatchesValue({ object_, value }: { object_: FernIr.dynamic.ObjectType; value: unknown }): boolean {
        const record = this.context.getRecord(value);
        if (record == null) {
            return false;
        }
        for (const property of object_.properties) {
            if (this.isRequiredProperty(property) && !(property.name.wireValue in record)) {
                return false;
            }
        }
        return true;
    }

    private isRequiredProperty(property: FernIr.dynamic.NamedParameter): boolean {
        const typeRef = property.typeReference;
        if (typeRef.type === "optional" || typeRef.type === "nullable") {
            return false;
        }
        if (typeRef.type === "literal") {
            return false;
        }
        return true;
    }

    private primitiveMatchesValue({
        primitive,
        value
    }: {
        primitive: FernIr.dynamic.PrimitiveTypeV1;
        value: unknown;
    }): boolean {
        switch (primitive) {
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64":
            case "FLOAT":
            case "DOUBLE":
                return typeof value === "number";
            case "BOOLEAN":
                return typeof value === "boolean";
            case "STRING":
            case "DATE":
            case "DATE_TIME":
            case "UUID":
            case "BASE_64":
            case "BIG_INTEGER":
                return typeof value === "string";
            default:
                assertNever(primitive);
        }
    }

    private literalMatchesValue({
        literal,
        value
    }: {
        literal: FernIr.dynamic.LiteralType;
        value: unknown;
    }): boolean {
        switch (literal.type) {
            case "boolean":
                return typeof value === "boolean" && value === literal.value;
            case "string":
                return typeof value === "string" && value === literal.value;
            default:
                assertNever(literal);
        }
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
                return this.context.getTypeName(named.declaration.name);
            }
            case "optional":
                return this.getUndiscriminatedUnionFieldNameForOptional({ typeReference });
            case "nullable":
                return this.getUndiscriminatedUnionFieldNameForOptional({ typeReference });
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
        return `${fieldName}List`;
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
        return `${keyFieldName}${valueFieldName}Map`;
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
        return `${fieldName}Optional`;
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
        return `${fieldName}Set`;
    }

    private getUndiscriminatedUnionFieldNameForLiteral({
        literal
    }: {
        literal: FernIr.dynamic.LiteralType;
    }): string | undefined {
        switch (literal.type) {
            case "boolean":
                if (literal.value) {
                    return "TrueLiteral";
                }
                return "FalseLiteral";
            case "string":
                return `${literal.value}StringLiteral`;
            default:
                assertNever(literal);
        }
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
            case "DOUBLE":
                return "Double";
            case "BOOLEAN":
                return "Boolean";
            case "BIG_INTEGER":
            case "STRING":
                return "String";
            case "UUID":
                return "Uuid";
            case "DATE":
                return "Date";
            case "DATE_TIME":
                return "DateTime";
            case "BASE_64":
                return "Base64";
            default:
                assertNever(primitive);
        }
    }

    private convertUnknown({ value }: { value: unknown }): go.TypeInstantiation {
        return go.TypeInstantiation.any(value);
    }

    private convertPrimitive({
        primitive,
        value,
        as
    }: {
        primitive: FernIr.dynamic.PrimitiveTypeV1;
        value: unknown;
        as?: DynamicTypeInstantiationMapper.ConvertedAs;
    }): go.TypeInstantiation {
        switch (primitive) {
            case "INTEGER":
            case "UINT": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.int(num);
            }
            case "LONG":
            case "UINT_64": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.int64(num);
            }
            case "FLOAT":
            case "DOUBLE": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.float64(num);
            }
            case "BOOLEAN": {
                const bool = this.getValueAsBoolean({ value, as });
                if (bool == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.bool(bool);
            }
            case "STRING": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.string(str);
            }
            case "DATE": {
                const date = this.context.getValueAsString({ value });
                if (date == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.date(date);
            }
            case "DATE_TIME": {
                const dateTime = this.context.getValueAsString({ value });
                if (dateTime == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.dateTime(dateTime);
            }
            case "UUID": {
                const uuid = this.context.getValueAsString({ value });
                if (uuid == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.uuid(uuid);
            }
            case "BASE_64": {
                const base64 = this.context.getValueAsString({ value });
                if (base64 == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.bytes(base64);
            }
            case "BIG_INTEGER": {
                const bigInt = this.context.getValueAsString({ value });
                if (bigInt == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.string(bigInt);
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
        as?: DynamicTypeInstantiationMapper.ConvertedAs;
    }): number | undefined {
        const num = as === "key" ? (typeof value === "string" ? Number(value) : value) : value;
        return this.context.getValueAsNumber({ value: num });
    }

    private getValueAsBoolean({
        value,
        as
    }: {
        value: unknown;
        as?: DynamicTypeInstantiationMapper.ConvertedAs;
    }): boolean | undefined {
        const bool =
            as === "key" ? (typeof value === "string" ? value === "true" : value === "false" ? false : value) : value;
        return this.context.getValueAsBoolean({ value: bool });
    }
}
