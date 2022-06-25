import produce from "immer";
import { Volume } from "memfs/lib/volume";
import { IPackageJson } from "package-json-type";
import path from "path";
import { DependencyType, PackageDependencies } from "../dependencies/DependencyManager";
import { CJS_TSCONFIG_PATH, ESM_TSCONFIG_PATH } from "./generateTsConfig";
import {
    getPathToProjectFile,
    RELATIVE_CJS_ENTRYPOINT,
    RELATIVE_CJS_OUT_DIR_PATH,
    RELATIVE_CJS_TYPES_ENTRYPOINT,
    RELATIVE_ESM_ENTRYPOINT,
    RELATIVE_ESM_OUT_DIR_PATH,
    RELATIVE_OUT_DIR_PATH,
} from "./utils";

export const BUILD_PROJECT_SCRIPT_NAME = "build";

export async function generatePackageJson({
    volume,
    packageName,
    packageVersion,
    dependencies,
}: {
    volume: Volume;
    packageName: string;
    packageVersion: string | undefined;
    dependencies: PackageDependencies | undefined;
}): Promise<void> {
    let packageJson: IPackageJson = {
        name: packageName,
    };

    if (packageVersion != null) {
        packageJson = produce(packageJson, (draft) => {
            draft.version = packageVersion;
        });
    }

    packageJson = {
        ...packageJson,
        version: packageVersion,
        files: [RELATIVE_OUT_DIR_PATH],
        main: `./${RELATIVE_CJS_ENTRYPOINT}`,
        types: `./${RELATIVE_CJS_TYPES_ENTRYPOINT}`,
        exports: {
            ".": {
                require: `./${RELATIVE_CJS_ENTRYPOINT}`,
                default: `./${RELATIVE_ESM_ENTRYPOINT}`,
            },
        },
        sideEffects: false,
        scripts: {
            // TODO make these scripts more DRY
            [BUILD_PROJECT_SCRIPT_NAME]: `run-p ${BUILD_PROJECT_SCRIPT_NAME}:esm ${BUILD_PROJECT_SCRIPT_NAME}:cjs`,
            [`${BUILD_PROJECT_SCRIPT_NAME}:esm`]: [
                `tsc --project ${ESM_TSCONFIG_PATH}`,
                `echo '{ "type": "module" }' > ${path.join(RELATIVE_ESM_OUT_DIR_PATH, "package.json")}`,
            ].join(" && "),
            [`${BUILD_PROJECT_SCRIPT_NAME}:cjs`]: [
                `tsc --project ${CJS_TSCONFIG_PATH}`,
                `echo '{ "type": "commonjs" }' > ${path.join(RELATIVE_CJS_OUT_DIR_PATH, "package.json")}`,
            ].join(" && "),
        },
    };

    packageJson = produce(packageJson, (draft) => {
        if (dependencies != null) {
            if (Object.keys(dependencies[DependencyType.PROD]).length > 0) {
                draft.dependencies = dependencies[DependencyType.PROD];
            }
            if (Object.keys(dependencies[DependencyType.PEER]).length > 0) {
                draft.peerDependencies = dependencies[DependencyType.PEER];
            }
        }
        draft.devDependencies = {
            ...dependencies?.[DependencyType.DEV],
            "@types/node": "^17.0.33",
            "npm-run-all": "^4.1.5",
            typescript: "^4.6.4",
        };
    });

    await volume.promises.writeFile(
        getPathToProjectFile("package.json"),

        JSON.stringify(packageJson, undefined, 4)
    );
}
