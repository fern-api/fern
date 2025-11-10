import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { docsYml, parseAudiences, parseDocsConfiguration, WithoutQuestionMarks } from "@fern-api/configuration-loader";
import { assertNever, isNonNullish, visitDiscriminatedUnion } from "@fern-api/core-utils";
import {
    parseImagePaths,
    replaceImagePathsAndUrls,
    replaceReferencedCode,
    replaceReferencedMarkdown
} from "@fern-api/docs-markdown-utils";
import { APIV1Write, DocsV1Write, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, listFiles, RelativeFilePath, relative, resolve } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { readFile, stat } from "fs/promises";
import matter from "gray-matter";
import { kebabCase } from "lodash-es";

import { ApiReferenceNodeConverter } from "./ApiReferenceNodeConverter";
import { ChangelogNodeConverter } from "./ChangelogNodeConverter";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { convertDocsSnippetsConfigToFdr } from "./utils/convertDocsSnippetsConfigToFdr";
import { convertIrToApiDefinition } from "./utils/convertIrToApiDefinition";
import { collectFilesFromDocsConfig } from "./utils/getImageFilepathsToUpload";
import { visitNavigationAst } from "./visitNavigationAst";
import { wrapWithHttps } from "./wrapWithHttps";

dayjs.extend(utc);

export interface FilePathPair {
    absoluteFilePath: AbsoluteFilePath;
    relativeFilePath: RelativeFilePath;
}

export interface UploadedFile extends FilePathPair {
    fileId: string;
}

export type PlaygroundConfig = Pick<docsYml.RawSchemas.PlaygroundSettings, "oauth">;

type AsyncOrSync<T> = T | Promise<T>;

type UploadFilesFn = (files: FilePathPair[]) => AsyncOrSync<UploadedFile[]>;

type RegisterApiFn = (opts: {
    ir: IntermediateRepresentation;
    snippetsConfig: APIV1Write.SnippetsConfig;
    playgroundConfig?: PlaygroundConfig;
    apiName?: string;
    workspace?: FernWorkspace;
}) => AsyncOrSync<string>;

type ConfigureAiChatFn = (opts: { aiChatConfig: DocsV1Write.AiChatConfig | undefined }) => AsyncOrSync<void>;

const defaultUploadFiles: UploadFilesFn = (files) => {
    return files.map((file) => ({ ...file, fileId: String(file.relativeFilePath) }));
};

let apiCounter = 0;
const defaultRegisterApi: RegisterApiFn = async ({ ir }) => {
    apiCounter++;
    return `${ir.apiName.snakeCase.unsafeName}-${apiCounter}`;
};

export interface DocsDefinitionResolverArgs {
    domain: string;
    docsWorkspace: DocsWorkspace;
    ossWorkspaces: OSSWorkspace[];
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    taskContext: TaskContext;
    // Optional
    editThisPage?: docsYml.RawSchemas.EditThisPageConfig;
    uploadFiles?: UploadFilesFn;
    registerApi?: RegisterApiFn;
    targetAudiences?: string[];
}

export class DocsDefinitionResolver {
    private domain: string;
    private docsWorkspace: DocsWorkspace;
    private ossWorkspaces: OSSWorkspace[];
    private apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    private taskContext: TaskContext;
    private editThisPage?: docsYml.RawSchemas.EditThisPageConfig;
    private uploadFiles: UploadFilesFn;
    private registerApi: RegisterApiFn;
    private targetAudiences?: string[];

    constructor({
        domain,
        docsWorkspace,
        ossWorkspaces,
        apiWorkspaces,
        taskContext,
        editThisPage,
        uploadFiles = defaultUploadFiles,
        registerApi = defaultRegisterApi,
        targetAudiences
    }: DocsDefinitionResolverArgs) {
        this.domain = domain;
        this.docsWorkspace = docsWorkspace;
        this.ossWorkspaces = ossWorkspaces;
        this.apiWorkspaces = apiWorkspaces;
        this.taskContext = taskContext;
        this.editThisPage = editThisPage;
        this.uploadFiles = uploadFiles;
        this.registerApi = registerApi;
        this.targetAudiences = targetAudiences;
    }

    #idgen = NodeIdGenerator.init();

    /**
     * Checks if an item should be included based on its audiences and the target audiences.
     * An item is included if:
     * 1. It has no audiences specified (visible to all), OR
     * 2. There are no target audiences (showing all content), OR
     * 3. There's at least one audience overlap between the item and target audiences
     */
    private shouldIncludeByAudience(itemAudiences?: string[]): boolean {
        // If no audiences specified on the item, it's visible to all
        if (!itemAudiences || itemAudiences.length === 0) {
            return true;
        }

        // If no target audiences specified, show all content
        if (!this.targetAudiences || this.targetAudiences.length === 0) {
            return true;
        }

        // Check for audience overlap
        return itemAudiences.some((audience) => this.targetAudiences?.includes(audience));
    }

    /**
     * Applies audience-based filtering to the parsed docs configuration.
     * Filters products, versions, and navigation items based on target audiences.
     */
    private applyAudienceFiltering(
        config: WithoutQuestionMarks<docsYml.ParsedDocsConfiguration>
    ): WithoutQuestionMarks<docsYml.ParsedDocsConfiguration> {
        // Apply filtering by modifying the navigation in place
        const filteredNavigation = this.filterNavigationByAudience(config.navigation);

        return {
            ...config,
            navigation: filteredNavigation
        };
    }

    /**
     * Filters navigation configuration based on target audiences.
     */
    private filterNavigationByAudience(
        navigation: docsYml.DocsNavigationConfiguration
    ): docsYml.DocsNavigationConfiguration {
        if (navigation.type === "untabbed") {
            return navigation; // No filtering needed for untabbed navigation
        }

        if (navigation.type === "tabbed") {
            return navigation; // No filtering needed for tabbed navigation
        }

        if (navigation.type === "versioned") {
            return {
                ...navigation,
                versions: navigation.versions.filter((version) =>
                    this.shouldIncludeByAudience(this.getRawVersionAudiences(version.version))
                )
            };
        }

        if (navigation.type === "productgroup") {
            return {
                ...navigation,
                products: navigation.products.filter((product) => {
                    const productAudiences = this.getRawProductAudiences(product.product);
                    return this.shouldIncludeByAudience(productAudiences);
                })
            };
        }

        return navigation;
    }

