import { FernToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { docsYml } from "@fern-api/configuration";
import { createFdrService } from "@fern-api/core";
import { MediaType } from "@fern-api/core-utils";
import { DocsDefinitionResolver, UploadedFile, wrapWithHttps } from "@fern-api/docs-resolver";
import { AbsoluteFilePath, convertToFernHostRelativeFilePath, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { convertIrToDynamicSnippetsIr, generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { convertIrToFdrApi } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import { FernRegistry as CjsFdrSdk } from "@fern-fern/fdr-cjs-sdk";
import {
    DynamicIr,
    DynamicIrUpload,
    SnippetsConfig
} from "@fern-fern/fdr-cjs-sdk/api/resources/api/resources/v1/resources/register";

import { generatorsYml } from "@fern-api/configuration";
import axios from "axios";
import chalk from "chalk";
import { readFile } from "fs/promises";
import { chunk } from "lodash-es";
import * as mime from "mime-types";
import terminalLink from "terminal-link";
import { OSSWorkspace } from "../../../../workspace/lazy-fern-workspace/src";
import { measureImageSizes } from "./measureImageSizes";
import { getDynamicGeneratorConfig } from "./getDynamicGeneratorConfig";

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
    dynamicSnippets = false
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
    dynamicSnippets: boolean | undefined;
}): Promise<void> {
    const fdr = createFdrService({ token: token.value });
    const authConfig: CjsFdrSdk.docs.v2.write.AuthConfig = isPrivate
        ? { type: "private", authType: "sso" }
        : { type: "public" };

    let docsRegistrationId: string | undefined;
    let urlToOutput = customDomains[0] ?? domain;
    const basePath = parseBasePath(domain);
    const resolver = new DocsDefinitionResolver(
        domain,
        docsWorkspace,
        ossWorkspaces,
        apiWorkspaces,
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

            const images: CjsFdrSdk.docs.v2.write.ImageFilePath[] = [];

            [...measuredImages.values()].forEach((image) => {
                const filePath = filesMap.get(image.filePath);
                if (filePath == null) {
                    return;
                }
                const imageFilePath = {
                    filePath: CjsFdrSdk.docs.v1.write.FilePath(
                        convertToFernHostRelativeFilePath(filePath.relativeFilePath)
                    ),
                    width: image.width,
                    height: image.height,
                    blurDataUrl: image.blurDataUrl,
                    alt: undefined
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
                    filepaths: filepaths.map((filePath) => CjsFdrSdk.docs.v1.write.FilePath(filePath)),
                    images,
                    basePath
                });
                if (startDocsRegisterResponse.ok) {
                    urlToOutput = startDocsRegisterResponse.body.previewUrl;
                    docsRegistrationId = startDocsRegisterResponse.body.docsRegistrationId;
                    await uploadFiles(
                        startDocsRegisterResponse.body.uploadUrls,
                        docsWorkspace.absoluteFilePath,
                        context,
                        UPLOAD_FILE_BATCH_SIZE
                    );
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
                    filepaths: filepaths.map((filePath) => CjsFdrSdk.docs.v1.write.FilePath(filePath)),
                    images
                });
                if (startDocsRegisterResponse.ok) {
                    docsRegistrationId = startDocsRegisterResponse.body.docsRegistrationId;
                    await uploadFiles(
                        startDocsRegisterResponse.body.uploadUrls,
                        docsWorkspace.absoluteFilePath,
                        context,
                        UPLOAD_FILE_BATCH_SIZE
                    );
                    return convertToFilePathPairs(
                        startDocsRegisterResponse.body.uploadUrls,
                        docsWorkspace.absoluteFilePath
                    );
                } else {
                    return startDocsRegisterFailed(startDocsRegisterResponse.error, context);
                }
            }
        },
        async ({ ir, snippetsConfig, playgroundConfig, apiName, workspace }) => {
            const apiDefinition = convertIrToFdrApi({ ir, snippetsConfig, playgroundConfig, context });

            // create dynamic IR + metadata for each generator language
            let dynamicIRsByLanguage: Record<string, DynamicIr> | undefined;
            if (dynamicSnippets) {
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
                definition: {
                    ...apiDefinition,
                    snippetsConfiguration: preview ? undefined : apiDefinition.snippetsConfiguration
                },
                definitionV2: undefined,
                dynamicIRs: dynamicIRsByLanguage
            });

            if (response.ok) {
                context.logger.debug(`Registered API Definition ${response.body.apiDefinitionId}`);

                if (response.body.dynamicIRs && dynamicIRsByLanguage) {
                    await uploadDynamicIRs({
                        dynamicIRs: dynamicIRsByLanguage,
                        dynamicIRUploadUrls: response.body.dynamicIRs,
                        context,
                        apiId: response.body.apiDefinitionId
                    });
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
        async ({ api, snippetsConfig, apiName }) => {
            api.snippetsConfiguration = snippetsConfig;
            const response = await fdr.api.v1.register.registerApiDefinition({
                orgId: CjsFdrSdk.OrgId(organization),
                apiId: CjsFdrSdk.ApiId(apiName ?? api.id),
                definition: undefined,
                definitionV2: {
                    ...api,
                    snippetsConfiguration: preview ? undefined : api.snippetsConfiguration
                }
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
        }
    );

    const docsDefinition = await resolver.resolve();

    if (docsRegistrationId == null) {
        return context.failAndThrow("Failed to publish docs.", "Docs registration ID is missing.");
    }

    context.logger.debug("Publishing docs...");
    const registerDocsResponse = await fdr.docs.v2.write.finishDocsRegister(
        CjsFdrSdk.docs.v1.write.DocsRegistrationId(docsRegistrationId),
        {
            docsDefinition
        }
    );

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

async function uploadFiles(
    filesToUpload: Record<string, CjsFdrSdk.docs.v1.write.FileS3UploadUrl>,
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
                            "Content-Type": mimeType === false ? "application/octet-stream" : mimeType
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
    uploadUrls: Record<string, CjsFdrSdk.docs.v1.write.FileS3UploadUrl>,
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
    error: CjsFdrSdk.docs.v2.write.startDocsPreviewRegister.Error | CjsFdrSdk.docs.v2.write.startDocsRegister.Error,
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

async function generateLanguageSpecificDynamicIRs({
    workspace,
    organization,
    context,
    snippetsConfig
}: {
    workspace: FernWorkspace | undefined;
    organization: string,
    context: TaskContext;
    snippetsConfig: SnippetsConfig;
}): Promise<Record<string, DynamicIr> | undefined> {
    let languageSpecificIRs: Record<string, DynamicIr> = {};

    if (!workspace) {
        return undefined;
    }

    let snippetConfiguration = {
        typescript: snippetsConfig.typescriptSdk?.package,
        python: snippetsConfig.pythonSdk?.package,
        java: snippetsConfig.javaSdk?.coordinate,
        go: snippetsConfig.goSdk?.githubRepo,
        csharp: snippetsConfig.csharpSdk?.package,
        ruby: snippetsConfig.rubySdk?.gem,
        // todo: update when snippet config is supported
        php: undefined,
        swift: undefined,
        rust: undefined
    };

    if (workspace.generatorsConfiguration?.groups) {
        for (const group of workspace.generatorsConfiguration.groups) {
            for (const generatorInvocation of group.generators) {
                const packageName = generatorsYml.getPackageName({ generatorInvocation });

                // generate a dynamic IR for configuration that matches the requested api snippet
                if (
                    packageName &&
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
                            skipAutogenerationIfManualExamplesExist: true
                        },
                        audiences: {
                            type: "all"
                        },
                        readme: undefined,
                        packageName: packageName,
                        version: undefined,
                        context,
                        sourceResolver: new SourceResolverImpl(context, workspace)
                    });

                    const dynamicIR = await convertIrToDynamicSnippetsIr({
                        ir: irForDynamicSnippets,
                        disableExamples: true,
                        smartCasing: generatorInvocation.smartCasing,
                        generationLanguage: generatorInvocation.language,
                        generatorConfig: getDynamicGeneratorConfig({
                            apiName: workspace.workspaceName ?? "",
                            organization,
                            generatorInvocation
                        })
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
