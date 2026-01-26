import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { AsyncAPIV2, AsyncAPIV3 } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides";

/**
 * Resolves local file references (e.g., ./schemas/file.yml#/Schema) in an AsyncAPI document.
 * URL references (http://, https://) are left unchanged for the AsyncAPI converter to handle.
 */
async function resolveLocalFileRefs(
    obj: unknown,
    baseDir: AbsoluteFilePath,
    visited: Set<string> = new Set()
): Promise<unknown> {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return Promise.all(obj.map((item) => resolveLocalFileRefs(item, baseDir, visited)));
    }

    if (typeof obj === "object") {
        const record = obj as Record<string, unknown>;

        // Check if this is a $ref object
        if ("$ref" in record && typeof record.$ref === "string") {
            const ref = record.$ref;

            // Skip URL references - let the AsyncAPI converter handle them
            if (ref.startsWith("http://") || ref.startsWith("https://")) {
                return obj;
            }

            // Skip internal references (starting with #)
            if (ref.startsWith("#")) {
                return obj;
            }

            // This is a local file reference (e.g., ./schemas/file.yml#/Schema)
            const [filePath, jsonPointer] = ref.split("#");
            if (filePath == null || filePath === "") {
                return obj;
            }

            const absoluteRefPath = join(baseDir, RelativeFilePath.of(filePath));

            // Prevent circular references
            const refKey = `${absoluteRefPath}#${jsonPointer ?? ""}`;
            if (visited.has(refKey)) {
                return obj;
            }

            // Check if the file exists
            if (!(await doesPathExist(absoluteRefPath))) {
                return obj;
            }

            visited.add(refKey);

            try {
                const refContents = (await readFile(absoluteRefPath)).toString();
                let refParsed = yaml.load(refContents) as unknown;

                // Recursively resolve refs in the loaded file
                const refBaseDir = dirname(absoluteRefPath);
                refParsed = await resolveLocalFileRefs(refParsed, refBaseDir, visited);

                // If there's a JSON pointer, navigate to the specific path
                if (jsonPointer) {
                    const pointerParts = jsonPointer.split("/").filter((p) => p !== "");
                    let current = refParsed as Record<string, unknown>;
                    for (const part of pointerParts) {
                        if (current == null || typeof current !== "object") {
                            return obj; // Can't navigate, return original
                        }
                        current = current[part] as Record<string, unknown>;
                    }
                    return current;
                }

                return refParsed;
            } catch {
                // If we can't load the file, return the original object
                return obj;
            }
        }

        // Recursively process all properties
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(record)) {
            result[key] = await resolveLocalFileRefs(value, baseDir, visited);
        }
        return result;
    }

    return obj;
}

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

    if (absoluteFilePathToOverrides != null) {
        parsed = await mergeWithOverrides<AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3>({
            absoluteFilePathToOverrides,
            context,
            data: parsed
        });
    }

    // Resolve local file references (e.g., ./schemas/file.yml#/Schema)
    // URL references are left unchanged for the AsyncAPI converter to handle
    const baseDir = dirname(absoluteFilePath);
    parsed = (await resolveLocalFileRefs(parsed, baseDir)) as AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3;

    return parsed;
}
