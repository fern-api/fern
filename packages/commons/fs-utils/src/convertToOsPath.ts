export function convertToOsPath(path: string): string {
    if (process.platform === "win32") {
        return path.replace(/\//g, "\\");
    } else {
        return path.replace(/\\/g, "/");
    }
}
