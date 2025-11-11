import { type Generation } from "../../context/generation-info";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { Type } from "../types/Type";

export declare namespace Set {
    interface Args {
        itemType: Type;
        entries: AstNode[];
    }
}

export class Set extends AstNode {
    private itemType: Type;
    private entries: AstNode[];

    constructor({ itemType, entries }: Set.Args, generation: Generation) {
        super(generation);
        this.itemType = itemType;
        this.entries = entries;
    }

    public write(writer: Writer): void {
        writer.write(this.System.Collections.Generic.HashSet(this.itemType).new());
        writer.pushScope();
        this.entries.forEach((item, index) => {
            writer.writeNode(item);
            if (index < this.entries.length - 1) {
                writer.write(", ");
            }
        });
        writer.popScope(false);
    }
}
