import {
    DeclaredTypeName,
    ExampleTypeReference,
    ResolvedTypeReference,
    TypeReference,
} from "@fern-fern/ir-model/types";
import { Reference, TypeReferenceNode } from "@fern-typescript/commons";
import { GeneratedTypeReferenceExample } from "../type-reference-example/GeneratedTypeReferenceExample";
import { GeneratedType } from "./GeneratedType";

export interface TypeContextMixin {
    getReferenceToType: (typeReference: TypeReference) => TypeReferenceNode;
    getReferenceToNamedType: (typeName: DeclaredTypeName) => Reference;
    resolveTypeReference: (typeReference: TypeReference) => ResolvedTypeReference;
    resolveTypeName: (typeName: DeclaredTypeName) => ResolvedTypeReference;
    getGeneratedType: (typeName: DeclaredTypeName) => GeneratedType;
    getGeneratedExample: (example: ExampleTypeReference) => GeneratedTypeReferenceExample;
}

export interface WithTypeContextMixin {
    type: TypeContextMixin;
}
