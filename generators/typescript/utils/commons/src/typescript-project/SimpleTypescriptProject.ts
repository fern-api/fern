import { RelativeFilePath } from "@fern-api/fs-utils";
import { produce } from "immer";
import { IPackageJson } from "package-json-type";
import { CompilerOptions, ModuleKind, ModuleResolutionKind, ScriptTarget } from "ts-morph";

import { DependencyType } from "../dependency-manager/DependencyManager";
import { mergeExtraConfigs } from "./mergeExtraConfigs";
import { TypescriptProject } from "./TypescriptProject";

export declare namespace SimpleTypescriptProject {
    export interface Init extends TypescriptProject.Init {
        outputEsm: boolean;
        resolutions: Record<string, string>;
        useLegacyExports: boolean;
    }
}

export class SimpleTypescriptProject extends TypescriptProject {
    private outputEsm: boolean;
    private useLegacyExports: boolean;
    private resolutions: Record<string, string>;

    constructor({ outputEsm, resolutions, useLegacyExports, ...superInit }: SimpleTypescriptProject.Init) {
        super(superInit);
        this.outputEsm = outputEsm;
        this.resolutions = resolutions;
        this.useLegacyExports = useLegacyExports ?? false;
    }

    protected async addFilesToVolume(): Promise<void> {
        this.addCommonFilesToVolume();
        await this.generateGitIgnore();
        await this.generateNpmIgnore();
        await this.generateTsConfig();
        await this.generatePackageJson();
    }

    private async generateGitIgnore(): Promise<void> {
        await this.writeFileToVolume(
            RelativeFilePath.of(TypescriptProject.GIT_IGNORE_FILENAME),
            ["node_modules", ".DS_Store", `/${SimpleTypescriptProject.DIST_DIRECTORY}`].join("\n")
        );
    }

    private async generateNpmIgnore(): Promise<void> {
        await this.writeFileToVolume(
            RelativeFilePath.of(TypescriptProject.NPM_IGNORE_FILENAME),
            [
                "node_modules",
                this.packagePath,
                SimpleTypescriptProject.TEST_DIRECTORY,
                SimpleTypescriptProject.GIT_IGNORE_FILENAME,
                ".github",
                SimpleTypescriptProject.FERN_IGNORE_FILENAME,
                SimpleTypescriptProject.PRETTIER_RC_FILENAME,
                "biome.json",
                "tsconfig.json",
                "yarn.lock",
                "pnpm-lock.yaml"
            ].join("\n")
        );
    }

