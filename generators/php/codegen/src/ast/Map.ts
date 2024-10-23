import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Map {
    interface Args {
        entries: Entry[] | undefined;
        multiline?: boolean;
    }

    interface Entry {
        key: AstNode;
        value: AstNode;
    }
}

export class Map extends AstNode {
    private entries: Map.Entry[];
    private multiline: boolean;

    constructor({ entries, multiline }: Map.Args) {
        super();
        this.entries = entries ?? [];
        this.multiline = multiline ?? false;
    }

    public write(writer: Writer): void {
        if (this.multiline) {
            this.writeMultiline(writer);
            return;
        }
        this.writeCompact(writer);
    }

    private writeMultiline(writer: Writer): void {
        writer.writeLine("[");
        writer.indent();
        for (const { key, value } of this.entries) {
            key.write(writer);
            writer.write(" => ");
            value.write(writer);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("]");
    }

    private writeCompact(writer: Writer): void {
        writer.write("[");
        for (const [index, { key, value }] of this.entries.entries()) {
            if (index > 0) {
                writer.write(", ");
            }
            key.write(writer);
            writer.write(" => ");
            value.write(writer);
        }
        writer.write("]");
    }
}
