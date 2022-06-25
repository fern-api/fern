import produce from "immer";
import { Volume } from "memfs/lib/volume";
import { IPackageJson } from "package-json-type";
import { DependencyType, PackageDependencies } from "../dependencies/DependencyManager";
import {
    getPathToProjectFile,
    RELATIVE_ENTRYPOINT,
    RELATIVE_OUT_DIR_PATH,
    RELATIVE_SRC_PATH,
    RELATIVE_TYPES_ENTRYPOINT,
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
        main: `./${RELATIVE_ENTRYPOINT}`,
        types: `./${RELATIVE_TYPES_ENTRYPOINT}`,
        scripts: {
            [BUILD_PROJECT_SCRIPT_NAME]: `tsc && esbuild $(find ${RELATIVE_SRC_PATH} -name '*.ts') --outdir=${RELATIVE_OUT_DIR_PATH}`,
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
            "@types/node": "17.0.33",
            esbuild: "0.14.47",
            typescript: "4.6.4",
        };
    });

    await volume.promises.writeFile(
        getPathToProjectFile("package.json"),

        JSON.stringify(packageJson, undefined, 4)
    );
}
