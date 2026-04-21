import { match } from "path-to-regexp";

export interface MarkdownEntry {
    pageId: string;
    slug: string;
    lastUpdated: string;
}

/**
 * FDR's slug table may contain multiple (pageId, slug) rows per pageId —
 * either as the tail of a past slug change, or deliberately as part of future
 * docs-site versioning. The missing-redirects check only needs the most recent
 * row per pageId; older rows describe an older published state and would
 * otherwise produce false positives.
 */
export function keepLatestEntryPerPageId(entries: MarkdownEntry[]): MarkdownEntry[] {
    const latestByPageId = new Map<string, MarkdownEntry>();
    for (const entry of entries) {
        const existing = latestByPageId.get(entry.pageId);
        if (existing == null || Date.parse(entry.lastUpdated) >= Date.parse(existing.lastUpdated)) {
            latestByPageId.set(entry.pageId, entry);
        }
    }
    return Array.from(latestByPageId.values());
}

export interface RemovedSlug {
    pageId: string;
    oldSlug: string;
    newSlug: string | undefined;
}

export interface Redirect {
    source: string;
    destination: string;
}

export interface MissingRedirectViolation {
    severity: "warning";
    message: string;
}

function removeTrailingSlash(pathname: string): string {
    return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function withBasepath(source: string, basePath: string | undefined): string {
    if (basePath == null) {
        return source;
    }
    return source.startsWith(basePath)
        ? source
        : `${removeTrailingSlash(basePath)}${source.startsWith("/") ? "" : "/"}${source}`;
}

function matchPath(pattern: string, path: string): boolean {
    if (pattern === path) {
        return true;
    }
    try {
        return match(pattern)(path) !== false;
    } catch {
        return false;
    }
}

function isSlugCoveredByRedirect(oldSlug: string, redirects: Redirect[], basePath: string | undefined): boolean {
    const oldPath = oldSlug.startsWith("/") ? oldSlug : `/${oldSlug}`;
    return redirects.some((redirect) => {
        const source = removeTrailingSlash(withBasepath(redirect.source, basePath));
        return matchPath(source, oldPath);
    });
}

/**
 * Compares published slug table entries against the local pageId->slug map
 * and returns entries whose slug disappeared or changed.
 *
 * Skips entries whose old slug is still actively served by another page in
 * the local config. This prevents false positives for changelog entries
 * (which share their parent changelog page's slug) and other cases where
 * the URL remains alive despite a specific pageId being removed or moved.
 */
export function findRemovedSlugs(
    publishedEntries: MarkdownEntry[],
    localPageIdToSlug: Map<string, string>
): RemovedSlug[] {
    const activeSlugs = new Set(localPageIdToSlug.values());
    const removed: RemovedSlug[] = [];
    for (const publishedEntry of publishedEntries) {
        const newSlug = localPageIdToSlug.get(publishedEntry.pageId);
        if (newSlug === undefined) {
            if (activeSlugs.has(publishedEntry.slug)) {
                continue;
            }
            removed.push({ pageId: publishedEntry.pageId, oldSlug: publishedEntry.slug, newSlug: undefined });
        } else if (newSlug !== publishedEntry.slug) {
            if (activeSlugs.has(publishedEntry.slug)) {
                continue;
            }
            removed.push({ pageId: publishedEntry.pageId, oldSlug: publishedEntry.slug, newSlug });
        }
    }
    return removed;
}

/**
 * Produces rule violations for removed/moved slugs that are not covered
 * by any configured redirect.
 */
export function checkMissingRedirects(
    removedSlugs: RemovedSlug[],
    redirects: Redirect[],
    basePath: string | undefined
): MissingRedirectViolation[] {
    const violations: MissingRedirectViolation[] = [];
    for (const removed of removedSlugs) {
        if (isSlugCoveredByRedirect(removed.oldSlug, redirects, basePath)) {
            continue;
        }

        const oldPath = removed.oldSlug.startsWith("/") ? removed.oldSlug : `/${removed.oldSlug}`;

        if (removed.newSlug != null) {
            const newPath = removed.newSlug.startsWith("/") ? removed.newSlug : `/${removed.newSlug}`;
            violations.push({
                severity: "warning",
                message:
                    `Page "${removed.pageId}" was moved from "${oldPath}" to "${newPath}". ` +
                    `The old URL will return 404 without a redirect. ` +
                    `Add to docs.yml: redirects: [{source: "${oldPath}", destination: "${newPath}"}]`
            });
        } else {
            violations.push({
                severity: "warning",
                message:
                    `Page "${removed.pageId}" was removed. ` +
                    `The previously published URL "${oldPath}" will return 404 without a redirect. ` +
                    `Consider adding a redirect in docs.yml to preserve existing links.`
            });
        }
    }
    return violations;
}
