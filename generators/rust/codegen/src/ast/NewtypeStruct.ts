import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Type } from "./Type";
import { Attribute } from "./Attribute";
import { Visibility } from "./types";
import { writeVisibility } from "./utils/writeVisibility";

export declare namespace NewtypeStruct {
    interface Args {
        name: string;
        innerType: Type;
        visibility?: Visibility;
        innerVisibility?: Visibility;
        attributes?: Attribute[];
    }
}

export class NewtypeStruct extends AstNode {
    public readonly name: string;
    public readonly innerType: Type;
    public readonly visibility?: Visibility;
    public readonly innerVisibility?: Visibility;
    public readonly attributes?: Attribute[];

    public constructor({ name, innerType, visibility, innerVisibility, attributes }: NewtypeStruct.Args) {
        super();
        this.name = name;
        this.innerType = innerType;
        this.visibility = visibility;
        this.innerVisibility = innerVisibility;
        this.attributes = attributes;
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
