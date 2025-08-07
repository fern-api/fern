import { AccessLevel } from "./AccessLevel";
import { AstNode, Writer } from "./core";
import { DeclarationType } from "./DeclarationType";
import { DocComment } from "./DocComment";
import { Expression } from "./Expression";
import { isReservedKeyword } from "./syntax";
import { Type } from "./Type";

export declare namespace Property {
    interface Args {
        unsafeName: string;
        accessLevel?: AccessLevel;
        static_?: boolean;
        declarationType: DeclarationType;
        type: Type;
        defaultValue?: Expression;
        docs?: DocComment;
    }
}

export class Property extends AstNode {
    public readonly unsafeName: string;
    public readonly accessLevel?: AccessLevel;
    public readonly static_?: boolean;
    public readonly declarationType: DeclarationType;
    public readonly type: Type;
    public readonly defaultValue?: Expression;
    public readonly docs?: DocComment;

    constructor({ unsafeName, accessLevel, static_, declarationType, type, defaultValue, docs }: Property.Args) {
        super();
        this.unsafeName = unsafeName;
        this.accessLevel = accessLevel;
        this.static_ = static_;
        this.declarationType = declarationType;
        this.type = type;
        this.defaultValue = defaultValue;
        this.docs = docs;
    }

    public write(writer: Writer): void {
        if (this.docs != null) {
            this.docs.write(writer);
        }
        if (this.accessLevel != null) {
            writer.write(this.accessLevel);
            writer.write(" ");
        }
        if (this.static_) {
            writer.write("static ");
        }
        writer.write(this.declarationType);
        writer.write(" ");
        if (isReservedKeyword(this.unsafeName)) {
            writer.write(`\`${this.unsafeName}\``);
        } else {
            writer.write(this.unsafeName);
        }
        writer.write(": ");
        this.type.write(writer);
        if (this.defaultValue != null) {
            writer.write(" = ");
            this.defaultValue.write(writer);
        }
    }
}
