import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

// in this function, we ignore drive paths and roots, since many strings are passed as partial relative paths
export function convertToOsPath(path: string): string {
    if (process.platform === "win32") {
        return path.replace(/\//g, "\\");
    } else {
        return path.replace(/\\/g, "/");
    }
}

function convertToFernHostPath(path: string): string {
    let unixPath = path;
    if (/^[a-zA-Z]:\\/.test(path)) {
        unixPath = path.substring(2);
    }

    return unixPath.replace(/\\/g, "/");
}

export function convertToFernHostAbsoluteFilePath(path: AbsoluteFilePath): AbsoluteFilePath {
    // Don't use 'of' here, as it will use OS path, we want fern path
    return convertToFernHostPath(path) as AbsoluteFilePath;
}
export function convertToFernHostRelativeFilePath(path: RelativeFilePath): RelativeFilePath {
    // Don't use 'of' here, as it will use OS path, we want fern path
    return convertToFernHostPath(path) as RelativeFilePath;
}
