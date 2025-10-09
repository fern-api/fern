import { assertNever } from "@fern-api/core-utils";

import { AstNode, Writer } from "./core";

type Symbol = {
    type: "symbol";
    symbol: string;
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

type InternalTypeReference = Symbol | Tuple | Array_ | Dictionary | Optional | Nullable;

export class TypeReference extends AstNode {
    private internalTypeRef: InternalTypeReference;

    private constructor(internalTypeRef: InternalTypeReference) {
        super();
        this.internalTypeRef = internalTypeRef;
    }

    public write(writer: Writer): void {
        switch (this.internalTypeRef.type) {
            case "symbol":
                writer.write(this.internalTypeRef.symbol);
                break;
            case "tuple":
                writer.write("(");
                this.internalTypeRef.elements.forEach((elementType, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    elementType.write(writer);
                });
                writer.write(")");
                break;
            case "array":
                writer.write("[");
                this.internalTypeRef.elementType.write(writer);
                writer.write("]");
                break;
            case "dictionary":
                writer.write("[");
                this.internalTypeRef.keyType.write(writer);
                writer.write(": ");
                this.internalTypeRef.valueType.write(writer);
                writer.write("]");
                break;
            case "optional":
                this.internalTypeRef.valueType.write(writer);
                writer.write("?");
                break;
            case "nullable":
                writer.write("Nullable<");
                this.internalTypeRef.valueType.write(writer);
                writer.write(">");
                break;
            default:
                assertNever(this.internalTypeRef);
        }
    }

    public static symbol(symbol: string): TypeReference {
        return new this({ type: "symbol", symbol });
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
}
