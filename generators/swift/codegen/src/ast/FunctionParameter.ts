import { Expression } from "./Expression";
import { Type } from "./Type";
import { AstNode, Writer } from "./core";

export declare namespace FunctionParameter {
    interface Args {
        /** Used when calling the function. */
        argumentLabel?: string;
        /** Used within the function’s body. */
        unsafeName: string;
        type: Type;
        defaultValue?: Expression;
    }
}

export class FunctionParameter extends AstNode {
    public readonly argumentLabel?: string;
    public readonly unsafeName: string;
    public readonly type: Type;
    public readonly defaultValue?: Expression;

    constructor({ argumentLabel, unsafeName, type, defaultValue }: FunctionParameter.Args) {
        super();
        this.argumentLabel = argumentLabel;
        this.unsafeName = unsafeName;
        this.type = type;
        this.defaultValue = defaultValue;
    }

    public write(writer: Writer): void {
        if (this.argumentLabel == null) {
            writer.write("_ ");
        } else if (this.argumentLabel !== this.unsafeName) {
            writer.write(this.argumentLabel);
            writer.write(" ");
        }
        // Parameter names don't need to be escaped
        writer.write(this.unsafeName);
        writer.write(": ");
        this.type.write(writer);
        if (this.defaultValue != null) {
            writer.write(" = ");
            this.defaultValue.write(writer);
        }
    }
}
