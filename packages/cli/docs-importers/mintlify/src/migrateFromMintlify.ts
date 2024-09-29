/* eslint-disable no-console */
import { DocsConfiguration, NavigationItem } from "@fern-fern/docs-config/api";
import * as serializer from "@fern-fern/docs-config/serialization";
import { titleCase } from "@fern-api/core-utils";
import fs from "fs";
import grayMatter from "gray-matter";
import jsyaml from "js-yaml";
import path from "path";
import { MintJsonSchema, MintNavigationItemPage, MintlifyFrontmatter } from "./mintlify";
import { AbsoluteFilePath, getAllFilesInDirectory, join, RelativeFilePath, relativize } from "@fern-api/fs-utils";
import { FernRegistry as CjsFdrSdk } from "@fern-fern/fdr-cjs-sdk";

export declare namespace MigrateFromMintlify {
    interface Args {
        mintlifyDirectory: AbsoluteFilePath;
        outputDirectory: AbsoluteFilePath;
        organization: string;
    }
}

export async function migrateFromMintlify({
    mintlifyDirectory,
    outputDirectory,
    organization
}: MigrateFromMintlify.Args): Promise<void> {
    const files = new Set(
        (await getAllFilesInDirectory(mintlifyDirectory)).map((file) => {
            if (file.startsWith(mintlifyDirectory)) {
                return file.slice(mintlifyDirectory.length);
            }
            return file;
        })
    );
    const migrator = new MigrateFromMintlify(mintlifyDirectory, files, outputDirectory, organization);
    await migrator.run();
}

type TransformFileIdOrUrl<T> = {
    [K in keyof T]: T[K] extends CjsFdrSdk.docs.v1.commons.FileIdOrUrl | undefined ? string | undefined : T[K];
};

type FernDocsFrontmatter = Partial<TransformFileIdOrUrl<CjsFdrSdk.docs.latest.Frontmatter>>;

interface MarkdownWithMintlifyFrontmatter {
    fullSlug: readonly string[];
    path: string;
    data: MintlifyFrontmatter;
    content: string;
}

interface MarkdownWithFernDocsFrontmatter {
    path: string;
    data: FernDocsFrontmatter;
    content: string;
}

