import { AstNode } from "./core/AstNode"
import { Writer } from "./core/Writer"

export declare namespace MethodInvocation {
    interface Args {
        /** The instance to invoke the method on */
        on: AstNode
        /** The method to invoke */
        method: string
        /** The arguments passed to the method */
        arguments_: AstNode[]
    }
}

export class MethodInvocation extends AstNode {
    private on: AstNode
    private method: string
    private arguments_: AstNode[]

    constructor({ on, method, arguments_ }: MethodInvocation.Args) {
        super()
        this.on = on
        this.method = method
        this.arguments_ = arguments_
    }

    public write(writer: Writer): void {
        this.on.write(writer)
        writer.write(".")
        writer.write(this.method)
        // If there is more than one argument, write each argument on its own line,
        // separated by commas, for better readability in the generated Ruby code.
        // Otherwise, write the arguments inline (on the same line).
        writer.write("(")
        if (this.arguments_.length > 1) {
            writer.indent()
            writer.newLine()
            this.arguments_.forEach((argument, index) => {
                if (index > 0) {
                    writer.write(",")
                    writer.newLine()
                }
                argument.write(writer)
            })
            writer.newLine()
            writer.dedent()
        } else {
            this.arguments_.forEach((argument, index) => {
                if (index > 0) {
                    writer.write(", ")
                }
                argument.write(writer)
            })
        }
        writer.write(")")
    }
}
