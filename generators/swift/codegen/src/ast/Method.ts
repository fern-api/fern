import { AccessLevel } from "./AccessLevel";
import { Type } from "./Type";
import { AstNode, Writer } from "./core";
import { escapeReservedKeyword } from "./syntax/reserved-keywords";

export declare namespace Method {
    interface Parameter {
        /** Used when calling the function. */
        argumentLabel?: string;
        /** Used within the function’s body. */
        unsafeName: string;
        type: Type;
        optional?: boolean;
    }

    interface Args {
        unsafeName: string;
        accessLevel?: AccessLevel;
        static_?: boolean;
        parameters?: Parameter[];
        returnType: Type;
    }
}

export class Method extends AstNode {
    public readonly unsafeName: string;
    public readonly accessLevel?: AccessLevel;
    public readonly static_?: boolean;
    public readonly parameters?: Method.Parameter[];
    public readonly returnType: Type;

    constructor({ unsafeName, accessLevel, static_, parameters, returnType }: Method.Args) {
        super();
        this.unsafeName = unsafeName;
        this.accessLevel = accessLevel;
        this.static_ = static_;
        this.parameters = parameters;
        this.returnType = returnType;
    }

    public write(writer: Writer): void {
        if (this.accessLevel != null) {
            writer.write(this.accessLevel);
            writer.write(" ");
        }
        if (this.static_) {
            writer.write("static ");
        }
        writer.write("func ");
        writer.write(escapeReservedKeyword(this.unsafeName));
        writer.write("(");
        this.parameters?.forEach((parameter, index) => {
            if (index > 0) {
                writer.write(", ");
            }
            if (parameter.argumentLabel == null) {
                writer.write("_ ");
            } else if (parameter.argumentLabel !== parameter.unsafeName) {
                writer.write(parameter.argumentLabel);
                writer.write(" ");
            }
            writer.write(parameter.unsafeName);
            writer.write(": ");
            parameter.type.write(writer);
            if (parameter.optional) {
                writer.write("?");
            }
        });
        writer.write(") -> ");
        this.returnType.write(writer);
    }
}
