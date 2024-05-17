import { docsYml, WithoutQuestionMarks } from "@fern-api/configuration";
import { assertNever, isNonNullish, visitDiscriminatedUnion } from "@fern-api/core-utils";
import { APIV1Write, DocsV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, relative, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import matter from "gray-matter";
import { last, orderBy } from "lodash-es";
import urlJoin from "url-join";
import { extractDatetimeFromChangelogTitle } from "../extractDatetimeFromChangelogTitle";
import { wrapWithHttps } from "../wrapWithHttps";
import { convertDocsSnippetsConfigToFdr } from "./convertDocsSnippetsConfigToFdr";
import { convertIrToNavigation } from "./convertIrToNavigation";
import { collectFilesFromDocsConfig } from "./getImageFilepathsToUpload";
import { parseImagePaths, replaceImagePathsAndUrls } from "./parseImagePaths";

export interface FilePathPair {
    absoluteFilePath: AbsoluteFilePath;
    relativeFilePath: RelativeFilePath;
}

export interface UploadedFile extends FilePathPair {
    fileId: string;
}

export class DocsDefinitionResolver {
    constructor(
        private docsWorkspace: DocsWorkspace,
        private fernWorkspaces: FernWorkspace[],
        private taskContext: TaskContext,
        private editThisPage: docsYml.RawSchemas.EditThisPageConfig | undefined,
        private uploadFiles: (files: FilePathPair[]) => Promise<UploadedFile[]>,
        private registerApi: (opts: {
            ir: IntermediateRepresentation;
            snippetsConfig: APIV1Write.SnippetsConfig;
        }) => Promise<string>
    ) {}

    private _parsedDocsConfig: WithoutQuestionMarks<docsYml.ParsedDocsConfiguration> | undefined;
    private get parsedDocsConfig(): WithoutQuestionMarks<docsYml.ParsedDocsConfiguration> {
        if (this._parsedDocsConfig == null) {
            throw new Error("parsedDocsConfig is not set");
        }
        return this._parsedDocsConfig;
    }
    private collectedFileIds = new Map<AbsoluteFilePath, string>();
    private markdownFilesToFullSlugs: Map<AbsoluteFilePath, string> = new Map();
    public async resolve(): Promise<DocsV1Write.DocsDefinition> {
        this._parsedDocsConfig = await docsYml.parseDocsConfiguration({
            rawDocsConfiguration: this.docsWorkspace.config,
            context: this.taskContext,
            absolutePathToFernFolder: this.docsWorkspace.absoluteFilepath,
            absoluteFilepathToDocsConfig: this.docsWorkspace.absoluteFilepathToDocsConfig
        });

        // track all changelog markdown files in parsedDocsConfig.pages
        this.fernWorkspaces.forEach((workspace) => {
            workspace.changelog?.files.forEach((file) => {
                const relativePath = relative(this.docsWorkspace.absoluteFilepath, file.absoluteFilepath);
                this.parsedDocsConfig.pages[relativePath] = file.contents;
            });
        });

        // create a map of markdown files to their URL pathnames
        // this will be used to resolve relative markdown links to their final URLs
        this.markdownFilesToFullSlugs = this.getMarkdownFilesToFullSlugs(this.parsedDocsConfig.pages);

        const filesToUploadSet = collectFilesFromDocsConfig(this.parsedDocsConfig);

        // preprocess markdown files to extract image paths
        for (const [relativePath, markdown] of Object.entries(this.parsedDocsConfig.pages)) {
            const { filepaths, markdown: newMarkdown } = parseImagePaths(markdown, {
                absolutePathToMdx: this.resolveFilepath(relativePath),
                absolutePathToFernFolder: this.docsWorkspace.absoluteFilepath
            });

            // store the updated markdown in pages
            this.parsedDocsConfig.pages[RelativeFilePath.of(relativePath)] = newMarkdown;

            // store the image filepaths to upload
            for (const filepath of filepaths) {
                filesToUploadSet.add(this.resolveFilepath(filepath));
            }
        }

        const filesToUpload: FilePathPair[] = Array.from(filesToUploadSet).map(
            (absoluteFilePath): FilePathPair => ({
                absoluteFilePath,
                relativeFilePath: this.toRelativeFilepath(absoluteFilePath)
            })
        );

        const uploadedFiles = await this.uploadFiles(filesToUpload);

        uploadedFiles.forEach((uploadedFile) => {
            this.collectedFileIds.set(uploadedFile.absoluteFilePath, uploadedFile.fileId);
        });

        // postprocess markdown files after uploading all images to replace the image paths in the markdown files with the fileIDs
        const basePath = this.getDocsBasePath() ?? "/";
        for (const [relativePath, markdown] of Object.entries(this.parsedDocsConfig.pages)) {
            this.parsedDocsConfig.pages[RelativeFilePath.of(relativePath)] = replaceImagePathsAndUrls(
                markdown,
                this.collectedFileIds,
                // convert slugs to full URL pathnames
                new Map(
                    Array.from(this.markdownFilesToFullSlugs.entries()).map(([key, value]) => {
                        return [key, urlJoin(basePath, value)];
                    })
                ),
                {
                    absolutePathToMdx: this.resolveFilepath(relativePath),
                    absolutePathToFernFolder: this.docsWorkspace.absoluteFilepath
                },
                this.taskContext
            );
        }

        const pages: Record<DocsV1Write.PageId, DocsV1Write.PageContent> = {};

        Object.entries(this.parsedDocsConfig.pages).forEach(([relativePageFilepath, markdown]) => {
            pages[relativePageFilepath] = {
                markdown,
                editThisPageUrl: createEditThisPageUrl(this.editThisPage, relativePageFilepath)
            };
        });

        const config = await this.convertDocsConfiguration();

        return { config, pages };
    }

    private resolveFilepath(unresolvedFilepath: string): AbsoluteFilePath;
    private resolveFilepath(unresolvedFilepath: string | undefined): AbsoluteFilePath | undefined;
    private resolveFilepath(unresolvedFilepath: string | undefined): AbsoluteFilePath | undefined {
        if (unresolvedFilepath == null) {
            return undefined;
        }
        return resolve(this.docsWorkspace.absoluteFilepath, unresolvedFilepath);
    }

    private toRelativeFilepath(filepath: AbsoluteFilePath): RelativeFilePath {
        return relative(this.docsWorkspace.absoluteFilepath, filepath);
    }

    // currently this only supports slugs that are included in frontmatter
    // TODO: import @fern-ui/fdr-utils to resolve all slugs
    private getMarkdownFilesToFullSlugs(pages: Record<RelativeFilePath, string>): Map<AbsoluteFilePath, string> {
        const mdxFilePathToSlug = new Map<AbsoluteFilePath, string>();
        for (const [relativePath, markdown] of Object.entries(pages)) {
            const frontmatter = matter(markdown);
            const slug = frontmatter.data.slug;
            if (typeof slug === "string" && slug.trim().length > 0) {
                mdxFilePathToSlug.set(this.resolveFilepath(relativePath), slug.trim());
            }
        }
        return mdxFilePathToSlug;
    }

    private getDocsBasePath(): string | undefined {
        const instanceUrl = this.docsWorkspace.config.instances[0]?.url;

        if (instanceUrl == null) {
            return undefined;
        }

        const url = new URL(wrapWithHttps(instanceUrl));
        return url.pathname;
    }

    private async convertDocsConfiguration(): Promise<DocsV1Write.DocsConfig> {
        const convertedNavigation = await this.convertNavigationConfig();
        const config: WithoutQuestionMarks<DocsV1Write.DocsConfig> = {
            title: this.parsedDocsConfig.title,
            logoHeight: this.parsedDocsConfig.logo?.height,
            logoHref: this.parsedDocsConfig.logo?.href,
            favicon: this.getFileId(this.parsedDocsConfig.favicon),
            navigation: convertedNavigation,
            colorsV3: this.convertColorConfigImageReferences(),
            navbarLinks: this.parsedDocsConfig.navbarLinks,
            typographyV2: this.convertDocsTypographyConfiguration(),
            layout: this.parsedDocsConfig.layout,
            css: this.parsedDocsConfig.css,
            js: this.convertJavascriptConfiguration(),
            metadata: this.convertMetadata(),
            redirects: this.parsedDocsConfig.redirects,
            integrations: this.parsedDocsConfig.integrations,
            footerLinks: this.parsedDocsConfig.footerLinks,

            // deprecated
            logo: undefined,
            logoV2: undefined,
            colors: undefined,
            colorsV2: undefined,
            typography: undefined,
            backgroundImage: undefined
        };
        return config;
    }

    private getFernWorkspaceForApiSection(apiSection: docsYml.DocsNavigationItem.ApiSection): FernWorkspace {
        if (this.fernWorkspaces.length === 1 && this.fernWorkspaces[0] != null) {
            return this.fernWorkspaces[0];
        } else if (apiSection.apiName != null) {
            const fernWorkspace = this.fernWorkspaces.find((workspace) => {
                return workspace.workspaceName === apiSection.apiName;
            });
            if (fernWorkspace != null) {
                return fernWorkspace;
            }
        }
        throw new Error("Failed to load API Definition referenced in docs");
    }

    private async convertNavigationConfig(): Promise<DocsV1Write.NavigationConfig> {
        switch (this.parsedDocsConfig.navigation.type) {
            case "untabbed": {
                const items = await Promise.all(
                    this.parsedDocsConfig.navigation.items.map((item) => this.convertNavigationItem(item))
                );
                return { items };
            }
            case "tabbed": {
                return this.convertTabbedNavigation(this.parsedDocsConfig.navigation.items, this.parsedDocsConfig.tabs);
            }
            case "versioned":
                const versions = await Promise.all(
                    this.parsedDocsConfig.navigation.versions.map(
                        async (version): Promise<DocsV1Write.VersionedNavigationConfigData> => {
                            const convertedNavigation = await this.convertUnversionedNavigationConfig({
                                navigationConfig: version.navigation,
                                tabs: version.tabs,
                                version: version.version
                            });
                            return {
                                version: version.version,
                                config: convertedNavigation,
                                availability:
                                    version.availability != null
                                        ? convertAvailability(version.availability)
                                        : undefined,
                                urlSlugOverride: version.slug
                            };
                        }
                    )
                );
                return { versions };
            default:
                assertNever(this.parsedDocsConfig.navigation);
        }
    }

    private async convertNavigationItem(item: docsYml.DocsNavigationItem): Promise<DocsV1Write.NavigationItem> {
        switch (item.type) {
            case "page": {
                return {
                    type: "page",
                    title: item.title,
                    icon: item.icon,
                    id: this.toRelativeFilepath(item.absolutePath),
                    urlSlugOverride: item.slug,
                    fullSlug: this.markdownFilesToFullSlugs.get(item.absolutePath)?.split("/"),
                    hidden: item.hidden
                };
            }
            case "section": {
                const sectionItems = await Promise.all(
                    item.contents.map((nestedItem) => this.convertNavigationItem(nestedItem))
                );
                return {
                    type: "section",
                    title: item.title,
                    items: sectionItems,
                    urlSlugOverride: item.slug,
                    collapsed: item.collapsed,
                    icon: item.icon,
                    hidden: item.hidden,
                    skipUrlSlug: item.skipUrlSlug
                };
            }
            case "apiSection": {
                const workspace = this.getFernWorkspaceForApiSection(item);
                const snippetsConfig = convertDocsSnippetsConfigToFdr(item.snippetsConfiguration);
                const ir = await generateIntermediateRepresentation({
                    workspace,
                    audiences: item.audiences,
                    generationLanguage: undefined,
                    smartCasing: false,
                    disableExamples: false
                });
                const apiDefinitionId = await this.registerApi({ ir, snippetsConfig });
                const unsortedChangelogItems: { date: Date; pageId: RelativeFilePath }[] = [];
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
                        const relativePath = this.toRelativeFilepath(file.absoluteFilepath);
                        unsortedChangelogItems.push({ date: changelogDate, pageId: relativePath });
                    }
                }

                // sort changelog items by date, in descending order
                const changelogItems = orderBy(unsortedChangelogItems, (item) => item.date, "desc").map(
                    (item): DocsV1Write.ChangelogItem => ({
                        date: item.date.toISOString(),
                        pageId: item.pageId
                    })
                );

                return {
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
                        this.docsWorkspace.absoluteFilepathToDocsConfig,
                        this.markdownFilesToFullSlugs
                    ),
                    flattened: item.flattened
                };
            }
            case "link": {
                return {
                    type: "link",
                    title: item.text,
                    url: item.url
                };
            }
            default:
                assertNever(item);
        }
    }

    private async convertUnversionedNavigationConfig({
        navigationConfig,
        tabs,
        version
    }: {
        navigationConfig: docsYml.UnversionedNavigationConfiguration;
        tabs: Record<string, docsYml.RawSchemas.TabConfig> | undefined;
        version: string;
    }): Promise<DocsV1Write.UnversionedNavigationConfig> {
        switch (navigationConfig.type) {
            case "untabbed": {
                const untabbedItems = await Promise.all(
                    navigationConfig.items.map((item) => this.convertNavigationItem(item))
                );
                return {
                    items: untabbedItems
                };
            }
            case "tabbed": {
                const tabbedItem = await this.convertTabbedNavigation(navigationConfig.items, tabs);
                return {
                    tabs: tabbedItem.tabs
                };
            }
            default:
                assertNever(navigationConfig);
        }
    }

    private async convertTabbedNavigation(
        items: docsYml.TabbedNavigation[],
        tabs: Record<string, docsYml.RawSchemas.TabConfig> | undefined
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
                    tabbedItem.layout.map((item) => this.convertNavigationItem(item))
                );

                return {
                    title: tabConfig.displayName,
                    icon: tabConfig.icon,
                    items: tabbedItems,
                    urlSlugOverride: tabConfig.slug
                };
            })
        );
        return { tabs: convertedTabs };
    }

    private getFileId(filepath: AbsoluteFilePath): DocsV1Write.FileId;
    private getFileId(filepath: AbsoluteFilePath | undefined): DocsV1Write.FileId | undefined;
    private getFileId(filepath: AbsoluteFilePath | undefined): DocsV1Write.FileId | undefined {
        if (filepath == null) {
            return undefined;
        }
        const fileId = this.collectedFileIds.get(filepath);
        if (fileId == null) {
            return this.taskContext.failAndThrow("Failed to locate file after uploading");
        }
        return fileId;
    }

    private convertColorConfigImageReferences(): DocsV1Write.ColorsConfigV3 | undefined {
        const { colors } = this.parsedDocsConfig;
        if (colors == null) {
            return undefined;
        }
        if (colors.type === "dark") {
            return {
                ...colors,
                ...this.convertLogoAndBackgroundImage({
                    theme: "dark"
                })
            };
        } else if (colors.type === "light") {
            return {
                ...colors,
                ...this.convertLogoAndBackgroundImage({
                    theme: "light"
                })
            };
        } else {
            return {
                ...colors,
                dark: {
                    ...colors.dark,
                    ...this.convertLogoAndBackgroundImage({
                        theme: "dark"
                    })
                },
                light: {
                    ...colors.light,
                    ...this.convertLogoAndBackgroundImage({
                        theme: "light"
                    })
                }
            };
        }
    }

    private convertLogoAndBackgroundImage({ theme }: { theme: "dark" | "light" }) {
        const { logo, backgroundImage } = this.parsedDocsConfig;
        const logoRef = logo?.[theme];
        const backgroundImageRef = backgroundImage?.[theme];
        return {
            logo: this.getFileId(logoRef),
            backgroundImage: this.getFileId(backgroundImageRef)
        };
    }

    private convertDocsTypographyConfiguration(): DocsV1Write.DocsTypographyConfigV2 | undefined {
        if (this.parsedDocsConfig.typography == null) {
            return;
        }
        return {
            headingsFont: this.convertFont(this.parsedDocsConfig.typography.headingsFont, "headings"),
            bodyFont: this.convertFont(this.parsedDocsConfig.typography.bodyFont, "body"),
            codeFont: this.convertFont(this.parsedDocsConfig.typography.codeFont, "code")
        };
    }

    private convertFont(font: docsYml.FontConfig | undefined, label: string): DocsV1Write.FontConfigV2 | undefined {
        if (font == null) {
            return;
        }

        if (font.variants[0] == null) {
            return;
        }

        const fileId = this.getFileId(font.variants[0].absolutePath);

        return {
            type: "custom",
            name: font.name ?? `font:${label}:${fileId}`,
            variants: font.variants.map((variant) => {
                const fontFile = this.getFileId(variant.absolutePath);
                return {
                    fontFile,
                    weight: variant.weight,
                    style: variant.style != null ? [variant.style] : undefined
                };
            }),
            display: font.display,
            fallback: font.fallback,
            fontVariationSettings: font.fontVariationSettings
        };
    }

    private convertJavascriptConfiguration(): DocsV1Write.JsConfig | undefined {
        if (this.parsedDocsConfig.js == null) {
            return;
        }
        return {
            files: this.parsedDocsConfig.js.files
                .map(({ absolutePath, strategy }) => ({ fileId: this.getFileId(absolutePath), strategy }))
                .filter(isNonNullish)
        };
    }

    private convertMetadata(): DocsV1Write.MetadataConfig | undefined {
        if (this.parsedDocsConfig.metadata == null) {
            return;
        }

        const {
            "og:image": ogImage,
            "og:logo": ogLogo,
            "twitter:image": twitterImage,
            ...rest
        } = this.parsedDocsConfig.metadata;
        return {
            ...rest,
            "og:image": this.convertFileIdOrUrl(ogImage),
            "og:logo": this.convertFileIdOrUrl(ogLogo),
            "twitter:image": this.convertFileIdOrUrl(twitterImage)
        };
    }

    private convertFileIdOrUrl(filepathOrUrl: docsYml.FilepathOrUrl | undefined): DocsV1Write.FileIdOrUrl | undefined {
        if (filepathOrUrl == null) {
            return;
        }

        return visitDiscriminatedUnion(filepathOrUrl, "type")._visit<DocsV1Write.FileIdOrUrl>({
            filepath: ({ value }) => ({
                type: "fileId",
                value: this.getFileId(value)
            }),
            url: ({ value }) => ({ type: "url", value }),
            _other: () => this.taskContext.failAndThrow("Invalid metadata configuration")
        });
    }
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
