import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Field } from "./Field";
import { Attribute } from "./Attribute";
import { Visibility } from "./types";
import { writeVisibility } from "./utils/writeVisibility";

export declare namespace Struct {
    interface Args {
        name: string;
        visibility?: Visibility;
        attributes?: Attribute[];
        fields: Field[];
    }
}

export class Struct extends AstNode {
    public readonly name: string;
    public readonly visibility?: Visibility;
    public readonly attributes?: Attribute[];
    public readonly fields: Field[];

    public constructor({ name, visibility, attributes, fields }: Struct.Args) {
        super();
        this.name = name;
        this.visibility = visibility;
        this.attributes = attributes;
        this.fields = fields;
    }

    public write(writer: Writer): void {
        // Write attributes above the struct
        if (this.attributes && this.attributes.length > 0) {
            this.attributes.forEach((attribute) => {
                attribute.write(writer);
                writer.newLine();
            });
        }

        // Write visibility and struct declaration
        if (this.visibility) {
            writeVisibility(writer, this.visibility);
            writer.write(" ");
        }

        writer.write(`struct ${this.name} {`);
        writer.newLine();

        // Write fields
        this.fields.forEach((field) => {
            field.write(writer);
            writer.newLine();
        });

        writer.write("}");
    }
}
