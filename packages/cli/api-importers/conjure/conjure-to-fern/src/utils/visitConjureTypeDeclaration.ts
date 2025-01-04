import { assertNever } from "@fern-api//core-utils";
import {
    ConjureAliasDeclaration,
    ConjureEnumDeclaration,
    ConjureObjectDeclaration,
    ConjureTypeDeclaration,
    ConjureUnionDeclaration
} from "@fern-api/conjure-sdk";

export interface ConjureTypeDeclarationVisitor<R> {
    alias: (value: ConjureAliasDeclaration) => R;
    enum: (value: ConjureEnumDeclaration) => R;
    object: (value: ConjureObjectDeclaration) => R;
    union: (value: ConjureUnionDeclaration) => R;
}

export function visitConjureTypeDeclaration<R>(
    declaration: ConjureTypeDeclaration,
    visitor: ConjureTypeDeclarationVisitor<R>
): R {
    if (isAlias(declaration)) {
        return visitor.alias(declaration);
    }
    if (isEnum(declaration)) {
        return visitor.enum(declaration);
    }
    if (isObject(declaration)) {
        return visitor.object(declaration);
    }
    if (isUnion(declaration)) {
        return visitor.union(declaration);
    }
    assertNever(declaration);
}

export function isAlias(type: ConjureTypeDeclaration): type is ConjureAliasDeclaration {
    return (type as ConjureAliasDeclaration)?.alias != null;
}

export function isEnum(type: ConjureTypeDeclaration): type is ConjureEnumDeclaration {
    return (type as ConjureEnumDeclaration)?.values != null;
}

export function isObject(type: ConjureTypeDeclaration): type is ConjureObjectDeclaration {
    return (type as ConjureObjectDeclaration)?.fields != null;
}

export function isUnion(type: ConjureTypeDeclaration): type is ConjureUnionDeclaration {
    return (type as ConjureUnionDeclaration)?.union != null;
}
