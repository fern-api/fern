import { NamedType } from "@fern-api/api";
import { Directory, SourceFile } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "../utils/getRelativePathAsModuleSpecifierTo";
import { getFilePathForNamedType, TypeCategory } from "./getFilePathForNamedType";

export function getImportPathForNamedType({
    modelDirectory,
    from,
    typeName,
    typeCategory,
}: {
    modelDirectory: Directory;
    from: SourceFile;
    typeName: NamedType;
    typeCategory: TypeCategory;
}): string {
    const filepathForType = getFilePathForNamedType({
        modelDirectory,
        typeName,
        typeCategory,
    });
    return getRelativePathAsModuleSpecifierTo(from, filepathForType);
}
