import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";
import { Reference } from "./Reference";

type InternalTypeInstantiation = Int | Float | Bool | Str | Bytes | List | Set | Tuple | Dict | None | Uuid;

interface IterableConfig {
    endWithComma?: boolean;
}

interface StrConfig {
    multiline?: boolean;
    startOnNewLine?: boolean;
    endWithNewLine?: boolean;
}

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
    config?: StrConfig;
}

interface Bytes {
    type: "bytes";
    value: string;
}

interface List {
    type: "list";
    values: AstNode[];
    config?: IterableConfig;
}

interface Set {
    type: "set";
    values: AstNode[];
    config?: IterableConfig;
}

interface Tuple {
    type: "tuple";
    values: AstNode[];
    config?: IterableConfig;
}

interface Dict {
    type: "dict";
    entries: DictEntry[];
    config?: IterableConfig;
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

    public static str(
        value: string,
        config: StrConfig = {
            multiline: false,
            startOnNewLine: false,
            endWithNewLine: false
        }
    ): TypeInstantiation {
        return new this({ type: "str", value, config });
    }

    public static bytes(value: string): TypeInstantiation {
        return new this({ type: "bytes", value });
    }

    public static list(values: AstNode[], config: IterableConfig = { endWithComma: false }): TypeInstantiation {
        const list = new this({ type: "list", values, config });
        values.forEach((value) => list.inheritReferences(value));
        return list;
    }

    public static set(values: AstNode[], config: IterableConfig = { endWithComma: false }): TypeInstantiation {
        const set = new this({ type: "set", values, config });
        values.forEach((value) => set.inheritReferences(value));
        return set;
    }

    public static tuple(values: AstNode[], config: IterableConfig = { endWithComma: false }): TypeInstantiation {
        const tuple = new this({ type: "tuple", values, config });
        values.forEach((value) => tuple.inheritReferences(value));
        return tuple;
    }

    public static dict(entries: DictEntry[], config: IterableConfig = { endWithComma: false }): TypeInstantiation {
        const dict = new this({ type: "dict", entries, config });
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
                if (this.internalType.config?.multiline) {
                    const { startOnNewLine, endWithNewLine } = this.internalType.config;
                    this.writeStringWithTripleQuotes({
                        writer,
                        value: this.internalType.value,
                        startOnNewLine,
                        endWithNewLine
                    });
                } else {
                    writer.write(
                        `"${this.escapeString(this.internalType.value, { doubleQuote: true, newline: true })}"`
                    );
                }
                break;
            case "bytes":
                writer.write(`b"${this.internalType.value}"`);
                break;
            case "list": {
                const internalType = this.internalType;
                writer.write("[");
                internalType.values.forEach((value, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    value.write(writer);
                    if (index === internalType.values.length - 1 && internalType.config?.endWithComma) {
                        writer.write(",");
                    }
                });
                writer.write("]");
                break;
            }
            case "set": {
                const internalType = this.internalType;
                writer.write("{");
                internalType.values.forEach((value, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    value.write(writer);
                    if (index === internalType.values.length - 1 && internalType.config?.endWithComma) {
                        writer.write(",");
                    }
                });
                writer.write("}");
                break;
            }
            case "tuple": {
                const internalType = this.internalType;
                writer.write("(");
                this.internalType.values.forEach((value, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    value.write(writer);
                    if (index === internalType.values.length - 1 && internalType.config?.endWithComma) {
                        writer.write(",");
                    }
                });
                writer.write(")");
                break;
            }
            case "dict": {
                const internalType = this.internalType;
                writer.write("{");
                internalType.entries.forEach((entry, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    entry.key.write(writer);
                    writer.write(": ");
                    entry.value.write(writer);
                    if (index === internalType.entries.length - 1 && internalType.config?.endWithComma) {
                        writer.write(",");
                    }
                });
                writer.write("}");
                break;
            }
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

    private writeStringWithTripleQuotes({
        writer,
        value,
        startOnNewLine,
        endWithNewLine
    }: {
        writer: Writer;
        value: string;
    } & Pick<StrConfig, "startOnNewLine" | "endWithNewLine">): void {
        writer.write('"""');
        const lines = value.split("\n");

        // If there is only one line, we can just write it as a single line string
        if (lines.length <= 1) {
            writer.write(this.escapeString(this.escapeString(lines[0] ?? "")));
            writer.write('"""');
            return;
        }

        if (startOnNewLine) {
            writer.writeNoIndent("\\\n");
        }

        lines.forEach((line, idx) => {
            writer.writeNoIndent(this.escapeString(line));

            // If this is the last line, add a newline escape
            if (idx === lines.length - 1) {
                if (endWithNewLine) {
                    writer.writeNoIndent("\\\n");
                }
            } else {
                writer.writeNoIndent("\n");
            }
        });

        writer.writeNoIndent('"""');
    }

    private escapeString(
        value: string,
        config: { doubleQuote?: boolean; newline?: boolean } = { doubleQuote: true, newline: false }
    ): string {
        let escapedValue = value;
        if (config.doubleQuote) {
            escapedValue = escapedValue.replaceAll('"', '\\"');
        }
        if (config.newline) {
            escapedValue = escapedValue.replaceAll("\n", "\\n");
        }
        return escapedValue;
    }
}

export { Type };
