import { Volume } from "memfs/lib/volume";
import path from "path";
import { CJS_TSCONFIG_PATH, ESM_TSCONFIG_PATH } from "./generateTsConfig";
import {
    getPathToProjectFile,
    RELATIVE_CJS_OUT_DIR_PATH,
    RELATIVE_ESM_OUT_DIR_PATH,
    RELATIVE_OUT_DIR_PATH,
} from "./utils";

export const COMPILE_PROJECT_SCRIPT_NAME = "compile";
export const BUILD_PROJECT_SCRIPT_NAME = "build";

export async function generatePackageJson({
    volume,
    packageName,
    packageVersion,
    packageDependencies = {},
    packageDevDependencies = {},
}: {
    volume: Volume;
    packageName: string;
    packageVersion: string;
    packageDependencies?: Record<string, string>;
    packageDevDependencies?: Record<string, string>;
}): Promise<void> {
    await volume.promises.writeFile(
        getPathToProjectFile("package.json"),
        JSON.stringify(
            {
                name: packageName,
                version: packageVersion,
                files: [RELATIVE_OUT_DIR_PATH],
                main: `./${path.join(RELATIVE_CJS_OUT_DIR_PATH, "index.js")}`,
                types: `./${path.join(RELATIVE_ESM_OUT_DIR_PATH, "index.d.ts")}`,
                exports: {
                    ".": {
                        require: `./${path.join(RELATIVE_CJS_OUT_DIR_PATH, "index.js")}`,
                        default: `./${path.join(RELATIVE_ESM_OUT_DIR_PATH, "index.js")}`,
                    },
                },
                sideEffects: false,
                scripts: {
                    [COMPILE_PROJECT_SCRIPT_NAME]: `tsc --project ${ESM_TSCONFIG_PATH}`,
                    [BUILD_PROJECT_SCRIPT_NAME]: [
                        `tsc --project ${ESM_TSCONFIG_PATH}`,
                        `tsc --project ${CJS_TSCONFIG_PATH}`,
                        `echo '{ "type": "commonjs" }' > ${path.join(RELATIVE_CJS_OUT_DIR_PATH, "package.json")}`,
                        `echo '{ "type": "module" }' > ${path.join(RELATIVE_ESM_OUT_DIR_PATH, "package.json")}`,
                    ].join(" && "),
                },
                dependencies: {
                    ...packageDependencies,
                },
                devDependencies: {
                    ...packageDevDependencies,
                    "@types/node": "^17.0.33",
                    typescript: "^4.6.4",
                },
            },
            undefined,
            4
        )
    );
}
