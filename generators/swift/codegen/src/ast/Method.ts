import { AccessLevel } from "./AccessLevel"
import { CodeBlock } from "./CodeBlock"
import { FunctionParameter } from "./FunctionParameter"
import { Type } from "./Type"
import { AstNode, Writer } from "./core"
import { escapeReservedKeyword } from "./syntax/reserved-keywords"

export declare namespace Method {
    interface Args {
        unsafeName: string
        accessLevel?: AccessLevel
        static_?: boolean
        parameters?: FunctionParameter[]
        returnType: Type
        body?: CodeBlock
    }
}

export class Method extends AstNode {
    public readonly unsafeName: string
    public readonly accessLevel?: AccessLevel
    public readonly static_?: boolean
    public readonly parameters?: FunctionParameter[]
    public readonly returnType: Type
    public readonly body: CodeBlock

    constructor({ unsafeName, accessLevel, static_, parameters, returnType, body }: Method.Args) {
        super()
        this.unsafeName = unsafeName
        this.accessLevel = accessLevel
        this.static_ = static_
        this.parameters = parameters
        this.returnType = returnType
        this.body = body ?? CodeBlock.empty()
    }

    public write(writer: Writer): void {
        if (this.accessLevel != null) {
            writer.write(this.accessLevel)
            writer.write(" ")
        }
        if (this.static_) {
            writer.write("static ")
        }
        writer.write("func ")
        writer.write(escapeReservedKeyword(this.unsafeName))
        writer.write("(")
        this.parameters?.forEach((parameter, parameterIdx) => {
            if (parameterIdx > 0) {
                writer.write(", ")
            }
            parameter.write(writer)
        })
        writer.write(") -> ")
        this.returnType.write(writer)
        writer.write(" ")
        this.body.write(writer)
    }
}
