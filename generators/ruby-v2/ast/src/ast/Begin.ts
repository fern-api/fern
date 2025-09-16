import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

/**
 * Represents a `begin` block with 0-N `rescue` clauses in the AST. `begin` blocks in Ruby also
 * support optional `else` and `ensure` clauses as well, but support for those are unimplemented for now.
 */
export declare namespace Begin {
    export type Rescue = {
        errorClass?: ClassReference;
        errorVariable?: string;
        body?: AstNode;
    };

    interface Args {
        /** The main body of the `begin` */
        body?: AstNode;
        /** The rescue clauses */
        rescues: Begin.Rescue[];
    }
}

export class Begin extends AstNode {
    public readonly body?: AstNode;
    public readonly rescues: Begin.Rescue[];

    constructor({ body, rescues }: Begin.Args) {
        super();
        this.body = body;
        this.rescues = rescues;
    }

    public write(writer: Writer): void {
        // Write the primary if branch
        writer.write("begin");
        writer.writeLine();

        if (this.body) {
            writer.indent();
            this.body.write(writer);
            writer.writeNewLineIfLastLineNot();
            writer.dedent();
        }

        // Write rescue branches if any
        for (const { errorClass, errorVariable, body } of this.rescues) {
            writer.write("rescue");

            if (errorClass) {
                writer.write(" ");
                errorClass.write(writer);
            }

            if (errorVariable) {
                writer.write(" => ");
                writer.write(errorVariable);
            }

            writer.writeLine();
            if (body) {
                writer.indent();

                body.write(writer);

                writer.writeNewLineIfLastLineNot();
                writer.dedent();
            }
        }

        writer.write("end");
        writer.writeNewLineIfLastLineNot();
    }
}
