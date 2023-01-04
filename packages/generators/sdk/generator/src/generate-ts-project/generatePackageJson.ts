import produce from "immer";
import { Volume } from "memfs/lib/volume";
import { IPackageJson } from "package-json-type";
import { DependencyType, PackageDependencies } from "../dependency-manager/DependencyManager";
import { SRC_DIRECTORY, TYPES_DIRECTORY } from "./constants";
import { getPathToProjectFile } from "./utils";

export const PackageJsonScript = {
    COMPILE: "compile",
    BUILD: "build",
    BUILD_ESM: "build:esm",
    BUILD_CJS: "build:cjs",
    BUILD_BROWSER: "build:browser",
    FORMAT: "format",
} as const;

export const PRETTIER_COMMAND = ["prettier", "--write", "--print-width", "120", "src/**/*.ts"];

export const DEV_DEPENDENCIES: Record<string, string> = {
    "@types/node": "17.0.33",
    esbuild: "0.16.13",
    prettier: "2.7.1",
    typescript: "4.6.4",
    "tsc-alias": "^1.7.1",
};

const Outfile = {
    ESM: "index.mjs",
    CJS: "index.cjs",
    BROWSER: "browser.js",
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
        files: [Outfile.ESM, Outfile.CJS, Outfile.BROWSER, `${Outfile.BROWSER}.map`, TYPES_DIRECTORY],
        exports: {
            ".": {
                import: `./${Outfile.ESM}`,
                require: `./${Outfile.CJS}`,
                module: `./${Outfile.BROWSER}`,
                browser: `./${Outfile.BROWSER}`,
                default: `./${Outfile.CJS}`,
            },
        },
        types: `./${TYPES_DIRECTORY}/index.d.ts`,
        scripts: {
            [PackageJsonScript.FORMAT]: PRETTIER_COMMAND.join(" "),
            [PackageJsonScript.COMPILE]: "tsc && tsc-alias",
            [PackageJsonScript.BUILD_ESM]: generateEsbuildCommand({
                platform: "node",
                shouldIncludeSourceMaps: false,
                format: "esm",
                outfile: Outfile.ESM,
                // Node's built-in modules cannot be required due to due an esbuild bug.
                // this is a workaround until https://github.com/evanw/esbuild/pull/2067 merges.
                jsBanner: "import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);",
                packageName,
            }),
            [PackageJsonScript.BUILD_CJS]: generateEsbuildCommand({
                platform: "node",
                shouldIncludeSourceMaps: false,
                format: "cjs",
                outfile: Outfile.CJS,
                packageName,
            }),
            [PackageJsonScript.BUILD_BROWSER]: generateEsbuildCommand({
                platform: "browser",
                shouldIncludeSourceMaps: true,
                format: undefined,
                outfile: Outfile.BROWSER,
                packageName,
            }),
            [PackageJsonScript.BUILD]: [
                `yarn ${PackageJsonScript.COMPILE}`,
                `yarn ${PackageJsonScript.BUILD_ESM}`,
                `yarn ${PackageJsonScript.BUILD_CJS}`,
                `yarn ${PackageJsonScript.BUILD_BROWSER}`,
            ].join(" && "),
        },
    };

    packageJson = produce(packageJson, (draft) => {
        draft.dependencies = {
            ...dependencies?.[DependencyType.PROD],
            module: "^1.2.5",
        };
        if (dependencies != null && Object.keys(dependencies[DependencyType.PEER]).length > 0) {
            draft.peerDependencies = dependencies[DependencyType.PEER];
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
