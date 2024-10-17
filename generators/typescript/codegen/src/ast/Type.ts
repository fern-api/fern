import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
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
    | Map
    | Undefined
    | ReferenceType
    | Literal;

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

interface Map {
    type: "map";
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
            case "map":
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
}
