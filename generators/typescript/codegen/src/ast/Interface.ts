import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Type } from "./Type";
import { Reference } from "./Reference";
import { DocString } from "./DocString";

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

        docs?: string;
    }

    interface Property {
        /* The name of the property */
        name: string;
        /* The type of the property */
        type: Type;
        /* Quesiton mark */
        questionMark?: boolean;

        docs?: string;
    }
}

export class Interface extends AstNode {
    public constructor(private readonly args: Interface.Args) {
        super();
    }

    public write(writer: Writer): void {
        if (this.args.docs != null) {
            writer.writeNode(new DocString(this.args.docs));
            writer.writeLine();
        }
        if (this.args.export) {
            writer.write("export ");
        }
        writer.write(` interface ${this.args.name}`);
        if (this.args.extends != null && this.args.extends.length > 0) {
            const numBaseInterfaces = this.args.extends.length;

            writer.write(` extends `);
            this.args.extends.forEach((extend, idx) => {
                writer.writeNode(extend);
                if (idx < numBaseInterfaces - 1) {
                    writer.write(", ");
                } else {
                    writer.write(" ");
                }
            });
        }

        writer.writeLine("{");

        writer.indent();
        for (const property of this.args.properties) {
            if (property.docs != null) {
                writer.writeNode(new DocString(property.docs));
            }
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
