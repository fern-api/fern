import { UnnamedArgument } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";

import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

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

    constructor({ keyType, valueType, values }: Dictionary.Args) {
        super();
        this.keyType = keyType;
        this.valueType = valueType;
        this.values = values;
    }

    public write(writer: Writer): void {
        writer.write("new Dictionary<");
        this.keyType.write(writer);
        writer.write(", ");
        this.valueType.write(writer);
        writer.write(">");

        if (this.values == null) {
            writer.write("()");
            return;
        }

        switch (this.values.type) {
            case "argument": {
                writer.write("(");
                this.values.argument.write(writer);
                writer.write(")");
                break;
            }
            case "entries": {
                writer.writeLine("() {");
                writer.indent();
                for (const { key, value } of this.values.entries) {
                    writer.write("{ ");
                    key.write(writer);
                    writer.write(", ");
                    value.write(writer);
                    writer.writeLine(" }, ");
                }
                writer.dedent();
                writer.write("}");
                break;
            }
            default:
                assertNever(this.values);
        }
    }
}
