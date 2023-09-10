import { FernToken } from "@fern-api/auth";
import { assertNever, entries } from "@fern-api/core-utils";
import { AbsoluteFilePath, relative, RelativeFilePath } from "@fern-api/fs-utils";
import { registerApi } from "@fern-api/register";
import { createFdrService } from "@fern-api/services";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import { TabConfig } from "@fern-fern/docs-config/api";
import { FernRegistry } from "@fern-fern/registry-node";
import axios from "axios";
import chalk from "chalk";
import { readFile } from "fs/promises";
import * as mime from "mime-types";
import {
    DocsNavigationConfiguration,
    DocsNavigationItem,
    FontConfig,
    ImageReference,
    ParsedDocsConfiguration,
    TypographyConfig,
} from "./converter/ParsedDocsConfiguration";
import { parseDocsConfiguration } from "./converter/parseDocsConfiguration";

export async function publishDocs({
    token,
    organization,
    docsWorkspace,
    domain,
    customDomains,
    fernWorkspaces,
    context,
    version,
}: {
    token: FernToken;
    organization: string;
    docsWorkspace: DocsWorkspace;
    domain: string;
    customDomains: string[];
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    version: string | undefined;
}): Promise<void> {
    const fdr = createFdrService({ token: token.value });

    const parsedDocsConfig = await parseDocsConfiguration({
        rawDocsConfiguration: docsWorkspace.config,
        context,
        absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig,
    });

    const filepathsToUpload = getFilepathsToUpload(parsedDocsConfig);

    const startDocsRegisterResponse = await fdr.docs.v2.write.startDocsRegister({
        domain,
        customDomains,
        apiId: FernRegistry.ApiId(""),
        orgId: FernRegistry.OrgId(organization),
        filepaths: filepathsToUpload.map((filepath) =>
            convertAbsoluteFilepathToFdrFilepath(filepath, parsedDocsConfig)
        ),
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
            const uploadUrl = uploadUrls[convertAbsoluteFilepathToFdrFilepath(filepathToUpload, parsedDocsConfig)];
            if (uploadUrl == null) {
                context.failAndThrow(`Failed to upload ${filepathToUpload}`, "Upload URL is missing");
            } else {
                const mimeType = mime.lookup(filepathToUpload);
                await axios.put(uploadUrl.uploadUrl, await readFile(filepathToUpload), {
                    headers: {
                        "Content-Type": mimeType === false ? "application/octet-stream" : mimeType,
                    },
                });
            }
        })
    );

    const registerDocsRequest = await constructRegisterDocsRequest({
        parsedDocsConfig,
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
    parsedDocsConfig,
    organization,
    fernWorkspaces,
    context,
    token,
    uploadUrls,
    version,
}: {
    parsedDocsConfig: ParsedDocsConfiguration;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    uploadUrls: Record<FernRegistry.docs.v1.write.FilePath, FernRegistry.docs.v1.write.FileS3UploadUrl>;
    version: string | undefined;
}): Promise<FernRegistry.docs.v2.write.RegisterDocsRequest> {
    return {
        docsDefinition: {
            pages: entries(parsedDocsConfig.pages).reduce(
                (pages, [pageFilepath, pageContents]) => ({
                    ...pages,
                    [constructPageId(pageFilepath)]: { markdown: pageContents },
                }),
                {}
            ),
            config: await convertDocsConfiguration({
                parsedDocsConfig,
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
    parsedDocsConfig,
    organization,
    fernWorkspaces,
    context,
    token,
    uploadUrls,
    version,
}: {
    parsedDocsConfig: ParsedDocsConfiguration;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    uploadUrls: Record<FernRegistry.docs.v1.write.FilePath, FernRegistry.docs.v1.write.FileS3UploadUrl>;
    version: string | undefined;
}): Promise<FernRegistry.docs.v1.write.DocsConfig> {
    return {
        title: parsedDocsConfig.title,
        logoV2: {
            dark:
                parsedDocsConfig.logo?.dark != null
                    ? await convertImageReference({
                          imageReference: parsedDocsConfig.logo.dark,
                          parsedDocsConfig,
                          uploadUrls,
                          context,
                      })
                    : undefined,
            light:
                parsedDocsConfig.logo?.light != null
                    ? await convertImageReference({
                          imageReference: parsedDocsConfig.logo.light,
                          parsedDocsConfig,
                          uploadUrls,
                          context,
                      })
                    : undefined,
        },
        logoHeight: parsedDocsConfig.logo?.height,
        logoHref: parsedDocsConfig.logo?.href,
        favicon:
            parsedDocsConfig.favicon != null
                ? await convertImageReference({
                      imageReference: parsedDocsConfig.favicon,
                      parsedDocsConfig,
                      uploadUrls,
                      context,
                  })
                : undefined,
        backgroundImage:
            parsedDocsConfig.backgroundImage != null
                ? await convertImageReference({
                      imageReference: parsedDocsConfig.backgroundImage,
                      parsedDocsConfig,
                      uploadUrls,
                      context,
                  })
                : undefined,
        navigation: await convertNavigationConfig({
            navigationConfig: parsedDocsConfig.navigation,
            tabs: parsedDocsConfig.tabs,
            parsedDocsConfig,
            organization,
            fernWorkspaces,
            context,
            token,
            version,
        }),
        colorsV2: {
            accentPrimary:
                parsedDocsConfig.colors?.accentPrimary != null
                    ? parsedDocsConfig.colors.accentPrimary.type === "themed"
                        ? FernRegistry.docs.v1.write.ColorConfig.themed({
                              dark: parsedDocsConfig.colors.accentPrimary.dark,
                              light: parsedDocsConfig.colors.accentPrimary.light,
                          })
                        : parsedDocsConfig.colors.accentPrimary.color != null
                        ? FernRegistry.docs.v1.write.ColorConfig.unthemed({
                              color: parsedDocsConfig.colors.accentPrimary.color,
                          })
                        : undefined
                    : undefined,
            background:
                parsedDocsConfig.colors?.background != null
                    ? parsedDocsConfig.colors.background.type === "themed"
                        ? FernRegistry.docs.v1.write.ColorConfig.themed({
                              dark: parsedDocsConfig.colors.background.dark,
                              light: parsedDocsConfig.colors.background.light,
                          })
                        : parsedDocsConfig.colors.background.color != null
                        ? FernRegistry.docs.v1.write.ColorConfig.unthemed({
                              color: parsedDocsConfig.colors.background.color,
                          })
                        : undefined
                    : undefined,
        },
        navbarLinks: parsedDocsConfig.navbarLinks,
        typography: convertDocsTypographyConfiguration({
            typographyConfiguration: parsedDocsConfig.typography,
            parsedDocsConfig,
            uploadUrls,
            context,
        }),
    };
}

async function convertNavigationConfig({
    navigationConfig,
    tabs,
    parsedDocsConfig,
    organization,
    fernWorkspaces,
    context,
    token,
    version,
}: {
    navigationConfig: DocsNavigationConfiguration;
    tabs?: Record<string, TabConfig>;
    parsedDocsConfig: ParsedDocsConfiguration;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    version: string | undefined;
}): Promise<FernRegistry.docs.v1.write.NavigationConfig> {
    switch (navigationConfig.type) {
        case "untabbed":
            return {
                items: await Promise.all(
                    navigationConfig.items.map((item) =>
                        convertNavigationItem({
                            item,
                            parsedDocsConfig,
                            organization,
                            fernWorkspaces,
                            context,
                            token,
                            version,
                        })
                    )
                ),
            };
        case "tabbed":
            return {
                tabs: await Promise.all(
                    navigationConfig.items.map(async (tabbedItem) => {
                        const tabConfig = tabs?.[tabbedItem.tab];
                        if (tabConfig == null) {
                            throw new Error(`Couldn't find config for tab id ${tabbedItem.tab}`);
                        }
                        return {
                            title: tabConfig.displayName,
                            icon: tabConfig.icon,
                            items: await Promise.all(
                                tabbedItem.layout.map((item) =>
                                    convertNavigationItem({
                                        item,
                                        parsedDocsConfig,
                                        organization,
                                        fernWorkspaces,
                                        context,
                                        token,
                                        version,
                                    })
                                )
                            ),
                        };
                    })
                ),
            };
        case "versioned":
            throw new Error("Please downgrade your Fern CLI version to support versioned docs");
        default:
            assertNever(navigationConfig);
    }
}

function convertDocsTypographyConfiguration({
    typographyConfiguration,
    parsedDocsConfig,
    uploadUrls,
    context,
}: {
    typographyConfiguration?: TypographyConfig;
    parsedDocsConfig: ParsedDocsConfiguration;
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
            parsedDocsConfig,
            label: "headings",
            uploadUrls,
        }),
        bodyFont: convertFont({
            font: typographyConfiguration.bodyFont,
            context,
            parsedDocsConfig,
            label: "body",
            uploadUrls,
        }),
        codeFont: convertFont({
            font: typographyConfiguration.codeFont,
            context,
            parsedDocsConfig,
            label: "code",
            uploadUrls,
        }),
    };
    return result;
}

function convertFont({
    font,
    parsedDocsConfig,
    uploadUrls,
    context,
    label,
}: {
    font: FontConfig | undefined;
    parsedDocsConfig: ParsedDocsConfiguration;
    uploadUrls: Record<FernRegistry.docs.v1.write.FilePath, FernRegistry.docs.v1.write.FileS3UploadUrl>;
    context: TaskContext;
    label: string;
}): FernRegistry.docs.v1.write.FontConfig | undefined {
    if (font == null) {
        return;
    }

    const filepath = convertAbsoluteFilepathToFdrFilepath(font.absolutePath, parsedDocsConfig);

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
    parsedDocsConfig,
    uploadUrls,
    context,
}: {
    imageReference: ImageReference;
    parsedDocsConfig: ParsedDocsConfiguration;
    uploadUrls: Record<FernRegistry.docs.v1.write.FilePath, FernRegistry.docs.v1.write.FileS3UploadUrl>;
    context: TaskContext;
}): Promise<FernRegistry.docs.v1.write.FileId> {
    const filepath = convertAbsoluteFilepathToFdrFilepath(imageReference.filepath, parsedDocsConfig);
    const file = uploadUrls[filepath];
    if (file == null) {
        return context.failAndThrow("Failed to locate file after uploading");
    }
    return file.fileId;
}

