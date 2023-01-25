import { DeclaredTypeName, TypeReference } from "@fern-fern/ir-model/types";
import { Reference, TypeReferenceNode, Zurg } from "@fern-typescript/commons";
import { GeneratedTypeSchema } from "../../generated-types";

export interface TypeSchemaContextMixin {
    getGeneratedTypeSchema: (typeName: DeclaredTypeName) => GeneratedTypeSchema;
    getReferenceToRawType: (typeReference: TypeReference) => TypeReferenceNode;
    getReferenceToRawNamedType: (typeName: DeclaredTypeName) => Reference;
    getSchemaOfTypeReference: (typeReference: TypeReference) => Zurg.Schema;
    getSchemaOfNamedType: (typeName: DeclaredTypeName, opts: { isGeneratingSchema: boolean }) => Zurg.Schema;
}

export interface WithTypeSchemaContextMixin {
    typeSchema: TypeSchemaContextMixin;
}
