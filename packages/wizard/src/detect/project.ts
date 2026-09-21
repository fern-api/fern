import { access } from "fs/promises";
import path from "path";
import type { FernProject } from "../types";

export async function detectFernProject(dir: string): Promise<FernProject> {
    const docsConfigExists = await exists(path.join(dir, "fern", "docs.yml"));
    const candidates = ["fern/fern.config.json", "fern.yml", "fern/docs.yml", "fern/generators.yml"];
    for (const candidate of candidates) {
        if (await exists(path.join(dir, candidate))) {
            return { exists: true, path: "fern/", docsConfigExists };
        }
    }

    try {
        const fernApis = path.join(dir, "fern", "apis");
        const entries = await import("fs/promises").then(({ readdir }) => readdir(fernApis, { withFileTypes: true }));
        for (const entry of entries) {
            if (entry.isDirectory() && (await exists(path.join(fernApis, entry.name, "generators.yml")))) {
                return { exists: true, path: "fern/", docsConfigExists };
            }
        }
    } catch {
        // The directory is optional.
    }

    return { exists: false, docsConfigExists };
}

async function exists(filePath: string): Promise<boolean> {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}
