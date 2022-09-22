import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { getGeneratedTypeName } from "./getGeneratedTypeName";

export function getFileNameForType(typeName: DeclaredTypeName): string {
    return `${getGeneratedTypeName(typeName)}.ts`;
}
