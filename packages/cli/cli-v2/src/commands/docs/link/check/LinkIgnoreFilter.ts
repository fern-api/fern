import type { ResolvedBrokenLink, ResolvedLinkCheckResult } from "./SourceResolver.js";

/**
 * Drops broken and blocked links whose URL matches an `--ignore` pattern.
 *
 * A pattern matches the full URL. `*` matches any run of characters (including `/`),
 * so `https://mcp.example.com/*` ignores every link on that host.
 */
export class LinkIgnoreFilter {
    private readonly patterns: RegExp[];

    constructor(patterns: string[]) {
        this.patterns = patterns.filter((pattern) => pattern.length > 0).map((pattern) => this.toRegExp(pattern));
    }

    public isIgnored(url: string): boolean {
        return this.patterns.some((pattern) => pattern.test(url));
    }

    public apply(result: ResolvedLinkCheckResult): ResolvedLinkCheckResult {
        const brokenLinks = this.keep(result.brokenLinks);
        const blockedLinks = this.keep(result.blockedLinks);
        const ignoredCount =
            result.brokenLinks.length - brokenLinks.length + (result.blockedLinks.length - blockedLinks.length);
        return { ...result, brokenLinks, blockedLinks, ignoredLinks: (result.ignoredLinks ?? 0) + ignoredCount };
    }

    private keep(links: ResolvedBrokenLink[]): ResolvedBrokenLink[] {
        return links.filter((link) => !this.isIgnored(link.url));
    }

    private toRegExp(pattern: string): RegExp {
        const source = pattern
            .split("*")
            .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
            .join(".*");
        return new RegExp(`^${source}$`);
    }
}
