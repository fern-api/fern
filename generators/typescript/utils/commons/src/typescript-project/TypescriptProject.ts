import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";
import Dirent from "memfs/lib/Dirent";
import { Volume } from "memfs/lib/volume";
import path from "path";
import tmp from "tmp-promise";
import { Project } from "ts-morph";
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
    }
}

export abstract class TypescriptProject {
    protected static SRC_DIRECTORY = "src" as const;
    protected static TEST_DIRECTORY = "tests" as const;
    protected static DIST_DIRECTORY = "dist" as const;

    protected volume = new Volume();
    public tsMorphProject: Project;
    public extraFiles: Record<string, string>;
    protected extraDependencies: Record<string, string>;
    protected extraDevDependencies: Record<string, string>;
    protected extraPeerDependenciesMeta: Record<string, unknown>;
    protected extraPeerDependencies: Record<string, string>;
    protected extraScripts: Record<string, string>;

    private runScripts: boolean;

    constructor({
        runScripts,
        tsMorphProject,
        extraDependencies,
        extraDevDependencies,
        extraFiles,
        extraScripts,
        extraPeerDependencies,
        extraPeerDependenciesMeta
    }: TypescriptProject.Init) {
        this.runScripts = runScripts;
        this.tsMorphProject = tsMorphProject;
        this.extraDependencies = extraDependencies;
        this.extraDevDependencies = extraDevDependencies;
        this.extraFiles = extraFiles;
        this.extraScripts = extraScripts;
        this.extraPeerDependenciesMeta = extraPeerDependenciesMeta;
        this.extraPeerDependencies = extraPeerDependencies;
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
            srcDirectory: RelativeFilePath.of(TypescriptProject.SRC_DIRECTORY),
            testDirectory: RelativeFilePath.of(TypescriptProject.TEST_DIRECTORY),
            distDirectory: RelativeFilePath.of(TypescriptProject.DIST_DIRECTORY),
            buildCommand: this.getBuildCommand(),
            formatCommand: this.getFormatCommand()
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
                await writeFile(fullPathOnDisk, contents);
            }
        }
    }

    protected abstract addFilesToVolume(): void | Promise<void>;
    protected abstract getFormatCommand(): string[];
    protected abstract getBuildCommand(): string[];
}
