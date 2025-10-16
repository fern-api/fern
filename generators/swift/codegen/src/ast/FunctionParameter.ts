import { AstNode, Writer } from "./core";
import { Expression } from "./Expression";
import { TypeReference } from "./TypeReference";

export declare namespace FunctionParameter {
    interface Args {
        /** Used when calling the function. */
        argumentLabel?: string;
        /** Used within the function’s body. */
        unsafeName: string;
        escaping?: true;
        type: TypeReference;
        defaultValue?: Expression;
        docsContent?: string;
    }
}

export class FunctionParameter extends AstNode {
    public readonly argumentLabel?: string;
    public readonly unsafeName: string;
    public readonly escaping?: true;
    public readonly type: TypeReference;
    public readonly defaultValue?: Expression;
    public readonly docsContent?: string;

    constructor({ argumentLabel, unsafeName, escaping, type, defaultValue, docsContent }: FunctionParameter.Args) {
        super();
        this.argumentLabel = argumentLabel;
        this.unsafeName = unsafeName;
        this.escaping = escaping;
        this.type = type;
        this.defaultValue = defaultValue;
        this.docsContent = docsContent;
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
        if (this.escaping) {
            writer.write("@escaping ");
        }
        this.type.write(writer);
        if (this.defaultValue != null) {
            writer.write(" = ");
            this.defaultValue.write(writer);
        }
    }
}
