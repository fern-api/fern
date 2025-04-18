import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Field {
    export interface BaseArgs {
        /* The name of the field */
        name: string;
        /* The documentation for the field */
        docs?: string;
    }

    /* At least one of type or initializer must be defined
     * type: The type annotation of the field
     * initializer: The initializer for the field
     */
    export type Args = BaseArgs &
        (
            | { type: Type; initializer?: AstNode }
            | { type?: Type; initializer: AstNode }
            | { type: Type; initializer: AstNode }
        );
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly type: Type | undefined;
    public readonly initializer: AstNode | undefined;
    public readonly docs: string | undefined;

    constructor({ name, type, initializer, docs }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.initializer = initializer;
        this.docs = docs;

        this.inheritReferences(this.type);
        this.inheritReferences(this.initializer);
    }

    public write(writer: Writer): void {
        writer.write(this.name);

        if (this.type !== undefined) {
            writer.write(": ");
            this.type.write(writer);
        }

        if (this.initializer !== undefined) {
            writer.write(" = ");
            this.initializer.write(writer);
        }

        if (this.docs != null) {
            writer.newLine();
            writer.write('"""');
            writer.newLine();
            writer.write(this.docs);
            writer.newLine();
            writer.write('"""');
        }
    }
}
