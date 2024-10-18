import { CodeBlock } from "./CodeBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";

export declare namespace Field {
    export interface BaseArgs {
        /* The name of the field */
        name: string;
    }

    /* At least one of type or initializer must be defined
     * type: The type annotation of the field
     * initializer: The initializer for the field
     */
    export type Args = BaseArgs &
        (
            | { type: Type; initializer?: CodeBlock }
            | { type?: Type; initializer: CodeBlock }
            | { type: Type; initializer: CodeBlock }
        );
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly type: Type | undefined;
    public readonly initializer: CodeBlock | undefined;

    constructor({ name, type, initializer }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.initializer = initializer;

        if (this.type) {
            const typeReferences = this.type.getReferences();
            typeReferences.forEach((reference) => {
                this.addReference(reference);
            });
        }
        if (this.initializer) {
            const initializerReferences = this.initializer.getReferences();
            initializerReferences.forEach((reference) => {
                this.addReference(reference);
            });
        }
    }

    public write(writer: Writer): void {
        writer.write(this.name);

        if (this.type !== undefined) {
            writer.write(": ");
            this.type.write(writer);
        }

        if (this.initializer !== undefined) {
            writer.write(` = ${this.initializer}`);
        }
    }
}
