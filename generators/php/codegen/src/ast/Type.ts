import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "./core/AstNode";
import { GLOBAL_NAMESPACE, Writer } from "./core/Writer";
import { ClassReference } from "./ClassReference";

type InternalType =
    | Int
    | String_
    | Bool
    | Float
    | Date
    | DateTime
    | Mixed
    | Object_
    | Array_
    | Map
    | Optional
    | Reference;

interface Int {
    type: "int";
}

interface String_ {
    type: "string";
}

interface Bool {
    type: "bool";
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

interface Mixed {
    type: "mixed";
}

interface Object_ {
    type: "object";
}

interface Array_ {
    type: "array";
    value: Type;
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

/* A PHP parameter to a method */
export class Type extends AstNode {
    private constructor(public readonly internalType: InternalType) {
        super();
    }

    public write(writer: Writer, { parentType, comment }: { parentType?: Type; comment?: boolean } = {}): void {
        switch (this.internalType.type) {
            case "int":
                writer.write("int");
                break;
            case "string":
                writer.write("string");
                break;
            case "bool":
                writer.write("bool");
                break;
            case "float":
                writer.write("float");
                break;
            case "date":
                writer.addReference(DateTimeClassReference);
                writer.write("DateTime");
                break;
            case "dateTime":
                writer.addReference(DateTimeClassReference);
                writer.write("DateTime");
                break;
            case "mixed":
                writer.write("mixed");
                break;
            case "object":
                writer.write("object");
                break;
            case "array":
                if (!comment) {
                    writer.write("array");
                    break;
                }
                writer.write("array<");
                this.internalType.value.write(writer, { parentType: this, comment });
                writer.write(">");
                break;
            case "map": {
                if (!comment) {
                    writer.write("array");
                    break;
                }
                writer.write("array<");
                this.internalType.keyType.write(writer, { parentType: this, comment });
                writer.write(", ");
                this.internalType.valueType.write(writer, { parentType: this, comment });
                writer.write(">");
                break;
            }
            case "optional":
                if (this.needsOptionalToken({ parentType, value: this.internalType.value })) {
                    // Avoids double optional.
                    writer.write("?");
                }
                this.internalType.value.write(writer, { parentType: this, comment });
                break;
            case "reference":
                writer.writeNode(this.internalType.value);
                break;
            default:
                assertNever(this.internalType);
        }
    }

    public toOptionalIfNotAlready(): Type {
        if (this.internalType.type === "optional") {
            return this;
        }
        return Type.optional(this);
    }

    public underlyingTypeIfOptional(): Type | undefined {
        if (this.internalType.type === "optional") {
            return (this.internalType as Optional).value;
        }
        return undefined;
    }

    public isOptional(): boolean {
        return this.internalType.type === "optional";
    }

    private needsOptionalToken({ parentType, value }: { parentType: Type | undefined; value: Type }): boolean {
        return value.internalType.type !== "mixed" && parentType?.internalType?.type !== "optional";
    }

    /* Static factory methods for creating a Type */
    public static int(): Type {
        return new this({
            type: "int"
        });
    }

    public static string(): Type {
        return new this({
            type: "string"
        });
    }

    public static bool(): Type {
        return new this({
            type: "bool"
        });
    }

    public static float(): Type {
        return new this({
            type: "float"
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

    public static mixed(): Type {
        return new this({
            type: "mixed"
        });
    }

    public static object(): Type {
        return new this({
            type: "object"
        });
    }

    public static array(value: Type): Type {
        return new this({
            type: "array",
            value
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
}

export const DateTimeClassReference = new ClassReference({
    namespace: GLOBAL_NAMESPACE,
    name: "DateTime"
});
