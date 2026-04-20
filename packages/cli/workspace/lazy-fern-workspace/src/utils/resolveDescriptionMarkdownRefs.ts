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
 * Near-miss shapes (`$ref` to a JSON Pointer, URL, non-`.md` file, or an
 * object with sibling keys) used to slip through and crash downstream parsers
 * with opaque errors like `e.replace is not a function`. We now detect them
 * here, log a clear warning naming the JSON path and shape, and coerce the
 * value to an empty string so generation can continue.
 *
 * `description` keys inside `properties` / `patternProperties` are left alone
 * — there the key is a schema property *name*, not a metadata field.
 */
export async function resolveDescriptionMarkdownRefs(
    doc: unknown,
    baseDir: string,
    context: TaskContext
): Promise<void> {
    await walk(doc, baseDir, context, "", undefined);
}

const SKIP_METADATA_PARENTS = new Set(["properties", "patternProperties"]);

async function walk(
    node: unknown,
    baseDir: string,
    context: TaskContext,
    path: string,
    parentKey: string | undefined
): Promise<void> {
    if (Array.isArray(node)) {
        await Promise.all(node.map((item, i) => walk(item, baseDir, context, `${path}[${i}]`, parentKey)));
        return;
    }
    if (!isPlainObject(node)) {
        return;
    }
    for (const [key, value] of Object.entries(node)) {
        const childPath = path === "" ? key : `${path}.${key}`;
        const isMetadataDescription =
            key === "description" && !(parentKey != null && SKIP_METADATA_PARENTS.has(parentKey));
        if (isMetadataDescription) {
            if (typeof value === "string" || value == null) {
                continue;
            }
            if (isMarkdownFileRef(value)) {
                node[key] = await readMarkdownRef(value.$ref, baseDir, context, childPath);
                continue;
            }
            if (isSomeRefShape(value)) {
                context.logger.warn(
                    `OpenAPI description at "${childPath}" is a \`$ref\` object we can't resolve ` +
                        `(${describeRef(value)}). Descriptions must be plain strings, and we only inline relative ` +
                        `\`.md\` file refs. Coercing to empty string so generation can continue.`
                );
                node[key] = "";
                continue;
            }
            // Leave anything else alone (rare; downstream validation will catch it).
            await walk(value, baseDir, context, childPath, key);
        } else {
            await walk(value, baseDir, context, childPath, key);
        }
    }
}

function isMarkdownFileRef(value: unknown): value is { $ref: string } {
    if (!isPlainObject(value)) {
        return false;
    }
    const keys = Object.keys(value);
    if (keys.length !== 1 || keys[0] !== "$ref") {
        return false;
    }
    const ref = value.$ref;
    if (typeof ref !== "string" || ref.length === 0) {
        return false;
    }
    if (ref.startsWith("#") || ref.startsWith("http://") || ref.startsWith("https://")) {
        return false;
    }
    return ref.toLowerCase().endsWith(".md");
}

function isSomeRefShape(value: unknown): value is Record<string, unknown> & { $ref: string } {
    return isPlainObject(value) && typeof value.$ref === "string" && value.$ref.length > 0;
}

function describeRef(value: Record<string, unknown> & { $ref: string }): string {
    const ref = value.$ref;
    const siblings = Object.keys(value).filter((k) => k !== "$ref");
    const siblingSuffix = siblings.length > 0 ? `, sibling keys: ${siblings.map((s) => `"${s}"`).join(", ")}` : "";
    return `target="${ref}"${siblingSuffix}`;
}

async function readMarkdownRef(ref: string, baseDir: string, context: TaskContext, path: string): Promise<string> {
    const absolutePath = resolve(baseDir, ref);
    try {
        const contents = await readFile(absolutePath, "utf-8");
        return contents.trimEnd();
    } catch (error) {
        context.logger.warn(
            `Failed to resolve markdown description $ref at "${path}" → "${ref}" (${absolutePath}): ${
                error instanceof Error ? error.message : String(error)
            }. Coercing to empty string so generation can continue.`
        );
        return "";
    }
}
