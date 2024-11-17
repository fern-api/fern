import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";
import { Reference } from "./Reference";

type InternalTypeInstantiation = Int | Float | Bool | Str | BlockStr | Bytes | List | Set | Tuple | Dict | None | Uuid;

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

interface BlockStr {
    type: "block_str";
    value: string;
}

interface Bytes {
    type: "bytes";
    value: string;
}

interface List {
    type: "list";
    values: AstNode[];
}

interface Set {
    type: "set";
    values: AstNode[];
}

interface Tuple {
    type: "tuple";
    values: AstNode[];
}

interface Dict {
    type: "dict";
    entries: DictEntry[];
}

interface DictEntry {
    key: AstNode;
    value: AstNode;
}

interface None {
    type: "none";
}

interface Uuid {
    type: "uuid";
    value: string;
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

    public static blockStr(value: string): TypeInstantiation {
        return new this({ type: "block_str", value });
    }

    public static bytes(value: string): TypeInstantiation {
        return new this({ type: "bytes", value });
    }

    public static list(values: AstNode[]): TypeInstantiation {
        const list = new this({ type: "list", values });
        values.forEach((value) => list.inheritReferences(value));
        return list;
    }

    public static set(values: AstNode[]): TypeInstantiation {
        const set = new this({ type: "set", values });
        values.forEach((value) => set.inheritReferences(value));
        return set;
    }

    public static tuple(values: AstNode[]): TypeInstantiation {
        const tuple = new this({ type: "tuple", values });
        values.forEach((value) => tuple.inheritReferences(value));
        return tuple;
    }

    public static dict(entries: DictEntry[]): TypeInstantiation {
        const dict = new this({ type: "dict", entries });
        entries.forEach((entry) => {
            dict.inheritReferences(entry.key);
            dict.inheritReferences(entry.value);
        });
        return dict;
    }

    public static none(): TypeInstantiation {
        return new this({ type: "none" });
    }

    public static uuid(value: string): TypeInstantiation {
        const uuid = new this({ type: "uuid", value });
        uuid.addReference(new Reference({ name: "UUID", modulePath: ["uuid"] }));
        return uuid;
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
            case "block_str": {
                const suffix = this.internalType.value.endsWith("\n") ? "\\" : "\n";
                writer.write(`"""\\\n${this.internalType.value}${suffix}"""`);
                break;
            }
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
            case "uuid":
                writer.write(`UUID("${this.internalType.value}")`);
                break;
            default:
                assertNever(this.internalType);
        }
    }
}

export { Type };
