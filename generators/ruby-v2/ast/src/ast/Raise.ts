import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

/**
 * Represents the throwing of an error via `raise`.
 */
export declare namespace Raise {
    interface Args {
        /** The error class being raised, if there is none Ruby will default it to a RuntimeError */
        errorClass?: ClassReference;
        /** The expression being passed as the second argument of raise, must resolve to a string */
        message?: AstNode;
    }
}

export class Raise extends AstNode {
    public readonly errorClass?: ClassReference;
    public readonly message?: AstNode;

    constructor({ errorClass, message }: Raise.Args) {
        super();
        this.errorClass = errorClass;
        this.message = message;
    }

    public write(writer: Writer): void {
        // Write the primary if branch
        writer.write("raise");

        let messageIsSecondArg = false;

        if (this.errorClass) {
            writer.write(" ");
            this.errorClass.write(writer);
            messageIsSecondArg = true;
        }

        if (this.message) {
            if (messageIsSecondArg) {
                writer.write(", ");
            }
            this.message.write(writer);
        }

        writer.newLine();
    }
}
