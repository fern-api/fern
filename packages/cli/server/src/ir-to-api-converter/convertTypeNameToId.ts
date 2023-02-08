import * as ir from "@fern-fern/ir-model/types";
import { FernApi } from "../generated";

export function convertTypeNameToId(typeName: ir.DeclaredTypeName): FernApi.api.TypeId {
    return [...typeName.fernFilepath.allParts.map((part) => part.originalName), typeName.name.originalName].join(".");
}
