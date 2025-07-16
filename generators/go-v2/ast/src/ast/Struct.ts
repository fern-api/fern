import { CodeBlock } from "@fern-api/browser-compatible-base-generator"

import { Comment } from "./Comment"
import { Field } from "./Field"
import { Method } from "./Method"
import { Parameter } from "./Parameter"
import { AstNode } from "./core/AstNode"
import { Writer } from "./core/Writer"

export declare namespace Struct {
    interface Args {
        /* The name of the Go struct */
        name: string
        /* The import path of the Go struct */
        importPath: string
        /* Docs associated with the class */
        docs?: string
    }

    interface Constructor {
        parameters: Parameter[]
        body: AstNode
    }
}

export class Struct extends AstNode {
    public readonly name: string
    public readonly importPath: string
    public readonly docs: string | undefined

    public constructor_: Struct.Constructor | undefined
    public readonly fields: Field[] = []
    public readonly methods: Method[] = []

    constructor({ name, importPath, docs }: Struct.Args) {
        super()
        this.name = name
        this.importPath = importPath
        this.docs = docs
    }

    public addConstructor(constructor: Struct.Constructor): void {
        this.constructor_ = constructor
    }

    public addField(...fields: Field[]): void {
        this.fields.push(...fields)
    }

    public addMethod(...methods: Method[]): void {
        this.methods.push(...methods)
    }

    public write(writer: Writer): void {
        writer.writeNode(new Comment({ docs: this.docs }))
        writer.write(`type ${this.name} struct {`)
        if (this.fields.length === 0) {
            writer.writeLine("}")
        } else {
            writer.newLine()
            writer.indent()
            for (const field of this.fields) {
                writer.writeNode(field)
                writer.newLine()
            }
            writer.dedent()
            writer.writeLine("}")
        }

        if (this.constructor_ != null) {
            writer.newLine()
            this.writeConstructor({ writer, constructor: this.constructor_ })
        }

        if (this.methods.length > 0) {
            for (const method of this.methods) {
                writer.newLine()
                writer.writeNode(method)
                writer.newLine()
            }
        }
    }

    private writeConstructor({ writer, constructor }: { writer: Writer; constructor: Struct.Constructor }): void {
        writer.write(`func New${this.name}(`)
        constructor.parameters.forEach((parameter, index) => {
            if (index > 0) {
                writer.write(", ")
            }
            writer.writeNode(parameter)
        })
        writer.write(`) *${this.name} {`)
        writer.newLine()
        writer.indent()
        writer.writeNode(constructor.body)
        writer.writeNewLineIfLastLineNot()
        writer.dedent()
        writer.writeLine("}")
    }
}
