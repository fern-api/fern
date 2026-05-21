import { type DocsDefinitionResolver } from "@fern-api/docs-resolver";
import type { APIV1Write, DocsV1Write } from "@fern-api/fdr-sdk";
import {
    createDocsLedgerClient,
    type DocsPublishGitInput,
    type DocsPublishInput,
    type FileManifestEntry,
    type LocaleEntry
} from "@fern-api/fdr-sdk/orpc-client";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { TaskContext } from "@fern-api/task-context";
import { createHash } from "crypto";
import { readFile } from "fs/promises";

import { buildTranslatedDocsDefinition } from "./buildTranslatedDocsDefinition.js";
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
 * If `fileManifest` is provided, it is forwarded as-is into the resulting
 * input. File blobs are NOT included in the returned blob map — they are
 * loaded lazily during the upload step to avoid holding all file content in
 * memory for the entire publish duration. The manifest's keys MUST be the
 * same string the FDR register handler treats as `fullPath` (see
 * {@link makeFileArtifact} in docsPublishTransform.ts) — the CLI uses
 * sanitizedPath (fern-host-relative) which maps 1:1 to fullPath.
 */
export function buildLedgerInput({
    docsDefinition,
    git,
    apiDefinitions,
    fileManifest,
    fileIdToPath,
    locale = "en"
}: {
    docsDefinition: DocsDefinition;
    git?: DocsPublishGitInput;
    apiDefinitions: Map<string, APIV1Write.ApiDefinition>;
    fileManifest?: Record<string, FileManifestEntry>;
    /**
     * Map from FileId (as returned by FDR's legacy startDocsRegister
     * `uploadUrls`) to the `fullPath` string used to key `fileManifest`.
     * Used by {@link mapDocsConfigToLedgerConfig} to translate DocsConfig's
     * FileId-based references (e.g. `colorsV3.dark.logo`) into LedgerConfig's
     * path-based references (e.g. `ImageRef { path, width, height }`).
     */
    fileIdToPath?: Map<string, string>;
    /** Locale to stamp on segments. Defaults to "en". */
    locale?: string;
}): { localeEntry: LocaleEntry; blobs: Map<string, Buffer> } {
    const blobs = new Map<string, Buffer>();

    // Pages: hash each page's markdown content.
    const pages: LocaleEntry["pages"] = {};
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

    // jsFiles: custom React components, referenced markdown snippets, and
    // custom header/footer components resolved by DocsDefinitionResolver.
    let jsFilesRef: BlobRef | null = null;
    if (docsDefinition.jsFiles != null && Object.keys(docsDefinition.jsFiles).length > 0) {
        const jsFilesBlob = jsonBlobRef(docsDefinition.jsFiles);
        blobs.set(jsFilesBlob.hash, jsFilesBlob.buf);
        jsFilesRef = jsFilesBlob.ref;
    }

    const localeEntry: LocaleEntry = {
        root: docsDefinition.config.root ?? docsDefinition.config.navigation,
        pages,
        config: ledgerConfig,
        apiManifest: apiManifestRef,
        jsFiles: jsFilesRef,
        fileManifest,
        redirects: null,
        locale,
        git
    };

    return { localeEntry, blobs };
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
 * All locales (base + translations) are built upfront before any network
 * calls. If any locale fails to build, the entire publish aborts. After
 * building, a single register → upload → finish pipeline runs for the
 * base locale, and then finishTranslation is called for each translation
 * locale (blobs are already uploaded from the combined pool).
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
    filePaths,
    fileIdToPath,
    resolver
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
    /** Hash → absolute file path for lazy on-demand reads during upload. */
    filePaths?: Map<string, AbsoluteFilePath>;
    fileIdToPath?: Map<string, string>;
    /** Resolver instance for accessing translation pages/overlays. Optional. */
    resolver?: DocsDefinitionResolver;
}): Promise<LedgerPublishResult> {
    // ── Phase 1: Build all locales upfront ──────────────────────────────
    // If any locale fails to build, the entire publish aborts before any
    // network calls are made.

    const { localeEntry: baseLocale, blobs } = buildLedgerInput({
        docsDefinition,
        git,
        apiDefinitions,
        fileManifest,
        fileIdToPath
    });

    const builtTranslations = await buildAllTranslationInputs({
        docsDefinition,
        git,
        apiDefinitions,
        fileManifest,
        fileIdToPath,
        resolver,
        context
    });

    // Merge all translation blobs into the base blob pool so the single
    // upload phase covers everything.
    for (const t of builtTranslations) {
        for (const [hash, buf] of t.blobs) {
            blobs.set(hash, buf);
        }
    }

    // ── Phase 2: Single register → upload → finish ─────────────────────
    // Build a unified locales[] array where the base locale is the first
    // entry and translations follow. The server processes all locales
    // through the same pipeline.

    const client = createDocsLedgerClient({ baseUrl: fdrOrigin, token, headers });

    const locales: LocaleEntry[] = [baseLocale, ...builtTranslations.map((t) => t.localeEntry)];

    const publishInput: DocsPublishInput = {
        orgId: organization,
        domain,
        basepath: basepath ?? "",
        customDomains: customDomains ?? [],
        previewId: previewId ?? null,
        defaultLocale: baseLocale.locale,
        locales
    };

    // Register — server computes deployment hash, returns presigned S3
    // URLs for any blobs it doesn't already have in CAS (all locales).
    context.logger.debug("[ledger] Registering deployment...");
    const registerStart = performance.now();
    const registerResult = await client.register(publishInput);
    const registerTime = performance.now() - registerStart;
    context.logger.debug(
        `[ledger] Registered in ${registerTime.toFixed(0)}ms — hash=${registerResult.deploymentHash}, missing=${registerResult.missingContent.length} blobs`
    );

    // Upload all blobs the server doesn't have yet (all locales combined).
    await uploadMissingBlobs(registerResult.missingContent, blobs, context, filePaths);

    // Finish — server persists the deployment + all locale segments in
    // a single atomic transaction. Same input shape as register.
    context.logger.debug("[ledger] Finishing deployment...");
    const finishStart = performance.now();
    const finishResult = await client.finish(publishInput);
    const finishTime = performance.now() - finishStart;
    context.logger.debug(
        `[ledger] Finished in ${finishTime.toFixed(0)}ms — deploymentId=${finishResult.deploymentId}, reused=${finishResult.reusedDeployment}`
    );

    // Log translation results if any were processed.
    if (finishResult.translationsProcessed != null) {
        for (const tp of finishResult.translationsProcessed) {
            context.logger.info(`[ledger] Locale "${tp.locale}": ${tp.segmentsAdded} segment(s) added`);
        }
    }

    return finishResult;
}

