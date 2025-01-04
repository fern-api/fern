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
                return this.convert({ typeReference: named.typeReference, value, as });
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
                return this.convertUndicriminatedUnion({ undicriminatedUnion: named, value });
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

    private convertUndicriminatedUnion({
        undicriminatedUnion,
        value
    }: {
        undicriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): go.TypeInstantiation {
        const result = this.findMatchingUndiscriminatedUnionType({
            undicriminatedUnion,
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
                declaration: undicriminatedUnion.declaration
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
        undicriminatedUnion,
        value
    }: {
        undicriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): { valueTypeReference: FernIr.dynamic.TypeReference; typeInstantiation: go.TypeInstantiation } | undefined {
        for (const typeReference of undicriminatedUnion.types) {
            try {
                const typeInstantiation = this.convert({ typeReference, value });
                return { valueTypeReference: typeReference, typeInstantiation };
            } catch (e) {
                continue;
            }
        }
        this.context.errors.add({
            severity: Severity.Critical,
            message: `None of the types in the undicriminated union matched the given "${typeof value}" value`
        });
        return undefined;
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
                return this.getUndiscriminatedUnionFieldNameForOptional({ optional: typeReference });
            case "primitive":
                return this.getUndiscriminatedUnionFieldNameForPrimitive({ primitive: typeReference.value });
            case "set":
                return this.getUndiscriminatedUnionFieldNameForSet({ set: typeReference });
            case "unknown":
                return "Unknown";
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
        optional
    }: {
        optional: FernIr.dynamic.TypeReference.Optional;
    }): string | undefined {
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference: optional });
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
                return `${literal.value}BoolLiteral`;
            case "string":
                return `${literal.value}StringLiteral`;
            default:
                assertNever(literal);
        }
    }

    private getUndiscriminatedUnionFieldNameForPrimitive({ primitive }: { primitive: FernIr.PrimitiveTypeV1 }): string {
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
        primitive: FernIr.PrimitiveTypeV1;
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
                const str = this.getValueAsString({ value });
                if (str == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.string(str);
            }
            case "DATE": {
                const date = this.getValueAsString({ value });
                if (date == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.date(date);
            }
            case "DATE_TIME": {
                const dateTime = this.getValueAsString({ value });
                if (dateTime == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.dateTime(dateTime);
            }
            case "UUID": {
                const uuid = this.getValueAsString({ value });
                if (uuid == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.uuid(uuid);
            }
            case "BASE_64": {
                const base64 = this.getValueAsString({ value });
                if (base64 == null) {
                    return go.TypeInstantiation.nop();
                }
                return go.TypeInstantiation.bytes(base64);
            }
            case "BIG_INTEGER": {
                const bigInt = this.getValueAsString({ value });
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
        if (typeof num !== "number") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: this.newTypeMismatchError({ expected: "number", value }).message
            });
            return undefined;
        }
        return num;
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
        if (typeof bool !== "boolean") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: this.newTypeMismatchError({ expected: "boolean", value }).message
            });
            return undefined;
        }
        return bool;
    }

    private getValueAsString({ value }: { value: unknown }): string | undefined {
        if (typeof value !== "string") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: this.newTypeMismatchError({ expected: "string", value }).message
            });
            return undefined;
        }
        return value;
    }

    private newTypeMismatchError({ expected, value }: { expected: string; value: unknown }): Error {
        return new Error(`Expected ${expected} but got ${typeof value}`);
    }
}
