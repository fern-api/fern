import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";

export declare namespace Field {
    export interface Args {
        /* The name of the field */
        name: string;
        /* The type annotation of the field */
        type: Type;
        /* The initializer for the field */
        initializer?: string;
    }
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly type: Type;
    public readonly initializer: string | undefined;

    constructor({ name, type, initializer }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.initializer = initializer;
    }

    public write(writer: Writer): void {
        writer.write(this.name);
        writer.write(": ");
        this.type.write(writer);
        if (this.initializer != null) {
            writer.write(` = ${this.initializer}`);
        }
    }
}
