import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { NpmPackage } from "@fern-api/typescript-base";
import { mkdir, writeFile } from "fs/promises";
import Dirent from "memfs/lib/Dirent";
import { Volume } from "memfs/lib/volume";
import path from "path";
import tmp from "tmp-promise";
import { Project } from "ts-morph";
import { PackageDependencies } from "../dependency-manager/DependencyManager";
import { JSR } from "./JSR";
import { PersistedTypescriptProject } from "./PersistedTypescriptProject";

export declare namespace TypescriptProject {
    export interface Init {
        runScripts: boolean;
        tsMorphProject: Project;
        extraFiles: Record<string, string>;
        extraDependencies: Record<string, string>;
        extraPeerDependencies: Record<string, string>;
        extraPeerDependenciesMeta: Record<string, unknown>;
        extraDevDependencies: Record<string, string>;
        extraScripts: Record<string, string>;
        npmPackage: NpmPackage | undefined;
        dependencies: PackageDependencies;
        extraConfigs: Record<string, unknown> | undefined;
        outputJsr: boolean;
        exportSerde: boolean;
        packagePath?: string;
        testPath: string;
        packageManager: "yarn" | "pnpm";
        formatter: "prettier" | "biome" | "oxfmt";
        linter: "biome" | "none";
    }
}

const COMMON_SCRIPTS = {
    BUILD: "build",
    FORMAT: "format",
    FORMAT_CHECK: "format:check",
    LINT: "lint",
    LINT_FIX: "lint:fix",
    CHECK: "check",
    CHECK_FIX: "check:fix"
} as const;
type COMMON_SCRIPTS = (typeof COMMON_SCRIPTS)[keyof typeof COMMON_SCRIPTS];

export abstract class TypescriptProject {
    protected static readonly DEFAULT_SRC_DIRECTORY = "src";
    protected static readonly TEST_DIRECTORY = "tests";
    protected static readonly DIST_DIRECTORY = "dist";
    protected static readonly SCRIPTS_DIRECTORY_NAME = "scripts";

    protected static readonly CJS_DIRECTORY = "cjs";
    protected static readonly ESM_DIRECTORY = "esm";
    protected static readonly TYPES_DIRECTORY = "types";

    protected static readonly BUILD_SCRIPT_FILENAME = "build.js";
    protected static readonly NODE_DIST_DIRECTORY = "node";
    protected static readonly BROWSER_DIST_DIRECTORY = "browser";
    protected static readonly BROWSER_ESM_DIST_DIRECTORY =
        `${TypescriptProject.BROWSER_DIST_DIRECTORY}/${TypescriptProject.ESM_DIRECTORY}` as const;
    protected static readonly BROWSER_CJS_DIST_DIRECTORY =
        `${TypescriptProject.BROWSER_DIST_DIRECTORY}/${TypescriptProject.CJS_DIRECTORY}` as const;
    protected static readonly API_BUNDLE_FILENAME = "index.js";

    protected static readonly PRETTIER_RC_FILENAME = ".prettierrc.yml";
    protected static readonly PRETTIER_IGNORE_FILENAME = ".prettierignore";
    protected static readonly TS_CONFIG_BASE_FILENAME = "tsconfig.base.json";
    protected static readonly TS_CONFIG_FILENAME = "tsconfig.json";
    protected static readonly TS_CONFIG_ESM_FILENAME = "tsconfig.esm.json";
    protected static readonly TS_CONFIG_CJS_FILENAME = "tsconfig.cjs.json";
    protected static readonly PACKAGE_JSON_FILENAME = "package.json";
    protected static readonly JSR_JSON_FILENAME = "jsr.json";
    protected static readonly GIT_IGNORE_FILENAME = ".gitignore";
    protected static readonly NPM_IGNORE_FILENAME = ".npmignore";
    protected static readonly FERN_IGNORE_FILENAME = ".fernignore";
    protected static readonly REFERENCE_FILENAME = "reference.md";
    protected static readonly README_FILENAME = "README.md";
    protected static readonly LICENSE_FILENAME = "LICENSE";
    protected static readonly PNPM_WORKSPACE_FILENAME = "pnpm-workspace.yaml";

