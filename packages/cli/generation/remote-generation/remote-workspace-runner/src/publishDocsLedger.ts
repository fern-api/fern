import type { APIV1Write, DocsV1Write } from "@fern-api/fdr-sdk";
import { createDocsLedgerClient, type DocsPublishInput, type FileManifestEntry } from "@fern-api/fdr-sdk/orpc-client";
import type { TaskContext } from "@fern-api/task-context";
import { createHash } from "crypto";

import { asyncPool } from "./utils/asyncPool.js";

const UPLOAD_CONCURRENCY = 10;
const UPLOAD_MAX_RETRIES = 3;
const UPLOAD_INITIAL_DELAY_MS = 1_000;

type DocsDefinition = DocsV1Write.DocsDefinition;

function sha256(data: Buffer): string {
    return createHash("sha256").update(data).digest("hex");
}

interface BlobRef {
    hash: string;
    contentType: string;
    contentLength: number;
}

/**
 * Serializes a value to a JSON buffer and returns a BlobRef + the raw bytes,
 * keyed by content hash for later upload.
 */
function jsonBlobRef(value: unknown): { ref: BlobRef; hash: string; buf: Buffer } {
    const buf = Buffer.from(JSON.stringify(value), "utf-8");
    const hash = sha256(buf);
    return {
        ref: { hash, contentType: "application/json", contentLength: buf.length },
        hash,
        buf
    };
}

/**
 * Build a DocsPublishInput from a resolved DocsDefinition and collect
 * all content blobs that may need uploading.
 *
 * If `fileManifest` and `fileBlobs` are provided, they are merged into the
 * resulting input: the manifest is forwarded as-is, and the per-file blobs
 * are folded into the returned blob map so the upload step can stream them
 * to the docs bucket. The manifest's keys MUST be the same string the FDR
 * register handler treats as `fullPath` (see {@link makeFileArtifact} in
 * docsPublishTransform.ts) — the CLI uses sanitizedPath (fern-host-relative)
 * which maps 1:1 to fullPath.
 */
export function buildLedgerInput({
    docsDefinition,
    organization,
    domain,
    basepath,
    previewId,
    apiDefinitions,
    fileManifest,
    fileBlobs
}: {
    docsDefinition: DocsDefinition;
    organization: string;
    domain: string;
    basepath: string | undefined;
    previewId: string | undefined;
    apiDefinitions: Map<string, APIV1Write.ApiDefinition>;
    fileManifest?: Record<string, FileManifestEntry>;
    fileBlobs?: Map<string, Buffer>;
}): { input: DocsPublishInput; blobs: Map<string, Buffer> } {
    const blobs = new Map<string, Buffer>();

    // Pages: hash each page's markdown content.
    const pages: DocsPublishInput["pages"] = {};
    for (const [pageId, page] of Object.entries(docsDefinition.pages)) {
        if (page == null) {
            continue;
        }
        const buf = Buffer.from(page.markdown, "utf-8");
        const hash = sha256(buf);
        pages[pageId] = { hash, contentType: "text/markdown", contentLength: buf.length };
        blobs.set(hash, buf);
    }

    // Config: serialize the entire config as a JSON blob.
    const configBlob = jsonBlobRef(docsDefinition.config);
    blobs.set(configBlob.hash, configBlob.buf);

    // API manifest: serialize all API definitions as a single JSON blob.
    let apiManifestRef: BlobRef | null = null;
    if (apiDefinitions.size > 0) {
        const manifestObj = Object.fromEntries(apiDefinitions);
        const manifestBlob = jsonBlobRef(manifestObj);
        blobs.set(manifestBlob.hash, manifestBlob.buf);
        apiManifestRef = manifestBlob.ref;
    }

    // Merge per-file blobs into the CAS blob map so they get uploaded by the
    // ledger flow alongside pages/config/apiManifest. Each entry in
    // `fileManifest` references a blob by SHA-256 hash that the server will
    // request via the register response's `missingContent` list.
    if (fileBlobs != null) {
        for (const [hash, buf] of fileBlobs) {
            blobs.set(hash, buf);
        }
    }

    const input: DocsPublishInput = {
        orgId: organization,
        domain,
        basepath: basepath ?? "",
        previewId: previewId ?? null,
        root: docsDefinition.config.root ?? docsDefinition.config.navigation,
        pages,
        config: configBlob.ref,
        apiManifest: apiManifestRef,
        fileManifest,
        redirects: null,
        locale: "en"
    };

    return { input, blobs };
}

export interface LedgerPublishResult {
    deploymentId: string;
    siteId: string;
    deploymentHash: string;
    reusedDeployment: boolean;
}

/**
 * Publish docs via the new docs-ledger register → upload → finish flow.
 *
 * This is a self-contained function that can run alongside (dual-write)
 * or instead of (ledger-only) the legacy finishDocsRegister path.
 */
