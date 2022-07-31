import produce from "immer";
import { Volume } from "memfs/lib/volume";
import { IPackageJson } from "package-json-type";
import { DependencyType, PackageDependencies } from "./DependencyManager";
import { getPathToProjectFile } from "./utils";

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
        main: "./index.js",
        types: "./index.d.ts",
        scripts: {
            [BUILD_PROJECT_SCRIPT_NAME]: [
                // esbuild first so we don't transpile the .d.ts files
                "esbuild $(find . -name '*.ts' -not -path './node_modules/*') --format=cjs --sourcemap --outdir=.",
                "tsc",
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
