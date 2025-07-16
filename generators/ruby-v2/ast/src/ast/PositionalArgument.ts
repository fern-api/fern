import { AstNode } from './core/AstNode'
import { Writer } from './core/Writer'

export declare namespace PositionalArgument {
    interface Args {
        /** The value passed to the positional argument */
        value: AstNode
    }
}

export class PositionalArgument extends AstNode {
    public readonly value: AstNode

    constructor({ value }: PositionalArgument.Args) {
        super()
        this.value = value
    }

    public write(writer: Writer): void {
        this.value.write(writer)
    }
}
