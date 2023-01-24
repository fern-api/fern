import { ts } from "ts-morph";

export interface TypeReferenceNode {
    isOptional: boolean;
    typeNode: ts.TypeNode;
    typeNodeWithoutUndefined: ts.TypeNode;
}
