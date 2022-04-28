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
): SourceFile {
    const file = directory.getSourceFile(filepath) ?? directory.createSourceFile(filepath);
    addFileContents(file);
    // TODO do this in a finalize method, since we might add stuff after this method returns
    file.formatText();
    file.organizeImports();
    return file;
}
