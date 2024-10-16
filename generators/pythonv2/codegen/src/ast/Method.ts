import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";
import { CodeBlock } from "./CodeBlock";
import { ClassReference } from "./ClassReference";
import { Field } from "./Field";
import { Parameter } from "./Parameter";

export enum MethodType {
    STATIC,
    INSTANCE,
    CLASS
}

export declare namespace Method {
    interface Args {
        /* The name of the method */
        name: string;
        /* The parameters of the method */
        parameters: Parameter[];
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
    }
}

export class Method extends AstNode {
    public readonly name: string;
    public readonly return: Type | undefined;
    public readonly body: CodeBlock | undefined;
    public readonly docstring: string | undefined;
    public readonly type: MethodType;
    public readonly reference: ClassReference | undefined;
    private readonly parameters: Parameter[];

    constructor({ name, parameters, return_, body, docstring, type = MethodType.STATIC, classReference }: Method.Args) {
        super();
        this.name = name;
        this.parameters = parameters;
        this.return = return_;
        this.body = body;
        this.docstring = docstring;
        this.type = type;
        this.reference = classReference;
    }

    public getName(): string {
        return this.name;
    }

    public write(writer: Writer): void {
        // Write decorators
        if (this.type === MethodType.CLASS) {
            writer.write("@classmethod");
            writer.newLine();
        }

        // Write method signature
        writer.write(`def ${this.name}(`);
        if (this.type === MethodType.INSTANCE) {
            writer.write("self");
            if (this.parameters.length > 0) {
                writer.write(", ");
            }
        }
        if (this.type === MethodType.CLASS) {
            writer.write("cls");
            if (this.parameters.length > 0) {
                writer.write(", ");
            }
        }
        this.parameters.forEach((param, index) => {
            param.write(writer);
            if (index < this.parameters.length - 1) {
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
