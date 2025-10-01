import { AstNode } from "./AstNode";
import { Attribute } from "./Attribute";
import { DocComment } from "./DocComment";
import { Type } from "./Type";
import { Visibility } from "./types";
import { writeVisibility } from "./utils/writeVisibility";
import { Writer } from "./Writer";

export declare namespace Field {
    interface Args {
        name: string;
        type: Type;
        visibility?: Visibility;
        attributes?: Attribute[];
        docs?: DocComment;
    }
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly type: Type;
    public readonly visibility?: Visibility;
    public readonly attributes?: Attribute[];
    public readonly docs?: DocComment;

    public constructor({ name, type, visibility, attributes, docs }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.visibility = visibility;
        this.attributes = attributes;
        this.docs = docs;
    }

    public write(writer: Writer): void {
        // Write documentation first (with proper indentation)
        if (this.docs) {
            // Create a temporary writer for the docs to get proper formatting
            const docWriter = new Writer();
            this.docs.write(docWriter);
            const docString = docWriter.toString();
            const docLines = docString.split("\n").filter((line) => line.trim());
            docLines.forEach((line) => {
                writer.write("    "); // Field indentation
                writer.write(line.trim());
                writer.newLine();
            });
        }

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
