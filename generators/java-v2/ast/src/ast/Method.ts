import { Access } from './Access'
import { Parameter } from './Parameter'
import { Type } from './Type'
import { AstNode } from './core/AstNode'
import { Writer } from './core/Writer'

export declare namespace Method {
    interface Args {
        /* The name of the method */
        name: string
        /* The access level of the method */
        access: Access
        /* The parameters of the method */
        parameters: Parameter[]
        /* The body of the method */
        body?: AstNode
        /* The return type of the method */
        return_?: Type
        /* Whether the method is static */
        static_?: boolean
    }
}

export class Method extends AstNode {
    private name: string
    private access: Access
    private parameters: Parameter[]
    private body: AstNode | undefined
    private return_: Type | undefined
    private static_: boolean

    constructor({ name, access, parameters, body, static_, return_ }: Method.Args) {
        super()

        this.name = name
        this.access = access
        this.parameters = parameters
        this.body = body
        this.return_ = return_
        this.static_ = static_ ?? false
    }

    public write(writer: Writer): void {
        writer.write(`${this.access} `)
        if (this.static_) {
            writer.write('static ')
        }

        if (this.return_ != null) {
            writer.writeNode(this.return_)
        } else {
            writer.write('void')
        }

        writer.write(` ${this.name}`)

        if (this.parameters.length === 0) {
            writer.write('()')
        } else if (this.parameters.length === 1) {
            writer.write('(')
            if (this.parameters[0] == null) {
                throw new Error('Cannot render parameter ' + this.parameters[0])
            }
            writer.writeNode(this.parameters[0])
            writer.write(')')
        } else {
            writer.writeLine('(')
            writer.indent()
            this.parameters.forEach((parameter, index) => {
                if (index > 0) {
                    writer.writeLine(', ')
                }
                writer.writeNode(parameter)
            })
            writer.dedent()
            writer.write(')')
        }

        if (this.body == null) {
            writer.write(';')
            return
        }

        writer.writeLine(' {')
        writer.indent()
        writer.writeNode(this.body)
        writer.writeNewLineIfLastLineNot()
        writer.dedent()
        writer.write('}')
    }
}
