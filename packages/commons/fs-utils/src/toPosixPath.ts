import path from "path";

/**
 * Converts a filesystem path that uses the OS separator into one that uses forward slashes.
 * On POSIX systems this returns the path unchanged.
 */
export function toPosixPath(filepath: string): string {
    return filepath.split(path.sep).join("/");
}
