import { open, readFile, stat } from "fs/promises";
import path from "path";
import { parse } from "yaml";
import type { ApiSpec } from "../types";

const MAX_SPEC_SIZE = 5 * 1024 * 1024;

export async function detectApiSpecs(dir: string, files: string[]): Promise<ApiSpec[]> {
    const candidates = files.filter((relativePath) => {
        const extension = path.extname(relativePath).toLowerCase();
        return extension === ".proto" || extension === ".yaml" || extension === ".yml" || extension === ".json";
    });
    const specs = await mapWithConcurrency(candidates, 8, async (relativePath) => {
        const extension = path.extname(relativePath).toLowerCase();
        if (extension === ".proto") {
            return { path: relativePath, format: "protobuf" as const };
        }

        try {
            const filePath = path.join(dir, relativePath);
            if ((await stat(filePath)).size > MAX_SPEC_SIZE) {
                return undefined;
            }
            const prefix = await readPrefix(filePath);
            if (!/(openapi|swagger|asyncapi)/i.test(prefix)) {
                return undefined;
            }
            const contents = await readFile(filePath, "utf8");
            const document = extension === ".json" ? JSON.parse(contents) : parse(contents);
            const spec = identifySpec(document);
            if (spec !== undefined) {
                return { path: relativePath, ...spec };
            }
            return undefined;
        } catch {
            return undefined;
        }
    });

    return specs.sort((left, right) => left.path.localeCompare(right.path));
}

async function mapWithConcurrency<T, R>(
    items: T[],
    concurrency: number,
    worker: (item: T) => Promise<R | undefined>
): Promise<R[]> {
    const results: Array<R | undefined> = new Array(items.length);
    let nextIndex = 0;
    async function runWorker(): Promise<void> {
        while (nextIndex < items.length) {
            const index = nextIndex;
            nextIndex += 1;
            const item = items[index];
            if (item === undefined) {
                return;
            }
            results[index] = await worker(item);
        }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker()));
    return results.filter((result): result is R => result !== undefined);
}

async function readPrefix(filePath: string): Promise<string> {
    const handle = await open(filePath, "r");
    try {
        const buffer = Buffer.alloc(4096);
        const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
        return buffer.subarray(0, bytesRead).toString("utf8");
    } finally {
        await handle.close();
    }
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
