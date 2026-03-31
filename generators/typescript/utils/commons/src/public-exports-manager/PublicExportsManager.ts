import type { Volume } from "memfs/lib/volume";
import path from "path";

export class PublicExportsManager {
    /**
     * Generates public export files into a memfs Volume (in-memory).
     * All files are processed in-memory before a single write to disk.
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
            // memfs 3.x returns dirent-like objects with name and isDirectory()
            const dirent = entry as { name: string | Buffer; isDirectory(): boolean };
            const name = typeof dirent.name === "string" ? dirent.name : dirent.name.toString();
            const fullPath = path.join(dir, name);
            if (dirent.isDirectory()) {
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
            // memfs 3.x returns dirent-like objects with name and isDirectory()
            const dirent = entry as { name: string | Buffer; isDirectory(): boolean };
            const name = typeof dirent.name === "string" ? dirent.name : dirent.name.toString();
            if (dirent.isDirectory()) {
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
}
