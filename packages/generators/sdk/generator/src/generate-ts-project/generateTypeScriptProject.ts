import { Volume } from "memfs/lib/volume";
import { Project } from "ts-morph";
import { PackageDependencies } from "../dependency-manager/DependencyManager";
import { SRC_DIRECTORY } from "./constants";
import { generateEsbuildScript } from "./generateEsbuildScript";
import { generateGitIgnore } from "./generateGitIgnore";
import { generatePackageJson } from "./generatePackageJson";
import { generatePrettierIgnore } from "./generatePrettierIgnore";
import { generateTsConfig } from "./generateTsConfig";
import { writeProjectToVolume } from "./writeProjectToVolume";

export interface GeneratedProjectSrcInfo {
    dependencies: PackageDependencies;
}

export async function generateTypeScriptProject({
    volume,
    packageName,
    packageVersion,
    isPackagePrivate,
    repositoryUrl,
    project,
    dependencies,
}: {
    volume: Volume;
    packageName: string;
    packageVersion: string | undefined;
    isPackagePrivate: boolean;
    repositoryUrl: string | undefined;
    project: Project;
    dependencies: PackageDependencies;
}): Promise<void> {
    await volume.promises.mkdir(`/${SRC_DIRECTORY}`);
    await writeProjectToVolume(project, volume, `/${SRC_DIRECTORY}`);
    await generatePackageJson({
        volume,
        packageName,
        packageVersion,
        isPackagePrivate,
        repositoryUrl,
        dependencies,
    });
    await generateTsConfig({ volume, packageName });
    await generatePrettierIgnore(volume);
    await generateGitIgnore(volume);
    await generateEsbuildScript({ volume, packageName });
}
