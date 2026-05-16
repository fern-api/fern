import type { APIV1Write, DocsV1Write } from "@fern-api/fdr-sdk";
import {
    createDocsLedgerClient,
    type DocsPublishGitInput,
    type DocsPublishInput,
    type FileManifestEntry
} from "@fern-api/fdr-sdk/orpc-client";
import type { TaskContext } from "@fern-api/task-context";
import { createHash } from "crypto";

import { mapDocsConfigToLedgerConfig } from "./mapDocsConfigToLedgerConfig.js";
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
 * `JSON.stringify` with deterministic key ordering at every level. Arrays
 * keep their original ordering (positions are meaningful); object keys are
 * sorted lexicographically via the replacer. Two inputs that differ only by
 * key insertion order serialize identically — required so the apiManifest
 * blob hash is stable across publishes (cf. FDR `stableStringify`).
 */
function stableStringify(value: unknown): string {
    return JSON.stringify(value, (_key, val) => {
        if (val != null && typeof val === "object" && !Array.isArray(val)) {
            return Object.fromEntries(Object.entries(val).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
        }
        return val;
    });
}

/**
 * Serializes a value to a JSON buffer using {@link stableStringify} and
 * returns a BlobRef + the raw bytes, keyed by content hash for later upload.
 */
function jsonBlobRef(value: unknown): { ref: BlobRef; hash: string; buf: Buffer } {
    const buf = Buffer.from(stableStringify(value), "utf-8");
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
    customDomains,
    git,
    apiDefinitions,
    fileManifest,
    fileBlobs,
    fileIdToPath
}: {
    docsDefinition: DocsDefinition;
    organization: string;
    domain: string;
    basepath: string | undefined;
    previewId: string | undefined;
    customDomains?: string[];
    git?: DocsPublishGitInput;
    apiDefinitions: Map<string, APIV1Write.ApiDefinition>;
    fileManifest?: Record<string, FileManifestEntry>;
    fileBlobs?: Map<string, Buffer>;
    /**
     * Map from FileId (as returned by FDR's legacy startDocsRegister
     * `uploadUrls`) to the `fullPath` string used to key `fileManifest`.
     * Used by {@link mapDocsConfigToLedgerConfig} to translate DocsConfig's
     * FileId-based references (e.g. `colorsV3.dark.logo`) into LedgerConfig's
     * path-based references (e.g. `ImageRef { path, width, height }`).
     */
    fileIdToPath?: Map<string, string>;
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

    // Config is sent inline (not a CAS blob) per the docs-ledger contract.
    // DocsConfig (FileId-based) is translated to LedgerConfig (path-based)
    // up front so the wire payload is already in the schema FDR validates.
    const ledgerConfig = mapDocsConfigToLedgerConfig({
        docsConfig: docsDefinition.config,
        fileManifest,
        fileIdToPath
    });

    // API manifest: serialize all API definitions as a single JSON blob.
    //
    // `apiDefinitions` is populated by the `registerApi` callback inside a
    // `Promise.all`, so the Map's insertion order reflects whichever HTTP
    // round-trip completed first — non-deterministic across publishes.
    // {@link jsonBlobRef} uses {@link stableStringify}, which sorts object
    // keys at every level, so the resulting bytes are stable regardless of
    // Map iteration order.
    //
    // Determinism caveat: stable apiManifest bytes are necessary but not
    // sufficient for a deterministic deployment hash. Page bodies must also
    // be byte-identical, which requires that file references substituted
    // into markdown (`file:<fileId>` tokens emitted by replaceImagePathsAndUrls)
    // be stable. In `ledger` deploy mode the CLI emits path tokens
    // (`file:<sanitizedPath>`) and short-circuits the V2 register call; in
    // `dual`/`legacy` modes the V2 register flow mints fresh UUID FileIds per
    // request, so deployment-level dedup will not fire there.
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
        customDomains: customDomains ?? [],
        previewId: previewId ?? null,
        root: docsDefinition.config.root ?? docsDefinition.config.navigation,
        pages,
        config: ledgerConfig,
        apiManifest: apiManifestRef,
        fileManifest,
        redirects: null,
        locale: "en",
        git
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
    customDomains,
    git,
    token,
    fdrOrigin,
    headers,
    context,
    apiDefinitions,
    fileManifest,
    fileBlobs,
    fileIdToPath
}: {
    docsDefinition: DocsDefinition;
    organization: string;
    domain: string;
    basepath: string | undefined;
    previewId: string | undefined;
    customDomains?: string[];
    git?: DocsPublishGitInput;
    token: string;
    fdrOrigin: string;
    headers: Record<string, string>;
    context: TaskContext;
    apiDefinitions: Map<string, APIV1Write.ApiDefinition>;
    fileManifest?: Record<string, FileManifestEntry>;
    fileBlobs?: Map<string, Buffer>;
    fileIdToPath?: Map<string, string>;
}): Promise<LedgerPublishResult> {
    const { input, blobs } = buildLedgerInput({
        docsDefinition,
        organization,
        domain,
        basepath,
        previewId,
        customDomains,
        git,
        apiDefinitions,
        fileManifest,
        fileBlobs,
        fileIdToPath
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
    await uploadMissingBlobs(registerResult.missingContent, blobs, context);

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

/**
 * Upload blobs the server reported as missing after a register call.
 * Shared between the production and preview ledger flows.
 */
export async function uploadMissingBlobs(
    missingContent: ReadonlyArray<{ hash: string; uploadUrl: string }>,
    blobs: Map<string, Buffer>,
    context: TaskContext
): Promise<void> {
    if (missingContent.length > 0) {
        context.logger.debug(`[ledger] Uploading ${missingContent.length} missing blobs...`);
        const uploadStart = performance.now();

        const results = await asyncPool(UPLOAD_CONCURRENCY, [...missingContent], async ({ hash, uploadUrl }) => {
            const blob = blobs.get(hash);
            if (blob == null) {
                context.logger.warn(`[ledger] Server requested blob ${hash} but we don't have it — skipping`);
                return "skipped" as const;
            }
            return uploadBlobWithRetry(blob, uploadUrl, hash, context);
        });

        const uploaded = results.filter((r) => r === "uploaded").length;
        const alreadyExisted = results.filter((r) => r === "already_exists").length;
        const uploadTime = performance.now() - uploadStart;
        context.logger.debug(
            `[ledger] Upload complete in ${uploadTime.toFixed(0)}ms — ${uploaded} uploaded, ${alreadyExisted} already in store`
        );
    } else {
        context.logger.debug("[ledger] All content already in CAS — no uploads needed");
    }
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
