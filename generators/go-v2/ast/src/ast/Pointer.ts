import { AstNode } from "./core/AstNode"
import { Writer } from "./core/Writer"

export declare namespace Pointer {
    interface Args {
        /* The value of the pointer */
        node: AstNode
    }
}

export class Pointer extends AstNode {
    public readonly node: AstNode

    constructor({ node }: Pointer.Args) {
        super()
        this.node = node
    }

    public write(writer: Writer): void {
        writer.write("*")
        this.node.write(writer)
    }
}
