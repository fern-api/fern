import { assertNever } from "@fern-api/core-utils";
import { FoundationTypeSymbolName, SwiftTypeSymbolName } from "../symbol";
import { AstNode, Writer } from "./core";
import { Type } from "./Type";

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

type InternalTypeReference = Symbol | Generic | Tuple | Array_ | Dictionary | Optional | Nullable | MemberAccess;

export class TypeReference extends AstNode {
    private internalTypeRef: InternalTypeReference;

    private constructor(internalTypeRef: InternalTypeReference) {
        super();
        this.internalTypeRef = internalTypeRef;
    }

    public get isOptional(): boolean {
        return this.internalTypeRef.type === "optional";
    }

    public get isNullable(): boolean {
        return this.internalTypeRef.type === "nullable";
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
        return this.internalTypeRef.type === "symbol" ? this.internalTypeRef.symbol : null;
    }

    public write(writer: Writer): void {
        const { internalTypeRef } = this;

        switch (internalTypeRef.type) {
            case "symbol":
                writer.write(internalTypeRef.symbol);
                break;
            case "generic": {
                internalTypeRef.reference.write(writer);
                if (internalTypeRef.arguments.length > 0) {
                    writer.write("<");
                    internalTypeRef.arguments.forEach((arg, index) => {
                        arg.write(writer);
                        if (index < internalTypeRef.arguments.length - 1) {
                            writer.write(", ");
                        }
                    });
                    writer.write(">");
                }
                break;
            }
            case "tuple":
                writer.write("(");
                internalTypeRef.elements.forEach((elementType, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    elementType.write(writer);
                });
                writer.write(")");
                break;
            case "array":
                writer.write("[");
                internalTypeRef.elementType.write(writer);
                writer.write("]");
                break;
            case "dictionary":
                writer.write("[");
                internalTypeRef.keyType.write(writer);
                writer.write(": ");
                internalTypeRef.valueType.write(writer);
                writer.write("]");
                break;
            case "optional":
                internalTypeRef.valueType.write(writer);
                writer.write("?");
                break;
            case "nullable":
                writer.write("Nullable<");
                internalTypeRef.valueType.write(writer);
                writer.write(">");
                break;
            case "member-access":
                internalTypeRef.target.write(writer);
                writer.write(".");
                writer.write(internalTypeRef.memberName);
                break;
            default:
                assertNever(internalTypeRef);
        }
    }

    public equals(that: TypeReference): boolean {
        switch (this.internalTypeRef.type) {
            case "symbol":
                return (
                    that.internalTypeRef.type === "symbol" &&
                    this.internalTypeRef.symbol === that.internalTypeRef.symbol
                );
            case "generic":
                return (
                    that.internalTypeRef.type === "generic" &&
                    this.internalTypeRef.reference.equals(that.internalTypeRef.reference) &&
                    this.internalTypeRef.arguments.every(
                        (arg, index) =>
                            that.internalTypeRef.type === "generic" &&
                            that.internalTypeRef.arguments[index] &&
                            arg.equals(that.internalTypeRef.arguments[index])
                    )
                );
            case "tuple": {
                return (
                    that.internalTypeRef.type === "tuple" &&
                    this.internalTypeRef.elements.every(
                        (arg, index) =>
                            that.internalTypeRef.type === "tuple" &&
                            that.internalTypeRef.elements[index] &&
                            arg.equals(that.internalTypeRef.elements[index])
                    )
                );
            }
            case "array":
                return (
                    that.internalTypeRef.type === "array" &&
                    this.internalTypeRef.elementType.equals(that.internalTypeRef.elementType)
                );
            case "dictionary":
                return (
                    that.internalTypeRef.type === "dictionary" &&
                    this.internalTypeRef.keyType.equals(that.internalTypeRef.keyType) &&
                    this.internalTypeRef.valueType.equals(that.internalTypeRef.valueType)
                );
            case "optional":
                return (
                    that.internalTypeRef.type == "optional" &&
                    this.internalTypeRef.valueType.equals(that.internalTypeRef.valueType)
                );
            case "nullable":
                return (
                    that.internalTypeRef.type === "nullable" &&
                    this.internalTypeRef.valueType.equals(that.internalTypeRef.valueType)
                );
            case "member-access":
                return (
                    that.internalTypeRef.type === "member-access" &&
                    this.internalTypeRef.target.equals(that.internalTypeRef.target) &&
                    this.internalTypeRef.memberName === that.internalTypeRef.memberName
                );
            default:
                assertNever(this.internalTypeRef);
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
        if (valueType.internalTypeRef.type === "optional") {
            return valueType;
        }
        return new this({ type: "optional", valueType });
    }

    public static nullable(valueType: TypeReference): TypeReference {
        if (valueType.internalTypeRef.type === "nullable") {
            return valueType;
        }
        return new this({ type: "nullable", valueType });
    }

    public static memberAccess(target: TypeReference, memberName: string): TypeReference {
        return new this({ type: "member-access", target, memberName });
    }

    // Helpers

    public static nonOptional(valueType: TypeReference): TypeReference {
        return valueType.internalTypeRef.type === "optional"
            ? TypeReference.nonOptional(valueType.internalTypeRef.valueType)
            : valueType;
    }

    public static nonNullable(valueType: TypeReference): TypeReference {
        return valueType.internalTypeRef.type === "nullable"
            ? TypeReference.nonNullable(valueType.internalTypeRef.valueType)
            : valueType;
    }

    public static unqualifiedToSwiftType(symbolName: SwiftTypeSymbolName): TypeReference {
        return TypeReference.symbol(symbolName);
    }

    public static unqualifiedToFoundationType(symbolName: FoundationTypeSymbolName): TypeReference {
        return TypeReference.symbol(symbolName);
    }
}
