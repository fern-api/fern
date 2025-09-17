import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

/**
 * Represents the throwing of an error via `raise`.
 */
export declare namespace Raise {
    interface Args {
        /** The error to raise. Can be an arbitrary expression. If none is passed Ruby will default it to a RuntimeError */
        errorClass?: AstNode;
        /** The expression being passed as the second argument of raise, must resolve to a string if it exists */
        message?: AstNode;
    }
}

export class Raise extends AstNode {
    public readonly errorClass?: AstNode;
    public readonly message?: AstNode;

    constructor({ errorClass, message }: Raise.Args) {
        super();
        this.errorClass = errorClass;
        this.message = message;
    }

    public write(writer: Writer): void {
        writer.write("raise");

        if (this.errorClass) {
            writer.write(" ");
            this.errorClass.write(writer);
        }

        if (this.message) {
            if (this.errorClass) {
                writer.write(", ");
            }
            this.message.write(writer);
        }
    }
}
