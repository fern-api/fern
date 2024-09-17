import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Map {
    interface Args {
        entries: Entry[] | undefined;
    }

    interface Entry {
        key: AstNode;
        value: AstNode;
    }
}

export class Map extends AstNode {
    private entries: Map.Entry[] | undefined;

    constructor({ entries }: Map.Args) {
        super();
        this.entries = entries;
    }

    public write(writer: Writer): void {
        if (this.entries == null) {
            writer.write("[]");
            return;
        }

        writer.writeLine("[");
        writer.indent();
        for (const { key, value } of this.entries) {
            key.write(writer);
            writer.write(" => ");
            value.write(writer);
            writer.writeLine(", ");
        }
        writer.dedent();
        writer.write("]");
    }
}
