import { FernToken } from "@fern-api/auth";
import { createFdrService } from "@fern-api/core";
import { assertNever, entries } from "@fern-api/core-utils";
import {
    DocsNavigationConfiguration,
    DocsNavigationItem,
    FontConfig,
    ImageReference,
    ParsedDocsConfiguration,
    parseDocsConfiguration,
    TypographyConfig,
    UnversionedNavigationConfiguration
} from "@fern-api/docs-configuration";
import { APIV1Write, DocsV1Write, DocsV2Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, relative } from "@fern-api/fs-utils";
import { registerApi } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import { SnippetsConfiguration, TabConfig, VersionAvailability } from "@fern-fern/docs-config/api";
import axios from "axios";
import chalk from "chalk";
import { readFile } from "fs/promises";
import * as mime from "mime-types";

export async function publishDocs({
    token,
    organization,
    docsWorkspace,
    domain,
    customDomains,
    fernWorkspaces,
    context,
    version,
    preview
}: {
    token: FernToken;
    organization: string;
    docsWorkspace: DocsWorkspace;
    domain: string;
    customDomains: string[];
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    version: string | undefined;
    preview: boolean;
}): Promise<void> {
    const fdr = createFdrService({ token: token.value });

    const parsedDocsConfig = await parseDocsConfiguration({
        rawDocsConfiguration: docsWorkspace.config,
        context,
        absolutePathToFernFolder: docsWorkspace.absoluteFilepath,
        absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig
    });

    const filepathsToUpload = getFilepathsToUpload(parsedDocsConfig);
    context.logger.debug("Absolute filepaths to upload:", filepathsToUpload.join(", "));

    const relativeFilepathsToUpload = filepathsToUpload.map((filepath) =>
        convertAbsoluteFilepathToFdrFilepath(filepath, parsedDocsConfig)
    );
    context.logger.debug("Relative filepaths to upload: [", relativeFilepathsToUpload.join(", "));

    let urlToOutput = customDomains[0] ?? domain;
    let startDocsRegisterResponse;
    if (preview) {
        startDocsRegisterResponse = await fdr.docs.v2.write.startDocsPreviewRegister({
            orgId: organization,
            filepaths: relativeFilepathsToUpload
        });
        if (startDocsRegisterResponse.ok) {
            urlToOutput = startDocsRegisterResponse.body.previewUrl;
        }
    } else {
        startDocsRegisterResponse = await fdr.docs.v2.write.startDocsRegister({
            domain,
            customDomains,
            apiId: "",
            orgId: organization,
            filepaths: relativeFilepathsToUpload
        });
    }

    if (!startDocsRegisterResponse.ok) {
        switch (startDocsRegisterResponse.error.error) {
            case "InvalidCustomDomainError":
                return context.failAndThrow(
                    `Your docs domain should end with ${process.env.DOCS_DOMAIN_SUFFIX ?? "docs.buildwithfern.com"}`
                );
            case "InvalidDomainError":
                return context.failAndThrow(
                    "Please make sure that none of your custom domains are not overlapping (i.e. one is a substring of another)"
                );
            default:
                return context.failAndThrow("Failed to publish docs.", startDocsRegisterResponse.error);
        }
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
                        "Content-Type": mimeType === false ? "application/octet-stream" : mimeType
                    }
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
        version
    });
    context.logger.debug("Calling registerDocs... ", JSON.stringify(registerDocsRequest, undefined, 4));
    const registerDocsResponse = await fdr.docs.v2.write.finishDocsRegister(docsRegistrationId, registerDocsRequest);
    if (registerDocsResponse.ok) {
        const url = wrapWithHttps(urlToOutput);
        context.logger.info(chalk.green(`Published docs to ${url}`));
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

async function constructRegisterDocsRequest({
    parsedDocsConfig,
    organization,
    fernWorkspaces,
    context,
    token,
    uploadUrls,
    version
}: {
    parsedDocsConfig: ParsedDocsConfiguration;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    uploadUrls: Record<DocsV1Write.FilePath, DocsV1Write.FileS3UploadUrl>;
    version: string | undefined;
}): Promise<DocsV2Write.RegisterDocsRequest> {
    return {
        docsDefinition: {
            pages: entries(parsedDocsConfig.pages).reduce(
                (pages, [pageFilepath, pageContents]) => ({
                    ...pages,
                    [pageFilepath]: { markdown: pageContents }
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
                version
            })
        }
    };
}

async function convertDocsConfiguration({
    parsedDocsConfig,
    organization,
    fernWorkspaces,
    context,
    token,
    uploadUrls,
    version
}: {
    parsedDocsConfig: ParsedDocsConfiguration;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    uploadUrls: Record<DocsV1Write.FilePath, DocsV1Write.FileS3UploadUrl>;
    version: string | undefined;
}): Promise<DocsV1Write.DocsConfig> {
    return {
        title: parsedDocsConfig.title,
        logoV2: {
            dark:
                parsedDocsConfig.logo?.dark != null
                    ? await convertImageReference({
                          imageReference: parsedDocsConfig.logo.dark,
                          parsedDocsConfig,
                          uploadUrls,
                          context
                      })
                    : undefined,
            light:
                parsedDocsConfig.logo?.light != null
                    ? await convertImageReference({
                          imageReference: parsedDocsConfig.logo.light,
                          parsedDocsConfig,
                          uploadUrls,
                          context
                      })
                    : undefined
        },
        logoHeight: parsedDocsConfig.logo?.height,
        logoHref: parsedDocsConfig.logo?.href,
        favicon:
            parsedDocsConfig.favicon != null
                ? await convertImageReference({
                      imageReference: parsedDocsConfig.favicon,
                      parsedDocsConfig,
                      uploadUrls,
                      context
                  })
                : undefined,
        backgroundImage:
            parsedDocsConfig.backgroundImage != null
                ? await convertImageReference({
                      imageReference: parsedDocsConfig.backgroundImage,
                      parsedDocsConfig,
                      uploadUrls,
                      context
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
            version
        }),
        colorsV2: {
            accentPrimary:
                parsedDocsConfig.colors?.accentPrimary != null
                    ? parsedDocsConfig.colors.accentPrimary.type === "themed"
                        ? {
                              type: "themed",
                              dark: parsedDocsConfig.colors.accentPrimary.dark,
                              light: parsedDocsConfig.colors.accentPrimary.light
                          }
                        : parsedDocsConfig.colors.accentPrimary.color != null
                        ? {
                              type: "unthemed",
                              color: parsedDocsConfig.colors.accentPrimary.color
                          }
                        : undefined
                    : undefined,
            background:
                parsedDocsConfig.colors?.background != null
                    ? parsedDocsConfig.colors.background.type === "themed"
                        ? {
                              type: "themed",
                              dark: parsedDocsConfig.colors.background.dark,
                              light: parsedDocsConfig.colors.background.light
                          }
                        : parsedDocsConfig.colors.background.color != null
                        ? {
                              type: "unthemed",
                              color: parsedDocsConfig.colors.background.color
                          }
                        : undefined
                    : undefined
        },
        navbarLinks: parsedDocsConfig.navbarLinks,
        typography: convertDocsTypographyConfiguration({
            typographyConfiguration: parsedDocsConfig.typography,
            parsedDocsConfig,
            uploadUrls,
            context
        })
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
    version
}: {
    navigationConfig: DocsNavigationConfiguration;
    tabs?: Record<string, TabConfig>;
    parsedDocsConfig: ParsedDocsConfiguration;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    version: string | undefined;
}): Promise<DocsV1Write.NavigationConfig> {
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
                            version
                        })
                    )
                )
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
                                        version
                                    })
                                )
                            )
                        };
                    })
                )
            };
        case "versioned":
            return {
                versions: await Promise.all(
                    navigationConfig.versions.map(
                        async (version): Promise<DocsV1Write.VersionedNavigationConfigData> => {
                            return {
                                version: version.version,
                                config: await convertUnversionedNavigationConfig({
                                    navigationConfig: version.navigation,
                                    parsedDocsConfig,
                                    organization,
                                    fernWorkspaces,
                                    context,
                                    token,
                                    version: version.version
                                }),
                                availability:
                                    version.availability != null
                                        ? convertAvailability(version.availability)
                                        : undefined,
                                urlSlugOverride: version.slug
                            };
                        }
                    )
                )
            };
        default:
            assertNever(navigationConfig);
    }
}

