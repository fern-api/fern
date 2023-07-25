import { FernToken } from "@fern-api/auth";
import { assertNever, entries } from "@fern-api/core-utils";
import {
    DocsNavigationConfiguration,
    DocsNavigationItem,
    FontConfig,
    ImageReference,
    TypographyConfig,
} from "@fern-api/docs-configuration";
import { AbsoluteFilePath, relative, RelativeFilePath } from "@fern-api/fs-utils";
import { registerApi } from "@fern-api/register";
import { createFdrService } from "@fern-api/services";
import { TaskContext } from "@fern-api/task-context";
import { DocsDefinition, FernWorkspace } from "@fern-api/workspace-loader";
import { FernRegistry } from "@fern-fern/registry-node";
import axios from "axios";
import chalk from "chalk";
import { readFile } from "fs/promises";

export async function publishDocs({
    token,
    organization,
    docsDefinition,
    domain,
    customDomains,
    fernWorkspaces,
    context,
    version,
}: {
    token: FernToken;
    organization: string;
    docsDefinition: DocsDefinition;
    domain: string;
    customDomains: string[];
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    version: string | undefined;
}): Promise<void> {
    const fdr = createFdrService({ token: token.value });

    const filepathsToUpload = getFilepathsToUpload(docsDefinition);

    const startDocsRegisterResponse = await fdr.docs.v2.write.startDocsRegister({
        domain,
        customDomains,
        apiId: FernRegistry.ApiId(""),
        orgId: FernRegistry.OrgId(organization),
        filepaths: filepathsToUpload.map((filepath) => convertAbsoluteFilepathToFdrFilepath(filepath, docsDefinition)),
    });

    if (!startDocsRegisterResponse.ok) {
        return startDocsRegisterResponse.error._visit<never>({
            _other: (error) => {
                return context.failAndThrow("Failed to publish docs.", error);
            },
            invalidDomainError: () => {
                return context.failAndThrow(
                    `Your docs domain should end with ${process.env.DOCS_DOMAIN_SUFFIX ?? "docs.buildwithfern.com"}`
                );
            },
            invalidCustomDomainError: () => {
                return context.failAndThrow(
                    "Please make sure that none of your custom domains are not overlapping (i.e. one is a substring of another)"
                );
            },
        });
    }

    const { docsRegistrationId, uploadUrls } = startDocsRegisterResponse.body;

    await Promise.all(
        filepathsToUpload.map(async (filepathToUpload) => {
            const uploadUrl = uploadUrls[convertAbsoluteFilepathToFdrFilepath(filepathToUpload, docsDefinition)];
            if (uploadUrl == null) {
                context.failAndThrow(`Failed to upload ${filepathToUpload}`, "Upload URL is missing");
            } else {
                await axios.put(uploadUrl.uploadUrl, await readFile(filepathToUpload), {
                    headers: {
                        "Content-Type": "application/octet-stream",
                    },
                });
            }
        })
    );

    const registerDocsRequest = await constructRegisterDocsRequest({
        docsDefinition,
        organization,
        fernWorkspaces,
        context,
        token,
        uploadUrls,
        version,
    });
    context.logger.debug(JSON.stringify(registerDocsRequest));
    const registerDocsResponse = await fdr.docs.v2.write.finishDocsRegister(docsRegistrationId, registerDocsRequest);
    if (registerDocsResponse.ok) {
        const url = domain.startsWith("https://") ? domain : `https://${domain}`;
        context.logger.info(chalk.green(`Published docs to ${url}`));
    } else {
        registerDocsResponse.error._visit<never>({
            unauthorizedError: () => {
                return context.failAndThrow("Insufficient permissions. Failed to publish docs to " + domain);
            },
            userNotInOrgError: () => {
                return context.failAndThrow("Insufficient permissions. Failed to publish docs to " + domain);
            },
            docsRegistrationIdNotFound: () => {
                return context.failAndThrow(
                    "Failed to publish docs to " + domain,
                    `Docs registration ID ${docsRegistrationId} does not exist.`
                );
            },
            _other: (error) => {
                return context.failAndThrow("Failed to publish docs to " + domain, error);
            },
        });
        return context.failAndThrow();
    }
}

async function constructRegisterDocsRequest({
    docsDefinition,
    organization,
    fernWorkspaces,
    context,
    token,
    uploadUrls,
    version,
}: {
    docsDefinition: DocsDefinition;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    uploadUrls: Record<FernRegistry.docs.v1.write.FilePath, FernRegistry.docs.v1.write.FileS3UploadUrl>;
    version: string | undefined;
}): Promise<FernRegistry.docs.v2.write.RegisterDocsRequest> {
    return {
        docsDefinition: {
            pages: entries(docsDefinition.pages).reduce(
                (pages, [pageFilepath, pageContents]) => ({
                    ...pages,
                    [constructPageId(pageFilepath)]: { markdown: pageContents },
                }),
                {}
            ),
            config: await convertDocsConfiguration({
                docsDefinition,
                organization,
                fernWorkspaces,
                context,
                token,
                uploadUrls,
                version,
            }),
        },
    };
}

