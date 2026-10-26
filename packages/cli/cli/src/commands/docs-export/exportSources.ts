import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { delay, stripTrailingSlashes } from "@fern-api/core-utils";
import { createDocsLedgerClient } from "@fern-api/fdr-sdk/orpc-client";
import { toPosixPath } from "@fern-api/fs-utils";
import * as tar from "tar";

/** One file of a docs build, addressed by its site-relative path (e.g. `docs/quickstart/index.html`). */
export interface ExportFile {
    path: string;
    read(): Promise<Uint8Array>;
}

/** Where an export's files come from. Yields files in batches so large sites stream instead of buffering. */
export interface ExportSource {
    /** Path prefix the site is served under, without leading/trailing slashes ("" at the root). */
    basepath: string;
    batches(): AsyncIterable<ExportFile[]>;
    close(): Promise<void>;
}

/** A Fern-hosted site: the live static build, listed page by page through FDR. */
export function hostedSource({
    fdrOrigin,
    token,
    headers,
    domain,
    basepath
}: {
    fdrOrigin: string;
    token: string;
    headers?: Record<string, string>;
    domain: string;
    basepath: string;
}): ExportSource {
    const client = createDocsLedgerClient({ baseUrl: fdrOrigin, token, headers });
    return {
        basepath: trimSlashes(basepath),
        async *batches() {
            let cursor: string | undefined;
            do {
                const page = await client.listStaticBuildFiles({ domain, basepath, cursor });
                yield page.files.map((file) => ({ path: file.path, read: () => fetchBytes(file.url) }));
                cursor = page.nextCursor;
            } while (cursor != null);
        },
        close: async () => undefined
    };
}

const EXPORT_POLL_INTERVAL_MS = 2_000;
const EXPORT_TIMEOUT_MS = 30 * 60_000;
const SELF_HOSTED_BATCH_SIZE = 1000;

/** A self-hosted container: its existing `/__admin/export` archive, downloaded and unpacked to a temp dir. */
export function selfHostedSource({
    url,
    adminToken,
    basepath,
    pollIntervalMs = EXPORT_POLL_INTERVAL_MS
}: {
    url: string;
    adminToken: string;
    basepath: string;
    pollIntervalMs?: number;
}): ExportSource {
    const origin = stripTrailingSlashes(url);
    const auth = { Authorization: `Bearer ${adminToken}` };
    let workDir: string | undefined;
    return {
        basepath: trimSlashes(basepath),
        async *batches() {
            workDir = await mkdtemp(path.join(tmpdir(), "fern-docs-export-"));
            await adminRequest(`${origin}/__admin/export`, { method: "POST", headers: auth });
            const deadline = Date.now() + EXPORT_TIMEOUT_MS;
            for (;;) {
                const job = (await (
                    await adminRequest(`${origin}/__admin/export/status`, { headers: auth })
                ).json()) as { status: string; phase?: string; error?: string };
                if (job.status === "complete") {
                    break;
                }
                if (job.status === "failed") {
                    throw new Error(`Self-hosted export failed: ${job.error ?? "unknown error"}`);
                }
                if (Date.now() > deadline) {
                    throw new Error("Timed out waiting for the self-hosted export to finish");
                }
                await delay(pollIntervalMs);
            }
            const archive = path.join(workDir, "site.tar.gz");
            const download = await adminRequest(`${origin}/__admin/export/download`, { headers: auth });
            await writeFile(archive, new Uint8Array(await download.arrayBuffer()));
            const siteDir = path.join(workDir, "site");
            await mkdir(siteDir);
            await tar.extract({ file: archive, cwd: siteDir });
            const files = await listFilesRecursively(siteDir);
            for (let start = 0; start < files.length; start += SELF_HOSTED_BATCH_SIZE) {
                yield files.slice(start, start + SELF_HOSTED_BATCH_SIZE).map((relative) => ({
                    path: relative,
                    read: async () => new Uint8Array(await readFile(path.join(siteDir, relative)))
                }));
            }
        },
        close: async () => {
            if (workDir != null) {
                await rm(workDir, { recursive: true, force: true });
            }
        }
    };
}

async function adminRequest(url: string, init: RequestInit): Promise<Response> {
    const response = await fetch(url, init);
    if (response.status === 401 || response.status === 403) {
        throw new Error(`${url} rejected the admin token (HTTP ${response.status})`);
    }
    if (!response.ok) {
        throw new Error(`${url} failed: HTTP ${response.status} ${await response.text()}`);
    }
    return response;
}

async function fetchBytes(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Download failed: HTTP ${response.status}`);
    }
    return new Uint8Array(await response.arrayBuffer());
}

async function listFilesRecursively(root: string): Promise<string[]> {
    const entries = await readdir(root, { recursive: true, withFileTypes: true });
    return entries
        .filter((entry) => entry.isFile())
        .map((entry) => toPosixPath(path.relative(root, path.join(entry.parentPath, entry.name))))
        .sort();
}

function trimSlashes(value: string): string {
    return value.replace(/^\/+|\/+$/g, "");
}
