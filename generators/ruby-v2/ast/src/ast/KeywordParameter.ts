import { AstNode } from "../ruby"
import { Parameter } from "./Parameter"
import { Writer } from "./core/Writer"

export declare namespace KeywordParameter {
    interface Args extends Parameter.Args {
        /* The default value of this parameter. */
        initializer?: AstNode
    }
}

export class KeywordParameter extends Parameter {
    public readonly initializer: AstNode | undefined

    constructor({ name, type, initializer, optional }: KeywordParameter.Args) {
        super({ name, type, optional })

        this.initializer = initializer
    }

    public write(writer: Writer): void {
        writer.write(`${this.name}:`)

        if (this.initializer) {
            writer.write(` ${this.initializer.write(writer)}`)
        }
    }

    public writeTypeDefinition(writer: Writer): void {
        if (this.optional) {
            writer.write("?")
        }

        writer.write(`${this.name}: `)

        this.type.writeTypeDefinition(writer)
    }
}
