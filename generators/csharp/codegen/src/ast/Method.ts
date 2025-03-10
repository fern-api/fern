import { assertNever } from "@fern-api/core-utils";

import { Access } from "./Access";
import { Annotation } from "./Annotation";
import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { Parameter } from "./Parameter";
import { Type } from "./Type";
import { TypeParameter } from "./TypeParameter";
import { XmlDocBlock } from "./XmlDocBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export enum MethodType {
    INSTANCE,
    STATIC
}

export class Method extends AstNode {
    public readonly name: string;
    public readonly isAsync: boolean;
    public readonly access: Access | undefined;
    public readonly return: Type | TypeParameter | undefined;
    public readonly noBody: boolean;
    public readonly body: CodeBlock | undefined;
    private readonly bodyType: Method.BodyType;
    public readonly summary: string | undefined;
    private readonly doc: XmlDocBlock;
    public readonly type: MethodType;
    public readonly reference: ClassReference | undefined;
    public readonly override: boolean;
    private readonly parameters: Parameter[];
    private readonly typeParameters: TypeParameter[];
    private readonly annotations: Annotation[];
    private readonly interfaceReference?: ClassReference;

    constructor({
        name,
        isAsync,
        override,
        access,
        return_,
        body,
        noBody,
        bodyType,
        summary,
        doc,
        type,
        classReference,
        parameters,
        typeParameters,
        annotations,
        codeExample,
        interfaceReference
    }: Method.Args) {
        super();
        this.name = name;
        this.isAsync = isAsync ?? false;
        this.override = override ?? false;
        this.access = access;
        this.return = return_;
        this.noBody = noBody ?? false;
        this.body = body;
        this.bodyType = bodyType ?? Method.BodyType.Statement;
        this.summary = summary;
        this.doc = XmlDocBlock.of(doc ?? { summary, codeExample });
        this.type = type ?? MethodType.INSTANCE;
        this.reference = classReference;
        this.parameters = parameters;
        this.typeParameters = typeParameters ?? [];
        this.annotations = annotations ?? [];
        this.interfaceReference = interfaceReference;
    }

    public addParameter(parameter: Parameter): void {
        this.parameters.push(parameter);
    }

    public write(writer: Writer): void {
        writer.writeNode(this.doc);

        if (this.annotations.length > 0) {
            writer.write("[");
            this.annotations.forEach((annotation) => {
                annotation.write(writer);
            });
            writer.write("]");
            writer.writeNewLineIfLastLineNot();
        }

        if (this.access) {
            writer.write(`${this.access} `);
        }
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
                writer.writeNode(
                    new ClassReference({
                        name: "Task",
                        namespace: "global::System.Threading.Tasks",
                        fullyQualified: true
                    })
                );
                writer.write(" ");
            } else {
                writer.write("void ");
            }
        } else {
            if (this.isAsync) {
                // Don't add a class reference for Task<T> since we don't want the writer
                // to detect a conflict between Task<T> and Task and add a fully qualified name
                writer.write("Task<");
                this.return.write(writer);
                writer.write(">");
            } else {
                this.return.write(writer);
            }
            writer.write(" ");
        }
        if (this.interfaceReference) {
            writer.write(`${this.interfaceReference.name}.`);
        }
        writer.write(this.name);
        if (this.typeParameters.length > 0) {
            writer.write("<");
            this.typeParameters.forEach((typeParameter, idx) => {
                typeParameter.write(writer);
                if (idx < this.typeParameters.length - 1) {
                    writer.write(", ");
                }
            });
            writer.write(">");
        }
        writer.write("(");
        this.parameters.forEach((parameter, idx) => {
            parameter.write(writer);
            if (idx < this.parameters.length - 1) {
                writer.write(", ");
            }
        });
        writer.write(")");
        if (this.noBody) {
            writer.writeLine(";");
        } else {
            switch (this.bodyType) {
                case Method.BodyType.Statement:
                    writer.writeLine(" {");

                    writer.indent();
                    this.body?.write(writer);
                    writer.dedent();

                    writer.writeNewLineIfLastLineNot();
                    writer.writeLine("}");
                    break;
                case Method.BodyType.Expression:
                    writer.write(" => ");
                    this.body?.write(writer);
                    writer.writeSemicolonIfLastCharacterIsNot();
                    break;
                default:
                    assertNever(this.bodyType);
            }
        }
    }

    public getParameters(): Parameter[] {
        return this.parameters;
    }
}

export namespace Method {
    export interface Args {
        /* Any annotations to add to the method */
        annotations?: Annotation[];
        /* Summary for the method */
        summary?: string;
        doc?: XmlDocBlock.Like;
        /* The access of the method */
        access?: Access;
        /* The type of the method, defaults to INSTANCE */
        type?: MethodType;
        /* Whether the method overrides a method in it's base class */
        override?: boolean;
        /* Whether the method is sync or async. Defaults to false. */
        isAsync?: boolean;
        /* The return type of the method */
        return_?: Type | TypeParameter;
        /* The name of the method */
        name: string;
        /* The parameters of the method */
        typeParameters?: TypeParameter[];
        /* The parameters of the method */
        parameters: Parameter[];
        /* If true, no method body will be written. This is for interface methods. */
        noBody?: boolean;
        /* The body of the method */
        body?: CodeBlock;
        /* The body type of the method */
        bodyType?: BodyType;
        /* The class this method belongs to, if any */
        classReference?: ClassReference;
        /* Any code example to add to the method */
        codeExample?: string;
        /* If specified, use the interface name in front of the method name */
        interfaceReference?: ClassReference;
    }

    export const BodyType = {
        Statement: "statement",
        Expression: "expression"
    } as const;
    export type BodyType = (typeof BodyType)[keyof typeof BodyType];
}
