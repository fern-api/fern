import { DeclaredTypeName, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode, Zurg } from "@fern-typescript/commons-v2";
import { GeneratedAliasType, GeneratedEnumType, GeneratedObjectType, GeneratedUnionType } from "./generated-types";
import { GeneratedType } from "./generated-types/GeneratedType";
import { Reference } from "./Reference";
import { TypeContext } from "./TypeContext";

export interface TypeSchemaContext extends TypeContext {
    // types
    getGeneratedType: (typeName: DeclaredTypeName) => GeneratedType;
    getGeneratedUnionType: (typeName: DeclaredTypeName) => GeneratedUnionType;
    getGeneratedAliasType: (typeName: DeclaredTypeName) => GeneratedAliasType;
    getGeneratedObjectType: (typeName: DeclaredTypeName) => GeneratedObjectType;
    getGeneratedEnumType: (typeName: DeclaredTypeName) => GeneratedEnumType;

    // schemas
    getReferenceToRawType: (typeReference: TypeReference) => TypeReferenceNode;
    getReferenceToRawNamedType: (typeName: DeclaredTypeName) => Reference;
    getSchemaOfTypeReference: (typeReference: TypeReference) => Zurg.Schema;
    getSchemaOfNamedType: (typeName: DeclaredTypeName) => Zurg.Schema;
}
