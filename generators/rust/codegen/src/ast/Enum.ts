import { AstNode } from "./AstNode";
import { Attribute } from "./Attribute";
import { DocComment } from "./DocComment";
import { EnumVariant } from "./EnumVariant";
import { Visibility } from "./types";
import { writeVisibility } from "./utils/writeVisibility";
import { Writer } from "./Writer";

export declare namespace Enum {
    interface Args {
        name: string;
        visibility?: Visibility;
        attributes?: Attribute[];
        variants: EnumVariant[];
        docs?: DocComment;
    }
}

export class Enum extends AstNode {
    public readonly name: string;
    public readonly visibility?: Visibility;
    public readonly attributes?: Attribute[];
    public readonly variants: EnumVariant[];
    public readonly docs?: DocComment;

    public constructor({ name, visibility, attributes, variants, docs }: Enum.Args) {
        super();
        this.name = name;
        this.visibility = visibility;
        this.attributes = attributes;
        this.variants = variants;
        this.docs = docs;
    }

    public write(writer: Writer): void {
        // Write documentation first
        if (this.docs) {
            this.docs.write(writer);
        }

        // Write attributes above the enum
        if (this.attributes && this.attributes.length > 0) {
            this.attributes.forEach((attribute) => {
                attribute.write(writer);
                writer.newLine();
            });
        }

        // Write visibility and enum declaration
        if (this.visibility) {
            writeVisibility(writer, this.visibility);
            writer.write(" ");
        }

        writer.write(`enum ${this.name} {`);
        writer.newLine();

        // Write variants
        this.variants.forEach((variant) => {
            variant.write(writer);
            writer.newLine();
        });

        writer.write("}");
    }
}
