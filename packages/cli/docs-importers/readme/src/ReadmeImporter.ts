import { mkdir, writeFile } from "fs/promises";
import type { Root as HastRoot } from "hast";

import { docsYml } from "@fern-api/configuration";
import { DEFAULT_LAYOUT, DocsImporter, FernDocsBuilder } from "@fern-api/docs-importer-commons";
import { AbsoluteFilePath, RelativeFilePath, dirname, join as fsUtilsJoin, relativize } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";

import { getFavicon } from "./extract/favicon";
import { getTitle } from "./extract/title";
import { parsePage } from "./parse/parsePage";
import { retrieveRootNavElement } from "./parse/parseRootNav";
import { parseSidebar } from "./parse/parseSidebar";
import { parseTabLinks } from "./parse/parseTabs";
import { scrapedNavigationGroup, scrapedNavigationPage, scrapedNavigationSection } from "./types/scrapedNavigation";
import { getColors } from "./utils/colors";
import { getLogos } from "./utils/files/logo";
import { htmlToHast } from "./utils/hast";
import { fetchPageHtml, startPuppeteer } from "./utils/network";

export declare namespace ReadmeImporter {
    interface Args {
        context: TaskContext;
        url: string;
        /**
         * Absolute path to the Fern directory where the imported docs will be stored
         */
        absolutePathToFernDirectory: AbsoluteFilePath;

        builder: FernDocsBuilder;
    }
}

export class ReadmeImporter extends DocsImporter<object> {
    private readonly url: URL;
    private readonly logger: Logger;
    private readonly absolutePathToFernDirectory: AbsoluteFilePath;

    constructor(args: ReadmeImporter.Args) {
        super({ context: args.context });
        this.url = typeof args.url === "string" ? new URL(args.url) : args.url;
        this.logger = args.context.logger;
        this.absolutePathToFernDirectory = args.absolutePathToFernDirectory;
    }

    public async import({ args, builder }: { args: object; builder: FernDocsBuilder }): Promise<void> {
        builder.setLayout({ layout: DEFAULT_LAYOUT });

        const hast = await this.getHastForUrl(this.url);
        const tabs = parseTabLinks(hast) ?? [];

        if (tabs.length === 0) {
            this.logger.debug("No tabs found on the page");
        } else {
            this.logger.debug(`Found ${tabs.length} tabs:`);
            for (const tab of tabs) {
                this.logger.debug(`  - Tab: ${tab.name} (${tab.url})`);
            }
        }

        for (const tab of tabs) {
            const sidebar = await this.scrapeTab({
                name: tab.name,
                url: tab.url
            });
            if (!sidebar) {
                continue;
            }
            const nav = builder.getNavigationBuilder({
                tabId: this.kebabCaseWithoutEmojis(tab.name),
                tabConfig: {
                    slug: tab.url,
                    displayName: tab.name
                }
            });
            const absolutePathToOutputDirectory = fsUtilsJoin(
                this.absolutePathToFernDirectory,
                RelativeFilePath.of(this.kebabCaseWithoutEmojis(tab.name))
            );
            await this.downloadMarkdownPages({
                absolutePathToOutputDirectory,
                sections: sidebar
            });
            const navigationItems = await this.getNavigationItems({ absolutePathToOutputDirectory, sections: sidebar });
            for (const item of navigationItems) {
                nav.addItem({ item });
            }
        }

        const browser = await startPuppeteer();

        const logo = await getLogos(this.url, browser);
        if (logo != null) {
            builder.setLogo({ logo });
        }

        const title = await getTitle(hast);
        builder.setTitle({ title });

        const favicon = await getFavicon(hast);
        if (favicon != null) {
            const assetsDirectory = await this.getAndCreateAssetsDirectory();
            const response = await fetch(favicon);
            if (response.ok) {
                const imageBuffer = Buffer.from(await response.arrayBuffer());
                const faviconPath = fsUtilsJoin(assetsDirectory, RelativeFilePath.of("favicon"));
                await writeFile(faviconPath, new Uint8Array(imageBuffer));
                builder.setFavicon({ favicon: relativize(this.absolutePathToFernDirectory, faviconPath) });
            }
        }

        const colors = await getColors(hast);
        builder.setColors({ colors });

        if (browser) {
            await browser.close();
        }

        builder.build({ outputDirectory: this.absolutePathToFernDirectory });
    }

