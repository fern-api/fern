import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Parameter {
    interface Args {
        /* The name of the parameter */
        name: string;
        /* The type of the parameter */
        type: Type;
        /* Docs for the parameter */
        docs?: string;
        /* The initializer for the parameter */
        initializer?: string;
    }
}

export class Parameter extends AstNode {
    public readonly name: string;
    public readonly docs: string | undefined;
    public readonly initializer: string | undefined;
    public readonly type: Type;

    constructor({ name, type, docs, initializer }: Parameter.Args) {
        super();
        this.name = name;
        this.type = type;
        this.docs = docs;
        this.initializer = initializer;
    }

    public write(writer: Writer): void {
        this.type.write(writer);
        writer.write(` ${this.name}`);
        if (this.initializer != null) {
            writer.write(` = ${this.initializer}`);
        }
    }
}
