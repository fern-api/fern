import { RelativeFilePath } from "@fern-api/fs-utils";
import produce from "immer";
import yaml from "js-yaml";
import { IPackageJson } from "package-json-type";
import { CompilerOptions, ModuleKind, ModuleResolutionKind, ScriptTarget } from "ts-morph";
import { DependencyType, PackageDependencies } from "../dependency-manager/DependencyManager";
import { NpmPackage } from "../NpmPackage";
import { TypescriptProject } from "./TypescriptProject";

export declare namespace BundledTypescriptProject {
    export interface Init extends TypescriptProject.Init {
        npmPackage: NpmPackage | undefined;
        dependencies: PackageDependencies;
    }
}

export class BundledTypescriptProject extends TypescriptProject {
    private static TYPES_DIRECTORY = "types" as const;
    private static BUILD_SCRIPT_FILENAME = "build.js" as const;
    private static NODE_DIST_DIRECTORY = "node" as const;
    private static BROWSER_DIST_DIRECTORY = "browser" as const;
    private static BROWSER_ESM_DIST_DIRECTORY = `${BundledTypescriptProject.BROWSER_DIST_DIRECTORY}/esm` as const;
    private static BROWSER_CJS_DIST_DIRECTORY = `${BundledTypescriptProject.BROWSER_DIST_DIRECTORY}/cjs` as const;
    private static API_BUNDLE_FILENAME = "index.js" as const;
    private static NON_EXPORTED_FOLDERS = ["core", "serialization"] as const;

    private static FORMAT_SCRIPT_NAME = "format";
    private static COMPILE_SCRIPT_NAME = "compile";
    private static BUNDLE_SCRIPT_NAME = "bundle";
    private static BUILD_SCRIPT_NAME = "build";

    private npmPackage: NpmPackage | undefined;
    private dependencies: PackageDependencies;

    constructor({ npmPackage, dependencies, ...superInit }: BundledTypescriptProject.Init) {
        super(superInit);
        this.npmPackage = npmPackage;
        this.dependencies = dependencies;
    }

    protected async addFilesToVolume(): Promise<void> {
        await this.writeFileToVolume(
            RelativeFilePath.of(BundledTypescriptProject.BUILD_SCRIPT_FILENAME),
            this.getBuildScriptContents()
        );
        await this.generateGitIgnore();
        await this.generatePrettierRc();
        await this.generateStubTypeDeclarations();
        await this.generateTsConfig();
        await this.generatePackageJson();
    }

    protected getYarnFormatCommand(): string[] {
        return [BundledTypescriptProject.FORMAT_SCRIPT_NAME];
    }

    protected getYarnBuildCommand(): string[] {
        return [BundledTypescriptProject.BUILD_SCRIPT_NAME];
    }

    private getBuildScriptContents(): string {
        return `const { build } = require("esbuild");

void main();

async function main() {
    await bundle({
        platform: "node",
        target: "node14",
        format: "cjs",
        outdir: "${BundledTypescriptProject.NODE_DIST_DIRECTORY}",
    });
    await bundle({
        platform: "browser",
        format: "esm",
        outdir: "${BundledTypescriptProject.BROWSER_ESM_DIST_DIRECTORY}",
    });
    await bundle({
        platform: "browser",
        format: "cjs",
        outdir: "${BundledTypescriptProject.BROWSER_CJS_DIST_DIRECTORY}",
    });
}

async function bundle({ platform, target, format, outdir }) {
    await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./${BundledTypescriptProject.SRC_DIRECTORY}/index.ts",
        outfile: \`./${BundledTypescriptProject.DIST_DIRECTORY}/\${outdir}/${
            BundledTypescriptProject.API_BUNDLE_FILENAME
        }\`,
    });
    ${BundledTypescriptProject.NON_EXPORTED_FOLDERS.map(
        (folder) => `await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./${BundledTypescriptProject.SRC_DIRECTORY}/${folder}/index.ts",
        outfile: \`./${BundledTypescriptProject.DIST_DIRECTORY}/\${outdir}/${this.getBundleForNonExportedFolder(
            folder
        )}\`,
    });`
    ).join("\n    ")}
}

