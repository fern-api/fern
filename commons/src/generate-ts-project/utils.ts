import path from "path";

export const RELATIVE_OUT_DIR_PATH = "lib";
export const RELATIVE_CJS_OUT_DIR_PATH = path.join(RELATIVE_OUT_DIR_PATH, "cjs");
export const RELATIVE_ESM_OUT_DIR_PATH = path.join(RELATIVE_OUT_DIR_PATH, "esm");

export function getPathToProjectFile(relativePath: string): string {
    // the project lives at the root of the Volume
    return path.join(path.sep, relativePath);
}

// not including src/ since we're using rootDir=src in the tsconfig.json
const RELATIVE_ENTRYPOINT_WITHOUT_EXTENSION = "index";
export const RELATIVE_CJS_ENTRYPOINT = path.join(
    RELATIVE_CJS_OUT_DIR_PATH,
    `${RELATIVE_ENTRYPOINT_WITHOUT_EXTENSION}.js`
);
export const RELATIVE_CJS_TYPES_ENTRYPOINT = path.join(
    RELATIVE_CJS_OUT_DIR_PATH,
    `${RELATIVE_ENTRYPOINT_WITHOUT_EXTENSION}.d.ts`
);
export const RELATIVE_ESM_ENTRYPOINT = path.join(
    RELATIVE_ESM_OUT_DIR_PATH,
    `${RELATIVE_ENTRYPOINT_WITHOUT_EXTENSION}.js`
);
export const RELATIVE_ESM_TYPES_ENTRYPOINT = path.join(
    RELATIVE_CJS_OUT_DIR_PATH,
    `${RELATIVE_ENTRYPOINT_WITHOUT_EXTENSION}.d.ts`
);
