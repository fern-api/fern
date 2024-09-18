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
    private entries: Map.Entry[];

    constructor({ entries }: Map.Args) {
        super();
        this.entries = entries ?? [];
    }

    public write(writer: Writer): void {
        writer.write("[");
        for (const [index, { key, value }] of this.entries.entries()) {
            if (index > 0) {
                writer.write(",");
            }
            key.write(writer);
            writer.write(" => ");
            value.write(writer);
        }
        writer.write("]");
    }
}
