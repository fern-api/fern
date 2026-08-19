export function convertToOsPath(path: string): string {
    // In the browser, we always use unix paths.
    return path.replace(/\\/g, "/");
}
