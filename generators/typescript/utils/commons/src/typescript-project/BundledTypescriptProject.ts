import { produce } from "immer";
import yaml from "js-yaml";
import { IPackageJson } from "package-json-type";
import { CompilerOptions, ModuleKind, ModuleResolutionKind, ScriptTarget } from "ts-morph";

import { RelativeFilePath } from "@fern-api/fs-utils";

import { DependencyType } from "../dependency-manager/DependencyManager";
import { JSR } from "./JSR";
import { TypescriptProject } from "./TypescriptProject";
import { mergeExtraConfigs } from "./mergeExtraConfigs";

export declare namespace BundledTypescriptProject {
    export interface Init extends TypescriptProject.Init {}
}

export class BundledTypescriptProject extends TypescriptProject {
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
        if (this.outputJsr) {
            await this.generateJsrJson();
        }
        if(this.packageManager === "pnpm"){
            await this.generatePnpmWorkspace();
        }
    }

    protected getFormatCommand(): string[] {
        return [BundledTypescriptProject.FORMAT_SCRIPT_NAME];
    }

    protected getBuildCommand(): string[] {
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
        entryPoint: "./${this.packagePath}/index.ts",
        outfile: \`./${TypescriptProject.DIST_DIRECTORY}/\${outdir}/${BundledTypescriptProject.API_BUNDLE_FILENAME}\`,
    });
    ${this.getFoldersForExports()
        .map(
            (folder) => `await runEsbuild({
        platform,
        target,
        format,
        entryPoint: "./${this.packagePath}/${folder}/index.ts",
        outfile: \`./${BundledTypescriptProject.DIST_DIRECTORY}/\${outdir}/${this.getBundleForNonExportedFolder(
            folder
        )}\`,
    });`
        )
        .join("\n    ")}
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
            RelativeFilePath.of(TypescriptProject.GIT_IGNORE_FILENAME),
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
                "!.yarn/versions",
                "# pnpm",
                ".pnpm-store/",
                ".pnpm-debug.log"
            ].join("\n")
        );
    }

    private async generatePnpmWorkspace(): Promise<void> {
        await this.writeFileToVolume(
            RelativeFilePath.of(TypescriptProject.PNPM_WORKSPACE_FILENAME),
            "packages: ['.']"
        );
    }

    private async generatePrettierRc(): Promise<void> {
        await this.writeFileToVolume(
            RelativeFilePath.of(TypescriptProject.PRETTIER_RC_FILENAME),
            yaml.dump({
                tabWidth: 4,
                printWidth: 120
            })
        );
    }

    private async generateStubTypeDeclarations(): Promise<void> {
        for (const folder of this.getFoldersForExports()) {
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
        return this.getFoldersForExports().map((folder) => this.getPathForStubTypesDeclarationFile(folder));
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
            rootDir: this.packagePath,
            baseUrl: this.packagePath
        };

        await this.writeFileToVolume(
            RelativeFilePath.of(TypescriptProject.TS_CONFIG_FILENAME),
            JSON.stringify(
                {
                    compilerOptions,
                    include: [this.packagePath],
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
                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
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
                ".": this.getExportsForBundle({
                    bundleFilename: BundledTypescriptProject.API_BUNDLE_FILENAME,
                    pathToTypesFile: `./${BundledTypescriptProject.TYPES_DIRECTORY}/index.d.ts`
                }),
                ...this.getFoldersForExports().reduce(
                    (acc, folder) => ({
                        ...acc,
                        [`./${folder}`]: this.getExportsForBundle({
                            bundleFilename: this.getBundleForNonExportedFolder(folder),
                            pathToTypesFile: `./${BundledTypescriptProject.TYPES_DIRECTORY}/${folder}/index.d.ts`
                        })
                    }),
                    {}
                ),
                "./package.json": "./package.json"
            },
            types: `./${BundledTypescriptProject.TYPES_DIRECTORY}/index.d.ts`,
            scripts: {
                [BundledTypescriptProject.FORMAT_SCRIPT_NAME]: "prettier . --write --ignore-unknown",
                [BundledTypescriptProject.COMPILE_SCRIPT_NAME]: "tsc",
                [BundledTypescriptProject.BUNDLE_SCRIPT_NAME]: `node ${BundledTypescriptProject.BUILD_SCRIPT_FILENAME}`,
                [BundledTypescriptProject.BUILD_SCRIPT_NAME]: [
                    `${this.packageManager} ${BundledTypescriptProject.COMPILE_SCRIPT_NAME}`,
                    `${this.packageManager} ${BundledTypescriptProject.BUNDLE_SCRIPT_NAME}`
                ].join(" && ")
            }
        };

        packageJson = produce(packageJson, (draft) => {
            const dependencies = {
                ...this.dependencies[DependencyType.PROD],
                ...this.extraDependencies
            };
            if (Object.keys(dependencies).length > 0) {
                draft.dependencies = dependencies;
            }
            const peerDependencies = {
                ...this.dependencies[DependencyType.PEER],
                ...this.extraPeerDependencies
            };
            if (Object.keys(peerDependencies).length > 0) {
                draft.peerDependencies = peerDependencies;
            }

            if (Object.keys(this.extraPeerDependenciesMeta).length > 0) {
                draft.peerDependenciesMeta = { ...this.extraPeerDependenciesMeta };
            }

            const devDependencies = {
                ...this.dependencies[DependencyType.DEV],
                ...this.getDevDependencies(),
                ...this.extraDevDependencies
            };
            if (Object.keys(devDependencies).length > 0) {
                draft.devDependencies = devDependencies;
            }

            draft.browser = {
                fs: false,
                os: false,
                path: false
                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            } as any;

            draft["packageManager"] = "yarn@1.22.22";
            draft["engines"] = {
                node: ">=18.0.0"
            };
            draft["sideEffects"] = false;
        });

        packageJson = mergeExtraConfigs(packageJson, this.extraConfigs);

        await this.writeFileToVolume(
            RelativeFilePath.of(TypescriptProject.PACKAGE_JSON_FILENAME),
            JSON.stringify(packageJson, undefined, 4)
        );
    }

    private async generateJsrJson(): Promise<void> {
        if (this.npmPackage != null) {
            const jsr: JSR = {
                name: this.npmPackage?.packageName,
                version: this.npmPackage.version,
                exports: "src/index.ts"
            };
            await this.writeFileToVolume(
                RelativeFilePath.of(TypescriptProject.JSR_JSON_FILENAME),
                JSON.stringify(jsr, undefined, 4)
            );
        }
    }

    private getExportsForBundle({
        bundleFilename,
        pathToTypesFile
    }: {
        bundleFilename: string;
        pathToTypesFile: string;
    }): {
        node: string;
        import: string;
        require: string;
        default: string;
        types: string;
    } {
        return {
            node: this.getPathToNodeDistFile(bundleFilename),
            import: this.getPathToBrowserEsmDistFile(bundleFilename),
            require: this.getPathToBrowserCjsDistFile(bundleFilename),
            default: this.getPathToBrowserCjsDistFile(bundleFilename),
            types: pathToTypesFile
        };
    }

    private getPathToNodeDistFile(filename: string): string {
        return this.getPathToDistFile({ outdir: TypescriptProject.NODE_DIST_DIRECTORY, filename });
    }

    private getPathToBrowserEsmDistFile(filename: string): string {
        return this.getPathToDistFile({ outdir: TypescriptProject.BROWSER_ESM_DIST_DIRECTORY, filename });
    }

    private getPathToBrowserCjsDistFile(filename: string): string {
        return this.getPathToDistFile({ outdir: TypescriptProject.BROWSER_CJS_DIST_DIRECTORY, filename });
    }

    private getPathToDistFile({ outdir, filename }: { outdir: string; filename: string }): string {
        return `./${TypescriptProject.DIST_DIRECTORY}/${outdir}/${filename}`;
    }

    private getDevDependencies(): Record<string, string> {
        return {
            "@types/node": "^18.19.70",
            esbuild: "~0.24.2",
            prettier: "^3.4.2",
            typescript: "~5.7.2"
        };
    }
}
