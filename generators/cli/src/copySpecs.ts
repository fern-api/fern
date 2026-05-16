import { cp, lstat, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export interface RawSpecsManifestEntry {
    type: "openapi" | "asyncapi" | "protobuf" | "openrpc" | "graphql";
    specPath: string;
    overridePaths?: string[];
    overlayPath?: string;
}

export interface RawSpecsManifest {
    specs: RawSpecsManifestEntry[];
}

export const RAW_SPECS_DIRECTORY = "/fern/raw-specs";
export const RAW_SPECS_MANIFEST_FILENAME = "specs-manifest.json";

export async function copyRawSpecs(outputDir: string, rawSpecsDir?: string): Promise<void> {
    const specsDir = rawSpecsDir ?? RAW_SPECS_DIRECTORY;
    const manifestPath = path.join(specsDir, RAW_SPECS_MANIFEST_FILENAME);
    let manifestContent: string;
    try {
        manifestContent = await readFile(manifestPath, "utf-8");
    } catch {
        // No manifest means no raw specs were mounted
        return;
    }

    const manifest: RawSpecsManifest = JSON.parse(manifestContent);
    if (manifest.specs.length === 0) {
        return;
    }

    const specsOutputDir = path.join(outputDir, "specs");
    await mkdir(specsOutputDir, { recursive: true });

    const copiedManifest: RawSpecsManifest = { specs: [] };

    for (const entry of manifest.specs) {
        const copiedEntry: RawSpecsManifestEntry = {
            type: entry.type,
            specPath: await copySpecFile(entry.specPath, specsOutputDir, specsDir)
        };

        if (entry.overridePaths != null && entry.overridePaths.length > 0) {
            copiedEntry.overridePaths = [];
            for (const overridePath of entry.overridePaths) {
                copiedEntry.overridePaths.push(await copySpecFile(overridePath, specsOutputDir, specsDir));
            }
        }

        if (entry.overlayPath != null) {
            copiedEntry.overlayPath = await copySpecFile(entry.overlayPath, specsOutputDir, specsDir);
        }

        copiedManifest.specs.push(copiedEntry);
    }

    await writeFile(
        path.join(specsOutputDir, RAW_SPECS_MANIFEST_FILENAME),
        JSON.stringify(copiedManifest, undefined, 4)
    );
}

export async function copySpecFile(containerPath: string, specsOutputDir: string, specsDir?: string): Promise<string> {
    const baseDir = specsDir ?? RAW_SPECS_DIRECTORY;
    const relativePath = containerPath.startsWith(baseDir + "/")
        ? containerPath.slice(baseDir.length + 1)
        : path.basename(containerPath);

    const destPath = path.join(specsOutputDir, relativePath);
    let isDir = false;
    try {
        const stat = await lstat(containerPath);
        isDir = stat.isDirectory();
    } catch {
        // If stat fails, assume it's a file
    }
    if (isDir) {
        await cp(containerPath, destPath, { recursive: true });
    } else {
        await mkdir(path.dirname(destPath), { recursive: true });
        await cp(containerPath, destPath);
    }

    return relativePath;
}
