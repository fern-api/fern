import { AccessLevel } from "./AccessLevel";
import { CodeBlock } from "./CodeBlock";
import { Type } from "./Type";
import { AstNode, Writer } from "./core";

export declare namespace Initializer {
    interface Parameter {
        /** Used when calling the function. */
        argumentLabel?: string;
        /** Used within the function’s body. */
        unsafeName: string;
        type: Type;
        optional?: boolean;
        defaultRawValue?: string;
    }

    interface Args {
        unsafeName: string;
        accessLevel?: AccessLevel;
        failable?: boolean;
        parameters?: Parameter[];
        body?: CodeBlock;
    }
}

export class Initializer extends AstNode {
    public readonly unsafeName: string;
    public readonly accessLevel?: AccessLevel;
    public readonly failable?: boolean;
    public readonly parameters?: Initializer.Parameter[];
    public readonly body: CodeBlock;

    constructor({ unsafeName, accessLevel, failable, parameters, body }: Initializer.Args) {
        super();
        this.unsafeName = unsafeName;
        this.accessLevel = accessLevel;
        this.failable = failable;
        this.parameters = parameters;
        this.body = body ?? CodeBlock.empty();
    }

    public write(writer: Writer): void {
        if (this.accessLevel != null) {
            writer.write(this.accessLevel);
            writer.write(" ");
        }
        writer.write("init");
        if (this.failable) {
            writer.write("?");
        }
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
            if (parameter.defaultRawValue != null) {
                writer.write(" = ");
                writer.write(parameter.defaultRawValue);
            }
        });
        writer.write(") ");
        this.body.write(writer);
    }
}
