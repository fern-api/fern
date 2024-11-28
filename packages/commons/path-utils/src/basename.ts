export function basename(path: string, options?: { stripExtension?: boolean }): string {
    const basename = path.split("/").pop() ?? path;
    if (options?.stripExtension) {
        return basename.split(".")[0] ?? basename;
    }
    return basename;
}
