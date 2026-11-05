import { createWriteStream } from "node:fs";
import { mkdir, mkdtemp, readdir, readFile, rename, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { delay } from "@fern-api/core-utils";
import type { ExportClient } from "@fern-api/fdr-sdk/orpc-client";
import { toPosixPath } from "@fern-api/fs-utils";
import yauzl from "yauzl";

/** One file of a docs build, addressed by its site-relative path (e.g. `docs/quickstart/index.html`). */
export interface ExportFile {
    path: string;
    read(): Promise<Uint8Array>;
}

/**
 * Where an export's files come from. Yields files in batches so large sites stream instead of
 * buffering, and cleans up after itself.
 */
export interface ExportSource {
    batches(): AsyncIterable<ExportFile[]>;
}

/** The FDR calls a hosted export makes: start a task, poll it, get its file's download URL. */
export type SiteExportClient = Pick<ExportClient, "createTask" | "getTask" | "getDownloadUrl">;

/** The PDF settings the dashboard's export page sends: cover, table of contents, headers and footers. */
export type PdfExportOptions = NonNullable<Parameters<SiteExportClient["createTask"]>[0]["options"]>;

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
                const archive = path.join(workDir, "site.zip");
                await runHostedExport({ client, orgId, docsUrl, format, pollIntervalMs, destination: archive });
                const siteDir = path.join(workDir, "site");
                await extractZip(archive, siteDir);
                yield* fileBatches(siteDir, await listFilesRecursively(siteDir));
            } finally {
                await rm(workDir, { recursive: true, force: true });
            }
        }
    };
}

/**
 * A Fern-hosted site as one PDF, rendered by the PDF export worker. Downloads next to `outputFile`
 * and renames it into place, so a failed export leaves any previous PDF intact.
 */
export async function downloadHostedPdf({
    client,
    orgId,
    docsUrl,
    outputFile,
    options,
    pollIntervalMs = EXPORT_POLL_INTERVAL_MS
}: {
    client: SiteExportClient;
    orgId: string;
    docsUrl: string;
    outputFile: string;
    options?: PdfExportOptions;
    pollIntervalMs?: number;
}): Promise<void> {
    const destination = path.resolve(outputFile);
    await mkdir(path.dirname(destination), { recursive: true });
    const partial = `${destination}.partial`;
    try {
        await runHostedExport({ client, orgId, docsUrl, format: "pdf", options, pollIntervalMs, destination: partial });
        await rename(partial, destination);
    } finally {
        await rm(partial, { force: true });
    }
}

/** Starts an export task, waits for it to finish, then downloads its one file to `destination`. */
async function runHostedExport({
    client,
    orgId,
    docsUrl,
    format,
    options,
    pollIntervalMs,
    destination
}: {
    client: SiteExportClient;
    orgId: string;
    docsUrl: string;
    format: "pdf" | "html" | "md";
    options?: PdfExportOptions;
    pollIntervalMs: number;
    destination: string;
}): Promise<void> {
    const { id: taskId } = await client.createTask({ orgId, docsUrl, format, ...(options != null ? { options } : {}) });
    await waitForTask({ client, taskId, pollIntervalMs });
    const { downloadUrl } = await client.getDownloadUrl({ taskId });
    await downloadToFile(downloadUrl, destination);
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
            throw new Error(`${task.errorMessage ?? "unknown error"} (task ${taskId})`);
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
        throw new Error(`Downloading the export failed: HTTP ${response.status}`);
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

async function listFilesRecursively(root: string): Promise<string[]> {
    const entries = await readdir(root, { recursive: true, withFileTypes: true });
    return entries
        .filter((entry) => entry.isFile())
        .map((entry) => toPosixPath(path.relative(root, path.join(entry.parentPath, entry.name))))
        .sort();
}
