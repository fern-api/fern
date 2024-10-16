import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";
import { CodeBlock } from "./CodeBlock";
import { ClassReference } from "./ClassReference";
import { Field } from "./Field";

export enum MethodType {
    STATIC,
    INSTANCE,
    CLASS
}

export declare namespace Method {
    interface Args {
        /* The name of the method */
        name: string;
        /* The arguments of the method */
        arguments_: Field[];
        /* The return type of the method */
        return_?: Type;
        /* The body of the method */
        body?: CodeBlock;
        /* The docstring for the method */
        docstring?: string;
        /* The type of the method, defaults to STATIC */
        type?: MethodType;
        /* The class this method belongs to, if any */
        classReference?: ClassReference;
        /* Any decorators to add to the method */
        decorators?: string[];
    }
}

export class Method extends AstNode {
    public readonly name: string;
    public readonly return: Type | undefined;
    public readonly body: CodeBlock | undefined;
    public readonly docstring: string | undefined;
    public readonly type: MethodType;
    public readonly reference: ClassReference | undefined;
    private readonly arguments_: Field[];
    private readonly decorators: string[];

    constructor({ name, arguments_, return_, body, docstring, type, classReference, decorators }: Method.Args) {
        super();
        this.name = name;
        this.arguments_ = arguments_;
        this.return = return_;
        this.body = body;
        this.docstring = docstring;
        this.type = type ?? MethodType.STATIC;
        this.reference = classReference;
        this.decorators = decorators ?? [];
    }

    public write(writer: Writer): void {
        // Write decorators
        for (const decorator of this.decorators) {
            writer.write(`@${decorator}`);
            writer.newLine();
        }
        if (this.type === MethodType.CLASS) {
            writer.write("@classmethod");
            writer.newLine();
        }

        // Write method signature
        writer.write(`def ${this.name}(`);
        if (this.type === MethodType.INSTANCE) {
            writer.write("self");
            if (this.arguments_.length > 0) {
                writer.write(", ");
            }
        }
        if (this.type === MethodType.CLASS) {
            writer.write("cls");
            if (this.arguments_.length > 0) {
                writer.write(", ");
            }
        }
        this.arguments_.forEach((arg, index) => {
            arg.write(writer);
            if (index < this.arguments_.length - 1) {
                writer.write(", ");
            }
        });
        writer.write(")");

        // Write return type if specified
        if (this.return) {
            writer.write(" -> ");
            this.return.write(writer);
        }

        writer.write(":");
        writer.newLine();

        // Write docstring if specified
        if (this.docstring) {
            writer.indent();
            writer.write('"""');
            writer.write(this.docstring);
            writer.write('"""');
            writer.newLine();
            writer.dedent();
        }

        // Write method body
        if (this.body) {
            writer.indent();
            this.body.write(writer);
            writer.dedent();
        } else {
            writer.indent();
            writer.write("pass");
            writer.newLine();
            writer.dedent();
        }
    }
}
