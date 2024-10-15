import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Annotation } from "./Annotation";

export declare namespace Variable {
    interface Args {
        /* The name of the variable */
        name: string;
        /* The type annotation of the variable */
        type?: Annotation;
        /* The initializer for the variable */
        initializer?: string;
    }
}

export class Variable extends AstNode {
    public readonly name: string;
    public readonly type: Annotation | undefined;
    public readonly initializer: string | undefined;

    constructor({ name, type, initializer }: Variable.Args) {
        super();
        this.name = name;
        this.type = type;
        this.initializer = initializer;
    }

    public write(writer: Writer): void {
        writer.write(this.name);
        if (this.type) {
            this.type.write(writer);
        }
        if (this.initializer != null) {
            writer.write(` = ${this.initializer}`);
        }
    }
}
