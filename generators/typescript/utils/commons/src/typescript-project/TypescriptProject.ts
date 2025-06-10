import { mkdir, writeFile } from "fs/promises";
import Dirent from "memfs/lib/Dirent";
import { Volume } from "memfs/lib/volume";
import path from "path";
import tmp from "tmp-promise";
import { Project } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { NpmPackage } from "@fern-api/typescript-base";

import { PackageDependencies } from "../dependency-manager/DependencyManager";
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
    }
}

export abstract class TypescriptProject {
    protected static DEFAULT_SRC_DIRECTORY = "src" as const;
    protected static TEST_DIRECTORY = "tests" as const;
    protected static DIST_DIRECTORY = "dist" as const;
    protected static SCRIPTS_DIRECTORY_NAME = "scripts" as const;

    protected static CJS_DIRECTORY = "cjs" as const;
    protected static ESM_DIRECTORY = "esm" as const;
    protected static TYPES_DIRECTORY = "types" as const;

    protected static BUILD_SCRIPT_FILENAME = "build.js" as const;
    protected static NODE_DIST_DIRECTORY = "node" as const;
    protected static BROWSER_DIST_DIRECTORY = "browser" as const;
    protected static BROWSER_ESM_DIST_DIRECTORY =
        `${TypescriptProject.BROWSER_DIST_DIRECTORY}/${TypescriptProject.ESM_DIRECTORY}` as const;
    protected static BROWSER_CJS_DIST_DIRECTORY =
        `${TypescriptProject.BROWSER_DIST_DIRECTORY}/${TypescriptProject.CJS_DIRECTORY}` as const;
    protected static API_BUNDLE_FILENAME = "index.js" as const;

    protected static PRETTIER_RC_FILENAME = ".prettierrc.yml" as const;
    protected static TS_CONFIG_BASE_FILENAME = "tsconfig.base.json" as const;
    protected static TS_CONFIG_FILENAME = "tsconfig.json" as const;
    protected static TS_CONFIG_ESM_FILENAME = "tsconfig.esm.json" as const;
    protected static TS_CONFIG_CJS_FILENAME = "tsconfig.cjs.json" as const;
    protected static PACKAGE_JSON_FILENAME = "package.json" as const;
    protected static JSR_JSON_FILENAME = "jsr.json" as const;
    protected static GIT_IGNORE_FILENAME = ".gitignore" as const;
    protected static NPM_IGNORE_FILENAME = ".npmignore" as const;
    protected static FERN_IGNORE_FILENAME = ".fernignore" as const;
    protected static REFERENCE_FILENAME = "reference.md" as const;

    protected static FORMAT_SCRIPT_NAME = "format" as const;
    protected static COMPILE_SCRIPT_NAME = "compile" as const;
    protected static BUNDLE_SCRIPT_NAME = "bundle" as const;
    protected static BUILD_SCRIPT_NAME = "build" as const;
    protected static BUILD_CJS_SCRIPT_NAME = "build:cjs" as const;
    protected static BUILD_ESM_SCRIPT_NAME = "build:esm" as const;

    private exportSerde: boolean;
    protected npmPackage: NpmPackage | undefined;
    protected dependencies: PackageDependencies;
    protected extraConfigs: Record<string, unknown> | undefined;
    protected outputJsr: boolean;
    protected volume = new Volume();
    public tsMorphProject: Project;
    public extraFiles: Record<string, string>;
    protected extraDependencies: Record<string, string>;
    protected extraDevDependencies: Record<string, string>;
    protected extraPeerDependenciesMeta: Record<string, unknown>;
    protected extraPeerDependencies: Record<string, string>;
    protected extraScripts: Record<string, string>;
    protected packagePath: string;

    private runScripts: boolean;

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
        packagePath
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
        // eslint-disable-next-line no-console
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
            testDirectory: RelativeFilePath.of(TypescriptProject.TEST_DIRECTORY),
            distDirectory: RelativeFilePath.of(TypescriptProject.DIST_DIRECTORY),
            yarnBuildCommand: this.getYarnBuildCommand(),
            yarnFormatCommand: this.getYarnFormatCommand()
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

    protected abstract addFilesToVolume(): void | Promise<void>;
    protected abstract getYarnFormatCommand(): string[];
    protected abstract getYarnBuildCommand(): string[];
}
