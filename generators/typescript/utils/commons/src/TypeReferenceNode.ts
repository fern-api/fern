import { ts } from "ts-morph";

export interface TypeReferenceNode {
    isOptional: boolean;
    typeNode: ts.TypeNode;
    typeNodeWithoutUndefined: ts.TypeNode;
    requestTypeNode: ts.TypeNode | undefined;
    requestTypeNodeWithoutUndefined: ts.TypeNode | undefined;
    responseTypeNode: ts.TypeNode | undefined;
    responseTypeNodeWithoutUndefined: ts.TypeNode | undefined;
}