async function convertDocsConfiguration({
    docsDefinition,
    organization,
    fernWorkspaces,
    context,
    token,
    uploadUrls,
    version,
}: {
    docsDefinition: DocsDefinition;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    uploadUrls: Record<FernRegistry.docs.v1.write.FilePath, FernRegistry.docs.v1.write.FileS3UploadUrl>;
    version: string | undefined;
}): Promise<FernRegistry.docs.v1.write.DocsConfig> {
    return {
        title: docsDefinition.config.title,
        logo:
            docsDefinition.config.logo != null
                ? await convertImageReference({
                      imageReference: docsDefinition.config.logo.reference,
                      docsDefinition,
                      uploadUrls,
                      context,
                  })
                : undefined,
        logoHeight: docsDefinition.config.logo?.height,
        logoHref: docsDefinition.config.logo?.href,
        favicon:
            docsDefinition.config.favicon != null
                ? await convertImageReference({
                      imageReference: docsDefinition.config.favicon,
                      docsDefinition,
                      uploadUrls,
                      context,
                  })
                : undefined,
        navigation: await convertNavigationConfig({
            navigationConfig: docsDefinition.config.navigation,
            docsDefinition,
            organization,
            fernWorkspaces,
            context,
            token,
            version,
        }),
        colors: docsDefinition.config.colors,
        navbarLinks: docsDefinition.config.navbarLinks,
        typography: convertDocsTypographyConfiguration({
            typographyConfiguration: docsDefinition.config.typography,
            docsDefinition,
            uploadUrls,
            context,
        }),
    };
}

async function convertNavigationConfig({
    navigationConfig,
    docsDefinition,
    organization,
    fernWorkspaces,
    context,
    token,
    version,
}: {
    navigationConfig: DocsNavigationConfiguration;
    docsDefinition: DocsDefinition;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    version: string | undefined;
}): Promise<FernRegistry.docs.v1.write.NavigationConfig> {
    switch (navigationConfig.type) {
        case "unversioned":
            return {
                items: await Promise.all(
                    navigationConfig.items.map((item) =>
                        convertNavigationItem({
                            item,
                            docsDefinition,
                            organization,
                            fernWorkspaces,
                            context,
                            token,
                            version,
                        })
                    )
                ),
            };
        case "versioned":
            return {
                versions: await Promise.all(
                    navigationConfig.versions.map(async (configVersion) => {
                        return {
                            config: {
                                items: await Promise.all(
                                    configVersion.items.map(async (item) =>
                                        convertNavigationItem({
                                            item,
                                            docsDefinition,
                                            organization,
                                            fernWorkspaces,
                                            context,
                                            token,
                                            version,
                                        })
                                    )
                                ),
                            },
                            version: configVersion.version,
                        };
                    })
                ),
            };
        default:
            assertNever(navigationConfig);
    }
}

function convertDocsTypographyConfiguration({
    typographyConfiguration,
    docsDefinition,
    uploadUrls,
    context,
}: {
    typographyConfiguration?: TypographyConfig;
    docsDefinition: DocsDefinition;
    uploadUrls: Record<FernRegistry.docs.v1.write.FilePath, FernRegistry.docs.v1.write.FileS3UploadUrl>;
    context: TaskContext;
}): FernRegistry.docs.v1.write.DocsTypographyConfig | undefined {
    if (typographyConfiguration == null) {
        return;
    }
    const result: FernRegistry.docs.v1.write.DocsTypographyConfig = {
        headingsFont: convertFont({
            font: typographyConfiguration.headingsFont,
            context,
            docsDefinition,
            label: "headings",
            uploadUrls,
        }),
        bodyFont: convertFont({
            font: typographyConfiguration.bodyFont,
            context,
            docsDefinition,
            label: "body",
            uploadUrls,
        }),
        codeFont: convertFont({
            font: typographyConfiguration.codeFont,
            context,
            docsDefinition,
            label: "code",
            uploadUrls,
        }),
    };
    return result;
}

