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
    const file = directory.createSourceFile(filepath);
    addFileContents(file);
    // TODO this should maybe be a finalize() method on the Project
    // since we might want to edit the file after withFile is complete
    file.formatText();
    file.organizeImports();
}
