import { AstNode } from "./core/AstNode";
import { Type } from "./Type";
import { Property } from "./Property";
import { Function } from "./Function";
import { Writer } from "./Writer";
import { Annotation } from "./Annotation";
import { Modifier } from "./Modifier";
import { Comment } from "./Comment";

export interface InterfaceArgs {
    name: string;
    extends?: Type[];
    properties?: Property[];
    functions?: Function[];
    annotations?: Annotation[];
    modifiers?: Modifier[];
    docs?: string;
    typeParameters?: string[];
}

export class Interface implements AstNode {
    public readonly name: string;
    public readonly extends: Type[];
    public readonly properties: Property[];
    public readonly functions: Function[];
    public readonly annotations: Annotation[];
    public readonly modifiers: Modifier[];
    public readonly docs?: string;
    public readonly typeParameters: string[];

    constructor({
        name,
        extends: extendsTypes = [],
        properties = [],
        functions = [],
        annotations = [],
        modifiers = [],
        docs,
        typeParameters = []
    }: InterfaceArgs) {
        this.name = name;
        this.extends = extendsTypes;
        this.properties = properties;
        this.functions = functions;
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

        writer.write("interface ");
        writer.write(this.name);

        if (this.typeParameters.length > 0) {
            writer.write("<");
            writer.write(this.typeParameters.join(", "));
            writer.write(">");
        }

        if (this.extends.length > 0) {
            writer.write(" : ");
            this.extends.forEach((type, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                type.write(writer);
            });
        }

        writer.write(" ");
        writer.writeBlock(() => {
            this.properties.forEach((property, index) => {
                if (index > 0) {
                    writer.newLine();
                }
                property.write(writer);
                writer.newLine();
            });

            if (this.properties.length > 0 && this.functions.length > 0) {
                writer.newLine();
            }

            this.functions.forEach((func, index) => {
                if (index > 0) {
                    writer.newLine();
                }
                func.write(writer);
                writer.newLine();
            });
        });
    }
}
