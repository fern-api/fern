import { createWriteStream } from "node:fs";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { delay, stripTrailingSlashes } from "@fern-api/core-utils";
import { isRouterOnlyFile, type PdfExportClient } from "@fern-api/fdr-sdk/orpc-client";
import { toPosixPath } from "@fern-api/fs-utils";
import * as tar from "tar";
import yauzl from "yauzl";

/** One file of a docs build, addressed by its site-relative path (e.g. `docs/quickstart/index.html`). */
export interface ExportFile {
    path: string;
    read(): Promise<Uint8Array>;
}

/**
 * Where an export's files come from: reader-facing files only, router-only ones already dropped.
 * Yields files in batches so large sites stream instead of buffering, and cleans up after itself.
 */
export interface ExportSource {
    batches(): AsyncIterable<ExportFile[]>;
}

/** The FDR calls a hosted export makes: start a zip task, poll it, get the zip's download URL. */
export type SiteExportClient = Pick<PdfExportClient, "createTask" | "getTask" | "getDownloadUrl">;

/**
 * A Fern-hosted site: FDR runs an export Job that zips the live build server-side. Waits for the
 * task, downloads the one zip to a temp dir, then unpacks it. Nothing is yielded until the whole
 * zip is on disk, so a failed export leaves the previous output intact.
 */
export function hostedSource({
    client,
    orgId,
    docsUrl,
    format,
    pollIntervalMs = EXPORT_POLL_INTERVAL_MS
}: {
    client: SiteExportClient;
    orgId: string;
    docsUrl: string;
    format: "html" | "md";
    pollIntervalMs?: number;
}): ExportSource {
    return {
        async *batches() {
            const workDir = await mkdtemp(path.join(tmpdir(), "fern-docs-export-"));
            try {
                const { id: taskId } = await client.createTask({ orgId, docsUrl, format });
                await waitForTask({ client, taskId, pollIntervalMs });
                const { downloadUrl } = await client.getDownloadUrl({ taskId });
                const archive = path.join(workDir, "site.zip");
                await downloadToFile(downloadUrl, archive);
                const siteDir = path.join(workDir, "site");
                await extractZip(archive, siteDir);
                yield* fileBatches(siteDir, await listFilesRecursively(siteDir));
            } finally {
                await rm(workDir, { recursive: true, force: true });
            }
        }
    };
}

async function waitForTask({
    client,
    taskId,
    pollIntervalMs
}: {
    client: SiteExportClient;
    taskId: string;
    pollIntervalMs: number;
}): Promise<void> {
    const deadline = Date.now() + EXPORT_TIMEOUT_MS;
    for (;;) {
        const task = await client.getTask({ taskId });
        if (task.status === "COMPLETED") {
            return;
        }
        if (task.status === "FAILED") {
            throw new Error(`Hosted export failed: ${task.errorMessage ?? "unknown error"}`);
        }
        if (Date.now() > deadline) {
            throw new Error(`Timed out waiting for export task ${taskId} to finish`);
        }
        await delay(pollIntervalMs);
    }
}

async function downloadToFile(url: string, destination: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok || response.body == null) {
        throw new Error(`Downloading the export zip failed: HTTP ${response.status}`);
    }
    await pipeline(Readable.fromWeb(response.body as WebReadableStream), createWriteStream(destination));
}

const S_IFMT = 0o170000;
const S_IFREG = 0o100000;

/**
 * Unpacks a server-built zip under `destination`. Refuses any entry whose name could escape it
 * (see `safeRelativePath`) and any entry that is not a regular file, such as a symlink.
 */
export async function extractZip(zipPath: string, destination: string): Promise<void> {
    await mkdir(destination, { recursive: true });
    const root = path.resolve(destination);
    const zipFile = await new Promise<yauzl.ZipFile>((resolve, reject) =>
        yauzl.open(zipPath, { lazyEntries: true, strictFileNames: true }, (error, opened) =>
            error != null || opened == null ? reject(error ?? new Error("Failed to open zip")) : resolve(opened)
        )
    );
    try {
        await new Promise<void>((resolve, reject) => {
            zipFile.on("error", reject);
            zipFile.on("end", () => resolve());
            zipFile.on("entry", (entry: yauzl.Entry) => {
                unpackEntry(zipFile, entry, root).then(() => zipFile.readEntry(), reject);
            });
            zipFile.readEntry();
        });
    } finally {
        zipFile.close();
    }
}

