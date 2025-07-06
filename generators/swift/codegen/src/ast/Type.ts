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

type Double = {
    type: "double";
};

type Tuple = {
    type: "tuple";
    elements: [Type, ...Type[]];
};

type Array = {
    type: "array";
    elementType: Type;
};

type Dictionary = {
    type: "dictionary";
    keyType: Type;
    valueType: Type;
};

type InternalType = String_ | Bool | Int | Double | Tuple | Array | Dictionary;

export class Type extends AstNode {
    private internalType: InternalType;

    private constructor(internalType: InternalType) {
        super();
        this.internalType = internalType;
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
            case "double":
                writer.write("Double");
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

    public static double(): Type {
        return new this({ type: "double" });
    }

    public static tuple(elements: [Type, ...Type[]]): Type {
        return new this({ type: "tuple", elements });
    }

    public static array(elementType: Type): Type {
        return new this({ type: "array", elementType });
    }

    public static dictionary(keyType: Type, valueType: Type): Type {
        // TODO: keyType needs to conform to Hashable. We may want to enforce this as a constraint.
        return new this({ type: "dictionary", keyType, valueType });
    }
}
