import { DeclaredTypeName, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode, Zurg } from "@fern-typescript/commons-v2";
import { GeneratedError } from "./GeneratedError";
import { Reference } from "./Reference";
import { TypeContext } from "./TypeContext";

export interface ErrorSchemaContext extends TypeContext {
    getErrorBeingGenerated: () => GeneratedError;

    // schemas
    getReferenceToRawType: (typeReference: TypeReference) => TypeReferenceNode;
    getReferenceToRawNamedType: (typeName: DeclaredTypeName) => Reference;
    getSchemaOfTypeReference: (typeReference: TypeReference) => Zurg.Schema;
    getSchemaOfNamedType: (typeName: DeclaredTypeName) => Zurg.Schema;
}
