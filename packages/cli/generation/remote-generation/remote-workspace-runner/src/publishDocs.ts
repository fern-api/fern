import { FernToken } from "@fern-api/auth";
import { docsYml, WithoutQuestionMarks } from "@fern-api/configuration";
import { createFdrService } from "@fern-api/core";
import { assertNever, entries, isNonNullish } from "@fern-api/core-utils";
import { getReferencedMarkdownFiles } from "@fern-api/docs-validator";
import { APIV1Write, DocsV1Write, DocsV2Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, join, relative, RelativeFilePath } from "@fern-api/fs-utils";
import { registerApi } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import axios from "axios";
import chalk from "chalk";
import { readFile } from "fs/promises";
import matter from "gray-matter";
import { imageSize } from "image-size";
import { last } from "lodash-es";
import * as mime from "mime-types";
import terminalLink from "terminal-link";
import { promisify } from "util";
import { convertIrToNavigation } from "./convertIrToNavigation";
import { extractDatetimeFromChangelogTitle } from "./extractDatetimeFromChangelogTitle";
import { parseImagePaths, replaceImagePaths } from "./parseImagePaths";

export async function publishDocs({
    token,
    organization,
    docsWorkspace,
    domain,
    customDomains,
    fernWorkspaces,
    context,
    version,
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
    version: string | undefined;
    preview: boolean;
    // TODO: implement audience support in generateIR
    audiences: docsYml.RawSchemas.FernDocsConfig.AudiencesConfig | undefined;
    editThisPage: docsYml.RawSchemas.FernDocsConfig.EditThisPageConfig | undefined;
    isPrivate: boolean | undefined;
}): Promise<void> {
    const fdr = createFdrService({ token: token.value });

    const parsedDocsConfig = await docsYml.parseDocsConfiguration({
        rawDocsConfiguration: docsWorkspace.config,
        context,
        absolutePathToFernFolder: docsWorkspace.absoluteFilepath,
        absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig
    });

    // track all changelog markdown files in parsedDocsConfig.pages
    fernWorkspaces.forEach((workspace) => {
        if (workspace.changelog != null) {
            workspace.changelog.files.forEach((file) => {
                const filename = last(file.absoluteFilepath.split("/"));
                if (filename == null) {
                    return;
                }
                const relativePath = relative(docsWorkspace.absoluteFilepath, file.absoluteFilepath);
                parsedDocsConfig.pages[relativePath] = file.contents;
            });
        }
    });

    const mdxImageReferences: docsYml.ImageReference[] = [];

    // preprocess markdown files to extract image paths
    for (const [relativePath, markdown] of Object.entries(parsedDocsConfig.pages)) {
        const { filepaths, markdown: newMarkdown } = parseImagePaths(RelativeFilePath.of(relativePath), markdown);
        parsedDocsConfig.pages[RelativeFilePath.of(relativePath)] = newMarkdown;
        for (const filepath of filepaths) {
            mdxImageReferences.push(
                docsYml.convertImageReference({
                    rawImageReference: filepath,
                    absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig
                })
            );
        }
    }

    // images where sizes cannot be inferred are uploaded as normal files.
    // images where sizes can be inferred are also uploaded as normal files, but their sizes are submitted to the registry.
    const [imageFilepathsWithSizesToUpload, unsizedImageFilepathsToUpload] = await getImageFilepathsToUpload(
        parsedDocsConfig,
        mdxImageReferences
    );
    context.logger.debug(
        "Absolute filepaths of images to upload:",
        imageFilepathsWithSizesToUpload.map((image) => image.filePath).join(", ")
    );

    // unsizedImageFilepathsToUpload are tracked alongside normal non-image files
    const filepathsToUpload = Array.from(
        new Set([...getFilepathsToUpload(parsedDocsConfig), ...unsizedImageFilepathsToUpload])
    );
    context.logger.debug("Absolute filepaths to upload:", filepathsToUpload.join(", "));

    const relativeImageFilepathsWithSizesToUpload = Array.from(
        new Set(
            imageFilepathsWithSizesToUpload.map((imageFilePath) => ({
                ...imageFilePath,
                filePath: convertAbsoluteFilepathToFdrFilepath(imageFilePath.filePath, parsedDocsConfig)
            }))
        )
    );
    const relativeFilepathsToUpload = filepathsToUpload.map((filepath) =>
        convertAbsoluteFilepathToFdrFilepath(filepath, parsedDocsConfig)
    );
    context.logger.debug("Relative filepaths to upload: [", relativeFilepathsToUpload.join(", "));

    let urlToOutput = customDomains[0] ?? domain;
    let startDocsRegisterResponse;
    if (preview) {
        startDocsRegisterResponse = await fdr.docs.v2.write.startDocsPreviewRegister({
            orgId: organization,
            authConfig: isPrivate ? { type: "private", authType: "sso" } : { type: "public" },
            filepaths: relativeFilepathsToUpload,
            images: relativeImageFilepathsWithSizesToUpload
        });
        if (startDocsRegisterResponse.ok) {
            urlToOutput = startDocsRegisterResponse.body.previewUrl;
        }
    } else {
        startDocsRegisterResponse = await fdr.docs.v2.write.startDocsRegister({
            domain,
            customDomains,
            authConfig: isPrivate ? { type: "private", authType: "sso" } : { type: "public" },
            apiId: "",
            orgId: organization,
            filepaths: relativeFilepathsToUpload,
            images: relativeImageFilepathsWithSizesToUpload
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

    const collectedFileIds = new Map<RelativeFilePath, string>();

    await Promise.all([
        ...filepathsToUpload.map(async (filepathToUpload) => {
            const relativePath = convertAbsoluteFilepathToFdrFilepath(filepathToUpload, parsedDocsConfig);
            const uploadUrl = uploadUrls[relativePath];
            if (uploadUrl == null) {
                context.failAndThrow(`Failed to upload ${filepathToUpload}`, "Upload URL is missing");
            } else {
                try {
                    const mimeType = mime.lookup(filepathToUpload);
                    await axios.put(uploadUrl.uploadUrl, await readFile(filepathToUpload), {
                        headers: {
                            "Content-Type": mimeType === false ? "application/octet-stream" : mimeType
                        }
                    });
                    collectedFileIds.set(relativePath, uploadUrl.fileId);
                } catch (e) {
                    // file might not exist
                    context.failAndThrow(`Failed to upload ${filepathToUpload}`, e);
                }
            }
        }),
        ...imageFilepathsWithSizesToUpload.map(async ({ filePath: imageFilepathToUpload }) => {
            const relativePath = convertAbsoluteFilepathToFdrFilepath(imageFilepathToUpload, parsedDocsConfig);
            const uploadUrl = uploadUrls[relativePath];
            if (uploadUrl == null) {
                context.failAndThrow(`Failed to upload ${imageFilepathToUpload}`, "Upload URL is missing");
            } else {
                try {
                    const mimeType = mime.lookup(imageFilepathToUpload);
                    await axios.put(uploadUrl.uploadUrl, await readFile(imageFilepathToUpload), {
                        headers: {
                            "Content-Type": mimeType === false ? "application/octet-stream" : mimeType
                        }
                    });
                    collectedFileIds.set(relativePath, uploadUrl.fileId);
                } catch (e) {
                    // file might not exist
                    context.failAndThrow(`Failed to upload ${imageFilepathToUpload}`, e);
                }
            }
        })
    ]);

    // postprocess markdown files after uploading all images to replace the image paths in the markdown files with the fileIDs
    for (const [relativePath, markdown] of Object.entries(parsedDocsConfig.pages)) {
        parsedDocsConfig.pages[RelativeFilePath.of(relativePath)] = replaceImagePaths(markdown, collectedFileIds);
    }

    const registerDocsRequest = await constructRegisterDocsRequest({
        parsedDocsConfig,
        organization,
        fernWorkspaces,
        context,
        token,
        uploadUrls,
        version,
        editThisPage,
        absolutePathToFernFolder: docsWorkspace.absoluteFilepath
    });
    context.logger.debug("Calling registerDocs... ", JSON.stringify(registerDocsRequest, undefined, 4));
    const registerDocsResponse = await fdr.docs.v2.write.finishDocsRegister(docsRegistrationId, registerDocsRequest);
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

async function constructRegisterDocsRequest({
    parsedDocsConfig,
    organization,
    fernWorkspaces,
    context,
    token,
    uploadUrls,
    version,
    editThisPage,
    absolutePathToFernFolder
}: {
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    uploadUrls: Record<DocsV1Write.FilePath, DocsV1Write.FileS3UploadUrl>;
    version: string | undefined;
    editThisPage: docsYml.RawSchemas.EditThisPageConfig | undefined;
    absolutePathToFernFolder: AbsoluteFilePath;
}): Promise<DocsV2Write.RegisterDocsRequest> {
    const fullSlugs: Record<DocsV1Write.PageId, { fullSlug?: string }> = Object.fromEntries(
        Object.entries(parsedDocsConfig.pages).map(([pageId, pageContent]) => {
            const frontmatter = matter(pageContent);
            const fullSlug = frontmatter.data.slug;
            return [
                // the fullslug is "get" using the absolute path
                // TODO: make this more robust
                pageId.startsWith("/")
                    ? AbsoluteFilePath.of(pageId)
                    : convertFdrFilepathToAbsoluteFilepath(RelativeFilePath.of(pageId), parsedDocsConfig),
                { fullSlug }
            ];
        })
    );
    const convertedDocsConfiguration = await convertDocsConfiguration({
        parsedDocsConfig,
        organization,
        fernWorkspaces,
        context,
        token,
        uploadUrls,
        version,
        fullSlugs,
        absolutePathToFernFolder
    });
    let pages: Record<DocsV1Write.PageId, DocsV1Write.PageContent> = {
        ...entries({ ...parsedDocsConfig.pages }).reduce(
            (pages, [pageFilepath, pageContents]) => ({
                ...pages,
                [pageFilepath]: {
                    markdown: pageContents,
                    editThisPageUrl: createEditThisPageUrl(editThisPage, pageFilepath)
                }
            }),
            {}
        )
    };
    pages = Object.fromEntries(
        Object.entries(pages).map(([pageId, pageContent]) => {
            const references = getReferencedMarkdownFiles({
                content: pageContent.markdown,
                absoluteFilepath: pageId.startsWith("/")
                    ? AbsoluteFilePath.of(pageId)
                    : convertFdrFilepathToAbsoluteFilepath(RelativeFilePath.of(pageId), parsedDocsConfig)
            });
            let markdown = pageContent.markdown;
            for (const reference of references) {
                const referenceSlug = fullSlugs[reference.absolutePath]?.fullSlug;
                if (referenceSlug == null) {
                    context.logger.error(`${reference.path} has no slug defined but is referenced by ${pageId}.`);
                    continue;
                }

                markdown = markdown.replace(reference.path, referenceSlug);
            }
            return [pageId, { markdown, editThisPageUrl: pageContent.editThisPageUrl }];
        })
    );
    return {
        docsDefinition: {
            pages,
            config: convertedDocsConfiguration.config
        }
    };
}

function createEditThisPageUrl(
    editThisPage: docsYml.RawSchemas.FernDocsConfig.EditThisPageConfig | undefined,
    pageFilepath: string
): string | undefined {
    if (editThisPage?.github == null) {
        return undefined;
    }

    const { owner, repo, branch = "main", host = "https://github.com" } = editThisPage.github;

    return `${wrapWithHttps(host)}/${owner}/${repo}/blob/${branch}/fern/${pageFilepath}`;
}

interface ConvertedDocsConfiguration {
    config: Omit<WithoutQuestionMarks<DocsV1Write.DocsConfig>, "logo" | "colors" | "typography" | "colorsV2">;
}

async function convertDocsConfiguration({
    parsedDocsConfig,
    organization,
    fernWorkspaces,
    context,
    token,
    uploadUrls,
    version,
    fullSlugs,
    absolutePathToFernFolder
}: {
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    uploadUrls: Record<DocsV1Write.FilePath, DocsV1Write.FileS3UploadUrl>;
    version: string | undefined;
    fullSlugs: Record<DocsV1Write.PageId, { fullSlug?: string }>;
    absolutePathToFernFolder: AbsoluteFilePath;
}): Promise<ConvertedDocsConfiguration> {
    const convertedNavigation = await convertNavigationConfig({
        navigationConfig: parsedDocsConfig.navigation,
        tabs: parsedDocsConfig.tabs,
        parsedDocsConfig,
        organization,
        fernWorkspaces,
        context,
        token,
        version,
        fullSlugs,
        absolutePathToFernFolder
    });
    const config: ConvertedDocsConfiguration["config"] = {
        title: parsedDocsConfig.title,
        // deprecated, use colorsV3 instead of logoV2
        logoV2: undefined,
        logoHeight: parsedDocsConfig.logo?.height,
        logoHref: parsedDocsConfig.logo?.href,
        favicon: convertImageReference({
            imageReference: parsedDocsConfig.favicon,
            parsedDocsConfig,
            uploadUrls,
            context
        }),
        // deprecated, use colorsV3 instead of backgroundImage
        backgroundImage: undefined,
        navigation: convertedNavigation.config,
        colorsV3: convertColorConfigImageReferences({ parsedDocsConfig, uploadUrls, context }),
        navbarLinks: parsedDocsConfig.navbarLinks,
        typographyV2: convertDocsTypographyConfiguration({
            typographyConfiguration: parsedDocsConfig.typography,
            parsedDocsConfig,
            uploadUrls,
            context,
            fullSlugs
        }),
        layout: parsedDocsConfig.layout,
        css: parsedDocsConfig.css,
        js: convertJavascriptConfiguration(parsedDocsConfig.js, uploadUrls, parsedDocsConfig)
    };
    return { config };
}

interface ConvertedNavigationConfig {
    config: DocsV1Write.NavigationConfig;
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
    fullSlugs,
    absolutePathToFernFolder
}: {
    navigationConfig: docsYml.DocsNavigationConfiguration;
    tabs?: Record<string, docsYml.RawSchemas.TabConfig>;
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    version: string | undefined;
    fullSlugs: Record<DocsV1Write.PageId, { fullSlug?: string }>;
    absolutePathToFernFolder: AbsoluteFilePath;
}): Promise<ConvertedNavigationConfig> {
    let config: DocsV1Write.NavigationConfig;
    switch (navigationConfig.type) {
        case "untabbed": {
            const untabbedItems = await Promise.all(
                navigationConfig.items.map((item) =>
                    convertNavigationItem({
                        item,
                        parsedDocsConfig,
                        organization,
                        fernWorkspaces,
                        context,
                        token,
                        version,
                        fullSlugs,
                        absolutePathToFernFolder
                    })
                )
            );
            config = {
                items: untabbedItems.map((item) => item.item)
            };
            break;
        }
        case "tabbed": {
            const tabbedItem = await convertTabbedNavigation(navigationConfig.items, tabs, {
                parsedDocsConfig,
                organization,
                fernWorkspaces,
                context,
                token,
                version,
                fullSlugs,
                absolutePathToFernFolder
            });
            config = {
                tabs: tabbedItem.tabs
            };
            break;
        }
        case "versioned":
            config = {
                versions: await Promise.all(
                    navigationConfig.versions.map(
                        async (version): Promise<DocsV1Write.VersionedNavigationConfigData> => {
                            const convertedNavigation = await convertUnversionedNavigationConfig({
                                navigationConfig: version.navigation,
                                tabs: version.tabs,
                                parsedDocsConfig,
                                organization,
                                fernWorkspaces,
                                context,
                                token,
                                version: version.version,
                                fullSlugs,
                                absolutePathToFernFolder
                            });
                            return {
                                version: version.version,
                                config: convertedNavigation.config,
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
            break;
        default:
            assertNever(navigationConfig);
    }
    return { config };
}

function convertAvailability(availability: docsYml.RawSchemas.VersionAvailability): DocsV1Write.VersionAvailability {
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

interface ConvertedUnversionedNavigationConfig {
    config: DocsV1Write.UnversionedNavigationConfig;
}

async function convertUnversionedNavigationConfig({
    navigationConfig,
    tabs,
    parsedDocsConfig,
    organization,
    fernWorkspaces,
    context,
    token,
    version,
    fullSlugs,
    absolutePathToFernFolder
}: {
    navigationConfig: docsYml.UnversionedNavigationConfiguration;
    tabs?: Record<string, docsYml.RawSchemas.TabConfig>;
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    version: string | undefined;
    fullSlugs: Record<DocsV1Write.PageId, { fullSlug?: string }>;
    absolutePathToFernFolder: AbsoluteFilePath;
}): Promise<ConvertedUnversionedNavigationConfig> {
    let config: DocsV1Write.UnversionedNavigationConfig;
    switch (navigationConfig.type) {
        case "untabbed": {
            const untabbedItems = await Promise.all(
                navigationConfig.items.map((item) =>
                    convertNavigationItem({
                        item,
                        parsedDocsConfig,
                        organization,
                        fernWorkspaces,
                        context,
                        token,
                        version,
                        fullSlugs,
                        absolutePathToFernFolder
                    })
                )
            );
            config = {
                items: untabbedItems.map((item) => item.item)
            };
            break;
        }
        case "tabbed": {
            const tabbedItem = await convertTabbedNavigation(navigationConfig.items, tabs, {
                parsedDocsConfig,
                organization,
                fernWorkspaces,
                context,
                token,
                version,
                fullSlugs,
                absolutePathToFernFolder
            });
            config = {
                tabs: tabbedItem.tabs
            };
            break;
        }
        default:
            assertNever(navigationConfig);
    }
    return { config };
}

async function convertTabbedNavigation(
    items: docsYml.TabbedNavigation[],
    tabs: Record<string, docsYml.RawSchemas.TabConfig> | undefined,
    {
        parsedDocsConfig,
        organization,
        fernWorkspaces,
        context,
        token,
        version,
        fullSlugs,
        absolutePathToFernFolder
    }: {
        parsedDocsConfig: docsYml.ParsedDocsConfiguration;
        organization: string;
        fernWorkspaces: FernWorkspace[];
        context: TaskContext;
        token: FernToken;
        version: string | undefined;
        fullSlugs: Record<DocsV1Write.PageId, { fullSlug?: string }>;
        absolutePathToFernFolder: AbsoluteFilePath;
    }
): Promise<{ tabs: DocsV1Write.NavigationTab[] }> {
    const convertedTabs = await Promise.all(
        items.map(async (tabbedItem) => {
            const tabConfig = tabs?.[tabbedItem.tab];
            if (tabConfig == null) {
                throw new Error(`Couldn't find config for tab id ${tabbedItem.tab}`);
            }

            if (tabConfig.href != null) {
                if (tabbedItem.layout != null) {
                    throw new Error(
                        `Tab ${tabConfig.displayName} contains an external link (href), and should not have any items`
                    );
                }

                return {
                    title: tabConfig.displayName,
                    icon: tabConfig.icon,
                    url: tabConfig.href
                };
            }

            if (tabbedItem.layout == null) {
                throw new Error(
                    `Tab ${tabConfig.displayName} does not contain an external link (href), and should have items`
                );
            }

            const tabbedItems = await Promise.all(
                tabbedItem.layout.map((item) =>
                    convertNavigationItem({
                        item,
                        parsedDocsConfig,
                        organization,
                        fernWorkspaces,
                        context,
                        token,
                        version,
                        fullSlugs,
                        absolutePathToFernFolder
                    })
                )
            );

            return {
                title: tabConfig.displayName,
                icon: tabConfig.icon,
                items: tabbedItems.map((tabItem) => tabItem.item),
                urlSlugOverride: tabConfig.slug
            };
        })
    );
    return { tabs: convertedTabs };
}

function convertDocsTypographyConfiguration({
    typographyConfiguration,
    parsedDocsConfig,
    uploadUrls,
    context,
    fullSlugs
}: {
    typographyConfiguration?: docsYml.TypographyConfig;
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    uploadUrls: Record<DocsV1Write.FilePath, DocsV1Write.FileS3UploadUrl>;
    context: TaskContext;
    fullSlugs: Record<DocsV1Write.PageId, { fullSlug?: string }>;
}): DocsV1Write.DocsTypographyConfigV2 | undefined {
    if (typographyConfiguration == null) {
        return;
    }
    return {
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
}

function convertJavascriptConfiguration(
    jsConfiguration: docsYml.JavascriptConfig | undefined,
    uploadUrls: Record<DocsV1Write.FilePath, DocsV1Write.FileS3UploadUrl>,
    parsedDocsConfig: docsYml.ParsedDocsConfiguration
): DocsV1Write.JsConfig | undefined {
    if (jsConfiguration == null) {
        return;
    }
    return {
        files: jsConfiguration.files
            .map(({ absolutePath, strategy }) => {
                const filepath = convertAbsoluteFilepathToFdrFilepath(absolutePath, parsedDocsConfig);
                const file = uploadUrls[filepath];
                if (file == null) {
                    return;
                }
                return {
                    fileId: file.fileId,
                    strategy
                };
            })
            .filter(isNonNullish)
    };
}

function convertFont({
    font,
    parsedDocsConfig,
    uploadUrls,
    context,
    label
}: {
    font: docsYml.FontConfig | undefined;
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    uploadUrls: Record<DocsV1Write.FilePath, DocsV1Write.FileS3UploadUrl>;
    context: TaskContext;
    label: string;
}): DocsV1Write.FontConfigV2 | undefined {
    if (font == null) {
        return;
    }

    if (font.variants[0] == null) {
        return;
    }

    const filepath = convertAbsoluteFilepathToFdrFilepath(font.variants[0].absolutePath, parsedDocsConfig);

    const file = uploadUrls[filepath];
    if (file == null) {
        return context.failAndThrow(`Failed to locate ${label} font file after uploading`);
    }

    return {
        type: "custom",
        name: font.name ?? `font:${label}:${file.fileId}`,
        variants: font.variants.map((variant) => {
            const filepath = convertAbsoluteFilepathToFdrFilepath(variant.absolutePath, parsedDocsConfig);
            const file = uploadUrls[filepath];
            if (file == null) {
                return context.failAndThrow(`Failed to locate ${label} font file after uploading`);
            }
            return {
                fontFile: file.fileId,
                weight: variant.weight,
                style: variant.style != null ? [variant.style] : undefined
            };
        }),
        display: font.display,
        fallback: font.fallback,
        fontVariationSettings: font.fontVariationSettings
    };
}

function convertColorConfigImageReferences({
    parsedDocsConfig,
    uploadUrls,
    context
}: {
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    uploadUrls: Record<DocsV1Write.FilePath, DocsV1Write.FileS3UploadUrl>;
    context: TaskContext;
}): DocsV1Write.ColorsConfigV3 | undefined {
    const { colors } = parsedDocsConfig;
    if (colors == null) {
        return undefined;
    }
    if (colors.type === "dark") {
        return {
            ...colors,
            ...convertLogoAndBackgroundImage({
                parsedDocsConfig,
                uploadUrls,
                context,
                theme: "dark"
            })
        };
    } else if (colors.type === "light") {
        return {
            ...colors,
            ...convertLogoAndBackgroundImage({
                parsedDocsConfig,
                uploadUrls,
                context,
                theme: "light"
            })
        };
    } else {
        return {
            ...colors,
            dark: {
                ...colors.dark,
                ...convertLogoAndBackgroundImage({
                    parsedDocsConfig,
                    uploadUrls,
                    context,
                    theme: "dark"
                })
            },
            light: {
                ...colors.light,
                ...convertLogoAndBackgroundImage({
                    parsedDocsConfig,
                    uploadUrls,
                    context,
                    theme: "light"
                })
            }
        };
    }
}

function convertLogoAndBackgroundImage({
    parsedDocsConfig,
    uploadUrls,
    context,
    theme
}: {
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    uploadUrls: Record<DocsV1Write.FilePath, DocsV1Write.FileS3UploadUrl>;
    context: TaskContext;
    theme: "dark" | "light";
}) {
    const { logo, backgroundImage } = parsedDocsConfig;
    const logoRef = logo?.[theme];
    const backgroundImageRef = backgroundImage?.[theme];
    return {
        logo: convertImageReference({
            imageReference: logoRef,
            parsedDocsConfig,
            uploadUrls,
            context
        }),
        backgroundImage: convertImageReference({
            imageReference: backgroundImageRef,
            parsedDocsConfig,
            uploadUrls,
            context
        })
    };
}

function convertImageReference({
    imageReference,
    parsedDocsConfig,
    uploadUrls,
    context
}: {
    imageReference: docsYml.ImageReference | undefined;
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    uploadUrls: Record<DocsV1Write.FilePath, DocsV1Write.FileS3UploadUrl>;
    context: TaskContext;
}): DocsV1Write.FileId | undefined {
    if (imageReference == null) {
        return undefined;
    }
    const filepath = convertAbsoluteFilepathToFdrFilepath(imageReference.filepath, parsedDocsConfig);
    const file = uploadUrls[filepath];
    if (file == null) {
        return context.failAndThrow("Failed to locate file after uploading");
    }
    return file.fileId;
}

interface ConvertedNavigationItem {
    item: DocsV1Write.NavigationItem;
}

async function convertNavigationItem({
    item,
    parsedDocsConfig,
    organization,
    fernWorkspaces,
    context,
    token,
    version,
    fullSlugs,
    absolutePathToFernFolder
}: {
    item: docsYml.DocsNavigationItem;
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    organization: string;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    token: FernToken;
    version: string | undefined;
    fullSlugs: Record<DocsV1Write.PageId, { fullSlug?: string }>;
    absolutePathToFernFolder: AbsoluteFilePath;
}): Promise<ConvertedNavigationItem> {
    let convertedItem: DocsV1Write.NavigationItem;
    switch (item.type) {
        case "page": {
            convertedItem = {
                type: "page",
                title: item.title,
                icon: item.icon,
                id: relative(dirname(parsedDocsConfig.absoluteFilepath), item.absolutePath),
                urlSlugOverride: item.slug,
                fullSlug: fullSlugs[item.absolutePath]?.fullSlug?.split("/"),
                hidden: item.hidden
            };
            break;
        }
        case "section": {
            const sectionItems = await Promise.all(
                item.contents.map((nestedItem) =>
                    convertNavigationItem({
                        item: nestedItem,
                        parsedDocsConfig,
                        organization,
                        fernWorkspaces,
                        context,
                        token,
                        version,
                        fullSlugs,
                        absolutePathToFernFolder
                    })
                )
            );
            convertedItem = {
                type: "section",
                title: item.title,
                items: sectionItems.map((sectionItem) => sectionItem.item),
                urlSlugOverride: item.slug,
                collapsed: item.collapsed,
                icon: item.icon,
                hidden: item.hidden,
                skipUrlSlug: item.skipUrlSlug
            };
            break;
        }
        case "apiSection": {
            const workspace = getFernWorkspaceForApiSection({ apiSection: item, fernWorkspaces });
            const { id: apiDefinitionId, ir } = await registerApi({
                organization,
                workspace,
                context,
                token,
                audiences: item.audiences,
                // navigation: item.navigation,
                snippetsConfig: convertDocsSnippetsConfigurationToFdr({
                    snippetsConfiguration: item.snippetsConfiguration ?? {
                        python: undefined,
                        typescript: undefined,
                        go: undefined,
                        java: undefined
                    }
                })
            });
            const changelogItems: DocsV1Write.ChangelogItem[] = [];
            if (workspace.changelog != null) {
                for (const file of workspace.changelog.files) {
                    const filename = last(file.absoluteFilepath.split("/"));
                    if (filename == null) {
                        continue;
                    }
                    const changelogDate = extractDatetimeFromChangelogTitle(filename);
                    if (changelogDate == null) {
                        continue;
                    }
                    const relativePath = relative(absolutePathToFernFolder, file.absoluteFilepath);
                    changelogItems.push({
                        date: changelogDate.toISOString(),
                        pageId: relativePath
                    });
                }
            }
            convertedItem = {
                type: "api",
                title: item.title,
                icon: item.icon,
                api: apiDefinitionId,
                urlSlugOverride: item.slug,
                skipUrlSlug: item.skipUrlSlug,
                showErrors: item.showErrors,
                changelog:
                    changelogItems.length > 0
                        ? {
                              urlSlug: "changelog",
                              items: changelogItems
                          }
                        : undefined,
                hidden: item.hidden,
                navigation: convertIrToNavigation(
                    ir,
                    item.summaryAbsolutePath,
                    item.navigation,
                    parsedDocsConfig.absoluteFilepath,
                    fullSlugs
                ),
                flattened: item.flattened
            };
            break;
        }
        case "link": {
            convertedItem = {
                type: "link",
                title: item.text,
                url: item.url
            };
            break;
        }
        default:
            assertNever(item);
    }
    return {
        item: convertedItem
    };
}

function convertDocsSnippetsConfigurationToFdr({
    snippetsConfiguration
}: {
    snippetsConfiguration: docsYml.RawSchemas.SnippetsConfiguration;
}): APIV1Write.SnippetsConfig {
    return {
        pythonSdk:
            snippetsConfiguration.python != null
                ? {
                      package:
                          typeof snippetsConfiguration.python === "string"
                              ? snippetsConfiguration.python
                              : snippetsConfiguration.python.package,
                      version:
                          typeof snippetsConfiguration.python === "string"
                              ? undefined
                              : snippetsConfiguration.python.version
                  }
                : undefined,
        typescriptSdk:
            snippetsConfiguration.typescript != null
                ? {
                      package:
                          typeof snippetsConfiguration.typescript === "string"
                              ? snippetsConfiguration.typescript
                              : snippetsConfiguration.typescript.package,
                      version:
                          typeof snippetsConfiguration.typescript === "string"
                              ? undefined
                              : snippetsConfiguration.typescript.version
                  }
                : undefined,
        goSdk:
            snippetsConfiguration.go != null
                ? {
                      githubRepo:
                          typeof snippetsConfiguration.go === "string"
                              ? snippetsConfiguration.go
                              : snippetsConfiguration.go.package,
                      version:
                          typeof snippetsConfiguration.go === "string" ? undefined : snippetsConfiguration.go.version
                  }
                : undefined,
        javaSdk:
            snippetsConfiguration.java != null
                ? {
                      coordinate:
                          typeof snippetsConfiguration.java === "string"
                              ? snippetsConfiguration.java
                              : snippetsConfiguration.java.package,
                      version:
                          typeof snippetsConfiguration.java === "string"
                              ? undefined
                              : snippetsConfiguration.java.version
                  }
                : undefined
    };
}

function getFernWorkspaceForApiSection({
    apiSection,
    fernWorkspaces
}: {
    apiSection: docsYml.DocsNavigationItem.ApiSection;
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

const sizeOf = promisify(imageSize);

interface ImageFileAbsoluteFilePath {
    type: "filepath";
    value: AbsoluteFilePath;
}
function isFilePath(imageFile: ImageFile): imageFile is ImageFileAbsoluteFilePath {
    return imageFile.type === "filepath";
}

interface ImageFileMetadata {
    type: "image";
    value: AbsoluteImageFilePath;
}
function isImage(imageFile: ImageFile): imageFile is ImageFileMetadata {
    return imageFile.type === "image";
}

type ImageFile = ImageFileAbsoluteFilePath | ImageFileMetadata;

interface AbsoluteImageFilePath {
    filePath: AbsoluteFilePath;
    width: number;
    height: number;
    blurDataUrl: string | undefined;
}

async function getImageFilepathsToUpload(
    parsedDocsConfig: docsYml.ParsedDocsConfiguration,
    parsedImagePaths: docsYml.ImageReference[]
): Promise<[AbsoluteImageFilePath[], AbsoluteFilePath[]]> {
    const filepaths = new Set<AbsoluteFilePath>();

    if (parsedDocsConfig.logo?.dark != null) {
        filepaths.add(parsedDocsConfig.logo.dark.filepath);
    }

    if (
        parsedDocsConfig.logo?.light != null &&
        // if the light and dark images are the same, we don't need to re-upload the light image
        parsedDocsConfig.logo.dark?.filepath !== parsedDocsConfig.logo.light.filepath
    ) {
        filepaths.add(parsedDocsConfig.logo.light.filepath);
    }

    if (parsedDocsConfig.favicon != null) {
        filepaths.add(parsedDocsConfig.favicon.filepath);
    }

    if (parsedDocsConfig.backgroundImage?.dark != null) {
        filepaths.add(parsedDocsConfig.backgroundImage.dark.filepath);
    }

    if (
        parsedDocsConfig.backgroundImage?.light != null &&
        // if the light and dark images are the same, we don't need to re-upload the light image
        parsedDocsConfig.backgroundImage.dark?.filepath !== parsedDocsConfig.backgroundImage.light.filepath
    ) {
        filepaths.add(parsedDocsConfig.backgroundImage.light.filepath);
    }

    for (const parsedImagePath of parsedImagePaths) {
        filepaths.add(parsedImagePath.filepath);
    }

    const imageFilepathsAndSizesToUpload = await Promise.all(
        [...filepaths].map(async (filePath): Promise<ImageFile> => {
            try {
                const size = await sizeOf(filePath);
                if (size == null || size.height == null || size.width == null) {
                    return { type: "filepath", value: filePath };
                }
                return {
                    type: "image",
                    value: { filePath, width: size.width, height: size.height, blurDataUrl: undefined }
                };
            } catch (e) {
                return { type: "filepath", value: filePath };
            }
        })
    );

    const imagesWithSize = imageFilepathsAndSizesToUpload.filter(isImage).map((image) => image.value);
    const imagesWithoutSize = imageFilepathsAndSizesToUpload.filter(isFilePath).map((image) => image.value);

    return [imagesWithSize, imagesWithoutSize];
}

function getFilepathsToUpload(parsedDocsConfig: docsYml.ParsedDocsConfiguration): AbsoluteFilePath[] {
    const filepaths: AbsoluteFilePath[] = [];

    const typographyConfiguration = parsedDocsConfig.typography;

    typographyConfiguration?.headingsFont?.variants.forEach((variant) => {
        filepaths.push(variant.absolutePath);
    });

    typographyConfiguration?.bodyFont?.variants.forEach((variant) => {
        filepaths.push(variant.absolutePath);
    });

    typographyConfiguration?.codeFont?.variants.forEach((variant) => {
        filepaths.push(variant.absolutePath);
    });

    parsedDocsConfig.js?.files.forEach((file) => {
        filepaths.push(file.absolutePath);
    });

    return filepaths;
}

function convertAbsoluteFilepathToFdrFilepath(
    filepath: AbsoluteFilePath,
    parsedDocsConfig: docsYml.ParsedDocsConfiguration
) {
    return relative(dirname(parsedDocsConfig.absoluteFilepath), filepath);
}

function convertFdrFilepathToAbsoluteFilepath(
    filepath: RelativeFilePath,
    parsedDocsConfig: docsYml.ParsedDocsConfiguration
) {
    return join(dirname(parsedDocsConfig.absoluteFilepath), filepath);
}

function wrapWithHttps(url: string): string {
    return url.startsWith("https://") || url.startsWith("http://") ? url : `https://${url}`;
}
