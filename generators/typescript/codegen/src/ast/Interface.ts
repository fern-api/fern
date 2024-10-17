import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";
import { Reference } from "./Reference";

export declare namespace Interface {
    interface Args {
        /* Whether to export */
        export?: boolean;
        /* The name of the variable */
        name: string;
        /* Properties on the interface */
        properties: Property[];
        /* The interfaces that this extends */
        extends?: Reference[];
    }

    interface Property {
        /* The name of the property */
        name: string;
        /* The type of the property */
        type: Type;
        /* Quesiton mark */
        questionMark?: boolean;
    }
}

export class Interface extends AstNode {
    public constructor(private readonly args: Interface.Args) {
        super();
    }

    public write(writer: Writer): void {
        if (this.args.export) {
            writer.write("export ");
        }
        writer.write(` interface ${this.args.name}`);
        writer.writeLine("{");

        writer.indent();
        for (const property of this.args.properties) {
            writer.write(`"${property.name}\"`);
            if (property.questionMark) {
                writer.write("?");
            }
            writer.write(": ");
            writer.writeNodeStatement(property.type);
        }
        writer.dedent();

        writer.writeLine("}");
    }
}
