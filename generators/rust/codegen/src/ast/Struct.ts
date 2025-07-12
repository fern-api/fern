import { Access } from "./Access";
import { CodeBlock } from "./CodeBlock";
import { Comment } from "./Comment";
import { Field } from "./Field";
import { Method } from "./Method";
import { Parameter } from "./Parameter";
import { StructReference } from "./StructReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { orderByAccess } from "./utils/orderByAccess";

export declare namespace Struct {
    interface Args {
        /* The name of the PHP# class */
        name: string;
        /* The namespace of the PHP class */
        namespace: string;
        /* Docs associated with the class */
        docs?: string;
        /* The class to inherit from if any */
        parentClassReference?: AstNode;
        /* The traits that this class uses, if any */
        traits?: StructReference[];
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

export class Struct extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly docs: string | undefined;
    public readonly parentClassReference: AstNode | undefined;
    public readonly traits: StructReference[];

    public readonly fields: Field[] = [];
    public readonly methods: Method[] = [];
    private constructor_: Struct.Constructor | undefined;

    constructor({ name, namespace, docs, parentClassReference, traits }: Struct.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.docs = docs;
        this.parentClassReference = parentClassReference;
        this.traits = traits ?? [];
    }

    public addConstructor(constructor: Struct.Constructor): void {
        this.constructor_ = constructor;
    }

    public addField(field: Field): void {
        this.fields.push(field);
    }

    public addMethod(method: Method): void {
        this.methods.push(method);
    }

    public addMethods(methods: Method[]): void {
        this.methods.push(...methods);
    }

    public addTrait(traitClassReference: StructReference): void {
        this.traits.push(traitClassReference);
    }

    public write(writer: Writer): void {
        // required to fully de-conflict imports
        // writer.addReference(new ClassReference({ name: this.name, namespace: this.namespace }));

        // this.writeComment(writer);
        writer.write(`struct ${this.name} {`);
        // if (this.parentClassReference != null) {
        //     writer.write("extends ");
        //     this.parentClassReference.write(writer);
        // }
        // writer.newLine();
        // writer.writeLine("{");
        writer.indent();
        if (this.fields.length > 0) {
            writer.newLine();
        }
        // if (this.traits.length > 0) {
        //     writer.write("use ");
        //     this.traits.forEach((trait, index) => {
        //         if (index > 0) {
        //             writer.write(",");
        //         }
        //         writer.writeNode(trait);
        //     });
        //     writer.writeTextStatement("");
        //     writer.newLine();
        // }

        this.writeFields({ writer, fields: orderByAccess(this.fields) });
        // if (this.constructor != null || this.methods.length > 0) {
        //     writer.newLine();
        // }

        // if (this.constructor_ != null) {
        //     this.writeConstructor({ writer, constructor: this.constructor_ });
        //     if (this.methods.length > 0) {
        //         writer.newLine();
        //     }
        // }

        writer.dedent();
        writer.writeLine("}");

        this.writeMethods({ writer, methods: orderByAccess(this.methods) });
        return;
    }

    private writeComment(writer: Writer): void {
        if (this.docs == null) {
            return undefined;
        }
        const comment = new Comment({ docs: this.docs });
        comment.write(writer);
    }

    private writeConstructor({ writer, constructor }: { writer: Writer; constructor: Struct.Constructor }): void {
        this.writeConstructorComment({ writer, constructor });
        writer.write("pub fn new(");
        writer.indent();
        writer.dedent();
        writer.writeLine(") -> Self");
        writer.writeLine("{");
        writer.indent();
        constructor.body?.write(writer);
        writer.writeNewLineIfLastLineNot();
        writer.writeLine("Self {");
        constructor.parameters.forEach((parameter, index) => {
            if (index === 0) {
                writer.newLine();
            }
            parameter.write(writer);
            writer.writeLine(",");
        });
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
    }

    private writeConstructorComment({
        writer,
        constructor
    }: {
        writer: Writer;
        constructor: Struct.Constructor;
    }): void {
        if (constructor.parameters.length === 0) {
            return;
        }
        const comment = new Comment();
        for (const parameter of constructor.parameters) {
            comment.addTag(parameter.getCommentTag());
        }
        comment.write(writer);
    }

    private writeFields({ writer, fields }: { writer: Writer; fields: Field[] }): void {
        fields
            .filter((field) => !field.inherited)
            .forEach((field, index) => {
                // if (index > 0) {
                //     writer.newLine();
                // }
                field.write(writer);
                writer.writeNewLineIfLastLineNot();
            });
    }

    private writeMethods({ writer, methods }: { writer: Writer; methods: Method[] }): void {
        writer.write(`impl ${this.name} {`);
        if (this.constructor_ != null) {
            this.writeConstructor({ writer, constructor: this.constructor_ });
            if (this.methods.length > 0) {
                writer.newLine();
            }
        }
        methods.forEach((method, index) => {
            if (index > 0) {
                writer.newLine();
            }
            method.write(writer);
            writer.writeNewLineIfLastLineNot();
        });

        writer.write("}");
    }
}
