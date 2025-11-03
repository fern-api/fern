import { type Generation } from "../../context/generation-info";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { Type } from "../types/Type";

export declare namespace List {
    interface Args {
        itemType?: Type;
        entries: AstNode[];
    }
}

export class List extends AstNode {
    private itemType: Type | undefined;
    private entries: AstNode[];

    constructor({ itemType, entries }: List.Args, generation: Generation) {
        super(generation);
        this.itemType = itemType;
        this.entries = entries;
    }

    public write(writer: Writer): void {
        if (this.itemType != null) {
            writer.write("new List<");
            this.itemType.write(writer);
            writer.write(">()");
            writer.pushScope();
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
            writer.popScope();
        } else {
            writer.write("]");
        }
    }
}