    /**
     * Gets the assets directory path and creates it if it doesn't exist
     * @returns The absolute path to the assets directory
     */
    private async getAndCreateAssetsDirectory(): Promise<AbsoluteFilePath> {
        const assetsDirectory = fsUtilsJoin(this.absolutePathToFernDirectory, RelativeFilePath.of("assets"));

        // Create the directory if it doesn't exist
        await mkdir(assetsDirectory, { recursive: true });

        return assetsDirectory;
    }

    /**
     * Scrapes a single tab from the Readme docs site
     * @param tab The tab to scrape
     * @returns The scraped content for the tab
     */
    private async scrapeTab({
        name,
        url
    }: {
        name: string;
        url: string;
    }): Promise<Array<scrapedNavigationSection> | undefined> {
        try {
            this.logger.debug(`Scraping tab: ${name} (${url})`);

            const tabUrl = new URL(url, this.url);
            const hast = await this.getHastForUrl(tabUrl);
            const sidebar = retrieveRootNavElement(hast);

            if (!sidebar) {
                this.logger.debug(`No sidebar element found for tab: ${name} (${url})`);
                return;
            }

            const navItems = parseSidebar(sidebar);
            this.logger.debug(`Successfully scraped tab: ${name}`);

            return navItems;
        } catch (error) {
            this.logger.error(
                `Failed to scrape tab ${name}: ${error instanceof Error ? error.message : String(error)}`
            );
            if (error instanceof Error && error.stack) {
                this.logger.error(`Stack trace: ${error.stack}`);
            }
        }
        return undefined;
    }

    /**
     * Fetches HTML content from a URL and converts it to a HAST (HTML Abstract Syntax Tree)
     * @param url The URL to fetch and parse
     * @returns The HAST representation of the HTML content
     */
    private async getHastForUrl(url: URL | string): Promise<HastRoot> {
        const html = await fetchPageHtml({ url });
        return htmlToHast(html);
    }

    /**
     * Recursively downloads markdown content for all navigation items
     * @param sections The navigation sections to process
     * @returns A map of URLs to their downloaded markdown content
     */
    private async downloadMarkdownPages({
        absolutePathToOutputDirectory,
        sections
    }: {
        absolutePathToOutputDirectory: AbsoluteFilePath;
        sections: Array<scrapedNavigationSection>;
    }): Promise<void> {
        for (const section of sections) {
            this.logger.debug(`Processing section: ${section.group}`);
            const absolutePathToOutputDirectoryForSection = this.getAbsolutePathToOutputDirectoryForSection({
                absolutePathToOutputDirectory,
                section
            });

            await mkdir(absolutePathToOutputDirectoryForSection, { recursive: true });

            await Promise.all(
                section.pages
                    .filter((page): page is scrapedNavigationPage => page.type === "page")
                    .map(async (page) => {
                        const url = new URL(page.slug.toString(), this.url);
                        this.logger.debug(`Fetching page: ${url.toString()}`);
                        const html = await fetchPageHtml({ url });

                        // Parse the HTML content into MDX using parsePage
                        const result = await parsePage({
                            logger: this.logger,
                            html,
                            url
                        });

                        // If parsing was successful, use the MDX content instead of raw HTML
                        if (result.success && result.data) {
                            const absolutePathForPage = this.getAbsolutePathToOutputFileForPage({
                                absolutePathToOutputDirectoryForSection,
                                page: page.slug
                            });

                            await writeFile(absolutePathForPage, result.data.mdx);

                            // Download and save images used in the page
                            if (result.data.images.imageURLs.length > 0) {
                                this.logger.debug(
                                    `Found ${result.data.images.imageURLs.length} images to download for ${url.toString()}`
                                );

                                // Download each image
                                await Promise.all(
                                    Object.entries(result.data.images.imageURLToFilename).map(
                                        async ([imageUrl, filename]) => {
                                            try {
                                                const response = await fetch(imageUrl);
                                                if (!response.ok) {
                                                    this.logger.warn(
                                                        `Failed to download image ${imageUrl}, status: ${response.status}`
                                                    );
                                                    return;
                                                }

                                                const imageBuffer = Buffer.from(await response.arrayBuffer());
                                                const imagePath = fsUtilsJoin(
                                                    absolutePathToOutputDirectoryForSection,
                                                    RelativeFilePath.of(filename)
                                                );

                                                // Ensure the directory exists for the image
                                                const imageDir = dirname(imagePath);
                                                await mkdir(imageDir, { recursive: true });

                                                await writeFile(imagePath, new Uint8Array(imageBuffer));
                                                this.logger.debug(`Saved image to ${imagePath}`);
                                            } catch (error) {
                                                this.logger.warn(`Error downloading image ${imageUrl}: ${error}`);
                                            }
                                        }
                                    )
                                );
                            }
                        } else {
                            this.logger.warn(`Failed to parse page ${url.toString()}, skipping`);
                        }
                    })
            );

            // Process nested navigation groups recursively
            await Promise.all(
                section.pages
                    .filter((page): page is scrapedNavigationGroup => page.type === "group")
                    .map(async (nestedGroup) => {
                        this.logger.debug(`Processing nested group: ${nestedGroup.group}`);
                        await this.downloadMarkdownPages({
                            absolutePathToOutputDirectory: absolutePathToOutputDirectoryForSection,
                            sections: [{ type: "group", group: nestedGroup.group, pages: nestedGroup.pages }]
                        });
                    })
            );
        }
    }

