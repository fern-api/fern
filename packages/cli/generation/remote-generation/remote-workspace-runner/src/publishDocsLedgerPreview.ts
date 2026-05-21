import type { DocsDefinitionResolver } from "@fern-api/docs-resolver";
import type { APIV1Write, DocsV1Write } from "@fern-api/fdr-sdk";
import {
    createDocsLedgerClient,
    type DocsPublishGitInput,
    type FileManifestEntry,
    type LocaleEntry
} from "@fern-api/fdr-sdk/orpc-client";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { TaskContext } from "@fern-api/task-context";

import { buildTranslatedDocsDefinition } from "./buildTranslatedDocsDefinition.js";
import { createGzipFetch } from "./compressedLedgerFetch.js";
import { buildLedgerInput, uploadMissingBlobs } from "./publishDocsLedger.js";

type DocsDefinition = DocsV1Write.DocsDefinition;

export interface LedgerPreviewResult {
    previewUrl: string;
    deploymentId: string;
}

/**
 * Publish a docs preview via the dedicated ledger preview endpoint
 * (POST /preview/init) followed by the standard finish call.
 *
 * All translation locales are built upfront before any network calls.
 * If any locale fails to build, the entire preview publish aborts.
 *
 * Unlike the production {@link publishDocsViaLedger}, this flow:
 *   - Sends `LedgerPreviewRegisterInput` (no `domain` / `customDomains`).
 *   - Receives a server-generated preview URL and domain.
 *   - Finishes with the server-assigned domain + previewId so the deployment
 *     lands on the preview branch, not production.
 */
export async function publishDocsViaLedgerPreview({
    docsDefinition,
    organization,
    basePath,
    previewId,
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
    basePath: string | undefined;
    previewId: string | undefined;
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
}): Promise<LedgerPreviewResult> {
    // ── Phase 1: Build all locales upfront ──────────────────────────────
    // Translated DocsDefinitions are built before any network calls so a
    // single locale failure aborts the entire preview publish. The cheap
    // sync buildLedgerInput for translations is deferred until after
    // previewRegister because we need the server-assigned domain.

    const { localeEntry: baseLocale, blobs } = buildLedgerInput({
        docsDefinition,
        git,
        apiDefinitions,
        fileManifest,
        fileIdToPath
    });

    const builtTranslationDefs = await buildAllTranslationDefinitions({
        docsDefinition,
        resolver,
        context
    });

    // ── Phase 2: Single register → upload → finish ─────────────────────

    const client = createDocsLedgerClient({ baseUrl: fdrOrigin, token, headers, fetch: createGzipFetch() });

    context.logger.debug("[ledger-preview] Registering preview deployment...");
    const registerStart = performance.now();
    const registerResult = await client.previewRegister({
        orgId: organization,
        previewId: previewId ?? null,
        basePath: basePath ?? "",
        root: baseLocale.root,
        pages: baseLocale.pages,
        apiManifest: baseLocale.apiManifest,
        config: baseLocale.config,
        fileManifest: baseLocale.fileManifest,
        jsFiles: baseLocale.jsFiles,
        redirects: baseLocale.redirects,
        locale: baseLocale.locale,
        version: baseLocale.version,
        repo: baseLocale.repo,
        git
    });
    const registerTime = performance.now() - registerStart;
    context.logger.debug(
        `[ledger-preview] Registered in ${registerTime.toFixed(0)}ms — hash=${registerResult.deploymentHash}, ` +
            `preview=${registerResult.previewUrl}, missing=${registerResult.missingContent.length} blobs`
    );

    // Build translation ledger inputs now that we have the server domain.
    // This is a cheap sync operation (serialization only).
    const translationInputs = builtTranslationDefs.map((t) => {
        const { localeEntry, blobs: translationBlobs } = buildLedgerInput({
            docsDefinition: t.translatedDefinition,
            git,
            apiDefinitions,
            fileManifest,
            fileIdToPath,
            locale: t.locale
        });
        return { ...t, localeEntry, blobs: translationBlobs };
    });

    // Merge all translation blobs into the base pool for the upload phase.
    for (const t of translationInputs) {
        for (const [hash, buf] of t.blobs) {
            blobs.set(hash, buf);
        }
    }

    await uploadMissingBlobs(registerResult.missingContent, blobs, context, filePaths);

    // Build the unified locales array for the finish call.
    const locales: LocaleEntry[] = [baseLocale, ...translationInputs.map((t) => t.localeEntry)];

    // Finish — server persists the preview deployment + all locale segments
    // in a single call.
    context.logger.debug("[ledger-preview] Finishing preview deployment...");
    const finishStart = performance.now();
    const finishResult = await client.finish({
        orgId: organization,
        domain: registerResult.domain,
        basepath: registerResult.basepath,
        customDomains: [],
        previewId: registerResult.previewId,
        locales
    });
    const finishTime = performance.now() - finishStart;
    context.logger.debug(
        `[ledger-preview] Finished in ${finishTime.toFixed(0)}ms — deploymentId=${finishResult.deploymentId}, ` +
            `reused=${finishResult.reusedDeployment}`
    );

    // Log translation results if any were processed.
    if (finishResult.translationsProcessed != null) {
        for (const tp of finishResult.translationsProcessed) {
            context.logger.info(`[ledger-preview] Locale "${tp.locale}": ${tp.segmentsAdded} segment(s) added`);
        }
    }

    return {
        previewUrl: registerResult.previewUrl,
        deploymentId: finishResult.deploymentId
    };
}

// ── Translation build helpers ──────────────────────────────────────────

interface BuiltTranslationDef {
    locale: string;
    localePages: Record<string, string>;
    translatedDefinition: DocsDefinition;
}

/**
 * Build translated DocsDefinitions for every locale the resolver discovered.
 *
 * All locales are built in parallel. If ANY locale fails, the returned
 * promise rejects — callers should let the error propagate to abort the
 * entire publish.
 *
 * This only builds the DocsDefinitions (the expensive async part). The
 * cheap sync `buildLedgerInput` is deferred by the caller because the
 * preview flow needs the server-assigned domain first.
 */
async function buildAllTranslationDefinitions({
    docsDefinition,
    resolver,
    context
}: {
    docsDefinition: DocsDefinition;
    resolver?: DocsDefinitionResolver;
    context: TaskContext;
}): Promise<BuiltTranslationDef[]> {
    if (resolver == null) {
        return [];
    }

    const translationPages = resolver.getTranslationPages();
    const translationNavigationOverlays = resolver.getTranslationNavigationOverlays();

    if (translationPages == null || Object.keys(translationPages).length === 0) {
        return [];
    }

    const localeEntries = Object.entries(translationPages);
    context.logger.info(`[ledger-preview] Building ${localeEntries.length} translation locale(s)...`);

    return Promise.all(
        localeEntries.map(async ([locale, localePages]): Promise<BuiltTranslationDef> => {
            const translatedDefinition = await buildTranslatedDocsDefinition({
                docsDefinition,
                locale,
                localePages,
                translationNavigationOverlays,
                resolver,
                context
            });
            return { locale, localePages, translatedDefinition };
        })
    );
}
