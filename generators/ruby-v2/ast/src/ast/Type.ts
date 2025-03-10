import { assertNever } from "@fern-api/core-utils";

import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

type InternalType =
    | Integer
    | Float
    | BigDecimal
    | Array
    | Hash
    | Range
    | Symbol_
    | Regexp
    | Boolean_
    | String_
    | Class_;

interface Integer {
    type: "Integer";
}

interface Float {
    type: "Float";
}

interface BigDecimal {
    type: "BigDecimal";
}

interface Array {
    type: "Array";
    elem: Type;
}

interface Hash {
    type: "Hash";
    pairs: object;
}

interface Range {
    type: "Range";
    elem: Type;
}

interface Symbol_ {
    type: "Symbol";
}

interface Regexp {
    type: "Regexp";
}

interface Boolean_ {
    type: "Boolean";
}

interface String_ {
    type: "String";
}

interface Class_ {
    type: "Class";
    name: string;
}

export class Type extends AstNode {
    private constructor(public readonly internalType: InternalType) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "Boolean":
                writer.write("bool");
                break;
            case "Integer":
                writer.write("Integer");
                break;
            case "Float":
                writer.write("Float");
                break;
            case "BigDecimal":
                writer.write("BigDecimal");
                break;
            case "String":
                writer.write("String");
                break;
            case "Array":
                writer.write(`Array[${this.internalType.elem}]`);
                break;
            case "Hash":
                // TODO
                break;
            case "Range":
                writer.write(`Range[${this.internalType.elem}]`);
                break;
            case "Symbol":
                writer.write("Symbol");
                break;
            case "Regexp":
                writer.write("Regexp");
                break;
            case "Class":
                writer.write(this.internalType.name);
                break;
            default:
                assertNever(this.internalType);
        }
    }

    /* Static factory methods for creating a Type */
    public static boolean(): Type {
        return new this({
            type: "Boolean"
        });
    }

    public static string(): Type {
        return new this({
            type: "String"
        });
    }
}
