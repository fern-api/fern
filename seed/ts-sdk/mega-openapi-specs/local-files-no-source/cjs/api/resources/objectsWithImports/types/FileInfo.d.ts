export declare const FileInfo: {
    readonly Regular: "REGULAR";
    readonly Directory: "DIRECTORY";
};
export type FileInfo = (typeof FileInfo)[keyof typeof FileInfo];
