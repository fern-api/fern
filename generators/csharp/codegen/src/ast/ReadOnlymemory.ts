import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace ReadOnlyMemory {
    interface Args {
        itemType: Type;
        entries: AstNode[];
    }
}

export class ReadOnlyMemory extends AstNode {
    private itemType: Type;
    private entries: AstNode[];

    constructor({ itemType, entries }: ReadOnlyMemory.Args) {
        super();
        this.itemType = itemType;
        this.entries = entries;
    }

    public write(writer: Writer): void {
        writer.write("new");
        if (this.entries.length === 0) {
            writer.write(" ");
            writer.writeNode(this.itemType);
        }
        writer.write("[] {");
        this.entries.forEach((item, index) => {
            writer.writeNode(item);
            if (index < this.entries.length - 1) {
                writer.write(", ");
            }
        });
        writer.write("}");
    }
}
