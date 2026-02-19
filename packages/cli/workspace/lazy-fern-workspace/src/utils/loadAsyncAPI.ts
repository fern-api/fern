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
    let parsed = (await yaml.load(contents)) as AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3;
    parsed = (await resolveExternalRefs(parsed, path.dirname(absoluteFilePath))) as
        | AsyncAPIV2.DocumentV2
        | AsyncAPIV3.DocumentV3;
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
): Promise<unknown> {
    if (obj == null || typeof obj !== "object") {
        return obj;
    }

    if (Array.isArray(obj)) {
        const result: unknown[] = [];
        for (const item of obj) {
            result.push(await resolveExternalRefs(item, basePath, resolving, fileCache));
        }
        return result;
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
                return obj;
            }
            fileParsed = yaml.load(fileContent) as Record<string, unknown>;
            fileCache.set(absoluteRefPath, fileParsed);
        }

        let resolved: unknown = fileParsed;
        if (pointer != null) {
            const keys = pointer.split("/").filter((k) => k !== "");
            for (const key of keys) {
                if (resolved == null || typeof resolved !== "object") {
                    return obj;
                }
                resolved = (resolved as Record<string, unknown>)[key];
            }
        }

        if (resolved == null || typeof resolved !== "object") {
            return obj;
        }

        const cacheKey = `${absoluteRefPath}#${pointer ?? ""}`;
        if (resolving.has(cacheKey)) {
            return structuredClone(resolved);
        }
        resolving.add(cacheKey);
        return await resolveExternalRefs(
            structuredClone(resolved),
            path.dirname(absoluteRefPath),
            resolving,
            fileCache
        );
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
        result[key] = await resolveExternalRefs(value, basePath, resolving, fileCache);
    }
    return result;
}
