import { UnnamedArgument } from "@fern-api/browser-compatible-base-generator";
import { type Generation } from "../../context/generation-info";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { Type } from "../types/Type";

export declare namespace Dictionary {
    interface Args {
        keyType: Type;
        valueType: Type;
        values: Values | undefined;
    }

    interface MapEntry {
        key: AstNode;
        value: AstNode;
    }

    type Values = MapEntryValues | UnnamedArgumentValues;

    interface MapEntryValues {
        type: "entries";
        entries: MapEntry[];
    }

    interface UnnamedArgumentValues {
        type: "argument";
        argument: UnnamedArgument;
    }
}

export class Dictionary extends AstNode {
    private keyType: Type;
    private valueType: Type;
    private values: Dictionary.Values | undefined;

    constructor({ keyType, valueType, values }: Dictionary.Args, generation: Generation) {
        super(generation);
        this.keyType = keyType;
        this.valueType = valueType;
        this.values = values;
    }

    public write(writer: Writer): void {
        if (this.values == null) {
            writer.write(this.System.Collections.Generic.Dictionary(this.keyType, this.valueType).new());
            return;
        }
        if (this.values.type === "argument") {
            writer.write(
                this.System.Collections.Generic.Dictionary(this.keyType, this.valueType).new({
                    arguments_: [this.values.argument]
                })
            );
            return;
        }
        writer.write(this.System.Collections.Generic.Dictionary(this.keyType, this.valueType).new());
        writer.pushScope();
        for (const { key, value } of this.values.entries) {
            writer.writeLine("{ ", key, ", ", value, " },");
        }
        writer.popScope();
    }
}
