import { Access } from "./Access";
import { Annotation } from "./Annotation";
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
        /* Whether the method overrides a method in it's base class */
        override?: boolean;
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
        /* Any annotations to add to the method */
        annotations?: Annotation[];
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
    public readonly override: boolean;
    private readonly parameters: Parameter[];
    private readonly annotations: Annotation[];

    constructor({
        name,
        isAsync,
        override,
        access,
        return_,
        body,
        summary,
        type,
        classReference,
        parameters,
        annotations
    }: Method.Args) {
        super();
        this.name = name;
        this.isAsync = isAsync;
        this.override = override ?? false;
        this.access = access;
        this.return = return_;
        this.body = body;
        this.summary = summary;
        this.type = type ?? MethodType.INSTANCE;
        this.reference = classReference;
        this.parameters = parameters;
        this.annotations = annotations ?? [];
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

        if (this.annotations.length > 0) {
            writer.write("[");
            this.annotations.forEach((annotation) => {
                annotation.write(writer);
            });
            writer.write("]");
            writer.writeNewLineIfLastLineNot();
        }

        writer.write(`${this.access} `);
        if (this.type === MethodType.STATIC) {
            writer.write("static ");
        }
        if (this.isAsync) {
            writer.write("async ");
        }
        if (this.override) {
            writer.write("override ");
        }
        if (this.return == null) {
            if (this.isAsync) {
                writer.write("Task ");
            } else {
                writer.write("void ");
            }
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
