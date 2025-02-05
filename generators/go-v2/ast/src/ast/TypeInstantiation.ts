import { assertNever } from "@fern-api/core-utils";

import { CodeBlock } from "./CodeBlock";
import { FuncInvocation } from "./FuncInvocation";
import { GoTypeReference } from "./GoTypeReference";
import { MethodInvocation } from "./MethodInvocation";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

type InternalTypeInstantiation =
    | Any_
    | Bool
    | Bytes
    | Date
    | DateTime
    | Enum
    | Float64
    | Int
    | Int64
    | Map
    | Nil
    | Nop
    | Optional
    | Reference
    | Slice
    | String_
    | Struct
    | Uuid;

interface Any_ {
    type: "any";
    value: unknown;
}

interface Bool {
    type: "bool";
    value: boolean;
}

interface Bytes {
    type: "bytes";
    value: string;
}

interface Date {
    type: "date";
    value: string;
}

interface DateTime {
    type: "dateTime";
    value: string;
}

interface Enum {
    type: "enum";
    typeReference: GoTypeReference;
}

interface Float64 {
    type: "float64";
    value: number;
}

interface Int {
    type: "int";
    value: number;
}

interface Int64 {
    type: "int64";
    value: number;
}

interface Optional {
    type: "optional";
    value: TypeInstantiation;
}

interface Map {
    type: "map";
    keyType: Type;
    valueType: Type;
    entries: MapEntry[];
}

interface MapEntry {
    key: TypeInstantiation;
    value: TypeInstantiation;
}

interface Nil {
    type: "nil";
}

interface Nop {
    type: "nop";
}

interface Reference {
    type: "reference";
    value: AstNode;
}

interface Slice {
    type: "slice";
    valueType: Type;
    values: TypeInstantiation[];
}

interface Struct {
    type: "struct";
    typeReference: GoTypeReference;
    fields: StructField[];
}

export interface StructField {
    name: string;
    value: TypeInstantiation;
}

interface String_ {
    type: "string";
    value: string;
}

interface Uuid {
    type: "uuid";
    value: string;
}

const POINTER_HELPER_TYPES = new Set<string>(["bool", "date", "dateTime", "float64", "int", "int64", "string", "uuid"]);
const ADDRESSABLE_TYPES = new Set<string>(["any", "bytes", "map", "slice"]);

