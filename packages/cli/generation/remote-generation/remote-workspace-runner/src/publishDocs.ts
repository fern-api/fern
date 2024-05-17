import { FernToken } from "@fern-api/auth";
import { docsYml } from "@fern-api/configuration";
import { createFdrService } from "@fern-api/core";
import { isNonNullish, MediaType } from "@fern-api/core-utils";
import { DocsDefinitionResolver, UploadedFile, wrapWithHttps } from "@fern-api/docs-resolver";
import { DocsV1Write, DocsV2Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { convertIrToFdrApi } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import axios from "axios";
import chalk from "chalk";
import { readFile } from "fs/promises";
import { imageSize } from "image-size";
import { chunk } from "lodash-es";
import * as mime from "mime-types";
import terminalLink from "terminal-link";
import { promisify } from "util";

const MEASURE_IMAGE_BATCH_SIZE = 10;
const UPLOAD_FILE_BATCH_SIZE = 10;

interface AbsoluteImageFilePath {
    filePath: AbsoluteFilePath;
    width: number;
    height: number;
    blurDataUrl: string | undefined;
}

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
    fernWorkspaces,
    context,
    preview,
    editThisPage,
    isPrivate = false
}: {
    token: FernToken;
    organization: string;
    docsWorkspace: DocsWorkspace;
    domain: string;
    customDomains: string[];
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    preview: boolean;
    // TODO: implement audience support in generateIR
    audiences: docsYml.RawSchemas.FernDocsConfig.AudiencesConfig | undefined;
    editThisPage: docsYml.RawSchemas.FernDocsConfig.EditThisPageConfig | undefined;
    isPrivate: boolean | undefined;
}): Promise<void> {
    const fdr = createFdrService({ token: token.value });
    const authConfig: DocsV2Write.AuthConfig = isPrivate ? { type: "private", authType: "sso" } : { type: "public" };

    let docsRegistrationId: string | undefined;
    let urlToOutput = customDomains[0] ?? domain;
    const resolver = new DocsDefinitionResolver(
        domain,
        docsWorkspace,
        fernWorkspaces,
        context,
        editThisPage,
        async (files) => {
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
                    filePath: filePath.relativeFilePath,
                    width: image.width,
                    height: image.height,
                    blurDataUrl: image.blurDataUrl
                };
                images.push(imageFilePath);
            });

            const filepaths = files
                .filter(({ absoluteFilePath }) => !measuredImages.has(absoluteFilePath))
                .map(({ relativeFilePath }) => relativeFilePath);

            if (preview) {
                const startDocsRegisterResponse = await fdr.docs.v2.write.startDocsPreviewRegister({
                    orgId: organization,
                    authConfig: isPrivate ? { type: "private", authType: "sso" } : { type: "public" },
                    filepaths,
                    images
                });
                if (startDocsRegisterResponse.ok) {
                    urlToOutput = startDocsRegisterResponse.body.previewUrl;
                    docsRegistrationId = startDocsRegisterResponse.body.docsRegistrationId;
                    await uploadFiles(
                        startDocsRegisterResponse.body.uploadUrls,
                        docsWorkspace.absoluteFilepath,
                        context,
                        UPLOAD_FILE_BATCH_SIZE
                    );
                    return convertToFilePathPairs(
                        startDocsRegisterResponse.body.uploadUrls,
                        docsWorkspace.absoluteFilepath
                    );
                } else {
                    return startDocsRegisterFailed(startDocsRegisterResponse.error, context);
                }
            } else {
                const startDocsRegisterResponse = await fdr.docs.v2.write.startDocsRegister({
                    domain,
                    customDomains,
                    authConfig,
                    apiId: "",
                    orgId: organization,
                    filepaths,
                    images
                });
                if (startDocsRegisterResponse.ok) {
                    docsRegistrationId = startDocsRegisterResponse.body.docsRegistrationId;
                    await uploadFiles(
                        startDocsRegisterResponse.body.uploadUrls,
                        docsWorkspace.absoluteFilepath,
                        context,
                        UPLOAD_FILE_BATCH_SIZE
                    );
                    return convertToFilePathPairs(
                        startDocsRegisterResponse.body.uploadUrls,
                        docsWorkspace.absoluteFilepath
                    );
                } else {
                    return startDocsRegisterFailed(startDocsRegisterResponse.error, context);
                }
            }
        },
        async ({ ir, snippetsConfig }) => {
            const apiDefinition = convertIrToFdrApi({ ir, snippetsConfig });
            context.logger.debug("Calling registerAPI... ", JSON.stringify(apiDefinition, undefined, 4));
            const response = await fdr.api.v1.register.registerApiDefinition({
                orgId: organization,
                apiId: ir.apiName.originalName,
                definition: apiDefinition
            });

            if (response.ok) {
                context.logger.debug(`Registered API Definition ${response.body.apiDefinitionId}`);
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
                        return context.failAndThrow("Failed to register API", response.error);
                }
            }
        }
    );

    const docsDefinition = await resolver.resolve();

    if (docsRegistrationId == null) {
        return context.failAndThrow("Failed to publish docs.", "Docs registration ID is missing.");
    }

    context.logger.debug("Calling registerDocs... ", JSON.stringify(docsDefinition, undefined, 4));
    const registerDocsResponse = await fdr.docs.v2.write.finishDocsRegister(docsRegistrationId, {
        docsDefinition
    });

    if (registerDocsResponse.ok) {
        const url = wrapWithHttps(urlToOutput);
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

const sizeOf = promisify(imageSize);
async function measureImageSizes(
    imageFilePaths: AbsoluteFilePath[],
    batchSize: number,
    context: TaskContext
): Promise<Map<AbsoluteFilePath, AbsoluteImageFilePath>> {
    const filepathChunks = chunk(imageFilePaths, batchSize);
    const imageFilesWithMetadata: AbsoluteImageFilePath[] = [];
    for (const filepaths of filepathChunks) {
        const chunk: Array<AbsoluteImageFilePath | undefined> = await Promise.all(
            filepaths.map(async (filePath): Promise<AbsoluteImageFilePath | undefined> => {
                try {
                    const size = await sizeOf(filePath);
                    if (size == null || size.height == null || size.width == null) {
                        return undefined;
                    }
                    return { filePath, width: size.width, height: size.height, blurDataUrl: undefined };
                } catch (e) {
                    context.logger.error(`Failed to measure image size for ${filePath}. ${(e as Error)?.message}`);
                    return undefined;
                }
            })
        );

        imageFilesWithMetadata.push(...chunk.filter(isNonNullish));
    }
    return new Map(imageFilesWithMetadata.map((file) => [file.filePath, file]));
}

async function uploadFiles(
    filesToUpload: Record<string, DocsV1Write.FileS3UploadUrl>,
    docsWorkspacePath: AbsoluteFilePath,
    context: TaskContext,
    batchSize: number
): Promise<void> {
    const chunkedFilepathsToUpload = chunk(Object.entries(filesToUpload), batchSize);
    for (const chunkedFilepaths of chunkedFilepathsToUpload) {
        await Promise.all(
            chunkedFilepaths.map(async ([key, { uploadUrl }]) => {
                const relativeFilePath = RelativeFilePath.of(key);
                const absoluteFilePath = resolve(docsWorkspacePath, relativeFilePath);
                try {
                    const mimeType = mime.lookup(absoluteFilePath);
                    await axios.put(uploadUrl, await readFile(absoluteFilePath), {
                        headers: {
                            "Content-Type": mimeType === false ? "application/octet-stream" : mimeType
                        }
                    });
                } catch (e) {
                    // file might not exist
                    context.failAndThrow(`Failed to upload ${absoluteFilePath}`, e);
                }
            })
        );
    }
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

function startDocsRegisterFailed(
    error: DocsV2Write.startDocsPreviewRegister.Error | DocsV2Write.startDocsRegister.Error,
    context: TaskContext
): never {
    switch (error.error) {
        case "InvalidCustomDomainError":
            return context.failAndThrow(
                `Your docs domain should end with ${process.env.DOCS_DOMAIN_SUFFIX ?? "docs.buildwithfern.com"}`
            );
        case "InvalidDomainError":
            return context.failAndThrow(
                "Please make sure that none of your custom domains are not overlapping (i.e. one is a substring of another)"
            );
        default:
            return context.failAndThrow("Failed to publish docs.", error);
    }
}
