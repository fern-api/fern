import { DependencyType, PackageDependencies } from "@fern-typescript/commons";
import produce from "immer";
import { Volume } from "memfs/lib/volume";
import { IPackageJson } from "package-json-type";
import { SRC_DIRECTORY } from "./constants";
import { getPathToProjectFile } from "./utils";

export const PackageJsonScript = {
    BUILD: "build",
    FORMAT: "format",
} as const;

export const DEV_DEPENDENCIES: Record<string, string> = {
    "@types/node": "17.0.33",
    prettier: "2.7.1",
    typescript: "4.6.4",
};

export async function generatePackageJson({
    volume,
    dependencies,
}: {
    volume: Volume;
    dependencies: PackageDependencies | undefined;
}): Promise<void> {
    let packageJson: IPackageJson = {
        scripts: {
            [PackageJsonScript.FORMAT]: `prettier --write '${SRC_DIRECTORY}/**/*.ts'`,
            [PackageJsonScript.BUILD]: "tsc",
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
            ...DEV_DEPENDENCIES,
        };
    });

    await volume.promises.writeFile(getPathToProjectFile("package.json"), JSON.stringify(packageJson, undefined, 4));
}
