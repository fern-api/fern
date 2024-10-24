import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-codegen";
import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";
import { dynamic as DynamicSnippets, PrimitiveTypeV1 } from "@fern-fern/ir-sdk/api";

export declare namespace DynamicTypeInstantiationMapper {
    interface Args {
        typeReference: DynamicSnippets.TypeReference;
        value: unknown;
    }
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
                const named = this.context.resolveNamedTypeOrThrow({ typeId: args.typeReference.value });
                return this.convertNamed({ named, value: args.value });
            }
            case "optional":
                return go.TypeInstantiation.optional(
                    this.convert({ typeReference: args.typeReference.value, value: args.value })
                );
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value, value: args.value });
            case "set":
                return this.convertList({ list: args.typeReference.value, value: args.value });
            case "unknown":
                return this.convertUnknown({ value: args.value });
            default:
                assertNever(args.typeReference);
        }
    }

    private convertList({
        list,
        value
    }: {
        list: DynamicSnippets.TypeReference;
        value: unknown;
    }): go.TypeInstantiation {
        if (!Array.isArray(value)) {
            throw new Error(`Expected array but got: ${JSON.stringify(value)}`);
        }
        return go.TypeInstantiation.slice({
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: list }),
            values: value.map((v) => this.convert({ typeReference: list, value: v }))
        });
    }

    private convertMap({ map, value }: { map: DynamicSnippets.MapType; value: unknown }): go.TypeInstantiation {
        if (typeof value !== "object" || value == null) {
            throw new Error(`Expected object but got: ${JSON.stringify(value)}`);
        }
        return go.TypeInstantiation.map({
            keyType: this.context.dynamicTypeMapper.convert({ typeReference: map.key }),
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: map.value }),
            entries: Object.entries(value).map(([key, value]) => ({
                key: this.convert({ typeReference: map.key, value: key }),
                value: this.convert({ typeReference: map.value, value })
            }))
        });
    }

    private convertNamed({ named, value }: { named: DynamicSnippets.NamedType; value: unknown }): go.TypeInstantiation {
        switch (named.type) {
            case "alias":
                return this.convert({ typeReference: named.typeReference, value });
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
        discriminatedUnion: DynamicSnippets.DiscriminatedUnionType;
        value: unknown;
    }): go.TypeInstantiation {
        const structTypeReference = this.context.getGoTypeReferenceFromDeclaration({
            declaration: discriminatedUnion.declaration
        });
        const discriminatedUnionTypeInstance = this.context.resolveDiscriminatedUnionTypeInstanceOrThrow({
            discriminatedUnion,
            value
        });

        const singleDiscriminatedUnionType = discriminatedUnionTypeInstance.singleDiscriminatedUnionType;
        const properties = this.context.associateByWireValue({
            parameters: singleDiscriminatedUnionType.properties ?? [],
            values: this.context.getRecordOrThrow(discriminatedUnionTypeInstance.value)
        });
        const fields = properties.map((property) => ({
            name: this.context.getTypeName(property.name),
            value: this.convert(property)
        }));

        switch (singleDiscriminatedUnionType.type) {
            case "samePropertiesAsObject": {
                const named = this.context.resolveNamedTypeOrThrow({
                    typeId: singleDiscriminatedUnionType.typeId
                });
                return go.TypeInstantiation.structPointer({
                    typeReference: structTypeReference,
                    fields: [
                        {
                            name: this.context.getTypeName(discriminatedUnionTypeInstance.discriminantValue.name),
                            value: this.convertNamed({ named, value: discriminatedUnionTypeInstance.value })
                        },
                        ...fields
                    ]
                });
            }
            case "singleProperty": {
                const record = this.context.getRecordOrThrow(discriminatedUnionTypeInstance.value);
                return go.TypeInstantiation.structPointer({
                    typeReference: structTypeReference,
                    fields: [
                        {
                            name: this.context.getTypeName(discriminatedUnionTypeInstance.discriminantValue.name),
                            value: this.convert({
                                typeReference: singleDiscriminatedUnionType.typeReference,
                                value: record[singleDiscriminatedUnionType.discriminantValue.wireValue]
                            })
                        },
                        ...fields
                    ]
                });
            }
            case "noProperties":
                return go.TypeInstantiation.structPointer({
                    typeReference: structTypeReference,
                    fields: [
                        {
                            // Unions with no properties require the discriminant property to be set.
                            name: this.context.getTypeName(discriminatedUnionTypeInstance.discriminantValue.name),
                            value: go.TypeInstantiation.string(singleDiscriminatedUnionType.discriminantValue.wireValue)
                        },
                        ...fields
                    ]
                });
            default:
                assertNever(singleDiscriminatedUnionType);
        }
    }

    private convertObject({
        object_,
        value
    }: {
        object_: DynamicSnippets.ObjectType;
        value: unknown;
    }): go.TypeInstantiation {
        const properties = this.context.associateByWireValue({
            parameters: object_.properties,
            values: this.context.getRecordOrThrow(value)
        });
        return go.TypeInstantiation.structPointer({
            typeReference: go.typeReference({
                name: this.context.getTypeName(object_.declaration.name),
                importPath: this.context.getImportPath(object_.declaration.fernFilepath)
            }),
            fields: properties.map((property) => ({
                name: this.context.getTypeName(property.name),
                value: this.convert(property)
            }))
        });
    }

    private convertEnum({ enum_, value }: { enum_: DynamicSnippets.EnumType; value: unknown }): go.TypeInstantiation {
        return go.TypeInstantiation.enum(
            go.typeReference({
                name: this.getEnumValueNameOrThrow({ enum_, value }),
                importPath: this.context.getImportPath(enum_.declaration.fernFilepath)
            })
        );
    }

    private getEnumValueNameOrThrow({ enum_, value }: { enum_: DynamicSnippets.EnumType; value: unknown }): string {
        if (typeof value !== "string") {
            throw new Error(`Expected enum value string, got: ${JSON.stringify(value)}`);
        }
        const enumValue = enum_.values.find((v) => v.wireValue === value);
        if (enumValue == null) {
            throw new Error(`An enum value named "${value}" does not exist in this context`);
        }
        return `${this.context.getTypeName(enum_.declaration.name)}${this.context.getTypeName(enumValue.name)}`;
    }

    private convertUndicriminatedUnion({
        undicriminatedUnion,
        value
    }: {
        undicriminatedUnion: DynamicSnippets.UndiscriminatedUnionType;
        value: unknown;
    }): go.TypeInstantiation {
        const structTypeReference = this.context.getGoTypeReferenceFromDeclaration({
            declaration: undicriminatedUnion.declaration
        });
        let valueTypeReference: DynamicSnippets.TypeReference | undefined;
        for (const typeReference of undicriminatedUnion.types) {
            try {
                value = this.convert({ typeReference, value });
                break;
            } catch (e) {
                continue;
            }
        }
        if (valueTypeReference == null) {
            throw new Error(
                `None of the types in the undicriminated union matched the given value: ${JSON.stringify(value)}`
            );
        }
        const fieldName = this.getUndiscriminatedUnionFieldName({ typeReference: valueTypeReference });
        return go.TypeInstantiation.structPointer({
            typeReference: structTypeReference,
            fields: [{ name: fieldName, value: this.convert({ typeReference: valueTypeReference, value }) }]
        });
    }

    private getUndiscriminatedUnionFieldName({
        typeReference
    }: {
        typeReference: DynamicSnippets.TypeReference;
    }): string {
        switch (typeReference.type) {
            case "list":
                return this.getUndiscriminatedUnionFieldNameForList({ list: typeReference });
            case "literal":
                return this.getUndiscriminatedUnionFieldNameForLiteral({ literal: typeReference.value });
            case "map":
                return this.getUndiscriminatedUnionFieldNameForMap({ map: typeReference });
            case "named": {
                const named = this.context.resolveNamedTypeOrThrow({ typeId: typeReference.value });
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

    private getUndiscriminatedUnionFieldNameForList({ list }: { list: DynamicSnippets.TypeReference.List }): string {
        return `${this.getUndiscriminatedUnionFieldName({ typeReference: list })}List`;
    }

    private getUndiscriminatedUnionFieldNameForMap({ map }: { map: DynamicSnippets.MapType }): string {
        return `${this.getUndiscriminatedUnionFieldName({
            typeReference: map.key
        })}${this.getUndiscriminatedUnionFieldName({ typeReference: map.value })}Map`;
    }

    private getUndiscriminatedUnionFieldNameForOptional({
        optional
    }: {
        optional: DynamicSnippets.TypeReference.Optional;
    }): string {
        return `${this.getUndiscriminatedUnionFieldName({ typeReference: optional })}Optional`;
    }

    private getUndiscriminatedUnionFieldNameForSet({ set }: { set: DynamicSnippets.TypeReference.Set }): string {
        return `${this.getUndiscriminatedUnionFieldName({ typeReference: set })}Set`;
    }

    private getUndiscriminatedUnionFieldNameForLiteral({ literal }: { literal: DynamicSnippets.LiteralType }): string {
        switch (literal.type) {
            case "boolean":
                return `${literal.value}BoolLiteral`;
            case "string":
                return `${literal.value}StringLiteral`;
            default:
                assertNever(literal);
        }
    }

    private getUndiscriminatedUnionFieldNameForPrimitive({ primitive }: { primitive: PrimitiveTypeV1 }): string {
        switch (primitive) {
            case PrimitiveTypeV1.Integer:
            case PrimitiveTypeV1.Uint:
                return "Integer";
            case PrimitiveTypeV1.Long:
            case PrimitiveTypeV1.Uint64:
                return "Long";
            case PrimitiveTypeV1.Float:
            case PrimitiveTypeV1.Double:
                return "Double";
            case PrimitiveTypeV1.Boolean:
                return "Boolean";
            case PrimitiveTypeV1.BigInteger:
            case PrimitiveTypeV1.String:
                return "String";
            case PrimitiveTypeV1.Uuid:
                return "Uuid";
            case PrimitiveTypeV1.Date:
                return "Date";
            case PrimitiveTypeV1.DateTime:
                return "DateTime";
            case PrimitiveTypeV1.Base64:
                return "Base64";
            default:
                assertNever(primitive);
        }
    }

    private convertUnknown({ value }: { value: unknown }): go.TypeInstantiation {
        return this.convertMap({
            map: {
                key: DynamicSnippets.TypeReference.primitive(PrimitiveTypeV1.String),
                value: DynamicSnippets.TypeReference.unknown()
            },
            value
        });
    }

    private convertPrimitive({
        primitive,
        value
    }: {
        primitive: PrimitiveTypeV1;
        value: unknown;
    }): go.TypeInstantiation {
        switch (primitive) {
            case "INTEGER":
            case "UINT":
                return this.convertPrimitiveAsType({
                    type: "number",
                    value,
                    convert: (v) => go.TypeInstantiation.int(v)
                });
            case "LONG":
            case "UINT_64":
                return this.convertPrimitiveAsType({
                    type: "number",
                    value,
                    convert: (v) => go.TypeInstantiation.int64(v)
                });
            case "FLOAT":
            case "DOUBLE":
                return this.convertPrimitiveAsType({
                    type: "number",
                    value,
                    convert: (v) => go.TypeInstantiation.float64(v)
                });
            case "BOOLEAN":
                return this.convertPrimitiveAsType({
                    type: "boolean",
                    value,
                    convert: (v) => go.TypeInstantiation.bool(v)
                });
            case "STRING":
                return this.convertPrimitiveAsType({
                    type: "string",
                    value,
                    convert: (v) => go.TypeInstantiation.string(v)
                });
            case "DATE":
                return this.convertPrimitiveAsType({
                    type: "string",
                    value,
                    convert: (v) => go.TypeInstantiation.date(v)
                });
            case "DATE_TIME":
                return this.convertPrimitiveAsType({
                    type: "string",
                    value,
                    convert: (v) => go.TypeInstantiation.dateTime(v)
                });
            case "UUID":
                return this.convertPrimitiveAsType({
                    type: "string",
                    value,
                    convert: (v) => go.TypeInstantiation.uuid(v)
                });
            case "BASE_64":
                return this.convertPrimitiveAsType({
                    type: "string",
                    value,
                    convert: (v) => go.TypeInstantiation.bytes(v)
                });
            case "BIG_INTEGER":
                return this.convertPrimitiveAsType({
                    type: "string",
                    value,
                    convert: (v) => go.TypeInstantiation.string(v)
                });
            default:
                assertNever(primitive);
        }
    }

    private convertPrimitiveAsType({
        type,
        value,
        convert
    }: {
        type: "string" | "number" | "boolean";
        value: unknown;
        convert: (value: any) => go.TypeInstantiation;
    }): go.TypeInstantiation {
        if (typeof value !== type) {
            throw new Error(`Expected ${type} value, got: ${JSON.stringify(value)}`);
        }
        return convert(value);
    }
}
