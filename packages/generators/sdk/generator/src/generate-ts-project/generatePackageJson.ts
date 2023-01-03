import produce from "immer";
import { Volume } from "memfs/lib/volume";
import { IPackageJson } from "package-json-type";
import { DependencyType, PackageDependencies } from "../dependency-manager/DependencyManager";
import { getPathToProjectFile } from "./utils";

export const PackageJsonScript = {
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
        files: [Outfile.ESM, Outfile.CJS, Outfile.BROWSER, `${Outfile.BROWSER}.map`, "*.d.ts"],
        exports: {
            ".": {
                import: `./${Outfile.ESM}`,
                module: `./${Outfile.ESM}`,
                require: `./${Outfile.CJS}`,
                browser: `./${Outfile.BROWSER}`,
                default: `./${Outfile.CJS}`,
            },
        },
        types: "./index.d.ts",
        scripts: {
            [PackageJsonScript.FORMAT]: PRETTIER_COMMAND.join(" "),
            [PackageJsonScript.BUILD_ESM]: generateEsbuildCommand({
                platform: "node",
                shouldIncludeSourceMaps: false,
                format: "esm",
                outfile: Outfile.ESM,
                // Node's built-in modules cannot be required due to due an esbuild bug.
                // this is a workaround until https://github.com/evanw/esbuild/pull/2067 merges.
                jsBanner: "import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);",
            }),
            [PackageJsonScript.BUILD_CJS]: generateEsbuildCommand({
                platform: "node",
                shouldIncludeSourceMaps: false,
                format: "cjs",
                outfile: Outfile.CJS,
            }),
            [PackageJsonScript.BUILD_BROWSER]: generateEsbuildCommand({
                platform: "browser",
                shouldIncludeSourceMaps: true,
                format: undefined,
                outfile: Outfile.BROWSER,
            }),
            [PackageJsonScript.BUILD]: [
                `yarn ${PackageJsonScript.BUILD_ESM}`,
                `yarn ${PackageJsonScript.BUILD_CJS}`,
                `yarn ${PackageJsonScript.BUILD_BROWSER}`,
                "tsc",
                "tsc-alias",
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
}: {
    platform: "node" | "browser";
    shouldIncludeSourceMaps: boolean;
    format: "cjs" | "esm" | undefined;
    outfile: string;
    jsBanner?: string;
}): string {
    const parts = ["esbuild", "src/index.ts", "--bundle", `--platform=${platform}`];
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
