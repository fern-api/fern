import { MintNavigationItem } from "../mintlify";

export declare namespace getTabForMintItem {
    interface Args {
        mintItem: MintNavigationItem;
    }
}

export function getTabForMintItem({ mintItem }: getTabForMintItem.Args): string | undefined {
    const firstPage = getFirstPage({ item: mintItem });
    if (firstPage == null) {
        return undefined;
    }
    return getFirstUrlSegment({ path: firstPage });
}

function getFirstPage({ item }: { item: MintNavigationItem }): string | undefined {
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
