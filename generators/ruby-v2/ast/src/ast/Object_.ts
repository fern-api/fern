import { Comment } from "./Comment";
import { Field } from "./Field";
import { Module } from "./Module";
import { Writer } from "./core/Writer";

export declare namespace Object_ {
    export interface Args extends Module.Args {
        /* The superclass of this class, ie. Internal::Types::Model */
        superclass?: Object_;
        fields?: Field[];
    }
}

export class Object_ extends Module {
    public readonly superclass: Object_ | undefined;
    public readonly fields: Field[];

    constructor({ name, superclass, fields }: Object_.Args) {
        super({ name, typeParameters: [], docstring: undefined });

        this.superclass = superclass;
        this.fields = fields ?? [];
    }

    public addField(field: Field): void {
        this.fields.push(field);
    }

    public write(writer: Writer): void {
        writer.writeLine(`class ${this.name}`);
        if (this.superclass) {
            writer.write(` < ${this.superclass.name}`);
        }
        writer.newLine();

        if (this.fields.length) {
            writer.indent();
            this.fields.forEach((field, index) => {
                field.write(writer);
                if (index < this.fields.length - 1) {
                    writer.newLine();
                }
            });
            writer.dedent();
        }

        writer.write("end");
    }

    public writeTypeDefinition(writer: Writer): void {
        writer.write(`class ${this.name}`);
        if (this.superclass) {
            writer.write(` < ${this.superclass.name}`);
        }
        writer.newLine();

        writer.write("end");
    }
}
