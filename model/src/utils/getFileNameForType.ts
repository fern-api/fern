import { TypeName } from "@fern/ir-generation";
import path from "path";

export function getFileNameForType(typeName: TypeName): string {
    return `${getAbsolutePathToType(typeName)}.ts`;
}

export function getAbsolutePathToType(typeName: TypeName): string {
    return path.join("/model", typeName.filepath, typeName.name);
}
