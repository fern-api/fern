import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { CodeBlock } from "./CodeBlock";
import { Parameter } from "./Parameter";
import { Access } from "./Access";
import { Field } from "./Field";
import { Comment } from "./Comment";

export declare namespace Class {
    interface Args {
        /* The name of the PHP# class */
        name: string;
        /* The namespace of the PHP class */
        namespace: string;
        /* Defaults to false */
        abstract?: boolean;
        /* Docs associated with the class */
        docs?: string;
    }

    interface Constructor {
        /* The parameters of the constructor */
        parameters: Parameter[];
        /* The access of the constructor */
        access?: Access;
        /* The body of the constructor */
        body?: CodeBlock;
    }
}

export class Class extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly abstract: boolean;
    public readonly docs: string | undefined;

    private fields: Field[] = [];
    private constructor_: Class.Constructor | undefined;

    constructor({ name, namespace, abstract, docs }: Class.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.abstract = abstract ?? false;
        this.docs = docs;
    }

    public addField(field: Field): void {
        this.fields.push(field);
    }

    public addConstructor(constructor: Class.Constructor): void {
        this.constructor_ = constructor;
    }

    public write(writer: Writer): void {
        writer.writeLine(`namespace ${this.namespace};`);
        writer.newLine();
        if (this.abstract) {
            writer.write("abstract ");
        }
        this.writeComment(writer);
        writer.writeLine(`class ${this.name}`);
        writer.writeLine("{");
        writer.indent();
        for (const field of this.fields) {
            field.write(writer);
            writer.newLine();
        }
        if (this.constructor_ != null) {
            this.writeConstructor({ writer, constructor: this.constructor_ });
        }
        writer.dedent();
        writer.writeLine("}");
        return;
    }

    public writeComment(writer: Writer): void {
        if (this.docs == null) {
            return undefined;
        }
        const comment = new Comment({ docs: this.docs });
        comment.write(writer);
    }

    private writeConstructor({ writer, constructor }: { writer: Writer; constructor: Class.Constructor }): void {
        this.writeConstructorComment({ writer, constructor });
        if (constructor.access != null) {
            writer.write(`${constructor.access} `);
        }
        writer.write("function __construct(");
        writer.indent();
        constructor.parameters.forEach((parameter, index) => {
            if (index === 0) {
                writer.newLine();
            }
            parameter.write(writer);
            writer.writeLine(",");
        });
        writer.dedent();
        writer.writeLine(")");
        writer.writeLine("{");
        writer.indent();
        constructor.body?.write(writer);
        writer.writeNewLineIfLastLineNot();
        writer.dedent();
        writer.writeLine("}");
    }

    private writeConstructorComment({ writer, constructor }: { writer: Writer; constructor: Class.Constructor }): void {
        if (constructor.parameters.length === 0) {
            return;
        }
        const comment = new Comment();
        for (const parameter of constructor.parameters) {
            comment.addTag(parameter.getCommentTag());
        }
        comment.write(writer);
    }
}
