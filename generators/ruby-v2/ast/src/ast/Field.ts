import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";

export declare namespace Field {
    interface Args {
        /* The name of the field */
        name: string;
        /* The type of the field */
        type: Type;
        /* Whether the field is optional */
        optional?: boolean;
        /* Whether the field is nullable */
        nullable?: boolean;
        /* The doc string for the field */
        docs?: string;
    }
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly type: Type;
    private readonly docs: string;
    private readonly optional: boolean;
    private readonly nullable: boolean;

    constructor({ name, type, docs, optional, nullable }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.docs = docs ?? "";
        this.optional = optional ?? false;
        this.nullable = nullable ?? false;
    }

    public write(writer: Writer): void {
        writer.writeLine(`# ${this.docs}`);
        writer.write(`field :${this.name}, `);
        this.type.write(writer);
        writer.write(`, optional: ${this.optional}, nullable: ${this.nullable}`);
    }
}
