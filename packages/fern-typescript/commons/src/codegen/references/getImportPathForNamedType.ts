import { NamedType } from "@fern-api/api";
import { Directory, SourceFile } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "../utils/getRelativePathAsModuleSpecifierTo";
import { getFilePathForNamedType } from "./getFilePathForNamedType";

export function getImportPathForNamedType({
    baseDirectory,
    from,
    typeName,
}: {
    /**
     * the directory where the original type lives.
     * for types, this should be the model directory.
     * for errors, this should be the errors directory.
     */
    baseDirectory: Directory;
    from: SourceFile;
    typeName: NamedType;
}): string {
    const filepathForType = getFilePathForNamedType({
        baseDirectory,
        typeName,
    });
    return getRelativePathAsModuleSpecifierTo(from, filepathForType);
}
