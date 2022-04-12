export interface FileSystem {
    readFile: (relativePath: string) => Promise<string | undefined>;
    writeFile: (relativePath: string, contents: string) => Promise<void>;
    readdir: (relativePath: string) => Promise<Record<FileSystem.FileName, FileSystem.File>>;
    mkdir: (relativePath: string) => Promise<void>;
    getFileSystemForPrefix: (prefix: string) => FileSystem;
}

export declare namespace FileSystem {
    export type FileName = string;

    export interface File {
        name: string;
        type: FileType;
    }
}

export enum FileType {
    FILE = "FILE",
    DIRECTORY = "DIRECTORY",
}
