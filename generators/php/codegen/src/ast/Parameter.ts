import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";
import { Access } from "./Access";
import { CodeBlock } from "./CodeBlock";

export declare namespace Parameter {
    interface Args {
        /* The name of the parameter */
        name: string;
        /* The type of the parameter */
        type: Type;
        /* Docs for the parameter */
        docs?: string;
        /* The initializer for the parameter */
        initializer?: CodeBlock;
        /* The access of the parameter */
        access?: Access;
        /* If the parameter is readonly */
        readonly_?: boolean;
    }
}

export class Parameter extends AstNode {
    public readonly name: string;
    public readonly type: Type;
    public readonly docs: string | undefined;
    public readonly initializer: CodeBlock | undefined;
    public readonly access: Access | undefined;
    public readonly readonly_: boolean;

    constructor({ name, type, docs, initializer, access, readonly_ }: Parameter.Args) {
        super();
        this.name = name;
        this.type = type;
        this.docs = docs;
        this.initializer = initializer;
        this.access = access;
        this.readonly_ = readonly_ ?? false;
    }

    public write(writer: Writer): void {
        if (this.access != null) {
            writer.write(`${this.access} `);
        }
        if (this.readonly_) {
            writer.write("readonly ");
        }
        this.type.write(writer);
        writer.write(` ${this.name}`);
        if (this.initializer != null) {
            writer.write(" = ");
            this.initializer.write(writer);
        }
    }
}
