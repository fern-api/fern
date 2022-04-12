import { FileSystem } from "./FileSystem";

export interface FileSystemWithUtilities extends FileSystem {
    getTouchedFiles: () => FileSystemWithUtilities.TouchedFile[];
    visitTouchedFiles(
        visitor: (args: { fullPath: string; relativePath: string; contents: string }) => void | Promise<void>
    ): Promise<void>;
    clearCache: () => void;
}

export declare namespace FileSystemWithUtilities {
    export interface TouchedFile {
        fullPath: string;
        relativePath: string;
        originalContents: string | undefined;
        newContents: string;
    }
}
