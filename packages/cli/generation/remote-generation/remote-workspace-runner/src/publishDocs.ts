import { FernToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { docsYml, generatorsYml } from "@fern-api/configuration";
import { createFdrService } from "@fern-api/core";
import { MediaType, replaceEnvVariables } from "@fern-api/core-utils";
import { DocsDefinitionResolver, PythonDocsSectionContext, UploadedFile, wrapWithHttps } from "@fern-api/docs-resolver";
import { APIV1Write, FdrAPI as CjsFdrSdk, DocsV1Write, DocsV2Write, FdrClient, FernNavigation } from "@fern-api/fdr-sdk";

type DynamicIr = APIV1Write.DynamicIr;
type DynamicIrUpload = APIV1Write.DynamicIrUpload;
type SnippetsConfig = APIV1Write.SnippetsConfig;
type DocsDefinition = DocsV1Write.DocsDefinition;

import { AbsoluteFilePath, convertToFernHostRelativeFilePath, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { convertIrToDynamicSnippetsIr, generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { AIExampleEnhancerConfig, convertIrToFdrApi, enhanceExamplesWithAI } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import axios from "axios";
import chalk from "chalk";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { chunk } from "lodash-es";
import * as mime from "mime-types";
import terminalLink from "terminal-link";
import { OSSWorkspace } from "../../../../workspace/lazy-fern-workspace/src";
import { getDynamicGeneratorConfig } from "./getDynamicGeneratorConfig";
import { measureImageSizes } from "./measureImageSizes";
import { asyncPool } from "./utils/asyncPool";

const MEASURE_IMAGE_BATCH_SIZE = 10;
const UPLOAD_FILE_BATCH_SIZE = 10;
const HASH_CONCURRENCY = parseInt(process.env.FERN_DOCS_ASSET_HASH_CONCURRENCY ?? "32", 10);

interface FileWithMimeType {
    mediaType: string;
    absoluteFilePath: AbsoluteFilePath;
    relativeFilePath: RelativeFilePath;
}

export async function calculateFileHash(absoluteFilePath: AbsoluteFilePath | string): Promise<string> {
    const fileBuffer = await readFile(absoluteFilePath);
    return createHash("sha256").update(new Uint8Array(fileBuffer)).digest("hex");
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
    editThisPage,
    isPrivate = false,
    disableTemplates = false,
    skipUpload = false,
    withAiExamples = true,
    excludeApis = false,
    targetAudiences
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
    editThisPage: docsYml.RawSchemas.FernDocsConfig.EditThisPageConfig | undefined;
    isPrivate: boolean | undefined;
    disableTemplates: boolean | undefined;
    skipUpload: boolean | undefined;
    withAiExamples?: boolean;
    excludeApis?: boolean;
    targetAudiences?: string[];
}): Promise<void> {
    const fdr = createFdrService({ token: token.value });
    const authConfig: DocsV2Write.AuthConfig = isPrivate ? { type: "private", authType: "sso" } : { type: "public" };

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

    const resolver = new DocsDefinitionResolver({
        domain,
        docsWorkspace,
        ossWorkspaces,
        apiWorkspaces,
        taskContext: context,
        editThisPage,
        uploadFiles: async (files) => {
            const filesMap = new Map(files.map((file) => [file.absoluteFilePath, file]));
            const filesWithMimeType: FileWithMimeType[] = files
                .map((fileMetadata) => ({
                    ...fileMetadata,
                    mediaType: mime.lookup(fileMetadata.absoluteFilePath)
                }))
                .filter((fileMetadata): fileMetadata is FileWithMimeType => fileMetadata.mediaType !== false);

            const imagesToMeasure = filesWithMimeType
                .filter((file) => MediaType.parse(file.mediaType)?.isImage() ?? false)
                .map((file) => file.absoluteFilePath);

            const measuredImages = await measureImageSizes(imagesToMeasure, MEASURE_IMAGE_BATCH_SIZE, context);

            context.logger.debug(`Hashing ${measuredImages.size} image files with concurrency ${HASH_CONCURRENCY}...`);
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

                    const obj = {
                        filePath: CjsFdrSdk.docs.v1.write.FilePath(
                            convertToFernHostRelativeFilePath(filePath.relativeFilePath)
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

            const nonImageFiles = files.filter(({ absoluteFilePath }) => !measuredImages.has(absoluteFilePath));

            context.logger.debug(
                `Hashing ${nonImageFiles.length} non-image files with concurrency ${HASH_CONCURRENCY}...`
            );
            const hashNonImageStart = performance.now();
            const filepaths: CjsFdrSdk.docs.v2.write.FilePathInput[] = await asyncPool(
                HASH_CONCURRENCY,
                nonImageFiles,
                async (file) => ({
                    path: CjsFdrSdk.docs.v1.write.FilePath(convertToFernHostRelativeFilePath(file.relativeFilePath)),
                    fileHash: await calculateFileHash(file.absoluteFilePath)
                })
            );
            const hashNonImageTime = performance.now() - hashNonImageStart;
            context.logger.debug(`Hashed ${filepaths.length} non-image files in ${hashNonImageTime.toFixed(0)}ms`);

            if (preview) {
                const startDocsRegisterResponse = await fdr.docs.v2.write.startDocsPreviewRegister({
                    orgId: CjsFdrSdk.OrgId(organization),
                    authConfig: isPrivate ? { type: "private", authType: "sso" } : { type: "public" },
                    filepaths: filepaths,
                    images,
                    basePath
                });
                if (startDocsRegisterResponse.ok) {
                    urlToOutput = startDocsRegisterResponse.body.previewUrl;
                    docsRegistrationId = startDocsRegisterResponse.body.docsRegistrationId;
                    context.logger.debug(`Received preview registration ID: ${docsRegistrationId}`);

                    if (skipUpload) {
                        context.logger.debug("Skip-upload mode: skipping file uploads for docs preview");
                    } else {
                        const skippedSet = new Set(startDocsRegisterResponse.body.skippedFiles || []);
                        const urlsToUpload = Object.fromEntries(
                            Object.entries(startDocsRegisterResponse.body.uploadUrls).filter(
                                ([filepath]) => !skippedSet.has(filepath as CjsFdrSdk.docs.v1.write.FilePath)
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
                                UPLOAD_FILE_BATCH_SIZE
                            );
                        } else {
                            context.logger.debug(`No files to upload (all ${skippedCount} up to date)`);
                        }
                    }
                    return convertToFilePathPairs(
                        startDocsRegisterResponse.body.uploadUrls,
                        docsWorkspace.absoluteFilePath
                    );
                } else {
                    return await startDocsRegisterFailed(startDocsRegisterResponse.error, context, organization);
                }
            } else {
                const startDocsRegisterResponse = await fdr.docs.v2.write.startDocsRegister({
                    domain,
                    customDomains,
                    authConfig,
                    apiId: CjsFdrSdk.ApiId(""),
                    orgId: CjsFdrSdk.OrgId(organization),
                    filepaths: filepaths,
                    images
                });
                if (startDocsRegisterResponse.ok) {
                    docsRegistrationId = startDocsRegisterResponse.body.docsRegistrationId;
                    context.logger.debug(`Received production registration ID: ${docsRegistrationId}`);

                    const skippedCount = startDocsRegisterResponse.body.skippedFiles?.length || 0;
                    if (skippedCount > 0) {
                        context.logger.info(
                            `Skipped ${skippedCount} unchanged file${skippedCount === 1 ? "" : "s"} (already uploaded)`
                        );
                    }

                    if (skipUpload) {
                        context.logger.debug("Skip-upload mode: skipping file uploads for docs");
                    } else {
                        const skippedSet = new Set(startDocsRegisterResponse.body.skippedFiles || []);
                        const urlsToUpload = Object.fromEntries(
                            Object.entries(startDocsRegisterResponse.body.uploadUrls).filter(
                                ([filepath]) => !skippedSet.has(filepath as CjsFdrSdk.docs.v1.write.FilePath)
                            )
                        );

                        const uploadCount = Object.keys(urlsToUpload).length;

                        if (uploadCount > 0) {
                            context.logger.info(`↑ Uploading ${uploadCount} files...`);
                            await uploadFiles(
                                urlsToUpload,
                                docsWorkspace.absoluteFilePath,
                                context,
                                UPLOAD_FILE_BATCH_SIZE
                            );
                        } else {
                            context.logger.info("No files to upload (all up to date)");
                        }
                    }
                    return convertToFilePathPairs(
                        startDocsRegisterResponse.body.uploadUrls,
                        docsWorkspace.absoluteFilePath
                    );
                } else {
                    return startDocsRegisterFailed(startDocsRegisterResponse.error, context, organization);
                }
            }
        },
        registerApi: async ({ ir, snippetsConfig, playgroundConfig, apiName, workspace }) => {
            // Use apiName from docs.yml (folder name) as the API identifier for FDR
            // This ensures users can reference APIs by their folder name in docs components
            let apiDefinition = convertIrToFdrApi({
                ir,
                snippetsConfig,
                playgroundConfig,
                context,
                apiNameOverride: apiName
            });

            const aiEnhancerConfig = getAIEnhancerConfig(
                withAiExamples,
                docsWorkspace.config.aiExamples?.style ?? docsWorkspace.config.experimental?.aiExampleStyleInstructions
            );
            if (aiEnhancerConfig && workspace) {
                const sources = workspace.getSources();
                const openApiSource = sources.find((source) => source.type === "openapi");
                const sourceFilePath = openApiSource?.absoluteFilePath;

                apiDefinition = await enhanceExamplesWithAI(
                    apiDefinition,
                    aiEnhancerConfig,
                    context,
                    token,
                    organization,
                    sourceFilePath
                );
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

            const response = await fdr.api.v1.register.registerApiDefinition({
                orgId: CjsFdrSdk.OrgId(organization),
                apiId: CjsFdrSdk.ApiId(apiName ?? ir.apiName.originalName),
                definition: apiDefinition,
                definitionV2: undefined,
                dynamicIRs: dynamicIRsByLanguage
            });

            if (response.ok) {
                context.logger.debug(`Registered API Definition ${apiName}: ${response.body.apiDefinitionId}`);

                if (response.body.dynamicIRs && dynamicIRsByLanguage) {
                    if (skipUpload) {
                        context.logger.debug("Skip-upload mode: skipping dynamic IR uploads");
                    } else {
                        await uploadDynamicIRs({
                            dynamicIRs: dynamicIRsByLanguage,
                            dynamicIRUploadUrls: response.body.dynamicIRs,
                            context,
                            apiId: response.body.apiDefinitionId
                        });
                    }
                }

                return response.body.apiDefinitionId;
            } else {
                switch (response.error.error) {
                    case "UnauthorizedError":
                    case "UserNotInOrgError": {
                        return context.failAndThrow(
                            "You do not have permissions to register the docs. Reach out to support@buildwithfern.com"
                        );
                    }
                    default: {
                        const errorDetails = extractErrorDetails(response.error);
                        context.logger.error(
                            `FDR registerApiDefinition failed. Error details:\n${JSON.stringify(errorDetails, undefined, 2)}`
                        );
                        if (apiName != null) {
                            return context.failAndThrow(
                                `Failed to publish docs because API definition (${apiName}) could not be uploaded. Please contact support@buildwithfern.com`,
                                errorDetails
                            );
                        } else {
                            return context.failAndThrow(
                                `Failed to publish docs because API definition could not be uploaded. Please contact support@buildwithfern.com`,
                                errorDetails
                            );
                        }
                    }
                }
            }
        },
        targetAudiences,
        pythonDocsSectionHandler: (
            item: docsYml.DocsNavigationItem.PythonDocsSection,
            parentSlug: FernNavigation.V1.SlugGenerator,
            ctx: PythonDocsSectionContext
        ): FernNavigation.V1.SectionNode | null => {
            const title = item.title ?? "Library Reference";
            const urlSlug = item.slug ?? "library-docs";
            const slug = parentSlug.apply({ urlSlug });

            return {
                id: ctx.generateId(`__libdocs_placeholder_${urlSlug}__`),
                type: "section",
                overviewPageId: undefined,
                slug: slug.get(),
                title,
                icon: undefined,
                collapsed: undefined,
                hidden: false,
                viewers: undefined,
                orphaned: undefined,
                children: [],
                authed: undefined,
                pointsTo: undefined,
                noindex: undefined,
                featureFlags: undefined,
                availability: undefined
            };
        }
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
            { onError: (e) => context.failAndThrow(e) },
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
        return context.failAndThrow("Failed to publish docs.", "Docs registration ID is missing.");
    }

    // Handle Python docs generation if configured
    let libraryDocsConfig: DocsV2Write.LibraryDocsRegistrationConfig | undefined;
    const pythonDocsSection = await extractPythonDocsSectionFromConfig(
        docsWorkspace.config,
        docsWorkspace.absoluteFilePath
    );
    if (pythonDocsSection != null) {
        // Config is already deserialized with camelCase properties
        const githubUrl = pythonDocsSection.pythonDocs;

        context.logger.info(`Generating Python documentation from ${githubUrl}...`);

        // Start Python docs generation
        const startResponse = await fdr.docs.v2.write.startLibraryDocsGeneration({
            orgId: CjsFdrSdk.OrgId(organization),
            githubUrl: CjsFdrSdk.Url(githubUrl),
            language: "PYTHON",
            config: {
                branch: undefined,
                packagePath: undefined,
                title: pythonDocsSection.title,
                slug: pythonDocsSection.slug
            }
        });

        if (!startResponse.ok) {
            return context.failAndThrow(`Failed to start Python docs generation for ${githubUrl}`, startResponse.error);
        }

        const jobId = startResponse.body.jobId;
        context.logger.debug(`Python docs generation started with jobId: ${jobId}`);

        // Poll for completion
        const POLL_INTERVAL_MS = 3000;
        const MAX_POLL_ATTEMPTS = 100; // ~5 minutes
        let pollAttempts = 0;

        while (pollAttempts < MAX_POLL_ATTEMPTS) {
            const statusResponse = await fdr.docs.v2.write.getLibraryDocsGenerationStatus(jobId);

            if (!statusResponse.ok) {
                return context.failAndThrow(`Failed to check Python docs generation status`, statusResponse.error);
            }

            const status = statusResponse.body.status;
            context.logger.debug(`Python docs generation status: ${status}`);

            if (status === "COMPLETED") {
                context.logger.info("Python documentation generation completed.");
                libraryDocsConfig = {
                    jobId,
                    slug: pythonDocsSection.slug,
                    title: pythonDocsSection.title
                };
                break;
            } else if (status === "FAILED") {
                const errorMsg = statusResponse.body.error?.message ?? "Unknown error";
                return context.failAndThrow(`Python docs generation failed: ${errorMsg}`);
            }

            // Wait before next poll
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
            pollAttempts++;
        }

        if (pollAttempts >= MAX_POLL_ATTEMPTS) {
            return context.failAndThrow("Python docs generation timed out");
        }
    }

    context.logger.info("Publishing docs to FDR...");
    const publishStart = performance.now();
    const registerDocsResponse = await fdr.docs.v2.write.finishDocsRegister(
        DocsV1Write.DocsRegistrationId(docsRegistrationId),
        {
            docsDefinition,
            excludeApis,
            libraryDocs: libraryDocsConfig
        }
    );

    if (registerDocsResponse.ok) {
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
    } else {
        switch (registerDocsResponse.error.error) {
            case "UnauthorizedError":
            case "UserNotInOrgError":
                return context.failAndThrow("Insufficient permissions. Failed to publish docs to " + domain);
            case "DocsRegistrationIdNotFound":
                return context.failAndThrow(
                    "Failed to publish docs to " + domain,
                    `Docs registration ID ${docsRegistrationId} does not exist.`
                );
            case "LibraryDocsJobInvalidForRegistrationError":
                return context.failAndThrow(
                    "Failed to publish docs to " + domain,
                    "Library docs job is invalid for registration. The job may not exist, may not be completed, or may belong to a different organization."
                );
            default:
                return context.failAndThrow("Failed to publish docs to " + domain, registerDocsResponse.error);
        }
    }
}

async function uploadFiles(
    filesToUpload: Record<string, DocsV1Write.FileS3UploadUrl>,
    docsWorkspacePath: AbsoluteFilePath,
    context: TaskContext,
    batchSize: number
): Promise<void> {
    const startTime = Date.now();
    const totalFiles = Object.keys(filesToUpload).length;
    context.logger.debug(`Start uploading ${totalFiles} files...`);
    const chunkedFilepathsToUpload = chunk(Object.entries(filesToUpload), batchSize);
    let filesUploaded = 0;
    for (const chunkedFilepaths of chunkedFilepathsToUpload) {
        await Promise.all(
            chunkedFilepaths.map(async ([key, { uploadUrl }]) => {
                const relativeFilePath = RelativeFilePath.of(key);
                const absoluteFilePath = resolve(docsWorkspacePath, relativeFilePath);
                try {
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
                    context.failAndThrow(`Failed to upload ${absoluteFilePath}`, e);
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
    uploadUrls: Record<string, DocsV1Write.FileS3UploadUrl>,
    docsWorkspacePath: AbsoluteFilePath
): UploadedFile[] {
    const toRet: UploadedFile[] = [];
    for (const [key, value] of Object.entries(uploadUrls)) {
        const relativeFilePath = RelativeFilePath.of(key);
        const absoluteFilePath = resolve(docsWorkspacePath, relativeFilePath);
        toRet.push({
            relativeFilePath,
            absoluteFilePath,
            fileId: value.fileId
        });
    }
    return toRet;
}

async function startDocsRegisterFailed(
    error: DocsV2Write.startDocsPreviewRegister.Error | DocsV2Write.startDocsRegister.Error,
    context: TaskContext,
    organization: string
): Promise<never> {
    await context.instrumentPostHogEvent({
        command: "docs-generation",
        properties: {
            error: JSON.stringify(error)
        }
    });

    const authErrorMessage = getAuthenticationErrorMessage(error, organization);
    if (authErrorMessage != null) {
        return context.failAndThrow(authErrorMessage);
    }

    switch (error.error) {
        case "InvalidCustomDomainError":
            return context.failAndThrow(
                `Your docs domain should end with ${process.env.DOCS_DOMAIN_SUFFIX ?? "docs.buildwithfern.com"}`
            );
        case "InvalidDomainError":
            return context.failAndThrow(
                "Please make sure that none of your custom domains are not overlapping (i.e. one is a substring of another)"
            );
        case "UnauthorizedError":
            return context.failAndThrow(
                `You do not have permission to publish docs to organization '${organization}'. Please run 'fern login' to ensure you are logged in with the correct account.\n\n` +
                    "Please ensure you have membership at https://dashboard.buildwithfern.com, and ask a team member for an invite if not."
            );
        case "UserNotInOrgError":
            return context.failAndThrow(
                `You do not belong to organization '${organization}'. Please run 'fern login' to ensure you are logged in with the correct account.\n\n` +
                    "Please ensure you have membership at https://dashboard.buildwithfern.com, and ask a team member for an invite if not."
            );
        case "UnavailableError":
            return context.failAndThrow(
                "Failed to publish docs. Please try again later or reach out to Fern support at support@buildwithfern.com."
            );
        default:
            return context.failAndThrow("Failed to publish docs.", error);
    }
}

function getAuthenticationErrorMessage(error: unknown, organization: string): string | undefined {
    const errorObj = error as Record<string, unknown>;
    const content = errorObj?.content as Record<string, unknown> | undefined;

    if (content?.reason === "status-code") {
        const statusCode = content.statusCode as number | undefined;

        if (statusCode === 401 || statusCode === 403) {
            const baseMessage = `You do not have permission to publish docs to organization '${organization}'. Please run 'fern login' to ensure you are logged in with the correct account.`;
            const contactMessage =
                "Please ensure you have membership at https://dashboard.buildwithfern.com, and ask a team member for an invite if not.";

            return `${baseMessage}\n\n${contactMessage}`;
        }
    }

    return undefined;
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
        const response = await fdr.api.v1.register.checkSdkDynamicIrExists({
            orgId: CjsFdrSdk.OrgId(organization),
            snippetConfiguration: snippetConfigWithVersions
        });

        if (!response.ok || !response.body) {
            context.logger.debug(`[SDK Dynamic IR] API call failed or returned empty body`);
            return undefined;
        }

        const existingDynamicIrs = response.body.existingDynamicIrs;

        if (Object.keys(existingDynamicIrs).length === 0) {
            context.logger.debug("[SDK Dynamic IR] No existing SDK dynamic IRs found in S3");
            return undefined;
        }

        const result: Record<string, DynamicIr> = {};
        for (const [language, sdkDynamicIrDownload] of Object.entries(existingDynamicIrs)) {
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
            snippetName: snippetsConfig.typescriptSdk?.package,
            explicitVersion: snippetsConfig.typescriptSdk?.version
        },
        {
            language: "python",
            snippetName: snippetsConfig.pythonSdk?.package,
            explicitVersion: snippetsConfig.pythonSdk?.version
        },
        {
            language: "java",
            snippetName: snippetsConfig.javaSdk?.coordinate,
            explicitVersion: snippetsConfig.javaSdk?.version
        },
        {
            language: "go",
            // Normalize to match S3 upload key format (github.com/owner/repo vs https://github.com/owner/repo)
            snippetName:
                snippetsConfig.goSdk?.githubRepo && normalizeGoPackageForLookup(snippetsConfig.goSdk?.githubRepo),
            explicitVersion: snippetsConfig.goSdk?.version
        },
        {
            language: "csharp",
            snippetName: snippetsConfig.csharpSdk?.package,
            explicitVersion: snippetsConfig.csharpSdk?.version
        },
        {
            language: "ruby",
            snippetName: snippetsConfig.rubySdk?.gem,
            explicitVersion: snippetsConfig.rubySdk?.version
        },
        {
            language: "php",
            snippetName: snippetsConfig.phpSdk?.package,
            explicitVersion: snippetsConfig.phpSdk?.version
        },
        {
            language: "swift",
            snippetName: snippetsConfig.swiftSdk?.package,
            explicitVersion: snippetsConfig.swiftSdk?.version
        },
        {
            language: "rust",
            snippetName: snippetsConfig.rustSdk?.package,
            explicitVersion: snippetsConfig.rustSdk?.version
        }
    ];

    for (const config of snippetConfigs) {
        if (!config.snippetName) {
            continue;
        }

        let version: string | undefined = config.explicitVersion;
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
        const response = await fdr.sdks.versions.computeSemanticVersion({
            githubRepository,
            language: fdrLanguage,
            package: generatorPackage
        });

        if (!response.ok) {
            context.logger.debug(
                `[SDK Dynamic IR] ${language}: version computation failed for package "${generatorPackage}"`
            );
            return undefined;
        }
        context.logger.debug(
            `[SDK Dynamic IR] ${language}: computed version ${response.body.version} for package "${generatorPackage}"`
        );
        return { version: response.body.version, generatorPackage };
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
    dynamicIRUploadUrls: Record<string, DynamicIrUpload>;
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

/**
 * Extracts the first library section configuration from the docs config navigation.
 * Only supports Python libraries for now.
 * Searches through top-level navigation, tabbed navigation, versioned navigation,
 * and product-based navigation (including product files and version files).
 */
async function extractPythonDocsSectionFromConfig(
    config: docsYml.RawSchemas.DocsConfiguration,
    absolutePathToFernFolder: AbsoluteFilePath
): Promise<docsYml.RawSchemas.PythonDocsConfiguration | undefined> {
    // Helper to check if an item is a Python docs config
    // The config may have "pythonDocs" (camelCase, deserialized) or "python-docs" (kebab-case, raw YAML)
    const isPythonDocsConfig = (item: unknown): boolean => {
        if (item == null || typeof item !== "object") {
            return false;
        }
        const obj = item as Record<string, unknown>;
        // Check for deserialized format (pythonDocs) or raw YAML format (python-docs)
        return typeof obj.pythonDocs === "string" || typeof obj["python-docs"] === "string";
    };

    // Helper to normalize python-docs config to the expected format
    const normalizePythonDocsConfig = (item: unknown): docsYml.RawSchemas.PythonDocsConfiguration | undefined => {
        if (item == null || typeof item !== "object") {
            return undefined;
        }
        const obj = item as Record<string, unknown>;
        // If it has pythonDocs (deserialized format), return as-is
        if (typeof obj.pythonDocs === "string") {
            return item as docsYml.RawSchemas.PythonDocsConfiguration;
        }
        // If it has python-docs (raw YAML format), convert to deserialized format
        if (typeof obj["python-docs"] === "string") {
            return {
                pythonDocs: obj["python-docs"],
                title: typeof obj.title === "string" ? obj.title : undefined,
                slug: typeof obj.slug === "string" ? obj.slug : undefined
            } as docsYml.RawSchemas.PythonDocsConfiguration;
        }
        return undefined;
    };

    // Helper to recursively search navigation items
    const findPythonDocsSectionInItems = (
        items: unknown[] | undefined
    ): docsYml.RawSchemas.PythonDocsConfiguration | undefined => {
        if (items == null) {
            return undefined;
        }
        for (const item of items) {
            if (isPythonDocsConfig(item)) {
                return normalizePythonDocsConfig(item);
            }
            // Check in section contents
            if (item != null && typeof item === "object" && "section" in item) {
                const sectionItem = item as { contents?: unknown[] };
                if (sectionItem.contents) {
                    const found = findPythonDocsSectionInItems(sectionItem.contents);
                    if (found) {
                        return found;
                    }
                }
            }
            // Check in tabbed navigation items (items with tab and layout properties)
            if (item != null && typeof item === "object" && "tab" in item && "layout" in item) {
                const tabbedItem = item as { layout?: unknown[] };
                if (tabbedItem.layout) {
                    const found = findPythonDocsSectionInItems(tabbedItem.layout);
                    if (found) {
                        return found;
                    }
                }
            }
        }
        return undefined;
    };

    // Helper to search in a navigation config (handles arrays, tabbed, and versioned)
    const findInNavigationConfig = (navigation: unknown): docsYml.RawSchemas.PythonDocsConfiguration | undefined => {
        if (navigation == null) {
            return undefined;
        }

        // Check if it's an array (simple navigation)
        if (Array.isArray(navigation)) {
            return findPythonDocsSectionInItems(navigation);
        }

        // Check if it's an object with tabs
        if (navigation != null && typeof navigation === "object") {
            const navObj = navigation as Record<string, unknown>;

            // Tabbed navigation - check each tab's layout
            if (Array.isArray(navObj.tabs)) {
                for (const tab of navObj.tabs) {
                    if (tab != null && typeof tab === "object") {
                        const tabObj = tab as Record<string, unknown>;
                        if (Array.isArray(tabObj.layout)) {
                            const found = findPythonDocsSectionInItems(tabObj.layout);
                            if (found) {
                                return found;
                            }
                        }
                    }
                }
            }
        }

        return undefined;
    };

    // Helper to load and search a version file
    const searchVersionFile = async (
        versionPath: string
    ): Promise<docsYml.RawSchemas.PythonDocsConfiguration | undefined> => {
        try {
            const absoluteFilepathToVersionFile = resolve(absolutePathToFernFolder, RelativeFilePath.of(versionPath));
            const content = yaml.load((await readFile(absoluteFilepathToVersionFile)).toString());
            if (content != null && typeof content === "object") {
                const versionContent = content as Record<string, unknown>;
                return findInNavigationConfig(versionContent.navigation);
            }
        } catch {
            // If we can't read the file, skip it
        }
        return undefined;
    };

    // Helper to load and search a product file
    const searchProductFile = async (
        productPath: string,
        productVersions?: docsYml.RawSchemas.VersionConfig[]
    ): Promise<docsYml.RawSchemas.PythonDocsConfiguration | undefined> => {
        try {
            const absoluteFilepathToProductFile = resolve(absolutePathToFernFolder, RelativeFilePath.of(productPath));
            const content = yaml.load((await readFile(absoluteFilepathToProductFile)).toString());

            if (content != null && typeof content === "object") {
                const productContent = content as Record<string, unknown>;

                // First check the product file's own navigation
                const found = findInNavigationConfig(productContent.navigation);
                if (found) {
                    return found;
                }
            }

            // If the product has versions, search each version file
            if (productVersions != null && productVersions.length > 0) {
                for (const version of productVersions) {
                    const found = await searchVersionFile(version.path);
                    if (found) {
                        return found;
                    }
                }
            }
        } catch {
            // If we can't read the file, skip it
        }
        return undefined;
    };

    // First, check top-level navigation
    if (config.navigation != null) {
        const found = findInNavigationConfig(config.navigation);
        if (found) {
            return found;
        }
    }

    // Check top-level versions (versioned navigation at root level)
    if (config.versions != null && config.versions.length > 0) {
        for (const version of config.versions) {
            const found = await searchVersionFile(version.path);
            if (found) {
                return found;
            }
        }
    }

    // Check products (product-based navigation)
    if (config.products != null && config.products.length > 0) {
        for (const product of config.products) {
            // Only internal products have a path to a product file
            if ("path" in product && product.path != null) {
                const found = await searchProductFile(product.path, product.versions);
                if (found) {
                    return found;
                }
            }
        }
    }

    return undefined;
}
