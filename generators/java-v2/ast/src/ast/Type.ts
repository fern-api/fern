import { assertNever } from "@fern-api/core-utils";

import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

type InternalType =
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
    | UUID;

interface BigInteger {
    type: "bigInteger";
}

interface Boolean_ {
    type: "boolean";
}

interface Bytes {
    type: "bytes";
}

interface Float {
    type: "float";
}

interface Date {
    type: "date";
}

interface DateTime {
    type: "dateTime";
}

interface Double {
    type: "double";
}

interface Integer {
    type: "integer";
}

interface List {
    type: "list";
    value: Type;
}

interface Long {
    type: "long";
}

interface Map {
    type: "map";
    keyType: Type;
    valueType: Type;
}

interface Optional {
    type: "optional";
    value: Type;
}

interface Reference {
    type: "reference";
    value: ClassReference;
}

interface Set {
    type: "set";
    value: Type;
}

interface String_ {
    type: "string";
}

interface UUID {
    type: "uuid";
}

export class Type extends AstNode {
    private constructor(public readonly internalType: InternalType) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "bigInteger":
                writer.writeNode(BigIntegerClassReference);
                break;
            case "boolean":
                writer.write("Boolean");
                break;
            case "bytes":
                writer.write("byte[]");
                break;
            case "float":
                writer.write("Float");
                break;
            case "date":
                writer.write("String");
                break;
            case "dateTime":
                writer.writeNode(OffsetDateTimeClassReference);
                break;
            case "double":
                writer.write("Double");
                break;
            case "integer":
                writer.write("Integer");
                break;
            case "list": {
                this.writeList({ writer, list: this.internalType });
                break;
            }
            case "long": {
                writer.write("Long");
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
                writer.writeNode(UUIDClassReference);
                break;
            default:
                assertNever(this.internalType);
        }
    }

    public isOptional(): boolean {
        return this.internalType.type === "optional";
    }

    /* Static factory methods for creating a Type */
    public static bigInteger(): Type {
        return new this({
            type: "bigInteger"
        });
    }

    public static boolean(): Type {
        return new this({
            type: "boolean"
        });
    }

    public static bytes(): Type {
        return new this({
            type: "bytes"
        });
    }

    public static date(): Type {
        return new this({
            type: "date"
        });
    }

    public static dateTime(): Type {
        return new this({
            type: "dateTime"
        });
    }

    public static double(): Type {
        return new this({
            type: "double"
        });
    }

    public static float(): Type {
        return new this({
            type: "float"
        });
    }

    public static integer(): Type {
        return new this({
            type: "integer"
        });
    }

    public static list(value: Type): Type {
        return new this({
            type: "list",
            value
        });
    }

    public static long(): Type {
        return new this({
            type: "long"
        });
    }

    public static map(keyType: Type, valueType: Type): Type {
        return new this({
            type: "map",
            keyType,
            valueType
        });
    }

    public static optional(value: Type): Type {
        // Avoids double optional.
        if (this.isAlreadyOptional(value)) {
            return value;
        }
        return new this({
            type: "optional",
            value
        });
    }

    public static reference(value: ClassReference): Type {
        return new this({
            type: "reference",
            value
        });
    }

    public static set(value: Type): Type {
        return new this({
            type: "set",
            value
        });
    }

    public static string(): Type {
        return new this({
            type: "string"
        });
    }

    public static uuid(): Type {
        return new this({
            type: "uuid"
        });
    }

    private writeList({ writer, list }: { writer: Writer; list: List }): void {
        writer.writeNode(ListClassReference);
        writer.write("<");
        list.value.write(writer);
        writer.write(">");
    }

    private writeMap({ writer, map }: { writer: Writer; map: Map }): void {
        writer.writeNode(MapClassReference);
        writer.write("<");
        map.keyType.write(writer);
        writer.write(", ");
        map.valueType.write(writer);
        writer.write(">");
    }

    private writeOptional({ writer, optional }: { writer: Writer; optional: Optional }): void {
        writer.writeNode(OptionalClassReference);
        writer.write("<");
        optional.value.write(writer);
        writer.write(">");
    }

    private writeSet({ writer, set }: { writer: Writer; set: Set }): void {
        writer.writeNode(SetClassReference);
        writer.write("<");
        set.value.write(writer);
        writer.write(">");
    }

    private static isAlreadyOptional(value: Type) {
        return value.internalType.type === "optional";
    }
}

export const ArraysClassReference = new ClassReference({
    name: "Arrays",
    packageName: "java.util"
});

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

export const OptionalClassReference = new ClassReference({
    name: "Optional",
    packageName: "java.util"
});

export const SetClassReference = new ClassReference({
    name: "Set",
    packageName: "java.util"
});

export const UUIDClassReference = new ClassReference({
    name: "UUID",
    packageName: "java.util"
});
