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
    memberValues: Type[];
}

interface Array_ {
    type: "array";
    value: Type;
}

export type SingleType = Nil | Boolean_ | Boolish | String_ | Integer | Union;
export type CollectionType = Array_;

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
                        nodes: this.internalType.memberValues,
                        delimiter: " | ",
                        writeFunction: (argument) => argument.write(writer)
                    });
                    break;
                case "array":
                    writer.write("Array[");
                    this.internalType.value.write(writer);
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

    public static union(memberValues: Union["memberValues"]): Type {
        return new this({
            type: "union",
            memberValues
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
