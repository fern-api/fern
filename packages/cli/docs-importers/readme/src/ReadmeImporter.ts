import type { Root as HastRoot } from "hast";
import { join } from "path";
import traverse from "traverse";

import { docsYml } from "@fern-api/configuration";
import { DocsImporter, FernDocsBuilder, FernDocsNavigationBuilder } from "@fern-api/docs-importer-commons";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { assertIsReadme } from "./assertIsReadme";
import { defaultColors } from "./constants";
import { convertNavigationItem } from "./converters/convertNavigationItem";
import { parsePageGroup } from "./parsers/parsePageGroup";
import { retrieveRootNavElement } from "./parsers/parseRootNav";
import { parseSidebar } from "./parsers/parseSidebar";
import { parseTabLinks } from "./parsers/parseTabs";
import { ScrapeResult } from "./types/scrapeResults";
import { scrapedNavigation, scrapedNavigationGroup } from "./types/scrapedNavigation";
import type { scrapedTab } from "./types/scrapedTab";
import { TabInfo } from "./types/tabInfo";
import { downloadColors } from "./utils/colors";
import { downloadFavicon } from "./utils/favicon";
import { downloadLogos } from "./utils/files/logo";
import { getTabForNavigationItem } from "./utils/getNavigationTab";
import { htmlToHast } from "./utils/htmlToHast";
import { iterateOverNavItems } from "./utils/iterate";
import { fetchPageHtml, startPuppeteer } from "./utils/network";
import { GROUP_NAMES, iterateThroughReservedNames } from "./utils/reservedNames";
import { normalizePath, removeLeadingSlash, removeTrailingSlash } from "./utils/strings";
import { downloadTitle, getTitleFromLink } from "./utils/title";

export declare namespace ReadmeImporter {
    interface Args {
        readmeUrl: string;
    }
}

export class ReadmeImporter extends DocsImporter<ReadmeImporter.Args> {
    private documentationTab: TabInfo | undefined = undefined;
    private tabUrlToInfo: Record<string, TabInfo> = {};

    public async import({ args, builder }: { args: ReadmeImporter.Args; builder: FernDocsBuilder }): Promise<void> {
        const urlObj = new URL(args.readmeUrl);
        const html = await fetchPageHtml({ url: urlObj });
        const absolutePathToOutput: AbsoluteFilePath = AbsoluteFilePath.of(join(process.cwd(), "fern"));
        this.context.logger.info("Successfully fetched HTML from Readme Docs Site");

        const hast = htmlToHast(html);
        const isReadme = assertIsReadme(hast);
        if (!isReadme) {
            this.context.logger.error("The provided URL is not a Readme Docs Site");
            return;
        }
        const result = await this.scrapeAllSiteTabs(html, urlObj);
        const scrapeData = result.data;
        if (!scrapeData) {
            this.context.logger.error("Failed to scrape site tabs");
            return;
        }
        this.context.logger.info("Successfully scraped all site tabs");

        if (scrapeData.logo) {
            builder.setLogo({ logo: scrapeData.logo });
        }

        const relativePathToFavicon = RelativeFilePath.of(scrapeData.favicon.substring(1));
        builder.setFavicon({ favicon: relativePathToFavicon });

        if (scrapeData.colors != null) {
            builder.setColors({ colors: scrapeData.colors });
        }

        for (const tab of scrapeData.tabs ?? []) {
            const tabSlug = removeLeadingSlash(tab.url);
            if (tab.name === "API Reference") {
                continue;
            }
            this.tabUrlToInfo[tabSlug] = {
                name: tab.name,
                url: tabSlug,
                navigationBuilder: builder.getNavigationBuilder({
                    tabId: tabSlug,
                    tabConfig: { slug: tabSlug, displayName: tab.name }
                })
            };
        }

        for (const navItem of scrapeData.navigation) {
            const section = await convertNavigationItem({
                absolutePathToOutput,
                item: navItem,
                builder,
                context: this.context
            });
            const nav = await this.getNavigationBuilder({ navItem, builder });
            if (section != null) {
                nav.addItem({ item: section });
            }
        }
    }

