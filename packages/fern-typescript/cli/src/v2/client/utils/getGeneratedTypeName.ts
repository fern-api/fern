import { DeclaredTypeName } from "@fern-fern/ir-model";

export function getGeneratedTypeName(typeName: DeclaredTypeName): string {
    return typeName.name;
}
