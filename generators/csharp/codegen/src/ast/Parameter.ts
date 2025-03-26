import { Type } from "./Type";
import { TypeParameter } from "./TypeParameter";
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
        ref?: boolean;
        out?: boolean;
    }
}

export class Parameter extends AstNode {
    public readonly name: string;
    public readonly docs: string | undefined;
    public readonly initializer: string | undefined;
    public readonly type: Type | TypeParameter;
    private readonly ref: boolean;
    private readonly out: boolean;

    constructor({ name, type, docs, initializer, ref, out }: Parameter.Args) {
        super();
        this.name = name;
        this.type = type;
        this.docs = docs;
        this.initializer = initializer;
        this.ref = ref ?? false;
        this.out = out ?? false;
    }

    public write(writer: Writer): void {
        if (this.ref) {
            writer.write("ref ");
        }
        if (this.out) {
            writer.write("out ");
        }
        writer.writeNode(this.type);
        writer.write(` ${this.name}`);
        if (this.initializer != null) {
            writer.write(` = ${this.initializer}`);
        }
    }
}
