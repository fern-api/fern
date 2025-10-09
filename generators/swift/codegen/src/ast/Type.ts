import { assertNever, values } from "@fern-api/core-utils";
import { camelCase, lowerFirst, upperFirst } from "lodash-es";

import { AstNode, Writer } from "./core";

const SwiftType = {
    String: {
        type: "string",
        symbolName: "String"
    },
    Bool: {
        type: "bool",
        symbolName: "Bool"
    },
    Int: {
        type: "int",
        symbolName: "Int"
    },
    Int64: {
        type: "int64",
        symbolName: "Int64"
    },
    UInt: {
        type: "uint",
        symbolName: "UInt"
    },
    UInt64: {
        type: "uint64",
        symbolName: "UInt64"
    },
    Float: {
        type: "float",
        symbolName: "Float"
    },
    Double: {
        type: "double",
        symbolName: "Double"
    },
    Void: {
        type: "void",
        symbolName: "Void"
    },
    // TODO(kafkas): Any doesn't seem to be under the Swift scope i.e. Swift.Any is not valid so we probably wanna move this.
    Any: {
        type: "any",
        symbolName: "Any"
    }
} as const;

type SwiftType = (typeof SwiftType)[keyof typeof SwiftType];

export type SwiftTypeSymbolName = SwiftType["symbolName"];

export const FoundationType = {
    Data: {
        type: "data",
        symbolName: "Data"
    },
    Date: {
        type: "date",
        symbolName: "Date"
    },
    UUID: {
        type: "uuid",
        symbolName: "UUID"
    }
} as const;

export type FoundationType = (typeof FoundationType)[keyof typeof FoundationType];

export type FoundationTypeSymbolName = FoundationType["symbolName"];

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

