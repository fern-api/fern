import path from "path";

export function getPathToProjectFile(relativePath: string): string {
    // the project lives at the root of the Volume
    return path.join(path.sep, relativePath);
}
