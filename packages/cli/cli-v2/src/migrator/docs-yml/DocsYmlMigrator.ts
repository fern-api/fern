import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import type { MigratorWarning } from "../types/index.js";

export interface DocsYmlMigratorResult {
    docs?: Record<string, unknown>;
    warnings: MigratorWarning[];
    absoluteFilePath?: AbsoluteFilePath;
}

/**
 * Reads docs.yml from the fern directory and resolves `$ref` file references.
 */
export async function migrateDocsYml(fernDir: AbsoluteFilePath): Promise<DocsYmlMigratorResult> {
    const filePath = join(fernDir, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
    if (!(await doesPathExist(filePath, "file"))) {
        return { warnings: [] };
    }

    const warnings: MigratorWarning[] = [];
    try {
        const content = await readFile(filePath, "utf-8");
        const parsed = yaml.load(content);
        if (parsed == null || typeof parsed !== "object") {
            return { warnings };
        }

        const resolved = await resolveRefs(parsed as Record<string, unknown>, filePath, new Set([filePath]), warnings);
        return { docs: resolved as Record<string, unknown>, warnings, absoluteFilePath: filePath };
    } catch {
        warnings.push({ type: "info", message: "Could not parse docs.yml" });
        return { warnings };
    }
}

async function resolveRefs(
    value: unknown,
    currentFile: AbsoluteFilePath,
    seen: Set<string>,
    warnings: MigratorWarning[]
): Promise<unknown> {
    if (value == null || typeof value !== "object") {
        return value;
    }
    if (Array.isArray(value)) {
        return Promise.all(value.map((item) => resolveRefs(item, currentFile, seen, warnings)));
    }

    const obj = value as Record<string, unknown>;
    if (typeof obj["$ref"] === "string" && Object.keys(obj).length === 1) {
        const refPath = join(dirname(currentFile), RelativeFilePath.of(obj["$ref"]));
        if (seen.has(refPath) || !(await doesPathExist(refPath, "file"))) {
            return obj;
        }
        try {
            const refContent = await readFile(refPath, "utf-8");
            seen.add(refPath);
            const result = await resolveRefs(yaml.load(refContent), refPath, seen, warnings);
            seen.delete(refPath);
            return result;
        } catch {
            return obj;
        }
    }

    const resolved: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
        resolved[key] = await resolveRefs(val, currentFile, seen, warnings);
    }
    return resolved;
}
