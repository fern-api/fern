import { assertNever } from "@fern-api/core-utils";

import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

type InternalType =
    | String_
    | Number_
    | BigInt_
    | Boolean_
    | Array_
    | Object_
    | Map_
    | Tuple
    | Enum
    | Any
    | Unknown
    | Void
    | Undefined
    | Null
    | Never
    | NoOp;

interface String_ {
    type: "string";
}

interface Number_ {
    type: "number";
}

interface BigInt_ {
    type: "bigint";
}

interface Boolean_ {
    type: "boolean";
}

interface Array_ {
    type: "array";
    valueType: Type;
}

interface Object_ {
    type: "object";
    fields: Record<string, Type>;
}

interface Map_ {
    type: "map";
    keyType: Type;
    valueType: Type;
}

interface Tuple {
    type: "tuple";
    types: Type[];
}

interface Enum {
    type: "enum";
    values: string[];
}

interface Any {
    type: "any";
}

interface Unknown {
    type: "unknown";
}

interface Void {
    type: "void";
}

interface Undefined {
    type: "undefined";
}

interface Null {
    type: "null";
}

interface Never {
    type: "never";
}

interface NoOp {
    type: "noOp";
}

interface ObjectField {
    name: string;
    valueType: Type;
}

export class Type extends AstNode {
    private constructor(public readonly internalType: InternalType) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "string":
                writer.write("string");
                break;
            case "number":
                writer.write("number");
                break;
            case "bigint":
                // TODO: Add bigint configuration
                break;
            case "boolean":
                writer.write("boolean");
                break;
            case "array":
                writer.write(`Array<${this.internalType.valueType.write(writer)}>`);
                break;
            case "map":
                writer.write(
                    `Map<${this.internalType.keyType.write(writer)}, ${this.internalType.valueType.write(writer)}>`
                );
                break;
            case "object":
                writer.write(
                    `{ ${Object.entries(this.internalType.fields)
                        .map(([k, v]) => `${k}: ${v.write(writer)}`)
                        .join(", ")} }`
                );
                break;
            case "tuple":
                writer.write(`[${this.internalType.types.map((type) => type.write(writer)).join(", ")}]`);
                break;
            case "enum":
                writer.write("enum");
                break;
            case "any":
                writer.write("any");
                break;
            case "unknown":
                writer.write("unknown");
                break;
            case "void":
                writer.write("void");
                break;
            case "undefined":
                writer.write("undefined");
                break;
            case "null":
                writer.write("null");
                break;
            case "never":
                writer.write("never");
                break;
            case "noOp":
                break;
            default:
                assertNever(this.internalType);
        }
    }

    /* Static factory methods for creating a Type */
    public static string(): Type {
        return new this({
            type: "string"
        });
    }

    public static number(): Type {
        return new this({
            type: "number"
        });
    }

    public static bigint(): Type {
        return new this({
            type: "bigint"
        });
    }

    public static boolean(): Type {
        return new this({
            type: "boolean"
        });
    }

    public static array(valueType: Type): Type {
        return new this({
            type: "array",
            valueType
        });
    }

    public static object(fields: Record<string, Type>): Type {
        return new this({
            type: "object",
            fields
        });
    }

    public static tuple(types: Type[]): Type {
        return new this({
            type: "tuple",
            types
        });
    }

    public static enum(values: string[]): Type {
        return new this({
            type: "enum",
            values
        });
    }

    public static any(): Type {
        return new this({
            type: "any"
        });
    }

    public static unknown(): Type {
        return new this({
            type: "unknown"
        });
    }

    public static void(): Type {
        return new this({
            type: "void"
        });
    }

    public static undefined(): Type {
        return new this({
            type: "undefined"
        });
    }

    public static null(): Type {
        return new this({
            type: "null"
        });
    }

    public static never(): Type {
        return new this({
            type: "never"
        });
    }

    public static noOp(): Type {
        return new this({
            type: "noOp"
        });
    }

    public static property(name: string, valueType: Type): ObjectField {
        return {
            name,
            valueType
        };
    }
}