    private async generateTsConfig(): Promise<void> {
        const compilerOptions: CompilerOptions = {
            extendedDiagnostics: true,
            strict: true,
            target: "ES6" as unknown as ScriptTarget,
            moduleResolution: "node" as unknown as ModuleResolutionKind,
            esModuleInterop: true,
            skipLibCheck: true,
            declaration: true,
            outDir: SimpleTypescriptProject.DIST_DIRECTORY,
            rootDir: this.packagePath,
            baseUrl: this.packagePath,
            isolatedModules: true,
            isolatedDeclarations: true
        };

        if (this.useLegacyExports) {
            await this.writeFileToVolume(
                RelativeFilePath.of(TypescriptProject.TS_CONFIG_FILENAME),
                JSON.stringify(
                    {
                        compilerOptions: {
                            ...compilerOptions,
                            module: (this.outputEsm ? "esnext" : "CommonJS") as unknown as ModuleKind,
                            verbatimModuleSyntax: this.outputEsm ? true : undefined, // verbatimModuleSyntax only works with esnext
                            outDir: SimpleTypescriptProject.DIST_DIRECTORY
                        },
                        include: [this.packagePath],
                        exclude: this.testPath.startsWith(this.packagePath) ? [this.testPath] : []
                    },
                    undefined,
                    4
                )
            );
            return;
        }

        const baseTsConfigPath = RelativeFilePath.of(TypescriptProject.TS_CONFIG_BASE_FILENAME);
        await this.writeFileToVolume(
            baseTsConfigPath,
            JSON.stringify(
                {
                    compilerOptions,
                    include: [this.packagePath],
                    exclude: this.testPath.startsWith(this.packagePath) ? [this.testPath] : []
                },
                undefined,
                4
            )
        );

        const cjsCompilerOptions: CompilerOptions = {
            module: "CommonJS" as unknown as ModuleKind,
            outDir: `${SimpleTypescriptProject.DIST_DIRECTORY}/${SimpleTypescriptProject.CJS_DIRECTORY}`
        };

        await this.writeFileToVolume(
            RelativeFilePath.of(TypescriptProject.TS_CONFIG_CJS_FILENAME),
            JSON.stringify(
                {
                    extends: `./${baseTsConfigPath}`,
                    compilerOptions: cjsCompilerOptions,
                    include: [this.packagePath],
                    exclude: this.testPath.startsWith(this.packagePath) ? [this.testPath] : []
                },
                undefined,
                4
            )
        );

        const esmCompilerOptions: CompilerOptions = {
            module: "esnext" as unknown as ModuleKind,
            outDir: `${SimpleTypescriptProject.DIST_DIRECTORY}/${SimpleTypescriptProject.ESM_DIRECTORY}`,
            verbatimModuleSyntax: true
        };

        await this.writeFileToVolume(
            RelativeFilePath.of(TypescriptProject.TS_CONFIG_ESM_FILENAME),
            JSON.stringify(
                {
                    extends: `./${baseTsConfigPath}`,
                    compilerOptions: esmCompilerOptions,
                    include: [this.packagePath],
                    exclude: this.testPath.startsWith(this.packagePath) ? [this.testPath] : []
                },
                undefined,
                4
            )
        );

        await this.writeFileToVolume(
            RelativeFilePath.of(TypescriptProject.TS_CONFIG_FILENAME),
            JSON.stringify(
                {
                    extends: `./${TypescriptProject.TS_CONFIG_CJS_FILENAME}`
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

        if (Object.entries(this.resolutions).length > 0) {
            packageJson = {
                ...packageJson,
                resolutions: this.resolutions
            };
        }

        if (this.useLegacyExports) {
            packageJson = {
                ...packageJson,
                main: "./index.js",
                types: "./index.d.ts",
                scripts: {
                    ...this.getCommonScripts(),
                    [SimpleTypescriptProject.BUILD_SCRIPT_NAME]: "tsc",
                    prepack: `cp -rv ${SimpleTypescriptProject.DIST_DIRECTORY}/. .`,
                    ...packageJson.scripts,
                    ...this.extraScripts
                }
            };
        } else {
            const cjsFile = `./${SimpleTypescriptProject.DIST_DIRECTORY}/${SimpleTypescriptProject.CJS_DIRECTORY}/index.js`;
            const cjsTypesFile = `./${SimpleTypescriptProject.DIST_DIRECTORY}/${SimpleTypescriptProject.CJS_DIRECTORY}/index.d.ts`;
            const mjsFile = `./${SimpleTypescriptProject.DIST_DIRECTORY}/${SimpleTypescriptProject.ESM_DIRECTORY}/index.mjs`;
            const mjsTypesFile = `./${SimpleTypescriptProject.DIST_DIRECTORY}/${SimpleTypescriptProject.ESM_DIRECTORY}/index.d.mts`;
            const defaultTypesExport = this.outputEsm ? mjsTypesFile : cjsTypesFile;
            const defaultExport = this.outputEsm ? mjsFile : cjsFile;
            packageJson = {
                ...packageJson,
                type: this.outputEsm ? "module" : "commonjs",
                main: defaultExport,
                module: mjsFile,
                types: defaultTypesExport,
                exports: {
                    ".": {
                        types: defaultTypesExport,
                        import: {
                            types: mjsTypesFile,
                            default: mjsFile
                        },
                        require: {
                            types: cjsTypesFile,
                            default: cjsFile
                        },
                        default: defaultExport
                    },
                    ...this.getFoldersForExports().reduce((acc, folder) => {
                        const cjsFile = `./${SimpleTypescriptProject.DIST_DIRECTORY}/${SimpleTypescriptProject.CJS_DIRECTORY}/${folder}/index.js`;
                        const cjsTypesFile = `./${SimpleTypescriptProject.DIST_DIRECTORY}/${SimpleTypescriptProject.CJS_DIRECTORY}/${folder}/index.d.ts`;
                        const mjsFile = `./${SimpleTypescriptProject.DIST_DIRECTORY}/${SimpleTypescriptProject.ESM_DIRECTORY}/${folder}/index.mjs`;
                        const mjsTypesFile = `./${SimpleTypescriptProject.DIST_DIRECTORY}/${SimpleTypescriptProject.ESM_DIRECTORY}/${folder}/index.d.mts`;
                        const defaultTypesExport = this.outputEsm ? mjsTypesFile : cjsTypesFile;
                        const defaultExport = this.outputEsm ? mjsFile : cjsFile;

                        return {
                            ...acc,
                            [`./${folder}`]: {
                                types: defaultTypesExport,
                                import: {
                                    types: mjsTypesFile,
                                    default: mjsFile
                                },
                                require: {
                                    types: cjsTypesFile,
                                    default: cjsFile
                                },
                                default: defaultExport
                            }
                        };
                    }, {}),
                    "./package.json": "./package.json"
                },
                files: [
                    SimpleTypescriptProject.DIST_DIRECTORY,
                    SimpleTypescriptProject.REFERENCE_FILENAME,
                    SimpleTypescriptProject.README_FILENAME,
                    SimpleTypescriptProject.LICENSE_FILENAME
                ],
                scripts: {
                    ...this.getCommonScripts(),
                    [SimpleTypescriptProject.BUILD_CJS_SCRIPT_NAME]: `tsc --project ./${TypescriptProject.TS_CONFIG_CJS_FILENAME}`,
                    [SimpleTypescriptProject.BUILD_ESM_SCRIPT_NAME]: [
                        `tsc --project ./${TypescriptProject.TS_CONFIG_ESM_FILENAME}`,
                        `node ${SimpleTypescriptProject.SCRIPTS_DIRECTORY_NAME}/rename-to-esm-files.js ${SimpleTypescriptProject.DIST_DIRECTORY}/${SimpleTypescriptProject.ESM_DIRECTORY}`
                    ].join(" && "),
                    ...packageJson.scripts,
                    ...this.extraScripts
                }
            };
        }

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
                draft.peerDependenciesMeta = {
                    ...this.extraPeerDependenciesMeta
                };
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
                path: false,
                stream: false
                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            } as any;

            if (this.packageManager === "yarn") {
                draft["packageManager"] = "yarn@1.22.22";
            }
            if (this.packageManager === "pnpm") {
                draft["packageManager"] = "pnpm@10.14.0";
            }
            draft["engines"] = {
                node: ">=18.0.0"
            };
            draft["sideEffects"] = false;
        });

        packageJson = mergeExtraConfigs(packageJson, this.extraConfigs);

        await this.writeFileToVolume(RelativeFilePath.of("package.json"), JSON.stringify(packageJson, undefined, 4));
    }

    protected getBuildCommandScript(): string {
        if (this.useLegacyExports) {
            return "tsc";
        } else {
            return `${this.packageManager} ${SimpleTypescriptProject.BUILD_CJS_SCRIPT_NAME} && ${this.packageManager} ${SimpleTypescriptProject.BUILD_ESM_SCRIPT_NAME}`;
        }
    }

    private getDevDependencies(): Record<string, string> {
        return {
            ...this.getCommonDevDependencies()
        };
    }
}
