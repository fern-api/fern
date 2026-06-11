import {
    applyTranslatedApiTitlesToNavTree,
    type DocsDefinitionResolver,
    type TranslatedApiSpec
} from "@fern-api/docs-resolver";
import {
    APIV1Read,
    APIV1Write,
    FdrAPI as CjsFdrSdk,
    convertAPIDefinitionToDb,
    convertDbAPIDefinitionToRead,
    type DocsV1Write,
    SDKSnippetHolder
} from "@fern-api/fdr-sdk";
import {
    type DocsPublishGitInput,
    type DocsPublishInput,
    type FileManifestEntry,
    type LocaleEntry
} from "@fern-api/fdr-sdk/orpc-client";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { convertIrToFdrApi } from "@fern-api/register";
import type { TaskContext } from "@fern-api/task-context";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import * as mime from "mime-types";

import { mapDocsConfigToLedgerConfig } from "./mapDocsConfigToLedgerConfig.js";
import { asyncPool } from "./utils/asyncPool.js";

const UPLOAD_CONCURRENCY = 10;
const TRANSLATION_BUILD_CONCURRENCY = 4;
const UPLOAD_MAX_RETRIES = 3;
const UPLOAD_INITIAL_DELAY_MS = 1_000;

type DocsDefinition = DocsV1Write.DocsDefinition;

function sha256(data: Buffer): string {
    return createHash("sha256").update(data).digest("hex");
}

/**
 * Matches `file:<fullPath>` tokens in rewritten page markdown — the same
 * pattern the docs bundle's MDX serializer uses to discover file references
 * (`packages/fern-docs/bundle/src/mdx/bundler/serialize.ts`). Keeping the two
 * in sync guarantees `referencedFiles` is exactly the set the bundle resolves
 * per page (ADR 0014).
 */
