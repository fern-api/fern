import { AstNode } from "./core/AstNode";
import { Type } from "./Type";
import { Writer } from "./Writer";
import { Annotation } from "./Annotation";
import { Modifier } from "./Modifier";
import { Comment } from "./Comment";

export interface PropertyArgs {
    name: string;
    type: Type;
    initializer?: string;
    getter?: string;
    setter?: string;
    annotations?: Annotation[];
    modifiers?: Modifier[];
    docs?: string;
    mutable?: boolean;
}

export class Property implements AstNode {
    public readonly name: string;
    public readonly type: Type;
    public readonly initializer?: string;
    public readonly getter?: string;
    public readonly setter?: string;
    public readonly annotations: Annotation[];
    public readonly modifiers: Modifier[];
    public readonly docs?: string;
    public readonly mutable: boolean;

    constructor({
        name,
        type,
        initializer,
        getter,
        setter,
        annotations = [],
        modifiers = [],
        docs,
        mutable = false
    }: PropertyArgs) {
        this.name = name;
        this.type = type;
        this.initializer = initializer;
        this.getter = getter;
        this.setter = setter;
        this.annotations = annotations;
        this.modifiers = modifiers;
        this.docs = docs;
        this.mutable = mutable;
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

        writer.write(this.mutable ? "var " : "val ");
        writer.write(this.name);
        writer.write(": ");
        this.type.write(writer);

        if (this.initializer != null) {
            writer.write(" = ");
            writer.write(this.initializer);
        }

        if (this.getter != null || this.setter != null) {
            writer.newLine();
            writer.indent();

            if (this.getter != null) {
                writer.writeLine("get() = " + this.getter);
            }

            if (this.setter != null) {
                writer.writeLine("set(value) {");
                writer.indent();
                writer.writeLine(this.setter);
                writer.dedent();
                writer.writeLine("}");
            }

            writer.dedent();
        }
    }
}
