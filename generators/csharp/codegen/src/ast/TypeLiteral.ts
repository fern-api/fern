import { assertNever } from "@fern-api/core-utils";

import { csharp } from "..";
import { ClassInstantiation } from "./ClassInstantiation";
import { ClassReference } from "./ClassReference";
import { AstNode, Writer } from "./core";
import { Type } from "./Type";

type InternalTypeLiteral =
    | Boolean_
    | Class_
    | Date_
    | DateTime
    | Dictionary
    | Decimal
    | Double
    | Float
    | Integer
    | List
    | Long
    | Reference
    | Set
    | String_
    | Uint
    | Ulong
    | Unknown_
    | Null_
    | Nop;

interface Boolean_ {
    type: "boolean";
    value: boolean;
}

interface Class_ {
    type: "class";
    reference: ClassReference;
    fields: ConstructorField[];
}

export interface ConstructorField {
    name: string;
    value: TypeLiteral;
}

interface Date_ {
    type: "date";
    value: string;
}

interface DateTime {
    type: "datetime";
    value: string;
}

interface Decimal {
    type: "decimal";
    value: number;
}

interface Double {
    type: "double";
    value: number;
}

interface Float {
    type: "float";
    value: number;
}

interface List {
    type: "list";
    valueType: Type;
    values: TypeLiteral[];
}

interface Dictionary {
    type: "dictionary";
    keyType: Type;
    valueType: Type;
    entries: DictionaryEntry[];
}

interface DictionaryEntry {
    key: TypeLiteral;
    value: TypeLiteral;
}

interface Integer {
    type: "integer";
    value: number;
}

interface Long {
    type: "long";
    value: number;
}

interface Uint {
    type: "uint";
    value: number;
}

interface Ulong {
    type: "ulong";
    value: number;
}

interface Reference {
    type: "reference";
    value: AstNode;
}

interface Set {
    type: "set";
    valueType: Type;
    values: TypeLiteral[];
}

