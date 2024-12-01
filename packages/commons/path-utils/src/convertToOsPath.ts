import { isBrowser } from "./isBrowser";

// in this function, we ignore drive paths and roots, since many strings are passed as partial relative paths
export function convertToOsPath(path: string): string {
    if (isBrowser()) {
        return path.replace(/\\/g, "/");
    }
    if (process.platform === "win32") {
        return path.replace(/\//g, "\\");
    } else {
        return path.replace(/\\/g, "/");
    }
}
