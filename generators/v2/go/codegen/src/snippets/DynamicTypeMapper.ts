import { go } from "..";
import { TypeInstantiation } from "../ast";
import { Context } from "./context/Context";
import {
    DiscriminatedUnionType,
    EnumType,
    ObjectType,
    PrimitiveType,
    Type,
    UndiscriminatedUnionType
} from "./generated/api";

export declare namespace DynamicTypeMapper {
    interface Args {
        type: Type;
        value: unknown;
    }
}

export class DynamicTypeMapper {
    private context: Context;

    constructor({ context }: { context: Context }) {
        this.context = context;
    }

    public render(args: DynamicTypeMapper.Args): TypeInstantiation {
        switch (args.type.type) {
            case "discriminatedUnion":
                return this.renderDiscriminatedUnion({
                    discriminatedUnion: args.type,
                    value: args.value
                });
            case "enum":
                return this.renderEnum({ enum_: args.type, value: args.value });
            case "list":
                throw new Error("TODO: Implement me!");
            case "literal":
                return TypeInstantiation.nop();
            case "map":
                throw new Error("TODO: Implement me!");
            case "object":
                return this.renderObject({ object_: args.type, value: args.value });
            case "optional":
                return TypeInstantiation.optional(this.render(args));
            case "primitive":
                return this.renderPrimitive({ primitive: args.type.value, value: args.value });
            case "set":
                throw new Error("TODO: Implement me!");
            case "undicriminatedUnion":
                return this.renderUndicriminatedUnion({ undicriminatedUnion: args.type, value: args.value });
            case "unknown":
                throw new Error("TODO: Implement me!");
            default:
                throw new Error(`Unknown type: ${(args as any).type.type}`);
        }
    }

    private renderDiscriminatedUnion({
        discriminatedUnion,
        value
    }: {
        discriminatedUnion: DiscriminatedUnionType;
        value: unknown;
    }): TypeInstantiation {
        const { type, value: discriminatedUnionValue } = this.context.resolveDiscriminatedUnionTypeOrThrow({
            discriminatedUnion,
            value
        });
        return this.render({ type, value: discriminatedUnionValue });
    }

    private renderObject({ object_, value }: { object_: ObjectType; value: unknown }): TypeInstantiation {
        const properties = this.context.associateByWireValue({
            parameters: object_.properties,
            values: this.context.getRecordOrThrow(value)
        });
        return go.TypeInstantiation.struct({
            typeReference: go.typeReference({
                name: object_.declaration.name.pascalCase.unsafeName,
                importPath: this.context.getImportPath(object_.declaration.fernFilepath)
            }),
            fields: properties.map((property) => ({
                name: property.name.pascalCase.unsafeName,
                value: this.render(property)
            }))
        });
    }

    private renderEnum({ enum_, value }: { enum_: EnumType; value: unknown }): TypeInstantiation {
        return go.TypeInstantiation.enum(
            go.typeReference({
                name: this.getEnumValueNameOrThrow({ enum_, value }),
                importPath: this.context.getImportPath(enum_.declaration.fernFilepath)
            })
        );
    }

    private getEnumValueNameOrThrow({ enum_, value }: { enum_: EnumType; value: unknown }): string {
        const target = value as string;
        const enumValue = enum_.values.find((v) => v.wireValue === target);
        if (enumValue == null) {
            throw new Error(`An enum value named "${target}" does not exist in this context`);
        }
        return `${enum_.declaration.name.pascalCase.unsafeName}${enumValue.name.pascalCase.unsafeName}`;
    }

    private renderPrimitive({ primitive, value }: { primitive: PrimitiveType; value: unknown }): TypeInstantiation {
        // TODO: DRY this up.
        switch (primitive) {
            case "INTEGER": {
                if (typeof value === "number") {
                    return go.TypeInstantiation.int(value);
                } else {
                    throw new Error(`Expected number value, got: ${JSON.stringify(value)}`);
                }
            }
            case "LONG": {
                if (typeof value === "number") {
                    return go.TypeInstantiation.int64(value);
                } else {
                    throw new Error(`Expected number value, got: ${JSON.stringify(value)}`);
                }
            }
            case "UINT": {
                if (typeof value === "number") {
                    return go.TypeInstantiation.int(value);
                } else {
                    throw new Error(`Expected number value, got: ${JSON.stringify(value)}`);
                }
            }
            case "UINT_64": {
                if (typeof value === "number") {
                    return go.TypeInstantiation.int64(value);
                } else {
                    throw new Error(`Expected number value, got: ${JSON.stringify(value)}`);
                }
            }
            case "FLOAT":
            case "DOUBLE": {
                if (typeof value === "number") {
                    return go.TypeInstantiation.float64(value);
                } else {
                    throw new Error(`Expected number value, got: ${JSON.stringify(value)}`);
                }
            }
            case "BOOLEAN": {
                if (typeof value === "boolean") {
                    return go.TypeInstantiation.bool(value);
                } else {
                    throw new Error(`Expected boolean value, got: ${JSON.stringify(value)}`);
                }
            }
            case "STRING": {
                if (typeof value === "string") {
                    return go.TypeInstantiation.string(value);
                } else {
                    throw new Error(`Expected string value, got: ${JSON.stringify(value)}`);
                }
            }
            case "DATE": {
                if (typeof value === "string") {
                    return go.TypeInstantiation.date(value);
                } else {
                    throw new Error(`Expected string value, got: ${JSON.stringify(value)}`);
                }
            }
            case "DATE_TIME": {
                if (typeof value === "string") {
                    return go.TypeInstantiation.dateTime(value);
                } else {
                    throw new Error(`Expected string value, got: ${JSON.stringify(value)}`);
                }
            }
            case "UUID": {
                if (typeof value === "string") {
                    return go.TypeInstantiation.uuid(value);
                } else {
                    throw new Error(`Expected string value, got: ${JSON.stringify(value)}`);
                }
            }
            case "BASE_64": {
                if (typeof value === "string") {
                    return go.TypeInstantiation.bytes(value);
                } else {
                    throw new Error(`Expected string value, got: ${JSON.stringify(value)}`);
                }
            }
            case "BIG_INTEGER": {
                if (typeof value === "string") {
                    return go.TypeInstantiation.string(value);
                } else {
                    throw new Error(`Expected string value, got: ${JSON.stringify(value)}`);
                }
            }
        }
    }

    private renderUndicriminatedUnion({
        undicriminatedUnion,
        value
    }: {
        undicriminatedUnion: UndiscriminatedUnionType;
        value: unknown;
    }): TypeInstantiation {
        for (const type of undicriminatedUnion.types) {
            try {
                return this.render({ type, value });
            } catch (e) {
                continue;
            }
        }
        throw new Error(
            `None of the types in the undicriminated union matched the given value: ${JSON.stringify(value)}`
        );
    }
}
