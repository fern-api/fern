import { CodeBlock } from "./CodeBlock";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Parameter {
    interface Args {
        /* The name of the parameter */
        name: string;
        /* The type of the parameter */
        type?: Type;
        /* The initializer for the parameter */
        initializer?: AstNode;
    }
}

export class Parameter extends AstNode {
    public readonly name: string;
    public readonly initializer: AstNode | undefined;
    public readonly type: Type | undefined;

    constructor({ name, type, initializer }: Parameter.Args) {
        super();
        this.name = name;
        this.type = type;
        this.initializer = initializer;
    }

    public write(writer: Writer): void {
        writer.write(this.name);

        if (this.type) {
            writer.write(": ");
            this.type.write(writer);
        }

        if (this.initializer !== undefined) {
            writer.write(" = ");
            this.initializer.write(writer);
        }
    }
}