    protected static readonly FORMAT_SCRIPT_NAME = COMMON_SCRIPTS.FORMAT;
    protected static readonly CHECK_SCRIPT_NAME = COMMON_SCRIPTS.CHECK;
    protected static readonly CHECK_FIX_SCRIPT_NAME = COMMON_SCRIPTS.CHECK_FIX;
    protected static readonly COMPILE_SCRIPT_NAME = "compile";
    protected static readonly BUNDLE_SCRIPT_NAME = "bundle";
    protected static readonly BUILD_SCRIPT_NAME = "build";
    protected static readonly BUILD_CJS_SCRIPT_NAME = "build:cjs";
    protected static readonly BUILD_ESM_SCRIPT_NAME = "build:esm";

    private readonly exportSerde: boolean;
    protected readonly npmPackage: NpmPackage | undefined;
    protected readonly dependencies: PackageDependencies;
    protected readonly extraConfigs: Record<string, unknown> | undefined;
    protected readonly outputJsr: boolean;
    protected readonly volume = new Volume();
    public readonly tsMorphProject: Project;
    public readonly extraFiles: Record<string, string>;
    protected readonly extraDependencies: Record<string, string>;
    protected readonly extraDevDependencies: Record<string, string>;
    protected readonly extraPeerDependenciesMeta: Record<string, unknown>;
    protected readonly extraPeerDependencies: Record<string, string>;
    protected readonly extraScripts: Record<string, string>;
    protected readonly packagePath: string;
    protected readonly testPath: string;
    protected readonly packageManager: "yarn" | "pnpm";
    private readonly formatter: "prettier" | "biome" | "oxfmt";
    private readonly linter: "biome" | "none";

    private readonly runScripts: boolean;

    constructor({
        npmPackage,
        runScripts,
        tsMorphProject,
        extraDependencies,
        extraDevDependencies,
        extraFiles,
        extraScripts,
        extraPeerDependencies,
        extraPeerDependenciesMeta,
        dependencies,
        outputJsr,
        exportSerde,
        extraConfigs,
        packagePath,
        testPath,
        packageManager,
        formatter,
        linter
    }: TypescriptProject.Init) {
        this.npmPackage = npmPackage;
        this.runScripts = runScripts;
        this.tsMorphProject = tsMorphProject;
        this.extraDependencies = extraDependencies;
        this.extraDevDependencies = extraDevDependencies;
        this.extraFiles = extraFiles;
        this.extraScripts = extraScripts;
        this.extraPeerDependenciesMeta = extraPeerDependenciesMeta;
        this.extraPeerDependencies = extraPeerDependencies;
        this.dependencies = dependencies;
        this.outputJsr = outputJsr ?? false;
        this.exportSerde = exportSerde;
        this.extraConfigs = extraConfigs;
        this.packagePath = packagePath ?? TypescriptProject.DEFAULT_SRC_DIRECTORY;
        this.testPath = testPath;
        this.packageManager = packageManager;
        this.formatter = formatter;
        this.linter = linter;
    }

    protected async addCommonFilesToVolume(): Promise<void> {
        if (this.formatter === "prettier") {
            await this.generatePrettierRc();
            await this.generatePrettierIgnore();
        }
        if (this.formatter === "oxfmt") {
            // biome-ignore lint/suspicious/noConsole: allow console
            console.warn("⚠️  oxfmt is a beta feature and is currently work in progress. Use with caution.");
            await this.generateOxfmtRc();
        }
        if (this.outputJsr) {
            await this.generateJsrJson();
        }
        if (this.packageManager === "pnpm") {
            await this.generatePnpmWorkspace();
        }
    }

    public getFoldersForExports(): string[] {
        const exports = [];
        if (this.exportSerde) {
            exports.push("serialization");
        }
        return exports;
    }

