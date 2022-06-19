import { Directory } from "ts-morph";
import { SourceFileManager } from "../SourceFileManager";

export function getOrCreateSourceFile(directory: Directory, filepath: string): SourceFileManager {
    const existing = directory.getSourceFile(filepath);
    if (existing != null) {
        return new SourceFileManager(existing);
    } else {
        return createSourceFile(directory, filepath);
    }
}

export function createSourceFile(directory: Directory, filepath: string): SourceFileManager {
    return new SourceFileManager(directory.createSourceFile(filepath));
}