async function unpackEntry(zipFile: yauzl.ZipFile, entry: yauzl.Entry, root: string): Promise<void> {
    if (entry.fileName.endsWith("/")) {
        return;
    }
    const relative = safeRelativePath(entry.fileName);
    const target = relative == null ? undefined : path.resolve(root, relative);
    if (target == null || !target.startsWith(root + path.sep)) {
        throw new Error(`Refusing to unpack outside the output folder: ${entry.fileName}`);
    }
    const mode = (entry.externalFileAttributes >>> 16) & S_IFMT;
    if (mode !== 0 && mode !== S_IFREG) {
        throw new Error(`Refusing to unpack a non-regular file: ${entry.fileName}`);
    }
    await mkdir(path.dirname(target), { recursive: true });
    const stream = await new Promise<NodeJS.ReadableStream>((resolve, reject) =>
        zipFile.openReadStream(entry, (error, opened) =>
            error != null || opened == null ? reject(error ?? new Error("Failed to read zip entry")) : resolve(opened)
        )
    );
    await pipeline(stream, createWriteStream(target));
}

/**
 * A server-supplied site path (`docs/quickstart/index.html`) as a native relative path, or undefined
 * when it is absolute, has empty, `.` or `..` segments, or holds a backslash, drive letter or NUL.
 */
export function safeRelativePath(filePath: string): string | undefined {
    if (/[\\\0]/.test(filePath) || filePath.startsWith("/") || /^[a-zA-Z]:/.test(filePath)) {
        return undefined;
    }
    const segments = filePath.split("/");
    if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
        return undefined;
    }
    return segments.join(path.sep);
}

function* fileBatches(siteDir: string, files: string[]): Iterable<ExportFile[]> {
    for (let start = 0; start < files.length; start += EXPORT_BATCH_SIZE) {
        yield files.slice(start, start + EXPORT_BATCH_SIZE).map((relative) => ({
            path: relative,
            read: async () => new Uint8Array(await readFile(path.join(siteDir, relative)))
        }));
    }
}

const EXPORT_POLL_INTERVAL_MS = 2_000;
const EXPORT_TIMEOUT_MS = 30 * 60_000;
const EXPORT_BATCH_SIZE = 1000;

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
    return {
        async *batches() {
            const workDir = await mkdtemp(path.join(tmpdir(), "fern-docs-export-"));
            try {
                const siteDir = await downloadAndExtract({ origin, auth, workDir, pollIntervalMs });
                const files = (await listFilesRecursively(siteDir)).filter(
                    (relative) => !isRouterOnlyFile(relative, basepath)
                );
                yield* fileBatches(siteDir, files);
            } finally {
                await rm(workDir, { recursive: true, force: true });
            }
        }
    };
}

/** Runs the container's export job, then downloads and unpacks its archive. Returns the unpacked site folder. */
async function downloadAndExtract({
    origin,
    auth,
    workDir,
    pollIntervalMs
}: {
    origin: string;
    auth: Record<string, string>;
    workDir: string;
    pollIntervalMs: number;
}): Promise<string> {
    await adminRequest(`${origin}/__admin/export`, { method: "POST", headers: auth });
    const deadline = Date.now() + EXPORT_TIMEOUT_MS;
    for (;;) {
        const job = (await (await adminRequest(`${origin}/__admin/export/status`, { headers: auth })).json()) as {
            status: string;
            phase?: string;
            error?: string;
        };
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
    // Only regular files and folders: a link in the archive could point outside siteDir.
    await tar.extract({
        file: archive,
        cwd: siteDir,
        filter: (_entryPath, entry) => "type" in entry && (entry.type === "File" || entry.type === "Directory")
    });
    return siteDir;
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

async function listFilesRecursively(root: string): Promise<string[]> {
    const entries = await readdir(root, { recursive: true, withFileTypes: true });
    return entries
        .filter((entry) => entry.isFile())
        .map((entry) => toPosixPath(path.relative(root, path.join(entry.parentPath, entry.name))))
        .sort();
}
