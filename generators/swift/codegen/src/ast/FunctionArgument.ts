import { Expression } from "./Expression"
import { AstNode, Writer } from "./core"

export declare namespace FunctionArgument {
    interface Args {
        label?: string
        value: Expression
    }
}

export class FunctionArgument extends AstNode {
    public readonly label?: string
    public readonly value: Expression

    constructor({ label, value }: FunctionArgument.Args) {
        super()
        this.label = label
        this.value = value
    }

    public write(writer: Writer): void {
        if (this.label != null) {
            writer.write(this.label)
            writer.write(": ")
        }
        this.value.write(writer)
    }
}
