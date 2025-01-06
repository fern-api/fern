import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { readFile, stat } from "fs/promises";
import matter from "gray-matter";
import { kebabCase } from "lodash-es";
import urlJoin from "url-join";

import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { WithoutQuestionMarks, docsYml, parseDocsConfiguration } from "@fern-api/configuration-loader";
import { assertNever, isNonNullish, visitDiscriminatedUnion } from "@fern-api/core-utils";
import {
    parseImagePaths,
    replaceImagePathsAndUrls,
    replaceReferencedCode,
    replaceReferencedMarkdown
} from "@fern-api/docs-markdown-utils";
import { APIV1Write, DocsV1Write, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, RelativeFilePath, listFiles, relative, relativize, resolve } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";

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

export type PlaygroundConfig = Pick<docsYml.RawSchemas.PlaygroundSettings, "oauth">;

type AsyncOrSync<T> = T | Promise<T>;

type UploadFilesFn = (files: FilePathPair[]) => AsyncOrSync<UploadedFile[]>;

type RegisterApiFn = (opts: {
    ir: IntermediateRepresentation;
    snippetsConfig: APIV1Write.SnippetsConfig;
    playgroundConfig?: PlaygroundConfig;
    apiName?: string;
}) => AsyncOrSync<string>;

const defaultUploadFiles: UploadFilesFn = (files) => {
    return files.map((file) => ({ ...file, fileId: String(file.relativeFilePath) }));
};

let apiCounter = 0;
const defaultRegisterApi: RegisterApiFn = async ({ ir }) => {
    apiCounter++;
    return `${ir.apiName.snakeCase.unsafeName}-${apiCounter}`;
};

export class DocsDefinitionResolver {
    constructor(
        private domain: string,
        private docsWorkspace: DocsWorkspace,
        private fernWorkspaces: FernWorkspace[],
        private taskContext: TaskContext,
        // Optional
        private editThisPage?: docsYml.RawSchemas.EditThisPageConfig,
        private uploadFiles: UploadFilesFn = defaultUploadFiles,
        private registerApi: RegisterApiFn = defaultRegisterApi
    ) {}

    #idgen = NodeIdGenerator.init();

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
        this._parsedDocsConfig = await parseDocsConfiguration({
            rawDocsConfiguration: this.docsWorkspace.config,
            context: this.taskContext,
            absolutePathToFernFolder: this.docsWorkspace.absoluteFilePath,
            absoluteFilepathToDocsConfig: this.docsWorkspace.absoluteFilepathToDocsConfig
        });

        // track all changelog markdown files in parsedDocsConfig.pages
        this.fernWorkspaces.forEach((workspace) => {
            workspace.changelog?.files.forEach((file) => {
                const relativePath = relative(this.docsWorkspace.absoluteFilePath, file.absoluteFilepath);
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
                absolutePathToFernFolder: this.docsWorkspace.absoluteFilePath,
                absolutePathToMdx: this.resolveFilepath(relativePath),
                context: this.taskContext
            });
        }

        // replaces all instances of <Code src="path/to/file.js" /> with the content of the referenced code file
        for (const [relativePath, markdown] of Object.entries(this.parsedDocsConfig.pages)) {
            this.parsedDocsConfig.pages[RelativeFilePath.of(relativePath)] = await replaceReferencedCode({
                markdown,
                absolutePathToFernFolder: this.docsWorkspace.absoluteFilePath,
                absolutePathToMdx: this.resolveFilepath(relativePath),
                context: this.taskContext
            });
        }

        const filesToUploadSet = collectFilesFromDocsConfig(this.parsedDocsConfig);

        // preprocess markdown files to extract image paths
        for (const [relativePath, markdown] of Object.entries(this.parsedDocsConfig.pages)) {
            const { filepaths, markdown: newMarkdown } = parseImagePaths(markdown, {
                absolutePathToMdx: this.resolveFilepath(relativePath),
                absolutePathToFernFolder: this.docsWorkspace.absoluteFilePath
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
                    absolutePathToFernFolder: this.docsWorkspace.absoluteFilePath
                },
                this.taskContext
            );
        }

        const pages: Record<DocsV1Write.PageId, DocsV1Write.PageContent> = {};

        Object.entries(this.parsedDocsConfig.pages).forEach(([relativePageFilepath, markdown]) => {
            const url = createEditThisPageUrl(this.editThisPage, relativePageFilepath);
            pages[DocsV1Write.PageId(relativePageFilepath)] = {
                markdown,
                editThisPageUrl: url ? DocsV1Write.Url(url) : undefined
            };
        });

        const config = await this.convertDocsConfiguration();

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
        const root = await this.toRootNode();
        const config: DocsV1Write.DocsConfig = {
            title: this.parsedDocsConfig.title,
            logoHeight: this.parsedDocsConfig.logo?.height,
            logoHref: this.parsedDocsConfig.logo?.href ? DocsV1Write.Url(this.parsedDocsConfig.logo?.href) : undefined,
            favicon: this.getFileId(this.parsedDocsConfig.favicon),
            navigation: undefined, // <-- this is now deprecated
            root,
            colorsV3: this.convertColorConfigImageReferences(),
            navbarLinks: this.parsedDocsConfig.navbarLinks?.map((navbarLink) => ({
                ...navbarLink,
                url: DocsV1Write.Url(navbarLink.url)
            })),
            typographyV2: this.convertDocsTypographyConfiguration(),
            layout: this.parsedDocsConfig.layout,
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
                gtm: undefined,
                ga4: undefined,
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
            roles: this.parsedDocsConfig.roles?.map((role) => FernNavigation.RoleId(role))
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
            versioned: (versioned) => this.toVersionedNode(versioned, slug)
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
            icon: landingPageConfig.icon,
            hidden: landingPageConfig.hidden,
            viewers: landingPageConfig.viewers,
            orphaned: landingPageConfig.orphaned,
            pageId,
            authed: undefined,
            noindex: undefined
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
            landingPage: version.landingPage ? this.toLandingPageNode(version.landingPage, parentSlug) : undefined,
            hidden: undefined,
            authed: undefined,
            viewers: version.viewers,
            orphaned: version.orphaned,
            icon: undefined,
            pointsTo: undefined
        };
    }

