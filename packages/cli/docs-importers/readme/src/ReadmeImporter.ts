import type { Root as HastRoot } from "hast";
import { join } from "path";
import traverse from "traverse";

import { docsYml } from "@fern-api/configuration";
import { DEFAULT_LAYOUT, DocsImporter, FernDocsBuilder, FernDocsNavigationBuilder, TabInfo } from "@fern-api/docs-importer-commons";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { isReadmeDeployment } from "./assert";
import { defaultColors } from "./constants";
import { convertNavigationItem } from "./converters/convertNavigationItem";
import { getFavicon } from "./extract/favicon";
import { getFirstTabFromNavigationGroup } from "./extract/navGroup";
import { getTitle, getTitleFromLink } from "./extract/title";
import { parsePageGroup } from "./parse/parsePageGroup";
import { retrieveRootNavElement } from "./parse/parseRootNav";
import { parseSidebar } from "./parse/parseSidebar";
import { parseTabLinks } from "./parse/parseTabs";
import { ScrapeResult } from "./types/scrapeResults";
import { scrapedNavigation, scrapedNavigationGroup } from "./types/scrapedNavigation";
import type { scrapedTab } from "./types/scrapedTab";
import { getColors } from "./utils/colors";
import { getLogos } from "./utils/files/logo";
import { htmlToHast } from "./utils/hast";
import { iterateOverNavItems } from "./utils/iterate";
import { fetchPageHtml, startPuppeteer } from "./utils/network";
import { GROUP_NAMES, getReservedName } from "./utils/reserved";
import { normalizePath, removeLeadingSlash, removeTrailingSlash } from "./utils/strings";

export declare namespace ReadmeImporter {
    interface Args {
        readmeUrl: string;
        organization: string;
    }
}

export class ReadmeImporter extends DocsImporter<ReadmeImporter.Args> {
    private documentationTab: TabInfo | undefined = undefined;
    private tabUrlToInfo: Record<string, TabInfo> = {};

    public async import({ args, builder }: { args: ReadmeImporter.Args; builder: FernDocsBuilder }): Promise<void> {
        const urlObj = new URL(args.readmeUrl);
        const html = await fetchPageHtml({ url: urlObj });
        const absolutePathToOutput: AbsoluteFilePath = AbsoluteFilePath.of(join(process.cwd(), "fern"));
        this.context.logger.debug("Successfully fetched HTML from Readme Docs Site");

        const hast = htmlToHast(html);
        const isReadme = isReadmeDeployment(hast);
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
        this.context.logger.debug("Successfully scraped all site tabs");

        if (scrapeData.logo) {
            builder.setLogo({ logo: scrapeData.logo });
        }

        const relativePathToFavicon = RelativeFilePath.of(scrapeData.favicon.substring(1));
        builder.setFavicon({ favicon: relativePathToFavicon });

        if (scrapeData.colors != null) {
            builder.setColors({ colors: scrapeData.colors });
        }

        builder.setLayout({ layout: DEFAULT_LAYOUT });

        for (const tab of scrapeData.tabs ?? []) {
            const tabSlug = removeLeadingSlash(tab.url);
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

        const instanceUrl = builder.setInstance({ companyName: args.organization });
        this.context.logger.debug(`Added instance ${instanceUrl} to docs.yml`);
    }

    private async scrapeAllSiteTabs(html: string, url: string | URL): Promise<ScrapeResult> {
        this.context.logger.debug(`Initializing site scraper from URL: ${url}`);
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
            this.context.logger.debug(`Successfully scraped tab: ${result.data?.name}`);
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
        const logo = await getLogos(urlObj, browser);
        const name = await getTitle(hast);
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
        this.context.logger.debug(`Scraping site with URL: ${url}`);
        let siteHast = opts.hast;
        if (!siteHast) {
            siteHast = htmlToHast(html);
        }

        const urlObj = new URL(url);
        const origin = urlObj.origin;
        if (origin === "") {
            return { success: false, message: `Invalid URL: ${url}` };
        }
        const sidebar = retrieveRootNavElement(siteHast);
        if (!sidebar) {
            return { success: false, message: `${url.toString()}: Failed to find sidebar element` };
        }
        const navItems = parseSidebar(sidebar);
        const flatNavItems = navItems.flatMap((section) => section.pages);
        const listOfLinks = iterateOverNavItems(flatNavItems, origin);
        if (listOfLinks.length === 0) {
            return { success: false, message: `No navigation items found for URL: ${url}` };
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
            const name = getReservedName(GROUP_NAMES, allPathnames);
            allPathnames.push(name);
            return name;
        });

        try {
            const extResults = await parsePageGroup(this.context, externalLinks, { externalLinks: true });
            const intResults = await parsePageGroup(this.context, internalLinks);
            const rootResults = await parsePageGroup(this.context, rootLinks, { externalLinks: false, rootPaths });

            const externalLinkReplaceMap = new Map(
                extResults.filter((r) => r.success).map((r) => r.data as [string, string])
            );
            const rootPathReplaceMap = new Map(
                rootResults.filter((r) => r.success).map((r) => r.data as [string, string])
            );

            const replaceLinks = (value: string | string[], map: Map<string, string>) => {
                if (typeof value === "string") {
                    return map.get(value) ?? value;
                }
                if (Array.isArray(value)) {
                    return value.map((item) => map.get(item) ?? item);
                }
                return value;
            };

            for (const section of navItems) {
                traverse(section.pages).forEach(function (value) {
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
            }

            for (const section of navItems) {
                traverse(section.pages).forEach(function (value) {
                    if (typeof value === "string") {
                        this.update(value.replace("/overview", ""));
                    } else if (Array.isArray(value)) {
                        this.update(
                            value.map((item) => (typeof item === "string" ? item.replace("/overview", "") : item))
                        );
                    }
                });
            }

            const failedPaths = [...extResults, ...intResults, ...rootResults]
                .filter((r) => !r.success)
                .map((r) => r.data?.[0])
                .filter(Boolean)
                .map((url) => normalizePath(new URL(url as string).pathname));

            const cleanNavigation = (items: scrapedNavigationGroup[]) => {
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

                let hasEmptyGroups = true;
                while (hasEmptyGroups) {
                    hasEmptyGroups = false;
                    traverse(items).forEach(function (value) {
                        if (Array.isArray(value) && value.filter(Boolean).length === 0) {
                            hasEmptyGroups = true;
                            this.parent ? this.parent.remove() : this.remove();
                        }
                    });
                }
            };
            
            cleanNavigation(navItems);

            const browser = await startPuppeteer();
            const favicon = await getFavicon(siteHast);
            const colors = await getColors(siteHast);
            const logo = await getLogos(url, browser);
            const name = await getTitle(siteHast);

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
            const tabUrl = getFirstTabFromNavigationGroup({ navItem });
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
