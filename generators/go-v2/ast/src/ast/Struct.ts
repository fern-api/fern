import { Comment } from "./Comment";
import { Field } from "./Field";
import { Method } from "./Method";
import { Parameter } from "./Parameter";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Struct {
    interface Args {
        /* The name of the Go struct */
        name: string;
        /* The import path of the Go struct */
        importPath: string;
        /* Docs associated with the class */
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
    public readonly name: string;
    public readonly importPath: string;
    public readonly docs: string | undefined;

    public constructor_: Struct.Constructor | undefined;
    public readonly fields: Field[] = [];
    public readonly methods: Method[] = [];

    constructor({ name, importPath, docs }: Struct.Args) {
        super();
        this.name = name;
        this.importPath = importPath;
        this.docs = docs;
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
            this.writeConstructor({ writer, constructor: this.constructor_ });
        }
        this.writeMethods({ writer });
    }

    private writeType({ writer }: { writer: Writer }): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        writer.write(`type ${this.name} struct {`);
        if (this.fields.length === 0) {
            writer.writeLine("}");
            return;
        }
        writer.newLine();
        writer.indent();
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
        writer.writeLine("}");
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
