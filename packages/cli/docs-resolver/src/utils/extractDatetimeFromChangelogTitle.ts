export function extractDatetimeFromChangelogTitle(filename: string): Date | undefined {
    const filenameWithoutExtension = filename.split(".")[0];
    if (filenameWithoutExtension == null) {
        return undefined;
    }
    const dateRegex = /(^\d{1,4})-(\d{1,2})-(\d{1,4})/;
    const match = dateRegex.exec(filenameWithoutExtension)?.[0];
    if (match != null) {
        try {
            return new Date(match);
        } catch (error) {}
    }
    return undefined;
}
