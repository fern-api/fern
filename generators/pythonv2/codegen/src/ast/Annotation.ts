import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Annotation {
    interface Args {
        /* The type hint */
        type: string | AstNode;
    }
}

export class Annotation extends AstNode {
    private type: string | AstNode;

    constructor(args: Annotation.Args) {
        super();
        this.type = args.type;
    }

    public write(writer: Writer): void {
        writer.write(": ");
        if (typeof this.type === "string") {
            writer.write(this.type);
        } else {
            this.type.write(writer);
        }
    }
}
