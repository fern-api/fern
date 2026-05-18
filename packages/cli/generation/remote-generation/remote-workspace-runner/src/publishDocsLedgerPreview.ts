import type { DocsDefinitionResolver } from "@fern-api/docs-resolver";
import type { APIV1Write, DocsV1Write } from "@fern-api/fdr-sdk";
import {
    createDocsLedgerClient,
    type DocsPublishGitInput,
    type FileManifestEntry,
    type FinishTranslationInput
} from "@fern-api/fdr-sdk/orpc-client";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { TaskContext } from "@fern-api/task-context";

import { buildTranslatedDocsDefinition } from "./buildTranslatedDocsDefinition.js";
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
    // Build the input and blob map using the shared helper.  We pass a
    // throwaway `domain` — it's required by buildLedgerInput's type but will
    // not be sent to the preview endpoint (LedgerPreviewRegisterInput has no
    // domain field).
    const { input, blobs } = buildLedgerInput({
        docsDefinition,
        organization,
        domain: "",
        basepath: basePath,
        previewId,
        customDomains: [],
        git,
        apiDefinitions,
        fileManifest,
        fileIdToPath
    });

    const client = createDocsLedgerClient({ baseUrl: fdrOrigin, token, headers });

    // Step 1: Preview register — server picks the preview host and returns
    // presigned upload URLs for missing blobs.
    context.logger.debug("[ledger-preview] Registering preview deployment...");
    const registerStart = performance.now();
    const registerResult = await client.previewRegister({
        orgId: organization,
        previewId: previewId ?? null,
        basePath: basePath ?? "",
        root: input.root,
        pages: input.pages,
        apiManifest: input.apiManifest,
        config: input.config,
        fileManifest: input.fileManifest,
        jsFiles: input.jsFiles,
        redirects: input.redirects,
        locale: input.locale,
        version: input.version,
        repo: input.repo,
        git
    });
    const registerTime = performance.now() - registerStart;
    context.logger.debug(
        `[ledger-preview] Registered in ${registerTime.toFixed(0)}ms — hash=${registerResult.deploymentHash}, ` +
            `preview=${registerResult.previewUrl}, missing=${registerResult.missingContent.length} blobs`
    );

    // Step 2: Upload missing blobs.
    await uploadMissingBlobs(registerResult.missingContent, blobs, context, filePaths);

    // Step 3: Finish — use the server-assigned domain and previewId so the
    // deployment is keyed to the preview branch.
    context.logger.debug("[ledger-preview] Finishing preview deployment...");
    const finishStart = performance.now();
    const finishResult = await client.finish({
        ...input,
        domain: registerResult.domain,
        basepath: registerResult.basepath,
        customDomains: [],
        previewId: registerResult.previewId
    });
    const finishTime = performance.now() - finishStart;
    context.logger.debug(
        `[ledger-preview] Finished in ${finishTime.toFixed(0)}ms — deploymentId=${finishResult.deploymentId}, ` +
            `reused=${finishResult.reusedDeployment}`
    );

    // Step 4: Publish translations if the resolver has them.
    if (resolver != null) {
        const translationPages = resolver.getTranslationPages();
        const translationNavigationOverlays = resolver.getTranslationNavigationOverlays();

        if (translationPages != null && Object.keys(translationPages).length > 0) {
            const localeEntries = Object.entries(translationPages);
            context.logger.info(`[ledger-preview] Publishing translations for ${localeEntries.length} locale(s)...`);

            const localeResults = await Promise.all(
                localeEntries.map(async ([locale, localePages]) => {
                    try {
                        const translatedDefinition = await buildTranslatedDocsDefinition({
                            docsDefinition,
                            locale,
                            localePages,
                            translationNavigationOverlays,
                            resolver,
                            context
                        });

                        const { input: translationInput, blobs: translationBlobs } = buildLedgerInput({
                            docsDefinition: translatedDefinition,
                            organization,
                            domain: registerResult.domain,
                            basepath: registerResult.basepath,
                            previewId: registerResult.previewId,
                            git,
                            apiDefinitions,
                            fileManifest,
                            fileIdToPath,
                            locale
                        });

                        const localeRegister = await client.register(translationInput);
                        await uploadMissingBlobs(localeRegister.missingContent, translationBlobs, context, filePaths);

                        const finishInput: FinishTranslationInput = {
                            orgId: organization,
                            domain: registerResult.domain,
                            basepath: registerResult.basepath ?? "",
                            deploymentId: finishResult.deploymentId,
                            locale,
                            root: translatedDefinition.config.root ?? translatedDefinition.config.navigation,
                            pages: translationInput.pages,
                            apiManifest: translationInput.apiManifest,
                            config: translationInput.config,
                            fileManifest: translationInput.fileManifest,
                            jsFiles: translationInput.jsFiles,
                            redirects: translationInput.redirects,
                            git: translationInput.git
                        };

                        const result = await client.finishTranslation(finishInput);
                        context.logger.info(
                            `[ledger-preview] Locale "${locale}": ${Object.keys(localePages).length} page(s), ${result.segmentsAdded} segment(s) added`
                        );
                    } catch (error) {
                        context.logger.warn(
                            `[ledger-preview] Failed to publish translations for locale "${locale}": ${String(error)}`
                        );
                        return locale;
                    }
                    return undefined;
                })
            );

            const failedLocales = localeResults.filter((l): l is string => l != null);
            if (failedLocales.length > 0) {
                context.logger.warn(
                    `[ledger-preview] ${failedLocales.length}/${localeEntries.length} locale(s) failed: ${failedLocales.join(", ")}`
                );
            }
        }
    }

    return {
        previewUrl: registerResult.previewUrl,
        deploymentId: finishResult.deploymentId
    };
}