async function runEsbuild({ platform, target, format, entryPoint, outfile }) {
    await build({
        platform,
        target,
        format,
        entryPoints: [entryPoint],
        outfile,
        bundle: true,
    }).catch(() => process.exit(1));
}
`;
    }

    private getBundleForNonExportedFolder(folder: string): string {
        return `${folder}.js`;
    }

    private async generateGitIgnore(): Promise<void> {
        await this.writeFileToVolume(
            RelativeFilePath.of(".gitignore"),
            [
                "node_modules",
                ".DS_Store",
                "*.d.ts",
                "dist/",
                "",
                "# yarn berry",
                ".pnp.*",
                ".yarn/*",
                "!.yarn/patches",
                "!.yarn/plugins",
                "!.yarn/releases",
                "!.yarn/sdks",
                "!.yarn/versions"
            ].join("\n")
        );
    }

    private async generatePrettierRc(): Promise<void> {
        await this.writeFileToVolume(
            RelativeFilePath.of(".prettierrc.yml"),
            yaml.dump({
                tabWidth: 4,
                printWidth: 120
            })
        );
    }

    private async generateStubTypeDeclarations(): Promise<void> {
        for (const folder of BundledTypescriptProject.NON_EXPORTED_FOLDERS) {
            await this.writeFileToVolume(
                this.getPathForStubTypesDeclarationFile(folder),
                `// this is needed for older versions of TypeScript
