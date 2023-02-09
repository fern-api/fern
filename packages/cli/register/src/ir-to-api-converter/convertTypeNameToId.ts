import * as ir from "@fern-fern/ir-model/types";
import { FernRegistry } from "@fern-fern/registry";

export function convertTypeNameToId(typeName: ir.DeclaredTypeName): FernRegistry.TypeId {
    return FernRegistry.TypeId(
        [...typeName.fernFilepath.allParts.map((part) => part.originalName), typeName.name.originalName].join(".")
    );
}
