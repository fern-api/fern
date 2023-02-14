import produce from "immer";
import yaml from "js-yaml";
import { IPackageJson } from "package-json-type";
import { CompilerOptions, ModuleKind, ModuleResolutionKind, ScriptTarget } from "ts-morph";
import { DependencyType, PackageDependencies } from "../dependency-manager/DependencyManager";
import { NpmPackage } from "../NpmPackage";
import { TypescriptProject } from "./TypescriptProject";

export declare namespace SimpleTypescriptProject {
    export interface Init extends TypescriptProject.Init {
        npmPackage: NpmPackage;
        dependencies: PackageDependencies;
        outputEsm: boolean;
    }
}

export class SimpleTypescriptProject extends TypescriptProject {
    private static FORMAT_SCRIPT_NAME = "format";
    private static BUILD_SCRIPT_NAME = "build";

    private npmPackage: NpmPackage;
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
                SimpleTypescriptProject.DIST_DIRECTORY,
                ...this.getDistFiles(),
                "",
                "# yarn berry",
                ".pnp.*",
                ".yarn/*",
                "!.yarn/patches",
                "!.yarn/plugins",
                "!.yarn/releases",
                "!.yarn/sdks",
                "!.yarn/versions",
            ].join("\n")
        );
    }

    private async generatePrettierRc(): Promise<void> {
        await this.writeFileToVolume(
            ".prettierrc.yml",
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
            noUnusedLocals: true,
            noUnusedParameters: true,
            outDir: SimpleTypescriptProject.DIST_DIRECTORY,
            rootDir: SimpleTypescriptProject.SRC_DIRECTORY,
            baseUrl: SimpleTypescriptProject.SRC_DIRECTORY,
            paths: {
                [this.npmPackage.packageName]: ["."],
            },
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
            name: this.npmPackage.packageName,
            version: this.npmPackage.version,
        };

        packageJson = {
            ...packageJson,
            private: this.npmPackage.private,
            repository: this.npmPackage.repoUrl,
            files: this.getDistFiles().map((filepath) => `./${filepath}`),
            main: "./index.js",
            types: "./index.d.ts",
            scripts: {
                [SimpleTypescriptProject.FORMAT_SCRIPT_NAME]: `prettier --write '${SimpleTypescriptProject.SRC_DIRECTORY}/**/*.ts'`,
                [SimpleTypescriptProject.BUILD_SCRIPT_NAME]: "tsc && tsc-alias",
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
            "tsc-alias": "1.7.1",
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
