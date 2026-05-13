import { existsSync } from "fs";
import path from "path";

import type { BrokenLink, LinkCheckResult } from "./LinkCheckClient.js";

/**
 * A resolved source reference pointing to a local file path,
 * or falling back to a URL slug for auto-generated pages.
 */
export interface ResolvedReference {
    /** URL slug (e.g. "/api-reference/users") for auto-generated pages, or relative file path */
    slug: string;
    /** Relative file path when resolved locally */
    filePath?: string;
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
 * resolves them to local file paths. Only includes files that exist locally — auto-generated
 * API reference pages are filtered out. Falls back to source page URLs when no local files
 * are found.
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
            const references: ResolvedReference[] = [];
            for (let i = 0; i < link.sourcePageIds.length; i++) {
                const pageId = link.sourcePageIds[i];
                if (pageId == null) {
                    continue;
                }
                const resolved = this.resolvePageId(pageId, link.sourcePages[i]);
                if (resolved != null) {
                    references.push(resolved);
                }
            }
            if (references.length > 0) {
                return { ...link, references };
            }
        }

        return {
            ...link,
            references: link.sourcePages.map((url) => ({ slug: url }))
        };
    }

    private resolvePageId(pageId: string, sourcePageUrl: string | undefined): ResolvedReference | undefined {
        if (this.docsConfigDir != null) {
            const filePath = path.join(this.docsConfigDir, pageId);
            if (existsSync(filePath)) {
                const relativePath = path.relative(process.cwd(), filePath);
                return {
                    slug: relativePath,
                    filePath: relativePath
                };
            }
        }

        if (!this.isUserAuthoredPage(pageId)) {
            return this.fallbackToSlug(sourcePageUrl);
        }

        return { slug: pageId };
    }

    /**
     * For auto-generated pages (API reference), fall back to showing the URL
     * slug derived from the source page URL.
     */
    private fallbackToSlug(sourcePageUrl: string | undefined): ResolvedReference | undefined {
        if (sourcePageUrl == null) {
            return undefined;
        }
        try {
            const parsed = new URL(sourcePageUrl);
            return { slug: parsed.pathname };
        } catch {
            return { slug: sourcePageUrl };
        }
    }

    /**
     * Auto-generated API reference pages (e.g. "tag-plant.md") have no directory
     * component and don't correspond to user-authored files.
     */
    private isUserAuthoredPage(pageId: string): boolean {
        return pageId.includes("/");
    }
}
