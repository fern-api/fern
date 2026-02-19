import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AsyncAPIV2, AsyncAPIV3 } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides.js";

export async function loadAsyncAPI({
    context,
    absoluteFilePath,
    absoluteFilePathToOverrides
}: {
    context: TaskContext;
    absoluteFilePath: AbsoluteFilePath;
    absoluteFilePathToOverrides: AbsoluteFilePath | undefined;
}): Promise<AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3> {
    const contents = (await readFile(absoluteFilePath)).toString();
    const parsed = (await yaml.load(contents)) as AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3;
    await resolveExternalRefs(parsed, path.dirname(absoluteFilePath));
    if (absoluteFilePathToOverrides != null) {
        return await mergeWithOverrides<AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3>({
            absoluteFilePathToOverrides,
            context,
            data: parsed
        });
    }
    return parsed;
}

async function resolveExternalRefs(
    obj: unknown,
    basePath: string,
    resolving: Set<string> = new Set(),
    fileCache: Map<string, Record<string, unknown>> = new Map()
): Promise<void> {
    if (obj == null || typeof obj !== "object") {
        return;
    }

    if (Array.isArray(obj)) {
        for (const item of obj) {
            await resolveExternalRefs(item, basePath, resolving, fileCache);
        }
        return;
    }

    const record = obj as Record<string, unknown>;

    if (typeof record.$ref === "string" && !record.$ref.startsWith("#")) {
        const refValue = record.$ref;

        const hashIndex = refValue.indexOf("#");
        const filePath = hashIndex >= 0 ? refValue.substring(0, hashIndex) : refValue;
        const pointer = hashIndex >= 0 ? refValue.substring(hashIndex + 1) : undefined;

        const absoluteRefPath = path.resolve(basePath, filePath);

        let fileParsed = fileCache.get(absoluteRefPath);
        if (fileParsed == null) {
            let fileContent: string;
            try {
                fileContent = (await readFile(absoluteRefPath)).toString();
            } catch {
                return;
            }
            fileParsed = yaml.load(fileContent) as Record<string, unknown>;
            fileCache.set(absoluteRefPath, fileParsed);
        }

        let resolved: unknown = fileParsed;
        if (pointer != null) {
            const keys = pointer.split("/").filter((k) => k !== "");
            for (const key of keys) {
                if (resolved == null || typeof resolved !== "object") {
                    return;
                }
                resolved = (resolved as Record<string, unknown>)[key];
            }
        }

        if (resolved == null || typeof resolved !== "object") {
            return;
        }

        const cacheKey = `${absoluteRefPath}#${pointer ?? ""}`;
        if (!resolving.has(cacheKey)) {
            resolving.add(cacheKey);
            await resolveExternalRefs(resolved, path.dirname(absoluteRefPath), resolving, fileCache);
        }

        delete record.$ref;
        for (const [key, value] of Object.entries(resolved as Record<string, unknown>)) {
            record[key] = value;
        }
        return;
    }

    for (const value of Object.values(record)) {
        if (typeof value === "object" && value != null) {
            await resolveExternalRefs(value, basePath, resolving, fileCache);
        }
    }
}
