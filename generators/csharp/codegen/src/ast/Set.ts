import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Set {
    interface Args {
        itemType: Type;
        entries: AstNode[];
    }
}

export class Set extends AstNode {
    private itemType: Type;
    private entries: AstNode[];

    constructor({ itemType, entries }: Set.Args) {
        super();
        this.itemType = itemType;
        this.entries = entries;
    }

    public write(writer: Writer): void {
        writer.write("new HashSet<");
        this.itemType.write(writer);
        writer.write(">() {");
        writer.newLine();
        writer.indent();
        this.entries.forEach((item, index) => {
            writer.writeNode(item);
            if (index < this.entries.length - 1) {
                writer.write(", ");
            }
        });
        writer.dedent();
        writer.write("}");
    }
}
