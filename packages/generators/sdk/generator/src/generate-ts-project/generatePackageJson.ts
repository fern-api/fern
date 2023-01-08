import produce from "immer";
import { Volume } from "memfs/lib/volume";
import { IPackageJson } from "package-json-type";
import { DependencyType, PackageDependencies } from "../dependency-manager/DependencyManager";
import {
    API_BUNDLE_FILENAME,
    BROWSER_CJS_DIST_DIRECTORY,
    BROWSER_ESM_DIST_DIRECTORY,
    BUILD_SCRIPT_NAME,
    CORE_BUNDLE_FILENAME,
    DIST_DIRECTORY,
    NODE_DIST_DIRECTORY,
    SERIALIZATION_BUNDLE_FILENAME,
    TYPES_DIRECTORY,
} from "./constants";
import { getPathToProjectFile } from "./utils";

export const PackageJsonScript = {
    COMPILE: "compile",
    BUNDLE: "bundle",
    BUILD: "build",
    FORMAT: "format",
} as const;

export const PRETTIER_COMMAND = ["prettier", "--write", "--print-width", "120", "src/**/*.ts"];

export const DEV_DEPENDENCIES: Record<string, string> = {
    "@types/node": "17.0.33",
    esbuild: "0.16.15",
    prettier: "2.7.1",
    typescript: "4.6.4",
    "tsc-alias": "^1.7.1",
};

export async function generatePackageJson({
    volume,
    packageName,
    packageVersion,
    isPackagePrivate,
    dependencies,
    repositoryUrl,
}: {
    volume: Volume;
    packageName: string;
    packageVersion: string | undefined;
    isPackagePrivate: boolean;
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
        private: isPackagePrivate,
        repository: repositoryUrl,
        files: ["dist", TYPES_DIRECTORY],
        exports: {
            ".": getExports(API_BUNDLE_FILENAME),
            "./core": getExports(CORE_BUNDLE_FILENAME),
            "./serialization": getExports(SERIALIZATION_BUNDLE_FILENAME),
        },
        types: `./${TYPES_DIRECTORY}/index.d.ts`,
        scripts: {
            [PackageJsonScript.FORMAT]: PRETTIER_COMMAND.join(" "),
            [PackageJsonScript.COMPILE]: "tsc && tsc-alias",
            [PackageJsonScript.BUNDLE]: `node ${BUILD_SCRIPT_NAME}`,
            [PackageJsonScript.BUILD]: [`yarn ${PackageJsonScript.COMPILE}`, `yarn ${PackageJsonScript.BUNDLE}`].join(
                " && "
            ),
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

function getExports(filename: string) {
    return {
        node: getPathToNodeDistFile(filename),
        import: getPathToBrowserEsmDistFile(filename),
        require: getPathToBrowserCjsDistFile(filename),
        default: getPathToBrowserCjsDistFile(filename),
    };
}

function getPathToNodeDistFile(filename: string) {
    return getPathToDistFile({ outdir: NODE_DIST_DIRECTORY, filename });
}

function getPathToBrowserEsmDistFile(filename: string) {
    return getPathToDistFile({ outdir: BROWSER_ESM_DIST_DIRECTORY, filename });
}

function getPathToBrowserCjsDistFile(filename: string) {
    return getPathToDistFile({ outdir: BROWSER_CJS_DIST_DIRECTORY, filename });
}

function getPathToDistFile({ outdir, filename }: { outdir: string; filename: string }) {
    return `./${DIST_DIRECTORY}/${outdir}/${filename}`;
}
