import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";

type InternalTypeInstantiation = Int | Float | Bool | Str | Bytes | List | Set | Tuple | Dict | None;

interface Int {
    type: "int";
    value: number;
}

interface Float {
    type: "float";
    value: number;
}

interface Bool {
    type: "bool";
    value: boolean;
}

interface Str {
    type: "str";
    value: string;
}

interface Bytes {
    type: "bytes";
    value: string;
}

interface List {
    type: "list";
    values: TypeInstantiation[];
}

interface Set {
    type: "set";
    values: TypeInstantiation[];
}

interface Tuple {
    type: "tuple";
    values: TypeInstantiation[];
}

interface Dict {
    type: "dict";
    entries: DictEntry[];
}

interface DictEntry {
    key: TypeInstantiation;
    value: TypeInstantiation;
}

interface None {
    type: "none";
}

export class TypeInstantiation extends AstNode {
    private constructor(private readonly internalType: InternalTypeInstantiation) {
        super();
    }

    public static int(value: number): TypeInstantiation {
        return new this({ type: "int", value });
    }

    public static float(value: number): TypeInstantiation {
        return new this({ type: "float", value });
    }

    public static bool(value: boolean): TypeInstantiation {
        return new this({ type: "bool", value });
    }

    public static str(value: string): TypeInstantiation {
        return new this({ type: "str", value });
    }

    public static bytes(value: string): TypeInstantiation {
        return new this({ type: "bytes", value });
    }

    public static list(values: TypeInstantiation[]): TypeInstantiation {
        return new this({ type: "list", values });
    }

    public static set(values: TypeInstantiation[]): TypeInstantiation {
        return new this({ type: "set", values });
    }

    public static tuple(values: TypeInstantiation[]): TypeInstantiation {
        return new this({ type: "tuple", values });
    }

    public static dict(entries: DictEntry[]): TypeInstantiation {
        return new this({ type: "dict", entries });
    }

    public static none(): TypeInstantiation {
        return new this({ type: "none" });
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "int":
                writer.write(this.internalType.value.toString());
                break;
            case "float":
                writer.write(this.internalType.value.toString());
                break;
            case "bool":
                if (this.internalType.value) {
                    writer.write("True");
                } else {
                    writer.write("False");
                }
                break;
            case "str":
                writer.write(`"${this.internalType.value}"`);
                break;
            case "bytes":
                writer.write(`b"${this.internalType.value}"`);
                break;
            case "list":
                writer.write("[");
                this.internalType.values.forEach((value, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    value.write(writer);
                });
                writer.write("]");
                break;
            case "set":
                writer.write("{");
                this.internalType.values.forEach((value, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    value.write(writer);
                });
                writer.write("}");
                break;
            case "tuple":
                writer.write("(");
                this.internalType.values.forEach((value, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    value.write(writer);
                });
                writer.write(")");
                break;
            case "dict":
                writer.write("{");
                this.internalType.entries.forEach((entry, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    entry.key.write(writer);
                    writer.write(": ");
                    entry.value.write(writer);
                });
                writer.write("}");
                break;
            case "none":
                writer.write("None");
                break;
            default:
                assertNever(this.internalType);
        }
    }
}

export { Type };
