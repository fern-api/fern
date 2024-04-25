export function extractDatetimeFromChangelogTitle(filename: string): Date | undefined {
    const filenameWithoutExtension = filename.split(".")[0];
    if (filenameWithoutExtension == null) {
        return undefined;
    }
    try {
        return new Date(filenameWithoutExtension);
    } catch (error) {}
    return undefined;
}
