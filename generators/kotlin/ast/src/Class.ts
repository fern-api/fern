import { AstNode } from "./core/AstNode";
import { Type } from "./Type";
import { Property } from "./Property";
import { Function } from "./Function";
import { Writer } from "./Writer";
import { Annotation } from "./Annotation";
import { Modifier } from "./Modifier";
import { Comment } from "./Comment";
import { Parameter } from "./Parameter";

export interface ClassArgs {
    name: string;
    extends?: Type;
    implements?: Type[];
    properties?: Property[];
    functions?: Function[];
    constructorParameters?: Parameter[];
    annotations?: Annotation[];
    modifiers?: Modifier[];
    docs?: string;
    typeParameters?: string[];
    companionObject?: CompanionObject;
}

export interface CompanionObject {
    properties?: Property[];
    functions?: Function[];
}

export class Class implements AstNode {
    public readonly name: string;
    public readonly extends?: Type;
    public readonly implements: Type[];
    public readonly properties: Property[];
    public readonly functions: Function[];
    public readonly constructorParameters: Parameter[];
    public readonly annotations: Annotation[];
    public readonly modifiers: Modifier[];
    public readonly docs?: string;
    public readonly typeParameters: string[];
    public readonly companionObject?: CompanionObject;

    constructor({
        name,
        extends: extendsType,
        implements: implementsTypes = [],
        properties = [],
        functions = [],
        constructorParameters = [],
        annotations = [],
        modifiers = [],
        docs,
        typeParameters = [],
        companionObject
    }: ClassArgs) {
        this.name = name;
        this.extends = extendsType;
        this.implements = implementsTypes;
        this.properties = properties;
        this.functions = functions;
        this.constructorParameters = constructorParameters;
        this.annotations = annotations;
        this.modifiers = modifiers;
        this.docs = docs;
        this.typeParameters = typeParameters;
        this.companionObject = companionObject;
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

        writer.write("class ");
        writer.write(this.name);

        if (this.typeParameters.length > 0) {
            writer.write("<");
            writer.write(this.typeParameters.join(", "));
            writer.write(">");
        }

        if (this.constructorParameters.length > 0) {
            writer.write("(");
            this.constructorParameters.forEach((param, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                param.write(writer);
            });
            writer.write(")");
        }

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

            if (this.companionObject != null) {
                if (this.properties.length > 0 || this.functions.length > 0) {
                    writer.newLine();
                }
                writer.writeLine("companion object {");
                writer.indent();

                this.companionObject.properties?.forEach((property, index) => {
                    if (index > 0) {
                        writer.newLine();
                    }
                    property.write(writer);
                    writer.newLine();
                });

                if (
                    (this.companionObject.properties?.length ?? 0) > 0 &&
                    (this.companionObject.functions?.length ?? 0) > 0
                ) {
                    writer.newLine();
                }

                this.companionObject.functions?.forEach((func, index) => {
                    if (index > 0) {
                        writer.newLine();
                    }
                    func.write(writer);
                    writer.newLine();
                });

                writer.dedent();
                writer.writeLine("}");
            }
        });
    }
}
