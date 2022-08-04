import { Volume } from "memfs/lib/volume";
import { Project } from "ts-morph";
import { PackageDependencies } from "../dependency-manager/DependencyManager";
import { generateNpmIgnore } from "./generateNpmIgnore";
import { generatePackageJson } from "./generatePackageJson";
import { generateTsConfig } from "./generateTsConfig";
import { writeProjectToVolume } from "./writeProjectToVolume";

export interface GeneratedProjectSrcInfo {
    dependencies: PackageDependencies;
}

export async function generateTypeScriptProject({
    volume,
    packageName,
    packageVersion,
    project,
    dependencies,
}: {
    volume: Volume;
    packageName: string;
    packageVersion: string | undefined;
    project: Project;
    dependencies: PackageDependencies;
}): Promise<void> {
    await writeProjectToVolume(project, volume, "/src");
    await generatePackageJson({
        volume,
        packageName,
        packageVersion,
        dependencies,
    });
    await generateTsConfig(volume);
    await generateNpmIgnore(volume);
}
