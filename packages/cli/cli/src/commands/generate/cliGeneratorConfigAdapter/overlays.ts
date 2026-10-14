import { readFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import YAML from "yaml";

/** Fern takes one overlay file per spec, so several overlays become one file with all their actions, in order. */
export async function mergeOverlays(overlayPaths: string[], mergedPath: string): Promise<string> {
    const documents = await Promise.all(
        overlayPaths.map(async (path) => {
            const parsed: unknown = YAML.parse(await readFile(path, "utf8"));
            const rebased = isRecord(parsed) ? rebaseReferences(parsed, dirname(path), dirname(mergedPath)) : {};
            return isRecord(rebased) ? rebased : {};
        })
    );
    const actions = documents.flatMap((document) => (Array.isArray(document.actions) ? document.actions : []));
    return YAML.stringify({ ...documents[0], actions });
}

function rebaseReferences(value: unknown, sourceDir: string, destinationDir: string): unknown {
    if (Array.isArray(value)) {
        return value.map((entry) => rebaseReferences(entry, sourceDir, destinationDir));
    }
    if (!isRecord(value)) {
        return value;
    }
    return Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [
            key,
            key === "$ref" && typeof entry === "string"
                ? rebaseReference(entry, sourceDir, destinationDir)
                : rebaseReferences(entry, sourceDir, destinationDir)
        ])
    );
}

function rebaseReference(reference: string, sourceDir: string, destinationDir: string): string {
    const hash = reference.indexOf("#");
    const file = hash === -1 ? reference : reference.slice(0, hash);
    const fragment = hash === -1 ? "" : reference.slice(hash);
    if (file.length === 0 || isAbsolute(file) || /^[a-z][a-z\d+.-]*:/i.test(file)) {
        return reference;
    }
    const rebased = relative(destinationDir, resolve(sourceDir, file)).split(sep).join("/");
    return `${rebased.startsWith(".") ? rebased : `./${rebased}`}${fragment}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