    private async scrapeAllSiteTabs(html: string, url: string | URL): Promise<ScrapeResult> {
        this.context.logger.info(`Initializing site scraper from URL: ${url}`);
        const urlObj = new URL(url);
        const hast = htmlToHast(html);

        const links = parseTabLinks(hast);
        if (!links || !links.length || (links.length === 1 && links[0] && links[0].url === urlObj.pathname)) {
            return this.scrapeSite(html, urlObj, { hast });
        }

        if (!links.find((link) => urlObj.pathname.startsWith(link.url))) {
            links.push({
                name: getTitleFromLink(urlObj.pathname),
                url: urlObj.pathname
            });
        }

        const results = await Promise.all(
            links.map(async (tabEntry) => {
                if (tabEntry.url.startsWith("/reference")) {
                    return { success: false, data: undefined };
                }
                const newUrl = new URL(url);
                newUrl.pathname = tabEntry.url;
                try {
                    const newHtml = await fetchPageHtml({ url: newUrl });
                    return await this.scrapeSite(newHtml, newUrl, { tabs: [tabEntry] });
                } catch (error) {
                    return { success: false, data: undefined };
                }
            })
        );

        const navigation: scrapedNavigation = [];
        const tabs: Array<scrapedTab> = [];
        let colors: docsYml.RawSchemas.ColorsConfiguration = defaultColors;
        let favicon = "/favicon.svg";

        const successes = results.filter((result) => result.success);
        successes.forEach((result) => {
            if (!result.data) {
                return;
            }
            navigation.push(...result.data.navigation);
            if (result.data.tabs) {
                tabs.push(...result.data.tabs);
            }
            if (result.data.favicon !== "/favicon.svg") {
                favicon = result.data.favicon;
            }
            if (result.data.colors !== defaultColors) {
                colors = result.data.colors;
            }
        });

        const failures = results.filter((result) => !result.success);
        failures.forEach((result) => {
            this.context.logger.info(`Failed to scrape tab: ${result.message}`);
        });

        const browser = await startPuppeteer();
        const logo = await downloadLogos(urlObj, browser);
        const name = await downloadTitle(hast);
        if (browser) {
            await browser.close();
        }

        return {
            success: true,
            data: {
                name,
                logo,
                navigation,
                tabs,
                favicon,
                colors
            }
        };
    }

