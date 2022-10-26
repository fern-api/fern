import { Volume } from "memfs/lib/volume";
import { Project } from "ts-morph";
import { PackageDependencies } from "../dependency-manager/DependencyManager";
import { generateGitIgnore } from "./generateGitIgnore";
import { generatePackageJson } from "./generatePackageJson";
import { generatePrettierIgnore } from "./generatePrettierIgnore";
import { generateRootDeclarationFile } from "./generateRootDeclarationFile";
import { generateTsConfig } from "./generateTsConfig";
import { RootService } from "./RootService";
import { writeProjectToVolume } from "./writeProjectToVolume";
export { generateRootDeclarationFile } from "./generateRootDeclarationFile";

export interface GeneratedProjectSrcInfo {
    dependencies: PackageDependencies;
}

export async function generateTypeScriptProject({
    volume,
    packageName,
    packageVersion,
    repositoryUrl,
    project,
    dependencies,
    rootService,
}: {
    volume: Volume;
    packageName: string;
    packageVersion: string | undefined;
    repositoryUrl: string | undefined;
    project: Project;
    dependencies: PackageDependencies;
    rootService: RootService;
}): Promise<void> {
    await volume.promises.mkdir("/src");
    await writeProjectToVolume(project, volume, "/src");
    await generatePackageJson({
        volume,
        packageName,
        packageVersion,
        repositoryUrl,
        dependencies,
    });
    await generateTsConfig(volume);
    await generatePrettierIgnore(volume);
    await generateGitIgnore(volume);
    await generateRootDeclarationFile({ volume, rootService });
}
