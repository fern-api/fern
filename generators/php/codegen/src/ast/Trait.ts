import { ClassReference } from "./ClassReference";
import { Comment } from "./Comment";
import { Field } from "./Field";
import { Method } from "./Method";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { orderByAccess } from "./utils/orderByAccess";

export declare namespace Trait {
    interface Args {
        /* The name of the PHP trait */
        name: string;
        /* The namespace of the PHP trait */
        namespace: string;
        /* Docs associated with the trait */
        docs?: string;
        /* The traits that this trait uses, if any */
        traits?: ClassReference[];
    }
}

export class Trait extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly docs: string | undefined;
    public readonly traits: ClassReference[];

    public readonly fields: Field[] = [];
    public readonly methods: Method[] = [];

    constructor({ name, namespace, docs, traits }: Trait.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.docs = docs;
        this.traits = traits ?? [];
    }

    public addField(field: Field): void {
        this.fields.push(field);
    }

    public addMethod(method: Method): void {
        this.methods.push(method);
    }

    public write(writer: Writer): void {
        this.writeComment(writer);
        writer.write(`trait ${this.name} `);
        writer.newLine();
        writer.writeLine("{");
        writer.indent();

        if (this.traits.length > 0) {
            writer.write("use ");
            this.traits.forEach((trait, index) => {
                if (index > 0) {
                    writer.write(",");
                }
                writer.writeNode(trait);
            });
            writer.writeTextStatement("");
            writer.newLine();
        }

        this.writeFields({ writer, fields: orderByAccess(this.fields) });
        this.writeMethods({ writer, methods: orderByAccess(this.methods) });

        writer.dedent();
        writer.writeLine("}");
        return;
    }

    private writeComment(writer: Writer): void {
        if (this.docs == null) {
            return undefined;
        }
        const comment = new Comment({ docs: this.docs });
        comment.write(writer);
    }

    private writeFields({ writer, fields }: { writer: Writer; fields: Field[] }): void {
        fields.forEach((field, index) => {
            if (index > 0) {
                writer.newLine();
            }
            field.write(writer);
            writer.writeNewLineIfLastLineNot();
        });
    }

    private writeMethods({ writer, methods }: { writer: Writer; methods: Method[] }): void {
        methods.forEach((method, index) => {
            if (index > 0) {
                writer.newLine();
            }
            method.write(writer);
            writer.writeNewLineIfLastLineNot();
        });
    }
}