    public async persist(): Promise<PersistedTypescriptProject> {
        // write to disk
        const directoryOnDiskToWriteTo = AbsoluteFilePath.of((await tmp.dir()).path);
        // biome-ignore lint/suspicious/noConsole: allow console
        console.log("Persisted typescript project to " + directoryOnDiskToWriteTo);

        await this.writeSrcToVolume();

        for (const [filepath, fileContents] of Object.entries(this.extraFiles)) {
            await this.writeFileToVolume(RelativeFilePath.of(filepath), fileContents);
        }

        await this.addFilesToVolume();
        await this.writeVolumeToDisk(directoryOnDiskToWriteTo);

        return new PersistedTypescriptProject({
            runScripts: this.runScripts,
            directory: directoryOnDiskToWriteTo,
            srcDirectory: RelativeFilePath.of(this.packagePath),
            testDirectory:
                this.packagePath === TypescriptProject.DEFAULT_SRC_DIRECTORY
                    ? RelativeFilePath.of(TypescriptProject.TEST_DIRECTORY)
                    : join(
                          RelativeFilePath.of(this.packagePath),
                          RelativeFilePath.of(TypescriptProject.TEST_DIRECTORY)
                      ),
            distDirectory: RelativeFilePath.of(TypescriptProject.DIST_DIRECTORY),
            buildCommand: this.getBuildCommand(),
            formatCommand: this.getFormatCommand(),
            checkFixCommand: this.getCheckFixCommand(),
            packageManager: this.packageManager
        });
    }

    private async writeSrcToVolume(): Promise<void> {
        for (const file of this.tsMorphProject.getSourceFiles()) {
            await this.writeFileToVolume(RelativeFilePath.of(file.getFilePath().slice(1)), file.getFullText());
        }
    }

    protected async writeFileToVolume(filepath: RelativeFilePath, fileContents: string): Promise<void> {
        const absoluteFilepath = `/${filepath}`;
        await this.volume.promises.mkdir(path.dirname(absoluteFilepath), { recursive: true });
        await this.volume.promises.writeFile(absoluteFilepath, fileContents);
    }

    private async writeVolumeToDisk(directoryOnDiskToWriteTo: AbsoluteFilePath): Promise<void> {
        await this.writeVolumeToDiskRecursive({
            directoryOnDiskToWriteTo,
            directoryInVolume: "/"
        });
    }

    private async writeVolumeToDiskRecursive({
        directoryOnDiskToWriteTo,
        directoryInVolume
    }: {
        directoryOnDiskToWriteTo: string;
        directoryInVolume: string;
    }): Promise<void> {
        const contents = (await this.volume.promises.readdir(directoryInVolume, { withFileTypes: true })) as Dirent[];
        for (const file of contents) {
            const fullPathInVolume = path.join(directoryInVolume, file.name.toString());
            const fullPathOnDisk = path.join(directoryOnDiskToWriteTo, fullPathInVolume);
            if (file.isDirectory()) {
                await mkdir(fullPathOnDisk, { recursive: true });
                await this.writeVolumeToDiskRecursive({
                    directoryOnDiskToWriteTo,
                    directoryInVolume: fullPathInVolume
                });
            } else {
                const contents = await this.volume.promises.readFile(fullPathInVolume);
                await mkdir(path.dirname(fullPathOnDisk), { recursive: true });
                await writeFile(fullPathOnDisk, typeof contents === "string" ? contents : new Uint8Array(contents));
            }
        }
    }