/**
 * Upload blobs the server reported as missing after a register call.
 * Shared between the production and preview ledger flows.
 *
 * Small in-memory blobs (pages, config, apiManifest) are looked up in
 * `blobs` first. File blobs are loaded lazily from disk via `filePaths`
 * (hash → absolute path) to avoid holding every file's bytes in memory
 * for the entire publish duration.
 */
export async function uploadMissingBlobs(
    missingContent: ReadonlyArray<{ hash: string; uploadUrl: string }>,
    blobs: Map<string, Buffer>,
    context: TaskContext,
    filePaths?: Map<string, AbsoluteFilePath>
): Promise<void> {
    if (missingContent.length > 0) {
        context.logger.debug(`[ledger] Uploading ${missingContent.length} missing blobs...`);
        const uploadStart = performance.now();

        const results = await asyncPool(UPLOAD_CONCURRENCY, [...missingContent], async ({ hash, uploadUrl }) => {
            // Prefer in-memory blobs (pages, config, apiManifest).
            let blob = blobs.get(hash);
            if (blob == null && filePaths != null) {
                // Lazy read: only load file content for blobs the server
                // actually needs, and discard after upload.
                const filePath = filePaths.get(hash);
                if (filePath != null) {
                    blob = await readFile(filePath);
                }
            }
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

// ── Translation build helpers ──────────────────────────────────────────

interface BuiltTranslation {
    locale: string;
    localePages: Record<string, string>;
    translatedDefinition: DocsDefinition;
    localeEntry: LocaleEntry;
    blobs: Map<string, Buffer>;
}

/**
 * Build ledger inputs for every translation locale the resolver discovered.
 *
 * All locales are built in parallel. If ANY locale fails, the returned
 * promise rejects — callers should let the error propagate to abort the
 * entire publish.
 */
async function buildAllTranslationInputs({
    docsDefinition,
    git,
    apiDefinitions,
    fileManifest,
    fileIdToPath,
    resolver,
    context
}: {
    docsDefinition: DocsDefinition;
    git?: DocsPublishGitInput;
    apiDefinitions: Map<string, APIV1Write.ApiDefinition>;
    fileManifest?: Record<string, FileManifestEntry>;
    fileIdToPath?: Map<string, string>;
    resolver?: DocsDefinitionResolver;
    context: TaskContext;
}): Promise<BuiltTranslation[]> {
    if (resolver == null) {
        return [];
    }

    const translationPages = resolver.getTranslationPages();
    const translationNavigationOverlays = resolver.getTranslationNavigationOverlays();

    if (translationPages == null || Object.keys(translationPages).length === 0) {
        return [];
    }

    const localeEntries = Object.entries(translationPages);
    context.logger.info(`[ledger] Building ${localeEntries.length} translation locale(s)...`);

    return Promise.all(
        localeEntries.map(async ([locale, localePages]): Promise<BuiltTranslation> => {
            const translatedDefinition = await buildTranslatedDocsDefinition({
                docsDefinition,
                locale,
                localePages,
                translationNavigationOverlays,
                resolver,
                context
            });

            const { localeEntry, blobs } = buildLedgerInput({
                docsDefinition: translatedDefinition,
                git,
                apiDefinitions,
                fileManifest,
                fileIdToPath,
                locale
            });

            return { locale, localePages, translatedDefinition, localeEntry, blobs };
        })
    );
}
