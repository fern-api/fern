import { assertNever } from "@fern-api/core-utils";

import { AstNode, Writer } from "./core";

type InternalTypeLiteral =
    | Array_
    | Blob_
    | Boolean_
    | BigInt_
    | DateTime
    | Number_
    | Object_
    | Record_
    | Reference
    | Set_
    | String_
    | Tuple
    | Unknown_
    | Null_
    | Nop;

interface Array_ {
    type: "array";
    values: TypeLiteral[];
}

interface Blob_ {
    type: "blob";
    value: string;
}

interface Boolean_ {
    type: "boolean";
    value: boolean;
}

interface Number_ {
    type: "number";
    value: number;
}

interface BigInt_ {
    type: "bigint";
    value: bigint;
}

interface DateTime {
    type: "datetime";
    value: string;
}

interface Object_ {
    type: "object";
    fields: ObjectField[];
}

export interface ObjectField {
    name: string;
    value: TypeLiteral;
}

interface Record_ {
    type: "record";
    entries: RecordEntry[];
}

interface RecordEntry {
    key: TypeLiteral;
    value: TypeLiteral;
}

interface Reference {
    type: "reference";
    value: AstNode;
}

interface Set_ {
    type: "set";
    values: TypeLiteral[];
}

interface String_ {
    type: "string";
    value: string;
}

interface Tuple {
    type: "tuple";
    values: TypeLiteral[];
}

interface Unknown_ {
    type: "unknown";
    value: unknown;
}

interface Null_ {
    type: "null";
}

interface Nop {
    type: "nop";
}

export class TypeLiteral extends AstNode {
    private constructor(public readonly internalType: InternalTypeLiteral) {
        super();
    }

    public write(writer: Writer): void {
        const noSerdeLayer = !!writer.customConfig?.noSerdeLayer;
        const useBigInt = !!writer.customConfig?.useBigInt;
        switch (this.internalType.type) {
            case "array": {
                this.writeIterable({ writer, iterable: this.internalType });
                break;
            }
            case "blob": {
                if (noSerdeLayer) {
                    writer.writeNode(TypeLiteral.string(this.internalType.value));
                    return;
                }
                writer.write("new Blob([");
                writer.writeNode(TypeLiteral.string(this.internalType.value));
                writer.write("])");
                break;
            }
            case "boolean": {
                writer.write(this.internalType.value.toString());
                break;
            }
            case "bigint": {
                if (useBigInt) {
                    writer.write(`BigInt("${this.internalType.value.toString()}")`);
                    return;
                }
                writer.write(`"${this.internalType.value.toString()}"`);
                return;
            }
            case "datetime": {
                if (noSerdeLayer) {
                    writer.writeNode(TypeLiteral.string(this.internalType.value));
                    return;
                }
                writer.write("new Date(");
                writer.writeNode(TypeLiteral.string(this.internalType.value));
                writer.write(")");
                break;
            }
            case "number": {
                writer.write(this.internalType.value.toString());
                break;
            }
            case "object": {
                this.writeObject({ writer, object: this.internalType });
                break;
            }
            case "record": {
                this.writeRecord({ writer, record: this.internalType });
                break;
            }
            case "reference": {
                writer.writeNode(this.internalType.value);
                break;
            }
            case "set": {
                if (noSerdeLayer || this.isSetOfObjects()) {
                    writer.writeNode(TypeLiteral.array({ values: this.internalType.values }));
                    return;
                }
                writer.write("new Set(");
                this.writeIterable({ writer, iterable: this.internalType });
                writer.write(")");
                break;
            }
            case "string": {
                if (this.internalType.value.includes("\n")) {
                    this.writeStringWithBackticks({ writer, value: this.internalType.value });
                } else {
                    writer.write(`"${this.internalType.value.replaceAll('"', '\\"')}"`);
                }
                break;
            }
            case "tuple": {
                this.writeIterable({ writer, iterable: this.internalType });
                break;
            }
            case "unknown": {
                this.writeUnknown({ writer, value: this.internalType.value });
                break;
            }
            case "null": {
                writer.write("null");
                break;
            }
            case "nop":
                break;
            default:
                assertNever(this.internalType);
        }
    }

    public isObject(): this is Object_ {
        return (this.internalType as Object_).type === "object";
    }

    public asObjectOrThrow(): Object_ {
        if (this.isObject()) {
            return this.internalType as Object_;
        }
        throw new Error("Internal error; ts.TypeLiteral is not an object");
    }

    private isSet(): this is Set_ {
        return (this.internalType as Set_).type === "set";
    }

    private asSetOrThrow(): Set_ {
        if (this.isSet()) {
            return this.internalType as Set_;
        }
        throw new Error("Internal error; ts.TypeLiteral is not a set");
    }