export class TypeInstantiation extends AstNode {
    private constructor(public readonly internalType: InternalTypeInstantiation) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "any":
                this.writeAny({ writer, value: this.internalType.value });
                break;
            case "bool":
                writer.write(this.internalType.value.toString());
                break;
            case "bytes":
                writer.write(`[]byte("${this.internalType.value}")`);
                break;
            case "date":
            case "dateTime":
                writer.writeNode(invokeMustParseDate({ writer, type: this.internalType }));
                break;
            case "enum":
                writer.writeNode(this.internalType.typeReference);
                break;
            case "float64":
                writer.write(this.internalType.value.toString());
                break;
            case "int":
            case "int64":
                writer.write(this.internalType.value.toString());
                break;
            case "map":
                this.writeMap({ writer, map: this.internalType });
                break;
            case "nil":
                writer.write("nil");
                break;
            case "nop":
                break; // no-op
            case "optional":
                this.writeOptional({ writer, type: this.internalType.value });
                break;
            case "reference":
                writer.writeNode(this.internalType.value);
                break;
            case "slice":
                this.writeSlice({ writer, slice: this.internalType });
                break;
            case "string":
                writer.write(
                    this.internalType.value.includes('"') || this.internalType.value.includes("\n")
                        ? `\`${this.internalType.value}\``
                        : `"${this.internalType.value}"`
                );
                break;
            case "struct":
                this.writeStruct({ writer, struct: this.internalType });
                break;
            case "uuid":
                writer.writeNode(invokeMustParseUUID({ value: this.internalType.value }));
                break;
            default:
                assertNever(this.internalType);
        }
    }

    /* Static factory methods for creating a TypeInstantiation */
    public static any(value: unknown): TypeInstantiation {
        return new this({
            type: "any",
            value
        });
    }

    public static bool(value: boolean): TypeInstantiation {
        return new this({
            type: "bool",
            value
        });
    }

    public static bytes(value: string): TypeInstantiation {
        return new this({
            type: "bytes",
            value
        });
    }

    public static date(value: string): TypeInstantiation {
        return new this({
            type: "date",
            value
        });
    }

    public static dateTime(value: string): TypeInstantiation {
        return new this({
            type: "dateTime",
            value
        });
    }

    public static enum(typeReference: GoTypeReference): TypeInstantiation {
        return new this({
            type: "enum",
            typeReference
        });
    }

    public static float64(value: number): TypeInstantiation {
        return new this({
            type: "float64",
            value
        });
    }

    public static int(value: number): TypeInstantiation {
        return new this({
            type: "int",
            value
        });
    }

    public static int64(value: number): TypeInstantiation {
        return new this({
            type: "int64",
            value
        });
    }

    public static map({
        keyType,
        valueType,
        entries
    }: {
        keyType: Type;
        valueType: Type;
        entries: MapEntry[];
    }): TypeInstantiation {
        return new this({
            type: "map",
            keyType,
            valueType,
            entries
        });
    }

    public static nil(): TypeInstantiation {
        return new this({
            type: "nil"
        });
    }

    public static nop(): TypeInstantiation {
        return new this({
            type: "nop"
        });
    }

    public static optional(value: TypeInstantiation): TypeInstantiation {
        if (this.isAlreadyOptional(value)) {
            // Avoids double optional.
            return value;
        }
        return new this({
            type: "optional",
            value
        });
    }

    public static reference(value: AstNode): TypeInstantiation {
        return new this({
            type: "reference",
            value
        });
    }

    public static slice({ valueType, values }: { valueType: Type; values: TypeInstantiation[] }): TypeInstantiation {
        return new this({
            type: "slice",
            valueType,
            values
        });
    }

    public static string(value: string): TypeInstantiation {
        return new this({
            type: "string",
            value
        });
    }

    public static struct({
        typeReference,
        fields
    }: {
        typeReference: GoTypeReference;
        fields: StructField[];
    }): TypeInstantiation {
        return new this({
            type: "struct",
            typeReference,
            fields
        });
    }

    public static structPointer({
        typeReference,
        fields
    }: {
        typeReference: GoTypeReference;
        fields: StructField[];
    }): TypeInstantiation {
        return new this({
            type: "optional",
            value: new this({
                type: "struct",
                typeReference,
                fields
            })
        });
    }

    public static uuid(value: string): TypeInstantiation {
        return new this({
            type: "uuid",
            value
        });
    }

    public static isNop(typeInstantiation: TypeInstantiation): boolean {
        if (typeInstantiation.internalType.type === "optional") {
            return this.isNop(typeInstantiation.internalType.value);
        }
        return typeInstantiation.internalType.type === "nop";
    }

    private writeAny({ writer, value }: { writer: Writer; value: unknown }): void {
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
                    writer.write("nil");
                    return;
                }
                if (Array.isArray(value)) {
                    this.writeAnyArray({ writer, value });
                    return;
                }
                this.writeAnyObject({ writer, value });
                return;
            default:
                throw new Error(`Internal error; unsupported unknown type: ${typeof value}`);
        }
    }

    private writeAnyArray({
        writer,
        value
    }: {
        writer: Writer;
        value: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    }): void {
        writer.write("[]interface{}");
        if (value.length === 0) {
            writer.write("{}");
            return;
        }
        writer.writeLine("{");
        writer.indent();
        for (const element of value) {
            writer.writeNode(TypeInstantiation.any(element));
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }

    private writeAnyObject({ writer, value }: { writer: Writer; value: object }): void {
        writer.write("map[string]interface{}");
        const entries = Object.entries(value);
        if (entries.length === 0) {
            writer.write("{}");
            return;
        }
        writer.writeLine("{");
        writer.indent();
        for (const [key, val] of entries) {
            writer.write(`"${key}": `);
            writer.writeNode(TypeInstantiation.any(val));
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }

    private writeMap({ writer, map }: { writer: Writer; map: Map }): void {
        writer.write("map[");
        writer.writeNode(map.keyType);
        writer.write("]");
        writer.writeNode(map.valueType);

        const entries = filterNopMapEntries({ entries: map.entries });
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

    private writeOptional({ writer, type }: { writer: Writer; type: TypeInstantiation }): void {
        if (POINTER_HELPER_TYPES.has(type.internalType.type)) {
            writer.writeNode(invokePointerHelper({ writer, type }));
            return;
        }
        if (ADDRESSABLE_TYPES.has(type.internalType.type)) {
            type.write(writer);
            return;
        }
        if (type.internalType.type === "enum") {
            writer.writeNode(
                new MethodInvocation({
                    on: type.internalType.typeReference,
                    method: "Ptr",
                    arguments_: []
                })
            );
            return;
        }
        writer.write("&");
        type.write(writer);
    }

    private static isAlreadyOptional(value: TypeInstantiation) {
        return value.internalType.type === "optional" || ADDRESSABLE_TYPES.has(value.internalType.type);
    }

    private writeSlice({ writer, slice }: { writer: Writer; slice: Slice }): void {
        writer.write("[]");
        writer.writeNode(slice.valueType);

        const values = filterNopValues({ values: slice.values });
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

    private writeStruct({ writer, struct }: { writer: Writer; struct: Struct }): void {
        writer.writeNode(struct.typeReference);

        const fields = filterNopStructFields({ fields: struct.fields });
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
}

function invokePointerHelper({ writer, type }: { writer: Writer; type: TypeInstantiation }): FuncInvocation {
    return new FuncInvocation({
        func: new GoTypeReference({
            name: getPointerHelperFuncName({ type }),
            importPath: writer.rootImportPath
        }),
        arguments_: [type]
    });
}

function getPointerHelperFuncName({ type }: { type: TypeInstantiation }): string {
    switch (type.internalType.type) {
        case "bool":
            return "Bool";
        case "date":
        case "dateTime":
            return "Time";
        case "float64":
            return "Float64";
        case "int":
            return "Int";
        case "int64":
            return "Int64";
        case "string":
            return "String";
        case "uuid":
            return "UUID";
        default:
            return "";
    }
}

function invokeMustParseDate({ writer, type }: { writer: Writer; type: Date | DateTime }): FuncInvocation {
    const funcName = type instanceof Date ? "MustParseDate" : "MustParseDateTime";
    return new FuncInvocation({
        func: new GoTypeReference({
            name: funcName,
            importPath: writer.rootImportPath
        }),
        arguments_: [new CodeBlock(`"${type.value}"`)]
    });
}

function invokeMustParseUUID({ value }: { value: string }): FuncInvocation {
    return new FuncInvocation({
        func: new GoTypeReference({
            name: "MustParse",
            importPath: "github.com/google/uuid"
        }),
        arguments_: [new CodeBlock(`"${value}"`)]
    });
}

function filterNopMapEntries({ entries }: { entries: MapEntry[] }): MapEntry[] {
    return entries.filter((entry) => !TypeInstantiation.isNop(entry.key) && !TypeInstantiation.isNop(entry.value));
}

function filterNopStructFields({ fields }: { fields: StructField[] }): StructField[] {
    return fields.filter((field) => !TypeInstantiation.isNop(field.value));
}

function filterNopValues({ values }: { values: TypeInstantiation[] }): TypeInstantiation[] {
    return values.filter((value) => !TypeInstantiation.isNop(value));
}
