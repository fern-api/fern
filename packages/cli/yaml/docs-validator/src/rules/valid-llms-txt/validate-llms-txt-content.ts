import { RuleViolation } from "../../Rule.js";
import { collectPathnamesToCheck } from "../valid-markdown-link/collect-pathnames.js";
import {
    removeLeadingSlash,
    removeTrailingSlash,
    stripAnchorsAndSearchParams
} from "../valid-markdown-link/url-utils.js";
import { withBasePathPrepended } from "../valid-markdown-link/with-base-path-prepended.js";

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
    /** Instance/custom-domain URLs, used to tell off-site links from internal ones. */
    instanceUrls: string[];
    /** Published, non-hidden pages that a complete llms.txt should link to. */
    publishedPages: PublishedPage[];
    /** The site basePath (e.g. `docs`), without leading/trailing slashes. */
    basePath: string | undefined;
    /**
     * Resolves whether a link target exists in the docs navigation. The rule wires
     * this to `checkIfPathnameExists` — the same resolver used by
     * `valid-markdown-links` — so redirects, basePath handling, and special doc
     * pages are honored without re-implementing that logic here.
     */
    pathnameExists: (pathname: string) => Promise<boolean>;
}

// The maximum number of missing pages to enumerate in a single warning before
// truncating with an ellipsis, so the message stays readable on large sites.
const MAX_MISSING_PAGES_LISTED = 10;

/**
 * Reduce a link target or page slug to a canonical comparison key: strip
 * anchors/query, a trailing `.md`/`.mdx` (Fern serves both `/page` and
 * `/page.md`), and leading/trailing slashes.
 */
function toSlug(pathname: string): string {
    const withoutExt = stripAnchorsAndSearchParams(pathname).replace(/\.mdx?$/, "");
    return removeLeadingSlash(removeTrailingSlash(withoutExt));
}

/**
 * All slug forms a link/page may be compared under, accounting for the site
 * basePath (authors write both `/about` and `/docs/about`).
 */
function coverageKeys(slug: string, basePath: string | undefined): string[] {
    const keys = new Set<string>([slug]);
    const prefixed = withBasePathPrepended(`/${slug}`, basePath);
    if (prefixed != null) {
        keys.add(removeLeadingSlash(prefixed));
    }
    if (basePath != null) {
        if (slug === basePath) {
            keys.add("");
        } else if (slug.startsWith(`${basePath}/`)) {
            keys.add(slug.slice(basePath.length + 1));
        }
    }
    return [...keys];
}

/**
 * Validate a custom `llms.txt` against the resolved navigation, returning
 * warnings for links that point to non-existent pages and for published pages
 * that the file fails to link.
 */
export async function validateLlmsTxtContent(input: LlmsTxtValidationInput): Promise<RuleViolation[]> {
    const { content, fileLabel, ruleName, instanceUrls, publishedPages, basePath, pathnameExists } = input;
    const violations: RuleViolation[] = [];

    // Reuse the shared markdown link collector so llms.txt links are parsed the
    // same way page links are: anchors, `mailto:`, and off-site links are
    // dropped, and malformed URLs surface as their own violations.
    const { pathnamesToCheck, violations: extractionViolations } = collectPathnamesToCheck(content, { instanceUrls });
    violations.push(...extractionViolations.map((violation) => ({ ...violation, name: ruleName })));

    const referencedKeys = new Set<string>();
    const checkedSlugs = new Set<string>();
    for (const { pathname } of pathnamesToCheck) {
        const slug = toSlug(pathname);
        // De-dupe repeated targets so each is checked and reported at most once.
        if (checkedSlugs.has(slug)) {
            continue;
        }
        checkedSlugs.add(slug);

        if (!(await pathnameExists(`/${slug}`))) {
            violations.push({
                name: ruleName,
                severity: "warning",
                message: `${fileLabel}: link to "${pathname}" points to a page that does not exist in the docs navigation.`
            });
            continue;
        }

        // Only validated links count toward coverage, so a broken link can't
        // accidentally mark a real page as covered.
        coverageKeys(slug, basePath).forEach((key) => referencedKeys.add(key));
    }

    const missingPages = publishedPages.filter(
        (page) =>
            !page.slugs.some((slug) => coverageKeys(toSlug(slug), basePath).some((key) => referencedKeys.has(key)))
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
