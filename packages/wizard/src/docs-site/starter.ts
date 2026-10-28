import { createHash } from "crypto";
import { mkdir, mkdtemp, rename, rm, stat, writeFile } from "fs/promises";
import os from "os";
import path from "path";

// The docs starter (the Fern Dashboard's onboarding template) isn't shipped with the wizard or the Fern
// CLI. It's downloaded from the fern repository the first time it's needed, each file checked against
// the starter's manifest, and cached under ~/.fern.

/** The fern-api/fern commit whose packages/wizard/templates/docs-starter is downloaded. */
export const DOCS_STARTER_COMMIT = "69e11d3a1d4625814c2a3a128e07bfca1b711015";
const STARTER_PATH = "packages/wizard/templates/docs-starter";
const PARALLEL_DOWNLOADS = 6;

type Fetch = typeof fetch;

interface StarterFile {
    path: string;
    size: number;
    sha256: string;
}

export interface DocsStarterOptions {
    /**
     * Where the starter comes from: a URL to download it from, or a local folder holding it (for
     * development). Defaults to FERN_DOCS_STARTER_URL, then the pinned commit on GitHub.
     */
    source?: string;
    /** Where downloads are kept. Defaults to ~/.fern/docs-starter. */
    cacheDir?: string;
    fetchImpl?: Fetch;
}

/** A local folder holding the docs starter, downloading it first if it isn't cached yet. */
export async function getDocsStarter(options: DocsStarterOptions = {}): Promise<string> {
    const source = (options.source ?? process.env.FERN_DOCS_STARTER_URL ?? defaultSource()).replace(/\/$/, "");
    if (!/^https?:\/\//.test(source)) {
        return path.resolve(source);
    }
    const fetchImpl = options.fetchImpl ?? fetch;
    const cacheRoot = options.cacheDir ?? path.join(os.homedir(), ".fern", "docs-starter");
    // Each source gets its own folder, so a new pin never reuses an old download.
    const target = path.join(cacheRoot, createHash("sha256").update(source).digest("hex").slice(0, 16));
    if (await isDirectory(target)) {
        return target;
    }
    await mkdir(cacheRoot, { recursive: true });
    const staging = await mkdtemp(path.join(cacheRoot, ".download-"));
    try {
        const files = await fetchManifest(source, fetchImpl);
        await forEachInParallel(files, PARALLEL_DOWNLOADS, async (file) => {
            const contents = await download(`${source}/${file.path}`, fetchImpl);
            if (contents.length !== file.size || sha256(contents) !== file.sha256) {
                throw new Error(`${file.path} from ${source} doesn't match the starter's manifest.`);
            }
            const destination = path.join(staging, ...file.path.split("/"));
            await mkdir(path.dirname(destination), { recursive: true });
            await writeFile(destination, contents);
        });
        try {
            await rename(staging, target);
        } catch (error) {
            // Another run may have finished the same download first; its copy is just as good.
            if (!(await isDirectory(target))) {
                throw error;
            }
        }
    } finally {
        await rm(staging, { recursive: true, force: true });
    }
    return target;
}

function defaultSource(): string {
    return `https://raw.githubusercontent.com/fern-api/fern/${DOCS_STARTER_COMMIT}/${STARTER_PATH}`;
}

async function fetchManifest(source: string, fetchImpl: Fetch): Promise<StarterFile[]> {
    const parsed: unknown = JSON.parse((await download(`${source}/manifest.json`, fetchImpl)).toString("utf8"));
    const files = isRecord(parsed) && Array.isArray(parsed.files) ? parsed.files : undefined;
    if (files === undefined || !files.every(isStarterFile)) {
        throw new Error(`The docs starter's manifest at ${source} isn't valid.`);
    }
    return files;
}

async function download(url: string, fetchImpl: Fetch): Promise<Buffer> {
    const response = await fetchImpl(url);
    if (!response.ok) {
        throw new Error(`Couldn't download ${url} (HTTP ${response.status}).`);
    }
    return Buffer.from(await response.arrayBuffer());
}

/** A manifest entry with a safe relative path (no absolute paths or `..`). */
function isStarterFile(value: unknown): value is StarterFile {
    if (
        !isRecord(value) ||
        typeof value.path !== "string" ||
        typeof value.size !== "number" ||
        typeof value.sha256 !== "string"
    ) {
        return false;
    }
    const segments = value.path.split("/");
    return !value.path.startsWith("/") && segments.every((segment) => segment !== "" && segment !== "..");
}

async function forEachInParallel<T>(items: T[], limit: number, task: (item: T) => Promise<void>): Promise<void> {
    let next = 0;
    const worker = async (): Promise<void> => {
        while (next < items.length) {
            const item = items[next++];
            if (item !== undefined) {
                await task(item);
            }
        }
    };
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

function sha256(contents: Buffer): string {
    return createHash("sha256").update(contents).digest("hex");
}

async function isDirectory(dirPath: string): Promise<boolean> {
    try {
        return (await stat(dirPath)).isDirectory();
    } catch {
        return false;
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