function convertAvailability(availability: VersionAvailability): DocsV1Write.VersionAvailability {
    switch (availability) {
        case "beta":
            return DocsV1Write.VersionAvailability.Beta;
        case "deprecated":
            return DocsV1Write.VersionAvailability.Deprecated;
        case "ga":
            return DocsV1Write.VersionAvailability.GenerallyAvailable;
        case "stable":
            return DocsV1Write.VersionAvailability.Stable;
        default:
            assertNever(availability);
    }
}

async function convertUnversionedNavigationConfig({
    navigationConfig,
    tabs,
    parsedDocsConfig,
    organization,
    fernWorkspaces,
    context,
    token,
    version
}: {
    navigationConfig: UnversionedNavigationConfiguration;
    tabs?: Record<string, TabConfig>;
    parsedDocsConfig: ParsedDocsConfiguration;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    version: string | undefined;
}): Promise<DocsV1Write.UnversionedNavigationConfig> {
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
                            version
                        })
                    )
                )
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
                                        version
                                    })
                                )
                            )
                        };
                    })
                )
            };
        default:
            assertNever(navigationConfig);
    }
}

function convertDocsTypographyConfiguration({
    typographyConfiguration,
    parsedDocsConfig,
    uploadUrls,
    context
}: {
    typographyConfiguration?: TypographyConfig;
    parsedDocsConfig: ParsedDocsConfiguration;
    uploadUrls: Record<DocsV1Write.FilePath, DocsV1Write.FileS3UploadUrl>;
    context: TaskContext;
}): DocsV1Write.DocsTypographyConfig | undefined {
    if (typographyConfiguration == null) {
        return;
    }
    const result: DocsV1Write.DocsTypographyConfig = {
        headingsFont: convertFont({
            font: typographyConfiguration.headingsFont,
            context,
            parsedDocsConfig,
            label: "headings",
            uploadUrls
        }),
        bodyFont: convertFont({
            font: typographyConfiguration.bodyFont,
            context,
            parsedDocsConfig,
            label: "body",
            uploadUrls
        }),
        codeFont: convertFont({
            font: typographyConfiguration.codeFont,
            context,
            parsedDocsConfig,
            label: "code",
            uploadUrls
        })
    };
    return result;
}