    private async scrapeSite(
        html: string,
        url: string | URL,
        opts: { hast?: HastRoot; tabs?: Array<scrapedTab> } = {}
    ): Promise<ScrapeResult> {
        this.context.logger.info(`Scraping site with URL: ${url}`);
        let siteHast = opts.hast;
        if (!siteHast) {
            siteHast = htmlToHast(html);
        }

        const urlObj = new URL(url);
        const origin = urlObj.origin;

        const sidebar = retrieveRootNavElement(siteHast);
        if (!sidebar) {
            return { success: false, message: `${url.toString()}: Failed to find sidebar element` };
        }
        const navItems = parseSidebar(sidebar);
        if (origin === "") {
            return { success: false, message: `invalid URL provided to scrape site: ${url}` };
        }

        const flatNavItems = navItems.flatMap((section) => section.pages);
        const listOfLinks = iterateOverNavItems(flatNavItems, origin);
        if (listOfLinks.length === 0) {
            return { success: false, message: `no navigation links were able to be found: ${url}` };
        }

        const externalLinks = listOfLinks.filter((url: URL) => url.origin !== origin);
        const internalLinks = listOfLinks.filter(
            (url: URL) => url.origin === origin && removeTrailingSlash(url.toString()) !== origin
        );
        const rootLinks = listOfLinks.filter(
            (url: URL) => url.origin === origin && removeTrailingSlash(url.toString()) === origin
        );

        const allPathnames = [
            ...internalLinks.map((url: URL) => url.toString()),
            ...rootLinks.map((url: URL) => url.toString())
        ];

        const rootPaths = rootLinks.map(() => {
            const name = iterateThroughReservedNames(GROUP_NAMES, allPathnames);
            allPathnames.push(name);
            return name;
        });

        try {
            const externalResults = await parsePageGroup(this.context, externalLinks, { externalLinks: true });
            const internalResults = await parsePageGroup(this.context, internalLinks);
            const rootResults = await parsePageGroup(this.context, rootLinks, { externalLinks: false, rootPaths });

            const externalLinkReplaceMap = new Map(
                externalResults.filter((r) => r.success).map((r) => r.data as [string, string])
            );
            const rootPathReplaceMap = new Map(
                rootResults.filter((r) => r.success).map((r) => r.data as [string, string])
            );

            const replaceLinks = (value: any, map: Map<string, string>) => {
                if (typeof value === "string") {
                    return map.get(value) ?? value;
                }
                if (Array.isArray(value)) {
                    return value.map((item) => map.get(item) ?? item);
                }
                return value;
            };

            traverse(navItems).forEach(function (value) {
                if (
                    externalLinkReplaceMap.has(value) ||
                    (Array.isArray(value) && value.some((item) => externalLinkReplaceMap.has(item)))
                ) {
                    this.update(replaceLinks(value, externalLinkReplaceMap));
                } else if (
                    rootPathReplaceMap.has(value) ||
                    (Array.isArray(value) && value.some((item) => rootPathReplaceMap.has(item)))
                ) {
                    this.update(replaceLinks(value, rootPathReplaceMap));
                }
            });

            traverse(navItems).forEach(function (value) {
                if (typeof value === "string") {
                    this.update(value.replace("/overview", ""));
                } else if (Array.isArray(value)) {
                    this.update(value.map((item) => (typeof item === "string" ? item.replace("/overview", "") : item)));
                }
            });

            const failedPaths = [...externalResults, ...internalResults, ...rootResults]
                .filter((r) => !r.success)
                .map((r) => r.data?.[0])
                .filter(Boolean)
                .map((url) => normalizePath(new URL(url as string).pathname));

            const cleanNavigation = (items: any[]) => {
                traverse(items).forEach(function (value) {
                    if (typeof value === "string" && failedPaths.includes(value)) {
                        this.remove();
                    } else if (Array.isArray(value)) {
                        this.update(value.filter((item) => !(typeof item === "string" && failedPaths.includes(item))));
                    }

                    if (typeof value === "string" && /^https?:\/\//.test(value)) {
                        this.remove();
                    } else if (Array.isArray(value)) {
                        this.update(value.filter((item) => !(typeof item === "string" && /^https?:\/\//.test(item))));
                    }
                });

                // let hasEmptyGroups = true;
                // while (hasEmptyGroups) {
                //     hasEmptyGroups = false;
                //     traverse(items).forEach(function(value) {
                //         if (Array.isArray(value) && value.filter(Boolean).length === 0) {
                //             hasEmptyGroups = true;
                //             this.parent ? this.parent.remove() : this.remove();
                //         }
                //     });
                // }
            };

            cleanNavigation(navItems);

            const browser = await startPuppeteer();
            const favicon = await downloadFavicon(siteHast);
            const colors = await downloadColors(siteHast);
            const logo = await downloadLogos(url, browser);
            const name = await downloadTitle(siteHast);

            return {
                success: true,
                data: {
                    name,
                    logo,
                    colors,
                    favicon,
                    navigation: navItems as scrapedNavigation,
                    tabs: opts.tabs || []
                }
            };
        } catch (error) {
            if (error instanceof Error) {
                return { success: false, message: error.message };
            }
            return {
                success: false,
                message: "An unknown error occurred when scraping this site. Please try again."
            };
        }
    }

    private async getNavigationBuilder({
        navItem,
        builder
    }: {
        navItem: scrapedNavigationGroup;
        builder: FernDocsBuilder;
    }): Promise<FernDocsNavigationBuilder> {
        if (Object.keys(this.tabUrlToInfo).length > 0) {
            const tabUrl = getTabForNavigationItem({ navItem });
            if (tabUrl === "reference") {
                return builder.getNavigationBuilder();
            }
            if (tabUrl == null) {
                return this.context.failAndThrow(`Failed to assign navigation item to a tab group: ${navItem.group}`);
            }
            const tab = this.tabUrlToInfo[tabUrl] ?? this.getDefaultDocumentationTab(builder);
            return tab.navigationBuilder;
        }
        return builder.getNavigationBuilder();
    }

    private getDefaultDocumentationTab(builder: FernDocsBuilder): TabInfo {
        if (this.documentationTab == null) {
            this.documentationTab = {
                name: "Documentation",
                url: "documentation",
                navigationBuilder: builder.getNavigationBuilder({
                    tabId: "documentation",
                    tabConfig: { displayName: "Documentation", slug: "documentation" }
                })
            };
        }
        return this.documentationTab;
    }
}
