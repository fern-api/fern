import { scrapedNavigationGroup } from "../types/scrapedNavigation";

export declare namespace getTabForNavigationItem {
    interface Args {
        navItem: scrapedNavigationGroup;
    }
}

export function getTabForNavigationItem({ navItem }: getTabForNavigationItem.Args): string | undefined {
    const firstPage = getFirstPage({ item: navItem });
    if (firstPage == null) {
        return undefined;
    }
    return getFirstUrlSegment({ path: firstPage });
}

function getFirstPage({ item }: { item: scrapedNavigationGroup }): string | undefined {
    for (const page of item.pages) {
        if (typeof page === "string") {
            return page;
        } else {
            const firstPage = getFirstPage({ item: page });
            if (firstPage != null) {
                return firstPage;
            }
        }
    }
    return undefined;
}

/**
 * @returns the first segment of the url path for the page. So if the path is `/reference/guides/abc`,
 * then this function will return `reference`
 */
function getFirstUrlSegment({ path }: { path: string }): string | undefined {
    const segments = path.split("/");
    return segments[0];
}
