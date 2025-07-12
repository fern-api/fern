import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Attribute {
    interface Args {
        /* Reference to the attribute class reference */
        reference: ClassReference;
        /* Arguments included in the attribute, if any */
        arguments?: (string | AstNode)[];
    }
}

export class Attribute extends AstNode {
    private reference: ClassReference;
    private arguments: (string | AstNode)[];

    constructor(args: Attribute.Args) {
        super();
        this.reference = args.reference;
        this.arguments = args.arguments ?? [];
    }

    public write(writer: Writer): void {
        writer.addReference(this.reference);
        writer.write(`${this.reference.name}`);
        if (this.arguments.length > 0) {
            writer.write("(");
            this.arguments.forEach((argument, index) => {
                if (index > 0) {
                    writer.write(",");
                }
                if (typeof argument === "string") {
                    writer.write(argument);
                } else {
                    argument.write(writer);
                }
            });
            writer.write(")");
        }
    }
}
