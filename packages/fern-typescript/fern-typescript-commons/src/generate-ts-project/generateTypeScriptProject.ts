import { Volume } from "memfs/lib/volume";
import { Directory } from "ts-morph";
import { PackageDependencies } from "../dependencies/DependencyManager";
import { ProjectCreator } from "../file-system/ProjectCreator";
import { generateNpmIgnore } from "./generateNpmIgnore";
import { generatePackageJson } from "./generatePackageJson";
import { generateTsConfig } from "./generateTsConfig";
import { writeProjectToVolume } from "./writeProjectToVolume";

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
    packageVersion: string | undefined;
    generateSrc: (directory: Directory) => MaybePromise<GeneratedProjectSrcInfo>;
}): Promise<void> {
    const projectCreator = new ProjectCreator();
    const generatedSrcInfo = await projectCreator.withProject((p) => generateSrc(p.createDirectory(".")));
    const project = await projectCreator.finalize();
    await writeProjectToVolume(project, volume);

    await generatePackageJson({
        volume,
        packageName,
        packageVersion,
        dependencies: generatedSrcInfo.dependencies,
    });
    await generateTsConfig(volume);
    await generateNpmIgnore(volume);
}
