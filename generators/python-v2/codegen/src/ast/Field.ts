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
            | { type: Type; initializer?: AstNode }
            | { type?: Type; initializer: AstNode }
            | { type: Type; initializer: AstNode }
        );
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly type: Type | undefined;
    public readonly initializer: AstNode | undefined;

    constructor({ name, type, initializer }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.initializer = initializer;

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
            writer.write(` = ${this.initializer}`);
        }
    }
}
