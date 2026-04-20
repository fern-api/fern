import { isPlainObject } from "@fern-api/core-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { resolve } from "path";

/**
 * OpenAPI's `description` fields are always strings. Some tooling (Redocly and
 * similar) has extended support for a non-standard convention where a
 * description is authored as a pointer to an external markdown file:
 *
 *     description:
 *       $ref: ./descriptions/foo.md
 *
 * Strictly this is invalid OpenAPI, but the pattern is common enough that we
 * resolve it transparently at load time: if the value is an object whose only
 * key is `$ref` and the target is a relative `.md` file, we inline the file
 * contents as a string before any downstream parsing runs.
 *
 * Anything else (already-a-string descriptions, JSON Pointer refs, URL refs,
 * non-`.md` targets, or `$ref` objects with sibling keys) is left untouched.
 */
export async function resolveDescriptionMarkdownRefs(
    doc: unknown,
    baseDir: string,
    context: TaskContext
): Promise<void> {
    await walk(doc, baseDir, context);
}

async function walk(node: unknown, baseDir: string, context: TaskContext): Promise<void> {
    if (Array.isArray(node)) {
        await Promise.all(node.map((item) => walk(item, baseDir, context)));
        return;
    }
    if (!isPlainObject(node)) {
        return;
    }
    const record = node as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
        if (key === "description" && isMarkdownFileRef(value)) {
            record[key] = await readMarkdownRef((value as { $ref: string }).$ref, baseDir, context);
        } else {
            await walk(value, baseDir, context);
        }
    }
}

function isMarkdownFileRef(value: unknown): boolean {
    if (!isPlainObject(value)) {
        return false;
    }
    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.length !== 1 || keys[0] !== "$ref") {
        return false;
    }
    const ref = (value as { $ref?: unknown }).$ref;
    if (typeof ref !== "string" || ref.length === 0) {
        return false;
    }
    if (ref.startsWith("#") || ref.startsWith("http://") || ref.startsWith("https://")) {
        return false;
    }
    return ref.toLowerCase().endsWith(".md");
}

async function readMarkdownRef(ref: string, baseDir: string, context: TaskContext): Promise<string> {
    const absolutePath = resolve(baseDir, ref);
    try {
        const contents = await readFile(absolutePath, "utf-8");
        return contents.trimEnd();
    } catch (error) {
        context.logger.warn(
            `Failed to resolve markdown description $ref "${ref}" (${absolutePath}): ${
                error instanceof Error ? error.message : String(error)
            }`
        );
        return "";
    }
}
