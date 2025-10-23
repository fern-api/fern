import { AstNode } from "./core/AstNode";
import { Type } from "./Type";
import { Writer } from "./Writer";
import { Annotation } from "./Annotation";
import { Modifier } from "./Modifier";
import { Comment } from "./Comment";
import { DataClass } from "./DataClass";
import { Class } from "./Class";

export interface SealedClassArgs {
    name: string;
    subclasses?: (DataClass | Class)[];
    annotations?: Annotation[];
    modifiers?: Modifier[];
    docs?: string;
    typeParameters?: string[];
}

export class SealedClass implements AstNode {
    public readonly name: string;
    public readonly subclasses: (DataClass | Class)[];
    public readonly annotations: Annotation[];
    public readonly modifiers: Modifier[];
    public readonly docs?: string;
    public readonly typeParameters: string[];

    constructor({
        name,
        subclasses = [],
        annotations = [],
        modifiers = [],
        docs,
        typeParameters = []
    }: SealedClassArgs) {
        this.name = name;
        this.subclasses = subclasses;
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

        const allModifiers = ["sealed", ...this.modifiers];
        if (allModifiers.length > 0) {
            writer.write(allModifiers.join(" ") + " ");
        }

        writer.write("class ");
        writer.write(this.name);

        if (this.typeParameters.length > 0) {
            writer.write("<");
            writer.write(this.typeParameters.join(", "));
            writer.write(">");
        }

        if (this.subclasses.length > 0) {
            writer.write(" ");
            writer.writeBlock(() => {
                this.subclasses.forEach((subclass, index) => {
                    if (index > 0) {
                        writer.newLine();
                    }
                    subclass.write(writer);
                    writer.newLine();
                });
            });
        }
    }
}
