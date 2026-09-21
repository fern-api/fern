import { readFile } from "fs/promises";
import path from "path";
import { parse } from "yaml";
import type { DocsToolDetection } from "../types";
import { walkFiles } from "./walk";

export async function detectDocsTools(dir: string): Promise<DocsToolDetection[]> {
    const files = await walkFiles(dir);
    const tools: DocsToolDetection[] = [];

    for (const relativePath of files) {
        const name = path.basename(relativePath);
        if (name === "docusaurus.config.js" || name === "docusaurus.config.ts" || name === "docusaurus.config.mjs") {
            tools.push({ name: "docusaurus", path: relativePath });
        } else if (name === "redocly.yaml" || name === "redocly.yml") {
            tools.push({ name: "redocly", path: relativePath });
        } else if (name === ".readme" || name === "readme.yml" || name === "readme.yaml" || name === "readme.json") {
            tools.push({ name: "readme", path: relativePath });
        } else if (name === "mint.json" || name === "docs.json") {
            if (await isMintlifyConfig(path.join(dir, relativePath))) {
                tools.push({ name: "mintlify", path: relativePath });
            }
        }
    }

    return tools;
}

async function isMintlifyConfig(filePath: string): Promise<boolean> {
    try {
        const document: unknown = parse(await readFile(filePath, "utf8"));
        if (!isRecord(document)) {
            return false;
        }
        return (
            Array.isArray(document.navigation) ||
            typeof document.theme === "string" ||
            typeof document.name === "string"
        );
    } catch {
        return false;
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