    private isSetOfObjects(): boolean {
        return this.isSet() && this.asSetOrThrow().values.every((value) => value.isObject());
    }

    private writeStringWithBackticks({ writer, value }: { writer: Writer; value: string }): void {
        writer.write("`");
        const parts = value.split("\n");
        const head = parts[0] + "\n";
        const tail = parts.slice(1).join("\n");
        writer.write(head.replaceAll("`", "\\`"));
        writer.writeNoIndent(tail.replaceAll("`", "\\`"));
        writer.write("`");
    }

    private writeIterable({ writer, iterable }: { writer: Writer; iterable: Array_ | Tuple | Set_ }): void {
        const values = filterNopValues({ values: iterable.values });
        if (values.length === 0) {
            writer.write("[]");
            return;
        }

        writer.writeLine("[");
        writer.indent();
        for (const value of values) {
            value.write(writer);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("]");
    }

    private writeRecord({ writer, record }: { writer: Writer; record: Record_ }): void {
        const entries = filterNopRecordEntries({ entries: record.entries });
        if (entries.length === 0) {
            writer.write("{}");
            return;
        }

        writer.writeLine("{");
        writer.indent();
        for (const entry of entries) {
            entry.key.write(writer);
            writer.write(": ");
            entry.value.write(writer);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }

    private writeObject({ writer, object }: { writer: Writer; object: Object_ }): void {
        const fields = filterNopObjectFields({ fields: object.fields });
        if (fields.length === 0) {
            writer.write("{}");
            return;
        }

        writer.writeLine("{");
        writer.indent();
        for (const field of fields) {
            writer.write(`${field.name}: `);
            field.value.write(writer);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }

    /* Static factory methods for creating a TypeLiteral */
    public static array({ values }: { values: TypeLiteral[] }): TypeLiteral {
        return new this({
            type: "array",
            values
        });
    }

    public static bigint(value: bigint): TypeLiteral {
        return new this({ type: "bigint", value });
    }

    public static blob(value: string): TypeLiteral {
        return new this({ type: "blob", value });
    }

    public static boolean(value: boolean): TypeLiteral {
        return new this({ type: "boolean", value });
    }

    public static datetime(value: string): TypeLiteral {
        return new this({ type: "datetime", value });
    }

    public static number(value: number): TypeLiteral {
        return new this({ type: "number", value });
    }

    public static object({ fields }: { fields: ObjectField[] }): TypeLiteral {
        return new this({
            type: "object",
            fields
        });
    }

    public static record({ entries }: { entries: RecordEntry[] }): TypeLiteral {
        return new this({
            type: "record",
            entries
        });
    }

    public static reference(value: AstNode): TypeLiteral {
        return new this({
            type: "reference",
            value
        });
    }

    public static set({ values }: { values: TypeLiteral[] }): TypeLiteral {
        return new this({
            type: "set",
            values
        });
    }

    public static string(value: string): TypeLiteral {
        return new this({
            type: "string",
            value
        });
    }

    public static tuple({ values }: { values: TypeLiteral[] }): TypeLiteral {
        return new this({
            type: "tuple",
            values
        });
    }

    public static unknown(value: unknown): TypeLiteral {
        return new this({ type: "unknown", value });
    }

    public static null(): TypeLiteral {
        return new this({ type: "null" });
    }

    public static nop(): TypeLiteral {
        return new this({ type: "nop" });
    }

    public static isNop(typeLiteral: TypeLiteral): boolean {
        return typeLiteral.internalType.type === "nop";
    }

    private writeUnknown({ writer, value }: { writer: Writer; value: unknown }): void {
        switch (typeof value) {
            case "boolean":
                writer.write(value.toString());
                return;
            case "string":
                writer.write(value.includes('"') ? `\`${value}\`` : `"${value}"`);
                return;
            case "number":
                writer.write(value.toString());
                return;
            case "object":
                if (value == null) {
                    writer.write("null");
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
            writer.writeNode(TypeLiteral.unknown(element));
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
            writer.write(`${key}: `);
            writer.writeNode(TypeLiteral.unknown(val));
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }
}

function filterNopObjectFields({ fields }: { fields: ObjectField[] }): ObjectField[] {
    return fields.filter((field) => !TypeLiteral.isNop(field.value));
}

function filterNopRecordEntries({ entries }: { entries: RecordEntry[] }): RecordEntry[] {
    return entries.filter((entry) => !TypeLiteral.isNop(entry.key) && !TypeLiteral.isNop(entry.value));
}

function filterNopValues({ values }: { values: TypeLiteral[] }): TypeLiteral[] {
    return values.filter((value) => !TypeLiteral.isNop(value));
}
