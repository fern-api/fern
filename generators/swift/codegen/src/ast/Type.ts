import { assertNever } from "@fern-api/core-utils";

import { AstNode, Writer } from "./core";

type String_ = {
    type: "string";
};

type Bool = {
    type: "bool";
};

type Int = {
    type: "int";
};

type UInt = {
    type: "uint";
};

type UInt64 = {
    type: "uint64";
};

type Int64 = {
    type: "int64";
};

type Float = {
    type: "float";
};

type Double = {
    type: "double";
};

type Date_ = {
    type: "date";
};

type UUID = {
    type: "uuid";
};

type Tuple = {
    type: "tuple";
    elements: [Type, ...Type[]];
};

type Array_ = {
    type: "array";
    elementType: Type;
};

type Dictionary = {
    type: "dictionary";
    keyType: Type;
    valueType: Type;
};

type Optional = {
    type: "optional";
    valueType: Type;
};

/**
 * A reference to a custom type.
 */
type Custom = {
    type: "custom";
    /** The name of the custom type. */
    name: string;
};

type Void = {
    type: "void";
};

type Any = {
    type: "any";
};

type InternalType =
    | String_
    | Bool
    | Int
    | UInt
    | UInt64
    | Int64
    | Float
    | Double
    | Date_
    | UUID
    | Tuple
    | Array_
    | Dictionary
    | Optional
    | Custom
    | Void
    | Any;

export class Type extends AstNode {
    private internalType: InternalType;

    private constructor(internalType: InternalType) {
        super();
        this.internalType = internalType;
    }

    public get type(): InternalType["type"] {
        return this.internalType.type;
    }

    public get isOptional(): boolean {
        return this.internalType.type === "optional";
    }

    public get isCustom(): boolean {
        return this.internalType.type === "custom";
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "string":
                writer.write("String");
                break;
            case "bool":
                writer.write("Bool");
                break;
            case "int":
                writer.write("Int");
                break;
            case "uint":
                writer.write("UInt");
                break;
            case "uint64":
                writer.write("UInt64");
                break;
            case "int64":
                writer.write("Int64");
                break;
            case "float":
                writer.write("Float");
                break;
            case "double":
                writer.write("Double");
                break;
            case "date":
                writer.write("Date");
                break;
            case "uuid":
                writer.write("UUID");
                break;
            case "tuple":
                writer.write("(");
                this.internalType.elements.forEach((elementType, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    elementType.write(writer);
                });
                writer.write(")");
                break;
            case "array":
                writer.write("[");
                this.internalType.elementType.write(writer);
                writer.write("]");
                break;
            case "dictionary":
                writer.write("[");
                this.internalType.keyType.write(writer);
                writer.write(": ");
                this.internalType.valueType.write(writer);
                writer.write("]");
                break;
            case "optional":
                this.internalType.valueType.write(writer);
                writer.write("?");
                break;
            case "custom":
                writer.write(this.internalType.name);
                break;
            case "void":
                writer.write("Void");
                break;
            case "any":
                writer.write("Any");
                break;
            default:
                assertNever(this.internalType);
        }
    }

    public static string(): Type {
        return new this({ type: "string" });
    }

    public static bool(): Type {
        return new this({ type: "bool" });
    }

    public static int(): Type {
        return new this({ type: "int" });
    }

    public static uint(): Type {
        return new this({ type: "uint" });
    }

    public static uint64(): Type {
        return new this({ type: "uint64" });
    }

    public static int64(): Type {
        return new this({ type: "int64" });
    }

    public static float(): Type {
        return new this({ type: "float" });
    }

    public static double(): Type {
        return new this({ type: "double" });
    }

    public static date(): Type {
        return new this({ type: "date" });
    }

    public static uuid(): Type {
        return new this({ type: "uuid" });
    }

    public static tuple(elements: [Type, ...Type[]]): Type {
        return new this({ type: "tuple", elements });
    }

    public static array(elementType: Type): Type {
        return new this({ type: "array", elementType });
    }

    public static dictionary(keyType: Type, valueType: Type): Type {
        // TODO(kafkas): keyType needs to conform to Hashable. We may want to enforce this as a constraint.
        return new this({ type: "dictionary", keyType, valueType });
    }

    public static optional(valueType: Type): Type {
        return new this({ type: "optional", valueType });
    }

    public static required(valueType: Type): Type {
        return valueType.internalType.type === "optional" ? valueType.internalType.valueType : valueType;
    }

    public static custom(name: string): Type {
        return new this({ type: "custom", name });
    }

    public static void(): Type {
        return new this({ type: "void" });
    }

    public static any(): Type {
        return new this({ type: "any" });
    }
}
