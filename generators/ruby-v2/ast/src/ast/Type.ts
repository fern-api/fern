import { assertNever } from "@fern-api/core-utils";

import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

interface Nil {
    type: "nil";
}

interface Boolean_ {
    type: "boolean";
}

interface Boolish {
    type: "boolish";
}

interface String_ {
    type: "string";
}

interface Integer {
    type: "integer";
}

interface Union {
    type: "union";
    elems: Type[];
}

interface Array_ {
    type: "array";
    elem: Type;
}

interface Hash {
    type: "hash";
    keyType: Type;
    valueType: Type;
}

export type SingleType = Nil | Boolean_ | Boolish | String_ | Integer | Union;
export type CollectionType = Array_ | Hash;

type InternalType = SingleType | CollectionType;

export class Type extends AstNode {
    private constructor(public readonly internalType: InternalType | undefined) {
        super();
    }

    public write(writer: Writer): void {
        if (this.internalType) {
            switch (this.internalType.type) {
                case "nil":
                    writer.write("nil");
                    break;
                case "boolean":
                    writer.write("bool");
                    break;
                case "boolish":
                    writer.write("boolish");
                    break;
                case "string":
                    writer.write("String");
                    break;
                case "integer":
                    writer.write("Integer");
                    break;
                case "union":
                    writer.delimit({
                        nodes: this.internalType.elems,
                        delimiter: " | ",
                        writeFunction: (argument) => argument.write(writer)
                    });
                    break;
                case "array":
                    writer.write("Array[");
                    this.internalType.elem.write(writer);
                    writer.write("]");
                    break;
                case "hash":
                    writer.write("Hash[");
                    this.internalType.keyType.write(writer);
                    writer.write(", ");
                    this.internalType.valueType.write(writer);
                    writer.write("]");
                    break;
                default:
                    assertNever(this.internalType);
            }
        } else {
            writer.write("untyped");
        }
    }

    public static untyped(): Type {
        return new this(undefined);
    }

    public static nil(): Type {
        return new this({
            type: "nil"
        });
    }

    public static boolean(): Type {
        return new this({
            type: "boolean"
        });
    }

    public static string(): Type {
        return new this({
            type: "string"
        });
    }

    public static integer(): Type {
        return new this({
            type: "integer"
        });
    }

    public static union(memberValues: Union["elems"]): Type {
        return new this({
            type: "union",
            elems: memberValues
        });
    }

    public static array(elem: Type): Type {
        return new this({
            type: "array",
            elem
        });
    }

    public static hash(keyType: Type, valueType: Type): Type {
        return new this({
            type: "hash",
            keyType,
            valueType
        });
    }

    public static nilable(value: Type): Type {
        return Type.union([value, Type.nil()]);
    }

    /**
     * Helper for converting an existing type into an nilable type
     */
    public nilable(): Type {
        return Type.nilable(this);
    }
}
