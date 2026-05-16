import type { APIV1Write, DocsV1Write } from "@fern-api/fdr-sdk";
import {
    createDocsLedgerClient,
    type DocsPublishGitInput,
    type FileManifestEntry
} from "@fern-api/fdr-sdk/orpc-client";
import type { TaskContext } from "@fern-api/task-context";

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
    fileBlobs,
    fileIdToPath
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
    fileBlobs?: Map<string, Buffer>;
    fileIdToPath?: Map<string, string>;
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
        fileBlobs,
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
    await uploadMissingBlobs(registerResult.missingContent, blobs, context);

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

    return {
        previewUrl: registerResult.previewUrl,
        deploymentId: finishResult.deploymentId
    };
}
