import type { TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";

/**
 * Builds a TypeReferenceNode for a primitive type (non-optional).
 * Used across GeneratedObjectTypeImpl, GeneratedAliasTypeImpl, GeneratedUnionTypeImpl,
 * and GeneratedUndiscriminatedUnionTypeImpl tests.
 */
export function primitiveTypeRefNode(typeName: string): TypeReferenceNode {
    const typeNode = ts.factory.createKeywordTypeNode(
        typeName === "string"
            ? ts.SyntaxKind.StringKeyword
            : typeName === "number"
              ? ts.SyntaxKind.NumberKeyword
              : typeName === "boolean"
                ? ts.SyntaxKind.BooleanKeyword
                : ts.SyntaxKind.AnyKeyword
    );
    return {
        isOptional: false,
        typeNode,
        typeNodeWithoutUndefined: typeNode,
        requestTypeNode: undefined,
        requestTypeNodeWithoutUndefined: undefined,
        responseTypeNode: undefined,
        responseTypeNodeWithoutUndefined: undefined
    };
}

/**
 * Builds a TypeReferenceNode for an optional type (T | undefined).
 * Used in type-generator tests for optional property generation.
 */
export function optionalTypeRefNode(typeName: string): TypeReferenceNode {
    const baseNode = ts.factory.createKeywordTypeNode(
        typeName === "string"
            ? ts.SyntaxKind.StringKeyword
            : typeName === "number"
              ? ts.SyntaxKind.NumberKeyword
              : typeName === "boolean"
                ? ts.SyntaxKind.BooleanKeyword
                : ts.SyntaxKind.AnyKeyword
    );
    const unionNode = ts.factory.createUnionTypeNode([
        baseNode,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
    ]);
    return {
        isOptional: true,
        typeNode: unionNode,
        typeNodeWithoutUndefined: baseNode,
        requestTypeNode: undefined,
        requestTypeNodeWithoutUndefined: undefined,
        responseTypeNode: undefined,
        responseTypeNodeWithoutUndefined: undefined
    };
}

/**
 * Builds a TypeReferenceNode with separate request/response type variants.
 * Used in GeneratedObjectTypeImpl tests for read/write-only property generation.
 */
export function readWriteTypeRefNode(opts: {
    baseType: string;
    requestType?: string;
    responseType?: string;
    isOptional?: boolean;
}): TypeReferenceNode {
    const baseNode = ts.factory.createTypeReferenceNode(opts.baseType);
    const reqNode = opts.requestType ? ts.factory.createTypeReferenceNode(opts.requestType) : undefined;
    const respNode = opts.responseType ? ts.factory.createTypeReferenceNode(opts.responseType) : undefined;

    if (opts.isOptional) {
        const unionNode = ts.factory.createUnionTypeNode([
            baseNode,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
        ]);
        return {
            isOptional: true,
            typeNode: unionNode,
            typeNodeWithoutUndefined: baseNode,
            requestTypeNode: reqNode
                ? ts.factory.createUnionTypeNode([
                      reqNode,
                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                  ])
                : undefined,
            requestTypeNodeWithoutUndefined: reqNode,
            responseTypeNode: respNode
                ? ts.factory.createUnionTypeNode([
                      respNode,
                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                  ])
                : undefined,
            responseTypeNodeWithoutUndefined: respNode
        };
    }

    return {
        isOptional: false,
        typeNode: baseNode,
        typeNodeWithoutUndefined: baseNode,
        requestTypeNode: reqNode,
        requestTypeNodeWithoutUndefined: reqNode,
        responseTypeNode: respNode,
        responseTypeNodeWithoutUndefined: respNode
    };
}

/**
 * Builds a TypeReferenceNode for a named type reference (e.g., a custom type name).
 * Used in GeneratedUnionTypeImpl and GeneratedUndiscriminatedUnionTypeImpl tests.
 */
export function namedTypeRefNode(name: string): TypeReferenceNode {
    const typeNode = ts.factory.createTypeReferenceNode(name);
    return {
        isOptional: false,
        typeNode,
        typeNodeWithoutUndefined: typeNode,
        requestTypeNode: undefined,
        requestTypeNodeWithoutUndefined: undefined,
        responseTypeNode: undefined,
        responseTypeNodeWithoutUndefined: undefined
    };
}
