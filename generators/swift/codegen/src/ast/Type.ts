import { assertNever } from "@fern-api/core-utils";
import { camelCase, lowerFirst, upperFirst } from "lodash-es";

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

type Data = {
    type: "data";
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

/**
 * An existential type that represents any type conforming to a protocol.
 * Maps to Swift's `any Protocol` syntax.
 */
type ExistentialAny = {
    type: "existential-any";
    protocolName: string;
};

/**
 * Represents our custom `JSONValue` type.
 */
type JsonValue = {
    type: "json-value";
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
    | Data
    | Date_
    | UUID
    | Tuple
    | Array_
    | Dictionary
    | Optional
    | Custom
    | Void
    | Any
    | ExistentialAny
    | JsonValue;

export class Type extends AstNode {
    private internalType: InternalType;

    private constructor(internalType: InternalType) {
        super();
        this.internalType = internalType;
    }

    public get type(): InternalType["type"] {
        return this.internalType.type;
    }

    /**
     * This is the type of the value, without any optional wrapping.
     */
    public get unwrappedType(): Exclude<InternalType["type"], "optional"> {
        return this.internalType.type === "optional"
            ? this.internalType.valueType.unwrappedType
            : this.internalType.type;
    }

    public get isOptional(): boolean {
        return this.internalType.type === "optional";
    }

    public equals(other: Type): boolean {
        switch (this.internalType.type) {
            case "string":
            case "bool":
            case "int":
            case "uint":
            case "uint64":
            case "int64":
            case "float":
            case "double":
            case "data":
            case "date":
            case "uuid":
            case "void":
            case "any":
            case "json-value":
                return this.internalType.type === other.internalType.type;
            case "tuple": {
                if (
                    other.internalType.type !== "tuple" ||
                    this.internalType.elements.length !== other.internalType.elements.length
                ) {
                    return false;
                }
                for (let i = 0; i < this.internalType.elements.length; i++) {
                    const thisElement = this.internalType.elements[i];
                    const otherElement = other.internalType.elements[i];
                    if (!thisElement || !otherElement || !thisElement.equals(otherElement)) {
                        return false;
                    }
                }
                return true;
            }
            case "array":
                return (
                    other.internalType.type === "array" &&
                    this.internalType.elementType.equals(other.internalType.elementType)
                );
            case "dictionary":
                return (
                    other.internalType.type === "dictionary" &&
                    this.internalType.keyType.equals(other.internalType.keyType) &&
                    this.internalType.valueType.equals(other.internalType.valueType)
                );
            case "optional":
                return (
                    other.internalType.type == "optional" &&
                    this.internalType.valueType.equals(other.internalType.valueType)
                );
            case "custom":
                return other.internalType.type === "custom" && this.internalType.name === other.internalType.name;
            case "existential-any":
                return (
                    other.internalType.type === "existential-any" &&
                    this.internalType.protocolName === other.internalType.protocolName
                );
            default:
                assertNever(this.internalType);
        }
    }

    /**
     * Generates a unique, camelCase identifier suitable for use as an enum case name.
     * This method creates descriptive names that help differentiate between similar types
     * when used as associated values in Swift enums, particularly for undiscriminated unions.
     *
     * Examples:
     * - `string` → "string"
     * - `[String]` → "stringArray"
     * - `[String: Int]` → "stringToIntDictionary"
     * - `(String, Int, Bool)` → "tupleStringAndIntAndBool"
     * - `String?` → "optionalString"
     *
     * @returns A camelCase string suitable for use as a Swift enum case name
     */
    public toCaseName(): string {
        return Type.toCaseName(this);
    }

    public static toCaseName(type: Type): string {
        switch (type.internalType.type) {
            case "string":
                return "string";
            case "bool":
                return "bool";
            case "int":
                return "int";
            case "uint":
                return "uint";
            case "uint64":
                return "uint64";
            case "int64":
                return "int64";
            case "float":
                return "float";
            case "double":
                return "double";
            case "data":
                return "data";
            case "date":
                return "date";
            case "uuid":
                return "uuid";
            case "tuple": {
                const memberDescriptionsJoined = type.internalType.elements
                    .map((element) => Type.toCaseName(element))
                    .join("And");
                return `tuple${upperFirst(memberDescriptionsJoined)}`;
            }
            case "array":
                return `${lowerFirst(Type.toCaseName(type.internalType.elementType))}Array`;
            case "dictionary": {
                const keyDescription = lowerFirst(Type.toCaseName(type.internalType.keyType));
                const valueDescription = upperFirst(Type.toCaseName(type.internalType.valueType));
                return `${keyDescription}To${valueDescription}Dictionary`;
            }
            case "optional":
                return `optional${upperFirst(Type.toCaseName(type.internalType.valueType))}`;
            case "custom":
                return camelCase(type.internalType.name);
            case "void":
                return "void";
            case "any":
                return "any";
            case "existential-any":
                return `any${upperFirst(type.internalType.protocolName)}`;
            case "json-value":
                return "json";
            default:
                assertNever(type.internalType);
        }
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
            case "data":
                writer.write("Data");
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
            case "existential-any":
                writer.write("any ");
                writer.write(this.internalType.protocolName);
                break;
            case "json-value":
                writer.write("JSONValue");
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

    public static data(): Type {
        return new this({ type: "data" });
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
        return valueType.internalType.type === "optional" ? Type.required(valueType.internalType.valueType) : valueType;
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

    public static existentialAny(protocolName: string): Type {
        return new this({ type: "existential-any", protocolName });
    }

    /**
     * Represents our custom `JSONValue` type.
     */
    public static jsonValue(): Type {
        return new this({ type: "json-value" });
    }
}
