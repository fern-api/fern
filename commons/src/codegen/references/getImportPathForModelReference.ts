import { ModelReference } from "@fern-api/api";
import { Directory, SourceFile } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "../utils/getRelativePathAsModuleSpecifierTo";
import { getFilePathForModelReference } from "./getFilePathForModelReference";

export function getImportPathForModelReference({
    modelDirectory,
    from,
    reference,
}: {
    modelDirectory: Directory;
    from: SourceFile;
    reference: ModelReference;
}): string {
    const filepathForType = getFilePathForModelReference({
        modelDirectory,
        reference,
    });
    return getRelativePathAsModuleSpecifierTo(from, filepathForType);
}
