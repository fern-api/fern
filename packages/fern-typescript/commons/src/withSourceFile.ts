import { Directory, SourceFile } from "ts-morph";

export declare namespace withSourceFile {
    export interface Args {
        directory: Directory;
        filepath: string;
    }
}

export function withSourceFile(
    { directory, filepath }: withSourceFile.Args,
    addFileContents: (file: SourceFile) => void
): void {
    const file = directory.getSourceFile(filepath) ?? directory.createSourceFile(filepath);
    addFileContents(file);
    file.formatText();
    file.organizeImports();
}
