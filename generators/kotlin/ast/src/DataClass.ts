import { AstNode } from "./core/AstNode";
import { Type } from "./Type";
import { Parameter } from "./Parameter";
import { Function } from "./Function";
import { Writer } from "./Writer";
import { Annotation } from "./Annotation";
import { Modifier } from "./Modifier";
import { Comment } from "./Comment";

export interface DataClassArgs {
    name: string;
    properties: Parameter[];
    extends?: Type;
    implements?: Type[];
    functions?: Function[];
    annotations?: Annotation[];
    modifiers?: Modifier[];
    docs?: string;
    typeParameters?: string[];
}

export class DataClass implements AstNode {
    public readonly name: string;
    public readonly properties: Parameter[];
    public readonly extends?: Type;
    public readonly implements: Type[];
    public readonly functions: Function[];
    public readonly annotations: Annotation[];
    public readonly modifiers: Modifier[];
    public readonly docs?: string;
    public readonly typeParameters: string[];

    constructor({
        name,
        properties,
        extends: extendsType,
        implements: implementsTypes = [],
        functions = [],
        annotations = [],
        modifiers = [],
        docs,
        typeParameters = []
    }: DataClassArgs) {
        this.name = name;
        this.properties = properties;
        this.extends = extendsType;
        this.implements = implementsTypes;
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

        const allModifiers = ["data", ...this.modifiers];
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

        writer.write("(");
        writer.newLine();
        writer.indent();

        this.properties.forEach((property, index) => {
            if (index > 0) {
                writer.writeLine(",");
            }
            property.write(writer);
        });

        writer.newLine();
        writer.dedent();
        writer.write(")");

        const superTypes: Type[] = [];
        if (this.extends != null) {
            superTypes.push(this.extends);
        }
        superTypes.push(...this.implements);

        if (superTypes.length > 0) {
            writer.write(" : ");
            superTypes.forEach((type, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                type.write(writer);
            });
        }

        if (this.functions.length > 0) {
            writer.write(" ");
            writer.writeBlock(() => {
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
}
