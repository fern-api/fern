import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { NpmPackage } from "@fern-api/typescript-base";
import { mkdir, writeFile } from "fs/promises";
import { Volume } from "memfs/lib/volume";
import path from "path";
import tmp from "tmp-promise";
import { Project } from "ts-morph";
import { PackageDependencies } from "../dependency-manager/DependencyManager.js";
import { JSR } from "./JSR.js";
import { PersistedTypescriptProject } from "./PersistedTypescriptProject.js";

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
        formatter: "prettier" | "biome" | "oxfmt" | "none";
        linter: "biome" | "oxlint" | "none";
        generateSubpackageExports?: boolean;
        subpackageExportPaths?: Array<{ key: string; relPath: string }>;
        /** Map from ts-morph file path to text to prepend when writing to disk.
         *  Used to avoid expensive insertText(0,...) AST re-parses during generation. */
        filePrefixes?: Map<string, string>;
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

/** Shared version constants for formatter / linter packages. */
const TOOL_VERSIONS = {
    BIOME: "2.4.10",
    PRETTIER: "3.8.1",
    OXFMT: "0.42.0",
    OXLINT: "1.57.0",
    OXLINT_TSGOLINT: "0.17.4"
} as const;

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
    private readonly formatter: "prettier" | "biome" | "oxfmt" | "none";
    private readonly linter: "biome" | "oxlint" | "none";
    protected readonly generateSubpackageExports: boolean;
    protected readonly subpackageExportPaths: Array<{ key: string; relPath: string }>;
    private readonly filePrefixes: Map<string, string>;

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
        linter,
        generateSubpackageExports,
        subpackageExportPaths,
        filePrefixes
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
        this.generateSubpackageExports = generateSubpackageExports ?? false;
        this.subpackageExportPaths = subpackageExportPaths ?? [];
        this.filePrefixes = filePrefixes ?? new Map();
    }

    protected async addCommonFilesToVolume(): Promise<void> {
        if (this.formatter === "prettier") {
            await this.generatePrettierRc();
            await this.generatePrettierIgnore();
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
        if (this.generateSubpackageExports) {
            exports.push(...this.subpackageExportPaths.map((p) => p.relPath));
        }
        return exports;
    }

    // When set, writeFileToVolume writes directly to disk instead of memfs
    private targetDiskDirectory: string | undefined;

    public async persist(): Promise<PersistedTypescriptProject> {
        const directoryOnDiskToWriteTo = AbsoluteFilePath.of((await tmp.dir()).path);
        // biome-ignore lint/suspicious/noConsole: allow console
        console.log("Persisted typescript project to " + directoryOnDiskToWriteTo);

        // Write directly to disk, bypassing the memfs intermediate volume
        this.targetDiskDirectory = directoryOnDiskToWriteTo;

        await this.writeSrcToDisk(directoryOnDiskToWriteTo);

        for (const [filepath, fileContents] of Object.entries(this.extraFiles)) {
            await this.writeFileToVolume(RelativeFilePath.of(filepath), fileContents);
        }

        await this.addFilesToVolume();

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
            directCheckFixBinaryArgs: this.getDirectCheckFixBinaryArgs(),
            checkFixPackages: this.getCheckFixPackages(),
            checkFixToolBinaries: this.getCheckFixToolBinaries(),
            packageManager: this.packageManager
        });
    }

    private async writeSrcToDisk(targetDir: string): Promise<void> {
        // Phase 1: Collect all source file data (getFullText is synchronous)
        // Prepend any stored file prefixes (header + imports) that were deferred
        // to avoid expensive insertText(0,...) AST re-parses during generation.
        const files: { relativePath: string; content: string }[] = [];
        for (const file of this.tsMorphProject.getSourceFiles()) {
            const filePath = file.getFilePath();
            const prefix = this.filePrefixes.get(filePath) ?? "";
            files.push({
                relativePath: filePath.slice(1),
                content: prefix + file.getFullText()
            });
        }

        // Phase 2: Pre-create all unique parent directories in parallel
        const dirs = new Set<string>();
        for (const { relativePath } of files) {
            dirs.add(path.join(targetDir, path.dirname(relativePath)));
        }
        await Promise.all([...dirs].map((dir) => mkdir(dir, { recursive: true })));

        // Phase 3: Write all files in parallel batches
        const BATCH_SIZE = 128;
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
            const batch = files.slice(i, i + BATCH_SIZE);
            await Promise.all(
                batch.map(({ relativePath, content }) => writeFile(path.join(targetDir, relativePath), content))
            );
        }
    }

    protected async writeFileToVolume(filepath: RelativeFilePath, fileContents: string): Promise<void> {
        if (this.targetDiskDirectory != null) {
            const fullPath = path.join(this.targetDiskDirectory, filepath);
            await mkdir(path.dirname(fullPath), { recursive: true });
            await writeFile(fullPath, fileContents);
            return;
        }
        const absoluteFilepath = `/${filepath}`;
        await this.volume.promises.mkdir(path.dirname(absoluteFilepath), { recursive: true });
        await this.volume.promises.writeFile(absoluteFilepath, fileContents);
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
                        [COMMON_SCRIPTS.FORMAT]: "oxfmt --no-error-on-unmatched-pattern .",
                        [COMMON_SCRIPTS.FORMAT_CHECK]: "oxfmt --check --no-error-on-unmatched-pattern ."
                    };
                case "none":
                    return {
                        [COMMON_SCRIPTS.FORMAT]: "echo 'No formatter configured.'",
                        [COMMON_SCRIPTS.FORMAT_CHECK]: "echo 'No formatter configured.'"
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
                case "oxlint":
                    return {
                        [COMMON_SCRIPTS.LINT]: "oxlint",
                        [COMMON_SCRIPTS.LINT_FIX]: "oxlint --fix"
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
            if (this.formatter === "none" && this.linter === "none") {
                return {
                    [COMMON_SCRIPTS.CHECK]: "echo 'No formatter or linter configured.'",
                    [COMMON_SCRIPTS.CHECK_FIX]: "echo 'No formatter or linter configured.'"
                };
            }
            if (this.formatter === "none") {
                return {
                    [COMMON_SCRIPTS.CHECK]: `${this.packageManager} ${COMMON_SCRIPTS.LINT}`,
                    [COMMON_SCRIPTS.CHECK_FIX]: `${this.packageManager} ${COMMON_SCRIPTS.LINT_FIX}`
                };
            }
            if (this.linter === "none") {
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

    /**
     * Returns the check:fix command as a direct binary invocation (no pnpm
     * script runner overhead).  Returns undefined when the command cannot be
     * expressed as a single binary call.
     */
    protected getDirectCheckFixBinaryArgs(): string[] | undefined {
        if (this.formatter === "biome" && this.linter === "biome") {
            return [
                "biome",
                "check",
                "--fix",
                "--unsafe",
                "--skip-parse-errors",
                "--no-errors-on-unmatched",
                "--max-diagnostics=none"
            ];
        }
        return undefined;
    }

    /**
     * Returns the exact package specifiers (name@version) required by the
     * configured formatter and linter so they can be installed in isolation
     * without pulling in the full dependency tree.
     */
    protected getCheckFixPackages(): string[] {
        const packages: string[] = [];
        if (this.formatter === "biome" || this.linter === "biome") {
            packages.push(`@biomejs/biome@${TOOL_VERSIONS.BIOME}`);
        }
        if (this.formatter === "prettier") {
            packages.push(`prettier@${TOOL_VERSIONS.PRETTIER}`);
        }
        if (this.formatter === "oxfmt") {
            packages.push(`oxfmt@${TOOL_VERSIONS.OXFMT}`);
        }
        if (this.linter === "oxlint") {
            packages.push(`oxlint@${TOOL_VERSIONS.OXLINT}`);
            packages.push(`oxlint-tsgolint@${TOOL_VERSIONS.OXLINT_TSGOLINT}`);
        }
        return packages;
    }

    /**
     * Returns the binary names that must be on PATH for check:fix to work
     * without installing packages (e.g. ["biome"], ["prettier", "oxlint"]).
     */
    protected getCheckFixToolBinaries(): string[] {
        const binaries: string[] = [];
        if (this.formatter === "biome" || this.linter === "biome") {
            binaries.push("biome");
        }
        if (this.formatter === "prettier") {
            binaries.push("prettier");
        }
        if (this.formatter === "oxfmt") {
            binaries.push("oxfmt");
        }
        if (this.linter === "oxlint") {
            binaries.push("oxlint");
        }
        return binaries;
    }

    protected getBuildCommand(): string[] {
        return [COMMON_SCRIPTS.BUILD];
    }

    protected abstract getBuildCommandScript(): string;

    protected getCommonDevDependencies(): Record<string, string> {
        const deps: Record<string, string> = {
            "@types/node": "^18.19.70",
            typescript: "~5.9.3"
        };
        if (this.linter === "biome" || this.formatter === "biome") {
            deps["@biomejs/biome"] = TOOL_VERSIONS.BIOME;
        }
        if (this.linter === "oxlint") {
            deps["oxlint"] = TOOL_VERSIONS.OXLINT;
            deps["oxlint-tsgolint"] = TOOL_VERSIONS.OXLINT_TSGOLINT;
        }
        if (this.formatter === "prettier") {
            deps["prettier"] = TOOL_VERSIONS.PRETTIER;
        }
        if (this.formatter === "oxfmt") {
            deps["oxfmt"] = TOOL_VERSIONS.OXFMT;
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
}
