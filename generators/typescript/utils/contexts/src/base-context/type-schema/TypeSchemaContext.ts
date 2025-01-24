import { Reference, TypeReferenceNode, Zurg } from "@fern-typescript/commons";

import { DeclaredTypeName, TypeReference } from "@fern-fern/ir-sdk/api";

import { GeneratedTypeSchema } from "./GeneratedTypeSchema";

export interface TypeSchemaContext {
    getGeneratedTypeSchema: (typeName: DeclaredTypeName) => GeneratedTypeSchema;
    getReferenceToRawType: (typeReference: TypeReference) => TypeReferenceNode;
    getReferenceToRawNamedType: (typeName: DeclaredTypeName) => Reference;
    getSchemaOfTypeReference: (typeReference: TypeReference) => Zurg.Schema;
    getSchemaOfNamedType: (typeName: DeclaredTypeName, opts: { isGeneratingSchema: boolean }) => Zurg.Schema;
}
