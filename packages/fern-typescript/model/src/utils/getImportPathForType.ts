import { TypeName } from "@fern/ir-generation";
import path from "path";
import { Directory, SourceFile } from "ts-morph";
import { getFilePathForType } from "./getFilePathForType";

export function getImportPathForType({
    modelDirectory,
    from,
    typeName,
}: {
    modelDirectory: Directory;
    from: SourceFile;
    typeName: TypeName;
}): string {
    const filepathForType = getFilePathForType({
        modelDirectory,
        typeName,
    });
    const filepathWithoutExtension = removeExtension(filepathForType);
    const relativePathToType = path.relative(path.dirname(from.getFilePath()), filepathWithoutExtension);

    if (relativePathToType.startsWith(".")) {
        return relativePathToType;
    }
    return `./${relativePathToType}`;
}

function removeExtension(filepath: string): string {
    const parsed = path.parse(filepath);
    return path.join(parsed.dir, parsed.name);
}
