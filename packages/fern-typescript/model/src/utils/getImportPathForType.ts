import { TypeName } from "@fern/ir-generation";
import path from "path";
import { SourceFile } from "ts-morph";
import { getAbsolutePathToType } from "./getFileNameForType";

export function getImportPathForType(from: SourceFile, typeName: TypeName): string {
    const absolutePathToType = getAbsolutePathToType(typeName);
    const relativePathToType = path.relative(path.dirname(from.getFilePath()), absolutePathToType);

    if (relativePathToType.startsWith(".")) {
        return relativePathToType;
    }
    return `./${relativePathToType}`;
}
