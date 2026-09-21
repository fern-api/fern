import { readFile, stat } from "fs/promises";
import path from "path";
import { parse } from "yaml";
import type { ApiSpec } from "../types";
import { walkFiles } from "./walk";

const MAX_SPEC_SIZE = 5 * 1024 * 1024;

export async function detectApiSpecs(dir: string): Promise<ApiSpec[]> {
    const files = await walkFiles(dir);
    const specs: ApiSpec[] = [];

    for (const relativePath of files) {
        const extension = path.extname(relativePath).toLowerCase();
        if (extension === ".proto") {
            specs.push({ path: relativePath, format: "protobuf" });
            continue;
        }
        if (extension !== ".yaml" && extension !== ".yml" && extension !== ".json") {
            continue;
        }

        try {
            if ((await stat(path.join(dir, relativePath))).size > MAX_SPEC_SIZE) {
                continue;
            }
            const contents = await readFile(path.join(dir, relativePath), "utf8");
            const document = extension === ".json" ? JSON.parse(contents) : parse(contents);
            const spec = identifySpec(document);
            if (spec !== undefined) {
                specs.push({ path: relativePath, ...spec });
            }
        } catch {
            // Invalid documents are not candidates.
        }
    }

    return specs;
}

type SpecDetails = Pick<ApiSpec, "format" | "title" | "version">;

function identifySpec(value: unknown): SpecDetails | undefined {
    if (!isRecord(value)) {
        return undefined;
    }
    const title = isRecord(value.info) && typeof value.info.title === "string" ? value.info.title : undefined;
    if (typeof value.openapi === "string") {
        return { format: "openapi", title, version: value.openapi };
    }
    if (typeof value.swagger === "string" || typeof value.swagger === "number") {
        return { format: "openapi", title, version: "2.0" };
    }
    if (typeof value.asyncapi === "string") {
        return { format: "asyncapi", title, version: value.asyncapi };
    }
    return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
