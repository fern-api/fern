import { NamedType } from "@fern-api/api";
import { Directory, SourceFile } from "ts-morph";
import { getFilePathForType } from "./getFilePathForType";

export function getImportPathForType({
    modelDirectory,
    from,
    typeName,
}: {
    modelDirectory: Directory;
    from: SourceFile;
    typeName: NamedType;
}): string {
    const filepathForType = getFilePathForType({
        modelDirectory,
        typeName,
    });
    return from.getRelativePathAsModuleSpecifierTo(filepathForType);
}
