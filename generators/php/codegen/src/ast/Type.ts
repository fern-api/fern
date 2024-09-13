import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

type InternalType = Int | String_ | Bool | Float | Mixed | Object_ | Array_ | Map | Optional;

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

/* A PHP parameter to a method */
export class Type extends AstNode {
    private constructor(public readonly internalType: InternalType) {
        super();
    }

    public write(writer: Writer, parentType: Type | undefined = undefined): void {
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
            case "mixed":
                writer.write("mixed");
                break;
            case "object":
                writer.write("object");
                break;
            case "array":
                // TODO: Support non-doc format.
                writer.write("array<");
                this.internalType.value.write(writer);
                writer.write(">");
                break;
            case "map": {
                // TODO: Support non-doc format.
                writer.write("array<");
                this.internalType.keyType.write(writer);
                writer.write(", ");
                this.internalType.valueType.write(writer);
                writer.write(">");
                break;
            }
            case "optional":
                if (this.needsOptionalToken({ parentType, value: this.internalType.value })) {
                    // Avoids double optional.
                    writer.write("?");
                }
                this.internalType.value.write(writer, this);
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
}
