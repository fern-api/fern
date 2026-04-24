import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";
import { Type } from "./Type.js";

export interface NamedValue {
    name: string;
    value: AstNode;
}

type InternalTypeLiteral = Str | InterpolatedStr | Int | Float | Bool | Hash | Set_ | List_ | Nop | Nil;

interface Str {
    type: "str";
    value: string;
}

interface InterpolatedStr {
    type: "interpolatedStr";
    value: string;
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

interface Hash {
    type: "hash";
    entries: HashEntry[];
}

export interface HashEntry {
    key: AstNode;
    value: AstNode;
}

interface Set_ {
    type: "set";
    values: AstNode[];
}

interface List_ {
    type: "list";
    values: AstNode[];
}

interface Nop {
    type: "nop";
}

interface Nil {
    type: "nil";
}

export class TypeLiteral extends AstNode {
    private constructor(private readonly internalType: InternalTypeLiteral) {
        super();
    }

    /**
     * Returns a stable string representation of this literal suitable for
     * deduplicating hash keys (see Lint/DuplicateHashKey). Returns undefined
     * for compound/dynamic shapes where value equality isn't decidable at
     * emit time.
     */
    public getDedupKey(): string | undefined {
        switch (this.internalType.type) {
            case "str":
                return `str:${this.internalType.value}`;
            case "interpolatedStr":
                return `istr:${this.internalType.value}`;
            case "int":
                return `int:${this.internalType.value}`;
            case "float":
                return `float:${this.internalType.value}`;
            case "bool":
                return `bool:${this.internalType.value}`;
            case "nil":
                return "nil";
            default:
                return undefined;
        }
    }

    public static string(value: string): TypeLiteral {
        return new this({ type: "str", value });
    }

    public static interpolatedString(value: string): TypeLiteral {
        return new this({ type: "interpolatedStr", value });
    }

    public static integer(value: number): TypeLiteral {
        return new this({ type: "int", value });
    }

    public static float(value: number): TypeLiteral {
        return new this({ type: "float", value });
    }

    public static boolean(value: boolean): TypeLiteral {
        return new this({ type: "bool", value });
    }

    public static hash(entries: HashEntry[]): TypeLiteral {
        const hash = new this({ type: "hash", entries });
        return hash;
    }

    public static set(values: AstNode[]): TypeLiteral {
        const set = new this({ type: "set", values });
        return set;
    }

    public static list(values: AstNode[]): TypeLiteral {
        const list = new this({ type: "list", values });
        return list;
    }

    public static nop(): TypeLiteral {
        return new this({ type: "nop" });
    }

    public static nil(): TypeLiteral {
        return new this({ type: "nil" });
    }

    public static isNop(typeLiteral: AstNode): boolean {
        return typeLiteral instanceof TypeLiteral && typeLiteral.internalType.type === "nop";
    }

    public static isNil(typeLiteral: AstNode): boolean {
        return typeLiteral instanceof TypeLiteral && typeLiteral.internalType.type === "nil";
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "str": {
                const value = this.internalType.value.replaceAll("\r\n", "\n");
                writer.write(
                    `"${value
                        .replaceAll("\\", "\\\\")
                        .replaceAll('"', '\\"')
                        .replace(/#(?=[{$@])/g, "\\#")}"`
                );
                break;
            }
            case "interpolatedStr": {
                const value = this.internalType.value.replaceAll("\r\n", "\n");
                writer.write(`"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`);
                break;
            }
            case "int": {
                writer.write(this.internalType.value.toString());
                break;
            }
            case "float": {
                writer.write(this.internalType.value.toString());
                break;
            }
            case "bool": {
                writer.write(this.internalType.value ? "true" : "false");
                break;
            }
            case "hash": {
                const filteredEntries = this.internalType.entries.filter(
                    (entry) => !TypeLiteral.isNop(entry.key) && !TypeLiteral.isNop(entry.value)
                );
                // Dedupe by rendered key so generated hashes never contain duplicate keys.
                // Matches rubocop's Lint/DuplicateHashKey autocorrect, which drops earlier
                // occurrences and keeps the last one.
                const seenKeys = new Map<string, number>();
                filteredEntries.forEach((entry, index) => {
                    const rendered = renderKeyForDedup(entry.key);
                    if (rendered != null) {
                        seenKeys.set(rendered, index);
                    }
                });
                const entries = filteredEntries.filter((entry, index) => {
                    const rendered = renderKeyForDedup(entry.key);
                    if (rendered == null) {
                        return true;
                    }
                    return seenKeys.get(rendered) === index;
                });
                if (entries.length === 0) {
                    writer.write("{}");
                    break;
                }
                writer.write("{\n");
                entries.forEach((entry, index) => {
                    if (index > 0) {
                        writer.writeLine(",");
                    }
                    writer.indent();
                    // Always try to write as Ruby symbol if possible
                    let wroteSymbol = false;
                    if (entry.key instanceof TypeLiteral && entry.key.internalType.type === "str") {
                        const keyStr = entry.key.internalType.value;
                        // Ruby symbol rules: must be a valid identifier
                        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(keyStr)) {
                            writer.write(`${keyStr}:`);
                            wroteSymbol = true;
                        }
                    }
                    if (!wroteSymbol) {
                        entry.key.write(writer);
                        writer.write(" =>"); // Use => for non-symbol keys (e.g., integers)
                    }
                    writer.write(" ");
                    entry.value.write(writer);
                    writer.dedent();
                });
                writer.write("\n}");
                break;
            }
            case "set": {
                const values = this.internalType.values.filter((v) => !TypeLiteral.isNop(v));
                if (values.length === 0) {
                    writer.write("Set.new([])");
                    break;
                }
                writer.write("Set.new([");
                values.forEach((value, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    value.write(writer);
                });
                writer.write("])");
                break;
            }
            case "list": {
                const values = this.internalType.values.filter((v) => !TypeLiteral.isNop(v));
                if (values.length === 0) {
                    writer.write("[]");
                    break;
                }
                // Use %w[] for arrays where every element is a simple string with no
                // spaces, backslashes, or brackets that would break the syntax.
                if (
                    values.length >= 2 &&
                    values.every(
                        (v) =>
                            v instanceof TypeLiteral &&
                            v.internalType.type === "str" &&
                            !/[\s\\[\]]/.test(v.internalType.value)
                    )
                ) {
                    const words = (values as TypeLiteral[]).map((v) => {
                        const str = v.internalType as { type: "str"; value: string };
                        return str.value;
                    });
                    writer.write(`%w[${words.join(" ")}]`);
                    break;
                }
                writer.write("[");
                values.forEach((value, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    value.write(writer);
                });
                writer.write("]");
                break;
            }
            case "nop":
                // Do not write anything for nop
                break;
            case "nil":
                writer.write("nil");
                break;
            default:
                assertNever(this.internalType);
        }
    }
}

/**
 * Returns a stable string representation of a hash key for deduplication, or
 * undefined if the key is too dynamic to compare safely (i.e. an arbitrary
 * AstNode rather than a literal). Dynamic keys are never considered duplicates
 * of each other since we can't know at emit time whether they resolve to the
 * same Ruby value.
 */
function renderKeyForDedup(key: AstNode): string | undefined {
    if (!(key instanceof TypeLiteral)) {
        return undefined;
    }
    return key.getDedupKey();
}

export { Type };
