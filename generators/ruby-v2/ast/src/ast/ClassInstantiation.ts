import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

import { KeywordArgument } from "./KeywordArgument";

export declare namespace ClassInstantiation {
    interface Args {
        /** The class to instantiate */
        classReference: ClassReference;
        /** The keyword arguments passed to the constructor */
        arguments_: KeywordArgument[];
    }
}

export class ClassInstantiation extends AstNode {
    private classReference: ClassReference;
    private arguments_: KeywordArgument[];

    constructor({ classReference, arguments_ }: ClassInstantiation.Args) {
        super();
        this.classReference = classReference;
        this.arguments_ = arguments_;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.classReference);
        writer.write(".");
        writer.write("new");
        writer.write("(");
        // If there is more than one argument, write each argument on its own line,
        // separated by commas, for better readability in the generated Ruby code.
        // Otherwise, write the arguments inline (on the same line).
        if (this.arguments_.length > 1) {
            writer.indent();
            writer.newLine();
            this.arguments_.forEach((argument, index) => {
                if (index > 0) {
                    writer.write(",");
                    writer.newLine();
                }
                argument.write(writer);
            });
            writer.newLine();
            writer.dedent();
        } else {
            this.arguments_.forEach((argument, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                argument.write(writer);
            });
        }
        writer.write(")");
    }
}
