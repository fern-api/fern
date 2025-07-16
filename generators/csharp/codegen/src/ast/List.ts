import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace List {
    interface Args {
        itemType?: Type;
        entries: AstNode[];
    }
}

export class List extends AstNode {
    private itemType: Type | undefined;
    private entries: AstNode[];

    constructor({ itemType, entries }: List.Args) {
        super();
        this.itemType = itemType;
        this.entries = entries;
    }

    public write(writer: Writer): void {
        if (this.itemType != null) {
            writer.write("new List<");
            this.itemType.write(writer);
            writer.write(">() {");
            writer.newLine();
            writer.indent();
        } else {
            writer.write("[");
        }
        this.entries.forEach((item, index) => {
            writer.writeNode(item);
            if (index < this.entries.length - 1) {
                writer.write(", ");
            }
        });
        if (this.itemType != null) {
            writer.dedent();
            writer.write("}");
        } else {
            writer.write("]");
        }
    }
}
