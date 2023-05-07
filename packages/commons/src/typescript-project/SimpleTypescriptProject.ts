import produce from "immer";
import yaml from "js-yaml";
import { IPackageJson } from "package-json-type";
import { CompilerOptions, ModuleKind, ModuleResolutionKind, ScriptTarget } from "ts-morph";
import { DependencyType, PackageDependencies } from "../dependency-manager/DependencyManager";
import { NpmPackage } from "../NpmPackage";
import { TypescriptProject } from "./TypescriptProject";

const FERN_IGNORE_FILENAME = ".fernignore";

export declare namespace SimpleTypescriptProject {
    export interface Init extends TypescriptProject.Init {
        npmPackage: NpmPackage | undefined;
        dependencies: PackageDependencies;
        outputEsm: boolean;
    }
}

export class SimpleTypescriptProject extends TypescriptProject {
    private static FORMAT_SCRIPT_NAME = "format";
    private static BUILD_SCRIPT_NAME = "build";
    private static PRETTIER_RC_FILENAME = ".prettierrc.yml" as const;

    private npmPackage: NpmPackage | undefined;
    private dependencies: PackageDependencies;
    private outputEsm: boolean;

    constructor({ npmPackage, dependencies, outputEsm, ...superInit }: SimpleTypescriptProject.Init) {
        super(superInit);
        this.npmPackage = npmPackage;
        this.dependencies = dependencies;
        this.outputEsm = outputEsm;
    }

    protected async addFilesToVolume(): Promise<void> {
        await this.generateGitIgnore();
        await this.generateNpmIgnore();
        await this.generatePrettierRc();
        await this.generateTsConfig();
        await this.generatePackageJson();
    }

    protected getYarnFormatCommand(): string[] {
        return [SimpleTypescriptProject.FORMAT_SCRIPT_NAME];
    }

    protected getYarnBuildCommand(): string[] {
        return [SimpleTypescriptProject.BUILD_SCRIPT_NAME];
    }

    private async generateGitIgnore(): Promise<void> {
        await this.writeFileToVolume(
            ".gitignore",
            [
                "node_modules",
                ".DS_Store",
                `/${SimpleTypescriptProject.DIST_DIRECTORY}`,
                ...this.getDistFiles().map((distFile) => `/${distFile}`),
            ].join("\n")
        );
    }

    private async generateNpmIgnore(): Promise<void> {
        await this.writeFileToVolume(
            ".npmignore",
            [
                "node_modules",
                SimpleTypescriptProject.SRC_DIRECTORY,
                ".gitignore",
                ".github",
                FERN_IGNORE_FILENAME,
                SimpleTypescriptProject.PRETTIER_RC_FILENAME,
                "tsconfig.json",
                "yarn.lock",
            ].join("\n")
        );
    }

    private async generatePrettierRc(): Promise<void> {
        await this.writeFileToVolume(
            SimpleTypescriptProject.PRETTIER_RC_FILENAME,
            yaml.dump({
                tabWidth: 4,
                printWidth: 120,
            })
        );
    }

    private async generateTsConfig(): Promise<void> {
        const compilerOptions: CompilerOptions = {
            extendedDiagnostics: true,
            strict: true,
            target: "esnext" as unknown as ScriptTarget,
            module: (this.outputEsm ? "esnext" : "CommonJS") as unknown as ModuleKind,
            moduleResolution: "node" as unknown as ModuleResolutionKind,
            esModuleInterop: true,
            skipLibCheck: true,
            declaration: true,
            noUnusedParameters: true,
            outDir: SimpleTypescriptProject.DIST_DIRECTORY,
            rootDir: SimpleTypescriptProject.SRC_DIRECTORY,
            baseUrl: SimpleTypescriptProject.SRC_DIRECTORY,
        };

        await this.writeFileToVolume(
            "tsconfig.json",
            JSON.stringify(
                {
                    compilerOptions,
                    include: [SimpleTypescriptProject.SRC_DIRECTORY],
                    exclude: [],
                },
                undefined,
                4
            )
        );
    }

    private async generatePackageJson(): Promise<void> {
        let packageJson: IPackageJson = {
            name: this.npmPackage != null ? this.npmPackage.packageName : "test-package",
        };

        if (this.npmPackage != null) {
            packageJson = {
                ...packageJson,
                version: this.npmPackage.version,
                private: this.npmPackage.private,
                repository: this.npmPackage.repoUrl,
            };
        }

        packageJson = {
            ...packageJson,
            main: "./index.js",
            types: "./index.d.ts",
            scripts: {
                [SimpleTypescriptProject.FORMAT_SCRIPT_NAME]: `prettier --write '${SimpleTypescriptProject.SRC_DIRECTORY}/**/*.ts'`,
                [SimpleTypescriptProject.BUILD_SCRIPT_NAME]: "tsc",
                prepack: `cp -rv ${SimpleTypescriptProject.DIST_DIRECTORY}/. .`,
            },
        };

        packageJson = produce(packageJson, (draft) => {
            if (Object.keys(this.dependencies[DependencyType.PROD]).length > 0) {
                draft.dependencies = this.dependencies[DependencyType.PROD];
            }
            if (Object.keys(this.dependencies[DependencyType.PEER]).length > 0) {
                draft.peerDependencies = this.dependencies[DependencyType.PEER];
            }
            draft.devDependencies = {
                ...this.dependencies[DependencyType.DEV],
                ...this.getDevDependencies(),
            };
        });

        await this.writeFileToVolume("package.json", JSON.stringify(packageJson, undefined, 4));
    }

    private getDevDependencies(): Record<string, string> {
        return {
            "@types/node": "17.0.33",
            prettier: "2.7.1",
            typescript: "4.6.4",
        };
    }

    private getDistFiles(): string[] {
        const rootDirectory = this.tsMorphProject.getDirectory(".");
        if (rootDirectory == null) {
            throw new Error("Root ts-morph directory does not exist");
        }

        return [
            ...rootDirectory.getSourceFiles().flatMap((file) => {
                const baseName = file.getBaseNameWithoutExtension();
                return [`${baseName}.d.ts`, `${baseName}.js`];
            }),
            ...rootDirectory.getDirectories().map((directory) => directory.getBaseName()),
        ];
    }
}
