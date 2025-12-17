import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Reference } from "./Reference";
import { Type } from "./Type";

export interface NamedValue {
    name: string;
    value: AstNode;
}

type InternalTypeInstantiation =
    | Int
    | Float
    | Bool
    | Str
    | Date
    | DateTime
    | Bytes
    | List
    | Set
    | Tuple
    | Dict
    | TypedDict
    | Reference_
    | None
    | Unknown
    | Uuid
    | Nop;

interface IterableConfig {
    endWithComma?: boolean;
    multiline?: boolean;
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

interface Date {
    type: "date";
    value: string;
}

interface DateTime {
    type: "datetime";
    value: string;
}

interface Bytes {
    type: "bytes";
    value: string;
}

interface TypedDict {
    type: "typedDict";
    entries: NamedValue[];
    config?: IterableConfig;
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

interface Reference_ {
    type: "reference";
    value: AstNode;
}

interface None {
    type: "none";
}

interface Unknown {
    type: "unknown";
    value: unknown;
}

interface Uuid {
    type: "uuid";
    value: string;
}

interface Nop {
    type: "nop";
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

    public static typedDict(
        entries: NamedValue[],
        config: IterableConfig = { endWithComma: false }
    ): TypeInstantiation {
        const typedDict = new this({ type: "typedDict", entries, config });
        entries.forEach((entry) => typedDict.inheritReferences(entry.value));
        return typedDict;
    }

    public static date(value: string): TypeInstantiation {
        const date = new this({ type: "date", value });
        date.addReference(new Reference({ name: "date", modulePath: ["datetime"] }));
        return date;
    }

    public static datetime(value: string): TypeInstantiation {
        const datetime = new this({ type: "datetime", value });
        datetime.addReference(new Reference({ name: "datetime", modulePath: ["datetime"] }));
        return datetime;
    }

    public static dict(entries: DictEntry[], config: IterableConfig = { endWithComma: false }): TypeInstantiation {
        const dict = new this({ type: "dict", entries, config });
        entries.forEach((entry) => {
            dict.inheritReferences(entry.key);
            dict.inheritReferences(entry.value);
        });
        return dict;
    }

    public static reference(value: AstNode): TypeInstantiation {
        const ref = new this({ type: "reference", value });
        ref.inheritReferences(value);
        return ref;
    }

    public static none(): TypeInstantiation {
        return new this({ type: "none" });
    }

    public static unknown(value: unknown): TypeInstantiation {
        return new this({ type: "unknown", value });
    }

    public static uuid(value: string): TypeInstantiation {
        const uuid = new this({ type: "uuid", value });
        uuid.addReference(new Reference({ name: "UUID", modulePath: ["uuid"] }));
        return uuid;
    }

    public static nop(): TypeInstantiation {
        return new this({ type: "nop" });
    }

    public static isNop(typeInstantiation: AstNode): boolean {
        return typeInstantiation instanceof TypeInstantiation && typeInstantiation.internalType.type === "nop";
    }

    public isTypedDict(): this is TypedDict {
        return (this.internalType as TypedDict).type === "typedDict";
    }

