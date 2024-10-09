import { go } from "..";
import { AstNode } from "../go";
import { EnumType, Name, NamedParameter, ObjectType, PrimitiveType, Type, Values } from "./generated/api";
import { Context } from "./context/Context";
import { TypeInstantiation } from "../ast";

export declare namespace GoTypeRenderer {
    interface Args {
        name: Name;
        type: Type;
        value: unknown;
    }
}
export class GoTypeRenderer {
    private context: Context;

    constructor({ context }: { context: Context }) {
        this.context = context;
    }

    // TODO: Construct the associated Go AST node based on the given value. At this point
    // we confidently know what type we have, so we just need to make sure the unknown value
    // fits.
    //
    // TODO: Refactor this so we always just return an instantiation and don't need to thread
    // in the optional.
    public render({ args, optional }: { args: GoTypeRenderer.Args; optional?: boolean }): AstNode {
        switch (args.type.type) {
            case "enum":
                return this.renderEnum({ enum_: args.type, value: args.value, optional });
            case "listType":
                throw new Error("TODO: Implement me!");
            case "mapType":
                throw new Error("TODO: Implement me!");
            case "object":
                return this.renderObject({ object_: args.type, value: args.value, optional });
            case "optional":
                // TODO: This should just call TypeInstantiation.optional(...)
                return this.render({
                    args: {
                        ...args,
                        type: args.type.value
                    },
                    optional: true
                });
            case "primitive":
                return this.renderPrimitive({ primitive: args.type.value, value: args.value, optional });
            case "unknown":
                throw new Error("TODO: Implement me!");
            default:
                throw new Error(`Unknown type: ${(args as any).type.type}`);
        }
    }

    private renderObject({
        object_,
        value,
        optional
    }: {
        object_: ObjectType;
        value: unknown;
        optional?: boolean;
    }): AstNode {
        // TODO: Refactor this so that the struct is a TypeInstantiation.
        const properties = this.associateByWireValue({
            parameters: object_.properties,
            values: this.context.getRecordOrThrow(value)
        });
        return go.instantiateStruct({
            typeReference: go.typeReference({
                name: object_.declaration.name.pascalCase.unsafeName,
                importPath: this.context.getImportPath(object_.declaration.fernFilepath)
            }),
            fields: properties.map((property) => ({
                name: property.name.pascalCase.unsafeName,
                value: this.render({ args: property })
            })),
            pointer: optional
        });
    }

    private renderEnum({ enum_, value, optional }: { enum_: EnumType; value: unknown; optional?: boolean }): AstNode {
        // TODO: Refactor this so that the enum is a TypeInstantiation.
        return go.instantiateEnum({
            typeReference: go.typeReference({
                name: this.getEnumValueNameOrThrow({ enum_, value }),
                importPath: this.context.getImportPath(enum_.declaration.fernFilepath)
            }),
            pointer: optional
        });
    }

    private getEnumValueNameOrThrow({ enum_, value }: { enum_: EnumType; value: unknown }): string {
        const target = value as string;
        const enumValue = enum_.values.find((v) => v.wireValue === target);
        if (enumValue == null) {
            throw new Error(`An enum value named "${target}" does not exist in this context`);
        }
        return `${enum_.declaration.name.pascalCase.unsafeName}${enumValue.name.pascalCase.unsafeName}`;
    }

    private renderPrimitive({
        primitive,
        value,
        optional
    }: {
        primitive: PrimitiveType;
        value: unknown;
        optional?: boolean;
    }): AstNode {
        const instantiation = this.getPrimitiveTypeInstantiation({ primitive, value });
        if (optional) {
            return go.TypeInstantiation.optional(instantiation);
        }
        return instantiation;
    }

    private getPrimitiveTypeInstantiation({
        primitive,
        value
    }: {
        primitive: PrimitiveType;
        value: unknown;
    }): TypeInstantiation {
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

    // TODO: DRY this up and move it into a shared location.
    private associateByWireValue({
        parameters,
        values
    }: {
        parameters: NamedParameter[];
        values: Values;
    }): GoTypeRenderer.Args[] {
        const args: GoTypeRenderer.Args[] = [];
        for (const [key, value] of Object.entries(values)) {
            const parameter = parameters.find((param) => param.name.wireValue === key);
            if (parameter == null) {
                throw new Error(`"${key}" is not a recognized parameter for this endpoint`);
            }
            args.push({
                name: parameter.name.name,
                type: parameter.type,
                value
            });
        }
        return args;
    }
}
