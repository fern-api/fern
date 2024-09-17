import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Array {
    interface Args {
        entries: AstNode[] | undefined;
    }
}

export class Array extends AstNode {
    private entries: AstNode[];

    constructor({ entries }: Array.Args) {
        super();
        this.entries = entries ?? [];
    }

    public write(writer: Writer): void {
        writer.write("[");
        this.entries.forEach((entry, index) => {
            if (index > 0) {
                writer.write(", ");
            }
            entry.write(writer);
        });
        writer.write("]");
    }
}