    public asTypedDictOrThrow(): TypedDict {
        if (this.isTypedDict()) {
            return this.internalType as TypedDict;
        }
        throw new Error("Internal error; python.TypeInstantiation is not a TypedDict");
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
                    writer.write(`"${this.escapeString(this.internalType.value)}"`);
                }
                break;
            case "date":
                writer.write(`date.fromisoformat("${this.internalType.value}")`);
                break;
            case "datetime":
                writer.write(`datetime.fromisoformat("${this.internalType.value}")`);
                break;
            case "bytes":
                writer.write(`b"${this.internalType.value}"`);
                break;
            case "list": {
                const internalType = this.internalType;
                const values = filterNopValues({ values: internalType.values });
                if (values.length === 0) {
                    writer.write("[]");
                    break;
                }
                writer.write("[");
                if (internalType.config?.multiline) {
                    writer.newLine();
                    writer.indent();
                }
                values.forEach((value, index) => {
                    if (index > 0) {
                        writer.write(",");
                        if (internalType.config?.multiline) {
                            writer.newLine();
                        } else {
                            writer.write(" ");
                        }
                    }
                    value.write(writer);
                    if (index === values.length - 1 && internalType.config?.endWithComma) {
                        writer.write(",");
                    }
                });
                if (internalType.config?.multiline) {
                    writer.newLine();
                    writer.dedent();
                }
                writer.write("]");
                break;
            }
            case "set": {
                const internalType = this.internalType;
                const values = filterNopValues({ values: internalType.values });
                if (values.length === 0) {
                    writer.write("{}");
                    break;
                }
                writer.write("{");
                if (internalType.config?.multiline) {
                    writer.newLine();
                    writer.indent();
                }
                values.forEach((value, index) => {
                    if (index > 0) {
                        writer.write(",");
                        if (internalType.config?.multiline) {
                            writer.newLine();
                        } else {
                            writer.write(" ");
                        }
                    }
                    value.write(writer);
                    if (index === values.length - 1 && internalType.config?.endWithComma) {
                        writer.write(",");
                    }
                });
                if (internalType.config?.multiline) {
                    writer.newLine();
                    writer.dedent();
                }
                writer.write("}");
                break;
            }
            case "tuple": {
                const internalType = this.internalType;
                const values = filterNopValues({ values: internalType.values });
                if (values.length === 0) {
                    writer.write("()");
                    break;
                }
                writer.write("(");
                if (internalType.config?.multiline) {
                    writer.newLine();
                    writer.indent();
                }
                values.forEach((value, index) => {
                    if (index > 0) {
                        writer.write(",");
                        if (internalType.config?.multiline) {
                            writer.newLine();
                        } else {
                            writer.write(" ");
                        }
                    }
                    value.write(writer);
                    if (
                        // If the tuple is of length 1, then we must always add a trailing comma
                        values.length === 1 ||
                        // Otherwise, check the config that was specified
                        (index === values.length - 1 && internalType.config?.endWithComma)
                    ) {
                        writer.write(",");
                    }
                });
                if (internalType.config?.multiline) {
                    writer.newLine();
                    writer.dedent();
                }
                writer.write(")");
                break;
            }
            case "dict": {
                const internalType = this.internalType;
                const entries = filterNopDictEntries({ entries: internalType.entries });
                if (entries.length === 0) {
                    writer.write("{}");
                    break;
                }
                writer.write("{");
                if (internalType.config?.multiline) {
                    writer.newLine();
                    writer.indent();
                }
                entries.forEach((entry, index) => {
                    if (index > 0) {
                        writer.write(",");
                        if (internalType.config?.multiline) {
                            writer.newLine();
                        } else {
                            writer.write(" ");
                        }
                    }
                    entry.key.write(writer);
                    writer.write(": ");
                    entry.value.write(writer);
                    if (index === entries.length - 1 && internalType.config?.endWithComma) {
                        writer.write(",");
                    }
                });
                if (internalType.config?.multiline) {
                    writer.newLine();
                    writer.dedent();
                }
                writer.write("}");
                break;
            }
            case "typedDict": {
                const internalType = this.internalType;
                const entries = filterNopNamedValues({ entries: internalType.entries });
                if (entries.length === 0) {
                    writer.write("{}");
                    break;
                }
                writer.write("{");
                if (internalType.config?.multiline) {
                    writer.writeLine();
                    writer.indent();
                }
                entries.forEach((entry, index) => {
                    if (index > 0) {
                        writer.write(",");
                        if (internalType.config?.multiline) {
                            writer.newLine();
                        } else {
                            writer.write(" ");
                        }
                    }
                    writer.write(`"${entry.name}": `);
                    entry.value.write(writer);
                });
                if (internalType.config?.multiline) {
                    writer.newLine();
                    writer.dedent();
                }
                writer.write("}");
                break;
            }
            case "reference": {
                this.internalType.value.write(writer);
                break;
            }
            case "none":
                writer.write("None");
                break;
            case "unknown":
                this.writeUnknown({ writer, value: this.internalType.value });
                break;
            case "uuid":
                writer.write(`UUID("${this.internalType.value}")`);
                break;
            case "nop":
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
            writer.write(this.escapeString(lines[0] ?? ""));
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

