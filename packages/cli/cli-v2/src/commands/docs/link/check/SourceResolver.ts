import type { BrokenLink, LinkCheckResult } from "./LinkCheckClient.js";

/**
 * A resolved source reference pointing to a local file with line:column,
 * or falling back to a source page URL.
 */
export interface ResolvedReference {
    /** Display string: "file:line:column" or source page URL */
    display: string;
    /** Relative file path, if resolved locally */
    filePath?: string;
    /** 1-based line number */
    line?: number;
    /** 1-based column number */
    column?: number;
}

/**
 * A broken link with its source references resolved to local file locations.
 */
export interface ResolvedBrokenLink {
    url: string;
    statusCode: number | null;
    isInternal: boolean;
    references: ResolvedReference[];
    error?: string;
}

export interface ResolvedLinkCheckResult {
    totalPages: number;
    totalLinks: number;
    workingLinks: number;
    brokenLinks: ResolvedBrokenLink[];
    blockedLinks: ResolvedBrokenLink[];
    durationMs: number;
}

/**
 * Resolves source page URLs from the link checker to display references.
 *
 * Currently passes through source page URLs as-is. In the future, the server
 * will provide pageId (relative file path) and line:column data directly,
 * which this resolver will use to show local file references.
 */
export class SourceResolver {
    public resolve(result: LinkCheckResult): ResolvedLinkCheckResult {
        return {
            totalPages: result.totalPages,
            totalLinks: result.totalLinks,
            workingLinks: result.workingLinks,
            brokenLinks: result.brokenLinks.map((link) => this.resolveLink(link)),
            blockedLinks: result.blockedLinks.map((link) => this.resolveLink(link)),
            durationMs: result.durationMs
        };
    }

    private resolveLink(link: BrokenLink): ResolvedBrokenLink {
        return {
            ...link,
            references: link.sourcePages.map((url) => ({ display: url }))
        };
    }
}
