import { Access } from "./Access";
import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Parameter } from "./Parameter";
import { Type } from "./Type";

export enum MethodType {
    INSTANCE,
    STATIC
}

export declare namespace Method {
    interface Args {
        /* The name of the method */
        name: string;
        /* The access of the method */
        access: Access;
        /* Whether the method is sync or async. Defaults to false. */
        isAsync: boolean;
        /* The parameters of the method */
        parameters: Parameter[];
        /* The return type of the method */
        return_?: Type;
        /* The body of the method */
        body?: CodeBlock;
        /* Summary for the method */
        summary?: string;
        /* The type of the method, defaults to INSTANCE */
        type?: MethodType;
        /* The class this method belongs to, if any */
        classReference?: ClassReference;
    }
}

export class Method extends AstNode {
    public readonly name: string;
    public readonly isAsync: boolean;
    public readonly access: Access;
    public readonly return: Type | undefined;
    public readonly body: CodeBlock | undefined;
    public readonly summary: string | undefined;
    public readonly type: MethodType;
    public readonly reference: ClassReference | undefined;
    private parameters: Parameter[];

    constructor({ name, isAsync, access, return_, body, summary, type, classReference, parameters }: Method.Args) {
        super();
        this.name = name;
        this.isAsync = isAsync;
        this.access = access;
        this.return = return_;
        this.body = body;
        this.summary = summary;
        this.type = type ?? MethodType.INSTANCE;
        this.reference = classReference;
        this.parameters = parameters;
    }

    public addParameter(parameter: Parameter): void {
        this.parameters.push(parameter);
    }

    public write(writer: Writer): void {
        if (this.summary != null) {
            writer.writeLine("/// <summary>");
            this.summary.split("\n").forEach((line) => {
                writer.writeLine(`/// ${line}`);
            });
            writer.writeLine("/// </summary>");
        }

        writer.write(`${this.access} `);
        if (this.type === MethodType.STATIC) {
            writer.write("static ");
        }
        if (this.isAsync) {
            writer.write("async ");
        }
        if (this.return == null) {
            writer.write("Task ");
        } else {
            if (this.isAsync) {
                writer.write("Task<");
                this.return.write(writer);
                writer.write(">");
            } else {
                this.return.write(writer);
            }
            writer.write(" ");
        }
        writer.write(`${this.name}(`);
        this.parameters.forEach((parameter, idx) => {
            parameter.write(writer);
            if (idx < this.parameters.length - 1) {
                writer.write(", ");
            }
        });
        writer.write(")");
        writer.writeLine(" {");

        writer.indent();
        this.body?.write(writer);
        writer.dedent();

        writer.writeLine("}");
    }

    public getParameters(): Parameter[] {
        return this.parameters;
    }
}
