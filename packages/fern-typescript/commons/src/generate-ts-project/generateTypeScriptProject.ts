import { Volume } from "memfs/lib/volume";
import { Directory } from "ts-morph";
import { ProjectCreator } from "../codegen/file-system/ProjectCreator";
import { PackageDependencies } from "../dependencies/DependencyManager";
import { writeProjectToVolume } from "../writeProjectToVolume";
import { generatePackageJson } from "./generatePackageJson";
import { generateTsConfig } from "./generateTsConfig";

export interface GeneratedProjectSrcInfo {
    dependencies: PackageDependencies;
}

type MaybePromise<T> = T | Promise<T>;

export async function generateTypeScriptProject({
    volume,
    packageName,
    packageVersion,
    generateSrc,
}: {
    volume: Volume;
    packageName: string;
    packageVersion: string;
    generateSrc: (directory: Directory) => MaybePromise<GeneratedProjectSrcInfo | void>;
}): Promise<void> {
    const projectCreator = new ProjectCreator();
    const generatedSrcInfo = await projectCreator.withProject((p) => generateSrc(p.createDirectory("src")));
    const project = await projectCreator.finalize();
    await writeProjectToVolume(project, volume);

    await generatePackageJson({
        volume,
        packageName,
        packageVersion,
        dependencies: generatedSrcInfo?.dependencies,
    });
    await generateTsConfig(volume, "esm");
    await generateTsConfig(volume, "commonjs");
}
