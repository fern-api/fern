import { AccessLevel } from "./AccessLevel";
import { Property } from "./Property";
import { AstNode, Writer } from "./core";

export declare namespace Struct {
    interface Args {
        name: string;
        accessLevel?: AccessLevel;
        conformances?: string[];
        properties: Property[];
    }
}

export class Struct extends AstNode {
    public readonly name: string;
    public readonly accessLevel?: AccessLevel;
    public readonly conformances?: string[];
    public readonly properties: Property[];

    public constructor({ accessLevel, name, conformances, properties }: Struct.Args) {
        super();
        this.name = name;
        this.accessLevel = accessLevel;
        this.conformances = conformances;
        this.properties = properties;
    }

    public write(writer: Writer): void {
        if (this.accessLevel != null) {
            writer.write(this.accessLevel);
            writer.write(" ");
        }
        writer.write(`struct ${this.name}`); // TODO: Handle reserved words
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
        writer.dedent();
        writer.write("}");
    }
}
