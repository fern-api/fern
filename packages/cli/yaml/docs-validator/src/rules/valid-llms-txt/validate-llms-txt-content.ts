import { RuleViolation } from "../../Rule.js";
import { extractMarkdownLinks } from "./extract-markdown-links.js";

export interface PublishedPage {
    pageId: string;
    title: string;
    slugs: string[];
}

export interface LlmsTxtValidationInput {
    /** Raw contents of the custom llms.txt file. */
    content: string;
    /** Human-readable label (relative path) used in violation messages. */
    fileLabel: string;
    /** Rule name attached to each violation. */
    ruleName: string;
    /** Published, non-hidden pages that a complete llms.txt should link to. */
    publishedPages: PublishedPage[];
    /** All navigable slugs (including basePath), used to detect broken links. */
    visitableSlugs: Set<string>;
    /** The site basePath (e.g. `docs`), without leading/trailing slashes. */
    basePath: string | undefined;
    /** Hosts (without scheme) that count as "internal" to this docs site. */
    instanceHosts: string[];
    /** Redirect source paths, normalized to slugs. */
    redirectSources: string[];
}

// The maximum number of missing pages to enumerate in a single warning before
// truncating with an ellipsis, so the message stays readable on large sites.
const MAX_MISSING_PAGES_LISTED = 10;

/**
 * Normalize a link target or page slug to a canonical comparison key:
 * strips the protocol/host, query, and anchor, drops a trailing `.md`/`.mdx`
 * (Fern serves both `/page` and `/page.md`), and removes leading/trailing
 * slashes.
 */
export function normalizeToSlug(target: string): string {
    let pathname = target;
    if (/^https?:\/\//.test(pathname)) {
        try {
            pathname = new URL(pathname).pathname;
        } catch {
            // fall through and treat the raw string as a pathname
        }
    }
    pathname = pathname.split(/[?#]/)[0] ?? "";
    pathname = pathname.replace(/\/+$/, "").replace(/^\/+/, "");
    pathname = pathname.replace(/\.mdx?$/, "");
    return pathname;
}

export function normalizeBasePath(basePath: string | undefined): string | undefined {
    if (basePath == null) {
        return undefined;
    }
    const normalized = basePath.replace(/^\/+/, "").replace(/\/+$/, "");
    return normalized.length > 0 ? normalized : undefined;
}

function stripBasePath(slug: string, basePath: string | undefined): string {
    if (basePath == null) {
        return slug;
    }
    if (slug === basePath) {
        return "";
    }
    if (slug.startsWith(`${basePath}/`)) {
        return slug.slice(basePath.length + 1);
    }
    return slug;
}

/**
 * Build the set of slug forms a target may be compared against, accounting for
 * an optional basePath (authors write both `/about` and `/docs/about`).
 */
function slugVariants(normalized: string, basePath: string | undefined): string[] {
    const variants = new Set<string>([normalized]);
    const stripped = stripBasePath(normalized, basePath);
    variants.add(stripped);
    if (basePath != null && normalized.length > 0 && stripBasePath(normalized, basePath) === normalized) {
        // target was written without the basePath — also try with it prepended
        variants.add(`${basePath}/${normalized}`);
    }
    return [...variants];
}

/**
 * Validate a custom `llms.txt` against the resolved navigation, returning
 * warnings for links that point to non-existent pages and for published pages
 * that the file fails to link.
 */
export function validateLlmsTxtContent(input: LlmsTxtValidationInput): RuleViolation[] {
    const { content, fileLabel, ruleName, publishedPages, visitableSlugs, instanceHosts, redirectSources } = input;
    const basePath = normalizeBasePath(input.basePath);
    const violations: RuleViolation[] = [];

    const redirectSourceSet = new Set(redirectSources.map((s) => normalizeToSlug(s)));
    const referencedSlugs = new Set<string>();

    for (const link of extractMarkdownLinks(content)) {
        if (link.url.startsWith("#") || link.url.startsWith("mailto:")) {
            continue;
        }

        // Skip external links that don't point at this docs site.
        if (/^https?:\/\//.test(link.url)) {
            let linkHost: string;
            try {
                linkHost = new URL(link.url).host;
            } catch {
                continue;
            }
            if (!instanceHosts.includes(linkHost)) {
                continue;
            }
        }

        const normalized = normalizeToSlug(link.url);
        const variants = slugVariants(normalized, basePath);
        variants.forEach((variant) => referencedSlugs.add(variant));

        const exists = variants.some((variant) => visitableSlugs.has(variant) || redirectSourceSet.has(variant));
        if (!exists) {
            violations.push({
                name: ruleName,
                severity: "warning",
                message: `${fileLabel}: link to "${link.url}" points to a page that does not exist in the docs navigation.`
            });
        }
    }

    const missingPages = publishedPages.filter(
        (page) =>
            !page.slugs.some((slug) =>
                slugVariants(normalizeToSlug(slug), basePath).some((v) => referencedSlugs.has(v))
            )
    );

    if (missingPages.length > 0) {
        const listed = missingPages
            .slice(0, MAX_MISSING_PAGES_LISTED)
            .map((page) => `"${page.title}" (/${page.slugs[0] ?? ""})`)
            .join(", ");
        const suffix =
            missingPages.length > MAX_MISSING_PAGES_LISTED
                ? `, and ${missingPages.length - MAX_MISSING_PAGES_LISTED} more`
                : "";
        violations.push({
            name: ruleName,
            severity: "warning",
            message: `${fileLabel}: ${missingPages.length} of ${publishedPages.length} published pages are not linked (they may have drifted as pages moved): ${listed}${suffix}.`
        });
    }

    return violations;
}
