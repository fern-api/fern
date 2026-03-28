import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { existsSync } from "fs";
import { glob } from "glob";
import type { Volume } from "memfs/lib/volume";
import path from "path";
import { Directory, Project } from "ts-morph";

export class PublicExportsManager {
    /**
     * Generates public export files into a memfs Volume (in-memory).
     * This replaces the disk-based generatePublicExportsFiles for the non-legacy path,
     * allowing all files to be processed in-memory before a single write to disk.
     *
     * @param volume - The memfs Volume containing the project files.
     * @param packagePath - The source directory path within the volume (e.g. "src").
     */
    public generatePublicExportsToVolume(volume: Volume, packagePath: string): void {
        const srcDir = "/" + packagePath;
        const coreDir = path.join(srcDir, "core");

        if (!volume.existsSync(coreDir)) {
            return;
        }

        // Find all exports.ts files recursively in core/
        const exportsFiles: string[] = [];
        this.findExportsFilesInVolume(volume, coreDir, exportsFiles);

        // Sort by depth (deepest first) to build hierarchy bottom-up
        exportsFiles.sort((a, b) => b.split("/").length - a.split("/").length);

        // Build set of directories that need parent exports files
        const dirsNeedingParents = new Set<string>();
        const srcParent = path.dirname(srcDir);

        for (const exportsFilePath of exportsFiles) {
            const exportsDir = path.dirname(exportsFilePath);
            let currentDir = path.dirname(exportsDir);

            while (currentDir !== srcParent) {
                dirsNeedingParents.add(currentDir);
                currentDir = path.dirname(currentDir);
            }
        }

        // Sort by depth (deepest first) and generate parent exports files
        const sortedDirs = Array.from(dirsNeedingParents).sort((a, b) => b.split("/").length - a.split("/").length);

        for (const dir of sortedDirs) {
            this.generateParentExportsFileInVolume(volume, dir);
        }

        // Add exports.ts re-export to src/index.ts if src/exports.ts was created
        const srcExportsPath = path.join(srcDir, "exports.ts");
        if (volume.existsSync(srcExportsPath)) {
            this.addExportsToIndexFileInVolume(volume, srcDir);
        }
    }

    /** Recursively find all exports.ts files in a Volume directory. */
    private findExportsFilesInVolume(volume: Volume, dir: string, results: string[]): void {
        const entries = volume.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const name = typeof entry.name === "string" ? entry.name : entry.name.toString();
            const fullPath = path.join(dir, name);
            if (entry.isDirectory()) {
                this.findExportsFilesInVolume(volume, fullPath, results);
            } else if (name === "exports.ts") {
                results.push(fullPath);
            }
        }
    }

    /** Generate a parent exports.ts file in the Volume if one doesn't already exist. */
    private generateParentExportsFileInVolume(volume: Volume, directoryPath: string): void {
        const parentExportsPath = path.join(directoryPath, "exports.ts");

        if (volume.existsSync(parentExportsPath)) {
            return;
        }

        // Find child directories that have exports.ts
        const childDirs: string[] = [];
        const entries = volume.readdirSync(directoryPath, { withFileTypes: true });
        for (const entry of entries) {
            const name = typeof entry.name === "string" ? entry.name : entry.name.toString();
            if (entry.isDirectory()) {
                const childExportsPath = path.join(directoryPath, name, "exports.ts");
                if (volume.existsSync(childExportsPath)) {
                    childDirs.push(path.join(directoryPath, name));
                }
            }
        }

        let content: string;
        if (childDirs.length === 0) {
            // ts-morph addExportDeclaration({}) generates: export {};
            content = "export {};\n";
        } else {
            // Sort alphabetically for consistent output
            childDirs.sort((a, b) => a.localeCompare(b));
            const lines: string[] = [];
            for (const childDir of childDirs) {
                const relativePath = path.relative(directoryPath, path.join(childDir, "exports.ts"));
                const moduleSpecifier = "./" + relativePath.replace(/\.ts$/, "").replace(/\\/g, "/");
                lines.push(`export * from "${moduleSpecifier}";`);
            }
            content = lines.join("\n") + "\n";
        }

        volume.mkdirSync(path.dirname(parentExportsPath), { recursive: true });
        volume.writeFileSync(parentExportsPath, content);
    }

    /** Add `export * from "./exports"` to src/index.ts in the Volume if not already present. */
    private addExportsToIndexFileInVolume(volume: Volume, srcDir: string): void {
        const indexFilePath = path.join(srcDir, "index.ts");

        if (!volume.existsSync(indexFilePath)) {
            return;
        }

        const existingContent = volume.readFileSync(indexFilePath, "utf-8").toString();

        // Check if re-export already exists (match what ts-morph would generate)
        if (existingContent.includes('./exports"') || existingContent.includes("./exports'")) {
            return;
        }

        const newContent = existingContent.trimEnd() + '\nexport * from "./exports";\n';
        volume.writeFileSync(indexFilePath, newContent);
    }

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
            // Sort child directories alphabetically for consistent output
            const sortedChildDirs = [...childDirs].sort((a, b) => a.localeCompare(b));
            for (const childDir of sortedChildDirs) {
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
