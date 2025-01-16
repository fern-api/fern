import type { Root as HastRoot } from "hast";
import { join } from "path";
import traverse from "traverse";

import { docsYml } from "@fern-api/configuration";
import { DocsImporter, FernDocsBuilder, FernDocsNavigationBuilder } from "@fern-api/docs-importer-commons";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { assertIsReadme } from "./assertIsReadme";
import { defaultColors } from "./constants";
import { convertNavigationItem } from "./converters/convertNavigationItem";
import { parseNavItems } from "./parsers/parseNavItems";
import { parsePageGroup } from "./parsers/parsePageGroup";
import { retrieveRootNavElement } from "./parsers/parseRootNav";
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
import { removeLeadingSlash, removeTrailingSlash } from "./utils/strings";
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
        this.context.logger.info("Successfully scraped site tabs");

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
            this.context.logger.info("Failed to scrape tab" + result.message);
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

        const navItems = parseNavItems(sidebar);

        if (origin === "") {
            return { success: false, message: `invalid URL provided to scrape site: ${url}` };
        }

        const listOfLinks = iterateOverNavItems(navItems, origin);
        if (listOfLinks.length === 0) {
            return { success: false, message: `no navigation links were able to be found: ${url}` };
        }

        const externalLinks = listOfLinks.filter((url) => url.origin !== origin);
        const internalLinks = listOfLinks.filter(
            (url) => url.origin === origin && removeTrailingSlash(url.toString()) !== origin
        );
        const rootLinks = listOfLinks.filter(
            (url) => url.origin === origin && removeTrailingSlash(url.toString()) === origin
        );

        const allPathnames = [...internalLinks.map((url) => url.toString()), ...rootLinks.map((url) => url.toString())];

        const rootPaths = rootLinks.map(() => {
            const name = iterateThroughReservedNames(GROUP_NAMES, allPathnames);
            allPathnames.push(name);
            return name;
        });

        try {
            const externalResults = await parsePageGroup(externalLinks, { externalLinks: true });
            const internalResults = await parsePageGroup(internalLinks);
            const rootResults = await parsePageGroup(rootLinks, { externalLinks: false, rootPaths });

            const externalLinkReplaceMap = new Map<string, string>(
                externalResults.filter((result) => result.success).map((result) => result.data as [string, string])
            );

            const rootPathReplaceMap = new Map<string, string>(
                rootResults.filter((result) => result.success).map((result) => result.data as [string, string])
            );

            traverse(navItems).forEach(function (value) {
                if (typeof value === "string") {
                    if (externalLinkReplaceMap.has(value)) {
                        this.update(externalLinkReplaceMap.get(value) ?? value);
                    } else if (rootPathReplaceMap.has(value)) {
                        this.update(rootPathReplaceMap.get(value) ?? value);
                    }
                } else if (Array.isArray(value)) {
                    if (value.find((item) => externalLinkReplaceMap.has(item))) {
                        this.update(value.map((item) => externalLinkReplaceMap.get(item) ?? item));
                    } else if (value.find((item) => rootPathReplaceMap.has(item))) {
                        this.update(value.map((item) => rootPathReplaceMap.get(item) ?? item));
                    }
                }
            });

            traverse(navItems).forEach(function (value) {
                if (typeof value === "string") {
                    this.update(value.replace("/overview", ""));
                } else if (Array.isArray(value)) {
                    this.update(value.map((item) => (typeof item === "string" ? item.replace("/overview", "") : item)));
                }
            });

            navItems.forEach((navItem, index) => {
                if (typeof navItem !== "string") {
                    return;
                }
                const lastItemInPath = navItem.split("/").pop() || navItem;
                const name = lastItemInPath
                    .split(/[-_]/)
                    .map((str) => (str[0] ? `${str[0].toUpperCase()}${str.substring(1)}` : str))
                    .join(" ");

                navItems[index] = {
                    group: name,
                    pages: [navItem]
                };
            });

            const allErrors = [
                ...externalResults.filter((result) => !result.success),
                ...internalResults.filter((result) => !result.success),
                ...rootResults.filter((result) => !result.success)
            ];

            const allErroredPaths = allErrors
                .map((result) => {
                    if (result.data) {
                        const url = new URL(result.data[0]);
                        const pathname = url.pathname;
                        const normalizedPathname = removeLeadingSlash(removeTrailingSlash(pathname));
                        return normalizedPathname;
                    } else {
                        return "";
                    }
                })
                .filter(Boolean);

            traverse(navItems).forEach(function (value) {
                if (typeof value === "string" && allErroredPaths.includes(value)) {
                    this.remove();
                } else if (Array.isArray(value)) {
                    this.update(
                        value
                            .filter((item) =>
                                typeof item === "string" && allErroredPaths.includes(item) ? undefined : item
                            )
                            .filter(Boolean)
                    );
                }
            });

            let shouldContinue = true;
            while (shouldContinue) {
                shouldContinue = false;
                traverse(navItems).forEach(function (value) {
                    if (Array.isArray(value) && value.filter(Boolean).length === 0) {
                        shouldContinue = true;
                        if (this.parent) {
                            this.parent.remove();
                        } else {
                            this.remove();
                        }
                    }
                });
            }

            traverse(navItems).forEach(function (value) {
                if (typeof value === "string" && (value.startsWith("https://") || value.startsWith("http://"))) {
                    this.remove();
                } else if (
                    Array.isArray(value) &&
                    value.find(
                        (val) => typeof val === "string" && (val.startsWith("https://") || val.startsWith("http://"))
                    )
                ) {
                    this.update(
                        value.filter(
                            (val) =>
                                !(typeof val === "string" && (val.startsWith("https://") || val.startsWith("http://")))
                        )
                    );
                }
            });

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