    /**
     * Gets the raw audiences for a product by looking up the original configuration.
     */
    private getRawProductAudiences(productName: string): string[] | undefined {
        const rawProducts = this.docsWorkspace.config.products;
        const product = rawProducts?.find((p) => p.displayName === productName);
        return parseAudiences(product?.audiences);
    }

    /**
     * Gets the raw audiences for a version by looking up the original configuration.
     */
    private getRawVersionAudiences(versionName: string): string[] | undefined {
        const rawVersions = this.docsWorkspace.config.versions;
        const version = rawVersions?.find((v) => v.displayName === versionName);
        return parseAudiences(version?.audiences);
    }

    private _parsedDocsConfig: WithoutQuestionMarks<docsYml.ParsedDocsConfiguration> | undefined;
    private get parsedDocsConfig(): WithoutQuestionMarks<docsYml.ParsedDocsConfiguration> {
        if (this._parsedDocsConfig == null) {
            throw new Error("parsedDocsConfig is not set");
        }
        return this._parsedDocsConfig;
    }
    private collectedFileIds = new Map<AbsoluteFilePath, string>();
    private markdownFilesToFullSlugs: Map<AbsoluteFilePath, string> = new Map();
    private markdownFilesToNoIndex: Map<AbsoluteFilePath, boolean> = new Map();
    private markdownFilesToTags: Map<AbsoluteFilePath, string[]> = new Map();
    private rawMarkdownFiles: Record<RelativeFilePath, string> = {};
    public async resolve(): Promise<DocsV1Write.DocsDefinition> {
        this._parsedDocsConfig = await parseDocsConfiguration({
            rawDocsConfiguration: this.docsWorkspace.config,
            context: this.taskContext,
            absolutePathToFernFolder: this.docsWorkspace.absoluteFilePath,
            absoluteFilepathToDocsConfig: this.docsWorkspace.absoluteFilepathToDocsConfig
        });

        // Apply audience-based filtering to the navigation if target audiences are specified
        if (this.targetAudiences && this.targetAudiences.length > 0) {
            this._parsedDocsConfig = this.applyAudienceFiltering(this._parsedDocsConfig);
        }

        // Store raw markdown content before any processing
        for (const [relativePath, markdown] of Object.entries(this.parsedDocsConfig.pages)) {
            this.rawMarkdownFiles[RelativeFilePath.of(relativePath)] = markdown;
        }

        // track all changelog markdown files in parsedDocsConfig.pages
        const openapiParserV3 = this.parsedDocsConfig.experimental?.openapiParserV3;
        const useV1Parser = openapiParserV3 != null && !openapiParserV3;
        if (this.docsWorkspace.config.navigation != null && useV1Parser) {
            await visitNavigationAst({
                navigation: this.docsWorkspace.config.navigation,
                visitor: {
                    apiSection: async ({ workspace }) => {
                        const fernWorkspace = await workspace.toFernWorkspace(
                            { context: this.taskContext },

                            {
                                enableUniqueErrorsPerEndpoint: true,
                                detectGlobalHeaders: false,
                                preserveSchemaIds: true,
                                objectQueryParameters: true,
                                respectReadonlySchemas: true
                            }
                        );
                        fernWorkspace.changelog?.files.forEach((file) => {
                            const relativePath = relative(this.docsWorkspace.absoluteFilePath, file.absoluteFilepath);
                            this.parsedDocsConfig.pages[relativePath] = file.contents;
                            // Also store the raw content for changelog files
                            this.rawMarkdownFiles[RelativeFilePath.of(relativePath)] = file.contents;
                        });
                    }
                },
                apiWorkspaces: this.apiWorkspaces,
                context: this.taskContext
            });
        }

        // create a map of markdown files to their URL pathnames
        // this will be used to resolve relative markdown links to their final URLs
        this.markdownFilesToFullSlugs = await this.getMarkdownFilesToFullSlugs(this.parsedDocsConfig.pages);

        // create a map of markdown files to their noindex values
        this.markdownFilesToNoIndex = await this.getMarkdownFilesToNoIndex(this.parsedDocsConfig.pages);

        // create a map of markdown files to their tags
        this.markdownFilesToTags = await this.getMarkdownFilesToTags(this.parsedDocsConfig.pages);

        // replaces all instances of <Markdown src="path/to/file.md" /> with the content of the referenced markdown file
        // this should happen before we parse image paths, as the referenced markdown files may contain images.
        for (const [relativePath, markdown] of Object.entries(this.parsedDocsConfig.pages)) {
            this.parsedDocsConfig.pages[RelativeFilePath.of(relativePath)] = await replaceReferencedMarkdown({
                markdown,
                absolutePathToFernFolder: this.docsWorkspace.absoluteFilePath,
                absolutePathToMarkdownFile: this.resolveFilepath(relativePath),
                context: this.taskContext
            });
        }

        // replaces all instances of <Code src="path/to/file.js" /> with the content of the referenced code file
        for (const [relativePath, markdown] of Object.entries(this.parsedDocsConfig.pages)) {
            this.parsedDocsConfig.pages[RelativeFilePath.of(relativePath)] = await replaceReferencedCode({
                markdown,
                absolutePathToFernFolder: this.docsWorkspace.absoluteFilePath,
                absolutePathToMarkdownFile: this.resolveFilepath(relativePath),
                context: this.taskContext
            });
        }

        const filesToUploadSet = await collectFilesFromDocsConfig({
            parsedDocsConfig: this.parsedDocsConfig
        });

        // preprocess markdown files to extract image paths
        for (const [relativePath, markdown] of Object.entries(this.parsedDocsConfig.pages)) {
            try {
                const { filepaths, markdown: newMarkdown } = parseImagePaths(markdown, {
                    absolutePathToMarkdownFile: this.resolveFilepath(relativePath),
                    absolutePathToFernFolder: this.docsWorkspace.absoluteFilePath
                });

                // store the updated markdown in pages
                this.parsedDocsConfig.pages[RelativeFilePath.of(relativePath)] = newMarkdown;

                // store the image filepaths to upload
                for (const filepath of filepaths) {
                    filesToUploadSet.add(filepath);
                }
            } catch (error) {
                this.taskContext.logger.error(
                    `Failed to parse ${relativePath}: ${error instanceof Error ? error.message : String(error)}`
                );
                throw error;
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

        // store root here so we only process once
        const root = await this.toRootNode();

        // postprocess markdown files after uploading all images to replace the image paths in the markdown files with the fileIDs

        // TODO: include more (canonical) slugs from the navigation tree
        const markdownFilesToPathName: Record<AbsoluteFilePath, string> =
            await this.getMarkdownFilesToFullyQualifiedPathNames(root);

        for (const [relativePath, markdown] of Object.entries(this.parsedDocsConfig.pages)) {
            this.parsedDocsConfig.pages[RelativeFilePath.of(relativePath)] = replaceImagePathsAndUrls(
                markdown,
                this.collectedFileIds,
                // convert slugs to full URL pathnames
                markdownFilesToPathName,
                {
                    absolutePathToMarkdownFile: this.resolveFilepath(relativePath),
                    absolutePathToFernFolder: this.docsWorkspace.absoluteFilePath
                },
                this.taskContext
            );
        }

        const pages: Record<DocsV1Write.PageId, DocsV1Write.PageContent> = {};

        Object.entries(this.parsedDocsConfig.pages).forEach(([relativePageFilepath, markdown]) => {
            const url = createEditThisPageUrl(this.editThisPage, relativePageFilepath);
            const rawMarkdown = this.rawMarkdownFiles[RelativeFilePath.of(relativePageFilepath)];
            pages[DocsV1Write.PageId(relativePageFilepath)] = {
                markdown,
                editThisPageUrl: url ? DocsV1Write.Url(url) : undefined,
                rawMarkdown: rawMarkdown
            };
        });

        const config = await this.convertDocsConfiguration(root);

        // detect experimental js files to include in the docs
        let jsFiles: Record<string, string> = {};
        if (this._parsedDocsConfig.experimental?.mdxComponents != null) {
            const jsFilePaths = new Set<AbsoluteFilePath>();
            await Promise.all(
                this._parsedDocsConfig.experimental.mdxComponents.map(async (filepath) => {
                    const absoluteFilePath = resolve(this.docsWorkspace.absoluteFilePath, filepath);

                    // check if absoluteFilePath is a directory or a file
                    const stats = await stat(absoluteFilePath);

                    if (stats.isDirectory()) {
                        const files = await listFiles(absoluteFilePath, "{js,ts,jsx,tsx,md,mdx}");

                        files.forEach((file) => {
                            jsFilePaths.add(file);
                        });
                    } else if (absoluteFilePath.match(/\.(js|ts|jsx|tsx|md|mdx)$/) != null) {
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
        return resolve(this.docsWorkspace.absoluteFilePath, unresolvedFilepath);
    }

    private toRelativeFilepath(filepath: AbsoluteFilePath): RelativeFilePath;
    private toRelativeFilepath(filepath: AbsoluteFilePath | undefined): RelativeFilePath | undefined;
    private toRelativeFilepath(filepath: AbsoluteFilePath | undefined): RelativeFilePath | undefined {
        if (filepath == null) {
            return undefined;
        }
        return relative(this.docsWorkspace.absoluteFilePath, filepath);
    }

    /**
     * Creates a map of markdown files to their full slugs specified in the frontmatter only
     * @param pages - the pages to convert to slugs
     * @returns a map of markdown files to their full slugs
     */
    private async getMarkdownFilesToFullSlugs(
        pages: Record<RelativeFilePath, string>
    ): Promise<Map<AbsoluteFilePath, string>> {
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

    /**
     * Creates a list of markdown files that have noindex:true specified in the frontmatter
     * @param pages - the pages to check
     * @returns a map of markdown files to their noindex value
     */
    private async getMarkdownFilesToNoIndex(
        pages: Record<RelativeFilePath, string>
    ): Promise<Map<AbsoluteFilePath, boolean>> {
        const mdxFilePathToNoIndex = new Map<AbsoluteFilePath, boolean>();
        for (const [relativePath, markdown] of Object.entries(pages)) {
            const frontmatter = matter(markdown);
            const noindex = frontmatter.data.noindex;
            if (typeof noindex === "boolean") {
                mdxFilePathToNoIndex.set(this.resolveFilepath(relativePath), noindex);
            }
        }
        return mdxFilePathToNoIndex;
    }

    /**
     * Creates a map of markdown files to their tags specified in the frontmatter
     * @param pages - the pages to check
     * @returns a map of markdown files to their tags
     */
    private async getMarkdownFilesToTags(
        pages: Record<RelativeFilePath, string>
    ): Promise<Map<AbsoluteFilePath, string[]>> {
        const mdxFilePathToTags = new Map<AbsoluteFilePath, string[]>();
        for (const [relativePath, markdown] of Object.entries(pages)) {
            const frontmatter = matter(markdown);
            const tags = frontmatter.data.tags;
            if (typeof tags === "string") {
                mdxFilePathToTags.set(
                    this.resolveFilepath(relativePath),
                    tags
                        .split(",")
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0)
                );
            } else if (Array.isArray(tags)) {
                mdxFilePathToTags.set(this.resolveFilepath(relativePath), tags);
            }
        }
        return mdxFilePathToTags;
    }

    /**
     * Creates a map of markdown files to their fully qualified pathnames, based on the entire navigation tree
     * FernNavigation NodeCollector already includes basepath in slugmap
     * @returns a map of markdown files to their fully qualified pathnames
     */
    private async getMarkdownFilesToFullyQualifiedPathNames(
        initialRoot: FernNavigation.V1.RootNode
    ): Promise<Record<AbsoluteFilePath, string>> {
        const markdownFilesToPathName: Record<AbsoluteFilePath, string> = {};
        const root = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(initialRoot);

        // all the page slugs in the docs:
        const collector = FernNavigation.NodeCollector.collect(root);
        collector.slugMap.forEach((node, slug) => {
            if (node == null || !FernNavigation.isPage(node)) {
                return;
            }

            const pageId = FernNavigation.getPageId(node);
            if (pageId == null) {
                return;
            }

            const absoluteFilePath = join(this.docsWorkspace.absoluteFilePath, RelativeFilePath.of(pageId));
            markdownFilesToPathName[absoluteFilePath] = slug;
        });
        return markdownFilesToPathName;
    }

    private getDocsBasePath(): string {
        const url = new URL(wrapWithHttps(this.domain));
        return url.pathname;
    }

    private async convertDocsConfiguration(root: FernNavigation.V1.RootNode): Promise<DocsV1Write.DocsConfig> {
        const config: DocsV1Write.DocsConfig = {
            aiChatConfig:
                this.parsedDocsConfig.aiChatConfig != null
                    ? {
                          model: this.parsedDocsConfig.aiChatConfig.model,
                          systemPrompt: this.parsedDocsConfig.aiChatConfig.systemPrompt,
                          location: this.parsedDocsConfig.aiChatConfig.location,
                          datasources: this.parsedDocsConfig.aiChatConfig.datasources?.map((ds) => ({
                              url: ds.url,
                              title: ds.title
                          }))
                      }
                    : undefined,
            hideNavLinks: undefined,
            title: this.parsedDocsConfig.title,
            logoHeight: this.parsedDocsConfig.logo?.height,
            logoHref: this.parsedDocsConfig.logo?.href ? DocsV1Write.Url(this.parsedDocsConfig.logo?.href) : undefined,
            favicon: this.getFileId(this.parsedDocsConfig.favicon),
            navigation: undefined, // <-- this is now deprecated
            root,
            colorsV3: this.convertColorConfigImageReferences(),
            navbarLinks: this.parsedDocsConfig.navbarLinks?.map((navbarLink) => {
                if (navbarLink.type === "dropdown") {
                    return {
                        ...navbarLink,
                        links: navbarLink.links?.map((link) => ({
                            ...link,
                            url: DocsV1Write.Url(link.url),
                            icon: this.resolveIconFileId(link.icon),
                            rightIcon: this.resolveIconFileId(link.rightIcon)
                        })),
                        icon: this.resolveIconFileId(navbarLink.icon),
                        rightIcon: this.resolveIconFileId(navbarLink.rightIcon)
                    };
                }

                if (navbarLink.type === "github") {
                    return {
                        ...navbarLink,
                        url: DocsV1Write.Url(navbarLink.url)
                    };
                }

                return {
                    ...navbarLink,
                    url: DocsV1Write.Url(navbarLink.url),
                    icon: this.resolveIconFileId(navbarLink.icon),
                    rightIcon: this.resolveIconFileId(navbarLink.rightIcon)
                };
            }),
            typographyV2: this.convertDocsTypographyConfiguration(),
            layout: this.parsedDocsConfig.layout,
            settings: this.parsedDocsConfig.settings,
            css: this.parsedDocsConfig.css,
            js: this.convertJavascriptConfiguration(),
            metadata: this.convertMetadata(),
            redirects: this.parsedDocsConfig.redirects,
            integrations: this.parsedDocsConfig.integrations,
            footerLinks: this.parsedDocsConfig.footerLinks?.map((footerLink) => ({
                ...footerLink,
                value: DocsV1Write.Url(footerLink.value)
            })),
            defaultLanguage: this.parsedDocsConfig.defaultLanguage,
            languages: this.parsedDocsConfig.languages,
            analyticsConfig: {
                ...this.parsedDocsConfig.analyticsConfig,
                segment: this.parsedDocsConfig.analyticsConfig?.segment,
                fullstory: this.parsedDocsConfig.analyticsConfig?.fullstory,
                intercom: this.parsedDocsConfig.analyticsConfig?.intercom
                    ? {
                          appId: this.parsedDocsConfig.analyticsConfig.intercom.appId,
                          apiBase: this.parsedDocsConfig.analyticsConfig.intercom.apiBase
                      }
                    : undefined,
                posthog: this.parsedDocsConfig.analyticsConfig?.posthog
                    ? {
                          apiKey: this.parsedDocsConfig.analyticsConfig.posthog.apiKey,
                          endpoint: this.parsedDocsConfig.analyticsConfig.posthog.endpoint
                      }
                    : undefined,
                gtm: this.parsedDocsConfig.analyticsConfig?.gtm
                    ? {
                          containerId: this.parsedDocsConfig.analyticsConfig.gtm.containerId
                      }
                    : undefined,
                ga4: this.parsedDocsConfig.analyticsConfig?.ga4
                    ? {
                          measurementId: this.parsedDocsConfig.analyticsConfig.ga4.measurementId
                      }
                    : undefined,
                amplitude: undefined,
                mixpanel: undefined,
                hotjar: undefined,
                koala: undefined,
                logrocket: undefined,
                pirsch: undefined,
                plausible: undefined,
                fathom: undefined,
                clearbit: undefined,
                heap: undefined
            },
            announcement:
                this.parsedDocsConfig.announcement != null
                    ? { text: this.parsedDocsConfig.announcement.message }
                    : undefined,
            pageActions: this.parsedDocsConfig.pageActions,
            theme:
                this.parsedDocsConfig.theme != null
                    ? {
                          sidebar: this.parsedDocsConfig.theme.sidebar,
                          body: this.parsedDocsConfig.theme.body,
                          tabs: this.parsedDocsConfig.theme.tabs,
                          "page-actions": this.parsedDocsConfig.theme.pageActions
                      }
                    : undefined,
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

    private getFernWorkspaceForApiSection(
        apiSection: docsYml.DocsNavigationItem.ApiSection
    ): AbstractAPIWorkspace<unknown> {
        if (apiSection.apiName != null) {
            const apiWorkspace = this.apiWorkspaces.find((workspace) => {
                return workspace.workspaceName === apiSection.apiName;
            });
            if (apiWorkspace != null) {
                return apiWorkspace;
            }
        } else if (this.apiWorkspaces.length === 1 && this.apiWorkspaces[0] != null) {
            return this.apiWorkspaces[0];
        }
        const errorMessage = apiSection.apiName
            ? `Failed to load API Definition '${apiSection.apiName}' referenced in docs`
            : "Failed to load API Definition referenced in docs";
        throw new Error(errorMessage);
    }

    private getOpenApiWorkspaceForApiSection(apiSection: docsYml.DocsNavigationItem.ApiSection): OSSWorkspace {
        if (apiSection.apiName != null) {
            const ossWorkspace = this.ossWorkspaces.find((workspace) => workspace.workspaceName === apiSection.apiName);
            if (ossWorkspace != null) {
                return ossWorkspace;
            }
        } else if (this.ossWorkspaces.length === 1 && this.ossWorkspaces[0] != null) {
            return this.ossWorkspaces[0];
        }
        const errorMessage = apiSection.apiName
            ? `Failed to load API Definition '${apiSection.apiName}' referenced in docs`
            : "Failed to load API Definition referenced in docs";
        throw new Error(errorMessage);
    }

    private async toRootNode(): Promise<FernNavigation.V1.RootNode> {
        const slug = FernNavigation.V1.SlugGenerator.init(FernNavigation.slugjoin(this.getDocsBasePath()));
        const id = this.#idgen.get("root");

        const child: FernNavigation.V1.RootChild = await this.toRootChild(slug);

        return {
            type: "root",
            version: "v1",
            id,
            child,
            slug: slug.get(),
            // TODO: should this be "Documentation" by default? Or can we use the org name here?
            title: this.parsedDocsConfig.title ?? "Documentation",
            hidden: false,
            icon: undefined,
            pointsTo: undefined,
            authed: undefined,
            viewers: undefined,
            orphaned: undefined,
            roles: this.parsedDocsConfig.roles?.map((role) => FernNavigation.RoleId(role)),
            featureFlags: undefined
        };
    }

    private async toRootChild(slug: FernNavigation.V1.SlugGenerator): Promise<FernNavigation.V1.RootChild> {
        return visitDiscriminatedUnion(this.parsedDocsConfig.navigation)._visit<Promise<FernNavigation.V1.RootChild>>({
            untabbed: (untabbed) =>
                this.toUnversionedNode({
                    landingPage: this.parsedDocsConfig.landingPage,
                    navigationConfig: untabbed,
                    parentSlug: slug
                }),
            tabbed: (tabbed) =>
                this.toUnversionedNode({
                    landingPage: this.parsedDocsConfig.landingPage,
                    navigationConfig: tabbed,
                    parentSlug: slug
                }),
            versioned: (versioned) => this.toVersionedNode(versioned, slug),
            productgroup: (productGroup) =>
                this.toProductGroupNode({
                    landingPageConfig: this.parsedDocsConfig.landingPage,
                    productGroup,
                    parentSlug: slug
                })
        });
    }

    private toLandingPageNode(
        landingPageConfig: docsYml.DocsNavigationItem.Page,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.LandingPageNode {
        const pageId = FernNavigation.PageId(this.toRelativeFilepath(landingPageConfig.absolutePath));
        const slug = parentSlug.apply({
            urlSlug: landingPageConfig.slug ?? kebabCase(landingPageConfig.title),
            fullSlug: this.markdownFilesToFullSlugs.get(landingPageConfig.absolutePath)?.split("/")
        });
        return {
            type: "landingPage",
            id: this.#idgen.get(pageId),
            title: landingPageConfig.title,
            slug: slug.get(),
            icon: this.resolveIconFileId(landingPageConfig.icon),
            hidden: landingPageConfig.hidden,
            viewers: landingPageConfig.viewers,
            orphaned: landingPageConfig.orphaned,
            pageId,
            authed: undefined,
            noindex: landingPageConfig.noindex || this.markdownFilesToNoIndex.get(landingPageConfig.absolutePath),
            featureFlags: landingPageConfig.featureFlags
        };
    }

    private async toUnversionedNode({
        landingPage: landingPageConfig,
        navigationConfig,
        parentSlug
    }: {
        landingPage: docsYml.DocsNavigationItem.Page | undefined;
        navigationConfig: docsYml.UnversionedNavigationConfiguration;
        parentSlug: FernNavigation.V1.SlugGenerator;
    }): Promise<FernNavigation.V1.UnversionedNode> {
        const id = this.#idgen.get("unversioned");
        const landingPage: FernNavigation.V1.LandingPageNode | undefined =
            landingPageConfig != null ? this.toLandingPageNode(landingPageConfig, parentSlug) : undefined;

        const child =
            navigationConfig.type === "tabbed"
                ? await this.convertTabbedNavigation(id, navigationConfig.items, parentSlug)
                : await this.toSidebarRootNode(id, navigationConfig.items, parentSlug);

        return { type: "unversioned", id, landingPage, child };
    }

    private async toVersionedNode(
        versioned: docsYml.VersionedDocsNavigation,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.VersionedNode> {
        const id = this.#idgen.get("versioned");

        return {
            id,
            type: "versioned",
            // TODO: should the first version always be default? We should make this configurable.
            children: await Promise.all(
                versioned.versions.map((item, idx) => this.toVersionNode(item, parentSlug, idx === 0))
            )
        };
    }

    private async toProductGroupNode({
        productGroup,
        landingPageConfig,
        parentSlug
    }: {
        productGroup: docsYml.ProductGroupDocsNavigation;
        landingPageConfig: docsYml.DocsNavigationItem.Page | undefined;
        parentSlug: FernNavigation.V1.SlugGenerator;
    }): Promise<FernNavigation.V1.ProductGroupNode> {
        const id = this.#idgen.get("productgroup");
        const landingPage: FernNavigation.V1.LandingPageNode | undefined =
            landingPageConfig != null ? this.toLandingPageNode(landingPageConfig, parentSlug) : undefined;
        return {
            id,
            type: "productgroup",
            landingPage,
            children: await Promise.all(productGroup.products.map((product) => this.toProductNode(product, parentSlug)))
        };
    }

    private async toProductNode(
        product: docsYml.ProductInfo,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.ProductNode> {
        if (product.type === "internal") {
            const slug = parentSlug.setProductSlug(product.slug ?? kebabCase(product.product));
            let child: FernNavigation.V1.ProductChild;
            switch (product.navigation.type) {
                case "tabbed":
                    child = {
                        type: "unversioned",
                        id: this.#idgen.get(product.product),
                        landingPage: undefined,
                        child: await this.convertTabbedNavigation(
                            this.#idgen.get(product.product),
                            product.navigation.items,
                            slug
                        )
                    };
                    break;
                case "untabbed":
                    child = {
                        type: "unversioned",
                        id: this.#idgen.get(product.product),
                        landingPage: undefined,
                        child: await this.toSidebarRootNode(
                            this.#idgen.get(product.product),
                            product.navigation.items,
                            slug
                        )
                    };
                    break;
                case "versioned":
                    child = await this.toVersionedNode(product.navigation, slug);
                    break;
                default:
                    assertNever(product.navigation);
            }

            return {
                type: "product",
                id: this.#idgen.get(product.product),
                productId: FernNavigation.V1.ProductId(product.product),
                title: product.product,
                subtitle: product.subtitle ?? "",
                slug: slug.get(),
                child,
                default: false,
                hidden: undefined,
                authed: undefined,
                icon: this.resolveIconFileId(product.icon),
                image: product.image != null ? this.getFileId(product.image) : undefined,
                pointsTo: undefined,
                viewers: product.viewers,
                orphaned: product.orphaned,
                featureFlags: product.featureFlags
            };
        } else {
            return {
                type: "productLink",
                id: this.#idgen.get(product.product),
                productId: FernNavigation.V1.ProductId(product.product),
                title: product.product,
                subtitle: product.subtitle ?? "",
                href: DocsV1Write.Url(product.href ?? ""),
                default: false,
                hidden: undefined,
                authed: undefined,
                icon: this.resolveIconFileId(product.icon),
                image: product.image != null ? this.getFileId(product.image) : undefined,
                viewers: product.viewers,
                orphaned: product.orphaned
            };
        }
    }

    private async toVersionNode(
        version: docsYml.VersionInfo,
        parentSlug: FernNavigation.V1.SlugGenerator,
        isDefault: boolean
    ): Promise<FernNavigation.V1.VersionNode> {
        const id = this.#idgen.get(version.version);
        const slug = parentSlug.setVersionSlug(version.slug ?? kebabCase(version.version));
        const child =
            version.navigation.type === "tabbed"
                ? await this.convertTabbedNavigation(id, version.navigation.items, slug)
                : await this.toSidebarRootNode(id, version.navigation.items, slug);
        return {
            type: "version",
            id,
            versionId: FernNavigation.VersionId(version.version),
            title: version.version,
            slug: slug.get(),
            child,
            // TODO: the `default` property should be deprecated, and moved to the parent `versioned` node
            default: isDefault,
            availability: version.availability != null ? convertAvailability(version.availability) : undefined,
            landingPage: version.landingPage ? this.toLandingPageNode(version.landingPage, slug) : undefined,
            hidden: undefined,
            authed: undefined,
            viewers: version.viewers,
            orphaned: version.orphaned,
            icon: undefined,
            pointsTo: undefined,
            featureFlags: version.featureFlags
        };
    }

    private async toSidebarRootNode(
        prefix: string,
        items: docsYml.DocsNavigationItem[],
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.SidebarRootNode> {
        const id = this.#idgen.get(`${prefix}/root`);

        const children = await Promise.all(
            items.map((item) => this.toNavigationChild({ prefix: id, item, parentSlug }))
        );

        const grouped: FernNavigation.V1.SidebarRootChild[] = [];
        children.forEach((child) => {
            if (child.type === "apiReference") {
                grouped.push(child);
                return;
            }

            if (child.type === "section" && !child.collapsed) {
                grouped.push(child);
                return;
            }

            const lastChild = grouped.length > 0 ? grouped[grouped.length - 1] : undefined;
            let sidebarGroup: FernNavigation.V1.SidebarGroupNode;
            if (lastChild?.type === "sidebarGroup") {
                sidebarGroup = lastChild;
            } else {
                sidebarGroup = {
                    id: this.#idgen.get(`${id}/group`),
                    type: "sidebarGroup",
                    children: []
                };
                grouped.push(sidebarGroup);
            }

            sidebarGroup.children.push(child);
        });

        return {
            type: "sidebarRoot",
            id,
            children: grouped
        };
    }

    private async toSidebarRootNodeWithVariants(
        prefix: string,
        items: docsYml.TabVariant[],
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.SidebarRootNode> {
        const id = this.#idgen.get(`${prefix}/root`);
        return {
            type: "sidebarRoot",
            id,
            children: [
                {
                    type: "varianted",
                    id,
                    children: await Promise.all(items.map((item) => this.toVariantNode(item, id, parentSlug)))
                }
            ]
        };
    }

    private async toVariantNode(
        item: docsYml.TabVariant,
        prefix: string,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.VariantNode> {
        const id = this.#idgen.get(`${prefix}/variant/${item.slug ?? kebabCase(item.title)}`);
        const variantSlug = parentSlug.apply({
            urlSlug: item.slug ?? kebabCase(item.title),
            skipUrlSlug: item.skipUrlSlug
        });
        const children = await Promise.all(item.layout.map((item) => this.toVariantChild(item, id, variantSlug)));
        return {
            type: "variant",
            id,
            variantId: FernNavigation.V1.VariantId(item.title),
            subtitle: item.subtitle ?? "",
            default: item.default ?? false,
            image: undefined,
            children,
            title: item.title,
            slug: variantSlug.get(),
            icon: this.resolveIconFileId(item.icon),
            hidden: item.hidden,
            authed: undefined,
            viewers: item.viewers,
            orphaned: item.orphaned,
            featureFlags: item.featureFlags,
            pointsTo: undefined
        };
    }

    private async toVariantChild(
        item: docsYml.DocsNavigationItem,
        prefix: string,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.VariantChild> {
        return visitDiscriminatedUnion(item)._visit<Promise<FernNavigation.V1.VariantChild>>({
            page: async (value) => this.toPageNode({ item: value, parentSlug }),
            apiSection: async (value) => this.toApiSectionNode({ item: value, parentSlug }),
            section: async (value) => this.toSectionNode({ prefix, item: value, parentSlug }),
            link: async (value) => this.toLinkNode(value),
            changelog: async (value) => this.toChangelogNode(value, parentSlug)
        });
    }

    private async toNavigationChild({
        prefix,
        item,
        parentSlug,
        hideChildren,
        parentAvailability
    }: {
        prefix: string;
        item: docsYml.DocsNavigationItem;
        parentSlug: FernNavigation.V1.SlugGenerator;
        hideChildren?: boolean;
        parentAvailability?: docsYml.RawSchemas.Availability;
    }): Promise<FernNavigation.V1.NavigationChild> {
        return visitDiscriminatedUnion(item)._visit<Promise<FernNavigation.V1.NavigationChild>>({
            page: async (value) => this.toPageNode({ item: value, parentSlug, hideChildren, parentAvailability }),
            apiSection: async (value) =>
                this.toApiSectionNode({ item: value, parentSlug, hideChildren, parentAvailability }),
            section: async (value) =>
                this.toSectionNode({ prefix, item: value, parentSlug, hideChildren, parentAvailability }),
            link: async (value) => this.toLinkNode(value),
            changelog: async (value) => this.toChangelogNode(value, parentSlug, hideChildren)
        });
    }

    private async toApiSectionNode({
        item,
        parentSlug,
        hideChildren,
        parentAvailability
    }: {
        item: docsYml.DocsNavigationItem.ApiSection;
        parentSlug: FernNavigation.V1.SlugGenerator;
        hideChildren?: boolean;
        parentAvailability?: docsYml.RawSchemas.Availability;
    }): Promise<FernNavigation.V1.ApiReferenceNode> {
        const snippetsConfig = convertDocsSnippetsConfigToFdr(item.snippetsConfiguration);

        let ir: IntermediateRepresentation | undefined = undefined;
        const workspace = await this.getFernWorkspaceForApiSection(item).toFernWorkspace(
            { context: this.taskContext },
            {
                enableUniqueErrorsPerEndpoint: true,
                detectGlobalHeaders: false,
                objectQueryParameters: true,
                preserveSchemaIds: true
            }
        );
        const openapiParserV3 = this.parsedDocsConfig.experimental?.openapiParserV3;
        const useV3Parser = openapiParserV3 == null || openapiParserV3;
        // The v3 parser is enabled on default. We attempt to load the OpenAPI workspace and generate an IR directly.
        if (useV3Parser) {
            try {
                const openapiWorkspace = this.getOpenApiWorkspaceForApiSection(item);
                ir = await openapiWorkspace.getIntermediateRepresentation({
                    context: this.taskContext,
                    audiences: item.audiences,
                    enableUniqueErrorsPerEndpoint: true,
                    generateV1Examples: false
                });
            } catch (error) {
                // noop
            }
        }
        // This case runs if either the V3 parser is not enabled, or if we failed to load the OpenAPI workspace
        if (ir == null) {
            ir = generateIntermediateRepresentation({
                workspace,
                audiences: item.audiences,
                generationLanguage: undefined,
                keywords: undefined,
                smartCasing: false,
                exampleGeneration: {
                    disabled: false,
                    skipAutogenerationIfManualExamplesExist: true,
                    skipErrorAutogenerationIfManualErrorExamplesExist: true
                },
                readme: undefined,
                version: undefined,
                packageName: undefined,
                context: this.taskContext,
                sourceResolver: new SourceResolverImpl(this.taskContext, workspace)
            });
        }

        const apiDefinitionId = await this.registerApi({
            ir,
            snippetsConfig,
            playgroundConfig: { oauth: item.playground?.oauth },
            apiName: item.apiName,
            workspace
        });
        const api = convertIrToApiDefinition({
            ir,
            apiDefinitionId,
            playgroundConfig: { oauth: item.playground?.oauth },
            context: this.taskContext
        });

        const node = new ApiReferenceNodeConverter(
            item,
            api,
            parentSlug,
            this.docsWorkspace,
            this.taskContext,
            this.markdownFilesToFullSlugs,
            this.markdownFilesToNoIndex,
            this.markdownFilesToTags,
            this.#idgen,
            this.collectedFileIds,
            workspace,
            hideChildren,
            parentAvailability ?? item.availability
        );
        return node.get();
    }

    private async toChangelogNode(
        item: docsYml.DocsNavigationItem.Changelog,
        parentSlug: FernNavigation.V1.SlugGenerator,
        hideChildren?: boolean
    ): Promise<FernNavigation.V1.ChangelogNode> {
        const changelogResolver = new ChangelogNodeConverter(
            this.markdownFilesToFullSlugs,
            this.markdownFilesToNoIndex,
            this.markdownFilesToTags,
            item.changelog,
            this.docsWorkspace,
            this.#idgen
        );

        return changelogResolver.toChangelogNode({
            parentSlug,
            title: item.title,
            icon: this.resolveIconFileId(item.icon),
            viewers: item.viewers,
            hidden: hideChildren || item.hidden,
            slug: item.slug
        });
    }

    private async toLinkNode(item: docsYml.DocsNavigationItem.Link): Promise<FernNavigation.V1.LinkNode> {
        return {
            type: "link",
            id: this.#idgen.get(item.url),
            title: item.text,
            url: FernNavigation.V1.Url(item.url),
            icon: this.resolveIconFileId(item.icon)
        };
    }

    private async toPageNode({
        item,
        parentSlug,
        hideChildren,
        parentAvailability
    }: {
        item: docsYml.DocsNavigationItem.Page;
        parentSlug: FernNavigation.V1.SlugGenerator;
        hideChildren?: boolean;
        parentAvailability?: docsYml.RawSchemas.Availability;
    }): Promise<FernNavigation.V1.PageNode> {
        const pageId = FernNavigation.PageId(this.toRelativeFilepath(item.absolutePath));
        const slug = parentSlug.apply({
            urlSlug: item.slug ?? kebabCase(item.title),
            fullSlug: this.markdownFilesToFullSlugs.get(item.absolutePath)?.split("/")
        });
        const id = this.#idgen.get(pageId);
        return {
            id,
            type: "page",
            slug: slug.get(),
            title: item.title,
            icon: this.resolveIconFileId(item.icon),
            hidden: hideChildren || item.hidden,
            viewers: item.viewers,
            orphaned: item.orphaned,
            pageId,
            authed: undefined,
            noindex: item.noindex || this.markdownFilesToNoIndex.get(item.absolutePath),
            featureFlags: item.featureFlags,
            availability: item.availability ?? parentAvailability
        };
    }

    private async toSectionNode({
        prefix,
        item,
        parentSlug,
        hideChildren,
        parentAvailability
    }: {
        prefix: string;
        item: docsYml.DocsNavigationItem.Section;
        parentSlug: FernNavigation.V1.SlugGenerator;
        hideChildren?: boolean;
        parentAvailability?: docsYml.RawSchemas.Availability;
    }): Promise<FernNavigation.V1.SectionNode> {
        const relativeFilePath = this.toRelativeFilepath(item.overviewAbsolutePath);
        const pageId = relativeFilePath ? FernNavigation.PageId(relativeFilePath) : undefined;
        const id = this.#idgen.get(pageId ?? `${prefix}/section`);
        const slug = parentSlug.apply({
            urlSlug: item.slug ?? kebabCase(item.title),
            fullSlug: item.overviewAbsolutePath
                ? this.markdownFilesToFullSlugs.get(item.overviewAbsolutePath)?.split("/")
                : undefined,
            skipUrlSlug: item.skipUrlSlug
        });
        const noindex =
            item.overviewAbsolutePath != null ? this.markdownFilesToNoIndex.get(item.overviewAbsolutePath) : undefined;
        const hiddenSection = hideChildren || item.hidden;
        return {
            id,
            type: "section",
            overviewPageId: pageId,
            slug: slug.get(),
            title: item.title,
            icon: this.resolveIconFileId(item.icon),
            collapsed: item.collapsed,
            hidden: hiddenSection,
            viewers: item.viewers,
            orphaned: item.orphaned,
            children: await Promise.all(
                item.contents.map((child) =>
                    this.toNavigationChild({
                        prefix: id,
                        item: child,
                        parentSlug: slug,
                        hideChildren: hiddenSection,
                        parentAvailability: item.availability ?? parentAvailability
                    })
                )
            ),
            authed: undefined,
            pointsTo: undefined,
            noindex,
            featureFlags: item.featureFlags,
            availability: item.availability ?? parentAvailability
        };
    }

    private async convertTabbedNavigation(
        prefix: string,
        items: docsYml.TabbedNavigation[],
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.TabbedNode> {
        const id = this.#idgen.get(`${prefix}/tabbed`);
        return {
            type: "tabbed",
            id,
            children: await Promise.all(items.map((item) => this.toTabChild(id, item, parentSlug)))
        };
    }

    private async toTabChild(
        prefix: string,
        item: docsYml.TabbedNavigation,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.TabChild> {
        return visitDiscriminatedUnion(item.child)._visit<Promise<FernNavigation.V1.TabChild>>({
            link: ({ href }) => this.toTabLinkNode(item, href),
            layout: ({ layout }) => this.toTabNode(prefix, item, layout, parentSlug),
            changelog: ({ changelog }) => this.toTabChangelogNode(item, changelog, parentSlug),
            variants: ({ variants }) => this.toTabNodeWithVariants(prefix, item, variants, parentSlug)
        });
    }

    private async toTabChangelogNode(
        item: docsYml.TabbedNavigation,
        changelog: AbsoluteFilePath[],
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.ChangelogNode> {
        const changelogResolver = new ChangelogNodeConverter(
            this.markdownFilesToFullSlugs,
            this.markdownFilesToNoIndex,
            this.markdownFilesToTags,
            changelog,
            this.docsWorkspace,
            this.#idgen
        );
        return changelogResolver.toChangelogNode({
            parentSlug,
            title: item.title,
            icon: this.resolveIconFileId(item.icon),
            viewers: item.viewers,
            hidden: item.hidden,
            slug: item.slug
        });
    }

    private async toTabLinkNode(item: docsYml.TabbedNavigation, href: string): Promise<FernNavigation.V1.LinkNode> {
        return {
            type: "link",
            id: this.#idgen.get(href),
            title: item.title,
            url: FernNavigation.V1.Url(href),
            icon: this.resolveIconFileId(item.icon)
        };
    }

    private async toTabNode(
        prefix: string,
        item: docsYml.TabbedNavigation,
        layout: docsYml.DocsNavigationItem[],
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.TabNode> {
        const id = this.#idgen.get(`${prefix}/tab`);
        const slug = parentSlug.apply({
            urlSlug: item.slug ?? kebabCase(item.title),
            skipUrlSlug: item.skipUrlSlug
        });
        return {
            type: "tab",
            id,
            title: item.title,
            slug: slug.get(),
            icon: this.resolveIconFileId(item.icon),
            hidden: item.hidden,
            authed: undefined,
            viewers: item.viewers,
            orphaned: item.orphaned,
            pointsTo: undefined,
            child: await this.toSidebarRootNode(id, layout, slug),
            featureFlags: item.featureFlags
        };
    }

    private async toTabNodeWithVariants(
        prefix: string,
        item: docsYml.TabbedNavigation,
        variants: docsYml.TabVariant[],
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.TabNode> {
        const id = this.#idgen.get(`${prefix}/tab`);
        const slug = parentSlug.apply({
            urlSlug: item.slug ?? kebabCase(item.title),
            skipUrlSlug: item.skipUrlSlug
        });
        return {
            type: "tab",
            id,
            title: item.title,
            slug: slug.get(),
            icon: this.resolveIconFileId(item.icon),
            hidden: item.hidden,
            authed: undefined,
            viewers: item.viewers,
            orphaned: item.orphaned,
            pointsTo: undefined,
            child: await this.toSidebarRootNodeWithVariants(id, variants, slug),
            featureFlags: item.featureFlags
        };
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
        return DocsV1Write.FileId(fileId);
    }

    private resolveIconFileId(
        iconPath: string | AbsoluteFilePath | undefined
    ): DocsV1Write.FileId | string | undefined {
        if (iconPath == null) {
            return undefined;
        }

        if (this.collectedFileIds.has(iconPath as AbsoluteFilePath)) {
            return `file:${this.getFileId(iconPath as AbsoluteFilePath)}`;
        }

        return iconPath as string;
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
                }),
                type: "light"
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
                .map(({ absolutePath, strategy }) => ({
                    fileId: this.getFileId(absolutePath),
                    strategy
                }))
                .filter(isNonNullish),
            remote: this.parsedDocsConfig.js.remote?.map((remote) => ({
                ...remote,
                url: DocsV1Write.Url(remote.url)
            })),
            inline: undefined
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
            url: ({ value }) => ({ type: "url", value: DocsV1Write.Url(value) }),
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

    return `${wrapWithHttps(host)}/${owner}/${repo}/blob/${branch}/fern/${pageFilepath}?plain=1`;
}

function convertAvailability(
    availability: docsYml.RawSchemas.VersionAvailability
): FernNavigation.V1.NavigationV1Availability {
    switch (availability) {
        case "beta":
            return FernNavigation.V1.NavigationV1Availability.Beta;
        case "deprecated":
            return FernNavigation.V1.NavigationV1Availability.Deprecated;
        case "ga":
            return FernNavigation.V1.NavigationV1Availability.GenerallyAvailable;
        case "stable":
            return FernNavigation.V1.NavigationV1Availability.Stable;
        default:
            assertNever(availability);
    }
}
