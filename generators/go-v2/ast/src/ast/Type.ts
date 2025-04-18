import { assertNever } from "@fern-api/core-utils";

import { GoTypeReference } from "./GoTypeReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

type InternalType =
    | Any_
    | Bool
    | Bytes
    | Float64
    | Date
    | DateTime
    | Int
    | Int64
    | Map
    | Optional
    | Reference
    | Slice
    | String_
    | Uuid;

interface Any_ {
    type: "any";
}

interface Bool {
    type: "bool";
}

interface Bytes {
    type: "bytes";
}

interface Float64 {
    type: "float64";
}

interface Date {
    type: "date";
}

interface DateTime {
    type: "dateTime";
}

interface Int {
    type: "int";
}

interface Int64 {
    type: "int64";
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
    value: GoTypeReference;
}

interface Slice {
    type: "slice";
    value: Type;
}

interface String_ {
    type: "string";
}

interface Uuid {
    type: "uuid";
}

const NILABLE_TYPES = new Set<string>(["any", "bytes", "map", "slice"]);

export class Type extends AstNode {
    private constructor(public readonly internalType: InternalType) {
        super();
    }

    public write(writer: Writer, { comment }: { comment?: boolean } = {}): void {
        switch (this.internalType.type) {
            case "any":
                writer.write("interface{}");
                break;
            case "bool":
                writer.write("bool");
                break;
            case "bytes":
                writer.write("[]byte");
                break;
            case "date":
            case "dateTime":
                writer.writeNode(TimeTypeReference);
                break;
            case "float64":
                writer.write("float64");
                break;
            case "int":
                writer.write("int");
                break;
            case "int64":
                writer.write("int64");
                break;
            case "map": {
                writer.write("map[");
                this.internalType.keyType.write(writer);
                writer.write("]");
                this.internalType.valueType.write(writer);
                break;
            }
            case "optional": {
                writer.write("*");
                this.internalType.value.write(writer);
                break;
            }
            case "reference":
                writer.writeNode(this.internalType.value);
                break;
            case "slice":
                writer.write("[]");
                this.internalType.value.write(writer);
                break;
            case "string":
                writer.write("string");
                break;
            case "uuid":
                writer.writeNode(UuidTypeReference);
                break;
            default:
                assertNever(this.internalType);
        }
    }

    public isOptional(): boolean {
        return this.internalType.type === "optional";
    }

    /* Static factory methods for creating a Type */
    public static any(): Type {
        return new this({
            type: "any"
        });
    }

    public static bool(): Type {
        return new this({
            type: "bool"
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

    public static float64(): Type {
        return new this({
            type: "float64"
        });
    }

    public static int(): Type {
        return new this({
            type: "int"
        });
    }

    public static int64(): Type {
        return new this({
            type: "int64"
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

    public static pointer(value: Type): Type {
        // Specifying a pointer is equivalent to defining an optional.
        return Type.optional(value);
    }

    public static reference(value: GoTypeReference): Type {
        return new this({
            type: "reference",
            value
        });
    }

    public static slice(value: Type): Type {
        return new this({
            type: "slice",
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

    private static isAlreadyOptional(value: Type) {
        return value.internalType.type === "optional" || NILABLE_TYPES.has(value.internalType.type);
    }
}

export const TimeTypeReference = new GoTypeReference({
    importPath: "time",
    name: "Time"
});

export const UuidTypeReference = new GoTypeReference({
    importPath: "github.com/google/uuid",
    name: "UUID"
});
