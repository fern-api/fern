import { AccessLevel } from "./AccessLevel";
import { CodeBlock } from "./CodeBlock";
import { FunctionParameter } from "./FunctionParameter";
import { AstNode, Writer } from "./core";

export declare namespace Initializer {
    interface Args {
        unsafeName: string;
        accessLevel?: AccessLevel;
        failable?: boolean;
        parameters?: FunctionParameter[];
        body?: CodeBlock;
    }
}

export class Initializer extends AstNode {
    public readonly unsafeName: string;
    public readonly accessLevel?: AccessLevel;
    public readonly failable?: boolean;
    public readonly parameters?: FunctionParameter[];
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
        this.parameters?.forEach((parameter, parameterIdx) => {
            if (parameterIdx > 0) {
                writer.write(", ");
            }
            parameter.write(writer);
        });
        writer.write(") ");
        this.body.write(writer);
    }
}
