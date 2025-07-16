import { AstNode } from "./core/AstNode"
import { Writer } from "./core/Writer"

export declare namespace KeywordArgument {
    interface Args {
        /** The name of the keyword argument */
        name: string
        /** The value passed to the keyword argument */
        value: AstNode
    }
}

export class KeywordArgument extends AstNode {
    public readonly name: string
    public readonly value: AstNode

    constructor({ name, value }: KeywordArgument.Args) {
        super()
        this.name = name
        this.value = value
    }

    public write(writer: Writer): void {
        writer.write(`${this.name}: `)
        this.value.write(writer)
    }
}
