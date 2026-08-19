import { FernIr } from "@fern-fern/ir-sdk";
import { Reference, TypeReferenceNode, Zurg } from "@fern-typescript/commons";

import { GeneratedTypeSchema } from "./GeneratedTypeSchema.js";

export interface TypeSchemaContext {
    getGeneratedTypeSchema: (typeName: FernIr.DeclaredTypeName) => GeneratedTypeSchema;
    getReferenceToRawType: (typeReference: FernIr.TypeReference) => TypeReferenceNode;
    getReferenceToRawNamedType: (typeName: FernIr.DeclaredTypeName) => Reference;
    getSchemaOfTypeReference: (typeReference: FernIr.TypeReference) => Zurg.Schema;
    getSchemaOfNamedType: (typeName: FernIr.DeclaredTypeName, opts: { isGeneratingSchema: boolean }) => Zurg.Schema;
}
