import produce from "immer";
import { Volume } from "memfs/lib/volume";
import { IPackageJson } from "package-json-type";
import { DependencyType, PackageDependencies } from "../dependency-manager/DependencyManager";
import { SRC_DIRECTORY, TYPES_DIRECTORY } from "./constants";
import { getPathToProjectFile } from "./utils";

export const PackageJsonScript = {
    COMPILE: "compile",
    BUILD: "build",
    BUILD_NODE: "build:node",
    BUILD_ESM: "build:esm",
    BUILD_CJS: "build:cjs",
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

const Outfile = {
    NODE: "node.cjs",
    ESM: "index.mjs",
    CJS: "index.cjs",
} as const;

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
        files: [Outfile.ESM, Outfile.CJS, Outfile.NODE, TYPES_DIRECTORY],
        exports: {
            ".": {
                node: `./${Outfile.NODE}`,
                import: `./${Outfile.ESM}`,
                require: `./${Outfile.CJS}`,
                default: `./${Outfile.CJS}`,
            },
        },
        types: `./${TYPES_DIRECTORY}/index.d.ts`,
        scripts: {
            [PackageJsonScript.FORMAT]: PRETTIER_COMMAND.join(" "),
            [PackageJsonScript.COMPILE]: "tsc && tsc-alias",
            [PackageJsonScript.BUILD_NODE]: generateEsbuildCommand({
                platform: "node",
                shouldIncludeSourceMaps: false,
                format: undefined,
                outfile: Outfile.NODE,
                // Node's built-in modules cannot be required due to due an esbuild bug.
                // this is a workaround until https://github.com/evanw/esbuild/pull/2067 merges.
                jsBanner: "import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);",
                packageName,
            }),
            [PackageJsonScript.BUILD_ESM]: generateEsbuildCommand({
                platform: "browser",
                shouldIncludeSourceMaps: false,
                format: "esm",
                outfile: Outfile.ESM,
                packageName,
            }),
            [PackageJsonScript.BUILD_CJS]: generateEsbuildCommand({
                platform: "browser",
                shouldIncludeSourceMaps: false,
                format: "cjs",
                outfile: Outfile.CJS,
                packageName,
            }),
            [PackageJsonScript.BUILD]: [
                `yarn ${PackageJsonScript.COMPILE}`,
                `yarn ${PackageJsonScript.BUILD_NODE}`,
                `yarn ${PackageJsonScript.BUILD_ESM}`,
                `yarn ${PackageJsonScript.BUILD_CJS}`,
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

function generateEsbuildCommand({
    platform,
    shouldIncludeSourceMaps,
    format,
    outfile,
    jsBanner,
    packageName,
}: {
    platform: "node" | "browser";
    shouldIncludeSourceMaps: boolean;
    format: "cjs" | "esm" | undefined;
    outfile: string;
    jsBanner?: string;
    packageName: string;
}): string {
    const parts = [
        "esbuild",
        `${SRC_DIRECTORY}/index.ts`,
        "--bundle",
        `--platform=${platform}`,
        "--packages=external",
        // matches up with tsconfig paths
        `--alias:${packageName}=./${SRC_DIRECTORY}`,
    ];
    if (shouldIncludeSourceMaps) {
        parts.push("--sourcemap");
    }
    if (format != null) {
        parts.push(`--format=${format}`);
    }
    if (jsBanner != null) {
        parts.push(`--banner:js="${jsBanner}"`);
    }
    parts.push(`--outfile=${outfile}`);

    return parts.join(" ");
}
