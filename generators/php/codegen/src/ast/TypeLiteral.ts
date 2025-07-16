import { assertNever } from "@fern-api/core-utils"

import { ClassInstantiation } from "./ClassInstantiation"
import { ClassReference } from "./ClassReference"
import { CodeBlock } from "./CodeBlock"
import { MethodInvocation } from "./MethodInvocation"
import { AstNode, Writer } from "./core"

type InternalTypeLiteral =
    | Boolean_
    | Class_
    | DateTime
    | File
    | Float
    | List
    | Map
    | Number_
    | Reference
    | String_
    | Unknown_
    | Null_
    | Nop

interface Boolean_ {
    type: "boolean"
    value: boolean
}

interface Class_ {
    type: "class"
    reference: ClassReference
    fields: ConstructorField[]
}

export interface ConstructorField {
    name: string
    value: TypeLiteral
}

interface DateTime {
    type: "datetime"
    value: string
}

interface File {
    type: "file"
    value: string
}

interface Float {
    type: "float"
    value: number
}

interface List {
    type: "list"
    values: TypeLiteral[]
}

interface Map {
    type: "map"
    entries: MapEntry[]
}

interface MapEntry {
    key: TypeLiteral
    value: TypeLiteral
}

interface Number_ {
    type: "number"
    value: number
}

interface Reference {
    type: "reference"
    value: AstNode
}

interface String_ {
    type: "string"
    value: string
}

interface Unknown_ {
    type: "unknown"
    value: unknown
}

interface Null_ {
    type: "null"
}

interface Nop {
    type: "nop"
}

