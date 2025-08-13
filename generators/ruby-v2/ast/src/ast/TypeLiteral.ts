import { assertNever } from "@fern-api/core-utils";

import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export interface NamedValue {
    name: string;
    value: AstNode;
}

type InternalTypeLiteral = Str | Int | Float | Bool | Hash | Set_ | List_ | Nop | Nil;

interface Str {
    type: "str";
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

    public static string(value: string): TypeLiteral {
        return new this({ type: "str", value });
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
                // For now, just write the string as a Ruby string literal
                if (this.internalType.value.includes("'") || this.internalType.value.includes('#')) {
                    writer.write(`"${this.internalType.value.replaceAll('"', '\\"')}"`);
                } else {
                    writer.write(`'${this.internalType.value}'`);
                }
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
                const entries = this.internalType.entries.filter(
                    (entry) => !TypeLiteral.isNop(entry.key) && !TypeLiteral.isNop(entry.value)
                );
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
                        writer.write(":");
                    }
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

export { Type };
