import {
    DeclaredTypeName,
    ExampleTypeReference,
    ResolvedTypeReference,
    TypeDeclaration,
    TypeReference,
} from "@fern-fern/ir-model/types";
import { Reference, TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { GeneratedTypeReferenceExample } from "../type-reference-example/GeneratedTypeReferenceExample";
import { GeneratedType } from "./GeneratedType";

export interface TypeContextMixin {
    getReferenceToType: (typeReference: TypeReference) => TypeReferenceNode;
    stringify: (
        valueToStringify: ts.Expression,
        valueType: TypeReference,
        opts: { includeNullCheckIfOptional: boolean }
    ) => ts.Expression;
    getReferenceToNamedType: (typeName: DeclaredTypeName) => Reference;
    resolveTypeReference: (typeReference: TypeReference) => ResolvedTypeReference;
    resolveTypeName: (typeName: DeclaredTypeName) => ResolvedTypeReference;
    getTypeDeclaration: (typeName: DeclaredTypeName) => TypeDeclaration;
    getGeneratedType: (typeName: DeclaredTypeName) => GeneratedType;
    getGeneratedExample: (example: ExampleTypeReference) => GeneratedTypeReferenceExample;
}

export interface WithTypeContextMixin {
    type: TypeContextMixin;
}
