import { AstNode } from "./core/AstNode"
import { Writer } from "./core/Writer"

export declare namespace Selector {
    interface Args {
        /* The node to select from */
        on: AstNode
        /* The node to select (e.g. a field name) */
        selector: AstNode
    }
}

export class Selector extends AstNode {
    public readonly on: AstNode
    public readonly selector: AstNode

    constructor({ on, selector }: Selector.Args) {
        super()
        this.on = on
        this.selector = selector
    }

    public write(writer: Writer): void {
        writer.writeNode(this.on)
        writer.write(".")
        writer.writeNode(this.selector)
    }
}