    /**
     * Escapes special characters in a string for use in Python string literals.
     *
     * This function always escapes:
     *   - \  -> \\  (backslash - MUST be escaped first!)
     *   - "  -> \"
     *   - '  -> \'
     *   - literal tab -> \t
     *   - literal newline -> \n
     *   - literal carriage return -> \r
     *
     * Important: Backslashes must be escaped first to avoid double-escaping.
     * For example, if we escaped quotes first:
     *   Input: \"  (backslash-quote, 2 chars)
     *   After quote escape: \" stays \" (not matched if already escaped)
     *   After backslash escape: \\" (wrong!)
     *
     * By escaping backslashes first:
     *   Input: \"  (backslash-quote, 2 chars)
     *   After backslash escape: \\"  (4 chars: \\, \, ", becomes \\\" in output)
     *   After quote escape: \\\"  (correct: escaped backslash + escaped quote)
     *
     * @param input The input string to be escaped
     */
    private escapeString(input: string): string {
        // Escape backslashes first, then other special characters
        return input
            .replace(/\\/g, "\\\\") // Escape backslashes first
            .replace(/"/g, '\\"') // Escape double quotes
            .replace(/'/g, "\\'") // Escape single quotes
            .replace(/\t/g, "\\t") // Escape tabs
            .replace(/\n/g, "\\n") // Escape newlines
            .replace(/\r/g, "\\r"); // Escape carriage returns
    }

    private writeUnknown({ writer, value }: { writer: Writer; value: unknown }): void {
        switch (typeof value) {
            case "boolean":
                writer.write(value ? "True" : "False");
                return;
            case "string":
                writer.write(`"${this.escapeString(value)}"`);
                return;
            case "number":
                writer.write(value.toString());
                return;
            case "object":
                if (value == null) {
                    writer.write("None");
                    return;
                }
                if (Array.isArray(value)) {
                    this.writeUnknownArray({ writer, value });
                    return;
                }
                this.writeUnknownObject({ writer, value });
                return;
            default:
                throw new Error(`Internal error; unsupported unknown type: ${typeof value}`);
        }
    }

    private writeUnknownArray({
        writer,
        value
    }: {
        writer: Writer;
        // biome-ignore lint/suspicious/noExplicitAny: allow
        value: any[];
    }): void {
        if (value.length === 0) {
            writer.write("[]");
            return;
        }
        writer.writeLine("[");
        writer.indent();
        for (const element of value) {
            writer.writeNode(TypeInstantiation.unknown(element));
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("]");
    }

    private writeUnknownObject({ writer, value }: { writer: Writer; value: object }): void {
        const entries = Object.entries(value);
        if (entries.length === 0) {
            writer.write("{}");
            return;
        }
        writer.writeLine("{");
        writer.indent();
        for (const [key, val] of entries) {
            writer.write(`"${key}": `);
            writer.writeNode(TypeInstantiation.unknown(val));
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }
}

function filterNopDictEntries({ entries }: { entries: DictEntry[] }): DictEntry[] {
    return entries.filter((entry) => !TypeInstantiation.isNop(entry.key) && !TypeInstantiation.isNop(entry.value));
}

function filterNopNamedValues({ entries }: { entries: NamedValue[] }): NamedValue[] {
    return entries.filter((entry) => !TypeInstantiation.isNop(entry.value));
}

function filterNopValues({ values }: { values: AstNode[] }): AstNode[] {
    return values.filter((value) => !TypeInstantiation.isNop(value));
}

export { Type };
