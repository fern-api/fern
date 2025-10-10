import { assertNever } from "@fern-api/core-utils";
import { FoundationTypeSymbolName, SwiftTypeSymbolName } from "../symbol";
import { AstNode, Writer } from "./core";

type Symbol = {
    type: "symbol";
    symbol: string;
};

type Generic = {
    type: "generic";
    reference: TypeReference;
    arguments: TypeReference[];
};

type Tuple = {
    type: "tuple";
    elements: [TypeReference, ...TypeReference[]];
};

type Array_ = {
    type: "array";
    elementType: TypeReference;
};

type Dictionary = {
    type: "dictionary";
    keyType: TypeReference;
    valueType: TypeReference;
};

type Optional = {
    type: "optional";
    valueType: TypeReference;
};

type Nullable = {
    type: "nullable";
    valueType: TypeReference;
};

type MemberAccess = {
    type: "member-access";
    target: TypeReference;
    memberName: string;
};

type TypeReferenceVariant = Symbol | Generic | Tuple | Array_ | Dictionary | Optional | Nullable | MemberAccess;

export class TypeReference extends AstNode {
    public readonly variant: TypeReferenceVariant;

    private constructor(variant: TypeReferenceVariant) {
        super();
        this.variant = variant;
    }

    public get isOptional(): boolean {
        return this.variant.type === "optional";
    }

    public get isNullable(): boolean {
        return this.variant.type === "nullable";
    }

    public get isOptionalNullable(): boolean {
        return this.isOptional && this.nonOptional().isNullable;
    }

    public nonOptional(): TypeReference {
        return TypeReference.nonOptional(this);
    }

    public nonNullable(): TypeReference {
        return TypeReference.nonNullable(this);
    }

    public getReferenceIfSymbolType(): string | null {
        return this.variant.type === "symbol" ? this.variant.symbol : null;
    }

    public write(writer: Writer): void {
        const { variant } = this;

        switch (variant.type) {
            case "symbol":
                writer.write(variant.symbol);
                break;
            case "generic": {
                variant.reference.write(writer);
                if (variant.arguments.length > 0) {
                    writer.write("<");
                    variant.arguments.forEach((arg, index) => {
                        arg.write(writer);
                        if (index < variant.arguments.length - 1) {
                            writer.write(", ");
                        }
                    });
                    writer.write(">");
                }
                break;
            }
            case "tuple":
                writer.write("(");
                variant.elements.forEach((elementType, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    elementType.write(writer);
                });
                writer.write(")");
                break;
            case "array":
                writer.write("[");
                variant.elementType.write(writer);
                writer.write("]");
                break;
            case "dictionary":
                writer.write("[");
                variant.keyType.write(writer);
                writer.write(": ");
                variant.valueType.write(writer);
                writer.write("]");
                break;
            case "optional":
                variant.valueType.write(writer);
                writer.write("?");
                break;
            case "nullable":
                writer.write("Nullable<");
                variant.valueType.write(writer);
                writer.write(">");
                break;
            case "member-access":
                variant.target.write(writer);
                writer.write(".");
                writer.write(variant.memberName);
                break;
            default:
                assertNever(variant);
        }
    }

    public equals(that: TypeReference): boolean {
        switch (this.variant.type) {
            case "symbol":
                return that.variant.type === "symbol" && this.variant.symbol === that.variant.symbol;
            case "generic":
                return (
                    that.variant.type === "generic" &&
                    this.variant.reference.equals(that.variant.reference) &&
                    this.variant.arguments.every(
                        (arg, index) =>
                            that.variant.type === "generic" &&
                            that.variant.arguments[index] &&
                            arg.equals(that.variant.arguments[index])
                    )
                );
            case "tuple": {
                return (
                    that.variant.type === "tuple" &&
                    this.variant.elements.every(
                        (arg, index) =>
                            that.variant.type === "tuple" &&
                            that.variant.elements[index] &&
                            arg.equals(that.variant.elements[index])
                    )
                );
            }
            case "array":
                return that.variant.type === "array" && this.variant.elementType.equals(that.variant.elementType);
            case "dictionary":
                return (
                    that.variant.type === "dictionary" &&
                    this.variant.keyType.equals(that.variant.keyType) &&
                    this.variant.valueType.equals(that.variant.valueType)
                );
            case "optional":
                return that.variant.type == "optional" && this.variant.valueType.equals(that.variant.valueType);
            case "nullable":
                return that.variant.type === "nullable" && this.variant.valueType.equals(that.variant.valueType);
            case "member-access":
                return (
                    that.variant.type === "member-access" &&
                    this.variant.target.equals(that.variant.target) &&
                    this.variant.memberName === that.variant.memberName
                );
            default:
                assertNever(this.variant);
        }
    }

    public static symbol(symbolReference: string): TypeReference {
        return new this({ type: "symbol", symbol: symbolReference });
    }

    public static generic(reference: TypeReference, arguments_: TypeReference[]): TypeReference {
        return new this({ type: "generic", reference, arguments: arguments_ });
    }

    public static tuple(elements: [TypeReference, ...TypeReference[]]): TypeReference {
        return new this({ type: "tuple", elements });
    }

    public static array(elementType: TypeReference): TypeReference {
        return new this({ type: "array", elementType });
    }

    public static dictionary(keyType: TypeReference, valueType: TypeReference): TypeReference {
        return new this({ type: "dictionary", keyType, valueType });
    }

    public static optional(valueType: TypeReference): TypeReference {
        if (valueType.variant.type === "optional") {
            return valueType;
        }
        return new this({ type: "optional", valueType });
    }

    public static nullable(valueType: TypeReference): TypeReference {
        if (valueType.variant.type === "nullable") {
            return valueType;
        }
        return new this({ type: "nullable", valueType });
    }

    public static memberAccess(target: TypeReference, memberName: string): TypeReference {
        return new this({ type: "member-access", target, memberName });
    }

    // Helpers

    public static nonOptional(valueType: TypeReference): TypeReference {
        return valueType.variant.type === "optional"
            ? TypeReference.nonOptional(valueType.variant.valueType)
            : valueType;
    }

    public static nonNullable(valueType: TypeReference): TypeReference {
        return valueType.variant.type === "nullable"
            ? TypeReference.nonNullable(valueType.variant.valueType)
            : valueType;
    }

    public static unqualifiedToSwiftType(symbolName: SwiftTypeSymbolName): TypeReference {
        return TypeReference.symbol(symbolName);
    }

    public static unqualifiedToFoundationType(symbolName: FoundationTypeSymbolName): TypeReference {
        return TypeReference.symbol(symbolName);
    }
}
