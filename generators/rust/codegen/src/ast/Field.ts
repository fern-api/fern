import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Type } from "./Type";
import { Attribute } from "./Attribute";
import { Visibility } from "./types";
import { writeVisibility } from "./utils/writeVisibility";

export declare namespace Field {
    interface Args {
        name: string;
        type: Type;
        visibility?: Visibility;
        attributes?: Attribute[];
    }
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly type: Type;
    public readonly visibility?: Visibility;
    public readonly attributes?: Attribute[];

    public constructor({ name, type, visibility, attributes }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.visibility = visibility;
        this.attributes = attributes;
    }

    public write(writer: Writer): void {
        // Write attributes on separate lines above the field
        if (this.attributes && this.attributes.length > 0) {
            this.attributes.forEach((attribute) => {
                writer.write("    "); // Add indentation for field attributes
                attribute.write(writer);
                writer.newLine();
            });
        }

        writer.write("    "); // Indentation for the field itself

        // Write visibility
        if (this.visibility) {
            writeVisibility(writer, this.visibility);
            writer.write(" ");
        }

        // Write field name and type
        writer.write(`${this.name}: `);
        this.type.write(writer);
        writer.write(",");
    }
}
