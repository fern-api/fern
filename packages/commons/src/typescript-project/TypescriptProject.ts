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
        tsMorphProject: Project;
        extraDependencies: Record<string, string>;
        extraDevDependencies: Record<string, string>;
    }
}

export abstract class TypescriptProject {
    protected static SRC_DIRECTORY = "src" as const;
    protected static DIST_DIRECTORY = "dist" as const;

    protected volume = new Volume();
    protected tsMorphProject: Project;
    protected extraDependencies: Record<string, string>;
    protected extraDevDependencies: Record<string, string>;

    constructor({ tsMorphProject, extraDependencies, extraDevDependencies }: TypescriptProject.Init) {
        this.tsMorphProject = tsMorphProject;
        this.extraDependencies = extraDependencies;
        this.extraDevDependencies = extraDevDependencies;
    }

    public async persist(): Promise<PersistedTypescriptProject> {
        // write to disk
        const directoryOnDiskToWriteTo = AbsoluteFilePath.of((await tmp.dir()).path);
        // eslint-disable-next-line no-console
        console.debug("Persisted typescript project to " + directoryOnDiskToWriteTo);
        await this.writeSrcToVolume();
        await this.addFilesToVolume();
        await this.writeVolumeToDisk(directoryOnDiskToWriteTo);

        return new PersistedTypescriptProject({
            directory: directoryOnDiskToWriteTo,
            srcDirectory: TypescriptProject.SRC_DIRECTORY,
            distDirectory: TypescriptProject.DIST_DIRECTORY,
            yarnBuildCommand: this.getYarnBuildCommand(),
            yarnFormatCommand: this.getYarnFormatCommand(),
        });
    }

    private async writeSrcToVolume(): Promise<void> {
        for (const file of this.tsMorphProject.getSourceFiles()) {
            await this.writeFileToVolume(
                RelativeFilePath.of(path.join(TypescriptProject.SRC_DIRECTORY, file.getFilePath())),
                file.getFullText()
            );
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
            directoryInVolume: "/",
        });
    }

    private async writeVolumeToDiskRecursive({
        directoryOnDiskToWriteTo,
        directoryInVolume,
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
                    directoryInVolume: fullPathInVolume,
                });
            } else {
                const contents = await this.volume.promises.readFile(fullPathInVolume);
                await mkdir(path.dirname(fullPathOnDisk), { recursive: true });
                await writeFile(fullPathOnDisk, contents);
            }
        }
    }

    protected abstract addFilesToVolume(): void | Promise<void>;
    protected abstract getYarnFormatCommand(): string[];
    protected abstract getYarnBuildCommand(): string[];
}
