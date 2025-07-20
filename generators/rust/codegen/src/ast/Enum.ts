import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { EnumVariant } from "./EnumVariant";
import { Attribute } from "./Attribute";
import { Visibility } from "./types";

export declare namespace Enum {
    interface Args {
        name: string;
        visibility?: Visibility;
        attributes?: Attribute[];
        variants: EnumVariant[];
    }
}

export class Enum extends AstNode {
    public readonly name: string;
    public readonly visibility?: Visibility;
    public readonly attributes?: Attribute[];
    public readonly variants: EnumVariant[];

    public constructor({ name, visibility, attributes, variants }: Enum.Args) {
        super();
        this.name = name;
        this.visibility = visibility;
        this.attributes = attributes;
        this.variants = variants;
    }

    public write(writer: Writer): void {
        // Write attributes above the enum
        if (this.attributes && this.attributes.length > 0) {
            this.attributes.forEach((attribute) => {
                attribute.write(writer);
                writer.newLine();
            });
        }

        // Write visibility and enum declaration
        if (this.visibility) {
            this.writeVisibility(writer, this.visibility);
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

    private writeVisibility(writer: Writer, visibility: Visibility): void {
        switch (visibility.type) {
            case "public":
                writer.write("pub");
                break;
            case "pub_crate":
                writer.write("pub(crate)");
                break;
            case "pub_super":
                writer.write("pub(super)");
                break;
            case "private":
                // Don't write anything for private
                break;
        }
    }
}
