import { produce } from "immer";
import yaml from "js-yaml";
import { IPackageJson } from "package-json-type";
import { CompilerOptions, ModuleKind, ModuleResolutionKind, ScriptTarget } from "ts-morph";

import { RelativeFilePath } from "@fern-api/fs-utils";

import { NpmPackage } from "../NpmPackage";
import { DependencyType, PackageDependencies } from "../dependency-manager/DependencyManager";
import { JSR } from "./JSR";
import { TypescriptProject } from "./TypescriptProject";
import { mergeExtraConfigs } from "./mergeExtraConfigs";

const FERN_IGNORE_FILENAME = ".fernignore";

export declare namespace SimpleTypescriptProject {
    export interface Init extends TypescriptProject.Init {
        outputJsr: boolean;
        npmPackage: NpmPackage | undefined;
        dependencies: PackageDependencies;
        outputEsm: boolean;
        resolutions: Record<string, string>;
        extraConfigs: Record<string, unknown> | undefined;
    }
}

export class SimpleTypescriptProject extends TypescriptProject {
    private static FORMAT_SCRIPT_NAME = "format";
    private static BUILD_SCRIPT_NAME = "build";
    private static PRETTIER_RC_FILENAME = ".prettierrc.yml" as const;

    private npmPackage: NpmPackage | undefined;
    private dependencies: PackageDependencies;
    private outputEsm: boolean;
    private resolutions: Record<string, string>;
    private extraConfigs: Record<string, unknown> | undefined;
    private outputJsr: boolean;

    constructor({
        npmPackage,
        dependencies,
        outputEsm,
        resolutions,
        extraConfigs,
        outputJsr,
        ...superInit
    }: SimpleTypescriptProject.Init) {
        super(superInit);
        this.npmPackage = npmPackage;
        this.dependencies = dependencies;
        this.outputEsm = outputEsm;
        this.resolutions = resolutions;
        this.extraConfigs = extraConfigs;
        this.outputJsr = outputJsr ?? false;
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
    }

    protected getYarnFormatCommand(): string[] {
        return [SimpleTypescriptProject.FORMAT_SCRIPT_NAME];
    }

    protected getYarnBuildCommand(): string[] {
        return [SimpleTypescriptProject.BUILD_SCRIPT_NAME];
    }

    private async generateGitIgnore(): Promise<void> {
        await this.writeFileToVolume(
            RelativeFilePath.of(".gitignore"),
            ["node_modules", ".DS_Store", `/${SimpleTypescriptProject.DIST_DIRECTORY}`].join("\n")
        );
    }

    private async generateNpmIgnore(): Promise<void> {
        await this.writeFileToVolume(
            RelativeFilePath.of(".npmignore"),
            [
                "node_modules",
                SimpleTypescriptProject.SRC_DIRECTORY,
                SimpleTypescriptProject.TEST_DIRECTORY,
                ".gitignore",
                ".github",
                FERN_IGNORE_FILENAME,
                SimpleTypescriptProject.PRETTIER_RC_FILENAME,
                "tsconfig.json",
                "yarn.lock"
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
            module: (this.outputEsm ? "esnext" : "CommonJS") as unknown as ModuleKind,
            moduleResolution: "node" as unknown as ModuleResolutionKind,
            esModuleInterop: true,
            skipLibCheck: true,
            declaration: true,
            outDir: SimpleTypescriptProject.DIST_DIRECTORY,
            rootDir: SimpleTypescriptProject.SRC_DIRECTORY,
            baseUrl: SimpleTypescriptProject.SRC_DIRECTORY
        };

        await this.writeFileToVolume(
            RelativeFilePath.of("tsconfig.json"),
            JSON.stringify(
                {
                    compilerOptions,
                    include: [SimpleTypescriptProject.SRC_DIRECTORY],
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

        if (Object.entries(this.resolutions).length > 0) {
            packageJson = {
                ...packageJson,
                resolutions: this.resolutions
            };
        }

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

        packageJson = {
            ...packageJson,
            scripts: {
                ...packageJson.scripts,
                ...this.extraScripts
            }
        };

        packageJson = produce(packageJson, (draft) => {
            if (Object.keys(this.dependencies[DependencyType.PROD]).length > 0) {
                draft.dependencies = {
                    ...this.dependencies[DependencyType.PROD],
                    ...this.extraDependencies
                };
            }
            if (
                Object.keys(this.dependencies[DependencyType.PEER]).length > 0 ||
                Object.keys(this.extraPeerDependencies).length > 0
            ) {
                draft.peerDependencies = {
                    ...this.dependencies[DependencyType.PEER],
                    ...this.extraPeerDependencies
                };
            }
            if (Object.keys(this.extraPeerDependenciesMeta).length > 0) {
                draft.peerDependenciesMeta = {
                    ...this.extraPeerDependenciesMeta
                };
            }
            draft.devDependencies = {
                ...this.dependencies[DependencyType.DEV],
                ...this.getDevDependencies(),
                ...this.extraDevDependencies
            };

            draft.browser = {
                fs: false,
                os: false,
                path: false
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
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
            "@types/node": "^17.0.41",
            prettier: "^3.4.2",
            typescript: "~5.7.2"
        };
    }
}
