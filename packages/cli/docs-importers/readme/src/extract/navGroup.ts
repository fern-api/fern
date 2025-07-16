import { scrapedNavigationGroup } from "../types/scrapedNavigation"

export function getFirstTabFromNavigationGroup({ navItem }: { navItem: scrapedNavigationGroup }): string | undefined {
    const findFirstPage = (item: scrapedNavigationGroup): string | undefined => {
        for (const page of item.pages) {
            if (page.type === "page") {
                return page.slug
            } else {
                const firstPage = findFirstPage(page)
                if (firstPage != null) {
                    return firstPage
                }
            }
        }
        return undefined
    }

    const firstPage = findFirstPage(navItem)
    if (firstPage == null) {
        return undefined
    }
    const segments = firstPage.split("/")
    return segments[0]
}
