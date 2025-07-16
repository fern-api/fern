import { UnnamedArgument } from "@fern-api/browser-compatible-base-generator"

import { CodeBlock } from "./CodeBlock"
import { Comment } from "./Comment"
import { GoTypeReference } from "./GoTypeReference"
import { Parameter } from "./Parameter"
import { Type } from "./Type"
import { AstNode } from "./core/AstNode"
import { Writer } from "./core/Writer"
import { writeArguments } from "./utils/writeArguments"

export declare namespace Method {
    interface Args {
        /* The parameters of the method */
        parameters: Parameter[]
        /* The return type of the method */
        return_: Type[]
        /* The name of the method */
        name?: string
        /* The body of the method */
        body?: CodeBlock
        /* Documentation for the method */
        docs?: string
        /* The class this method belongs to, if any */
        typeReference?: GoTypeReference
        /* Whether to write the invocation on multiple lines */
        multiline?: boolean
        /* Whether this method should use a pointer receiver */
        pointerReceiver?: boolean
    }
}

export class Method extends AstNode {
    public readonly parameters: Parameter[]
    public readonly return_: Type[]
    public readonly name: string | undefined
    public readonly body: CodeBlock | undefined
    public readonly docs: string | undefined
    public readonly typeReference: GoTypeReference | undefined
    public readonly multiline: boolean | undefined
    public readonly pointerReceiver: boolean | undefined

    constructor({ name, parameters, return_, body, docs, typeReference, multiline, pointerReceiver }: Method.Args) {
        super()
        this.name = name
        this.parameters = parameters
        this.return_ = return_
        this.body = body
        this.docs = docs
        this.typeReference = typeReference
        this.multiline = multiline
        this.pointerReceiver = pointerReceiver
    }

    public write(writer: Writer): void {
        writer.writeNode(new Comment({ docs: this.docs }))
        writer.write("func")
        if (this.typeReference != null) {
            this.writeReceiver({ writer, typeReference: this.typeReference })
        }
        if (this.name != null) {
            writer.write(` ${this.name}`)
        }
        writeArguments({
            writer,
            arguments_: this.parameters,
            multiline: this.multiline
        })
        if (this.return_ != null) {
            writer.write(" ")
            if (this.return_.length > 1) {
                writer.write("(")
            }
            this.return_.forEach((returnType, index) => {
                if (index > 0) {
                    writer.write(", ")
                }
                writer.writeNode(returnType)
            })
            if (this.return_.length > 1) {
                writer.write(")")
            }
        }
        writer.writeLine("{")
        writer.indent()
        this.body?.write(writer)
        writer.dedent()
        writer.writeNewLineIfLastLineNot()
        writer.write("}")
    }

    private writeReceiver({ writer, typeReference }: { writer: Writer; typeReference: GoTypeReference }): void {
        writer.write(` (${this.getReceiverName(typeReference.name)} `)
        if (this.pointerReceiver) {
            writer.write("*")
        }
        typeReference.write(writer)
        writer.write(")")
    }

    private getReceiverName(s: string): string {
        return s.charAt(0).toLowerCase()
    }
}
