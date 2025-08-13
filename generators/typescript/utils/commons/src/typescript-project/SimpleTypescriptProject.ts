import { produce } from "immer";
import yaml from "js-yaml";
import { IPackageJson } from "package-json-type";
import { CompilerOptions, ModuleKind, ModuleResolutionKind, ScriptTarget } from "ts-morph";

import { RelativeFilePath } from "@fern-api/fs-utils";

import { DependencyType } from "../dependency-manager/DependencyManager";
import { JSR } from "./JSR";
import { TypescriptProject } from "./TypescriptProject";
import { mergeExtraConfigs } from "./mergeExtraConfigs";

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
        await this.generateGitIgnore();
        await this.generateNpmIgnore();
        await this.generatePrettierRc();
        await this.generateTsConfig();
        await this.generatePackageJson();
        if (this.outputJsr) {
            await this.generateJsrJson();
        }
        if (this.packageManager === "pnpm") {
            await this.generatePnpmWorkspace();
        }
    }

    protected getFormatCommand(): string[] {
        return [SimpleTypescriptProject.FORMAT_SCRIPT_NAME];
    }

    protected getBuildCommand(): string[] {
        return [SimpleTypescriptProject.BUILD_SCRIPT_NAME];
    }

    private async generateGitIgnore(): Promise<void> {
        await this.writeFileToVolume(
            RelativeFilePath.of(TypescriptProject.GIT_IGNORE_FILENAME),
            ["node_modules", ".DS_Store", `/${SimpleTypescriptProject.DIST_DIRECTORY}`].join("\n")
        );
    }

    private async generatePnpmWorkspace(): Promise<void> {
        await this.writeFileToVolume(RelativeFilePath.of(TypescriptProject.PNPM_WORKSPACE_FILENAME), "packages: ['.']");
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
                "tsconfig.json",
                "yarn.lock",
                "pnpm-lock.yaml"
            ].join("\n")
        );
    }

    private async generatePrettierRc(): Promise<void> {
        await this.writeFileToVolume(
            RelativeFilePath.of(SimpleTypescriptProject.PRETTIER_RC_FILENAME),
            yaml.dump({
                tabWidth: 4,
                printWidth: 120
            })
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
            baseUrl: this.packagePath
        };

        if (this.useLegacyExports) {
            await this.writeFileToVolume(
                RelativeFilePath.of(TypescriptProject.TS_CONFIG_FILENAME),
                JSON.stringify(
                    {
                        compilerOptions: {
                            ...compilerOptions,
                            module: (this.outputEsm ? "esnext" : "CommonJS") as unknown as ModuleKind,
                            outDir: SimpleTypescriptProject.DIST_DIRECTORY
                        },
                        include: [this.packagePath],
                        exclude: []
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
                    exclude: []
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
                    exclude: []
                },
                undefined,
                4
            )
        );

        const esmCompilerOptions: CompilerOptions = {
            module: "esnext" as unknown as ModuleKind,
            outDir: `${SimpleTypescriptProject.DIST_DIRECTORY}/${SimpleTypescriptProject.ESM_DIRECTORY}`
        };

        await this.writeFileToVolume(
            RelativeFilePath.of(TypescriptProject.TS_CONFIG_ESM_FILENAME),
            JSON.stringify(
                {
                    extends: `./${baseTsConfigPath}`,
                    compilerOptions: esmCompilerOptions,
                    include: [this.packagePath],
                    exclude: []
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
                    [SimpleTypescriptProject.FORMAT_SCRIPT_NAME]: "prettier . --write --ignore-unknown",
                    [SimpleTypescriptProject.BUILD_SCRIPT_NAME]: "tsc",
                    prepack: `cp -rv ${SimpleTypescriptProject.DIST_DIRECTORY}/. .`
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
                    [SimpleTypescriptProject.FORMAT_SCRIPT_NAME]: "prettier . --write --ignore-unknown",
                    [SimpleTypescriptProject.BUILD_SCRIPT_NAME]: `${this.packageManager} ${SimpleTypescriptProject.BUILD_CJS_SCRIPT_NAME} && ${this.packageManager} ${SimpleTypescriptProject.BUILD_ESM_SCRIPT_NAME}`,
                    [SimpleTypescriptProject.BUILD_CJS_SCRIPT_NAME]: `tsc --project ./${TypescriptProject.TS_CONFIG_CJS_FILENAME}`,
                    [SimpleTypescriptProject.BUILD_ESM_SCRIPT_NAME]: [
                        `tsc --project ./${TypescriptProject.TS_CONFIG_ESM_FILENAME}`,
                        `node ${SimpleTypescriptProject.SCRIPTS_DIRECTORY_NAME}/rename-to-esm-files.js ${SimpleTypescriptProject.DIST_DIRECTORY}/${SimpleTypescriptProject.ESM_DIRECTORY}`
                    ].join(" && ")
                }
            };
        }

        packageJson = {
            ...packageJson,
            scripts: {
                ...packageJson.scripts,
                ...this.extraScripts
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

    private async generateJsrJson(): Promise<void> {
        if (this.npmPackage != null) {
            const jsr: JSR = {
                name: this.npmPackage?.packageName,
                version: this.npmPackage.version,
                exports: "src/index.ts"
            };
            await this.writeFileToVolume(RelativeFilePath.of("jsr.json"), JSON.stringify(jsr, undefined, 4));
        }
    }

    private getDevDependencies(): Record<string, string> {
        return {
            "@types/node": "^18.19.70",
            prettier: "^3.4.2",
            typescript: "~5.7.2"
        };
    }
}