const FILE_REF_PATTERN = /file:([^\s"'<>)}\]]+)/g;

/** Deduplicated bare `fullPath`s of every `file:<fullPath>` token in `markdown`. */
function extractReferencedFiles(markdown: string): string[] {
    const paths = new Set<string>();
    for (const match of markdown.matchAll(FILE_REF_PATTERN)) {
        const fullPath = match[1];
        if (fullPath != null) {
            paths.add(fullPath);
        }
    }
    return [...paths];
}

function remapMarkdownFileReferences(markdown: string, fileIdToPath: Map<string, string> | undefined): string {
    if (fileIdToPath == null || fileIdToPath.size === 0) {
        return markdown;
    }
    return markdown.replace(FILE_REF_PATTERN, (token, fileId: string) => `file:${fileIdToPath.get(fileId) ?? fileId}`);
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
        const markdown = remapMarkdownFileReferences(page.markdown, fileIdToPath);
        const buf = Buffer.from(markdown, "utf-8");
        const hash = sha256(buf);
        // Capture the file/image artifacts this page embeds so FDR can
        // materialise the page→file join into the route shards (ADR 0014,
        // "File metadata on the render path"). The markdown reaching here has
        // already had image paths rewritten to `file:<sanitizedPath>` tokens by
        // the resolver's replaceImagePathsAndUrls step, and in ledger mode the
        // token suffix IS the file's `fullPath`. We scan with the SAME regex
        // the bundle's MDX serializer uses to discover `file:` references, so
        // `referencedFiles` is exactly the set the bundle will request for this
        // page — a cheap O(content) scan over markdown already in memory, not a
        // re-parse and not a server-side re-fetch.
        const referencedFiles = extractReferencedFiles(markdown);
        pages[pageId] = {
            hash,
            contentType: "text/markdown",
            contentLength: buf.length,
            ...(referencedFiles.length > 0 ? { referencedFiles } : {})
        };
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
    // `legacy` mode the V2 register flow mints fresh UUID FileIds per
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
 * This is a self-contained function that runs instead of the legacy
 * finishDocsRegister path.
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

    const { createDocsLedgerClient } = await import("@fern-api/fdr-sdk/orpc-client");
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
            let contentType = "application/octet-stream";
            if (blob == null && filePaths != null) {
                // Lazy read: only load file content for blobs the server
                // actually needs, and discard after upload.
                const filePath = filePaths.get(hash);
                if (filePath != null) {
                    blob = await readFile(filePath);
                    // Infer MIME type from the file extension so S3 stores the
                    // correct Content-Type (e.g. image/png for .png files).
                    // The presigned URL enforces this value in its signature.
                    const inferred = mime.lookup(filePath);
                    if (inferred !== false) {
                        contentType = inferred;
                    }
                }
            }
            if (blob == null) {
                context.logger.warn(`[ledger] Server requested blob ${hash} but we don't have it — skipping`);
                return "skipped" as const;
            }
            return uploadBlobWithRetry(blob, uploadUrl, hash, contentType, context);
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
    contentType: string,
    context: TaskContext
): Promise<UploadResult> {
    const body = blob.buffer.slice(blob.byteOffset, blob.byteOffset + blob.byteLength) as ArrayBuffer;

    for (let attempt = 0; attempt <= UPLOAD_MAX_RETRIES; attempt++) {
        const response = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": contentType },
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
 * Convert an APIV1Write.ApiDefinition to its APIV1Read form for nav title
 * patching. Mirrors the `captureReadApiDefinition` helper in publishDocs.ts.
 */
function toReadApiDefinition(
    definition: APIV1Write.ApiDefinition,
    apiDefinitionId: string,
    context: TaskContext
): APIV1Read.ApiDefinition | undefined {
    try {
        const dbApiDefinition = convertAPIDefinitionToDb(
            definition,
            CjsFdrSdk.ApiDefinitionId(apiDefinitionId),
            new SDKSnippetHolder({
                snippetsConfigWithSdkId: {},
                snippetsBySdkId: {},
                snippetTemplatesByEndpoint: {},
                snippetTemplatesByEndpointId: {},
                snippetsBySdkIdAndEndpointId: {}
            })
        );
        return convertDbAPIDefinitionToRead(dbApiDefinition);
    } catch (error) {
        context.logger.debug(
            `[ledger] Failed to convert API definition "${apiDefinitionId}" to read form: ${String(error)}`
        );
        return undefined;
    }
}

/**
 * Build a locale-specific apiDefinitions map by replacing base API definitions
 * with their translated equivalents (produced from translated OpenAPI specs
 * under `translations/<locale>/apis/<apiName>/`).
 */
export function buildLocaleApiDefinitions({
    baseApiDefinitions,
    translatedSpecs,
    context
}: {
    baseApiDefinitions: Map<string, APIV1Write.ApiDefinition>;
    translatedSpecs: Map<string, TranslatedApiSpec>;
    context: TaskContext;
}): Map<string, APIV1Write.ApiDefinition> {
    // Shallow clone — replaced entries are new objects from convertIrToFdrApi.
    const localeApiDefs = new Map(baseApiDefinitions);
    for (const [baseApiId, spec] of translatedSpecs) {
        try {
            const translatedApiDef = convertIrToFdrApi({
                ir: spec.ir,
                snippetsConfig: spec.snippetsConfig,
                playgroundConfig: spec.playgroundConfig,
                graphqlOperations: spec.graphqlOperations,
                graphqlTypes: spec.graphqlTypes,
                context,
                apiNameOverride: spec.apiName
            });
            localeApiDefs.set(baseApiId, translatedApiDef);
        } catch (error) {
            context.logger.warn(
                `[ledger] Failed to convert translated API definition for API "${baseApiId}": ${String(error)}. ` +
                    `Falling back to base (untranslated) API.`
            );
        }
    }
    return localeApiDefs;
}

/**
 * Build ledger inputs for every translation locale the resolver discovered.
 *
 * For each locale, if translated API specs exist under
 * `translations/<locale>/apis/<apiName>/`, the locale receives its own
 * apiManifest blob with translated descriptions/summaries and a nav tree
 * with localized sidebar titles. Otherwise the base apiManifest is reused.
 *
 * Locales are built with bounded concurrency. If ANY locale fails, the
 * returned promise rejects — callers should let the error propagate to
 * abort the entire publish.
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

    // Get translated API specs (per-locale, per-base-apiDefinitionId).
    // These are already populated by DocsDefinitionResolver.resolve() when
    // buildTranslatedApiDefinitions=true.
    const translatedApiSpecsByLocale = resolver.getTranslatedApiSpecs();

    // Pre-compute base API read definitions once (expensive Write→Db→Read
    // pipeline). Reused across all locales for nav title patching.
    const baseReadApis: Record<string, APIV1Read.ApiDefinition> = {};
    if (translatedApiSpecsByLocale.size > 0) {
        for (const [apiId, def] of apiDefinitions) {
            const readDef = toReadApiDefinition(def, apiId, context);
            if (readDef != null) {
                baseReadApis[apiId] = readDef;
            }
        }
    }

    const localeEntries = Object.entries(translationPages);
    context.logger.info(`[ledger] Building ${localeEntries.length} translation locale(s)...`);
    const { buildTranslatedDocsDefinition } = await import("./buildTranslatedDocsDefinition.js");

    return asyncPool(
        TRANSLATION_BUILD_CONCURRENCY,
        localeEntries,
        async ([locale, localePages]): Promise<BuiltTranslation> => {
            const translatedDefinition = await buildTranslatedDocsDefinition({
                docsDefinition,
                locale,
                localePages,
                translationNavigationOverlays,
                resolver,
                context
            });

            // Build locale-specific API definitions from translated OpenAPI specs.
            const localeTranslatedSpecs = translatedApiSpecsByLocale.get(locale);
            let localeApiDefinitions = apiDefinitions;
            if (localeTranslatedSpecs != null && localeTranslatedSpecs.size > 0) {
                localeApiDefinitions = buildLocaleApiDefinitions({
                    baseApiDefinitions: apiDefinitions,
                    translatedSpecs: localeTranslatedSpecs,
                    context
                });

                // Patch sidebar titles in the nav tree so endpoint/subpackage
                // names reflect the translated API content.
                if (translatedDefinition.config.root != null) {
                    const translatedApisForTitles: Record<string, APIV1Read.ApiDefinition> = {};
                    for (const [baseApiId] of localeTranslatedSpecs) {
                        const translatedDef = localeApiDefinitions.get(baseApiId);
                        if (translatedDef != null) {
                            const translatedRead = toReadApiDefinition(translatedDef, baseApiId, context);
                            if (translatedRead != null) {
                                translatedApisForTitles[baseApiId] = translatedRead;
                            }
                        }
                    }
                    if (Object.keys(translatedApisForTitles).length > 0) {
                        translatedDefinition.config.root = applyTranslatedApiTitlesToNavTree(
                            translatedDefinition.config.root,
                            baseReadApis,
                            translatedApisForTitles
                        );
                    }
                }
            }

            const { localeEntry, blobs } = buildLedgerInput({
                docsDefinition: translatedDefinition,
                git,
                apiDefinitions: localeApiDefinitions,
                fileManifest,
                fileIdToPath,
                locale
            });

            return { locale, localePages, translatedDefinition, localeEntry, blobs };
        }
    );
}
