import { Comment } from "./Comment";
import { Field } from "./Field";
import { GoTypeReference } from "./GoTypeReference";
import { Method } from "./Method";
import { Parameter } from "./Parameter";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Struct {
    interface Args {
        /* The name of the Go struct. If not provided, the struct is anonymous. */
        name?: string;
        /* Embedded types defined within the struct. */
        embeds?: GoTypeReference[];
        /* Fields defined within the struct. */
        fields?: Field[];
        /* Docs associated with the struct. */
        docs?: string;
    }

    interface Constructor {
        parameters: Parameter[];
        body: AstNode;
        /* Overrides the default name of the constructor. */
        name?: string;
    }
}

export class Struct extends AstNode {
    public readonly name: string | undefined;
    public readonly embeds: GoTypeReference[] = [];
    public readonly fields: Field[] = [];
    public readonly docs: string | undefined;
    public readonly methods: Method[] = [];
    public constructor_: Struct.Constructor | undefined;

    constructor({ name, embeds, fields, docs }: Struct.Args) {
        super();
        this.name = name;
        this.docs = docs;
        this.embeds = embeds ?? [];
        this.fields = fields ?? [];
    }

    public addConstructor(constructor: Struct.Constructor): void {
        this.constructor_ = constructor;
    }

    public addField(...fields: Field[]): void {
        this.fields.push(...fields);
    }

    public addMethod(...methods: Method[]): void {
        this.methods.push(...methods);
    }

    public write(writer: Writer): void {
        this.writeType({ writer });
        if (this.constructor_ != null) {
            writer.newLine();
            writer.newLine();
            this.writeConstructor({ writer, constructor: this.constructor_ });
        }
        this.writeMethods({ writer });
    }

    private writeType({ writer }: { writer: Writer }): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        if (this.name != null) {
            writer.write(`type ${this.name} struct {`);
        } else {
            writer.write(`struct{`);
        }
        if (this.embeds.length === 0 && this.fields.length === 0) {
            writer.writeLine("}");
            return;
        }
        writer.newLine();
        writer.indent();
        for (const embed of this.embeds) {
            writer.writeNode(embed);
            writer.newLine();
        }
        const exportedFields = this.fields.filter((field) => this.isExported(field));
        for (const field of exportedFields) {
            writer.writeNode(field);
            writer.newLine();
        }
        const unexportedFields = this.fields.filter((field) => !this.isExported(field));
        if (exportedFields.length > 0 && unexportedFields.length > 0) {
            // Exported fields are grouped separately from unexported fields.
            writer.newLine();
        }
        for (const field of unexportedFields) {
            writer.writeNode(field);
            writer.newLine();
        }
        writer.dedent();
        writer.write("}");
    }

    private writeConstructor({ writer, constructor }: { writer: Writer; constructor: Struct.Constructor }): void {
        if (constructor.name != null) {
            writer.write(`func ${constructor.name}(`);
        } else {
            writer.write(`func New${this.name}(`);
        }
        constructor.parameters.forEach((parameter, index) => {
            if (index > 0) {
                writer.write(", ");
            }
            writer.writeNode(parameter);
        });
        writer.write(`) *${this.name} {`);
        writer.newLine();
        writer.indent();
        writer.writeNode(constructor.body);
        writer.writeNewLineIfLastLineNot();
        writer.dedent();
        writer.writeLine("}");
    }

    private writeMethods({ writer }: { writer: Writer }): void {
        if (this.methods.length === 0) {
            return;
        }
        writer.writeNewLineIfLastLineNot();
        for (const method of this.methods) {
            writer.newLine();
            writer.writeNode(method);
            writer.newLine();
        }
    }

    private isExported(field: Field): boolean {
        const char = field.name.charAt(0);
        return char === char.toUpperCase();
    }
}
