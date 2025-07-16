import { AccessLevel } from "./AccessLevel"
import { DeclarationType } from "./DeclarationType"
import { Type } from "./Type"
import { AstNode, Writer } from "./core"
import { isReservedKeyword } from "./syntax"

export declare namespace Property {
    interface Args {
        unsafeName: string
        accessLevel?: AccessLevel
        static_?: boolean
        declarationType: DeclarationType
        type: Type
        optional?: boolean
    }
}

export class Property extends AstNode {
    public readonly unsafeName: string
    public readonly accessLevel?: AccessLevel
    public readonly static_?: boolean
    public readonly declarationType: DeclarationType
    public readonly type: Type
    public readonly optional?: boolean

    constructor({ unsafeName, accessLevel, static_, declarationType, type, optional }: Property.Args) {
        super()
        this.unsafeName = unsafeName
        this.accessLevel = accessLevel
        this.static_ = static_
        this.declarationType = declarationType
        this.type = type
        this.optional = optional
    }

    public write(writer: Writer): void {
        if (this.accessLevel != null) {
            writer.write(this.accessLevel)
            writer.write(" ")
        }
        if (this.static_) {
            writer.write("static ")
        }
        writer.write(this.declarationType)
        writer.write(" ")
        if (isReservedKeyword(this.unsafeName)) {
            writer.write(`\`${this.unsafeName}\``)
        } else {
            writer.write(this.unsafeName)
        }
        writer.write(": ")
        this.type.write(writer)
        if (this.optional) {
            writer.write("?")
        }
    }
}