function convertFont({
    font,
    docsDefinition,
    uploadUrls,
    context,
    label,
}: {
    font: FontConfig | undefined;
    docsDefinition: DocsDefinition;
    uploadUrls: Record<FernRegistry.docs.v1.write.FilePath, FernRegistry.docs.v1.write.FileS3UploadUrl>;
    context: TaskContext;
    label: string;
}): FernRegistry.docs.v1.write.FontConfig | undefined {
    if (font == null) {
        return;
    }

    const filepath = convertAbsoluteFilepathToFdrFilepath(font.absolutePath, docsDefinition);

    const file = uploadUrls[filepath];
    if (file == null) {
        return context.failAndThrow(`Failed to locate ${label} font file after uploading`);
    }

    return {
        name: font.name ?? `font:${label}:${file.fileId}`,
        fontFile: file.fileId,
    };
}

async function convertImageReference({
    imageReference,
    docsDefinition,
    uploadUrls,
    context,
}: {
    imageReference: ImageReference;
    docsDefinition: DocsDefinition;
    uploadUrls: Record<FernRegistry.docs.v1.write.FilePath, FernRegistry.docs.v1.write.FileS3UploadUrl>;
    context: TaskContext;
}): Promise<FernRegistry.docs.v1.write.FileId> {
    const filepath = convertAbsoluteFilepathToFdrFilepath(imageReference.filepath, docsDefinition);
    const file = uploadUrls[filepath];
    if (file == null) {
        return context.failAndThrow("Failed to locate file after uploading");
    }
    return file.fileId;
}

async function convertNavigationItem({
    item,
    docsDefinition,
    organization,
    fernWorkspaces,
    context,
    token,
    version,
}: {
    item: DocsNavigationItem;
    docsDefinition: DocsDefinition;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    version: string | undefined;
}): Promise<FernRegistry.docs.v1.write.NavigationItem> {
    switch (item.type) {
        case "page":
            return FernRegistry.docs.v1.write.NavigationItem.page({
                title: item.title,
                id: constructPageId(relative(docsDefinition.absoluteFilepath, item.absolutePath)),
            });
        case "section":
            return FernRegistry.docs.v1.write.NavigationItem.section({
                title: item.title,
                items: await Promise.all(
                    item.contents.map((nestedItem) =>
                        convertNavigationItem({
                            item: nestedItem,
                            docsDefinition,
                            organization,
                            fernWorkspaces,
                            context,
                            token,
                            version,
                        })
                    )
                ),
            });
        case "apiSection": {
            const apiDefinitionId = await registerApi({
                organization,
                workspace: getFernWorkspaceForApiSection({ apiSection: item, fernWorkspaces }),
                context,
                token,
                audiences: item.audiences,
            });
            return FernRegistry.docs.v1.write.NavigationItem.api({
                title: item.title,
                api: apiDefinitionId,
            });
        }
        default:
            assertNever(item);
    }
}

function getFernWorkspaceForApiSection({
    apiSection,
    fernWorkspaces,
}: {
    apiSection: DocsNavigationItem.ApiSection;
    fernWorkspaces: FernWorkspace[];
}): FernWorkspace {
    if (fernWorkspaces.length === 1 && fernWorkspaces[0] != null) {
        return fernWorkspaces[0];
    } else if (apiSection.apiName != null) {
        const fernWorkspace = fernWorkspaces.find((workspace) => {
            return workspace.workspaceName === apiSection.apiName;
        });
        if (fernWorkspace != null) {
            return fernWorkspace;
        }
    }
    throw new Error("Failed to load API Definition referenced in docs");
}

function constructPageId(pathToPage: RelativeFilePath): FernRegistry.docs.v1.write.PageId {
    return FernRegistry.docs.v1.write.PageId(pathToPage);
}

function getFilepathsToUpload(docsDefinition: DocsDefinition): AbsoluteFilePath[] {
    const filepaths: AbsoluteFilePath[] = [];

    if (docsDefinition.config.logo != null) {
        filepaths.push(docsDefinition.config.logo.reference.filepath);
    }

    if (docsDefinition.config.favicon != null) {
        filepaths.push(docsDefinition.config.favicon.filepath);
    }

    const typographyConfiguration = docsDefinition.config.typography;

    if (typographyConfiguration?.headingsFont != null) {
        filepaths.push(typographyConfiguration.headingsFont.absolutePath);
    }
    if (typographyConfiguration?.bodyFont != null) {
        filepaths.push(typographyConfiguration.bodyFont.absolutePath);
    }
    if (typographyConfiguration?.codeFont != null) {
        filepaths.push(typographyConfiguration.codeFont.absolutePath);
    }

    return filepaths;
}

function convertAbsoluteFilepathToFdrFilepath(filepath: AbsoluteFilePath, docsDefinition: DocsDefinition) {
    return FernRegistry.docs.v1.write.FilePath(relative(docsDefinition.absoluteFilepath, filepath));
}
