import { DeclaredTypeName } from "@fern-fern/ir-model";
import path from "path";
import { getFileNameForType } from "./getFileNameForType";
import { getFilepathForFernFilepath } from "./getFilepathForFernFilepath";

export function getFilepathForType(typeName: DeclaredTypeName): string {
    return path.join(getFilepathForFernFilepath(typeName.fernFilepath), getFileNameForType(typeName));
}
