import { AstNode } from "./AstNode";
import { Attribute } from "./Attribute";
import { Type } from "./Type";
import { Visibility } from "./types";
import { writeVisibility } from "./utils/writeVisibility";
import { Writer } from "./Writer";

export declare namespace NewtypeStruct {
    interface Args {
        name: string;
        innerType: Type;
        visibility?: Visibility;
        innerVisibility?: Visibility;
        attributes?: Attribute[];
        innerAttributes?: Attribute[];
    }
}

export class NewtypeStruct extends AstNode {
    public readonly name: string;
    public readonly innerType: Type;
    public readonly visibility?: Visibility;
    public readonly innerVisibility?: Visibility;
    public readonly attributes?: Attribute[];
    public readonly innerAttributes?: Attribute[];

    public constructor({ name, innerType, visibility, innerVisibility, attributes, innerAttributes }: NewtypeStruct.Args) {
        super();
        this.name = name;
        this.innerType = innerType;
        this.visibility = visibility;
        this.innerVisibility = innerVisibility;
        this.attributes = attributes;
        this.innerAttributes = innerAttributes;
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

        // Check if we have inner attributes - if so, use multi-line format
        if (this.innerAttributes && this.innerAttributes.length > 0) {
            writer.writeLine(`struct ${this.name}(`);
            writer.indent();

            // Write inner field attributes
            this.innerAttributes.forEach((attribute) => {
                attribute.write(writer);
                writer.newLine();
            });

            // Write inner field visibility
            if (this.innerVisibility) {
                writeVisibility(writer, this.innerVisibility);
                writer.write(" ");
            }

            // Write inner type
            this.innerType.write(writer);
            writer.newLine();
            writer.dedent();
            writer.write(");");
        } else {
            // Single-line format for simple newtype structs
            writer.write(`struct ${this.name}(`);

            // Write inner field visibility
            if (this.innerVisibility) {
                writeVisibility(writer, this.innerVisibility);
                writer.write(" ");
            }

            // Write inner type
            this.innerType.write(writer);
            writer.write(");");
        }
    }
}
