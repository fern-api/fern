import { FernConstants } from "@fern-fern/ir-model/ir";
import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { SourceFile } from "ts-morph";
import { CoreUtilities } from "./core-utilities";
import { ExternalDependencies } from "./external-dependencies/ExternalDependencies";
import { Reference } from "./Reference";

export interface TypeContext {
    sourceFile: SourceFile;

    // types
    getReferenceToType: (typeReference: TypeReference) => TypeReferenceNode;
    getReferenceToNamedType: (typeName: DeclaredTypeName) => Reference;
    resolveTypeReference: (typeReference: TypeReference) => ResolvedTypeReference;
    resolveTypeName: (typeName: DeclaredTypeName) => ResolvedTypeReference;

    // misc
    externalDependencies: ExternalDependencies;
    coreUtilities: CoreUtilities;
    fernConstants: FernConstants;
}
