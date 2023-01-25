import { NpmPackage, PackageDependencies, writeProjectToVolume } from "@fern-typescript/commons";
import { Volume } from "memfs/lib/volume";
import { Project } from "ts-morph";
import { SRC_DIRECTORY } from "./constants";
import { generateEsbuildScript } from "./generateEsbuildScript";
import { generateGitIgnore } from "./generateGitIgnore";
import { generatePackageJson } from "./generatePackageJson";
import { generatePrettierRc } from "./generatePrettierRc";
import { generateStubTypeDeclarations } from "./generateStubTypeDeclarations";
import { generateTsConfig } from "./generateTsConfig";

export interface GeneratedProjectSrcInfo {
    dependencies: PackageDependencies;
}

export async function generateTypeScriptProject({
    volume,
    npmPackage,
    project,
    dependencies,
}: {
    volume: Volume;
    npmPackage: NpmPackage;
    project: Project;
    dependencies: PackageDependencies;
}): Promise<void> {
    await volume.promises.mkdir(`/${SRC_DIRECTORY}`);
    await writeProjectToVolume(project, volume, `/${SRC_DIRECTORY}`);
    await generatePackageJson({
        volume,
        npmPackage,
        dependencies,
    });
    await generateTsConfig({ volume, packageName: npmPackage.packageName });
    await generatePrettierRc(volume);
    await generateGitIgnore(volume);
    await generateEsbuildScript({ volume, packageName: npmPackage.packageName });
    await generateStubTypeDeclarations(volume);
}