// that don't read the "exports" field in package.json
export * from "./${BundledTypescriptProject.TYPES_DIRECTORY}/${folder}";
            `
            );
        }
    }

    private getAllStubTypeFiles(): RelativeFilePath[] {
        return BundledTypescriptProject.NON_EXPORTED_FOLDERS.map((folder) =>
            this.getPathForStubTypesDeclarationFile(folder)
        );
    }

    private getPathForStubTypesDeclarationFile(folder: string): RelativeFilePath {
        return RelativeFilePath.of(`${folder}.d.ts`);
    }

    private async generateTsConfig(): Promise<void> {
        const compilerOptions: CompilerOptions = {
            extendedDiagnostics: true,
            strict: true,
            target: "ES6" as unknown as ScriptTarget,
            module: "esnext" as unknown as ModuleKind,
            moduleResolution: "node" as unknown as ModuleResolutionKind,
            esModuleInterop: true,
            skipLibCheck: true,
            declaration: true,
            emitDeclarationOnly: true,
            sourceMap: true,
            outDir: BundledTypescriptProject.TYPES_DIRECTORY,
            rootDir: BundledTypescriptProject.SRC_DIRECTORY,
            baseUrl: BundledTypescriptProject.SRC_DIRECTORY
        };

        await this.writeFileToVolume(
            RelativeFilePath.of("tsconfig.json"),
            JSON.stringify(
                {
                    compilerOptions,
                    include: [BundledTypescriptProject.SRC_DIRECTORY],
                    exclude: []
                },
                undefined,
                4
            )
        );
    }

    private async generatePackageJson(): Promise<void> {
        let packageJson: IPackageJson = {
            name: this.npmPackage != null ? this.npmPackage.packageName : "test-package"
        };

        if (this.npmPackage != null) {
            packageJson = {
                ...packageJson,
                version: this.npmPackage.version,
                private: this.npmPackage.private,
                repository: this.npmPackage.repoUrl
            };
        }

        if (this.npmPackage?.license != null) {
            packageJson = {
                ...packageJson,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                license: this.npmPackage.license as any
            };
        }

        packageJson = {
            ...packageJson,
            scripts: {
                ...packageJson.scripts,
                ...this.extraScripts
            }
        };

        packageJson = {
            ...packageJson,
            files: [
                BundledTypescriptProject.DIST_DIRECTORY,
                BundledTypescriptProject.TYPES_DIRECTORY,
                ...this.getAllStubTypeFiles()
            ],
            exports: {
                ".": this.getExportsForBundle(BundledTypescriptProject.API_BUNDLE_FILENAME, {
                    pathToTypesFile: `./${BundledTypescriptProject.TYPES_DIRECTORY}/index.d.ts`
                }),
                ...BundledTypescriptProject.NON_EXPORTED_FOLDERS.reduce(
                    (acc, folder) => ({
                        ...acc,
                        [`./${folder}`]: this.getExportsForBundle(`${this.getBundleForNonExportedFolder(folder)}`, {
                            pathToTypesFile: `./${BundledTypescriptProject.TYPES_DIRECTORY}/${folder}/index.d.ts`
                        })
                    }),
                    {}
                )
            },
            types: `./${BundledTypescriptProject.TYPES_DIRECTORY}/index.d.ts`,
            scripts: {
                [BundledTypescriptProject.FORMAT_SCRIPT_NAME]: "prettier . --write --ignore-unknown",
                [BundledTypescriptProject.COMPILE_SCRIPT_NAME]: "tsc",
                [BundledTypescriptProject.BUNDLE_SCRIPT_NAME]: `node ${BundledTypescriptProject.BUILD_SCRIPT_FILENAME}`,
                [BundledTypescriptProject.BUILD_SCRIPT_NAME]: [
                    `yarn ${BundledTypescriptProject.COMPILE_SCRIPT_NAME}`,
                    `yarn ${BundledTypescriptProject.BUNDLE_SCRIPT_NAME}`
                ].join(" && ")
            }
        };

        packageJson = produce(packageJson, (draft) => {
            if (Object.keys(this.dependencies[DependencyType.PROD]).length > 0) {
                draft.dependencies = {
                    ...this.dependencies[DependencyType.PROD],
                    ...this.extraDependencies
                };
            }
            if (Object.keys(this.dependencies[DependencyType.PEER]).length > 0) {
                draft.peerDependencies = this.dependencies[DependencyType.PEER];
            }
            draft.devDependencies = {
                ...this.dependencies[DependencyType.DEV],
                ...this.getDevDependencies(),
                ...this.extraDevDependencies
            };
        });

        await this.writeFileToVolume(RelativeFilePath.of("package.json"), JSON.stringify(packageJson, undefined, 4));
    }

    private getExportsForBundle(bundleFilename: string, { pathToTypesFile }: { pathToTypesFile: string }) {
        return {
            node: this.getPathToNodeDistFile(bundleFilename),
            import: this.getPathToBrowserEsmDistFile(bundleFilename),
            require: this.getPathToBrowserCjsDistFile(bundleFilename),
            default: this.getPathToBrowserCjsDistFile(bundleFilename),
            types: pathToTypesFile
        };
    }

    private getPathToNodeDistFile(filename: string) {
        return this.getPathToDistFile({ outdir: BundledTypescriptProject.NODE_DIST_DIRECTORY, filename });
    }

    private getPathToBrowserEsmDistFile(filename: string) {
        return this.getPathToDistFile({ outdir: BundledTypescriptProject.BROWSER_ESM_DIST_DIRECTORY, filename });
    }

    private getPathToBrowserCjsDistFile(filename: string) {
        return this.getPathToDistFile({ outdir: BundledTypescriptProject.BROWSER_CJS_DIST_DIRECTORY, filename });
    }

    private getPathToDistFile({ outdir, filename }: { outdir: string; filename: string }) {
        return `./${BundledTypescriptProject.DIST_DIRECTORY}/${outdir}/${filename}`;
    }

    private getDevDependencies(): Record<string, string> {
        return {
            "@types/node": "17.0.33",
            esbuild: "0.16.15",
            prettier: "2.7.1",
            typescript: "4.6.4"
        };
    }
}
