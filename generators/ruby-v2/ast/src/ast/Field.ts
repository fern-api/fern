import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Field {
    interface Args {
        name: string;
        type: Type;
        optional?: boolean;
    }
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly type: Type;
    public readonly optional: boolean;

    constructor({ name, type, optional }: Field.Args) {
        super();

        this.name = name;
        this.type = type;
        this.optional = optional || false;
    }

    public write(writer: Writer): void {
        writer.write("field :" + this.name);
        writer.write(", ");
        this.type.writeTypeDefinition(writer);

        if (this.optional) {
            writer.write(", optional: true");
        }
    }

    public writeTypeDefinition(writer: Writer): void {
        writer.write(`${this.name}: `);

        this.type.writeTypeDefinition(writer);
    }
}
