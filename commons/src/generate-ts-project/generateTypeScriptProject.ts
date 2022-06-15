import { Volume } from "memfs/lib/volume";
import { Directory } from "ts-morph";
import { withProject } from "../codegen/file-system/withProject";
import { writeProject } from "../writeProject";
import { generatePackageJson } from "./generatePackageJson";
import { generateTsConfig } from "./generateTsConfig";

export async function generateTypeScriptProject({
    volume,
    packageName,
    packageVersion,
    packageDependencies,
    packageDevDependencies,
    generateSrc,
}: {
    volume: Volume;
    packageName: string;
    packageVersion: string;
    packageDependencies?: Record<string, string>;
    packageDevDependencies?: Record<string, string>;
    generateSrc: (directory: Directory) => void | Promise<void>;
}): Promise<void> {
    await generatePackageJson({
        volume,
        packageName,
        packageVersion,
        packageDependencies,
        packageDevDependencies,
    });
    await generateTsConfig(volume, "esm");
    await generateTsConfig(volume, "commonjs");

    const project = await withProject(async (p) => {
        await generateSrc(p.createDirectory("src"));
    });
    await writeProject(project, volume);
}
