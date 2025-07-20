import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Type } from "./Type";
import { Attribute } from "./Attribute";

export declare namespace EnumVariant {
    interface Args {
        name: string;
        attributes?: Attribute[];
        data?: Type[]; // For variants with data like Some(T)
        namedFields?: { name: string; type: Type }[]; // For struct-like variants
    }
}

export class EnumVariant extends AstNode {
    public readonly name: string;
    public readonly attributes?: Attribute[];
    public readonly data?: Type[];
    public readonly namedFields?: { name: string; type: Type }[];

    public constructor({ name, attributes, data, namedFields }: EnumVariant.Args) {
        super();
        this.name = name;
        this.attributes = attributes;
        this.data = data;
        this.namedFields = namedFields;
    }

    public write(writer: Writer): void {
        // Write attributes above the variant
        if (this.attributes && this.attributes.length > 0) {
            this.attributes.forEach((attribute) => {
                writer.write("    "); // Indentation for enum variant attributes
                attribute.write(writer);
                writer.newLine();
            });
        }

        writer.write("    "); // Indentation for the variant itself
        writer.write(this.name);

        // Handle tuple-style variants: VariantName(Type1, Type2)
        if (this.data && this.data.length > 0) {
            writer.write("(");
            this.data.forEach((type, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                type.write(writer);
            });
            writer.write(")");
        }

        // Handle struct-style variants: VariantName { field: Type }
        if (this.namedFields && this.namedFields.length > 0) {
            writer.write(" { ");
            this.namedFields.forEach((field, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                writer.write(`${field.name}: `);
                field.type.write(writer);
            });
            writer.write(" }");
        }

        writer.write(",");
    }
} 