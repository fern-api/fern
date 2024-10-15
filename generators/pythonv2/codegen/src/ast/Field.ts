import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Annotation } from "./Annotation";

export declare namespace Field {
    interface Args {
        /* The name of the field */
        name: string;
        /* The type annotation of the field */
        type: Annotation;
        /* The initializer for the field */
        initializer?: string;
    }
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly type: Annotation;
    public readonly initializer: string | undefined;

    constructor({ name, type, initializer }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.initializer = initializer;
    }

    public write(writer: Writer): void {
        writer.write(this.name);
        this.type.write(writer);
        if (this.initializer != null) {
            writer.write(` = ${this.initializer}`);
        }
    }
}
