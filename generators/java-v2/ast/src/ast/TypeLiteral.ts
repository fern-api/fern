import { assertNever } from "@fern-api/core-utils";

import { java } from "..";
import { ClassReference } from "./ClassReference";
import { ArraysClassReference, OptionalClassReference, Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

type InternalTypeLiteral =
    | BigInteger
    | Boolean_
    | Bytes
    | Date
    | DateTime
    | Double
    | Float
    | Integer
    | List
    | Long
    | Map
    | Optional
    | Reference
    | Set
    | String_
    | UUID
    | Nop;

interface BigInteger {
    type: "bigInteger";
    value: string;
}

interface Boolean_ {
    type: "boolean";
    value: boolean;
}

interface Bytes {
    type: "bytes";
    value: string;
}

interface Float {
    type: "float";
    value: number;
}

interface Date {
    type: "date";
    value: string;
}

interface DateTime {
    type: "dateTime";
    value: string;
}

interface Double {
    type: "double";
    value: number;
}

interface Integer {
    type: "integer";
    value: number;
}

interface List {
    type: "list";
    valueType: Type;
    values: TypeLiteral[];
}

interface Long {
    type: "long";
    value: number;
}

interface Map {
    type: "map";
    keyType: Type;
    valueType: Type;
    entries: MapEntry[];
}

interface MapEntry {
    key: TypeLiteral;
    value: TypeLiteral;
}

interface Optional {
    type: "optional";
    value: TypeLiteral;
}

interface Reference {
    type: "reference";
    value: ClassReference;
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

interface UUID {
    type: "uuid";
    value: string;
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
            case "bigInteger":
                this.writeBigInteger({ writer, bigInteger: this.internalType });
                break;
            case "boolean":
                writer.write(this.internalType.value.toString());
                break;
            case "bytes":
                writer.write(`"${this.internalType.value}".getBytes()`);
                break;
            case "float":
                writer.write(`${this.internalType.value}f`);
                break;
            case "date":
                writer.write(`"${this.internalType.value}"`);
                break;
            case "dateTime":
                this.writeDateTime({ writer, dateTime: this.internalType });
                break;
            case "double":
                writer.write(this.internalType.value.toString());
                break;
            case "integer":
                writer.write(this.internalType.value.toString());
                break;
            case "list": {
                this.writeList({ writer, list: this.internalType });
                break;
            }
            case "long": {
                writer.write(`${this.internalType.value}L`);
                break;
            }
            case "map": {
                this.writeMap({ writer, map: this.internalType });
                break;
            }
            case "optional": {
                this.writeOptional({ writer, optional: this.internalType });
                break;
            }
            case "reference":
                writer.writeNode(this.internalType.value);
                break;
            case "set": {
                this.writeSet({ writer, set: this.internalType });
                break;
            }
            case "string":
                writer.write("String");
                break;
            case "uuid":
                this.writeUUID({ writer, uuid: this.internalType });
                break;
            case "nop":
                break;
            default:
                assertNever(this.internalType);
        }
    }

    public isOptional(): boolean {
        return this.internalType.type === "optional";
    }

    /* Static factory methods for creating a Type */
    public static bigInteger(value: string): TypeLiteral {
        return new this({
            type: "bigInteger",
            value
        });
    }

    public static boolean(value: boolean): TypeLiteral {
        return new this({
            type: "boolean",
            value
        });
    }

    public static bytes(value: string): TypeLiteral {
        return new this({
            type: "bytes",
            value
        });
    }

    public static date(value: string): TypeLiteral {
        return new this({
            type: "date",
            value
        });
    }

    public static dateTime(value: string): TypeLiteral {
        return new this({
            type: "dateTime",
            value
        });
    }

    public static double(value: number): TypeLiteral {
        return new this({
            type: "double",
            value
        });
    }

    public static float(value: number): TypeLiteral {
        return new this({
            type: "float",
            value
        });
    }

    public static integer(value: number): TypeLiteral {
        return new this({
            type: "integer",
            value
        });
    }

    public static list({ valueType, values }: { valueType: Type; values: TypeLiteral[] }): TypeLiteral {
        return new this({
            type: "list",
            valueType,
            values
        });
    }

    public static long(value: number): TypeLiteral {
        return new this({
            type: "long",
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
    }): TypeLiteral {
        return new this({
            type: "map",
            keyType,
            valueType,
            entries
        });
    }

    public static optional(value: TypeLiteral): TypeLiteral {
        // Avoids double optional.
        if (this.isAlreadyOptional(value)) {
            return value;
        }
        return new this({
            type: "optional",
            value
        });
    }

    public static reference(value: ClassReference): TypeLiteral {
        return new this({
            type: "reference",
            value
        });
    }

    public static set({ valueType, values }: { valueType: Type; values: TypeLiteral[] }): TypeLiteral {
        return new this({
            type: "set",
            valueType,
            values
        });
    }

    public static string(value: string): TypeLiteral {
        return new this({
            type: "string",
            value
        });
    }

    public static uuid(value: string): TypeLiteral {
        return new this({
            type: "uuid",
            value
        });
    }

    public static nop(): TypeLiteral {
        return new this({
            type: "nop"
        });
    }

    private writeBigInteger({ writer, bigInteger }: { writer: Writer; bigInteger: BigInteger }): void {
        writer.writeNode(
            java.instantiateClass({
                classReference: BigIntegerClassReference,
                arguments_: [TypeLiteral.string(bigInteger.value)]
            })
        );
    }

    private writeDateTime({ writer, dateTime }: { writer: Writer; dateTime: DateTime }): void {
        writer.writeNode(
            java.invokeMethod({
                on: OffsetDateTimeClassReference,
                method: "parse",
                arguments_: [TypeLiteral.string(dateTime.value)]
            })
        );
    }

    private writeList({ writer, list }: { writer: Writer; list: List }): void {
        this.writeIterable({ writer, iterable: list });
    }

    private writeMap({ writer, map }: { writer: Writer; map: Map }): void {
        const entries = filterNopMapEntries({ entries: map.entries });
        if (entries.length === 0) {
            writer.write("new HashMap<");
            writer.writeNode(map.keyType);
            writer.write(", ");
            writer.writeNode(map.valueType);
            writer.write(">()");
            return;
        }

        writer.writeLine("new HashMap<");
        writer.writeNode(map.keyType);
        writer.write(", ");
        writer.writeNode(map.valueType);
        writer.writeLine(">() {{");
        writer.indent();
        for (const entry of entries) {
            writer.writeLine('put("');
            writer.writeNode(entry.key);
            writer.writeLine('", ');
            writer.writeNode(entry.value);
            writer.writeLine(");");
        }
        writer.dedent();
        writer.write("}}");
    }

    private writeOptional({ writer, optional }: { writer: Writer; optional: Optional }): void {
        writer.writeNode(
            java.invokeMethod({
                on: OptionalClassReference,
                method: "of",
                arguments_: [optional.value]
            })
        );
    }

    private writeSet({ writer, set }: { writer: Writer; set: Set }): void {
        this.writeIterable({ writer, iterable: set });
    }

    private writeIterable({ writer, iterable }: { writer: Writer; iterable: List | Set }): void {
        const typeName = iterable.type === "list" ? "ArrayList" : "HashSet";
        const values = filterNopValues({ values: iterable.values });
        if (values.length === 0) {
            writer.write(`new ${typeName}<`);
            writer.writeNode(iterable.valueType);
            writer.write(">()");
            return;
        }

        writer.writeLine(`new ${typeName}<`);
        writer.writeNode(iterable.valueType);
        writer.writeLine(">(");
        writer.indent();
        writer.writeNode(
            java.instantiateClass({
                classReference: ArraysClassReference,
                arguments_: values
            })
        );
        writer.dedent();
        writer.write(")");
    }

    private writeUUID({ writer, uuid }: { writer: Writer; uuid: UUID }): void {
        writer.writeNode(
            java.invokeMethod({
                on: UUIDClassReference,
                method: "fromString",
                arguments_: [TypeLiteral.string(uuid.value)]
            })
        );
    }

    public static isNop(typeLiteral: TypeLiteral): boolean {
        return typeLiteral.internalType.type === "nop";
    }

    private static isAlreadyOptional(value: TypeLiteral) {
        return value.internalType.type === "optional";
    }
}

export const BigIntegerClassReference = new ClassReference({
    name: "BigInteger",
    packageName: "java.math"
});

export const HashMapClassReference = new ClassReference({
    name: "HashMap",
    packageName: "java.util"
});

export const ListClassReference = new ClassReference({
    name: "List",
    packageName: "java.util"
});

export const MapClassReference = new ClassReference({
    name: "Map",
    packageName: "java.util"
});

export const OffsetDateTimeClassReference = new ClassReference({
    name: "OffsetDateTime",
    packageName: "java.time"
});

export const SetClassReference = new ClassReference({
    name: "Set",
    packageName: "java.util"
});

export const UUIDClassReference = new ClassReference({
    name: "UUID",
    packageName: "java.util"
});

function filterNopMapEntries({ entries }: { entries: MapEntry[] }): MapEntry[] {
    return entries.filter((entry) => !TypeLiteral.isNop(entry.key) && !TypeLiteral.isNop(entry.value));
}

function filterNopValues({ values }: { values: TypeLiteral[] }): TypeLiteral[] {
    return values.filter((value) => !TypeLiteral.isNop(value));
}
