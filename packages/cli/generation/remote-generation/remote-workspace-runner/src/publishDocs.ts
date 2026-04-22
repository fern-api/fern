import { FernToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { docsYml, generatorsYml } from "@fern-api/configuration";
import { createFdrService } from "@fern-api/core";
import { MediaType, replaceEnvVariables } from "@fern-api/core-utils";
import { DocsDefinitionResolver, UploadedFile, wrapWithHttps } from "@fern-api/docs-resolver";
import { APIV1Write, FdrAPI as CjsFdrSdk, DocsV1Write, DocsV2Write, FdrClient } from "@fern-api/fdr-sdk";

type DynamicIr = APIV1Write.DynamicIr;
type DynamicIRUpload = APIV1Write.DynamicIRUpload;
type SnippetsConfig = APIV1Write.SnippetsConfig;
type DocsDefinition = DocsV1Write.DocsDefinition;

import { AbsoluteFilePath, convertToFernHostRelativeFilePath, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { convertIrToDynamicSnippetsIr, generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { getOriginalName } from "@fern-api/ir-utils";
import { detectAirGappedMode, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { AIExampleEnhancerConfig, convertIrToFdrApi, enhanceExamplesWithAI } from "@fern-api/register";
import { CliError, TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import axios from "axios";
import chalk from "chalk";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { chunk } from "lodash-es";
import * as mime from "mime-types";
import terminalLink from "terminal-link";
import { getDynamicGeneratorConfig } from "./getDynamicGeneratorConfig.js";
import { measureImageSizes } from "./measureImageSizes.js";
import { asyncPool } from "./utils/asyncPool.js";

const MEASURE_IMAGE_BATCH_SIZE = 10;
const UPLOAD_FILE_BATCH_SIZE = 10;
const HASH_CONCURRENCY = parseInt(process.env.FERN_DOCS_ASSET_HASH_CONCURRENCY ?? "32", 10);

/**
 * Sanitizes a preview ID to be valid in a DNS subdomain label.
 * This MUST match the sanitizePreviewId in generateDocsWorkspace.ts and the
 * server-side sanitizePreviewId in FDR so that predicted URLs match actual URLs.
 */
function sanitizePreviewId(id: string): string {
    const sanitized = id
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, "");
    if (sanitized.length === 0) {
        return "default";
    }
    return sanitized;
}

export class DocsPublishConflictError extends Error {
    constructor() {
        super("Another docs publish is currently in progress for this domain.");
        this.name = "DocsPublishConflictError";
    }
}

async function unlockDeploy({
    fdrOrigin,
    token,
    domain,
    basepath
}: {
    fdrOrigin: string;
    token: string;
    domain: string;
    basepath?: string;
}): Promise<void> {
    try {
        await axios.post(
            `${fdrOrigin}/docs-deployment/unlock`,
            { domain, basepath },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    } catch {
        // Best-effort: if unlock fails, the staleness timeout will still release the lock
    }
}

interface FileWithMimeType {
    mediaType: string;
    absoluteFilePath: AbsoluteFilePath;
    relativeFilePath: RelativeFilePath;
}

interface FileWithSanitizedPathAndMimeType extends FileWithMimeType {
    sanitizedPath: RelativeFilePath;
}

export async function calculateFileHash(absoluteFilePath: AbsoluteFilePath | string): Promise<string> {
    const fileBuffer = await readFile(absoluteFilePath);
    return createHash("sha256").update(new Uint8Array(fileBuffer)).digest("hex");
}

export function sanitizeRelativePathForS3(relativeFilePath: RelativeFilePath): RelativeFilePath {
    // Replace ../ segments with _dot_dot_/ to prevent HTTP client normalization issues
    // that cause S3 signature mismatches when paths contain parent directory references
    return relativeFilePath.replace(/\.\.\//g, "_dot_dot_/") as RelativeFilePath;
}

interface CISource {
    type: "github" | "gitlab" | "bitbucket";
    repo?: string;
    runId?: string;
    runUrl?: string;
    commitSha?: string;
    branch?: string;
    actor?: string;
}

export async function publishDocs({
    token,
    organization,
    docsWorkspace,
    domain,
    customDomains,
    apiWorkspaces,
    ossWorkspaces,
    context,
    preview,
    previewId,
    editThisPage,
    disableTemplates = false,
    skipUpload = false,
    withAiExamples = true,
    excludeApis = false,
    targetAudiences,
    docsUrl,
    cliVersion,
    ciSource,
    deployerAuthor
}: {
    token: FernToken;
    organization: string;
    docsWorkspace: DocsWorkspace;
    domain: string;
    customDomains: string[];
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    ossWorkspaces: OSSWorkspace[];
    context: TaskContext;
    preview: boolean;
    previewId: string | undefined;
    editThisPage: docsYml.RawSchemas.FernDocsConfig.EditThisPageConfig | undefined;
    disableTemplates: boolean | undefined;
    skipUpload: boolean | undefined;
    withAiExamples?: boolean;
    excludeApis?: boolean;
    targetAudiences?: string[];
    docsUrl?: string;
    cliVersion?: string;
    ciSource?: CISource;
    deployerAuthor?: { username?: string; email?: string };
}): Promise<string> {
    const fdrOrigin = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com";
    const isAirGapped = await detectAirGappedMode(`${fdrOrigin}/health`, context.logger);
    if (isAirGapped) {
        context.logger.debug("Detected air-gapped environment - skipping external FDR service calls");
    }

    const headers: Record<string, string> = {};
    if (cliVersion != null) {
        headers["X-CLI-Version"] = cliVersion;
    }
    if (ciSource != null) {
        headers["X-CI-Source"] = JSON.stringify(ciSource);
        context.logger.debug(`CI source detected: ${ciSource.type} (${ciSource.repo ?? "unknown repo"})`);
    }
    if (deployerAuthor?.username != null) {
        headers["X-Deployer-Author"] = deployerAuthor.username;
    }
    if (deployerAuthor?.email != null) {
        headers["X-Deployer-Author-Email"] = deployerAuthor.email;
    }
    const fdr = createFdrService({
        token: token.value,
        ...(Object.keys(headers).length > 0 && { headers })
    });
    const authConfig = { type: "public" as const };

    if (excludeApis) {
        context.logger.debug(
            "Experimental flag 'exclude-apis' is enabled - API references will be excluded from S3 upload"
        );
    }

    let docsRegistrationId: string | undefined;
    let urlToOutput = customDomains[0] ?? domain;
    const basePath = parseBasePath(domain);
    const disableDynamicSnippets =
        docsWorkspace.config.experimental && docsWorkspace.config.experimental.dynamicSnippets === false;
    const isBasepathAware = docsWorkspace.config.experimental?.basepathAware === true;

    if (isBasepathAware) {
        context.logger.debug("Experimental flag 'basepath-aware' is enabled - using basepath-aware S3 key format");
    }

    let deployLocked = false;
    const doUnlock = () => {
        if (deployLocked && !preview) {
            deployLocked = false;
            context.logger.debug("Unlocking docs deploy due to early exit...");
            void unlockDeploy({ fdrOrigin, token: token.value, domain, basepath: basePath });
        }
    };
    const onSignal = async () => {
        if (deployLocked && !preview) {
            deployLocked = false;
            context.logger.debug("Unlocking docs deploy due to signal...");
            await unlockDeploy({ fdrOrigin, token: token.value, domain, basepath: basePath });
        }
        process.exit(1);
    };
    process.on("SIGINT", onSignal);
    process.on("SIGTERM", onSignal);

    try {
        const resolver = new DocsDefinitionResolver({
            domain,
            docsWorkspace,
            ossWorkspaces,
            apiWorkspaces,
            taskContext: context,
            editThisPage,
            uploadFiles: async (files) => {
                // Pre-compute sanitized paths and attach to file objects
                const filesWithSanitizedPaths = files.map((file) => ({
                    ...file,
                    sanitizedPath: sanitizeRelativePathForS3(file.relativeFilePath)
                }));

                const filesMap = new Map(filesWithSanitizedPaths.map((file) => [file.absoluteFilePath, file]));
                const sanitizedToAbsoluteMap = new Map(
                    filesWithSanitizedPaths.map((file) => [file.sanitizedPath, file.absoluteFilePath])
                );
                const filesWithMimeType: FileWithSanitizedPathAndMimeType[] = filesWithSanitizedPaths
                    .map((fileMetadata) => ({
                        ...fileMetadata,
                        mediaType: mime.lookup(fileMetadata.absoluteFilePath)
                    }))
                    .filter(
                        (fileMetadata): fileMetadata is FileWithSanitizedPathAndMimeType =>
                            fileMetadata.mediaType !== false
                    );

                const imagesToMeasure = filesWithMimeType
                    .filter((file) => MediaType.parse(file.mediaType)?.isImage() ?? false)
                    .map((file) => file.absoluteFilePath);

                const measuredImages = await measureImageSizes(imagesToMeasure, MEASURE_IMAGE_BATCH_SIZE, context);

                context.logger.debug(
                    `Hashing ${measuredImages.size} image files with concurrency ${HASH_CONCURRENCY}...`
                );
                const hashImageStart = performance.now();

                const imageArray = Array.from(measuredImages.values());
                const hashedImages: Array<DocsV2Write.ImageFilePath | null> = await asyncPool(
                    HASH_CONCURRENCY,
                    imageArray,
                    async (image) => {
                        const filePath = filesMap.get(image.filePath);
                        if (filePath == null) {
                            return null;
                        }

                        const sanitizedPath = filePath.sanitizedPath;
                        const obj = {
                            filePath: CjsFdrSdk.docs.v1.write.FilePath(
                                convertToFernHostRelativeFilePath(sanitizedPath)
                            ),
                            width: image.width,
                            height: image.height,
                            blurDataUrl: image.blurDataUrl,
                            alt: undefined,
                            fileHash: await calculateFileHash(filePath.absoluteFilePath)
                        } as DocsV2Write.ImageFilePath;
                        return obj;
                    }
                );

                const images: DocsV2Write.ImageFilePath[] = hashedImages.filter(
                    (img): img is DocsV2Write.ImageFilePath => img != null
                );
                const hashImageTime = performance.now() - hashImageStart;
                context.logger.debug(`Hashed ${images.length} images in ${hashImageTime.toFixed(0)}ms`);

                const nonImageFiles = filesWithSanitizedPaths.filter(
                    ({ absoluteFilePath }) => !measuredImages.has(absoluteFilePath)
                );

                context.logger.debug(
                    `Hashing ${nonImageFiles.length} non-image files with concurrency ${HASH_CONCURRENCY}...`
                );
                const hashNonImageStart = performance.now();
                const filepaths: CjsFdrSdk.docs.v2.write.FilePathInput[] = await asyncPool(
                    HASH_CONCURRENCY,
                    nonImageFiles,
                    async (file) => {
                        return {
                            path: CjsFdrSdk.docs.v1.write.FilePath(
                                convertToFernHostRelativeFilePath(file.sanitizedPath)
                            ),
                            fileHash: await calculateFileHash(file.absoluteFilePath)
                        };
                    }
                );
                const hashNonImageTime = performance.now() - hashNonImageStart;
                context.logger.debug(`Hashed ${filepaths.length} non-image files in ${hashNonImageTime.toFixed(0)}ms`);

                if (preview) {
                    let startDocsRegisterResponse;
                    try {
                        startDocsRegisterResponse = await fdr.docs.v2.write.startDocsPreviewRegister({
                            orgId: CjsFdrSdk.OrgId(organization),
                            authConfig,
                            filepaths: filepaths,
                            images,
                            basePath,
                            previewId: previewId != null ? sanitizePreviewId(previewId) : undefined
                        });
                    } catch (error) {
                        return await startDocsRegisterFailed(error, context, organization, domain);
                    }
                    urlToOutput = startDocsRegisterResponse.previewUrl;
                    docsRegistrationId = startDocsRegisterResponse.docsRegistrationId;
                    context.logger.debug(`Received preview registration ID: ${docsRegistrationId}`);

                    if (skipUpload) {
                        context.logger.debug("Skip-upload mode: skipping file uploads for docs preview");
                    } else {
                        const skippedSet = new Set(startDocsRegisterResponse.skippedFiles || []);
                        const urlsToUpload = Object.fromEntries(
                            Object.entries(startDocsRegisterResponse.uploadUrls).filter(
                                ([filepath]) => !skippedSet.has(filepath)
                            )
                        );

                        const uploadCount = Object.keys(urlsToUpload).length;
                        const skippedCount = skippedSet.size;

                        if (uploadCount > 0) {
                            context.logger.debug(`Uploading ${uploadCount} files (${skippedCount} skipped)...`);
                            await uploadFiles(
                                urlsToUpload,
                                docsWorkspace.absoluteFilePath,
                                context,
                                UPLOAD_FILE_BATCH_SIZE,
                                sanitizedToAbsoluteMap
                            );
                        } else {
                            context.logger.debug(`No files to upload (all ${skippedCount} up to date)`);
                        }
                    }
                    return convertToFilePathPairs(
                        startDocsRegisterResponse.uploadUrls,
                        docsWorkspace.absoluteFilePath,
                        sanitizedToAbsoluteMap
                    );
                } else {
                    let startDocsRegisterResponse;
                    try {
                        startDocsRegisterResponse = await fdr.docs.v2.write.startDocsRegister({
                            domain,
                            customDomains,
                            authConfig,
                            orgId: CjsFdrSdk.OrgId(organization),
                            filepaths: filepaths,
                            images,
                            ...(isBasepathAware && { basepathAware: true })
                        });
                    } catch (error) {
                        return startDocsRegisterFailed(error, context, organization, domain);
                    }
                    docsRegistrationId = startDocsRegisterResponse.docsRegistrationId;
                    deployLocked = true;
                    context.logger.debug(`Received production registration ID: ${docsRegistrationId}`);

                    const skippedCount = startDocsRegisterResponse.skippedFiles?.length || 0;
                    if (skippedCount > 0) {
                        context.logger.info(
                            `Skipped ${skippedCount} unchanged file${skippedCount === 1 ? "" : "s"} (already uploaded)`
                        );
                    }

                    if (skipUpload) {
                        context.logger.debug("Skip-upload mode: skipping file uploads for docs");
                    } else {
                        const skippedSet = new Set(startDocsRegisterResponse.skippedFiles || []);
                        const urlsToUpload = Object.fromEntries(
                            Object.entries(startDocsRegisterResponse.uploadUrls).filter(
                                ([filepath]) => !skippedSet.has(filepath)
                            )
                        );

                        const uploadCount = Object.keys(urlsToUpload).length;

                        if (uploadCount > 0) {
                            context.logger.info(`↑ Uploading ${uploadCount} files...`);
                            await uploadFiles(
                                urlsToUpload,
                                docsWorkspace.absoluteFilePath,
                                context,
                                UPLOAD_FILE_BATCH_SIZE,
                                sanitizedToAbsoluteMap
                            );
                        } else {
                            context.logger.info("No files to upload (all up to date)");
                        }
                    }
                    return convertToFilePathPairs(
                        startDocsRegisterResponse.uploadUrls,
                        docsWorkspace.absoluteFilePath,
                        sanitizedToAbsoluteMap
                    );
                }
            },
            registerApi: async ({
                ir,
                snippetsConfig,
                playgroundConfig,
                apiName,
                workspace,
                graphqlOperations,
                graphqlTypes
            }) => {
                // Use apiName from docs.yml (folder name) as the API identifier for FDR
                // This ensures users can reference APIs by their folder name in docs components
                let apiDefinition = convertIrToFdrApi({
                    ir,
                    snippetsConfig,
                    playgroundConfig,
                    graphqlOperations,
                    graphqlTypes,
                    context,
                    apiNameOverride: apiName
                });

                const aiEnhancerConfig = getAIEnhancerConfig(
                    withAiExamples,
                    docsWorkspace.config.aiExamples?.style ??
                        docsWorkspace.config.experimental?.aiExampleStyleInstructions
                );
                if (aiEnhancerConfig) {
                    const sources = workspace?.getSources();
                    const openApiSources = sources
                        ?.filter((source) => source.type === "openapi")
                        .map((source) => ({
                            absoluteFilePath: source.absoluteFilePath,
                            absoluteFilePathToOverrides: source.absoluteFilePathToOverrides
                        }));

                    if (openApiSources == null || openApiSources.length === 0) {
                        context.logger.debug("Skipping AI example enhancement: no OpenAPI source file paths available");
                    } else {
                        apiDefinition = await enhanceExamplesWithAI(
                            apiDefinition,
                            aiEnhancerConfig,
                            context,
                            token,
                            organization,
                            openApiSources
                        );
                    }
                }

                // create dynamic IR + metadata for each generator language
                let dynamicIRsByLanguage: Record<string, DynamicIr> | undefined;
                let languagesWithExistingSdkDynamicIr: Set<string> = new Set();
                if (Object.keys(snippetsConfig).length === 0) {
                    context.logger.debug(`No snippets configuration defined, skipping snippet generation...`);
                } else if (!disableDynamicSnippets) {
                    // Check for existing SDK dynamic IRs before generating
                    const existingSdkDynamicIrs = await checkAndDownloadExistingSdkDynamicIRs({
                        fdr,
                        workspace,
                        organization,
                        context,
                        snippetsConfig
                    });

                    if (existingSdkDynamicIrs && Object.keys(existingSdkDynamicIrs).length > 0) {
                        dynamicIRsByLanguage = existingSdkDynamicIrs;
                        languagesWithExistingSdkDynamicIr = new Set(Object.keys(existingSdkDynamicIrs));
                        context.logger.debug(
                            `Using existing SDK dynamic IRs for: ${Object.keys(existingSdkDynamicIrs).join(", ")}`
                        );
                    }

                    // Generate dynamic IRs for languages that don't have existing SDK dynamic IRs
                    const generatedDynamicIRs = await generateLanguageSpecificDynamicIRs({
                        workspace,
                        organization,
                        context,
                        snippetsConfig,
                        skipLanguages: languagesWithExistingSdkDynamicIr
                    });

                    if (generatedDynamicIRs) {
                        dynamicIRsByLanguage = {
                            ...dynamicIRsByLanguage,
                            ...generatedDynamicIRs
                        };
                    }
                }

                let response;
                try {
                    response = await fdr.api.register.registerApiDefinition({
                        orgId: CjsFdrSdk.OrgId(organization),
                        apiId: CjsFdrSdk.ApiId(apiName ?? getOriginalName(ir.apiName)),
                        definition: apiDefinition,
                        dynamicIRs: dynamicIRsByLanguage
                    });
                } catch (error) {
                    const errorDetails = extractErrorDetails(error);
                    context.logger.error(
                        `FDR registerApiDefinition failed. Error details:\n${JSON.stringify(errorDetails, undefined, 2)}`
                    );
                    if (apiName != null) {
                        return context.failAndThrow(
                            `Failed to publish docs because API definition (${apiName}) could not be uploaded. Please contact support@buildwithfern.com`,
                            errorDetails,
                            { code: CliError.Code.NetworkError }
                        );
                    } else {
                        return context.failAndThrow(
                            `Failed to publish docs because API definition could not be uploaded. Please contact support@buildwithfern.com`,
                            errorDetails,
                            { code: CliError.Code.NetworkError }
                        );
                    }
                }

                context.logger.debug(`Registered API Definition ${apiName}: ${response.apiDefinitionId}`);

                if (response.dynamicIRs && dynamicIRsByLanguage) {
                    if (skipUpload) {
                        context.logger.debug("Skip-upload mode: skipping dynamic IR uploads");
                    } else {
                        await uploadDynamicIRs({
                            dynamicIRs: dynamicIRsByLanguage,
                            dynamicIRUploadUrls: response.dynamicIRs,
                            context,
                            apiId: response.apiDefinitionId
                        });
                    }
                }

                return response.apiDefinitionId;
            },
            targetAudiences
        });

        context.logger.info("Resolving docs definition...");
        const resolveStart = performance.now();
        let docsDefinition = await resolver.resolve();
        const resolveTime = performance.now() - resolveStart;

        if (docsWorkspace.config.settings?.substituteEnvVars) {
            context.logger.debug("Applying environment variable substitution to docs definition...");
            // Exclude jsFiles from env var substitution to avoid conflicts with JS/TS template literals
            const { jsFiles, ...docsWithoutJsFiles } = docsDefinition;
            const substitutedDocs = replaceEnvVariables(
                docsWithoutJsFiles,
                { onError: (e) => context.failAndThrow(undefined, e, { code: CliError.Code.EnvironmentError }) },
                { substituteAsEmpty: false }
            );
            docsDefinition = { ...substitutedDocs, jsFiles };
        }

        const pageCount = Object.keys(docsDefinition.pages).length;
        const apiWorkspaceCount = apiWorkspaces.length;
        const resolveMemory = process.memoryUsage();
        context.logger.info(
            `Resolved docs definition in ${resolveTime.toFixed(0)}ms: ${pageCount} pages${apiWorkspaceCount ? `, ${apiWorkspaceCount} API workspaces` : ""}`
        );
        context.logger.debug(
            `Memory after resolve: RSS=${(resolveMemory.rss / 1024 / 1024).toFixed(2)}MB, Heap=${(resolveMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`
        );

        if (docsRegistrationId == null) {
            doUnlock();
            return context.failAndThrow("Failed to publish docs.", "Docs registration ID is missing.", {
                code: CliError.Code.InternalError
            });
        }

        context.logger.info("Publishing docs to FDR...");
        const publishStart = performance.now();
        try {
            await fdr.docs.v2.write.finishDocsRegister({
                docsRegistrationId,
                docsDefinition,
                excludeApis,
                ...(isBasepathAware && !preview && { basepathAware: true })
            });
        } catch (error) {
            return context.failAndThrow("Failed to publish docs to " + domain, error, {
                code: CliError.Code.NetworkError
            });
        }

        const publishTime = performance.now() - publishStart;
        context.logger.debug(`Docs published to FDR in ${publishTime.toFixed(0)}ms`);

        const url = wrapWithHttps(urlToOutput);
        await updateAiChatFromDocsDefinition({
            docsDefinition,
            isPreview: preview,
            context
        });

        const link = terminalLink(url, url);
        context.logger.info(chalk.green(`Published docs to ${link}`));
        return url;
    } catch (error) {
        doUnlock();
        throw error;
    } finally {
        deployLocked = false;
        process.removeListener("SIGINT", onSignal);
        process.removeListener("SIGTERM", onSignal);
    }
}

// The server currently returns DocsV1Write.FileS3UploadUrl ({ uploadUrl, fileId }) objects
// as values in uploadUrls, but the oRPC contract types them as plain strings.
// These helpers handle both formats for forward compatibility.
function isLegacyUploadUrlObject(value: unknown): value is { uploadUrl: string; fileId: string } {
    return (
        typeof value === "object" &&
        value !== null &&
        "uploadUrl" in value &&
        typeof (value as { uploadUrl: unknown }).uploadUrl === "string" &&
        "fileId" in value &&
        typeof (value as { fileId: unknown }).fileId === "string"
    );
}

function extractUploadUrl(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }
    if (isLegacyUploadUrlObject(value)) {
        return value.uploadUrl;
    }
    throw new Error(`Unexpected upload URL value: ${JSON.stringify(value)}`);
}

function extractFileId(key: string, value: unknown): DocsV1Write.FileId {
    if (isLegacyUploadUrlObject(value)) {
        return DocsV1Write.FileId(value.fileId);
    }
    return DocsV1Write.FileId(key);
}

async function uploadFiles(
    filesToUpload: Record<string, unknown>,
    docsWorkspacePath: AbsoluteFilePath,
    context: TaskContext,
    batchSize: number,
    sanitizedToAbsoluteMap: Map<string, AbsoluteFilePath>
): Promise<void> {
    const startTime = Date.now();
    const totalFiles = Object.keys(filesToUpload).length;
    context.logger.debug(`Start uploading ${totalFiles} files...`);
    const chunkedFilepathsToUpload = chunk(Object.entries(filesToUpload), batchSize);
    let filesUploaded = 0;
    for (const chunkedFilepaths of chunkedFilepathsToUpload) {
        await Promise.all(
            chunkedFilepaths.map(async ([key, urlValue]) => {
                // Use the mapping to get the original absolute path instead of reconstructing from sanitized key
                const absoluteFilePath =
                    sanitizedToAbsoluteMap.get(key) || resolve(docsWorkspacePath, RelativeFilePath.of(key));
                try {
                    const uploadUrl = extractUploadUrl(urlValue);
                    const mimeType = mime.lookup(absoluteFilePath);
                    await axios.put(uploadUrl, await readFile(absoluteFilePath), {
                        headers: {
                            "Content-Type": mimeType === false ? "application/octet-stream" : mimeType,
                            // Set max cache control for S3 uploads
                            "Cache-Control": "public, max-age=31536000, immutable"
                        }
                    });
                } catch (e) {
                    // file might not exist
                    context.failAndThrow(`Failed to upload ${absoluteFilePath}`, e, {
                        code: CliError.Code.NetworkError
                    });
                }
            })
        );
        const endTime = Date.now();
        filesUploaded += chunkedFilepaths.length;
        context.logger.debug(`Uploaded ${filesUploaded}/${totalFiles} files in ${endTime - startTime}ms`);
    }
    const endTime = Date.now();
    context.logger.debug(`Finished uploading ${totalFiles} files in ${endTime - startTime}ms`);
}

function convertToFilePathPairs(
    uploadUrls: Record<string, unknown>,
    docsWorkspacePath: AbsoluteFilePath,
    sanitizedToAbsoluteMap?: Map<string, AbsoluteFilePath>
): UploadedFile[] {
    const toRet: UploadedFile[] = [];
    for (const [key, urlValue] of Object.entries(uploadUrls)) {
        const relativeFilePath = RelativeFilePath.of(key);
        // Use the mapping to get the original absolute path instead of reconstructing from sanitized key
        const absoluteFilePath = sanitizedToAbsoluteMap?.get(key) || resolve(docsWorkspacePath, relativeFilePath);
        toRet.push({
            relativeFilePath,
            absoluteFilePath,
            fileId: extractFileId(key, urlValue)
        });
    }
    return toRet;
}

async function startDocsRegisterFailed(
    error: unknown,
    context: TaskContext,
    organization: string,
    domain: string
): Promise<never> {
    context.instrumentPostHogEvent({
        command: "docs-generation",
        properties: {
            error: JSON.stringify(error)
        }
    });

    const errorDetails = extractErrorDetails(error);
    context.logger.debug(
        `startDocsRegister failed for domain '${domain}', org '${organization}'. Error details:\n${JSON.stringify(errorDetails, undefined, 2)}`
    );

    const errorObj = error as Record<string, unknown>;
    const errorContent = errorObj?.content as Record<string, unknown> | undefined;
    if (errorContent?.reason === "status-code" && errorContent?.statusCode === 409) {
        throw new DocsPublishConflictError();
    }

    const authErrorMessage = getAuthenticationErrorMessage(error, organization, domain);
    if (authErrorMessage != null) {
        return context.failAndThrow(authErrorMessage, undefined, { code: CliError.Code.AuthError });
    }

    const errorType = errorObj?.error as string | undefined;
    switch (errorType) {
        case "InvalidCustomDomainError":
            return context.failAndThrow(
                `Your docs domain should end with ${process.env.DOCS_DOMAIN_SUFFIX ?? "docs.buildwithfern.com"}`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        case "InvalidDomainError":
            return context.failAndThrow(
                "Please make sure that none of your custom domains are not overlapping (i.e. one is a substring of another)",
                undefined,
                { code: CliError.Code.ConfigError }
            );
        case "UnauthorizedError":
            return context.failAndThrow(buildAuthFailureMessage(domain, organization, errorContent), undefined, {
                code: CliError.Code.AuthError
            });
        case "UserNotInOrgError":
            return context.failAndThrow(
                `You do not belong to organization '${organization}'. Please run 'fern login' to ensure you are logged in with the correct account.\n\n` +
                    "Please ensure you have membership at https://dashboard.buildwithfern.com, and ask a team member for an invite if not.",
                undefined,
                { code: CliError.Code.AuthError }
            );
        case "UnavailableError":
            return context.failAndThrow(
                "Failed to publish docs. Please try again later or reach out to Fern support at support@buildwithfern.com.",
                undefined,
                { code: CliError.Code.NetworkError }
            );
        default:
            return context.failAndThrow("Failed to publish docs.", error, { code: CliError.Code.NetworkError });
    }
}

function getAuthenticationErrorMessage(error: unknown, organization: string, domain: string): string | undefined {
    const errorObj = error as Record<string, unknown>;
    const content = errorObj?.content as Record<string, unknown> | undefined;

    if (content?.reason === "status-code") {
        const statusCode = content.statusCode as number | undefined;

        if (statusCode === 401 || statusCode === 403) {
            return buildAuthFailureMessage(domain, organization, content);
        }
    }

    return undefined;
}

function buildAuthFailureMessage(
    domain: string,
    organization: string,
    errorContent: Record<string, unknown> | undefined
): string {
    const { code, message } = extractServerError(errorContent);

    switch (code) {
        case "FORBIDDEN":
            return buildForbiddenMessage(domain, organization, message);
        case "UNAUTHORIZED":
            return buildUnauthorizedMessage(organization, message);
        case "INTERNAL_SERVER_ERROR":
            return `An internal server error occurred while publishing docs to '${domain}'. Please try again or reach out to support@buildwithfern.com for assistance.`;
        default:
            if (message != null) {
                return message;
            }
            return `Failed to publish docs to '${domain}'. Please reach out to support@buildwithfern.com for assistance.`;
    }
}

// FDR overloads FORBIDDEN for domain ownership, org membership, CLI permissions,
// and entitlement errors. Only org membership needs CLI-specific hints (fern login);
// all other FDR FORBIDDEN messages are already actionable with billing URLs and
// admin contact guidance, so we pass them through directly.
const FORBIDDEN_ORG_MEMBERSHIP_PATTERNS = ["does not belong to organization", "User does not belong"];

function buildForbiddenMessage(domain: string, organization: string, message: string | undefined): string {
    if (message == null) {
        return `You do not have permission to publish docs to '${domain}' under organization '${organization}'.`;
    }

    if (FORBIDDEN_ORG_MEMBERSHIP_PATTERNS.some((pattern) => message.includes(pattern))) {
        return (
            `You are not a member of organization '${organization}'. ` +
            "Please run 'fern login' to ensure you are logged in with the correct account.\n\n" +
            "Please ensure you have membership at https://dashboard.buildwithfern.com, and ask a team member for an invite if not."
        );
    }

    return message;
}

function buildUnauthorizedMessage(organization: string, message: string | undefined): string {
    if (message != null && message.includes("Invalid authorization token")) {
        return "Your authentication token is invalid or expired. " + "Please run 'fern login' to re-authenticate.";
    }

    return (
        `You are not authorized to publish docs under organization '${organization}'. ` +
        "Please run 'fern login' to ensure you are logged in with the correct account.\n\n" +
        "Please ensure you have membership at https://dashboard.buildwithfern.com, and ask a team member for an invite if not."
    );
}

function extractServerError(content: Record<string, unknown> | undefined): {
    code: string | undefined;
    message: string | undefined;
} {
    if (content == null) {
        return { code: undefined, message: undefined };
    }

    const body = content.body as Record<string, unknown> | string | undefined;
    if (body != null && typeof body === "object") {
        const code = typeof body.code === "string" ? body.code : undefined;
        const message = typeof body.message === "string" ? body.message : undefined;
        return { code, message };
    }

    const message =
        typeof body === "string" && body.length > 0
            ? body
            : typeof content.errorMessage === "string"
              ? content.errorMessage
              : typeof content.message === "string"
                ? content.message
                : undefined;

    return { code: undefined, message };
}

function parseBasePath(domain: string): string | undefined {
    try {
        return new URL(wrapWithHttps(domain)).pathname;
    } catch (e) {
        return undefined;
    }
}

async function checkAndDownloadExistingSdkDynamicIRs({
    fdr,
    workspace,
    organization,
    context,
    snippetsConfig
}: {
    fdr: FdrClient;
    workspace: FernWorkspace | undefined;
    organization: string;
    context: TaskContext;
    snippetsConfig: SnippetsConfig;
}): Promise<Record<string, DynamicIr> | undefined> {
    if (!workspace) {
        return undefined;
    }

    const snippetConfigWithVersions = await buildSnippetConfigurationWithVersions({
        fdr,
        workspace,
        snippetsConfig,
        context
    });

    if (Object.keys(snippetConfigWithVersions).length === 0) {
        context.logger.debug(`[SDK Dynamic IR] No snippet configs found, skipping S3 check`);
        return undefined;
    }

    try {
        const response = await fdr.api.register.checkSdkDynamicIrExists({
            orgId: CjsFdrSdk.OrgId(organization),
            apiId: "",
            irVersions: []
        });

        const existingDynamicIrs = response.existingDynamicIrs ?? {};

        if (Object.keys(existingDynamicIrs).length === 0) {
            context.logger.debug("[SDK Dynamic IR] No existing SDK dynamic IRs found in S3");
            return undefined;
        }

        const result: Record<string, DynamicIr> = {};
        for (const [language, sdkDynamicIrDownload] of Object.entries(existingDynamicIrs ?? {})) {
            try {
                context.logger.debug(`Downloading existing SDK dynamic IR for ${language}...`);
                const downloadResponse = await fetch(sdkDynamicIrDownload.downloadUrl);
                if (downloadResponse.ok) {
                    const dynamicIR = (await downloadResponse.json()) as unknown;
                    result[language] = { dynamicIR };
                    context.logger.debug(`Successfully downloaded SDK dynamic IR for ${language}`);
                } else {
                    context.logger.warn(
                        `Failed to download SDK dynamic IR for ${language}: ${downloadResponse.status}`
                    );
                }
            } catch (error) {
                context.logger.warn(`Error downloading SDK dynamic IR for ${language}: ${error}`);
            }
        }

        return Object.keys(result).length > 0 ? result : undefined;
    } catch (error) {
        context.logger.debug(`Error checking for existing SDK dynamic IRs: ${error}`);
        return undefined;
    }
}
// normalize Go package names by stripping https:// prefix to match how upload keys are generated.
function normalizeGoPackageForLookup(repository: string): string {
    return repository.replace(/^https:\/\//, "");
}
async function buildSnippetConfigurationWithVersions({
    fdr,
    workspace,
    snippetsConfig,
    context
}: {
    fdr: FdrClient;
    workspace: FernWorkspace;
    snippetsConfig: SnippetsConfig;
    context: TaskContext;
}): Promise<Record<string, { packageName: string; version: string | undefined }>> {
    const result: Record<string, { packageName: string; version: string | undefined }> = {};

    const snippetConfigs: Array<{
        language: string;
        snippetName: string | undefined;
        explicitVersion: string | undefined;
    }> = [
        {
            language: "typescript",
            snippetName: snippetsConfig.typescriptSdk?.package ?? undefined,
            explicitVersion: snippetsConfig.typescriptSdk?.version ?? undefined
        },
        {
            language: "python",
            snippetName: snippetsConfig.pythonSdk?.package ?? undefined,
            explicitVersion: snippetsConfig.pythonSdk?.version ?? undefined
        },
        {
            language: "java",
            snippetName: snippetsConfig.javaSdk?.coordinate ?? undefined,
            explicitVersion: snippetsConfig.javaSdk?.version ?? undefined
        },
        {
            language: "go",
            // Normalize to match S3 upload key format (github.com/owner/repo vs https://github.com/owner/repo)
            snippetName:
                snippetsConfig.goSdk?.githubRepo && normalizeGoPackageForLookup(snippetsConfig.goSdk?.githubRepo),
            explicitVersion: snippetsConfig.goSdk?.version ?? undefined
        },
        {
            language: "csharp",
            snippetName: snippetsConfig.csharpSdk?.package ?? undefined,
            explicitVersion: snippetsConfig.csharpSdk?.version ?? undefined
        },
        {
            language: "ruby",
            snippetName: snippetsConfig.rubySdk?.gem ?? undefined,
            explicitVersion: snippetsConfig.rubySdk?.version ?? undefined
        },
        {
            language: "php",
            snippetName: snippetsConfig.phpSdk?.package ?? undefined,
            explicitVersion: snippetsConfig.phpSdk?.version ?? undefined
        },
        {
            language: "swift",
            snippetName: snippetsConfig.swiftSdk?.package ?? undefined,
            explicitVersion: snippetsConfig.swiftSdk?.version ?? undefined
        },
        {
            language: "rust",
            snippetName: snippetsConfig.rustSdk?.package ?? undefined,
            explicitVersion: snippetsConfig.rustSdk?.version ?? undefined
        }
    ];

    for (const config of snippetConfigs) {
        if (!config.snippetName) {
            continue;
        }

        let version: string | undefined = config.explicitVersion ?? undefined;
        if (!version) {
            const versionResult = await computeSemanticVersionForLanguage({
                fdr,
                workspace,
                language: config.language,
                snippetName: config.snippetName,
                context
            });
            version = versionResult?.version;
        }

        // Include the entry even if no version is available - the API will use the latest version
        result[config.language] = { packageName: config.snippetName, version };
        if (!version) {
            context.logger.debug(`[SDK Dynamic IR] ${config.language}: no version specified, will use latest`);
        }
    }

    return result;
}

async function computeSemanticVersionForLanguage({
    fdr,
    workspace,
    language,
    snippetName,
    context
}: {
    fdr: FdrClient;
    workspace: FernWorkspace;
    language: string;
    snippetName: string;
    context: TaskContext;
}): Promise<{ version: string; generatorPackage: string } | undefined> {
    let fdrLanguage: CjsFdrSdk.sdks.Language;
    switch (language) {
        case "csharp":
            fdrLanguage = "Csharp";
            break;
        case "go":
            fdrLanguage = "Go";
            break;
        case "java":
            fdrLanguage = "Java";
            break;
        case "python":
            fdrLanguage = "Python";
            break;
        case "ruby":
            fdrLanguage = "Ruby";
            break;
        case "typescript":
            fdrLanguage = "TypeScript";
            break;
        case "php":
            fdrLanguage = "Php";
            break;
        case "swift":
            fdrLanguage = "Swift";
            break;
        default:
            return undefined;
    }

    let githubRepository: string | undefined;
    let generatorPackage: string | undefined;
    let matchedGeneratorName: string | undefined;

    if (workspace.generatorsConfiguration?.groups) {
        const candidatePackages: string[] = [];
        for (const group of workspace.generatorsConfiguration.groups) {
            for (const generatorInvocation of group.generators) {
                if (generatorInvocation.language === language) {
                    const pkgName = generatorsYml.getPackageName({ generatorInvocation });
                    if (pkgName) {
                        candidatePackages.push(pkgName);
                    }
                    if (!generatorPackage && pkgName) {
                        generatorPackage = pkgName;
                        matchedGeneratorName = generatorInvocation.name;
                        if (generatorInvocation.outputMode.type === "githubV2") {
                            githubRepository = `${generatorInvocation.outputMode.githubV2.owner}/${generatorInvocation.outputMode.githubV2.repo}`;
                        }
                    }
                }
            }
        }
    }

    if (!generatorPackage) {
        context.logger.debug(`[SDK Dynamic IR] ${language}: no generator found with a package name`);
        return undefined;
    }

    try {
        const response = await fdr.sdks.computeSemanticVersion({
            githubRepository,
            language: fdrLanguage,
            package: generatorPackage
        });

        context.logger.debug(
            `[SDK Dynamic IR] ${language}: computed version ${response.version} for package "${generatorPackage}"`
        );
        return { version: response.version, generatorPackage };
    } catch (error) {
        context.logger.debug(`[SDK Dynamic IR] ${language}: error computing version: ${error}`);
        return undefined;
    }
}

async function generateLanguageSpecificDynamicIRs({
    workspace,
    organization,
    context,
    snippetsConfig,
    skipLanguages = new Set()
}: {
    workspace: FernWorkspace | undefined;
    organization: string;
    context: TaskContext;
    snippetsConfig: SnippetsConfig;
    skipLanguages?: Set<string>;
}): Promise<Record<string, DynamicIr> | undefined> {
    let languageSpecificIRs: Record<string, DynamicIr> = {};

    if (!workspace) {
        return undefined;
    }

    let snippetConfiguration = {
        typescript: snippetsConfig.typescriptSdk?.package,
        python: snippetsConfig.pythonSdk?.package,
        java: snippetsConfig.javaSdk?.coordinate,
        // normalize Go package name to match generator package format for comparison logic
        go: snippetsConfig.goSdk?.githubRepo && normalizeGoPackageForLookup(snippetsConfig.goSdk?.githubRepo),
        csharp: snippetsConfig.csharpSdk?.package,
        ruby: snippetsConfig.rubySdk?.gem,
        php: snippetsConfig.phpSdk?.package,
        swift: snippetsConfig.swiftSdk?.package,
        rust: snippetsConfig.rustSdk?.package
    };

    if (workspace.generatorsConfiguration?.groups) {
        for (const group of workspace.generatorsConfiguration.groups) {
            for (const generatorInvocation of group.generators) {
                let dynamicGeneratorConfig = getDynamicGeneratorConfig({
                    apiName: workspace.workspaceName ?? "",
                    organization,
                    generatorInvocation
                });
                let packageName = "";

                if (dynamicGeneratorConfig?.outputConfig.type === "publish") {
                    switch (dynamicGeneratorConfig.outputConfig.value.type) {
                        case "npm":
                        case "nuget":
                        case "pypi":
                        case "rubygems":
                            packageName = dynamicGeneratorConfig.outputConfig.value.packageName;
                            break;
                        case "maven":
                            packageName = dynamicGeneratorConfig.outputConfig.value.coordinate;
                            break;
                        case "go":
                            packageName = dynamicGeneratorConfig.outputConfig.value.repoUrl;
                            break;
                        case "swift":
                            packageName = dynamicGeneratorConfig.outputConfig.value.repoUrl;
                            break;
                        case "crates":
                            packageName = dynamicGeneratorConfig.outputConfig.value.packageName;
                            break;
                    }
                }

                // construct a generatorConfig for php since it is not parsed by getDynamicGeneratorConfig
                if (
                    generatorInvocation.language === "php" &&
                    generatorInvocation.config &&
                    typeof generatorInvocation.config === "object" &&
                    "packageName" in generatorInvocation.config
                ) {
                    packageName = (generatorInvocation.config as { packageName?: string }).packageName ?? "";
                }

                // Normalize Go package names to strip https:// prefix,
                // matching how snippetConfiguration values are normalized
                if (generatorInvocation.language === "go" && packageName) {
                    packageName = normalizeGoPackageForLookup(packageName);
                }

                if (!generatorInvocation.language) {
                    continue;
                }

                // Skip languages that already have SDK dynamic IRs
                if (skipLanguages.has(generatorInvocation.language)) {
                    context.logger.debug(
                        `Skipping dynamic IR generation for ${generatorInvocation.language} (using existing SDK dynamic IR)`
                    );
                    continue;
                }

                // generate a dynamic IR for configuration that matches the requested api snippet
                if (
                    generatorInvocation.language &&
                    snippetConfiguration[generatorInvocation.language] === packageName
                ) {
                    const irForDynamicSnippets = generateIntermediateRepresentation({
                        workspace,
                        generationLanguage: generatorInvocation.language,
                        keywords: undefined,
                        smartCasing: generatorInvocation.smartCasing,
                        exampleGeneration: {
                            disabled: true,
                            skipAutogenerationIfManualExamplesExist: true,
                            skipErrorAutogenerationIfManualErrorExamplesExist: true
                        },
                        audiences: {
                            type: "all"
                        },
                        readme: undefined,
                        packageName: packageName,
                        version: undefined,
                        context,
                        sourceResolver: new SourceResolverImpl(context, workspace),
                        dynamicGeneratorConfig
                    });

                    const dynamicIR = convertIrToDynamicSnippetsIr({
                        ir: irForDynamicSnippets,
                        disableExamples: true,
                        smartCasing: generatorInvocation.smartCasing,
                        generationLanguage: generatorInvocation.language,
                        generatorConfig: dynamicGeneratorConfig
                    });

                    // include metadata along with the dynamic IR
                    if (dynamicIR) {
                        languageSpecificIRs[generatorInvocation.language] = {
                            dynamicIR
                        };
                    } else {
                        context.logger.debug(`Failed to create dynamic IR for ${generatorInvocation.language}`);
                    }
                }
            }
        }
    }

    for (const [language, packageName] of Object.entries(snippetConfiguration)) {
        if (
            language &&
            packageName &&
            !Object.keys(languageSpecificIRs).includes(language) &&
            !skipLanguages.has(language)
        ) {
            context.logger.warn();
            context.logger.warn(
                `Failed to upload ${language} SDK snippets because of unknown package \`${packageName}\`.`
            );
            context.logger.warn(
                `Please make sure your ${workspace.workspaceName ? `${workspace.workspaceName}/` : ""}generators.yml has a generator that publishes a ${packageName} package.`
            );
            context.logger.warn();
        }
    }

    if (Object.keys(languageSpecificIRs).length > 0) {
        return languageSpecificIRs;
    }

    return undefined;
}

async function uploadDynamicIRs({
    dynamicIRs,
    dynamicIRUploadUrls,
    context,
    apiId
}: {
    dynamicIRs: Record<string, DynamicIr>;
    dynamicIRUploadUrls: Record<string, DynamicIRUpload>;
    context: TaskContext;
    apiId: string;
}) {
    if (Object.keys(dynamicIRUploadUrls).length > 0) {
        for (const [language, source] of Object.entries(dynamicIRUploadUrls)) {
            const dynamicIR = dynamicIRs[language]?.dynamicIR;

            if (dynamicIR) {
                const jsonBody = JSON.stringify(dynamicIR);
                const response = await fetch(source.uploadUrl, {
                    method: "PUT",
                    body: jsonBody,
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "Content-Length": Buffer.byteLength(jsonBody, "utf8").toString()
                    }
                });

                if (response.ok) {
                    context.logger.debug(`Uploaded dynamic IR for ${apiId}:${language}`);
                } else {
                    context.logger.warn(`Failed to upload dynamic IR for ${apiId}:${language}`);
                }
            } else {
                context.logger.warn(`Could not find matching dynamic IR to upload for ${apiId}:${language}`);
            }
        }
    }
}

async function updateAiChatFromDocsDefinition({
    docsDefinition,
    isPreview,
    context
}: {
    docsDefinition: DocsDefinition;
    isPreview: boolean;
    context: TaskContext;
}): Promise<void> {
    if (docsDefinition.config.aiChatConfig == null || isPreview) {
        return;
    }
    context.logger.warn(
        chalk.yellow("Enabling Ask Fern from docs.yml is deprecated. Please enable it from the Fern dashboard instead.")
    );
}

function getAIEnhancerConfig(withAiExamples: boolean, styleInstructions?: string): AIExampleEnhancerConfig | undefined {
    if (!withAiExamples) {
        return undefined;
    }

    return {
        enabled: true,
        model: process.env.FERN_AI_MODEL || "gpt-4o-mini",
        maxRetries: parseInt(process.env.FERN_AI_MAX_RETRIES || "3"),
        requestTimeoutMs: parseInt(process.env.FERN_AI_TIMEOUT_MS || "25000"),
        styleInstructions
    };
}

/**
 * Extracts detailed error information from an FDR SDK error response.
 * This helps debug network/fetch failures by providing structured error details
 * including status codes, error messages, and any underlying cause information.
 */
function extractErrorDetails(error: unknown): Record<string, unknown> {
    const errorObj = error as Record<string, unknown>;
    const content = errorObj?.content as Record<string, unknown> | undefined;

    return {
        errorType: errorObj?.error,
        statusCode: errorObj?.statusCode ?? content?.statusCode,
        reason: content?.reason,
        errorMessage: content?.errorMessage ?? content?.message,
        body: content?.body,
        // Include any underlying error/cause information
        cause: content?.cause,
        // Include the raw error for complete debugging if needed
        rawError: error
    };
}
