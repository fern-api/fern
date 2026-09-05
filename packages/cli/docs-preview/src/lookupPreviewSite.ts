/** FDR caps `limit` on the docs-url listing at 1000. */
export const PREVIEW_PAGE_SIZE = 1000;
/** Bounds the scan so a server that keeps returning full pages can't loop forever. */
export const MAX_PREVIEW_PAGES = 50;

/** The shape of a docs-url entry from FDR's `listAllDocsUrls` that a lookup needs. */
export interface PreviewDocsUrl {
    domain: string;
    basePath?: string;
}

export type ListPreviewUrls<T extends PreviewDocsUrl> = (args: {
    page: number;
    limit: number;
    preview: true;
}) => Promise<{ urls: readonly T[] }>;

/**
 * The URL that identifies a docs site to FDR: the hostname plus its basepath, if
 * it has one. Deletion is keyed on this full URL, not on the hostname alone.
 */
export function toPreviewSiteUrl(item: PreviewDocsUrl): string {
    return item.basePath != null ? `${item.domain}${item.basePath}` : item.domain;
}

export type PreviewSiteLookup =
    | { type: "found"; url: string }
    | { type: "notFound" }
    /** The host serves several sites, each under its own basepath. */
    | { type: "ambiguous"; urls: string[] }
    | { type: "scanLimitReached"; pagesScanned: number };

/**
 * Resolves the URL FDR stores for the preview served from `hostname`. A preview
 * published under a basepath is keyed on hostname + basepath, so the deployment
 * has to be looked up rather than assumed to live at the root.
 */
export async function lookupPreviewSiteUrl<T extends PreviewDocsUrl>({
    listPreviewUrls,
    hostname
}: {
    listPreviewUrls: ListPreviewUrls<T>;
    hostname: string;
}): Promise<PreviewSiteLookup> {
    const normalizedHostname = hostname.toLowerCase();
    const matches: T[] = [];
    let scannedEveryPage = false;
    let pagesScanned = 0;

    for (let page = 1; page <= MAX_PREVIEW_PAGES; page++) {
        const { urls } = await listPreviewUrls({ page, limit: PREVIEW_PAGE_SIZE, preview: true });
        pagesScanned = page;
        matches.push(...urls.filter((item) => item.domain.toLowerCase() === normalizedHostname));
        if (urls.length < PREVIEW_PAGE_SIZE) {
            scannedEveryPage = true;
            break;
        }
    }

    const [match, ...rest] = matches;
    if (match == null) {
        return scannedEveryPage ? { type: "notFound" } : { type: "scanLimitReached", pagesScanned };
    }
    if (rest.length > 0) {
        return { type: "ambiguous", urls: matches.map(toPreviewSiteUrl) };
    }
    return { type: "found", url: toPreviewSiteUrl(match) };
}