    protected getCommonScripts(): Record<COMMON_SCRIPTS, string> {
        const formatterScripts = (() => {
            switch (this.formatter) {
                case "biome":
                    return {
                        [COMMON_SCRIPTS.FORMAT]:
                            "biome format --write --skip-parse-errors --no-errors-on-unmatched --max-diagnostics=none",
                        [COMMON_SCRIPTS.FORMAT_CHECK]:
                            "biome format --skip-parse-errors --no-errors-on-unmatched --max-diagnostics=none"
                    };
                case "prettier":
                    return {
                        [COMMON_SCRIPTS.FORMAT]: "prettier . --write --ignore-unknown",
                        [COMMON_SCRIPTS.FORMAT_CHECK]: "prettier . --check --ignore-unknown"
                    };
                case "oxfmt":
                    return {
                        [COMMON_SCRIPTS.FORMAT]: "oxfmt .",
                        [COMMON_SCRIPTS.FORMAT_CHECK]: "oxfmt --check ."
                    };
                default:
                    assertNever(this.formatter);
            }
        })();
        const linterScripts = (() => {
            switch (this.linter) {
                case "biome":
                    return {
                        [COMMON_SCRIPTS.LINT]:
                            "biome lint --skip-parse-errors --no-errors-on-unmatched --max-diagnostics=none",
                        [COMMON_SCRIPTS.LINT_FIX]:
                            "biome lint --fix --unsafe --skip-parse-errors --no-errors-on-unmatched --max-diagnostics=none"
                    };
                case "none":
                    return {
                        [COMMON_SCRIPTS.LINT]: "echo 'No linter configured.'",
                        [COMMON_SCRIPTS.LINT_FIX]: "echo 'No linter configured.'"
                    };
                default:
                    assertNever(this.linter);
            }
        })();
        const checkScripts = (() => {
            if (this.formatter === "biome" && this.linter === "biome") {
                return {
                    [COMMON_SCRIPTS.CHECK]:
                        "biome check --skip-parse-errors --no-errors-on-unmatched --max-diagnostics=none",
                    [COMMON_SCRIPTS.CHECK_FIX]:
                        "biome check --fix --unsafe --skip-parse-errors --no-errors-on-unmatched --max-diagnostics=none"
                };
            }
            if (this.formatter === "biome" && this.linter === "none") {
                return {
                    [COMMON_SCRIPTS.CHECK]: `${this.packageManager} ${COMMON_SCRIPTS.FORMAT_CHECK}`,
                    [COMMON_SCRIPTS.CHECK_FIX]: `${this.packageManager} ${COMMON_SCRIPTS.FORMAT}`
                };
            }
            return {
                [COMMON_SCRIPTS.CHECK]: `${this.packageManager} ${COMMON_SCRIPTS.FORMAT_CHECK} && ${this.packageManager} ${COMMON_SCRIPTS.LINT}`,
                [COMMON_SCRIPTS.CHECK_FIX]: `${this.packageManager} ${COMMON_SCRIPTS.FORMAT} && ${this.packageManager} ${COMMON_SCRIPTS.LINT_FIX}`
            };
        })();

        return {
            ...formatterScripts,
            ...linterScripts,
            ...checkScripts,
            [COMMON_SCRIPTS.BUILD]: this.getBuildCommandScript()
        } as const;
    }

    protected abstract addFilesToVolume(): void | Promise<void>;

    protected getFormatCommand(): string[] {
        return [COMMON_SCRIPTS.FORMAT];
    }

    protected getCheckFixCommand(): string[] {
        return [COMMON_SCRIPTS.CHECK_FIX];
    }

    protected getBuildCommand(): string[] {
        return [COMMON_SCRIPTS.BUILD];
    }

    protected abstract getBuildCommandScript(): string;

    protected getCommonDevDependencies(): Record<string, string> {
        const deps: Record<string, string> = {
            "@types/node": "^18.19.70",
            typescript: "~5.7.2"
        };
        if (this.linter === "biome" || this.formatter === "biome") {
            deps["@biomejs/biome"] = "2.3.1";
        }
        if (this.formatter === "prettier") {
            deps["prettier"] = "3.4.2";
        }
        if (this.formatter === "oxfmt") {
            deps["oxfmt"] = "0.9.0";
        }
        return deps;
    }

    private async generatePrettierRc(): Promise<void> {
        await this.writeFileToVolume(
            RelativeFilePath.of(TypescriptProject.PRETTIER_RC_FILENAME),
            `tabWidth: 4
printWidth: 120
`
        );
    }

    private async generatePrettierIgnore(): Promise<void> {
        await this.writeFileToVolume(
            RelativeFilePath.of(TypescriptProject.PRETTIER_IGNORE_FILENAME),
            `dist
*.tsbuildinfo
_tmp_*
*.tmp
.tmp/
*.log
.DS_Store
Thumbs.db
            `
        );
    }

    private async generatePnpmWorkspace(): Promise<void> {
        await this.writeFileToVolume(RelativeFilePath.of(TypescriptProject.PNPM_WORKSPACE_FILENAME), "packages: ['.']");
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

    private async generateOxfmtRc(): Promise<void> {
        await this.writeFileToVolume(
            RelativeFilePath.of(".oxfmtrc.json"),
            JSON.stringify(
                {
                    printWidth: 120,
                    singleQuote: false,
                    ignorePatterns: ["dist/**", "*.tsbuildinfo", "_tmp_*", "*.tmp", ".tmp/", "*.log"]
                },
                undefined,
                2
            )
        );
    }
}
