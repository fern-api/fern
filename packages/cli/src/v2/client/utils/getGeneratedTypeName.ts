import { DeclaredTypeName } from "@fern-fern/ir-model/types";

export function getGeneratedTypeName(typeName: DeclaredTypeName): string {
    return typeName.name;
}
