import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Reference } from "./Reference";

type InternalType =
    | Number
    | String_
    | Boolean_
    | Date
    | Uuid
    | Object_
    | Array_
    | Set
    | Record
    | Undefined
    | ReferenceType
    | Literal
    | Unknown
    | Union;

interface Number {
    type: "number";
}

interface String_ {
    type: "string";
}

interface Boolean_ {
    type: "bool";
}

interface Date {
    type: "date";
}

interface Uuid {
    type: "uuid";
}

interface Object_ {
    type: "object";
}

interface Array_ {
    type: "array";
    value: Type;
}

interface Set {
    type: "set";
    value: Type;
}

interface Literal {
    type: "literal";
    value: string | boolean;
}

interface Record {
    type: "record";
    keyType: Type;
    valueType: Type;
}

interface Undefined {
    type: "undefined";
}

interface ReferenceType {
    type: "reference";
    reference: Reference;
}

interface Unknown {
    type: "unknown";
}

interface Union {
    type: "union";
    variants: Type[];
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
            case "array":
                writer.writeNode(this.internalType.value);
                writer.write("[]");
                break;
            case "bool":
                writer.write("boolean");
                break;
            case "date":
                writer.write("Date");
                break;
            case "set":
                writer.write("Set<");
                writer.writeNode(this.internalType.value);
                writer.write(">");
                break;
            case "number":
                writer.write("number");
                break;
            case "record":
                writer.write("Record<");
                writer.writeNode(this.internalType.keyType);
                writer.write(", ");
                writer.writeNode(this.internalType.valueType);
                writer.write(">");
                break;
            case "object":
                writer.write("object");
                break;
            case "undefined":
                writer.write("undefined");
                break;
            case "uuid":
                writer.write("uuid");
                break;
            case "reference":
                writer.writeNode(this.internalType.reference);
                break;
            case "literal":
                if (typeof this.internalType.value === "string") {
                    writer.write(`"${this.internalType.value}"`);
                } else if (typeof this.internalType.value === "boolean") {
                    writer.write(`${this.internalType.value}`);
                }
                break;
            case "unknown":
                writer.write("unknown");
                break;
            case "union": {
                this.internalType.variants.forEach((variant, idx) => {
                    if (idx > 0) {
                        writer.write(" | ");
                    }
                    writer.writeNode(variant);
                });
                break;
            }
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

    public static boolean(): Type {
        return new this({
            type: "bool"
        });
    }

    public static array(value: Type): Type {
        return new this({
            type: "array",
            value
        });
    }

    public static set(value: Type): Type {
        return new this({
            type: "set",
            value
        });
    }

    public static date(): Type {
        return new this({
            type: "date"
        });
    }

    public static literal(value: string | boolean): Type {
        return new this({
            type: "literal",
            value
        });
    }

    public static reference(reference: Reference): Type {
        return new this({
            type: "reference",
            reference
        });
    }

    public static object(): Type {
        return new this({
            type: "object"
        });
    }

    public static unknown(): Type {
        return new this({
            type: "unknown"
        });
    }

    public static undefined(): Type {
        return new this({
            type: "undefined"
        });
    }

    public static record(keyType: Type, valueType: Type): Type {
        return new this({
            type: "record",
            keyType,
            valueType
        });
    }

    public static union(variants: Type[]): Type {
        if (variants.length === 0) {
            return Type.unknown();
        }
        return new this({
            type: "union",
            variants
        });
    }
}
