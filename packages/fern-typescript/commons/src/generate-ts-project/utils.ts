import path from "path";

export const RELATIVE_OUT_DIR_PATH = "lib";
export const RELATIVE_CJS_OUT_DIR_PATH = path.join(RELATIVE_OUT_DIR_PATH, "cjs");
export const RELATIVE_ESM_OUT_DIR_PATH = path.join(RELATIVE_OUT_DIR_PATH, "esm");

export function getPathToProjectFile(relativePath: string): string {
    // the project lives at the root of the Volume
    return path.join(path.sep, relativePath);
}
