import { assertNever } from "@fern-api/core-utils"

import { AstNode } from "./core/AstNode"
import { Writer } from "./core/Writer"

type InternalType =
    | String_
    | Number_
    | BigInt_
    | Boolean_
    | Array_
    | Object_
    | Map_
    | Enum
    | Promise_
    | Any
    | Unknown
    | Void
    | Undefined
    | Null
    | Never
    | Nop

interface String_ {
    type: "string"
}

interface Number_ {
    type: "number"
}

interface BigInt_ {
    type: "bigint"
}

interface Boolean_ {
    type: "boolean"
}

interface Array_ {
    type: "array"
    valueType: Type
}

interface Object_ {
    type: "object"
    fields: Record<string, Type>
}

interface Map_ {
    type: "map"
    keyType: Type
    valueType: Type
}

interface Enum {
    type: "enum"
    values: string[]
}

interface Any {
    type: "any"
}

interface Unknown {
    type: "unknown"
}

interface Void {
    type: "void"
}

interface Undefined {
    type: "undefined"
}

interface Null {
    type: "null"
}

interface Never {
    type: "never"
}

interface Nop {
    type: "nop"
}

interface Promise_ {
    type: "promise"
    value: Type
}

export class Type extends AstNode {
    private constructor(public readonly internalType: InternalType) {
        super()
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "string":
                writer.write("string")
                break
            case "number":
                writer.write("number")
                break
            case "bigint":
                writer.write("bigint")
                break
            case "boolean":
                writer.write("boolean")
                break
            case "array":
                this.internalType.valueType.write(writer)
                writer.write("[]")
                break
            case "map":
                writer.write("Record<")
                this.internalType.keyType.write(writer)
                writer.write(", ")
                this.internalType.valueType.write(writer)
                writer.write(">")
                break
            case "object":
                writer.write("{")
                writer.indent()
                for (const [key, value] of Object.entries(this.internalType.fields)) {
                    writer.write(`${key}: `)
                    value.write(writer)
                    writer.writeLine(",")
                }
                writer.dedent()
                writer.write("}")
                break
            case "enum":
                writer.write("enum")
                break
            case "any":
                writer.write("any")
                break
            case "promise":
                writer.write("Promise<")
                this.internalType.value.write(writer)
                writer.write(">")
                break
            case "unknown":
                writer.write("unknown")
                break
            case "void":
                writer.write("void")
                break
            case "undefined":
                writer.write("undefined")
                break
            case "null":
                writer.write("null")
                break
            case "never":
                writer.write("never")
                break
            case "nop":
                break
            default:
                assertNever(this.internalType)
        }
    }

    /* Static factory methods for creating a Type */
    public static string(): Type {
        return new this({
            type: "string"
        })
    }

    public static number(): Type {
        return new this({
            type: "number"
        })
    }

    public static bigint(): Type {
        return new this({
            type: "bigint"
        })
    }

    public static boolean(): Type {
        return new this({
            type: "boolean"
        })
    }

    public static array(valueType: Type): Type {
        return new this({
            type: "array",
            valueType
        })
    }

    public static object(fields: Record<string, Type>): Type {
        return new this({
            type: "object",
            fields
        })
    }

    public static enum(values: string[]): Type {
        return new this({
            type: "enum",
            values
        })
    }

    public static any(): Type {
        return new this({
            type: "any"
        })
    }

    public static promise(value: Type): Type {
        if (value.internalType.type === "promise") {
            // Avoids double promise.
            return value
        }
        return new this({
            type: "promise",
            value
        })
    }

    public static unknown(): Type {
        return new this({
            type: "unknown"
        })
    }

    public static void(): Type {
        return new this({
            type: "void"
        })
    }

    public static undefined(): Type {
        return new this({
            type: "undefined"
        })
    }

    public static null(): Type {
        return new this({
            type: "null"
        })
    }

    public static never(): Type {
        return new this({
            type: "never"
        })
    }

    public static nop(): Type {
        return new this({
            type: "nop"
        })
    }
}
