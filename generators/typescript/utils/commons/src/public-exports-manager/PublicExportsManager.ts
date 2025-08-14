import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { existsSync } from "fs";
import { glob } from "glob";
import path from "path";
import { Directory, Project } from "ts-morph";

export class PublicExportsManager {
    public async generatePublicExportsFiles({ pathToSrc }: { pathToSrc: AbsoluteFilePath }): Promise<void> {
        const project = new Project({
            skipAddingFilesFromTsConfig: true,
            skipFileDependencyResolution: true,
            skipLoadingLibFiles: true
        });

        const coreDirectoryPath = path.join(pathToSrc, "core");
        if (!existsSync(coreDirectoryPath)) {
            return;
        }

        const srcDirectory = project.addDirectoryAtPath(pathToSrc);
        const coreDirectory = srcDirectory.addDirectoryAtPath(coreDirectoryPath);

        await this.processCore(coreDirectory, srcDirectory);
        await project.save();
    }

    private async processCore(coreDirectory: Directory, srcDirectory: Directory): Promise<void> {
        const exportsFiles = await this.findExportsFiles(coreDirectory.getPath());

        // Sort exports files by depth (deepest first) to build hierarchy bottom-up
        const sortedExportsFiles = exportsFiles.sort((a, b) => {
            return b.split(path.sep).length - a.split(path.sep).length;
        });

        // Build a map of all directories that need parent exports files
        const dirsNeedingParents = new Set<string>();
        const srcDir = srcDirectory.getPath();

        for (const exportsFilePath of sortedExportsFiles) {
            const exportsDir = path.dirname(exportsFilePath);
            let currentDir = path.dirname(exportsDir);

            while (currentDir !== path.dirname(srcDir)) {
                dirsNeedingParents.add(currentDir);
                currentDir = path.dirname(currentDir);
            }
        }

        // Convert to array and sort by depth (deepest first)
        const sortedDirs = Array.from(dirsNeedingParents).sort((a, b) => {
            return b.split(path.sep).length - a.split(path.sep).length;
        });

        // Generate parent exports files from deepest to shallowest
        for (const dir of sortedDirs) {
            await this.generateParentExportsFile(dir, srcDirectory);
        }

        // Add exports.ts to src/index.ts if it was created
        if (this.hasGeneratedSrcExports(srcDirectory)) {
            await this.addExportsToIndexFile(srcDirectory);
        }
    }

    private async findExportsFiles(directoryPath: string): Promise<string[]> {
        try {
            const pattern = path.join(directoryPath, "**/exports.ts").replace(/\\/g, "/");
            const exportsFiles = await glob(pattern, {
                absolute: true,
                ignore: ["**/node_modules/**", "**/.git/**"]
            });
            return exportsFiles;
        } catch (error) {
            return [];
        }
    }

    private async generateParentExportsFile(directoryPath: string, srcDirectory: Directory): Promise<void> {
        const parentExportsPath = path.join(directoryPath, "exports.ts");

        if (existsSync(parentExportsPath)) {
            return;
        }

        const parentExportsFile = srcDirectory.createSourceFile(parentExportsPath);
        const childDirs = await this.getChildDirectoriesWithExports(directoryPath);

        if (childDirs.length === 0) {
            // If no child exports found, add empty export to create valid TypeScript file
            parentExportsFile.addExportDeclaration({});
        } else {
            for (const childDir of childDirs) {
                const relativePath = path.relative(directoryPath, path.join(childDir, "exports.ts"));
                const moduleSpecifier = "./" + relativePath.replace(/\.ts$/, "").replace(/\\/g, "/");

                parentExportsFile.addExportDeclaration({
                    moduleSpecifier
                });
            }
        }

        // Save this file immediately so it exists for the next level up
        await parentExportsFile.save();
    }

    private async getChildDirectoriesWithExports(directoryPath: string): Promise<string[]> {
        try {
            const pattern = path.join(directoryPath, "*/exports.ts").replace(/\\/g, "/");
            const exportsFiles = await glob(pattern, { absolute: true });
            return exportsFiles.map((file) => path.dirname(file));
        } catch (error) {
            return [];
        }
    }

    private async addExportsToIndexFile(srcDirectory: Directory): Promise<void> {
        const indexFilePath = path.join(srcDirectory.getPath(), "index.ts");
        const indexFile = srcDirectory.addSourceFileAtPath(indexFilePath);

        const existingExports = indexFile.getExportDeclarations();
        const hasExportsReexport = existingExports.some((exp) => exp.getModuleSpecifierValue() === "./exports");

        if (!hasExportsReexport) {
            indexFile.addExportDeclaration({
                moduleSpecifier: "./exports"
            });
            await indexFile.save();
        }
    }

    private hasGeneratedSrcExports(srcDirectory: Directory): boolean {
        const srcExportsPath = path.join(srcDirectory.getPath(), "exports.ts");
        return existsSync(srcExportsPath);
    }
}