export class MigrateFromMintlify {
    private markdownFiles: string[];
    private imageFiles: string[];
    private primaryMintJsonFile: string;
    private additionalMintJsonFiles: readonly string[];
    private mintlifyMarkdownPages: Record<string, MarkdownWithMintlifyFrontmatter> = {};
    public constructor(
        private dir: string,
        private files: Set<string>,
        private outputDir: string,
        private organization: string
    ) {
        const mintJsonFiles = Array.from(files).filter((file) => file.endsWith("mint.json"));

        if (mintJsonFiles.length === 0) {
            throw new Error("No mint.json file found.");
        }

        mintJsonFiles.forEach((file) => files.delete(file));
        this.markdownFiles = Array.from(files).filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));
        this.imageFiles = Array.from(files).filter(
            (file) =>
                file.endsWith(".png") ||
                file.endsWith(".jpg") ||
                file.endsWith(".jpeg") ||
                file.endsWith(".svg") ||
                file.endsWith(".gif") ||
                file.endsWith(".mov") ||
                file.endsWith(".ico")
        );

        // find shortest mint.json filename:
        this.primaryMintJsonFile = mintJsonFiles.reduce((a, b) => (a.length <= b.length ? a : b));
        this.additionalMintJsonFiles = mintJsonFiles.filter((file) => file !== this.primaryMintJsonFile);
    }

    public async loadMintlifyMarkdownPages(): Promise<void> {
        await Promise.all(
            this.markdownFiles.map(async (file) => {
                const content = await fs.promises.readFile(path.join(this.dir, file), "utf-8");
                const { data, content: markdownContent } = parseMintlifyFrontmatter(content);
                const key = file.replace(/\.(md|mdx)$/, "");
                this.mintlifyMarkdownPages[key] = {
                    fullSlug: key.split("/"),
                    path: file,
                    data,
                    content: markdownContent
                };
            })
        );
    }

    public async run(): Promise<void> {
        // if the output directory exists, delete it
        if (fs.existsSync(this.outputDir)) {
            fs.rmdirSync(this.outputDir, { recursive: true });
        }

        // create the output directory
        fs.mkdirSync(this.outputDir, { recursive: true });

        const fernDir = path.join(this.outputDir, "fern");
        fs.mkdirSync(fernDir, { recursive: true });

        // create fern.config.json
        const fernConfig = {
            organization: this.organization,
            version: "0.22.0"
        };

        await fs.promises.writeFile(path.join(fernDir, "fern.config.json"), JSON.stringify(fernConfig, null, 4));

        await this.loadMintlifyMarkdownPages();
        const mintJsonContent = await fs.promises.readFile(path.join(this.dir, this.primaryMintJsonFile), "utf-8");
        const mint = JSON.parse(mintJsonContent) as MintJsonSchema;
        const docsYml = await serializeDocsConfigToYaml(this.migrateMintlifyToDocsConfig(mint));

        await fs.promises.writeFile(path.join(fernDir, "docs.yml"), docsYml);

        const convertedMarkdownFiles = new Map(
            Object.entries(this.mintlifyMarkdownPages).map(
                ([slug, page]) =>
                    [slug.toLowerCase(), this.convertMintlifyToFernMarkdown(page, slug.toLowerCase())] as const
            )
        );

        // convert all markdown files and write them to the output directory
        await Promise.all(
            [...convertedMarkdownFiles.values()].map(async (page) => {
                const { path: filePath, data, content } = page;
                const frontmatter =
                    Object.keys(data).length > 0 ? `---\n${jsyaml.dump(JSON.parse(JSON.stringify(data)))}---\n\n` : "";
                const absoluteFilePath = path.join(fernDir, filePath);
                const dir = path.dirname(absoluteFilePath);
                await fs.promises.mkdir(dir, { recursive: true });
                await fs.promises.writeFile(
                    absoluteFilePath,
                    `${frontmatter}${this.transformMarkdownContent(content, filePath, convertedMarkdownFiles)}`
                );
            })
        );

        // copy all image files
        await Promise.all(
            this.imageFiles.map(async (file) => {
                const absoluteFilePath = path.join(this.dir, file);
                const newFilePath = path.join(fernDir, file);
                await fs.promises.mkdir(path.dirname(newFilePath), { recursive: true });
                await fs.promises.copyFile(absoluteFilePath, newFilePath);
            })
        );

        // create openapi folder
        if (mint.openapi != null) {
            const openapiDir = path.join(fernDir, "openapi");
            fs.mkdirSync(openapiDir, { recursive: true });
            const firstOpenapi = typeof mint.openapi === "string" ? mint.openapi : mint.openapi[0];
            if (firstOpenapi != null) {
                const openapiFilePath = path.join(this.dir, firstOpenapi);
                const newOpenapiFilePath = path.join(openapiDir, `openapi${path.extname(firstOpenapi)}`);
                await fs.promises.copyFile(openapiFilePath, newOpenapiFilePath);
            }
            if (typeof mint.openapi !== "string" && mint.openapi.length > 1) {
                console.warn("Multiple OpenAPI files are not supported yet in this migrator.");
            }
        }
    }

    private transformMarkdownContent(
        content: string,
        filePath: string,
        markdownPageByKey: Map<string, MarkdownWithFernDocsFrontmatter>
    ): string {
        const absoluteFilePath = path.join(this.outputDir, "fern", filePath);
        content = content.replaceAll(/src=["']([^"']+)["']/g, (original, p) => {
            if (isExternalUrl(p)) {
                return original;
            }

            if (p.startsWith("/")) {
                const absolutePath = path.join(this.outputDir, "fern", stripLeadingSlash(p));

                // get the relative path to the current filePath
                const relativePath = path.relative(path.dirname(absoluteFilePath), absolutePath);
                return `src="${relativePath}"`;
            }

            console.log(`Could not find image for src: ${p} in ${filePath}`);
            return original;
        });

        content = content.replaceAll(/href=["'](.*)["']/g, (original, p: string) => {
            if (isExternalUrl(p)) {
                return original;
            }

            p = stripLeadingSlash(p);

            const markdownPage = markdownPageByKey.get(p.toLowerCase());

            if (markdownPage != null) {
                const absoluteTargetPath = path.join(this.outputDir, "fern", markdownPage.path);
                const relativePath = path.relative(path.dirname(absoluteFilePath), absoluteTargetPath);
                console.log(absoluteFilePath, relativePath, filePath);
                return `href="${relativePath}"`;
            }

            console.log(`Could not find markdown page for href: ${p} in ${filePath}`);

            return original;
        });

        // markdown links
        content = content.replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, (original, text, p: string) => {
            if (isExternalUrl(p)) {
                return original;
            }

            p = stripLeadingSlash(p);

            let markdownPage = markdownPageByKey.get(p.toLowerCase());

            if (markdownPage != null) {
                const absoluteTargetPath = path.join(this.outputDir, "fern", markdownPage.path);
                const relativePath = path.relative(path.dirname(absoluteFilePath), absoluteTargetPath);
                return `[${text}](${relativePath})`;
            }

            p = path.join(path.dirname(filePath), p);
            markdownPage = markdownPageByKey.get(p.toLowerCase());

            if (markdownPage != null) {
                const absoluteTargetPath = path.join(this.outputDir, "fern", markdownPage.path);
                const relativePath = path.relative(path.dirname(absoluteFilePath), absoluteTargetPath);
                return `[${text}](${relativePath})`;
            }

            console.log(`Could not find markdown page for link: ${p} in ${filePath}`);

            return original;
        });

        return content;
    }

    private convertMintlifyToFernMarkdown(
        mintlify: MarkdownWithMintlifyFrontmatter,
        slug: string
    ): MarkdownWithFernDocsFrontmatter {
        const { data, content } = mintlify;
        if (data.mode === "custom") {
            console.warn("Custom mode is not supported in fern.");
        }
        if (slug === "readme") {
            return {
                path: mintlify.path,
                data: {},
                content
            };
        }

        return {
            path: mintlify.path,
            data: {
                title: data.title,
                subtitle: data.description,
                layout: data.mode != null ? "reference" : undefined,
                // TODO: (rohin) investigate this more; it seems like mintlify isn't reliant on fdr, so not sure if there's a transformation here.
                image: data["og:image"],
                slug
            },
            content
        };
    }

    public getPrimaryMintJsonFile(): string {
        return this.primaryMintJsonFile;
    }

    public getAdditionalMintJsonFiles(): readonly string[] {
        return this.additionalMintJsonFiles;
    }

    private migrateMintlifyToDocsConfig(mint: MintJsonSchema): DocsConfiguration {
        if (mint.analytics != null) {
            console.warn("Analytics configuration is not supported in docs.yml.");
        }

        if (mint.integrations != null) {
            console.warn("Integrations configuration is not supported in docs.yml.");
        }

        if (mint.feedback != null) {
            console.warn("Feedback configuration is not supported in docs.yml.");
        }

        if (mint.footerSocials != null) {
            console.warn("Footer socials configuration is not supported in docs.yml.");
        }

        if (mint.isWhiteLabeled != null) {
            console.warn("White label configuration is not supported in docs.yml.");
        }

        if (mint.search != null) {
            console.warn("Search configuration is not supported in docs.yml.");
        }

        if (mint.redirects != null) {
            console.warn("Redirects configuration is not supported in docs.yml.");
        }

        if (mint.seo != null) {
            console.warn("SEO configuration is not supported in docs.yml.");
        }

        return {
            instances: [],
            title: mint.name,
            logo: this.migrateLogo(mint.logo),
            favicon: path.join(stripLeadingSlash(mint.favicon)),
            backgroundImage: mint.backgroundImage,
            colors: this.migrateColors(mint.colors),
            navbarLinks: this.migrateNavbarLinks(mint.topbarCtaButton, mint.topbarLinks),
            versions: this.migrateVersions(mint.versions),
            tabs: this.migrateTabs(mint.tabs, mint.topAnchor, mint.anchors),
            layout: {
                tabsPlacement: mint.tabs != null && mint.anchors == null ? "header" : "sidebar",
                searchbarPlacement: "header"
            },
            navigation: this.migrateNavigation(mint.navigation)
        };
    }

    public migrateLogo(logo: MintJsonSchema["logo"]): DocsConfiguration["logo"] {
        if (logo == null) {
            return undefined;
        }

        // TODO: add support for single-string logo in docs.yml
        if (typeof logo === "string") {
            return {
                light: path.join(stripLeadingSlash(logo)),
                dark: path.join(stripLeadingSlash(logo)),
                height: 28 // mintlify's default height (1.75rem)
            };
        }

        return {
            light: path.join(stripLeadingSlash(logo.light)),
            dark: path.join(stripLeadingSlash(logo.dark)),
            href: logo.href,
            height: 28 // mintlify's default height (1.75rem)
        };
    }

    public migrateVersions(versions: MintJsonSchema["versions"]): DocsConfiguration["versions"] {
        if (versions == null) {
            return undefined;
        }

        throw new Error("Not implemented: migrateVersions");
    }

    public migrateColors(colors: MintJsonSchema["colors"]): DocsConfiguration["colors"] {
        return {
            accentPrimary: {
                // TODO: verify that we want to use colors.dark/light as the primary accent color
                dark: colors.dark ?? colors.primary,
                light: colors.light ?? colors.primary
            },
            background: {
                dark: colors.background?.dark,
                light: colors.background?.light
            }
        };
    }

    public migrateNavbarLinks(
        topbarCtaButton: MintJsonSchema["topbarCtaButton"],
        topbarLinks: MintJsonSchema["topbarLinks"]
    ): DocsConfiguration["navbarLinks"] {
        if (topbarCtaButton == null && topbarLinks == null) {
            return undefined;
        }

        const links: DocsConfiguration["navbarLinks"] = [];

        topbarLinks?.forEach((link) => {
            if (link.type === "github") {
                console.warn("GitHub links in the navbar are not supported in docs.yml.");
            }
            links.push({
                type: "secondary",
                text: link.type === "github" ? "GitHub" : link.name,
                url: link.url
            });
        });

        if (topbarCtaButton != null) {
            if (topbarCtaButton.type === "github") {
                console.warn("GitHub links in the navbar are not supported in docs.yml.");
            }
            links.push({
                type: "primary",
                text: topbarCtaButton.type === "github" ? "GitHub" : topbarCtaButton.name,
                url: topbarCtaButton.url
            });
        }

        return links;
    }

    public migrateTabs(
        mintTabs: MintJsonSchema["tabs"],
        mintTopAnchor: MintJsonSchema["topAnchor"],
        mintAnchors: MintJsonSchema["anchors"]
    ): DocsConfiguration["tabs"] {
        if (mintTabs == null && mintAnchors == null && mintTopAnchor == null) {
            return undefined;
        }

        if (mintTabs != null && mintAnchors != null) {
            console.warn("Tabs and anchors are not supported together in docs.yml.");
        }

        const tabs: DocsConfiguration["tabs"] = {};

        mintTabs?.forEach((tab) => {
            if (tab.isDefaultHidden) {
                console.warn(`Tab "${tab.name}" is hidden by default. This is not supported in docs.yml.`);
            }

            if (tab.version != null) {
                console.warn(`Tab "${tab.name}" has a version. This is not supported in docs.yml.`);
            }

            if (isExternalUrl(tab.url)) {
                console.warn(`Tab "${tab.name}" has an external URL. This is not supported in docs.yml.`);
                return; // skip
            }

            tabs[tab.name] = {
                displayName: tab.name,
                slug: tab.url
            };
        });

        if (mintTopAnchor != null) {
            console.warn("Top anchor is not supported in docs.yml.");
        }

        mintAnchors?.forEach((anchor) => {
            if (anchor.isDefaultHidden) {
                console.warn(`Anchor "${anchor.name}" is hidden by default. This is not supported in docs.yml.`);
            }

            if (anchor.version != null) {
                console.warn(`Anchor "${anchor.name}" has a version. This is not supported in docs.yml.`);
            }

            if (anchor.color != null) {
                console.warn(`Anchor "${anchor.name}" has a color. This is not supported in docs.yml.`);
            }

            if (isExternalUrl(anchor.url)) {
                console.warn(`Tab "${anchor.name}" has an external URL. This is not supported in docs.yml.`);
                return; // skip
            }

            tabs[anchor.name] = {
                displayName: anchor.name,
                slug: anchor.url,
                icon: getIcon(anchor)
            };
        });

        return tabs;
    }

    public migrateNavigation(navigation: MintJsonSchema["navigation"]): DocsConfiguration["navigation"] {
        if (navigation == null) {
            return undefined;
        }

        const items = this.migrateNavigationItems(navigation);

        // TODO: implement folder-level navigation handling
        // TODO: implement version/tab handlers

        return items;
    }

    public migrateNavigationItems(items: MintNavigationItemPage[]): NavigationItem[] {
        return items
            .map((item): NavigationItem | undefined => {
                if (typeof item === "string") {
                    const markdownPage = this.mintlifyMarkdownPages[item];

                    if (markdownPage == null) {
                        console.warn(`Navigation item "${item}" does not have a corresponding markdown file.`);
                        return;
                    }

                    const { data, fullSlug, path } = markdownPage;

                    if (data.api != null || data.openapi) {
                        // console.warn(`Navigation item "${item}" is an API reference. This is not supported yet.`);
                        return;
                    }

                    const sidebarTitle =
                        data.sidebarTitle ?? data.title ?? titleCase(fullSlug[fullSlug.length - 1] ?? "");

                    const icon = getIcon(data);

                    if (data.url != null) {
                        return {
                            link: sidebarTitle,
                            href: data.url,
                            icon
                        };
                    }

                    return {
                        page: sidebarTitle,
                        path,
                        icon
                    };
                }

                if (item.version != null) {
                    console.warn(`Navigation item "${item.group}" has a version. This is not supported yet.`);
                }
                return {
                    section: item.group,
                    icon: getIcon(item),
                    contents: this.migrateNavigationItems(item.pages)
                };
            })
            .filter((item): item is NavigationItem => item != null);
    }
}

function getIcon({ icon, iconType }: { icon?: string; iconType?: string }): string | undefined {
    return iconType != null && icon != null ? `${iconType} ${icon}` : icon;
}

function isExternalUrl(url: string): boolean {
    return url.startsWith("http:") || url.startsWith("https:") || url.startsWith("mailto:") || url.startsWith("tel:");
}

function parseMintlifyFrontmatter(mdContent: string): { data: MintlifyFrontmatter; content: string } {
    const { data, content } = grayMatter(mdContent);
    return { data: data as MintlifyFrontmatter, content };
}

export async function serializeDocsConfigToYaml(docs: DocsConfiguration): Promise<string> {
    const serializableDocsConfig = await serializer.DocsConfiguration.jsonOrThrow(JSON.parse(JSON.stringify(docs)));

    return jsyaml.dump(serializableDocsConfig, {
        quotingType: '"'
    });
}

function stripLeadingSlash(str: string): string;
function stripLeadingSlash(str: string | undefined): string | undefined;
function stripLeadingSlash(str: string | undefined): string | undefined {
    return str?.replace(/^\/+/, "");
}
