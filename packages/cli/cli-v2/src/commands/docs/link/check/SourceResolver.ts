import { readFileSync } from "fs";
import path from "path";

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
 * Resolves source page URLs/pageIds from the link checker to display references.
 *
 * When the server provides sourcePageIds (relative file paths like "pages/welcome.mdx"),
 * resolves them to local file paths with line:column by searching for the broken URL
 * in the file content. Falls back to source page URLs when pageIds are not available.
 */
export class SourceResolver {
    private readonly docsConfigDir: string | undefined;

    constructor(docsConfigDir?: string) {
        this.docsConfigDir = docsConfigDir;
    }

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
        if (link.sourcePageIds != null && link.sourcePageIds.length > 0) {
            return {
                ...link,
                references: link.sourcePageIds.map((pageId) => this.resolvePageId(pageId, link.url))
            };
        }

        return {
            ...link,
            references: link.sourcePages.map((url) => ({ display: url }))
        };
    }

    private resolvePageId(pageId: string, brokenUrl: string): ResolvedReference {
        if (this.docsConfigDir != null) {
            const filePath = path.join(this.docsConfigDir, pageId);
            const relativeDisplay = path.relative(process.cwd(), filePath);
            const location = this.findLinkInFile(filePath, brokenUrl);
            if (location != null) {
                return {
                    display: `${relativeDisplay}:${location.line}:${location.column}`,
                    filePath: relativeDisplay,
                    line: location.line,
                    column: location.column
                };
            }
            return {
                display: relativeDisplay,
                filePath: relativeDisplay
            };
        }

        return { display: pageId };
    }

    private findLinkInFile(filePath: string, brokenUrl: string): { line: number; column: number } | undefined {
        let content: string;
        try {
            content = readFileSync(filePath, "utf-8");
        } catch {
            return undefined;
        }

        const lines = content.split("\n");

        // Try full URL first
        const fullUrlResult = this.searchLines(lines, brokenUrl);
        if (fullUrlResult != null) {
            return fullUrlResult;
        }

        // Try just the pathname
        try {
            const parsed = new URL(brokenUrl);
            const pathname = parsed.pathname + (parsed.search || "") + (parsed.hash || "");
            return this.searchLines(lines, pathname);
        } catch {
            return undefined;
        }
    }

    private searchLines(lines: string[], needle: string): { line: number; column: number } | undefined {
        for (let i = 0; i < lines.length; i++) {
            const col = lines[i]?.indexOf(needle);
            if (col != null && col >= 0) {
                return { line: i + 1, column: col + 1 };
            }
        }
        return undefined;
    }
}
