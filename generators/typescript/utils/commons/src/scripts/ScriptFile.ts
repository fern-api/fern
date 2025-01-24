export type ScriptFile = {
    copyToFolder: (destinationFolder: string) => Promise<void>;
};
