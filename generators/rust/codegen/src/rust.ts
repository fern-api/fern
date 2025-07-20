import {
    Type,
    Reference,
    Writer,
    AstNode,
    PrimitiveType
} from "./ast";

// Factory functions for Type creation
export function primitiveType(primitive: PrimitiveType): Type {
    return Type.primitive(primitive);
}

export function referenceType(reference: Reference): Type {
    return Type.reference(reference);
}

export function optionType(inner: Type): Type {
    return Type.option(inner);
}

export function resultType(ok: Type, err: Type): Type {
    return Type.result(ok, err);
}

export function vecType(inner: Type): Type {
    return Type.vec(inner);
}

export function hashMapType(key: Type, value: Type): Type {
    return Type.hashMap(key, value);
}

// Factory function for Reference creation
export function reference(args: { name: string; module?: string; genericArgs?: AstNode[] }): Reference {
    return new Reference(args);
}

// Factory function for Writer creation
export function writer(): Writer {
    return new Writer();
}

// Re-export all AST types and utilities
export * from "./ast"; 