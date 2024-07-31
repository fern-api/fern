import { docsYml, WithoutQuestionMarks } from "@fern-api/configuration";
import { assertNever, isNonNullish, visitDiscriminatedUnion } from "@fern-api/core-utils";
import {
    parseImagePaths,
    replaceImagePathsAndUrls,
    replaceReferencedCode,
    replaceReferencedMarkdown
} from "@fern-api/docs-markdown-utils";
import { APIV1Write, DocsV1Write, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, listFiles, relative, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { readFile, stat } from "fs/promises";
import matter from "gray-matter";
import { kebabCase } from "lodash-es";
import urlJoin from "url-join";
import { ApiReferenceNodeConverter } from "./ApiReferenceNodeConverter";
import { ChangelogNodeConverter } from "./ChangelogNodeConverter";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { convertDocsSnippetsConfigToFdr } from "./utils/convertDocsSnippetsConfigToFdr";
import { convertIrToApiDefinition } from "./utils/convertIrToApiDefinition";
import { collectFilesFromDocsConfig } from "./utils/getImageFilepathsToUpload";
import { wrapWithHttps } from "./wrapWithHttps";

dayjs.extend(utc);

export interface FilePathPair {
    absoluteFilePath: AbsoluteFilePath;
    relativeFilePath: RelativeFilePath;
}

export interface UploadedFile extends FilePathPair {
    fileId: string;
}

export class DocsDefinitionResolver {
    constructor(
        private domain: string,
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

        // replaces all instances of <Markdown src="path/to/file.md" /> with the content of the referenced markdown file
        // this should happen before we parse image paths, as the referenced markdown files may contain images.
        for (const [relativePath, markdown] of Object.entries(this.parsedDocsConfig.pages)) {
            this.parsedDocsConfig.pages[RelativeFilePath.of(relativePath)] = await replaceReferencedMarkdown({
                markdown,
                absolutePathToFernFolder: this.docsWorkspace.absoluteFilepath,
                absolutePathToMdx: this.resolveFilepath(relativePath),
                context: this.taskContext
            });
            this.parsedDocsConfig.pages[RelativeFilePath.of(relativePath)] = await replaceReferencedCode({
                markdown,
                absolutePathToFernFolder: this.docsWorkspace.absoluteFilepath,
                absolutePathToMdx: this.resolveFilepath(relativePath),
                context: this.taskContext
            });
        }

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
                filesToUploadSet.add(filepath);
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
        const basePath = this.getDocsBasePath();
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

        // detect experimental js files to include in the docs
        let jsFiles: Record<string, string> = {};
        if (this._parsedDocsConfig.experimental?.mdxComponents != null) {
            const jsFilePaths = new Set<AbsoluteFilePath>();
            await Promise.all(
                this._parsedDocsConfig.experimental.mdxComponents.map(async (filepath) => {
                    const absoluteFilePath = resolve(this.docsWorkspace.absoluteFilepath, filepath);

                    // check if absoluteFilePath is a directory or a file
                    const stats = await stat(absoluteFilePath);

                    if (stats.isDirectory()) {
                        const files = await listFiles(absoluteFilePath, "{js,ts,jsx,tsx}");

                        files.forEach((file) => {
                            jsFilePaths.add(file);
                        });
                    } else if (absoluteFilePath.match(/\.(js|ts|jsx|tsx)$/) != null) {
                        jsFilePaths.add(absoluteFilePath);
                    }
                })
            );

            jsFiles = Object.fromEntries(
                await Promise.all(
                    [...jsFilePaths].map(async (filePath): Promise<[string, string]> => {
                        const relativeFilePath = this.toRelativeFilepath(filePath);
                        const contents = (await readFile(filePath)).toString();
                        return [relativeFilePath, contents];
                    })
                )
            );
        }

        return { config, pages, jsFiles };
    }

    private resolveFilepath(unresolvedFilepath: string): AbsoluteFilePath;
    private resolveFilepath(unresolvedFilepath: string | undefined): AbsoluteFilePath | undefined;
    private resolveFilepath(unresolvedFilepath: string | undefined): AbsoluteFilePath | undefined {
        if (unresolvedFilepath == null) {
            return undefined;
        }
        return resolve(this.docsWorkspace.absoluteFilepath, unresolvedFilepath);
    }

    private toRelativeFilepath(filepath: AbsoluteFilePath): RelativeFilePath;
    private toRelativeFilepath(filepath: AbsoluteFilePath | undefined): RelativeFilePath | undefined;
    private toRelativeFilepath(filepath: AbsoluteFilePath | undefined): RelativeFilePath | undefined {
        if (filepath == null) {
            return undefined;
        }
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

    private getDocsBasePath(): string {
        const url = new URL(wrapWithHttps(this.domain));
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
        const slug = FernNavigation.SlugGenerator.init(FernNavigation.utils.slugjoin(this.getDocsBasePath()));
        const landingPage = this.parsedDocsConfig.landingPage;
        switch (this.parsedDocsConfig.navigation.type) {
            case "versioned": {
                const versions = await Promise.all(
                    this.parsedDocsConfig.navigation.versions.map(
                        async (version): Promise<DocsV1Write.VersionedNavigationConfigData> => {
                            const versionSlug = slug.setVersionSlug(version.slug ?? kebabCase(version.version));
                            const convertedNavigation = await this.convertUnversionedNavigationConfig({
                                landingPage: version.landingPage,
                                navigationConfig: version.navigation,
                                parentSlug: versionSlug
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
            }
            case "untabbed":
            case "tabbed":
                return this.convertUnversionedNavigationConfig({
                    landingPage: this.parsedDocsConfig.landingPage,
                    navigationConfig: this.parsedDocsConfig.navigation,
                    parentSlug: slug
                });
            default:
                assertNever(this.parsedDocsConfig.navigation);
        }
    }

    private async convertNavigationItem(
        item: docsYml.DocsNavigationItem,
        parentSlug: FernNavigation.SlugGenerator
    ): Promise<DocsV1Write.NavigationItem> {
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
                const slug = parentSlug.apply({
                    fullSlug: undefined, // TODO: implement fullSlug for sections when summary pages are supported
                    skipUrlSlug: item.skipUrlSlug,
                    urlSlug: item.slug ?? kebabCase(item.title)
                });
                const sectionItems = await Promise.all(
                    item.contents.map((nestedItem) => this.convertNavigationItem(nestedItem, slug))
                );
                return {
                    type: "section",
                    title: item.title,

                    items: sectionItems,
                    urlSlugOverride: item.slug,
                    collapsed: item.collapsed,
                    icon: item.icon,
                    hidden: item.hidden,
                    skipUrlSlug: item.skipUrlSlug,
                    overviewPageId: this.toRelativeFilepath(item.overviewAbsolutePath)
                };
            }
            case "apiSection": {
                const workspace = this.getFernWorkspaceForApiSection(item);
                const snippetsConfig = convertDocsSnippetsConfigToFdr(item.snippetsConfiguration);
                const ir = await generateIntermediateRepresentation({
                    workspace,
                    audiences: item.audiences,
                    generationLanguage: undefined,
                    keywords: undefined,
                    smartCasing: false,
                    disableExamples: false,
                    readme: undefined
                });
                const apiDefinitionId = await this.registerApi({ ir, snippetsConfig });
                const api = convertIrToApiDefinition(ir, apiDefinitionId);
                const node = new ApiReferenceNodeConverter(
                    item,
                    api,
                    parentSlug,
                    workspace,
                    this.docsWorkspace,
                    this.taskContext,
                    this.markdownFilesToFullSlugs
                );

                return { type: "apiV2", node: node.get() };
            }
            case "link": {
                return {
                    type: "link",
                    title: item.text,
                    url: item.url
                };
            }
            case "changelog": {
                const idgen = NodeIdGenerator.init(parentSlug.get());
                const node = new ChangelogNodeConverter(
                    this.markdownFilesToFullSlugs,
                    item.changelog,
                    this.docsWorkspace,
                    idgen
                ).convert({
                    parentSlug,
                    title: item.title,
                    icon: item.icon,
                    hidden: item.hidden,
                    slug: item.slug
                });
                return {
                    type: "changelogV3",
                    node: node ?? {
                        id: idgen.append("changelog").get(),
                        type: "changelog",
                        title: item.title,
                        slug: parentSlug.append(item.slug ?? kebabCase(item.title)).get(),
                        children: []
                    }
                };
            }
            default:
                assertNever(item);
        }
    }

    private async convertUnversionedNavigationConfig({
        landingPage: landingPageConfig,
        navigationConfig,
        parentSlug
    }: {
        landingPage: docsYml.DocsNavigationItem.Page | undefined;
        navigationConfig: docsYml.UnversionedNavigationConfiguration;
        parentSlug: FernNavigation.SlugGenerator;
    }): Promise<DocsV1Write.UnversionedNavigationConfig> {
        const landingPage =
            landingPageConfig != null
                ? {
                      id: this.toRelativeFilepath(landingPageConfig.absolutePath),
                      urlSlugOverride: landingPageConfig.slug,
                      fullSlug: this.markdownFilesToFullSlugs.get(landingPageConfig.absolutePath)?.split("/"),
                      hidden: landingPageConfig.hidden,
                      title: landingPageConfig.title,
                      icon: landingPageConfig.icon
                  }
                : undefined;
        switch (navigationConfig.type) {
            case "untabbed": {
                const untabs = await Promise.all(
                    navigationConfig.items.map((item) => this.convertNavigationItem(item, parentSlug))
                );
                return {
                    landingPage,
                    items: untabs
                };
            }
            case "tabbed": {
                return {
                    landingPage,
                    tabsV2: await this.convertTabbedNavigation(navigationConfig.items, parentSlug)
                };
            }
            default:
                assertNever(navigationConfig);
        }
    }

    private async convertTabbedNavigation(
        items: docsYml.TabbedNavigation[],
        parentSlug: FernNavigation.SlugGenerator
    ): Promise<DocsV1Write.NavigationTabV2[]> {
        return Promise.all(
            items.map(async (tab): Promise<WithoutQuestionMarks<DocsV1Write.NavigationTabV2>> => {
                if (tab.child.type === "link") {
                    return {
                        type: "link",
                        title: tab.title,
                        icon: tab.icon,
                        url: tab.child.href
                    };
                }

                if (tab.child.type === "changelog") {
                    const idgen = NodeIdGenerator.init(parentSlug.get());
                    const node = new ChangelogNodeConverter(
                        this.markdownFilesToFullSlugs,
                        tab.child.changelog,
                        this.docsWorkspace,
                        idgen
                    ).convert({
                        parentSlug,
                        title: tab.title,
                        icon: tab.icon,
                        hidden: tab.hidden,
                        slug: tab.slug
                    });
                    return {
                        type: "changelogV3",
                        node: node ?? {
                            id: idgen.append("changelog").get(),
                            type: "changelog",
                            title: tab.title,
                            slug: parentSlug.append(tab.slug ?? kebabCase(tab.title)).get(),
                            children: []
                        }
                    };
                }

                if (tab.child.type === "layout") {
                    const slug = parentSlug.apply({
                        skipUrlSlug: tab.skipUrlSlug,
                        urlSlug: tab.slug ?? kebabCase(tab.title)
                    });

                    const tabs = await Promise.all(
                        tab.child.layout.map((item) => this.convertNavigationItem(item, slug))
                    );

                    return {
                        type: "group",
                        title: tab.title,
                        icon: tab.icon,
                        items: tabs,
                        urlSlugOverride: tab.slug,
                        skipUrlSlug: tab.skipUrlSlug,
                        hidden: tab.hidden,
                        fullSlug: undefined
                    };
                }

                assertNever(tab.child);
            })
        );
    }

    private getFileId(filepath: AbsoluteFilePath): DocsV1Write.FileId;
    private getFileId(filepath: AbsoluteFilePath | undefined): DocsV1Write.FileId | undefined;
    private getFileId(filepath: AbsoluteFilePath | undefined): DocsV1Write.FileId | undefined {
        if (filepath == null) {
            return undefined;
        }
        const fileId = this.collectedFileIds.get(filepath);
        if (fileId == null) {
            return this.taskContext.failAndThrow("Failed to locate file after uploading: " + filepath);
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
