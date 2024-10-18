import { CodeBlock } from "./CodeBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";

export declare namespace MethodArgument {
    interface Args {
        /* If a kwarg, then the name of the parameter that this is a keyword argument for */
        name?: string;
        /* The value of the argument */
        value: CodeBlock;
    }
}

export class MethodArgument extends AstNode {
    public readonly name: string | undefined;
    public readonly value: CodeBlock;

    constructor({ name, value }: MethodArgument.Args) {
        super();
        this.name = name;
        this.value = value;
    }

    public write(writer: Writer): void {
        if (this.name !== undefined) {
            writer.write(this.name);
            writer.write("=");
        }
        this.value.write(writer);
    }
}