function convertFont({
    font,
    parsedDocsConfig,
    uploadUrls,
    context,
    label
}: {
    font: FontConfig | undefined;
    parsedDocsConfig: ParsedDocsConfiguration;
    uploadUrls: Record<DocsV1Write.FilePath, DocsV1Write.FileS3UploadUrl>;
    context: TaskContext;
    label: string;
}): DocsV1Write.FontConfig | undefined {
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
        fontFile: file.fileId
    };
}

async function convertImageReference({
    imageReference,
    parsedDocsConfig,
    uploadUrls,
    context
}: {
    imageReference: ImageReference;
    parsedDocsConfig: ParsedDocsConfiguration;
    uploadUrls: Record<DocsV1Write.FilePath, DocsV1Write.FileS3UploadUrl>;
    context: TaskContext;
}): Promise<DocsV1Write.FileId> {
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
    version
}: {
    item: DocsNavigationItem;
    parsedDocsConfig: ParsedDocsConfiguration;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    version: string | undefined;
}): Promise<DocsV1Write.NavigationItem> {
    switch (item.type) {
        case "page":
            return {
                type: "page",
                title: item.title,
                id: relative(dirname(parsedDocsConfig.absoluteFilepath), item.absolutePath),
                urlSlugOverride: item.slug
            };
        case "section":
            return {
                type: "section",
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
                            version
                        })
                    )
                ),
                urlSlugOverride: item.slug,
                collapsed: item.collapsed
            };
        case "apiSection": {
            const apiDefinitionId = await registerApi({
                organization,
                workspace: getFernWorkspaceForApiSection({ apiSection: item, fernWorkspaces }),
                context,
                token,
                audiences: item.audiences,
                snippetsConfig: convertDocsSnippetsConfigurationToFdr({
                    snippetsConfiguration: item.snippetsConfiguration ?? {}
                })
            });
            return {
                type: "api",
                title: item.title,
                api: apiDefinitionId,
                showErrors: item.showErrors
            };
        }
        default:
            assertNever(item);
    }
}

function convertDocsSnippetsConfigurationToFdr({
    snippetsConfiguration
}: {
    snippetsConfiguration: SnippetsConfiguration;
}): APIV1Write.SnippetsConfig {
    return {
        pythonSdk:
            snippetsConfiguration.python != null
                ? {
                      package: snippetsConfiguration.python
                  }
                : undefined,
        typescriptSdk:
            snippetsConfiguration.typescript != null
                ? {
                      package: snippetsConfiguration.typescript
                  }
                : undefined,
        goSdk:
            snippetsConfiguration.go != null
                ? {
                      githubRepo: snippetsConfiguration.go
                  }
                : undefined,
        javaSdk:
            snippetsConfiguration.java != null
                ? {
                      coordinate: snippetsConfiguration.java
                  }
                : undefined
    };
}

function getFernWorkspaceForApiSection({
    apiSection,
    fernWorkspaces
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
    return relative(dirname(parsedDocsConfig.absoluteFilepath), filepath);
}

function wrapWithHttps(url: string): string {
    return url.startsWith("https://") ? url : `https://${url}`;
}