type Nullable = {
    type: "nullable";
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

/**
 * An existential type that represents any type conforming to a protocol.
 * Maps to Swift's `any Protocol` syntax.
 */
type ExistentialAny = {
    type: "existential-any";
    protocolName: string;
};

type CalendarDate = {
    type: "calendar-date";
};

/**
 * Represents our custom `JSONValue` type.
 */
type JsonValue = {
    type: "json-value";
};

type InternalType =
    | SwiftType
    | FoundationType
    | Tuple
    | Array_
    | Dictionary
    | Optional
    | Nullable
    | Custom
    | ExistentialAny
    | CalendarDate
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
    public get nonOptionalType(): Exclude<InternalType["type"], "optional"> {
        return this.internalType.type === "optional"
            ? this.internalType.valueType.nonOptionalType
            : this.internalType.type;
    }

    public get nonNullableType(): Exclude<InternalType["type"], "nullable"> {
        return this.internalType.type === "nullable"
            ? this.internalType.valueType.nonNullableType
            : this.internalType.type;
    }

    public get isOptional(): boolean {
        return this.internalType.type === "optional";
    }

    public get isNullable(): boolean {
        return this.internalType.type === "nullable";
    }

    public get isOptionalNullable(): boolean {
        return this.isOptional && this.nonOptional().isNullable;
    }

    public nonOptional(): Type {
        return Type.nonOptional(this);
    }

    public nonNullable(): Type {
        return Type.nonNullable(this);
    }

    public equals(that: Type): boolean {
        switch (this.internalType.type) {
            case "string":
            case "bool":
            case "int":
            case "int64":
            case "uint":
            case "uint64":
            case "float":
            case "double":
            case "void":
            case "any":
            case "data":
            case "date":
            case "uuid":
            case "json-value":
                return this.internalType.type === that.internalType.type;
            case "tuple": {
                if (
                    that.internalType.type !== "tuple" ||
                    this.internalType.elements.length !== that.internalType.elements.length
                ) {
                    return false;
                }
                for (let i = 0; i < this.internalType.elements.length; i++) {
                    const thisElement = this.internalType.elements[i];
                    const thatElement = that.internalType.elements[i];
                    if (!thisElement || !thatElement || !thisElement.equals(thatElement)) {
                        return false;
                    }
                }
                return true;
            }
            case "array":
                return (
                    that.internalType.type === "array" &&
                    this.internalType.elementType.equals(that.internalType.elementType)
                );
            case "dictionary":
                return (
                    that.internalType.type === "dictionary" &&
                    this.internalType.keyType.equals(that.internalType.keyType) &&
                    this.internalType.valueType.equals(that.internalType.valueType)
                );
            case "optional":
                return (
                    that.internalType.type == "optional" &&
                    this.internalType.valueType.equals(that.internalType.valueType)
                );
            case "nullable":
                return (
                    that.internalType.type === "nullable" &&
                    this.internalType.valueType.equals(that.internalType.valueType)
                );
            case "custom":
                return that.internalType.type === "custom" && this.internalType.name === that.internalType.name;
            case "existential-any":
                return (
                    that.internalType.type === "existential-any" &&
                    this.internalType.protocolName === that.internalType.protocolName
                );
            case "calendar-date":
                return that.internalType.type === "calendar-date";
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
            case "int64":
                return "int64";
            case "uint":
                return "uint";
            case "uint64":
                return "uint64";
            case "float":
                return "float";
            case "double":
                return "double";
            case "void":
                return "void";
            case "any":
                return "any";
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
            case "nullable":
                return `nullable${upperFirst(Type.toCaseName(type.internalType.valueType))}`;
            case "custom":
                return camelCase(type.internalType.name);
            case "existential-any":
                return `any${upperFirst(type.internalType.protocolName)}`;
            case "calendar-date":
                return "calendarDate";
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
            case "int64":
                writer.write("Int64");
                break;
            case "uint":
                writer.write("UInt");
                break;
            case "uint64":
                writer.write("UInt64");
                break;
            case "float":
                writer.write("Float");
                break;
            case "double":
                writer.write("Double");
                break;
            case "void":
                writer.write("Void");
                break;
            case "any":
                writer.write("Any");
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
            case "nullable":
                writer.write("Nullable<");
                this.internalType.valueType.write(writer);
                writer.write(">");
                break;
            case "custom":
                writer.write(this.internalType.name);
                break;
            case "existential-any":
                writer.write("any ");
                writer.write(this.internalType.protocolName);
                break;
            case "calendar-date":
                writer.write("CalendarDate");
                break;
            case "json-value":
                writer.write("JSONValue");
                break;
            default:
                assertNever(this.internalType);
        }
    }

    public static primitiveSymbolNames() {
        return values(SwiftType).map((primitive) => primitive.symbolName);
    }

    public static foundationSymbolNames(): string[] {
        return values(FoundationType).map((foundation) => foundation.symbolName);
    }

    public static string(): Type {
        return new this(SwiftType.String);
    }

    public static bool(): Type {
        return new this(SwiftType.Bool);
    }

    public static int(): Type {
        return new this(SwiftType.Int);
    }

    public static uint(): Type {
        return new this(SwiftType.UInt);
    }

    public static uint64(): Type {
        return new this(SwiftType.UInt64);
    }

    public static int64(): Type {
        return new this(SwiftType.Int64);
    }

    public static float(): Type {
        return new this(SwiftType.Float);
    }

    public static double(): Type {
        return new this(SwiftType.Double);
    }

    public static void(): Type {
        return new this(SwiftType.Void);
    }

    public static any(): Type {
        return new this(SwiftType.Any);
    }

    public static data(): Type {
        return new this(FoundationType.Data);
    }

    public static date(): Type {
        return new this(FoundationType.Date);
    }

    public static uuid(): Type {
        return new this(FoundationType.UUID);
    }

    public static tuple(elements: [Type, ...Type[]]): Type {
        return new this({ type: "tuple", elements });
    }

    public static array(elementType: Type): Type {
        return new this({ type: "array", elementType });
    }

    public static dictionary(keyType: Type, valueType: Type): Type {
        return new this({ type: "dictionary", keyType, valueType });
    }

    public static optional(valueType: Type): Type {
        if (valueType.internalType.type === "optional") {
            return valueType;
        }
        return new this({ type: "optional", valueType });
    }

    public static nullable(valueType: Type): Type {
        return new this({ type: "nullable", valueType });
    }

    public static nonOptional(valueType: Type): Type {
        return valueType.internalType.type === "optional"
            ? Type.nonOptional(valueType.internalType.valueType)
            : valueType;
    }

    public static nonNullable(valueType: Type): Type {
        return valueType.internalType.type === "nullable"
            ? Type.nonNullable(valueType.internalType.valueType)
            : valueType;
    }

    public static custom(name: string): Type {
        return new this({ type: "custom", name });
    }

    public static existentialAny(protocolName: string): Type {
        return new this({ type: "existential-any", protocolName });
    }

    public static calendarDate(): Type {
        return new this({ type: "calendar-date" });
    }

    /**
     * Represents our custom `JSONValue` type.
     */
    public static jsonValue(): Type {
        return new this({ type: "json-value" });
    }
}