interface String_ {
    type: "string";
    value: string;
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
        switch (this.internalType.type) {
            case "class": {
                this.writeClass({ writer, class_: this.internalType });
                break;
            }
            case "dictionary": {
                this.writeDictionary({ writer, dictionary: this.internalType });
                break;
            }
            case "list": {
                this.writeList({ writer, list: this.internalType });
                break;
            }
            case "set": {
                this.writeSet({ writer, set: this.internalType });
                break;
            }
            case "reference": {
                writer.writeNode(this.internalType.value);
                break;
            }
            case "date": {
                this.writeDate({ writer, value: this.internalType.value });
                break;
            }
            case "datetime": {
                this.writeDateTime({ writer, value: this.internalType.value });
                break;
            }
            case "boolean": {
                writer.write(this.internalType.value.toString());
                break;
            }
            case "integer": {
                writer.write(this.internalType.value.toString());
                break;
            }
            case "long": {
                writer.write(`${this.internalType.value}l`);
                break;
            }
            case "uint": {
                writer.write(`${this.internalType.value}u`);
                break;
            }
            case "ulong": {
                writer.write(`${this.internalType.value}ul`);
                break;
            }
            case "decimal": {
                writer.write(`${this.internalType.value}m`);
                break;
            }
            case "double": {
                writer.write(this.internalType.value.toString());
                break;
            }
            case "float": {
                writer.write(`${this.internalType.value}f`);
                break;
            }
            case "string": {
                writer.writeNode(csharp.string_({ string: this.internalType.value }));
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

    public isClass(): this is Class_ {
        return (this.internalType as Class_).type === "class";
    }

    public asClassOrThrow(): Class_ {
        if (this.isClass()) {
            return this.internalType as Class_;
        }
        throw new Error("Internal error; ts.TypeLiteral is not a class");
    }

    private writeClass({ writer, class_: class_ }: { writer: Writer; class_: Class_ }): void {
        const fields = filterNopConstructorFields({ fields: class_.fields });
        writer.writeNode(
            new ClassInstantiation({
                classReference: class_.reference,
                arguments_: fields.map((field) => ({ name: field.name, assignment: field.value })),
                multiline: true
            })
        );
    }

    private writeDate({ writer, value }: { writer: Writer; value: string }): void {
        writer.write(`DateOnly.Parse("${value}")`);
    }

    private writeDateTime({ writer, value }: { writer: Writer; value: string }): void {
        writer.write(`DateTime.Parse("${value}", null, `);
        writer.writeNode(
            new ClassReference({
                name: "DateTimeStyles",
                namespace: "System.Globalization"
            })
        );
        writer.write(".AdjustToUniversal)");
    }

    private writeList({ writer, list }: { writer: Writer; list: List }): void {
        writer.write("new List<");
        writer.writeNode(list.valueType);
        writer.write(">()");

        const values = filterNopValues({ values: list.values });
        if (values.length === 0) {
            writer.write("{}");
            return;
        }

        writer.writeLine("{");
        writer.indent();
        for (const value of values) {
            value.write(writer);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }

    private writeSet({ writer, set }: { writer: Writer; set: Set }): void {
        writer.write("new HashSet<");
        writer.writeNode(set.valueType);
        writer.write(">()");

        const values = filterNopValues({ values: set.values });
        if (values.length === 0) {
            writer.write("{}");
            return;
        }

        writer.writeLine("{");
        writer.indent();
        for (const value of values) {
            value.write(writer);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }

    private writeDictionary({ writer, dictionary }: { writer: Writer; dictionary: Dictionary }): void {
        writer.write("new Dictionary<");
        writer.writeNode(dictionary.keyType);
        writer.write(", ");
        writer.writeNode(dictionary.valueType);
        writer.write(">()");

        const entries = filterNopDictionaryEntries({ entries: dictionary.entries });
        if (entries.length === 0) {
            writer.write("{}");
            return;
        }

        writer.writeLine("{");
        writer.indent();

        for (const entry of entries) {
            writer.write("[");
            writer.writeNode(entry.key);
            writer.write("] = ");
            writer.writeNode(entry.value);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }

    /* Static factory methods for creating a TypeLiteral */
    public static class_({
        reference,
        fields
    }: {
        reference: ClassReference;
        fields: ConstructorField[];
    }): TypeLiteral {
        return new this({ type: "class", reference, fields });
    }

    public static dictionary({
        keyType,
        valueType,
        entries
    }: {
        keyType: Type;
        valueType: Type;
        entries: DictionaryEntry[];
    }): TypeLiteral {
        return new this({ type: "dictionary", keyType, valueType, entries });
    }

    public static list({ valueType, values }: { valueType: Type; values: TypeLiteral[] }): TypeLiteral {
        return new this({ type: "list", valueType, values });
    }

    public static set({ valueType, values }: { valueType: Type; values: TypeLiteral[] }): TypeLiteral {
        return new this({ type: "set", valueType, values });
    }

    public static boolean(value: boolean): TypeLiteral {
        return new this({ type: "boolean", value });
    }

    public static float(value: number): TypeLiteral {
        return new this({ type: "float", value });
    }

    public static date(value: string): TypeLiteral {
        return new this({ type: "date", value });
    }

    public static datetime(value: string): TypeLiteral {
        return new this({ type: "datetime", value });
    }

    public static decimal(value: number): TypeLiteral {
        return new this({ type: "decimal", value });
    }

    public static double(value: number): TypeLiteral {
        return new this({ type: "double", value });
    }

    public static integer(value: number): TypeLiteral {
        return new this({ type: "integer", value });
    }

    public static long(value: number): TypeLiteral {
        return new this({ type: "long", value });
    }

    public static uint(value: number): TypeLiteral {
        return new this({ type: "uint", value });
    }

    public static ulong(value: number): TypeLiteral {
        return new this({ type: "ulong", value });
    }

    public static reference(value: AstNode): TypeLiteral {
        return new this({
            type: "reference",
            value
        });
    }

    public static string(value: string): TypeLiteral {
        return new this({
            type: "string",
            value
        });
    }

    public static null(): TypeLiteral {
        return new this({ type: "null" });
    }

    public static nop(): TypeLiteral {
        return new this({ type: "nop" });
    }

    public static unknown(value: unknown): TypeLiteral {
        return new this({ type: "unknown", value });
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
                writer.writeNode(csharp.string_({ string: value }));
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
                this.writeUnknownMap({ writer, value });
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
            writer.write("new List<object>()");
            return;
        }
        writer.writeLine("new List<object>() {");
        writer.indent();
        for (const element of value) {
            writer.writeNode(TypeLiteral.unknown(element));
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }

    private writeUnknownMap({ writer, value }: { writer: Writer; value: object }): void {
        const entries = Object.entries(value);
        if (entries.length === 0) {
            writer.write("new Dictionary<string, object>()");
            return;
        }
        writer.writeLine("new Dictionary<string, object>() {");
        writer.indent();
        for (const [key, val] of entries) {
            writer.write(`["${key}"] = `);
            writer.writeNode(TypeLiteral.unknown(val));
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }
}

function filterNopConstructorFields({ fields }: { fields: ConstructorField[] }): ConstructorField[] {
    return fields.filter((field) => !TypeLiteral.isNop(field.value));
}

function filterNopDictionaryEntries({ entries }: { entries: DictionaryEntry[] }): DictionaryEntry[] {
    return entries.filter((entry) => !TypeLiteral.isNop(entry.key) && !TypeLiteral.isNop(entry.value));
}

function filterNopValues({ values }: { values: TypeLiteral[] }): TypeLiteral[] {
    return values.filter((value) => !TypeLiteral.isNop(value));
}
