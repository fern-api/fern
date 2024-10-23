import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-codegen";
import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";
import { dynamic as DynamicSnippets, PrimitiveTypeV1 } from "@fern-fern/ir-sdk/api";

export declare namespace DynamicTypeMapper {
    interface Args {
        typeReference: DynamicSnippets.TypeReference;
        value: unknown;
    }
}

export class DynamicTypeMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeMapper.Args): go.TypeInstantiation {
        switch (args.typeReference.type) {
            case "list":
                throw new Error("TODO: Implement me!");
            case "literal":
                return go.TypeInstantiation.nop();
            case "map":
                throw new Error("TODO: Implement me!");
            case "named": {
                const named = this.context.resolveNamedTypeOrThrow({ typeId: args.typeReference.value });
                return this.convertNamed({ named, value: args.value });
            }
            case "optional":
                return go.TypeInstantiation.optional(this.convert(args));
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value, value: args.value });
            case "set":
                throw new Error("TODO: Implement me!");
            case "unknown":
                throw new Error("TODO: Implement me!");
            default:
                assertNever(args.typeReference);
        }
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
        const { typeReference, value: discriminatedUnionValue } = this.context.resolveDiscriminatedUnionTypeOrThrow({
            discriminatedUnion,
            value
        });
        return this.convert({ typeReference, value: discriminatedUnionValue });
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

        // All object types are generated as pointers, so we wrap the struct in an optional.
        return go.TypeInstantiation.optional(
            go.TypeInstantiation.struct({
                typeReference: go.typeReference({
                    name: object_.declaration.name.pascalCase.unsafeName,
                    importPath: this.context.getImportPath(object_.declaration.fernFilepath)
                }),
                fields: properties.map((property) => ({
                    name: property.name.pascalCase.unsafeName,
                    value: this.convert(property)
                }))
            })
        );
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
        const target = value as string;
        const enumValue = enum_.values.find((v) => v.wireValue === target);
        if (enumValue == null) {
            throw new Error(`An enum value named "${target}" does not exist in this context`);
        }
        return `${enum_.declaration.name.pascalCase.unsafeName}${enumValue.name.pascalCase.unsafeName}`;
    }

    private convertUndicriminatedUnion({
        undicriminatedUnion,
        value
    }: {
        undicriminatedUnion: DynamicSnippets.UndiscriminatedUnionType;
        value: unknown;
    }): go.TypeInstantiation {
        for (const typeReference of undicriminatedUnion.types) {
            try {
                return this.convert({ typeReference, value });
            } catch (e) {
                continue;
            }
        }
        throw new Error(
            `None of the types in the undicriminated union matched the given value: ${JSON.stringify(value)}`
        );
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
                    convert: go.TypeInstantiation.int
                });
            case "LONG":
            case "UINT_64":
                return this.convertPrimitiveAsType({
                    type: "number",
                    value,
                    convert: go.TypeInstantiation.int64
                });
            case "FLOAT":
            case "DOUBLE":
                return this.convertPrimitiveAsType({
                    type: "number",
                    value,
                    convert: go.TypeInstantiation.float64
                });
            case "BOOLEAN":
                return this.convertPrimitiveAsType({
                    type: "boolean",
                    value,
                    convert: go.TypeInstantiation.bool
                });
            case "STRING":
                return this.convertPrimitiveAsType({
                    type: "string",
                    value,
                    convert: go.TypeInstantiation.string
                });
            case "DATE":
                return this.convertPrimitiveAsType({
                    type: "string",
                    value,
                    convert: go.TypeInstantiation.date
                });
            case "DATE_TIME":
                return this.convertPrimitiveAsType({
                    type: "string",
                    value,
                    convert: go.TypeInstantiation.dateTime
                });
            case "UUID":
                return this.convertPrimitiveAsType({
                    type: "string",
                    value,
                    convert: go.TypeInstantiation.uuid
                });
            case "BASE_64":
                return this.convertPrimitiveAsType({
                    type: "string",
                    value,
                    convert: go.TypeInstantiation.bytes
                });
            case "BIG_INTEGER":
                return this.convertPrimitiveAsType({
                    type: "string",
                    value,
                    convert: go.TypeInstantiation.string
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
