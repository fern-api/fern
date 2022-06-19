import { Directory, SourceFile } from "ts-morph";

export function getOrCreateSourceFile(directory: Directory, filepath: string): SourceFile {
    return directory.getSourceFile(filepath) ?? directory.createSourceFile(filepath);
}
