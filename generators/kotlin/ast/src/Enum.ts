import { AstNode } from "./core/AstNode";
import { Writer } from "./Writer";
import { Annotation } from "./Annotation";
import { Modifier } from "./Modifier";
import { Comment } from "./Comment";

export interface EnumValueArgs {
    name: string;
    value?: string;
    docs?: string;
}

export class EnumValue implements AstNode {
    public readonly name: string;
    public readonly value?: string;
    public readonly docs?: string;

    constructor({ name, value, docs }: EnumValueArgs) {
        this.name = name;
        this.value = value;
        this.docs = docs;
    }

    public write(writer: Writer): void {
        if (this.docs != null) {
            Comment.docs(this.docs).write(writer);
        }
        writer.write(this.name);
        if (this.value != null) {
            writer.write(`("${this.value}")`);
        }
    }
}

export interface EnumArgs {
    name: string;
    values: EnumValue[];
    annotations?: Annotation[];
    modifiers?: Modifier[];
    docs?: string;
}

export class Enum implements AstNode {
    public readonly name: string;
    public readonly values: EnumValue[];
    public readonly annotations: Annotation[];
    public readonly modifiers: Modifier[];
    public readonly docs?: string;

    constructor({ name, values, annotations = [], modifiers = [], docs }: EnumArgs) {
        this.name = name;
        this.values = values;
        this.annotations = annotations;
        this.modifiers = modifiers;
        this.docs = docs;
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

        writer.write("enum class ");
        writer.write(this.name);
        writer.write(" ");
        writer.writeBlock(() => {
            this.values.forEach((value, index) => {
                value.write(writer);
                if (index < this.values.length - 1) {
                    writer.writeLine(",");
                } else {
                    writer.newLine();
                }
            });
        });
    }
}