async function convertNavigationItem({
    item,
    parsedDocsConfig,
    organization,
    fernWorkspaces,
    context,
    token,
    version,
}: {
    item: DocsNavigationItem;
    parsedDocsConfig: ParsedDocsConfiguration;
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
                id: constructPageId(relative(parsedDocsConfig.absoluteFilepath, item.absolutePath)),
                urlSlugOverride: item.slug,
            });
        case "section":
            return FernRegistry.docs.v1.write.NavigationItem.section({
                title: item.title,
                items: await Promise.all(
                    item.contents.map((nestedItem) =>
                        convertNavigationItem({
                            item: nestedItem,
                            parsedDocsConfig,
                            organization,
                            fernWorkspaces,
                            context,
                            token,
                            version,
                        })
                    )
                ),
                urlSlugOverride: item.slug,
                collapsed: item.collapsed,
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

function getFilepathsToUpload(parsedDocsConfig: ParsedDocsConfiguration): AbsoluteFilePath[] {
    const filepaths: AbsoluteFilePath[] = [];

    if (parsedDocsConfig.logo?.dark != null) {
        filepaths.push(parsedDocsConfig.logo.dark.filepath);
    }

    if (parsedDocsConfig.logo?.light != null) {
        filepaths.push(parsedDocsConfig.logo.light.filepath);
    }

    if (parsedDocsConfig.favicon != null) {
        filepaths.push(parsedDocsConfig.favicon.filepath);
    }

    if (parsedDocsConfig.backgroundImage != null) {
        filepaths.push(parsedDocsConfig.backgroundImage.filepath);
    }

    const typographyConfiguration = parsedDocsConfig.typography;

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

function convertAbsoluteFilepathToFdrFilepath(filepath: AbsoluteFilePath, parsedDocsConfig: ParsedDocsConfiguration) {
    return FernRegistry.docs.v1.write.FilePath(relative(parsedDocsConfig.absoluteFilepath, filepath));
}
