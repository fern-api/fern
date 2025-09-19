import { ts } from "ts-morph";
import { getTextOfTsNode } from "./codegen-utils/getTextOfTsNode";

export function getElementTypeFromArrayType(typeNode: ts.TypeNode): ts.TypeNode {
    if (ts.isArrayTypeNode(typeNode)) {
        return typeNode.elementType;
    }

    // Handle generic Array<T> syntax
    if (ts.isTypeReferenceNode(typeNode)) {
        if (ts.isIdentifier(typeNode.typeName) && typeNode.typeName.getText() === "Array") {
            if (typeNode.typeArguments && typeNode.typeArguments.length === 1) {
                return typeNode.typeArguments[0] as ts.TypeNode; // Returns T from Array<T>
            }
        }
    }

    console.log(getTextOfTsNode(typeNode));
    throw new Error("TypeNode is not an array type");
}
