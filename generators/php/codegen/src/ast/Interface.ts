import { ClassReference } from "./ClassReference.js";
import { Comment } from "./Comment.js";
import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";
import { Method } from "./Method.js";

export declare namespace Interface {
    interface Args {
        /* The name of the PHP interface */
        name: string;
        /* The namespace of the PHP interface */
        namespace: string;
        /* Docs associated with the interface */
        docs?: string;
        /* The interfaces that this interface extends, if any */
        extends_?: ClassReference[];
    }
}

export class Interface extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly docs: string | undefined;
    public readonly extends_: ClassReference[];

    public readonly methods: Method[] = [];

    constructor({ name, namespace, docs, extends_ }: Interface.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.docs = docs;
        this.extends_ = extends_ ?? [];
    }

    public addMethod(method: Method): void {
        this.methods.push(method);
    }

    public addMethods(methods: Method[]): void {
        this.methods.push(...methods);
    }

    public write(writer: Writer): void {
        writer.addReference(new ClassReference({ name: this.name, namespace: this.namespace }));
        this.writeComment(writer);
        writer.write(`interface ${this.name} `);
        if (this.extends_.length > 0) {
            writer.write("extends ");
            this.extends_.forEach((ref, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                writer.writeNode(ref);
            });
            writer.write(" ");
        }
        writer.newLine();
        writer.writeLine("{");
        writer.indent();

        this.writeMethods({ writer, methods: this.methods });

        writer.dedent();
        writer.writeLine("}");
        return;
    }

    private writeComment(writer: Writer): void {
        if (this.docs == null) {
            return;
        }
        const comment = new Comment({ docs: this.docs });
        comment.write(writer);
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