export async function publishDocsViaLedger({
    docsDefinition,
    organization,
    domain,
    basepath,
    previewId,
    token,
    fdrOrigin,
    headers,
    context,
    apiDefinitions,
    fileManifest,
    fileBlobs
}: {
    docsDefinition: DocsDefinition;
    organization: string;
    domain: string;
    basepath: string | undefined;
    previewId: string | undefined;
    token: string;
    fdrOrigin: string;
    headers: Record<string, string>;
    context: TaskContext;
    apiDefinitions: Map<string, APIV1Write.ApiDefinition>;
    fileManifest?: Record<string, FileManifestEntry>;
    fileBlobs?: Map<string, Buffer>;
}): Promise<LedgerPublishResult> {
    const { input, blobs } = buildLedgerInput({
        docsDefinition,
        organization,
        domain,
        basepath,
        previewId,
        apiDefinitions,
        fileManifest,
        fileBlobs
    });

    const client = createDocsLedgerClient({ baseUrl: fdrOrigin, token, headers });

    // Step 1: Register — server computes deployment hash, returns presigned
    // S3 URLs for any blobs it doesn't already have in CAS.
    context.logger.debug("[ledger] Registering deployment...");
    const registerStart = performance.now();
    const registerResult = await client.register(input);
    const registerTime = performance.now() - registerStart;
    context.logger.debug(
        `[ledger] Registered in ${registerTime.toFixed(0)}ms — hash=${registerResult.deploymentHash}, missing=${registerResult.missingContent.length} blobs`
    );

    // Step 2: Upload any blobs the server doesn't have yet.
    if (registerResult.missingContent.length > 0) {
        context.logger.debug(`[ledger] Uploading ${registerResult.missingContent.length} missing blobs...`);
        const uploadStart = performance.now();

        const results = await asyncPool(
            UPLOAD_CONCURRENCY,
            registerResult.missingContent,
            async ({ hash, uploadUrl }) => {
                const blob = blobs.get(hash);
                if (blob == null) {
                    context.logger.warn(`[ledger] Server requested blob ${hash} but we don't have it — skipping`);
                    return "skipped" as const;
                }
                return uploadBlobWithRetry(blob, uploadUrl, hash, context);
            }
        );

        const uploaded = results.filter((r) => r === "uploaded").length;
        const alreadyExisted = results.filter((r) => r === "already_exists").length;
        const uploadTime = performance.now() - uploadStart;
        context.logger.debug(
            `[ledger] Upload complete in ${uploadTime.toFixed(0)}ms — ${uploaded} uploaded, ${alreadyExisted} already in store`
        );
    } else {
        context.logger.debug("[ledger] All content already in CAS — no uploads needed");
    }

    // Step 3: Finish — server persists the deployment.
    context.logger.debug("[ledger] Finishing deployment...");
    const finishStart = performance.now();
    const finishResult = await client.finish(input);
    const finishTime = performance.now() - finishStart;
    context.logger.debug(
        `[ledger] Finished in ${finishTime.toFixed(0)}ms — deploymentId=${finishResult.deploymentId}, reused=${finishResult.reusedDeployment}`
    );

    return finishResult;
}

type UploadResult = "uploaded" | "already_exists";

/**
 * Upload a single blob to S3 with retries on transient failures (429, 5xx).
 * Exponential backoff: 1s, 2s, 4s.
 *
 * Returns "already_exists" on 412 Precondition Failed — the presigned URL may
 * include an If-None-Match condition, so 412 means the object already exists in S3.
 *
 * Fails fast on 403 (expired/invalid presigned URL) and 400 (content integrity
 * mismatch) since these are not recoverable by retrying.
 */
async function uploadBlobWithRetry(
    blob: Buffer,
    uploadUrl: string,
    hash: string,
    context: TaskContext
): Promise<UploadResult> {
    const body = blob.buffer.slice(blob.byteOffset, blob.byteOffset + blob.byteLength) as ArrayBuffer;

    for (let attempt = 0; attempt <= UPLOAD_MAX_RETRIES; attempt++) {
        const response = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/octet-stream" },
            body
        });

        if (response.ok) {
            return "uploaded";
        }

        if (response.status === 412) {
            context.logger.debug(`[ledger] Blob ${hash} already exists in store — skipping`);
            return "already_exists";
        }

        if (response.status === 403) {
            const text = await response.text();
            throw new Error(`[ledger] Presigned URL rejected for ${hash} (expired or signature mismatch): ${text}`);
        }

        if (response.status === 400) {
            const text = await response.text();
            throw new Error(`[ledger] Content integrity check failed for ${hash}: ${text}`);
        }

        const isRetryable = response.status === 429 || response.status >= 500;
        if (isRetryable && attempt < UPLOAD_MAX_RETRIES) {
            const delay = UPLOAD_INITIAL_DELAY_MS * 2 ** attempt;
            context.logger.debug(
                `[ledger] Upload ${hash} got ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${UPLOAD_MAX_RETRIES})`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
        }

        const text = await response.text();
        throw new Error(`[ledger] S3 upload failed for ${hash}: ${response.status} ${text}`);
    }

    throw new Error(`[ledger] Upload exhausted retries for ${hash}`);
}
