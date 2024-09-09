import { CodeBlock } from "./CodeBlock";
import { AstNode, Writer } from "./core";

export declare namespace Variable {
    interface Args {
        /* Whether to export */
        export?: boolean;
        /* Whether to label as const */
        const?: boolean;
        /* The name of the variable */
        name: string;
        /* The initializer for the variable */
        initializer: CodeBlock;
    }
}

export class Variable extends AstNode {
    public constructor(private readonly args: Variable.Args) {
        super();
    }

    public write(writer: Writer): void {
        if (this.args.export) {
            writer.write("export ");
        }
        if (this.args.const) {
            writer.write("const ");
        }
        writer.write(`${this.args.name} = `);
        writer.writeNode(this.args.initializer);
    }
}
