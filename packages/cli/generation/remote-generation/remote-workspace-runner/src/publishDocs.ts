import { FernToken } from "@fern-api/auth";
import { docsYml } from "@fern-api/configuration";
import { createFdrService } from "@fern-api/core";
import { MediaType } from "@fern-api/core-utils";
import { DocsDefinitionResolver, UploadedFile, wrapWithHttps } from "@fern-api/docs-resolver";
import { generateLanguageSpecificDynamicIRs } from "@fern-api/dynamic-snippets-utils";
import { APIV1Write, FdrAPI as CjsFdrSdk, DocsV1Write, DocsV2Write, FdrClient } from "@fern-api/fdr-sdk";

type DynamicIr = APIV1Write.DynamicIr;
type DynamicIrUpload = APIV1Write.DynamicIrUpload;
type SnippetsConfig = APIV1Write.SnippetsConfig;
type DocsDefinition = DocsV1Write.DocsDefinition;

import { AbsoluteFilePath, convertToFernHostRelativeFilePath, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { convertIrToFdrApi } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import axios from "axios";
import chalk from "chalk";
import { readFile } from "fs/promises";
import { chunk } from "lodash-es";
import * as mime from "mime-types";
import terminalLink from "terminal-link";
import { OSSWorkspace } from "../../../../workspace/lazy-fern-workspace/src";
import { getFaiClient } from "./getFaiClient";
import { measureImageSizes } from "./measureImageSizes";

const MEASURE_IMAGE_BATCH_SIZE = 10;
const UPLOAD_FILE_BATCH_SIZE = 10;

interface FileWithMimeType {
    mediaType: string;
    absoluteFilePath: AbsoluteFilePath;
    relativeFilePath: RelativeFilePath;
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
    targetAudiences?: string[];
}): Promise<void> {
    const fdr = createFdrService({ token: token.value });
    const authConfig: DocsV2Write.AuthConfig = isPrivate ? { type: "private", authType: "sso" } : { type: "public" };

    let docsRegistrationId: string | undefined;
    let urlToOutput = customDomains[0] ?? domain;
    const basePath = parseBasePath(domain);
    const useDynamicSnippets = docsWorkspace.config.experimental?.dynamicSnippets;
    const disableSnippetGen = preview || useDynamicSnippets;
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

            const images: DocsV2Write.ImageFilePath[] = [];

            [...measuredImages.values()].forEach((image) => {
                const filePath = filesMap.get(image.filePath);
                if (filePath == null) {
                    return;
                }
                const imageFilePath = {
                    filePath: DocsV1Write.FilePath(convertToFernHostRelativeFilePath(filePath.relativeFilePath)),
                    width: image.width,
                    height: image.height,
                    blurDataUrl: image.blurDataUrl,
                    alt: undefined,
                    fileHash: undefined
                };
                images.push(imageFilePath);
            });

            const filepaths = files
                .filter(({ absoluteFilePath }) => !measuredImages.has(absoluteFilePath))
                .map(({ relativeFilePath }) => convertToFernHostRelativeFilePath(relativeFilePath));

            if (preview) {
                const startDocsRegisterResponse = await fdr.docs.v2.write.startDocsPreviewRegister({
                    orgId: CjsFdrSdk.OrgId(organization),
                    authConfig: isPrivate ? { type: "private", authType: "sso" } : { type: "public" },
                    filepaths: filepaths.map((filePath) => DocsV1Write.FilePath(filePath)),
                    images,
                    basePath
                });
                if (startDocsRegisterResponse.ok) {
                    urlToOutput = startDocsRegisterResponse.body.previewUrl;
                    docsRegistrationId = startDocsRegisterResponse.body.docsRegistrationId;
                    if (skipUpload) {
                        context.logger.debug("Skip-upload mode: skipping file uploads for docs preview");
                    } else {
                        await uploadFiles(
                            startDocsRegisterResponse.body.uploadUrls,
                            docsWorkspace.absoluteFilePath,
                            context,
                            UPLOAD_FILE_BATCH_SIZE
                        );
                    }
                    return convertToFilePathPairs(
                        startDocsRegisterResponse.body.uploadUrls,
                        docsWorkspace.absoluteFilePath
                    );
                } else {
                    return await startDocsRegisterFailed(startDocsRegisterResponse.error, context);
                }
            } else {
                const startDocsRegisterResponse = await fdr.docs.v2.write.startDocsRegister({
                    domain,
                    customDomains,
                    authConfig,
                    apiId: CjsFdrSdk.ApiId(""),
                    orgId: CjsFdrSdk.OrgId(organization),
                    filepaths: filepaths.map((filePath) => DocsV1Write.FilePath(filePath)),
                    images
                });
                if (startDocsRegisterResponse.ok) {
                    docsRegistrationId = startDocsRegisterResponse.body.docsRegistrationId;
                    if (skipUpload) {
                        context.logger.debug("Skip-upload mode: skipping file uploads for docs");
                    } else {
                        await uploadFiles(
                            startDocsRegisterResponse.body.uploadUrls,
                            docsWorkspace.absoluteFilePath,
                            context,
                            UPLOAD_FILE_BATCH_SIZE
                        );
                    }
                    return convertToFilePathPairs(
                        startDocsRegisterResponse.body.uploadUrls,
                        docsWorkspace.absoluteFilePath
                    );
                } else {
                    return startDocsRegisterFailed(startDocsRegisterResponse.error, context);
                }
            }
        },
        registerApi: async ({ ir, snippetsConfig, playgroundConfig, apiName, workspace }) => {
            const apiDefinition = convertIrToFdrApi({ ir, snippetsConfig, playgroundConfig, context });

            // create dynamic IR + metadata for each generator language
            let dynamicIRsByLanguage: Record<string, DynamicIr> | undefined;
            if (useDynamicSnippets) {
                dynamicIRsByLanguage = await generateLanguageSpecificDynamicIRs({
                    workspace,
                    organization,
                    context,
                    snippetsConfig
                });
            }

            const response = await fdr.api.v1.register.registerApiDefinition({
                orgId: CjsFdrSdk.OrgId(organization),
                apiId: CjsFdrSdk.ApiId(ir.apiName.originalName),
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
                    default:
                        if (apiName != null) {
                            return context.failAndThrow(
                                `Failed to publish docs because API definition (${apiName}) could not be uploaded. Please contact support@buildwithfern.com\n ${JSON.stringify(response.error)}`
                            );
                        } else {
                            return context.failAndThrow(
                                `Failed to publish docs because API definition could not be uploaded. Please contact support@buildwithfern.com\n ${JSON.stringify(response.error)}`
                            );
                        }
                }
            }
        },
        targetAudiences
    });

    const docsDefinition = await resolver.resolve();

    if (docsRegistrationId == null) {
        return context.failAndThrow("Failed to publish docs.", "Docs registration ID is missing.");
    }

    context.logger.debug("Publishing docs...");
    const registerDocsResponse = await fdr.docs.v2.write.finishDocsRegister(
        DocsV1Write.DocsRegistrationId(docsRegistrationId),
        {
            docsDefinition,
            excludeApis: false
        }
    );

    if (registerDocsResponse.ok) {
        const url = wrapWithHttps(urlToOutput);
        await updateAiChatFromDocsDefinition({
            docsDefinition,
            organization,
            token,
            url: url.replace("https://", ""),
            context,
            fdr,
            isPreview: preview,
            domain,
            customDomains
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
    context: TaskContext
): Promise<never> {
    await context.instrumentPostHogEvent({
        command: "docs-generation",
        properties: {
            error: JSON.stringify(error)
        }
    });
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
            return context.failAndThrow("Please make sure that your FERN_TOKEN is set.");
        case "UserNotInOrgError":
            return context.failAndThrow(
                "Please verify if you have access to the organization you are trying to publish the docs to. If you are not a member of the organization, please reach out to the organization owner."
            );
        case "UnavailableError":
            return context.failAndThrow(
                "Failed to publish docs. Please try again later or reach out to Fern support at support@buildwithfern.com."
            );
        default:
            return context.failAndThrow("Failed to publish docs.", error);
    }
}

function parseBasePath(domain: string): string | undefined {
    try {
        return new URL(wrapWithHttps(domain)).pathname;
    } catch (e) {
        return undefined;
    }
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
                const response = await fetch(source.uploadUrl, {
                    method: "PUT",
                    body: JSON.stringify(dynamicIR),
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "Content-Length": JSON.stringify(dynamicIR).length.toString()
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
    organization,
    token,
    url,
    context,
    fdr,
    isPreview,
    domain,
    customDomains
}: {
    docsDefinition: DocsDefinition;
    organization: string;
    token: FernToken;
    url: string;
    context: TaskContext;
    fdr: FdrClient;
    isPreview: boolean;
    domain: string;
    customDomains: string[];
}): Promise<void> {
    if (docsDefinition.config.aiChatConfig == null) {
        return;
    }
    context.logger.debug("Processing AI Chat configuration from docs.yml");

    if (docsDefinition.config.aiChatConfig.location != null) {
        const faiClient = getFaiClient({ token: token.value });

        const domainsToEnable = isPreview
            ? [wrapWithHttps(url).replace("https://", "")]
            : [
                  wrapWithHttps(domain).replace("https://", ""),
                  ...customDomains.map((cd) => wrapWithHttps(cd).replace("https://", ""))
              ];

        context.logger.debug(
            `Enabling Ask AI for domain${domainsToEnable.length > 1 ? "s" : ""}: ${domainsToEnable.join(", ")}`
        );

        if (docsDefinition.config.aiChatConfig.location.includes("docs")) {
            for (const domainToEnable of domainsToEnable) {
                const domainHostname = new URL(wrapWithHttps(domainToEnable)).hostname;
                context.logger.debug(`Adding domain ${domainHostname} to Algolia whitelist`);
                const addResult = await fdr.docs.v2.write.addAlgoliaPreviewWhitelistEntry({
                    domain: domainHostname
                });
                if (!addResult.ok) {
                    context.logger.warn(
                        `Failed to add domain ${domainHostname} to Algolia whitelist${isPreview ? ". Please try regenerating to test AI chat in preview." : "."}`
                    );
                }
            }
        }

        const indexingResult = await faiClient.settings.enableAskAi({
            domains: domainsToEnable,
            org_name: organization,
            locations: docsDefinition.config.aiChatConfig.location,
            preview: isPreview
        });

        if (indexingResult.success) {
            context.logger.info(
                chalk.green(
                    `${isPreview ? "" : `Ask Fern enabled for ${domainsToEnable.join(", ")}. `}\nNote: it may take a few minutes after publishing for Ask Fern settings to reflect expected state.`
                )
            );
        }
    }
}