    private async getNavigationItems({
        absolutePathToOutputDirectory,
        sections
    }: {
        absolutePathToOutputDirectory: AbsoluteFilePath;
        sections: Array<scrapedNavigationSection>;
    }): Promise<docsYml.RawSchemas.NavigationItem[]> {
        const navigationItems: docsYml.RawSchemas.NavigationItem[] = [];

        for (const section of sections) {
            const absolutePathToOutputDirectoryForSection = this.getAbsolutePathToOutputDirectoryForSection({
                absolutePathToOutputDirectory,
                section
            });

            // Create a navigation item for the section
            const sectionItem: docsYml.RawSchemas.SectionConfiguration = {
                section: section.group,
                contents: [],
                slug: this.kebabCaseWithoutEmojis(section.group)
            };

            for (const page of section.pages) {
                if (page.type === "page") {
                    sectionItem.contents.push({
                        page: page.page,
                        path: relativize(
                            this.absolutePathToFernDirectory,
                            this.getAbsolutePathToOutputFileForPage({
                                absolutePathToOutputDirectoryForSection,
                                page: page.slug
                            })
                        )
                    });
                } else {
                    const nestedItems = await this.getNavigationItems({
                        absolutePathToOutputDirectory: absolutePathToOutputDirectoryForSection,
                        sections: [page]
                    });
                    sectionItem.contents.push(...nestedItems);
                }
            }

            navigationItems.push(sectionItem);
        }

        return navigationItems;
    }

    /**
     * Gets the absolute path to the output file for a page
     * @param absolutePathToOutputDirectoryForSection The absolute path to the output directory for the section
     * @param page The page name or path
     * @returns The absolute path to the output file for the page
     */
    private getAbsolutePathToOutputFileForPage({
        absolutePathToOutputDirectoryForSection,
        page
    }: {
        absolutePathToOutputDirectoryForSection: AbsoluteFilePath;
        page: string;
    }): AbsoluteFilePath {
        return fsUtilsJoin(
            absolutePathToOutputDirectoryForSection,
            RelativeFilePath.of(`${this.kebabCaseWithoutEmojis(page.split("/").pop() || page)}.mdx`)
        );
    }

    /**
     * Creates the absolute path to the output directory for a section
     * @param params The parameters for creating the output directory path
     * @returns The absolute path to the output directory for the section
     */
    private getAbsolutePathToOutputDirectoryForSection({
        absolutePathToOutputDirectory,
        section
    }: {
        absolutePathToOutputDirectory: AbsoluteFilePath;
        section: scrapedNavigationSection;
    }): AbsoluteFilePath {
        return fsUtilsJoin(
            absolutePathToOutputDirectory,
            RelativeFilePath.of(this.kebabCaseWithoutEmojis(section.group))
        );
    }

    /**
     * Converts a string to kebab-case and removes any emoji characters
     * @param str The string to convert
     * @returns The kebab-cased string without emojis
     */
    private kebabCaseWithoutEmojis(str: string): string {
        // Remove emojis using a regex that matches emoji unicode ranges
        const withoutEmojis = str.replace(
            /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
            ""
        );

        // Convert to kebab case: lowercase, replace spaces and special chars with hyphens
        return withoutEmojis
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "") // Remove special characters except hyphens
            .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
            .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
            .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
    }
}
