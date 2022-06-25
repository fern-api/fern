import path from "path";

export const RELATIVE_SRC_PATH = "src";
export const RELATIVE_OUT_DIR_PATH = "lib";

export function getPathToProjectFile(relativePath: string): string {
    // the project lives at the root of the Volume
    return path.join(path.sep, relativePath);
}

const RELATIVE_ENTRYPOINT_WITHOUT_EXTENSION = "index";
export const RELATIVE_ENTRYPOINT = path.join(RELATIVE_OUT_DIR_PATH, `${RELATIVE_ENTRYPOINT_WITHOUT_EXTENSION}.js`);
export const RELATIVE_TYPES_ENTRYPOINT = path.join(
    RELATIVE_OUT_DIR_PATH,
    `${RELATIVE_ENTRYPOINT_WITHOUT_EXTENSION}.d.ts`
);
