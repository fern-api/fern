import { AccessLevel } from "./AccessLevel";
import type { EnumWithRawValues } from "./EnumWithRawValues";
import { Property } from "./Property";
import { AstNode, Writer } from "./core";

export declare namespace Struct {
    interface Args {
        name: string;
        accessLevel?: AccessLevel;
        conformances?: string[];
        properties: Property[];
        nestedTypes?: (Struct | EnumWithRawValues)[];
    }
}

export class Struct extends AstNode {
    public readonly name: string;
    public readonly accessLevel?: AccessLevel;
    public readonly conformances?: string[];
    public readonly properties: Property[];
    public readonly nestedTypes?: (Struct | EnumWithRawValues)[];

    public constructor({ accessLevel, name, conformances, properties, nestedTypes }: Struct.Args) {
        super();
        this.name = name;
        this.accessLevel = accessLevel;
        this.conformances = conformances;
        this.properties = properties;
        this.nestedTypes = nestedTypes;
    }

    public write(writer: Writer): void {
        if (this.accessLevel != null) {
            writer.write(this.accessLevel);
            writer.write(" ");
        }
        writer.write(`struct ${this.name}`);
        this.conformances?.forEach((conformance, index) => {
            if (index === 0) {
                writer.write(": ");
            } else if (index > 0) {
                writer.write(", ");
            }
            writer.write(conformance);
        });
        writer.write(" {");
        writer.newLine();
        writer.indent();
        this.properties.forEach((property) => {
            property.write(writer);
            writer.newLine();
        });
        if (this.nestedTypes) {
            writer.newLine();
            this.nestedTypes.forEach((nestedType, nestedTypeIdx) => {
                if (nestedTypeIdx > 0) {
                    writer.newLine();
                }
                nestedType.write(writer);
                writer.newLine();
            });
        }
        writer.dedent();
        writer.write("}");
    }
}