    private async toSidebarRootNode(
        prefix: string,
        items: docsYml.DocsNavigationItem[],
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.SidebarRootNode> {
        const id = this.#idgen.get(`${prefix}/root`);

        const children = await Promise.all(items.map((item) => this.toNavigationChild(id, item, parentSlug)));

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

    private async toNavigationChild(
        prefix: string,
        item: docsYml.DocsNavigationItem,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.NavigationChild> {
        return visitDiscriminatedUnion(item)._visit<Promise<FernNavigation.V1.NavigationChild>>({
            page: async (value) => this.toPageNode(value, parentSlug),
            apiSection: async (value) => this.toApiSectionNode(value, parentSlug),
            section: async (value) => this.toSectionNode(prefix, value, parentSlug),
            link: async (value) => this.toLinkNode(value),
            changelog: async (value) => this.toChangelogNode(value, parentSlug)
        });
    }

    private async toApiSectionNode(
        item: docsYml.DocsNavigationItem.ApiSection,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.ApiReferenceNode> {
        const workspace = this.getFernWorkspaceForApiSection(item);
        const snippetsConfig = convertDocsSnippetsConfigToFdr(item.snippetsConfiguration);
        const ir = generateIntermediateRepresentation({
            workspace,
            audiences: item.audiences,
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: false,
            disableExamples: false,
            readme: undefined,
            version: undefined,
            packageName: undefined,
            context: this.taskContext,
            sourceResolver: new SourceResolverImpl(this.taskContext, workspace)
        });
        const apiDefinitionId = await this.registerApi({
            ir,
            snippetsConfig,
            playgroundConfig: { oauth: item.playground?.oauth },
            apiName: item.apiName
        });
        const api = convertIrToApiDefinition(ir, apiDefinitionId, { oauth: item.playground?.oauth });
        const node = new ApiReferenceNodeConverter(
            item,
            api,
            parentSlug,
            workspace,
            this.docsWorkspace,
            this.taskContext,
            this.markdownFilesToFullSlugs,
            this.#idgen
        );
        return node.get();
    }

    private async toChangelogNode(
        item: docsYml.DocsNavigationItem.Changelog,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.ChangelogNode> {
        const changelogResolver = new ChangelogNodeConverter(
            this.markdownFilesToFullSlugs,
            item.changelog,
            this.docsWorkspace,
            this.#idgen
        );

        return changelogResolver.toChangelogNode({
            parentSlug,
            title: item.title,
            icon: item.icon,
            viewers: item.viewers,
            hidden: item.hidden,
            slug: item.slug
        });
    }

    private async toLinkNode(item: docsYml.DocsNavigationItem.Link): Promise<FernNavigation.V1.LinkNode> {
        return {
            type: "link",
            id: this.#idgen.get(item.url),
            title: item.text,
            url: FernNavigation.V1.Url(item.url),
            icon: item.icon
        };
    }

    private async toPageNode(
        item: docsYml.DocsNavigationItem.Page,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.PageNode> {
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
            icon: item.icon,
            hidden: item.hidden,
            viewers: item.viewers,
            orphaned: item.orphaned,
            pageId,
            authed: undefined,
            noindex: undefined
        };
    }

    private async toSectionNode(
        prefix: string,
        item: docsYml.DocsNavigationItem.Section,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.SectionNode> {
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
        return {
            id,
            type: "section",
            overviewPageId: pageId,
            slug: slug.get(),
            title: item.title,
            icon: item.icon,
            collapsed: item.collapsed,
            hidden: item.hidden,
            viewers: item.viewers,
            orphaned: item.orphaned,
            children: await Promise.all(item.contents.map((child) => this.toNavigationChild(id, child, slug))),
            authed: undefined,
            pointsTo: undefined,
            noindex: undefined
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
            changelog: ({ changelog }) => this.toTabChangelogNode(item, changelog, parentSlug)
        });
    }

    private async toTabChangelogNode(
        item: docsYml.TabbedNavigation,
        changelog: AbsoluteFilePath[],
        parentSlug: FernNavigation.V1.SlugGenerator
    ): Promise<FernNavigation.V1.ChangelogNode> {
        const changelogResolver = new ChangelogNodeConverter(
            this.markdownFilesToFullSlugs,
            changelog,
            this.docsWorkspace,
            this.#idgen
        );
        return changelogResolver.toChangelogNode({
            parentSlug,
            title: item.title,
            icon: item.icon,
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
            icon: item.icon
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
            icon: item.icon,
            hidden: item.hidden,
            authed: undefined,
            viewers: item.viewers,
            orphaned: item.orphaned,
            pointsTo: undefined,
            child: await this.toSidebarRootNode(id, layout, slug)
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
