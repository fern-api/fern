import { KeywordParameter } from "./KeywordParameter";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Field {
    interface Args {
        name: string;
        type: Type;
        kwargs: Array<KeywordParameter>;
    }
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly type: Type;
    public readonly kwargs: Array<KeywordParameter>;

    constructor({ name, type, kwargs }: Field.Args) {
        super();

        this.name = name;
        this.type = type;
        this.kwargs = kwargs;
    }

    public write(writer: Writer): void {
        writer.write("field :" + this.name);
        writer.write(", ");
        this.type.writeTypeDefinition(writer);

        this.kwargs.forEach((kwarg, index) => {
            if (index < this.kwargs.length - 1) {
                writer.write(", ");
            }
            kwarg.write(writer);
        });
    }

    public writeTypeDefinition(writer: Writer): void {
        writer.write(`${this.name}: `);

        this.type.writeTypeDefinition(writer);
    }
}
