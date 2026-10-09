import { readFile } from "node:fs/promises";
import YAML from "yaml";

/** Fern takes one overlay file per spec, so several overlays become one file with all their actions, in order. */
export async function mergeOverlays(overlayPaths: string[]): Promise<string> {
    const documents = await Promise.all(
        overlayPaths.map(async (path) => {
            const parsed: unknown = YAML.parse(await readFile(path, "utf8"));
            return isRecord(parsed) ? parsed : {};
        })
    );
    const actions = documents.flatMap((document) => (Array.isArray(document.actions) ? document.actions : []));
    return YAML.stringify({ ...documents[0], actions });
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
