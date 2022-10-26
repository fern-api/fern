import { DependencyType } from "@fern-typescript/commons";
import produce from "immer";
import { Volume } from "memfs/lib/volume";
import { IPackageJson } from "package-json-type";
import { PackageDependencies } from "../dependency-manager/DependencyManager";
import { OUTPUT_DIRECTORY, SRC_DIRECTORY } from "./constants";
import { getPathToProjectFile } from "./utils";

export const PackageJsonScript = {
    BUILD: "build",
    FORMAT: "format",
} as const;

export const DEV_DEPENDENCIES: Record<string, string> = {
    "@types/node": "17.0.33",
    esbuild: "0.14.47",
    prettier: "2.7.1",
    typescript: "4.6.4",
};

export async function generatePackageJson({
    volume,
    packageName,
    packageVersion,
    dependencies,
    repositoryUrl,
}: {
    volume: Volume;
    packageName: string;
    packageVersion: string | undefined;
    repositoryUrl: string | undefined;
    dependencies: PackageDependencies | undefined;
}): Promise<void> {
    let packageJson: IPackageJson = {
        name: packageName,
    };

    if (packageVersion != null) {
        packageJson = {
            ...packageJson,
            version: packageVersion,
        };
    }

    packageJson = {
        ...packageJson,
        version: packageVersion,
        repository: repositoryUrl,
        files: [`./${OUTPUT_DIRECTORY}`, "./index.d.ts"],
        main: `./${OUTPUT_DIRECTORY}/index.js`,
        types: "./index.d.ts",
        exports: {
            ".": {
                require: `./${OUTPUT_DIRECTORY}/index.js`,
                import: `./${OUTPUT_DIRECTORY}/index.js`,
                types: "./index.d.ts",
            },
        },
        scripts: {
            [PackageJsonScript.FORMAT]: `prettier --write --print-width 120 '${SRC_DIRECTORY}/**/*.ts'`,
            [PackageJsonScript.BUILD]: [
                `esbuild $(find ${SRC_DIRECTORY} -name '*.ts') --format=cjs --sourcemap --outdir=${OUTPUT_DIRECTORY}`,
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
            ...DEV_DEPENDENCIES,
        };
    });

    await volume.promises.writeFile(getPathToProjectFile("package.json"), JSON.stringify(packageJson, undefined, 4));
}
