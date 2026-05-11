import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

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
 * Resolves source page URLs from the link checker to local file:line:column references.
 *
 * Finds all .mdx/.md files under the fern docs directory and searches them
 * for the broken link's URL or path to determine the exact source location.
 * Falls back to showing source page URLs when run outside a Fern project.
 */
export class SourceResolver {
    /**
     * Resolve all broken/blocked links in the result to local file references.
     *
     * @param result - The raw link check result from the server
     * @param docsAbsolutePath - Absolute path to the docs config directory, if available
     * @returns Resolved result with file:line:column references where possible
     */
    public async resolve(
        result: LinkCheckResult,
        docsAbsolutePath: string | undefined
    ): Promise<ResolvedLinkCheckResult> {
        let fileCache: Map<string, FileContent> | undefined;

        if (docsAbsolutePath != null) {
            // docsAbsolutePath is the path to docs.yml file; walk its parent directory
            const docsDir = path.dirname(docsAbsolutePath);
            fileCache = await this.buildFileCache(docsDir);
        }

        const brokenLinks = await Promise.all(result.brokenLinks.map((link) => this.resolveLink(link, fileCache)));
        const blockedLinks = await Promise.all(result.blockedLinks.map((link) => this.resolveLink(link, fileCache)));

        return {
            totalPages: result.totalPages,
            totalLinks: result.totalLinks,
            workingLinks: result.workingLinks,
            brokenLinks,
            blockedLinks,
            durationMs: result.durationMs
        };
    }

    private async resolveLink(
        link: BrokenLink,
        fileCache: Map<string, FileContent> | undefined
    ): Promise<ResolvedBrokenLink> {
        if (fileCache == null || fileCache.size === 0) {
            return {
                ...link,
                references: link.sourcePages.map((url) => ({ display: url }))
            };
        }

        const references = this.findLinkInFiles(link.url, fileCache);

        if (references.length === 0) {
            return {
                ...link,
                references: link.sourcePages.map((url) => ({ display: url }))
            };
        }

        return { ...link, references };
    }

    private findLinkInFiles(brokenUrl: string, fileCache: Map<string, FileContent>): ResolvedReference[] {
        const references: ResolvedReference[] = [];
        const searchPatterns = this.getSearchPatterns(brokenUrl);

        for (const [relPath, file] of fileCache) {
            for (let lineIdx = 0; lineIdx < file.lines.length; lineIdx++) {
                const line = file.lines[lineIdx];
                if (line == null) {
                    continue;
                }
                const match = this.findLinkMatch(line, searchPatterns);
                if (match != null) {
                    const lineNum = lineIdx + 1;
                    const colNum = match + 1;
                    references.push({
                        display: `${relPath}:${lineNum}:${colNum}`,
                        filePath: relPath,
                        line: lineNum,
                        column: colNum
                    });
                }
            }
        }

        return references;
    }

    /**
     * Search a line for a link pattern, requiring it to appear within markdown link syntax
     * or as a standalone path (not as a substring of a longer path).
     */
    private findLinkMatch(line: string, patterns: string[]): number | undefined {
        for (const pattern of patterns) {
            let startIdx = 0;
            while (startIdx < line.length) {
                const col = line.indexOf(pattern, startIdx);
                if (col === -1) {
                    break;
                }

                // Validate boundaries: char before must be a link-context delimiter
                const charBefore = col > 0 ? line[col - 1] : undefined;
                const validPrefix =
                    charBefore === undefined ||
                    charBefore === "(" ||
                    charBefore === '"' ||
                    charBefore === "'" ||
                    charBefore === " " ||
                    charBefore === "\t" ||
                    charBefore === ">";

                // Char after must not continue the path/word
                const charAfter = line[col + pattern.length];
                const validSuffix =
                    charAfter === undefined ||
                    charAfter === ")" ||
                    charAfter === '"' ||
                    charAfter === "'" ||
                    charAfter === "]" ||
                    charAfter === " " ||
                    charAfter === ">" ||
                    charAfter === "#";

                if (validPrefix && validSuffix) {
                    return col;
                }

                startIdx = col + 1;
            }
        }
        return undefined;
    }

    /**
     * Generate search patterns for a broken URL.
     * Searches for the full URL and the pathname component.
     */
    private getSearchPatterns(url: string): string[] {
        const patterns: string[] = [url];

        try {
            const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
            const pathname = parsed.pathname;
            if (pathname !== "/" && pathname !== url) {
                patterns.push(pathname);
            }
        } catch {
            // not a valid URL, just use the raw string
        }

        return patterns;
    }

    private async buildFileCache(docsDir: string): Promise<Map<string, FileContent>> {
        const cache = new Map<string, FileContent>();
        const cwd = process.cwd();
        const mdxFiles = await this.findMarkdownFiles(docsDir);

        await Promise.all(
            mdxFiles.map(async (absPath) => {
                try {
                    const content = await readFile(absPath, "utf-8");
                    const relPath = path.relative(cwd, absPath);
                    cache.set(relPath, { lines: content.split("\n") });
                } catch {
                    // skip unreadable files
                }
            })
        );

        return cache;
    }

    private async findMarkdownFiles(dir: string): Promise<string[]> {
        const results: string[] = [];
        await this.walkDir(dir, results);
        return results;
    }

    private async walkDir(dir: string, results: string[]): Promise<void> {
        let entries;
        try {
            entries = await readdir(dir);
        } catch {
            // Directory unreadable or does not exist; skip this subtree
            return;
        }

        await Promise.all(
            entries.map(async (entry) => {
                if (entry.startsWith(".") || entry === "node_modules") {
                    return;
                }
                const fullPath = path.join(dir, entry);
                try {
                    const stats = await stat(fullPath);
                    if (stats.isDirectory()) {
                        await this.walkDir(fullPath, results);
                    } else if (entry.endsWith(".mdx") || entry.endsWith(".md")) {
                        results.push(fullPath);
                    }
                } catch {
                    // skip inaccessible entries
                }
            })
        );
    }
}

interface FileContent {
    lines: string[];
}
