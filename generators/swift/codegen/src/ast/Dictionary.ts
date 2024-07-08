import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";

export declare namespace Dictionary {
    interface Args {
        keyType: Type;
        valueType: Type;
        entries: MapEntry[];
    }

    interface MapEntry {
        key: AstNode;
        value: AstNode;
    }
}

export class Dictionary extends AstNode {
    private keyType: Type;
    private valueType: Type;
    private entries: Dictionary.MapEntry[];

    constructor({ keyType, valueType, entries }: Dictionary.Args) {
        super();
        this.keyType = keyType;
        this.valueType = valueType;
        this.entries = entries;
    }

    public write(writer: Writer): void {
        writer.write("new Dictionary<");
        this.keyType.write(writer);
        writer.write(", ");
        this.valueType.write(writer);
        writer.write(">() {");
        writer.newLine();
        writer.indent();
        for (const { key, value } of this.entries) {
            writer.write("{ ");
            key.write(writer);
            writer.write(", ");
            value.write(writer);
            writer.writeLine(" }, ");
        }
        writer.dedent();
        writer.write("}");
    }
}
