import { Directory, SourceFile } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "../codegen/utils/getRelativePathAsModuleSpecifierTo";

export function getOrCreateSourceFile(directory: Directory, filepath: string): SourceFile {
    const existing = directory.getSourceFile(filepath);
    if (existing != null) {
        return existing;
    }
    const file = directory.createSourceFile(filepath);
    if (file.getBaseName() !== "index.ts") {
        const indexTs = getOrCreateSourceFile(directory, "index.ts");
        indexTs.addExportDeclaration({
            moduleSpecifier: getRelativePathAsModuleSpecifierTo(indexTs, file),
        });
    }
    return file;
}
