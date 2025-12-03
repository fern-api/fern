import { AstNode } from "./core/AstNode";
import { Type } from "./Type";
import { Parameter } from "./Parameter";
import { Writer } from "./Writer";
import { Annotation } from "./Annotation";
import { Modifier } from "./Modifier";
import { Comment } from "./Comment";

export interface FunctionArgs {
    name: string;
    returnType?: Type;
    parameters?: Parameter[];
    body?: string;
    annotations?: Annotation[];
    modifiers?: Modifier[];
    docs?: string;
    typeParameters?: string[];
}

export class Function implements AstNode {
    public readonly name: string;
    public readonly returnType?: Type;
    public readonly parameters: Parameter[];
    public readonly body?: string;
    public readonly annotations: Annotation[];
    public readonly modifiers: Modifier[];
    public readonly docs?: string;
    public readonly typeParameters: string[];

    constructor({
        name,
        returnType,
        parameters = [],
        body,
        annotations = [],
        modifiers = [],
        docs,
        typeParameters = []
    }: FunctionArgs) {
        this.name = name;
        this.returnType = returnType;
        this.parameters = parameters;
        this.body = body;
        this.annotations = annotations;
        this.modifiers = modifiers;
        this.docs = docs;
        this.typeParameters = typeParameters;
    }

    public write(writer: Writer): void {
        if (this.docs != null) {
            Comment.docs(this.docs).write(writer);
        }

        this.annotations.forEach((annotation) => {
            annotation.write(writer);
            writer.newLine();
        });

        if (this.modifiers.length > 0) {
            writer.write(this.modifiers.join(" ") + " ");
        }

        writer.write("fun ");

        if (this.typeParameters.length > 0) {
            writer.write("<");
            writer.write(this.typeParameters.join(", "));
            writer.write("> ");
        }

        writer.write(this.name);
        writer.write("(");

        this.parameters.forEach((param, index) => {
            if (index > 0) {
                writer.write(", ");
            }
            param.write(writer);
        });

        writer.write(")");

        if (this.returnType != null) {
            writer.write(": ");
            this.returnType.write(writer);
        }

        if (this.body != null) {
            writer.write(" ");
            writer.writeBlock(() => {
                writer.writeLine(this.body);
            });
        }
    }
}
