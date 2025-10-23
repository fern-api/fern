import { AstNode } from "./core/AstNode";
import { Type } from "./Type";
import { Writer } from "./Writer";
import { Annotation } from "./Annotation";
import { Modifier } from "./Modifier";

export interface ParameterArgs {
    name: string;
    type: Type;
    defaultValue?: string;
    annotations?: Annotation[];
    modifiers?: Modifier[];
}

export class Parameter implements AstNode {
    public readonly name: string;
    public readonly type: Type;
    public readonly defaultValue?: string;
    public readonly annotations: Annotation[];
    public readonly modifiers: Modifier[];

    constructor({ name, type, defaultValue, annotations = [], modifiers = [] }: ParameterArgs) {
        this.name = name;
        this.type = type;
        this.defaultValue = defaultValue;
        this.annotations = annotations;
        this.modifiers = modifiers;
    }

    public write(writer: Writer): void {
        this.annotations.forEach((annotation) => {
            annotation.write(writer);
            writer.write(" ");
        });

        if (this.modifiers.length > 0) {
            writer.write(this.modifiers.join(" ") + " ");
        }

        writer.write(this.name);
        writer.write(": ");
        this.type.write(writer);

        if (this.defaultValue != null) {
            writer.write(" = ");
            writer.write(this.defaultValue);
        }
    }
}
