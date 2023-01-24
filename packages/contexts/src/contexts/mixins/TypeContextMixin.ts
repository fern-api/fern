import {
    DeclaredTypeName,
    ExampleTypeReference,
    ResolvedTypeReference,
    TypeReference,
} from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { GeneratedType, GeneratedTypeReferenceExample } from "../../generated-types";
import { Reference } from "../../Reference";

export interface TypeContextMixin {
    getReferenceToType: (typeReference: TypeReference) => TypeReferenceNode;
    stringify: (valueToStringify: ts.Expression, valueType: TypeReference) => ts.Expression;
    getReferenceToNamedType: (typeName: DeclaredTypeName) => Reference;
    resolveTypeReference: (typeReference: TypeReference) => ResolvedTypeReference;
    resolveTypeName: (typeName: DeclaredTypeName) => ResolvedTypeReference;
    getGeneratedType: (typeName: DeclaredTypeName) => GeneratedType;
    getGeneratedExample: (example: ExampleTypeReference) => GeneratedTypeReferenceExample;
}

export interface WithTypeContextMixin {
    type: TypeContextMixin;
}
