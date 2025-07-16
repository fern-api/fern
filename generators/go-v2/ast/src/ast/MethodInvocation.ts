import { AstNode } from './core/AstNode'
import { Writer } from './core/Writer'
import { writeArguments } from './utils/writeArguments'

export declare namespace MethodInvocation {
    interface Args {
        /* The instance to invoke the method on */
        on: AstNode
        /* The method to invoke */
        method: string
        /* The arguments passed to the method */
        arguments_: AstNode[]
        /* Whether to write the invocation on multiple lines */
        multiline?: boolean
    }
}

export class MethodInvocation extends AstNode {
    private on: AstNode
    private method: string
    private arguments_: AstNode[]
    private multiline: boolean | undefined

    constructor({ method, arguments_, on, multiline }: MethodInvocation.Args) {
        super()

        this.on = on
        this.method = method
        this.arguments_ = arguments_
        this.multiline = multiline
    }

    public write(writer: Writer): void {
        this.on.write(writer)
        writer.write('.')
        writer.write(this.method)
        writeArguments({ writer, arguments_: this.arguments_, multiline: this.multiline })
    }
}
