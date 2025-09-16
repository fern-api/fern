import {
    DeclaredTypeName,
    ExampleTypeReference,
    ResolvedTypeReference,
    Type,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { Reference, TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { GeneratedType } from "./GeneratedType";
import { GeneratedTypeReferenceExample } from "./GeneratedTypeReferenceExample";

export interface TypeContext {
    getReferenceToType: (typeReference: TypeReference) => TypeReferenceNode;
    getReferenceToInlinePropertyType: (
        typeReference: TypeReference,
        parentTypeName: string,
        propertyName: string
    ) => TypeReferenceNode;
    getReferenceToInlineAliasType: (typeReference: TypeReference, aliasTypeName: string) => TypeReferenceNode;
    getReferenceToTypeForInlineUnion: (typeReference: TypeReference) => TypeReferenceNode;
    stringify: (
        valueToStringify: ts.Expression,
        valueType: TypeReference,
        opts: { includeNullCheckIfOptional: boolean }
    ) => ts.Expression;
    getReferenceToNamedType: (typeName: DeclaredTypeName) => Reference;
    resolveTypeReference: (typeReference: TypeReference) => ResolvedTypeReference;
    resolveTypeName: (typeName: DeclaredTypeName) => ResolvedTypeReference;
    getTypeDeclaration: (typeName: DeclaredTypeName) => TypeDeclaration;
    getGeneratedType: (typeName: DeclaredTypeName, typeNameOverride?: string) => GeneratedType;
    getGeneratedTypeById: (typeId: TypeId) => GeneratedType;
    getGeneratedExample: (example: ExampleTypeReference) => GeneratedTypeReferenceExample;
    isNullable: (typeReference: TypeReference) => boolean;
    isOptional: (typeReference: TypeReference) => boolean;
    isLiteral: (typeReference: TypeReference) => boolean;
    hasDefaultValue: (typeReference: TypeReference) => boolean;
    needsRequestResponseTypeVariant: (typeReference: TypeReference) => { request: boolean; response: boolean };
    needsRequestResponseTypeVariantById: (typeId: TypeId) => { request: boolean; response: boolean };
    needsRequestResponseTypeVariantByType(type: Type): { request: boolean; response: boolean };
    typeNameToTypeReference(typeName: DeclaredTypeName): TypeReference;
}