export class TypeLiteral extends AstNode {
    private constructor(public readonly internalType: InternalTypeLiteral) {
        super()
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "list": {
                this.writeList({ writer, list: this.internalType })
                break
            }
            case "boolean": {
                writer.write(this.internalType.value.toString())
                break
            }
            case "class": {
                this.writeClass({ writer, class_: this.internalType })
                break
            }
            case "file": {
                writer.writeNode(buildFileFromString({ writer, value: this.internalType.value }))
                break
            }
            case "float": {
                writer.write(this.internalType.value.toString())
                break
            }
            case "number": {
                writer.write(this.internalType.value.toString())
                break
            }
            case "map": {
                this.writeMap({ writer, map: this.internalType })
                break
            }
            case "reference": {
                writer.writeNode(this.internalType.value)
                break
            }
            case "datetime": {
                writer.writeNode(buildDateTimeFromString({ writer, value: this.internalType.value }))
                break
            }
            case "string": {
                if (this.internalType.value.includes("\n")) {
                    this.writeStringWithHeredoc({ writer, value: this.internalType.value })
                    break
                }
                if (this.internalType.value.includes("'")) {
                    writer.write(`"${this.internalType.value.replaceAll('"', '\\"')}"`)
                    break
                }
                writer.write(`'${this.internalType.value}'`)
                break
            }
            case "unknown": {
                this.writeUnknown({ writer, value: this.internalType.value })
                break
            }
            case "null": {
                writer.write("null")
                break
            }
            case "nop":
                break
            default:
                assertNever(this.internalType)
        }
    }

    public isClass(): this is Class_ {
        return (this.internalType as Class_).type === "class"
    }

    public asClassOrThrow(): Class_ {
        if (this.isClass()) {
            return this.internalType as Class_
        }
        throw new Error("Internal error; ts.TypeLiteral is not a class")
    }

    private writeStringWithHeredoc({ writer, value }: { writer: Writer; value: string }): void {
        writer.writeLine("<<<EOT")
        writer.writeNoIndent(value)
        writer.newLine()
        writer.writeNoIndent("EOT")
    }

    private writeClass({ writer, class_: class_ }: { writer: Writer; class_: Class_ }): void {
        writer.writeNode(
            new ClassInstantiation({
                classReference: class_.reference,
                arguments_: [
                    TypeLiteral.map({
                        entries: class_.fields.map((field) => ({
                            key: TypeLiteral.string(field.name),
                            value: field.value
                        }))
                    })
                ]
            })
        )
    }

    private writeList({ writer, list }: { writer: Writer; list: List }): void {
        const values = filterNopValues({ values: list.values })
        if (values.length === 0) {
            writer.write("[]")
            return
        }

        writer.writeLine("[")
        writer.indent()
        for (const value of values) {
            value.write(writer)
            writer.writeLine(",")
        }
        writer.dedent()
        writer.write("]")
    }

    private writeMap({ writer, map }: { writer: Writer; map: Map }): void {
        const entries = filterNopMapEntries({ entries: map.entries })
        if (entries.length === 0) {
            writer.write("[]")
            return
        }

        writer.writeLine("[")
        writer.indent()
        for (const entry of entries) {
            entry.key.write(writer)
            writer.write(" => ")
            entry.value.write(writer)
            writer.writeLine(",")
        }
        writer.dedent()
        writer.write("]")
    }

    /* Static factory methods for creating a TypeLiteral */
    public static list({ values }: { values: TypeLiteral[] }): TypeLiteral {
        return new this({
            type: "list",
            values
        })
    }

    public static boolean(value: boolean): TypeLiteral {
        return new this({ type: "boolean", value })
    }

    public static class_({
        reference,
        fields
    }: {
        reference: ClassReference
        fields: ConstructorField[]
    }): TypeLiteral {
        return new this({ type: "class", reference, fields })
    }

    public static file(value: string): TypeLiteral {
        return new this({ type: "file", value })
    }

    public static float(value: number): TypeLiteral {
        return new this({ type: "float", value })
    }

    public static datetime(value: string): TypeLiteral {
        return new this({ type: "datetime", value })
    }

    public static number(value: number): TypeLiteral {
        return new this({ type: "number", value })
    }

    public static map({ entries }: { entries: MapEntry[] }): TypeLiteral {
        return new this({
            type: "map",
            entries
        })
    }

    public static reference(value: AstNode): TypeLiteral {
        return new this({
            type: "reference",
            value
        })
    }

    public static string(value: string): TypeLiteral {
        return new this({
            type: "string",
            value
        })
    }

    public static unknown(value: unknown): TypeLiteral {
        return new this({ type: "unknown", value })
    }

    public static null(): TypeLiteral {
        return new this({ type: "null" })
    }

    public static nop(): TypeLiteral {
        return new this({ type: "nop" })
    }

    public static isNop(typeLiteral: TypeLiteral): boolean {
        return typeLiteral.internalType.type === "nop"
    }

    private writeUnknown({ writer, value }: { writer: Writer; value: unknown }): void {
        switch (typeof value) {
            case "boolean":
                writer.write(value.toString())
                return
            case "string":
                writer.write(value.includes('"') ? `\`${value}\`` : `"${value}"`)
                return
            case "number":
                writer.write(value.toString())
                return
            case "object":
                if (value == null) {
                    writer.write("null")
                    return
                }
                if (Array.isArray(value)) {
                    this.writeUnknownArray({ writer, value })
                    return
                }
                this.writeUnknownMap({ writer, value })
                return
            default:
                throw new Error(`Internal error; unsupported unknown type: ${typeof value}`)
        }
    }

    private writeUnknownArray({
        writer,
        value
    }: {
        writer: Writer
        // biome-ignore lint/suspicious/noExplicitAny: allow
        value: any[]
    }): void {
        if (value.length === 0) {
            writer.write("[]")
            return
        }
        writer.writeLine("[")
        writer.indent()
        for (const element of value) {
            writer.writeNode(TypeLiteral.unknown(element))
            writer.writeLine(",")
        }
        writer.dedent()
        writer.write("]")
    }

    private writeUnknownMap({ writer, value }: { writer: Writer; value: object }): void {
        const entries = Object.entries(value)
        if (entries.length === 0) {
            writer.write("[]")
            return
        }
        writer.writeLine("[")
        writer.indent()
        for (const [key, val] of entries) {
            writer.write(`'${key}' => `)
            writer.writeNode(TypeLiteral.unknown(val))
            writer.writeLine(",")
        }
        writer.dedent()
        writer.write("]")
    }
}

function buildDateTimeFromString({ writer, value }: { writer: Writer; value: string }): ClassInstantiation {
    return new ClassInstantiation({
        classReference: new ClassReference({
            name: "DateTime",
            namespace: ""
        }),
        arguments_: [new CodeBlock(`'${value}'`)]
    })
}
function buildFileFromString({ writer, value }: { writer: Writer; value: string }): MethodInvocation {
    return new MethodInvocation({
        on: new ClassReference({
            name: "File",
            namespace: `${writer.rootNamespace}\\Utils`
        }),
        method: "createFromString",
        arguments_: [new CodeBlock(`"${value}"`)]
    })
}

function filterNopMapEntries({ entries }: { entries: MapEntry[] }): MapEntry[] {
    return entries.filter((entry) => !TypeLiteral.isNop(entry.key) && !TypeLiteral.isNop(entry.value))
}

function filterNopValues({ values }: { values: TypeLiteral[] }): TypeLiteral[] {
    return values.filter((value) => !TypeLiteral.isNop(value))
}
